import { Prisma, PrismaClient } from "@prisma/client";
import { Context } from "../context";
import express, { Request } from "express";
import { DonateInput, makePaymentInput } from "./donationService";
import { Payment, YooCheckout } from "@a2seven/yoo-checkout";

const prisma = new PrismaClient();
const yooCheckout = new YooCheckout({
  shopId: process.env.YANDEX_CHECKOUT_SHOP_ID as string,
  secretKey: process.env.YANDEX_CHECKOUT_SECRET as string,
});

const app = express();

app.use(express.json());

app.get("/donate", async (req, res) => {
  const { amount, purpose, email, isMonthly } = req.query;
  if (!email) return res.sendStatus(400);

  const input: DonateInput = {
    amount: (amount as unknown) as number,
    purpose: (purpose as unknown) as string,
    email: (email as unknown) as string,
    isMonthly: (isMonthly as unknown) as string,
  };

  try {
    const donationInput = await makePaymentInput(input, {
      prisma,
      yooCheckout,
    });

    const result = await prisma.payment.create({
      data: donationInput,
    });

    res.json(result);
  } catch (err) {
    res.json(err);
  }
});

app.get(`/payment/:id`, async (req, res) => {
  const { id }: { id?: string } = req.params;

  const payment = await prisma.payment.findUnique({
    where: { id: Number(id) },
  });
  res.json(payment);
});

app.post(`/notification`, async (req, res) => {
  console.log("webhook request", req.body, JSON.stringify(req.body));
  const object = req.body.object as Payment;
  console.log(111);

  // look for payment by id
  // if payment exist, update it's status

  const payment = await prisma.payment.findUnique({
    where: { yoomoneyId: object.id },
  });
  console.log("payment from db", payment);

  if (payment !== null) {
    console.log("before update, payment id", payment.id);
    const updatedPayment = await prisma.payment.update({
      where: { id: payment.id },
      data: {
        status: object.status,
        paid: object.paid,
      },
    });
    console.log("update finish, updated payment", updatedPayment);
  }

  res.json({ hey: "all good", initialRequest: req.body });
  // res.json(result)
});

app.post(`/signup`, async (req, res) => {
  const { name, email, acceptTermsAndConditions, posts } = req.body;

  const postData = posts?.map((post: Prisma.PostCreateInput) => {
    return { title: post?.title, content: post?.content };
  });

  const result = await prisma.user.create({
    data: {
      name,
      email,
      acceptTermsAndConditions,
      posts: {
        create: postData,
      },
    },
  });
  res.json(result);
});

app.post(`/post`, async (req, res) => {
  const { title, content, authorEmail } = req.body;
  const result = await prisma.post.create({
    data: {
      title,
      content,
      author: { connect: { email: authorEmail } },
    },
  });
  res.json(result);
});

app.put("/post/:id/views", async (req, res) => {
  const { id } = req.params;

  try {
    const post = await prisma.post.update({
      where: { id: Number(id) },
      data: {
        viewCount: {
          increment: 1,
        },
      },
    });

    res.json(post);
  } catch (error) {
    res.json({ error: `Post with ID ${id} does not exist in the database` });
  }
});

app.put("/publish/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const postData = await prisma.post.findUnique({
      where: { id: Number(id) },
      select: {
        published: true,
      },
    });

    const updatedPost = await prisma.post.update({
      where: { id: Number(id) || undefined },
      data: { published: !postData?.published },
    });
    res.json(updatedPost);
  } catch (error) {
    res.json({ error: `Post with ID ${id} does not exist in the database` });
  }
});

app.delete(`/post/:id`, async (req, res) => {
  const { id } = req.params;
  const post = await prisma.post.delete({
    where: {
      id: Number(id),
    },
  });
  res.json(post);
});

app.get("/users", async (req, res) => {
  const users = await prisma.user.findMany();
  res.json(users);
});

app.get("/user/:id/drafts", async (req, res) => {
  const { id } = req.params;

  const drafts = await prisma.user
    .findUnique({
      where: {
        id: Number(id),
      },
    })
    .posts({
      where: { published: false },
    });

  res.json(drafts);
});

app.get(`/post/:id`, async (req, res) => {
  const { id }: { id?: string } = req.params;

  const post = await prisma.post.findUnique({
    where: { id: Number(id) },
  });
  res.json(post);
});

app.get("/feed", async (req, res) => {
  const { searchString, skip, take, orderBy } = req.query;

  const or: Prisma.PostWhereInput = searchString
    ? {
        OR: [
          { title: { contains: searchString as string } },
          { content: { contains: searchString as string } },
        ],
      }
    : {};

  const posts = await prisma.post.findMany({
    where: {
      published: true,
      ...or,
    },
    include: { author: true },
    take: Number(take) || undefined,
    skip: Number(skip) || undefined,
    orderBy: {
      updatedAt: orderBy as Prisma.SortOrder,
    },
  });

  res.json(posts);
});

const server = app.listen(3000, () =>
  console.log(`
🚀 Server ready at: http://localhost:3000
⭐️ See sample requests: http://pris.ly/e/ts/rest-express#3-using-the-rest-api`)
);
