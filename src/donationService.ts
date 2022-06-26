import { Context } from "../context";
import { YooCheckout } from "@a2seven/yoo-checkout";
import { Payment } from "@prisma/client";

export interface DonateInput {
  amount: number;
  purpose: string;
  email: string;
  isMonthly: string;
}

export async function makePaymentInput(donateInput: DonateInput, ctx: Context) {
  console.log("YANDEX_CHECKOUT_SHOP_ID", process.env.YANDEX_CHECKOUT_SHOP_ID);

  const paymentParams: any = buildYookassaCreatePaymentParams(donateInput);

  var idempotenceKey = String(Date.now()); // i think it should come from the request...

  const payment = await ctx.yooCheckout.createPayment(
    paymentParams,
    idempotenceKey
  );

  return {
    yoomoneyId: payment.id,
    status: payment.status,
    amount: payment.amount.value,
    currency: payment.amount.currency,
    description: payment.description,
    email: donateInput.email as string,
    paid: payment.paid,
    metadata: payment.metadata,
    paymentMethod: payment.payment_method as any,
    paymentMethodId: payment.payment_method_id,
  };
}

function buildYookassaCreatePaymentParams(donateInput: DonateInput): any {
  const { amount, isMonthly, purpose, email } = donateInput;

  const paymentParams: any = {
    amount: {
      value: amount,
      currency: "RUB",
    },
    capture: true,
    payment_method_data: {
      type: "bank_card",
    },
    description: purpose,
    confirmation: {
      type: "redirect",
      return_url: "https://www.merchant-website.com/return_url",
    },
  };

  if (isMonthly && isMonthly === "yes") {
    // technically the docs say 'true' as string
    paymentParams.save_payment_method = true;
  }

  return paymentParams;
}
