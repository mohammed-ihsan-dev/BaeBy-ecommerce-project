import React, { useEffect, useState } from "react";
import { PackageCheck, XCircle, Edit2, ShieldAlert } from "lucide-react";
import { useSearchParams } from "react-router-dom";
import toast from "react-hot-toast";
import { getOrders, updateOrderStatus } from "../../api/adminApi";
import api from "../../api/axiosInstance";

import { convertUSDToINR } from "../../utils/currencyFormatter";
import DataTable from "../../Components/admin/DataTable";
import Badge from "../../Components/admin/Badge";
import Modal from "../../Components/admin/Modal";

export default function Orders() {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [editingOrder, setEditingOrder] = useState(null);
    const [newStatus, setNewStatus] = useState("");
    const itemsPerPage = 8;

    const [searchParams, setSearchParams] = useSearchParams();
    const [filter, setFilter] = useState(searchParams.get("filter") || "all");
    const [currentPage, setCurrentPage] = useState(parseInt(searchParams.get("page")) || 1);

    useEffect(() => { fetchOrders(); }, []);
    useEffect(() => { setFilter(searchParams.get("filter") || "all"); }, [searchParams]);

    const fetchOrders = async () => {
        try {
            const res = await getOrders();
            const data = res.data?.data || [];
            setOrders([...data].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)));
        } catch (err) {
            toast.error(err.response?.data?.message || "Failed to fetch orders");
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateStatus = async () => {
        if (!newStatus) return;
        const orderId = editingOrder.id || editingOrder._id;
        try {
            await updateOrderStatus(orderId, { status: newStatus });

            setOrders(prev => prev.map(o => (o.id || o._id) === orderId ? { ...o, status: newStatus } : o));
            toast.success(`Order updated to "${newStatus}"`);
            setEditingOrder(null);
        } catch (err) {
            toast.error(err.response?.data?.message || "Failed to update order");
        }
    };

    const filteredOrders = orders.filter(o => filter === "all" || o.status?.toLowerCase().includes(filter.toLowerCase()));
    const totalPages = Math.ceil(filteredOrders.length / itemsPerPage);
    const currentOrders = filteredOrders.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

    const handlePageChange = (page) => { setCurrentPage(page); setSearchParams({ filter, page }); };
    const handleFilterChange = (type) => {
        setFilter(type); setCurrentPage(1);
        if (type === "all") setSearchParams({});
        else setSearchParams({ filter: type, page: 1 });
    };

    return (
        <div className="max-w-7xl mx-auto space-y-8">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-black text-white tracking-tight mb-1">Order Management</h1>
                    <p className="text-gray-400 font-medium">Track and resolve customer purchases.</p>
                </div>
                <div className="flex items-center gap-3 bg-[#111111]/80 px-5 py-3 border border-white/[0.05] rounded-2xl shadow-xl">
                    <span className="text-sm text-gray-400 font-bold uppercase tracking-widest">Volume</span>
                    <span className="text-xl text-purple-400 font-black">{orders.length}</span>
                </div>
            </div>

            <div className="flex flex-wrap gap-2 md:gap-3 bg-[#111111]/80 backdrop-blur-3xl p-3 rounded-3xl border border-white/[0.05] shadow-xl overflow-x-auto">
                {["all", "Pending COD", "Paid", "Delivered", "Cancelled"].map((type) => (
                    <button
                        key={type}
                        onClick={() => handleFilterChange(type)}
                        className={`px-5 py-2 rounded-xl text-sm font-bold capitalize transition-all whitespace-nowrap ${filter === type
                            ? "bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-[0_0_15px_rgba(168,85,247,0.3)]"
                            : "bg-white/[0.02] text-gray-400 border border-white/5 hover:bg-white/[0.05] hover:text-white"
                            }`}
                    >
                        {type === "all" ? "All Orders" : type}
                    </button>
                ))}
            </div>

            <DataTable
                isLoading={loading}
                emptyMessage="No orders found matching your criteria."
                headers={[
                    { label: "Order ID" }, { label: "Customer" }, { label: "Items" },
                    { label: "Amount", align: "center" }, { label: "Payment", align: "center" },
                    { label: "Status", align: "center" }, { label: "Date", align: "right" }, { label: "Actions", align: "right" }
                ]}
            >
                {currentOrders.map(order => {
                    const oid = order.id || order._id;
                    return (
                        <tr key={oid} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors group">
                            <td className="py-5 pr-4 text-xs font-mono text-gray-400 group-hover:text-purple-400 font-bold transition-colors">
                                #{oid?.toString().slice(-8).toUpperCase()}
                            </td>
                            <td className="py-5 pr-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-full bg-purple-500/10 text-purple-400 flex items-center justify-center text-xs font-bold border border-purple-500/20">
                                        {(order.user?.name || "G").charAt(0).toUpperCase()}
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-200 font-bold">{order.user?.name || "Guest"}</p>
                                        {order.user?.email && <p className="text-xs text-gray-500">{order.user.email}</p>}
                                    </div>
                                </div>
                            </td>
                            <td className="py-5 pr-4 text-sm text-gray-400">
                                {Array.isArray(order.items) ? <span className="bg-white/5 px-2 py-1 rounded-lg border border-white/5 text-xs">{order.items.length} item{order.items.length !== 1 ? "s" : ""}</span> : "—"}
                            </td>
                            <td className="py-5 text-center font-black text-white text-sm">{convertUSDToINR(order.totalAmount || 0)}</td>
                            <td className="py-5 text-center">
                                <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400 bg-white/5 px-2.5 py-1 rounded-md border border-white/5">
                                    {order.paymentMethod || "—"}
                                </span>
                            </td>
                            <td className="py-5 text-center">
                                <Badge type={order.status?.toLowerCase() || "pending"}>{order.status || "Pending"}</Badge>
                            </td>
                            <td className="py-5 text-right text-gray-400 text-xs font-medium pr-4">
                                {order.createdAt ? new Date(order.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "—"}
                            </td>
                            <td className="py-5 text-right">
                                <div className="flex justify-end gap-2 pr-2">
                                    <button onClick={() => { setEditingOrder(order); setNewStatus(order.status || ""); }} className="p-2 bg-white/5 hover:bg-white/10 rounded-xl text-gray-400 hover:text-white transition-colors"><Edit2 size={16} /></button>
                                    <button onClick={() => { setEditingOrder(order); setNewStatus("Cancelled"); }} className="p-2 bg-rose-500/5 hover:bg-rose-500/20 text-rose-400 rounded-xl transition-colors"><XCircle size={16} /></button>
                                </div>
                            </td>
                        </tr>
                    );
                })}
            </DataTable>

            {totalPages > 1 && !loading && (
                <div className="flex justify-center items-center gap-2 mt-10">
                    <button onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage === 1} className="px-4 py-2 bg-[#111111] border border-white/5 rounded-xl text-sm disabled:opacity-30 text-white font-medium">Previous</button>
                    <div className="flex gap-1.5 px-2">
                        {[...Array(totalPages)].map((_, i) => (
                            <button key={i} onClick={() => handlePageChange(i + 1)} className={`w-9 h-9 rounded-xl text-sm font-bold flex items-center justify-center transition-colors ${currentPage === i + 1 ? "bg-purple-600 text-white shadow-[0_0_10px_rgba(168,85,247,0.5)]" : "bg-[#111111] border border-white/5 text-gray-400 hover:bg-white/10"}`}>{i + 1}</button>
                        ))}
                    </div>
                    <button onClick={() => handlePageChange(currentPage + 1)} disabled={currentPage === totalPages} className="px-4 py-2 bg-[#111111] border border-white/5 rounded-xl text-sm disabled:opacity-30 text-white font-medium">Next</button>
                </div>
            )}

            <Modal isOpen={!!editingOrder} onClose={() => setEditingOrder(null)} title="Update Order" icon={ShieldAlert}>
                <div className="space-y-4">
                    <p className="text-xs text-gray-500 font-mono bg-white/5 inline-block px-3 py-1.5 rounded-lg border border-white/5">
                        Order #{(editingOrder?.id || editingOrder?._id)?.toString().slice(-8).toUpperCase()}
                    </p>
                    <div>
                        <label className="block text-xs font-semibold text-gray-400 mb-2 uppercase tracking-wider">New Status</label>
                        <div className="relative">
                            <select
                                value={newStatus}
                                onChange={(e) => setNewStatus(e.target.value)}
                                className="w-full bg-white/[0.02] border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-purple-500/50 text-sm appearance-none cursor-pointer"
                            >
                                <option value="Pending COD" className="bg-[#111111]">Pending COD</option>
                                <option value="Paid" className="bg-[#111111]">Paid</option>
                                <option value="Delivered" className="bg-[#111111]">Delivered</option>
                                <option value="Cancelled" className="bg-[#111111]">Cancelled</option>
                            </select>
                            <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-500">▾</div>
                        </div>
                    </div>
                    <div className="flex gap-3 pt-4 border-t border-white/5">
                        <button onClick={() => setEditingOrder(null)} className="flex-1 bg-white/5 hover:bg-white/10 text-white py-3 rounded-xl font-bold text-sm">Cancel</button>
                        <button onClick={handleUpdateStatus} className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 hover:opacity-90 text-white py-3 rounded-xl font-bold shadow-[0_0_15px_rgba(168,85,247,0.3)] text-sm">Confirm</button>
                    </div>
                </div>
            </Modal>
        </div>
    );
}
