import { Payment } from "@a2seven/yoo-checkout";
import { MockContext, Context, createMockContext } from "../context";
import { DonateInput, makePaymentInput } from "./donationService";
import { createUser, updateUsername } from "./functions-with-context";

let mockCtx: MockContext;
let ctx: Context;

beforeEach(() => {
  mockCtx = createMockContext();
  ctx = (mockCtx as unknown) as Context;
});

test("should make new one-time donation input", async () => {
  const donateInput: DonateInput = {
    amount: 1,
    email: "foo@bar.com",
    purpose: "somePurpose",
    isMonthly: "yes",
  };

  const yoomoneyResponse = ({
    id: "2a48f507-000f-5000-8000-1e710a55af02",
    status: "pending",
    amount: {
      value: "5.00",
      currency: "RUB",
    },
    description: "foobar",
    recipient: {
      account_id: "665894",
      gateway_id: "1663878",
    },
    payment_method: {
      type: "bank_card",
      id: "2a48f507-000f-5000-8000-1e710a55af02",
      saved: false,
    },
    created_at: "2022-06-25T10:19:51.715Z",
    confirmation: {
      type: "redirect",
      return_url: "https://www.merchant-website.com/return_url",
      confirmation_url:
        "https://yoomoney.ru/checkout/payments/v2/contract?orderId=2a48f507-000f-5000-8000-1e710a55af02",
    },
    test: true,
    paid: false,
    refundable: false,
    metadata: {},
  } as unknown) as Payment;

  mockCtx.yooCheckout.createPayment.mockResolvedValue(yoomoneyResponse);

  const result = await makePaymentInput(donateInput, mockCtx);

  expect(result).toBe({
    v,
  });

  console.log("result", result);

  //   const user = {
  //     id: 1,
  //     name: 'Rich',
  //     email: 'hello@prisma.io',
  //     acceptTermsAndConditions: true,
  //   }
  //   mockCtx.prisma.user.create.mockResolvedValue(user)

  //   await expect(createUser(user, ctx)).resolves.toEqual({
  //     id: 1,
  //     name: 'Rich',
  //     email: 'hello@prisma.io',
  //     acceptTermsAndConditions: true,
  //   })
});

test("should update donation status", async () => {
  //   const user = {
  //     id: 1,
  //     name: 'Rich Haines',
  //     email: 'hello@prisma.io',
  //     acceptTermsAndConditions: true,
  //   }
  //   mockCtx.prisma.user.update.mockResolvedValue(user)
  //   await expect(updateUsername(user, ctx)).resolves.toEqual({
  //     id: 1,
  //     name: 'Rich Haines',
  //     email: 'hello@prisma.io',
  //     acceptTermsAndConditions: true,
  //   })
});
