import { Prisma, PrismaClient } from "@prisma/client";
import { Context } from "../context";
import express, { Request } from "express";
import { DonateRequestInput, makeDonationInput } from "./donationService";
import { Payment, YooCheckout } from "@a2seven/yoo-checkout";
import prisma from "../client";

// const prisma = new PrismaClient();
const yooCheckout = new YooCheckout({
  shopId: process.env.YANDEX_CHECKOUT_SHOP_ID as string,
  secretKey: process.env.YANDEX_CHECKOUT_SECRET as string,
});

const app = express();

app.use(express.json());

app.get("/donate", async (req, res) => {
  const { amount, purpose, email, isMonthly } = req.query;
  if (!email) return res.sendStatus(400);

  const input: DonateRequestInput = {
    amount: (amount as unknown) as number,
    purpose: (purpose as unknown) as string,
    email: (email as unknown) as string,
    isMonthly: (isMonthly as unknown) as string,
  };

  try {
    const donationInput = await makeDonationInput(input, {
      prisma,
      yooCheckout,
    });

    const result = await prisma.donation.create({
      data: donationInput,
    });

    res.json(result);
  } catch (err) {
    res.json(err);
  }
});

app.get(`/donation/:id`, async (req, res) => {
  const { id }: { id?: string } = req.params;

  const donation = await prisma.donation.findUnique({
    where: { id: Number(id) },
  });
  res.json(donation);
});

app.post(`/notification`, async (req, res) => {
  console.log("webhook request", req.body, JSON.stringify(req.body));
  const object = req.body.object as Payment;
  console.log(111);

  // look for payment by id
  // if payment exist, update it's status

  const payment = await prisma.donation.findUnique({
    where: { yoomoneyId: object.id },
  });
  console.log("payment from db", payment);

  if (payment !== null) {
    console.log("before update, payment id", payment.id);
    const updatedPayment = await prisma.donation.update({
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

app.get("/foo", async (req, res) => {
  /***********************************/
  /* TEST */
  /***********************************/

  const titles = [
    { title: 'How to create soft delete middleware' },
    { title: 'How to install Prisma' },
    { title: 'How to update a record' },
  ]

  console.log('\u001b[1;34mSTARTING SOFT DELETE TEST \u001b[0m')
  console.log('\u001b[1;34m#################################### \u001b[0m')

  let i = 0
  let posts = new Array()

  // Create 3 new posts with a randomly assigned title each time
  for (i == 0; i < 3; i++) {
    const createPostOperation = prisma.post.create({
      data: titles[Math.floor(Math.random() * titles.length)],
    })
    posts.push(createPostOperation)
  }

  var postsCreated = await prisma.$transaction(posts)

  console.log(
    'Posts created with IDs: ' +
      '\u001b[1;32m' +
      postsCreated.map((x) => x.id) +
      '\u001b[0m'
  )

  // Delete the first post from the array
  const deletePost = await prisma.post.delete({
    where: {
      id: postsCreated[0].id, // Random ID
    },
  })

  // Delete the 2nd two posts
  const deleteManyPosts = await prisma.post.deleteMany({
    where: {
      id: {
        in: [postsCreated[1].id, postsCreated[2].id],
      },
    },
  })

  const getPosts = await prisma.post.findMany({
    where: {
      id: {
        in: postsCreated.map((x) => x.id),
      },
    },
  })

  console.log()

  console.log(
    'Deleted post with ID: ' + '\u001b[1;32m' + deletePost.id + '\u001b[0m'
  )
  console.log(
    'Deleted posts with IDs: ' +
      '\u001b[1;32m' +
      [postsCreated[1].id + ',' + postsCreated[2].id] +
      '\u001b[0m'
  )
  console.log()
  console.log(
    'Are the posts still available?: ' +
      (getPosts.length == 3
        ? '\u001b[1;32m' + 'Yes!' + '\u001b[0m'
        : '\u001b[1;31m' + 'No!' + '\u001b[0m')
  )
  console.log()
  console.log('\u001b[1;34m#################################### \u001b[0m')
  // 4. Count ALL posts
  const f = await prisma.post.findMany({})
  console.log('Number of posts: ' + '\u001b[1;32m' + f.length + '\u001b[0m')

  // 5. Count DELETED posts
  const r = await prisma.post.findMany({
    where: {
      deleted: true,
    },
  })
  console.log(
    'Number of SOFT deleted posts: ' + '\u001b[1;32m' + r.length + '\u001b[0m'
  )
}
  res.json({foo: 'bar'});
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
