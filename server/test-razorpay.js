const Razorpay = require('razorpay');
const rzp = new Razorpay({
  key_id: 'rzp_test_TD7OQTYSvKRxkM',
  key_secret: 'd7KBYGkxAMNRxXsIv8rHM99F'
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
    console.error("ERROR:", error.statusCode, error.message);
  }
}
test();
