const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  try {
    await prisma.$executeRaw`UPDATE "invoices" SET "status" = 'UNPAID' WHERE "status" IN ('DRAFT', 'SENT', 'CANCELLED')`;
    console.log("Status updated successfully.");
  } catch (error) {
    console.error(error);
  } finally {
    await prisma.$disconnect();
  }
}
main();
