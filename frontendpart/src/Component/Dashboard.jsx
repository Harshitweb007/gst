import React, { useEffect, useState } from "react";
import { API_URL } from "../config/api";
import {
  ArrowDownRight,
  ArrowUpRight,
  FileText,
  ShoppingCart,
  Eye,
  X
} from "lucide-react";

import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid
} from "recharts";

export default function Dashboard() {
  const [data, setData] = useState({
    totals: {},
    salesBreakdown: [],
    monthlySales: []
  });
  const [invoices, setInvoices] = useState([]);
  const [previewInvoice, setPreviewInvoice] = useState(null);
  const [loading, setLoading] = useState(true);

  const COLORS = ["#7C3AED", "#06B6D4", "#F97316", "#10B981", "#F43F5E"];

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const token = localStorage.getItem("token");

        const [dashboardRes, invoiceRes] = await Promise.all([
          fetch(`${API_URL}/api/dashboard`, {
            headers: { Authorization: `Bearer ${token}` }
          }),
          fetch(`${API_URL}/api/invoices`, {
            headers: { Authorization: `Bearer ${token}` }
          })
        ]);

        setData(await dashboardRes.json());
        setInvoices(await invoiceRes.json());
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchAll();
  }, []);

  if (loading) {
    return <p className="text-center mt-20 text-lg animate-pulse">Loading dashboard…</p>;
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6 space-y-10">

      {/* ===== SUMMARY CARDS ===== */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Purchase Due" value={data.totals?.purchaseDue} icon={<ShoppingCart />} />
        <StatCard title="Sales Due" value={data.totals?.salesDue} icon={<ArrowDownRight />} />
        <StatCard title="Total Sales" value={data.totals?.totalSales} icon={<ArrowUpRight />} />
        <StatCard title="Revenue" value={data.totals?.totalRevenue} icon={<ArrowUpRight />} />
      </div>

      {/* ===== CHARTS ===== */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

        {/* PIE */}
        <ChartCard title="Customer-wise Sales">
          {data.salesBreakdown?.length ? (
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie data={data.salesBreakdown} dataKey="value" nameKey="name" innerRadius={70}>
                  {data.salesBreakdown.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          ) : <EmptyState />}
        </ChartCard>

        {/* BAR */}
        <ChartCard title="Monthly Sales">
          {data.monthlySales?.length ? (
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={data.monthlySales}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="value" fill="#6366F1" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : <EmptyState />}
        </ChartCard>

      </div>

      {/* ===== INVOICES ===== */}
      <div className="bg-white p-6 rounded-2xl shadow-lg border">
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <FileText /> My Invoices
        </h2>

        {invoices.length === 0 ? (
          <EmptyState />
        ) : (
          <table className="w-full">
            <thead className="bg-gray-100">
              <tr>
                <th className="p-3">Invoice</th>
                <th className="p-3">Customer</th>
                <th className="p-3">Date</th>
                <th className="p-3 text-right">Amount</th>
                <th className="p-3">Status</th>
                <th className="p-3">View</th>
              </tr>
            </thead>

            <tbody>
              {invoices.map(inv => (
                <tr
                  key={inv._id}
                  className="border-t hover:bg-indigo-50 transition"
                >
                  <td className="p-3">{inv.invoiceNo}</td>
                  <td className="p-3">{inv.customerName}</td>
                  <td className="p-3">{inv.date}</td>
                  <td className="p-3 text-right font-semibold">₹{inv.totalAmount}</td>
                  <td className="p-3">
                    <StatusBadge status={inv.status} />
                  </td>
                  <td className="p-3 text-center">
                    <Eye
                      className="cursor-pointer text-indigo-600 hover:scale-125 transition"
                      onClick={() => setPreviewInvoice(inv)}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* ===== MODAL ===== */}
      {previewInvoice && (
        <InvoiceModal invoice={previewInvoice} onClose={() => setPreviewInvoice(null)} />
      )}

    </div>
  );
}

/* ================== COMPONENTS ================== */

function StatCard({ title, value, icon }) {
  return (
    <div className="bg-white p-6 rounded-2xl shadow hover:shadow-xl hover:-translate-y-1 transition">
      <div className="flex justify-between items-center">
        <div>
          <p className="text-2xl font-bold">₹{value || 0}</p>
          <p className="text-sm text-gray-500">{title}</p>
        </div>
        <div className="p-3 bg-indigo-100 text-indigo-600 rounded-full">
          {icon}
        </div>
      </div>
    </div>
  );
}

function ChartCard({ title, children }) {
  return (
    <div className="bg-white p-6 rounded-2xl shadow-lg border">
      <h3 className="text-lg font-semibold mb-4">{title}</h3>
      {children}
    </div>
  );
}

function StatusBadge({ status }) {
  return (
    <span
      className={`px-3 py-1 rounded-full text-xs font-semibold
      ${status === "Paid"
        ? "bg-green-100 text-green-700"
        : "bg-yellow-100 text-yellow-700"}`}
    >
      {status}
    </span>
  );
}

function EmptyState() {
  return (
    <p className="text-gray-400 text-center mt-20">
      No data available
    </p>
  );
}

function InvoiceModal({ invoice, onClose }) {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white w-full max-w-lg rounded-2xl p-6 shadow-xl animate-scaleIn">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold">Invoice Preview</h2>
          <X className="cursor-pointer" onClick={onClose} />
        </div>

        <div className="space-y-2 text-sm">
          <p><b>Invoice No:</b> {invoice.invoiceNo}</p>
          <p><b>Customer:</b> {invoice.customerName}</p>
          <p><b>Date:</b> {invoice.date}</p>
          <p><b>Total:</b> ₹{invoice.totalAmount}</p>
          <p><b>Status:</b> {invoice.status}</p>
        </div>
      </div>
    </div>
  );
}
