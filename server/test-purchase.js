const jwt = require('jsonwebtoken');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function run() {
  const user = await prisma.user.findFirst({ where: { role: 'OWNER' } });
  if (!user) {
    console.log("No user found");
    return;
  }
  const token = jwt.sign({ sub: user.id, companyId: user.companyId }, 'indux_BillTea_super_secret_key_2024', { expiresIn: '1h' });
  
  const plan = await prisma.subscriptionPlan.findFirst({ where: { price: { gt: 0 } } });
  
  const res = await fetch('http://localhost:5000/api/v1/subscriptions/purchase', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + token
    },
    body: JSON.stringify({ planId: plan.id })
  });
  
  const text = await res.text();
  console.log("STATUS:", res.status);
  console.log("RESPONSE:", text);
}
run();
