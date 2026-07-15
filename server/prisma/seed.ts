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
    const existing = await prisma.user.findFirst({
      where: {
        OR: [{ email }, { phoneNumber }],
      },
    });
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
          sequenceNumber: Math.floor(Math.random() * 1000000) + idx,
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
          sequenceNumber: Math.floor(Math.random() * 1000000) + idx,
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

  // 8.5 Generate daily dynamic data for the last 45 days
  const today = new Date();
  for (let i = 45; i >= 0; i--) {
    const targetDate = new Date(today);
    targetDate.setDate(targetDate.getDate() - i);

    const grandTotal = Math.floor(Math.random() * 50000) + 5000;
    const isPaid = Math.random() > 0.3;
    const custName = customerData[i % customerData.length].name;
    const cust = seededCustomers[custName];

    // Seed Quotation
    const qNum = `QUO-GEN-${i}`;
    const existingQ = await prisma.quotation.findFirst({
      where: { companyId: company.id, quotationNumber: qNum }
    });
    if (!existingQ) {
      await prisma.quotation.create({
        data: {
          quotationNumber: qNum,
          sequenceNumber: Math.floor(Math.random() * 1000000) + i,
          companyId: company.id,
          branchId: mainBranch.id,
          customerId: cust.id,
          customerSnapshot: { customerName: cust.customerName },
          status: 'SENT',
          quotationDate: targetDate,
          expiryDate: new Date(targetDate.getTime() + 30 * 24 * 60 * 60 * 1000),
          billingAddressSnapshot: {},
          shippingAddressSnapshot: {},
          discountConfiguration: {},
          taxConfiguration: {},
          subtotal: grandTotal,
          grandTotal: grandTotal,
          createdById: owner.id,
        }
      });
    }

    // Seed Invoice
    const iNum = `INV-GEN-${i}`;
    const existingI = await prisma.invoice.findFirst({
      where: { companyId: company.id, invoiceNumber: iNum }
    });
    if (!existingI) {
      await prisma.invoice.create({
        data: {
          invoiceNumber: iNum,
          sequenceNumber: Math.floor(Math.random() * 1000000) + i,
          companyId: company.id,
          branchId: mainBranch.id,
          customerId: cust.id,
          customerSnapshot: { customerName: cust.customerName },
          status: isPaid ? 'PAID' : 'UNPAID',
          invoiceDate: targetDate,
          dueDate: new Date(targetDate.getTime() + 14 * 24 * 60 * 60 * 1000),
          billingAddressSnapshot: {},
          shippingAddressSnapshot: {},
          discountConfiguration: {},
          taxConfiguration: {},
          subtotal: grandTotal,
          grandTotal: grandTotal,
          amountPaid: isPaid ? grandTotal : 0,
          amountDue: isPaid ? 0 : grandTotal,
          createdById: owner.id,
        }
      });
    }
  }
  console.log('✓ Seeded daily historical data for the last 45 days.');

  console.log('\nSeeding complete!')

  // ─── 9. Seed Super Admin ─────────────────────────────────────
  const superAdminEmail = 'superadmin@billtea.com';
  const existingSuperAdmin = await prisma.user.findFirst({
    where: {
      OR: [{ email: superAdminEmail }, { phoneNumber: '9000000001' }]
    }
  });
  if (!existingSuperAdmin) {
    const hashedPassword = await bcrypt.hash('SuperAdmin@123', 12);
    await prisma.user.create({
      data: {
        fullName: 'BillTea Super Admin',
        email: superAdminEmail,
        phoneNumber: '9000000001',
        password: hashedPassword,
        role: 'SUPER_ADMIN',
        companyId: null,
      },
    });
    console.log('✓ Seeded SUPER_ADMIN: superadmin@billtea.com | Password: SuperAdmin@123');
  } else {
    console.log('✓ Super Admin already exists.');
  }

  // ─── 10. Seed Subscription Plans ─────────────────────────────
  const plansToSeed = [
    {
      name: 'Trial Plan',
      rank: 'TRIAL' as const,
      description: 'Try BillTea free for 30 days with limited features.',
      displayOrder: 1,
      price: 0,
      billingCycle: 'MONTHLY' as const,
      quotationLimit: 10,
      invoiceLimit: 10,
      customerLimit: 5,
      productLimit: 10,
      branchLimit: 1,
      staffLimit: 2,
      whatsappMessageLimit: 5,
      customQuotationThemes: false,
      customInvoiceThemes: false,
      whatsappIntegration: false,
      isRecommended: false,
    },
    {
      name: 'Bronze Plan',
      rank: 'BRONZE' as const,
      description: 'Great for small businesses getting started with professional billing.',
      displayOrder: 2,
      price: 499,
      billingCycle: 'MONTHLY' as const,
      quotationLimit: 100,
      invoiceLimit: 100,
      customerLimit: 50,
      productLimit: 100,
      branchLimit: 2,
      staffLimit: 5,
      whatsappMessageLimit: 50,
      customQuotationThemes: false,
      customInvoiceThemes: false,
      whatsappIntegration: true,
      isRecommended: false,
    },
    {
      name: 'Silver Plan',
      rank: 'SILVER' as const,
      description: 'Perfect for growing businesses that need more power and customization.',
      displayOrder: 3,
      price: 999,
      billingCycle: 'MONTHLY' as const,
      quotationLimit: 500,
      invoiceLimit: 500,
      customerLimit: 200,
      productLimit: 500,
      branchLimit: 5,
      staffLimit: 15,
      whatsappMessageLimit: 200,
      customQuotationThemes: true,
      customInvoiceThemes: true,
      whatsappIntegration: true,
      isRecommended: true,
    },
    {
      name: 'Gold Plan',
      rank: 'GOLD' as const,
      description: 'Unlimited everything. For enterprises that demand the best.',
      displayOrder: 4,
      price: 1999,
      billingCycle: 'MONTHLY' as const,
      quotationLimit: 0,
      invoiceLimit: 0,
      customerLimit: 0,
      productLimit: 0,
      branchLimit: 0,
      staffLimit: 0,
      whatsappMessageLimit: 0,
      customQuotationThemes: true,
      customInvoiceThemes: true,
      whatsappIntegration: true,
      isRecommended: false,
    },
  ];

  for (const planData of plansToSeed) {
    const existingPlan = await prisma.subscriptionPlan.findFirst({
      where: { name: planData.name, isDeleted: false },
    });
    if (!existingPlan) {
      await prisma.subscriptionPlan.create({ data: planData });
      console.log(`✓ Subscription plan "${planData.name}" created.`);
    } else {
      console.log(`✓ Subscription plan "${planData.name}" already exists.`);
    }
  }

  // ─── 11. Auto-assign Trial plan to Indux Tech ────────────────
  const trialPlan = await prisma.subscriptionPlan.findFirst({
    where: { rank: 'TRIAL', isActive: true, isDeleted: false },
  });

  if (trialPlan && company) {
    const existingSub = await prisma.companySubscription.findUnique({
      where: { companyId: company.id },
    });

    if (!existingSub) {
      const expiryDate = new Date();
      expiryDate.setMonth(expiryDate.getMonth() + 1);

      await prisma.companySubscription.create({
        data: {
          companyId: company.id,
          planId: trialPlan.id,
          status: 'TRIAL',
          startDate: new Date(),
          expiryDate,
        },
      });
      console.log('✓ Trial subscription assigned to Indux Tech.');
    } else {
      console.log('✓ Indux Tech subscription already exists.');
    }

    // Create usage record
    const existingUsage = await prisma.companyUsage.findUnique({
      where: { companyId: company.id },
    });
    if (!existingUsage) {
      await prisma.companyUsage.create({
        data: { companyId: company.id },
      });
      console.log('✓ Usage tracker created for Indux Tech.');
    }
  }

  console.log('\n🎉 Full seeding complete!');
}

main()
  .catch((e) => {
    console.error('✗ Seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
