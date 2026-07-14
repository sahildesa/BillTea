const Razorpay = require('razorpay');
// using test keys that I can generate or maybe some random string to simulate an error?
// Wait, if the keys are invalid, it will ALWAYS return 401 Authentication failed, regardless of other validation errors!
const rzp = new Razorpay({
  key_id: 'rzp_test_TD6R4bY9LPMfAX',
  key_secret: 'fl3iVMBNWMhCPfiIVkUIpzvF'
});

async function test() {
  try {
    const order = await rzp.orders.create({
      amount: 10000,
      currency: 'INR',
      receipt: '1234567890123456789012345678901234567890123456',
    });
  } catch (error) {
    console.log("Error statusCode:", error.statusCode);
  }
}
test();
