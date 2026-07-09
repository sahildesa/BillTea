export const summaryData = [
  {
    title: "Revenue",
    value: "₹1,25,000",
    change: "+12%",
  },
  {
    title: "Orders",
    value: "235",
    change: "+8%",
  },
  {
    title: "Customers",
    value: "120",
    change: "+15%",
  },
  {
    title: "Profit",
    value: "₹45,000",
    change: "+10%",
  },
];

export type ProfitTransaction = {
  id: string;
  title: string;
  invoice: string;
  company: string;
  category: string;
  amount: string;
  date: string;
  type: "income" | "expense";
};

export const profitTransactions: ProfitTransaction[] = [
  {
    id: "1",
    title: "Service Payment",
    invoice: "#INV-2041",
    company: "TechCorp Ltd.",
    category: "Tech Services",
    amount: "$12,500",
    date: "Oct 24, 2023",
    type: "income",
  },
  {
    id: "2",
    title: "Office Supplies",
    invoice: "#EXP-1048",
    company: "Office Depot",
    category: "Office Expense",
    amount: "$850",
    date: "Oct 22, 2023",
    type: "expense",
  },
  {
    id: "3",
    title: "Marketing Campaign",
    invoice: "#EXP-1052",
    company: "Digital Ads Inc.",
    category: "Marketing",
    amount: "$3,200",
    date: "Oct 20, 2023",
    type: "expense",
  },
  {
    id: "4",
    title: "Client Retainer",
    invoice: "#INV-2038",
    company: "Global Solutions",
    category: "Consulting",
    amount: "$8,750",
    date: "Oct 18, 2023",
    type: "income",
  },
  {
    id: "5",
    title: "Software License",
    invoice: "#EXP-1039",
    company: "Adobe Inc.",
    category: "Software",
    amount: "$599",
    date: "Oct 16, 2023",
    type: "expense",
  },
  {
    id: "6",
    title: "Equipment Purchase",
    invoice: "#EXP-1033",
    company: "Tech Store",
    category: "Hardware",
    amount: "$2,450",
    date: "Oct 12, 2023",
    type: "expense",
  },
];