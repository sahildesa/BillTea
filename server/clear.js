const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
prisma.expenseCategory.deleteMany()
  .then(() => console.log('cleared'))
  .catch(console.error)
  .finally(() => prisma.$disconnect());
