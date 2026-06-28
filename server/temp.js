const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function main() {
  const products = await prisma.product.findMany({take: 5});
  console.log(JSON.stringify(products.map(p => ({name: p.name, image: p.image})), null, 2));
}
main().finally(() => prisma.$disconnect());
