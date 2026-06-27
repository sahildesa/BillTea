const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const products = await prisma.product.findMany();
  console.log("Products:");
  products.forEach(p => {
    console.log(`- ID: ${p.id}, Name: ${p.name}, Image: '${p.image}'`);
  });
}

main()
  .catch(e => console.error(e))
  .finally(async () => {
    await prisma.$disconnect();
  });
