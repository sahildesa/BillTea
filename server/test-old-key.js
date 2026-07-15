const Razorpay = require('razorpay');
const rzp = new Razorpay({
  key_id: 'rzp_test_TD6R4bY9LPMfAX',
  key_secret: 'fl3iVMBNWMhCPfiIVkUIpzvF'
});

async function test() {
  try {
    const order = await rzp.orders.create({
      amount: 10000,
      currency: 'INR',
      receipt: '123456789012345678901234567890123456',
    });
    console.log("SUCCESS:", order.id);
  } catch (error) {
    console.log("ERROR:", error.statusCode);
  }
}
test();
