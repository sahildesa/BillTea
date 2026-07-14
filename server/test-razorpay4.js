const Razorpay = require('razorpay');

async function test() {
  try {
    const rzp = new Razorpay({
      key_id: '',
      key_secret: ''
    });
    const order = await rzp.orders.create({
      amount: 10000,
      currency: 'INR',
      receipt: '123456',
    });
  } catch (error) {
    console.log("Error:", error.message, error.statusCode);
  }
}
test();
