import React, { useEffect, useState } from "react";
import {
    BarChart, Bar, XAxis, Tooltip, PieChart, Pie, Cell, ResponsiveContainer, YAxis, CartesianGrid
} from "recharts";
import { CreditCard, Package, ShoppingCart, Users } from "lucide-react";
import { getStats, getOrders } from "../../api/adminApi";
import { convertUSDToINR } from "../../utils/currencyFormatter";
import StatCard from "../../Components/admin/StatCard";
import DataTable from "../../Components/admin/DataTable";
import Badge from "../../Components/admin/Badge";

const COLORS = ["#8B5CF6", "#6366F1", "#A855F7", "#EC4899"];

export default function Dashboard() {
    const [stats, setStats] = useState({ totalUsers: 0, totalOrders: 0, totalProducts: 0, totalRevenue: 0 });
    const [recentOrders, setRecentOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                const [statsRes, ordersRes] = await Promise.all([getStats(), getOrders()]);
                const statsData = statsRes?.data?.data || {};
                setStats({
                    totalUsers: statsData.totalUsers || 0,
                    totalOrders: statsData.totalOrders || 0,
                    totalProducts: statsData.totalProducts || 0,
                    totalRevenue: statsData.totalRevenue || 0,
                });
                const orders = ordersRes?.data?.data || [];
                setRecentOrders([...orders].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 5));
            } catch (err) {
                if (err.response?.status === 401) {
                    localStorage.removeItem("adminToken");
                    window.location.href = "/admin/login";
                    return;
                }
                setError("Failed to load dashboard data. Please try again.");
            } finally {
                setLoading(false);
            }
        };
        fetchDashboardData();
    }, []);

    if (loading) {
        return (
            <div className="flex justify-center items-center h-[60vh]">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500" />
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex flex-col justify-center items-center h-[60vh] gap-4">
                <p className="text-red-400 font-semibold text-lg">{error}</p>
                <button onClick={() => window.location.reload()} className="px-6 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-xl font-medium transition">
                    Retry Connection
                </button>
            </div>
        );
    }

    const barData = [
        { name: "Users", value: stats.totalUsers },
        { name: "Products", value: stats.totalProducts },
        { name: "Orders", value: stats.totalOrders },
    ];

    const pieData = [
        { name: "Users", value: stats.totalUsers || 1 },
        { name: "Orders", value: stats.totalOrders || 1 },
        { name: "Products", value: stats.totalProducts || 1 },
    ];

    return (
        <div className="max-w-7xl mx-auto space-y-8">
            <div>
                <h1 className="text-3xl font-black tracking-tight text-white mb-1">Platform Overview</h1>
                <p className="text-sm text-gray-400 font-medium">Analytics and recent activity across your workspace.</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard title="Total Users" value={stats.totalUsers} icon={Users} color="blue" />
                <StatCard title="Total Products" value={stats.totalProducts} icon={Package} color="emerald" />
                <StatCard title="Total Orders" value={stats.totalOrders} icon={ShoppingCart} color="rose" />
                <StatCard title="Total Revenue" value={convertUSDToINR(stats.totalRevenue)} icon={CreditCard} color="purple" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 bg-[#111111]/80 backdrop-blur-2xl rounded-3xl p-6 border border-white/[0.05] shadow-xl">
                    <h2 className="text-lg font-bold mb-6 text-white tracking-tight">System Metrics</h2>
                    <ResponsiveContainer width="100%" height={320}>
                        <BarChart data={barData} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />
                            <XAxis dataKey="name" stroke="#888" fontSize={12} tickLine={false} axisLine={false} />
                            <YAxis stroke="#888" fontSize={12} tickLine={false} axisLine={false} />
                            <Tooltip cursor={{ fill: "rgba(255,255,255,0.02)" }} contentStyle={{ backgroundColor: "#6c6c74ff", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "12px" }} />
                            <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                                {barData.map((_, index) => <Cell key={index} fill={COLORS[index % COLORS.length]} />)}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </div>

                <div className="bg-[#111111]/80 backdrop-blur-2xl rounded-3xl p-6 border border-white/[0.05] shadow-xl">
                    <h2 className="text-lg font-bold mb-6 text-white tracking-tight">Data Distribution</h2>
                    <div className="relative h-[320px] flex items-center justify-center">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie data={pieData} dataKey="value" outerRadius={110} innerRadius={80} stroke="transparent" paddingAngle={5}>
                                    {pieData.map((_, index) => <Cell key={index} fill={COLORS[index % COLORS.length]} />)}
                                </Pie>
                                <Tooltip contentStyle={{ backgroundColor: "#6c6c74ff", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "12px" }} />
                            </PieChart>
                        </ResponsiveContainer>
                        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                            <span className="text-3xl font-black text-white">{stats.totalOrders + stats.totalProducts + stats.totalUsers}</span>
                            <span className="text-xs font-semibold uppercase tracking-widest text-gray-500 mt-1">Total Data</span>
                        </div>
                    </div>
                </div>
            </div>

            <div>
                <h2 className="text-xl font-bold tracking-tight text-white mb-4">Recent Transactions</h2>
                <DataTable
                    headers={[{ label: "Order ID" }, { label: "Customer" }, { label: "Amount" }, { label: "Status" }]}
                    emptyMessage="No recent orders found."
                >
                    {recentOrders.map((order) => (
                        <tr key={order.id || order._id} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors">
                            <td className="py-4 pr-4 font-mono text-sm text-gray-400">
                                #{(order.id || order._id)?.toString().slice(-8).toUpperCase()}
                            </td>
                            <td className="py-4 pr-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-full bg-purple-500/10 text-purple-400 flex items-center justify-center text-xs font-bold border border-purple-500/20">
                                        {(order.user?.name || "G").charAt(0).toUpperCase()}
                                    </div>
                                    <div>
                                        <p className="text-sm font-bold text-gray-200">{order.user?.name || "Guest"}</p>
                                        {order.user?.email && <p className="text-xs text-gray-500">{order.user.email}</p>}
                                    </div>
                                </div>
                            </td>
                            <td className="py-4 text-sm font-bold text-gray-200">
                                {convertUSDToINR(order.totalAmount || 0)}
                            </td>
                            <td className="py-4">
                                <Badge type={order.status?.toLowerCase() || "pending"}>{order.status || "Pending"}</Badge>
                            </td>
                        </tr>
                    ))}
                </DataTable>
            </div>
        </div>
    );
}
