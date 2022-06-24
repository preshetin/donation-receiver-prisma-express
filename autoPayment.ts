import { Prisma, PrismaClient } from '@prisma/client'
import { Payment } from '@a2seven/yoo-checkout';

// to enable reads from .env file we need this
const prisma = new PrismaClient()

const { YooCheckout } = require('@a2seven/yoo-checkout')


const checkout = new YooCheckout({
shopId: process.env.YANDEX_CHECKOUT_SHOP_ID,
secretKey: process.env.YANDEX_CHECKOUT_SECRET
});


console.log('YANDEX_CHECKOUT_SHOP_ID', process.env.YANDEX_CHECKOUT_SHOP_ID )

async function main() {
  const recurrentPayment = await prisma.payment.findFirst({
    where: {
      id: 6
    }
  })
  console.log('payment from db', recurrentPayment)


  const automaticPaymentParams: any = {
    'amount': {
      'value': '11',
      'currency': 'RUB'
    },
    'capture': true,
    payment_method_id: "2a46df20-000f-5000-9000-1b16c01ad995",
    'description': 'automatic payment',
    'confirmation': {
      'type': 'redirect',
      'return_url': 'https://www.merchant-website.com/return_url'
    }
  };

  //   if (isMonthly) {
  //     // technically the docs say 'true' as string
  //     paymentParams.save_payment_method = true; 
  //   }

  const idempotenceKey = Date.now(); // i think it should come from the request...

  try {
    const payment = await checkout.createPayment(automaticPaymentParams, idempotenceKey) as Payment;
    console.log('result payment', payment)

  } catch (err) {
    console.log('payment error', err)
  }


}

main().catch((e) => console.error(e));

