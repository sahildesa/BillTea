import { PrismaClient, UserRole } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding BillTea database...\n');

  // 1. Create default company
  let company = await prisma.company.findFirst({ where: { name: 'Indux Tech' } });
  if (!company) {
    company = await prisma.company.create({
      data: {
        name: 'Indux Tech',
        logo: '',
        identifiers: [],
      },
    });
    console.log('✓ Default company "Indux Tech" created.');
  } else {
    console.log('✓ Company "Indux Tech" already exists.');
  }

  // 2. Create main branch
  let mainBranch = await prisma.branch.findFirst({
    where: { companyId: company.id, isMainBranch: true },
  });
  if (!mainBranch) {
    mainBranch = await prisma.branch.create({
      data: {
        companyId: company.id,
        name: 'Main Branch',
        isMainBranch: true,
      },
    });
    console.log('✓ Default "Main Branch" created.');
  } else {
    console.log('✓ "Main Branch" already exists.');
  }

  // 3. Helper to seed a user
  const seedUser = async (
    fullName: string,
    email: string,
    phoneNumber: string,
    role: UserRole,
  ) => {
    const existing = await prisma.user.findUnique({ where: { email } });
    if (!existing) {
      const hashedPassword = await bcrypt.hash('Pass@123', 12);
      const user = await prisma.user.create({
        data: {
          fullName,
          email,
          phoneNumber,
          password: hashedPassword,
          role,
          companyId: company!.id,
          branches: { connect: [{ id: mainBranch!.id }] },
        },
      });
      console.log(`✓ Seeded ${role}: ${email} | Phone: ${phoneNumber} | Password: Pass@123`);
      return user;
    } else {
      console.log(`✓ User ${email} already exists.`);
      return existing;
    }
  };

  // Seed Owner
  const owner = await seedUser('Project Owner', 'admin@project.com', '9999999901', 'OWNER');

  // Link company creator
  if (!company.createdById) {
    await prisma.company.update({
      where: { id: company.id },
      data: { createdById: owner.id },
    });
  }

  // Seed Manager
  await seedUser('Project Manager', 'manager@project.com', '9999999902', 'MANAGER');

  // Seed Staff
  await seedUser('Project Staff', 'user@project.com', '9999999903', 'STAFF');

  // 4. Seed Customers
  const customerData = [
    { name: 'TechCorp', email: 'contact@techcorp.com', phone: '1234567890', company: 'TechCorp Inc.' },
    { name: 'Acme Corp', email: 'billing@acme.com', phone: '1234567891', company: 'Acme Corp Ltd.' },
    { name: 'Globex', email: 'sales@globex.com', phone: '1234567892', company: 'Globex Industries' },
    { name: 'Initech Solutions', email: 'bill@initech.com', phone: '1234567893', company: 'Initech Solutions' },
    { name: 'Stark Industries', email: 'pepper@stark.com', phone: '1234567894', company: 'Stark Industries' },
  ];

  const seededCustomers: Record<string, any> = {};
  for (const c of customerData) {
    let customer = await prisma.customer.findFirst({
      where: { companyId: company.id, customerName: c.name },
    });
    if (!customer) {
      customer = await prisma.customer.create({
        data: {
          companyId: company.id,
          branchId: mainBranch.id,
          customerName: c.name,
          companyName: c.company,
          email: c.email,
          mobileNumber: c.phone,
          address: '123 Business Rd, Tech City',
          createdById: owner.id,
        },
      });
      console.log(`✓ Customer "${c.name}" created.`);
    }
    seededCustomers[c.name] = customer;
  }

  // 5. Seed Quotations
  const quotationsToSeed = [
    {
      quotationNumber: 'QUO-2024-089',
      customerName: 'Acme Corp',
      status: 'SENT' as const,
      grandTotal: 24500.0,
      date: new Date(),
    },
    {
      quotationNumber: 'QUO-2024-088',
      customerName: 'Globex',
      status: 'DRAFT' as const,
      grandTotal: 8250.5,
      date: new Date(Date.now() - 24 * 60 * 60 * 1000), // Yesterday
    },
    {
      quotationNumber: 'QUO-2024-087',
      customerName: 'Initech Solutions',
      status: 'ACCEPTED' as const,
      grandTotal: 145000.0,
      date: new Date('2024-10-12T10:00:00Z'),
    },
    {
      quotationNumber: 'QUO-2024-086',
      customerName: 'Stark Industries',
      status: 'EXPIRED' as const,
      grandTotal: 999999.0,
      date: new Date('2024-10-10T10:00:00Z'),
    },
  ];

  for (const [idx, q] of quotationsToSeed.entries()) {
    const existingQuotation = await prisma.quotation.findFirst({
      where: { companyId: company.id, quotationNumber: q.quotationNumber },
    });
    if (!existingQuotation) {
      const cust = seededCustomers[q.customerName];
      await prisma.quotation.create({
        data: {
          quotationNumber: q.quotationNumber,
          sequenceNumber: 86 + idx,
          companyId: company.id,
          branchId: mainBranch.id,
          customerId: cust.id,
          customerSnapshot: {
            customerName: cust.customerName,
            companyName: cust.companyName,
            email: cust.email,
            mobileNumber: cust.mobileNumber,
          },
          status: q.status,
          quotationDate: q.date,
          expiryDate: new Date(q.date.getTime() + 30 * 24 * 60 * 60 * 1000),
          billingAddressSnapshot: {},
          shippingAddressSnapshot: {},
          discountConfiguration: {},
          taxConfiguration: {},
          subtotal: q.grandTotal,
          grandTotal: q.grandTotal,
          createdById: owner.id,
        },
      });
      console.log(`✓ Quotation "${q.quotationNumber}" created.`);
    }
  }

  // 6. Seed Invoices
  const invoicesToSeed = [
    {
      invoiceNumber: 'INV-2024-001',
      customerName: 'TechCorp',
      status: 'PAID' as const,
      grandTotal: 12500.0,
      amountPaid: 12500.0,
      amountDue: 0.0,
      date: new Date('2023-10-24T10:00:00Z'),
    },
    {
      invoiceNumber: 'INV-2024-002',
      customerName: 'Acme Corp',
      status: 'UNPAID' as const,
      grandTotal: 8400.0,
      amountPaid: 0.0,
      amountDue: 8400.0,
      date: new Date('2023-10-22T10:00:00Z'),
    },
    {
      invoiceNumber: 'INV-2024-003',
      customerName: 'Globex',
      status: 'OVERDUE' as const,
      grandTotal: 24500.0,
      amountPaid: 0.0,
      amountDue: 24500.0,
      date: new Date('2023-10-15T10:00:00Z'),
    },
  ];

  for (const [idx, inv] of invoicesToSeed.entries()) {
    const existingInvoice = await prisma.invoice.findFirst({
      where: { companyId: company.id, invoiceNumber: inv.invoiceNumber },
    });
    if (!existingInvoice) {
      const cust = seededCustomers[inv.customerName];
      await prisma.invoice.create({
        data: {
          invoiceNumber: inv.invoiceNumber,
          sequenceNumber: 1 + idx,
          companyId: company.id,
          branchId: mainBranch.id,
          customerId: cust.id,
          customerSnapshot: {
            customerName: cust.customerName,
            companyName: cust.companyName,
            email: cust.email,
            mobileNumber: cust.mobileNumber,
          },
          status: inv.status,
          invoiceDate: inv.date,
          dueDate: new Date(inv.date.getTime() + 14 * 24 * 60 * 60 * 1000),
          billingAddressSnapshot: {},
          shippingAddressSnapshot: {},
          discountConfiguration: {},
          taxConfiguration: {},
          subtotal: inv.grandTotal,
          grandTotal: inv.grandTotal,
          amountPaid: inv.amountPaid,
          amountDue: inv.amountDue,
          createdById: owner.id,
        },
      });
      console.log(`✓ Invoice "${inv.invoiceNumber}" created.`);
    }
  }

  // 7. Seed Expense Categories
  const categoriesToSeed = ['Marketing', 'Sales', 'DevOps', 'Operations'];
  const seededCategories: Record<string, any> = {};
  for (const name of categoriesToSeed) {
    let category = await prisma.expenseCategory.findFirst({
      where: { branchId: mainBranch.id, name },
    });
    if (!category) {
      category = await prisma.expenseCategory.create({
        data: {
          companyId: company.id,
          branchId: mainBranch.id,
          name,
          createdById: owner.id,
        },
      });
      console.log(`✓ Expense Category "${name}" created.`);
    }
    seededCategories[name] = category;
  }

  // 8. Seed Expenses
  const expensesToSeed = [
    {
      category: 'Marketing',
      amount: 1250.0,
      note: "Monthly social media advertising budget for the 'Glacier Pro' launch campaign, including targeted LinkedIn and Instagram ads.",
      date: new Date('2023-10-20T00:00:00Z'),
    },
    {
      category: 'Sales',
      amount: 3840.0,
      note: "Travel expenses for the regional sales team meeting in Chicago, covering flights, accommodation, and per diem.",
      date: new Date('2023-10-18T00:00:00Z'),
    },
    {
      category: 'DevOps',
      amount: 12400.0,
      note: "Annual server maintenance and security audit for the production environment, performed by external consultants.",
      date: new Date('2023-10-15T00:00:00Z'),
    },
    {
      category: 'Operations',
      amount: 66710.0,
      note: "Rent, utilities, and general office expenses for the primary headquarters.",
      date: new Date('2023-10-10T00:00:00Z'),
    },
  ];

  for (const exp of expensesToSeed) {
    const cat = seededCategories[exp.category];
    const existingExpense = await prisma.expense.findFirst({
      where: {
        companyId: company.id,
        amount: exp.amount,
        categoryId: cat.id,
        note: exp.note,
      },
    });
    if (!existingExpense) {
      await prisma.expense.create({
        data: {
          companyId: company.id,
          branchId: mainBranch.id,
          amount: exp.amount,
          categoryId: cat.id,
          paymentMethod: 'BANK_TRANSFER',
          note: exp.note,
          date: exp.date,
          createdById: owner.id,
        },
      });
      console.log(`✓ Expense of $${exp.amount} seeded.`);
    }
  }

  console.log('\nSeeding complete!');
}

main()
  .catch((e) => {
    console.error('✗ Seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
