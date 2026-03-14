import React, { useEffect, useState } from "react";
import { PackageCheck, XCircle, Edit2, ShieldAlert, ChevronLeft, ChevronRight, Search } from "lucide-react";
import toast from "react-hot-toast";
import { getOrders, updateOrderStatus } from "../../api/adminApi";
import { convertUSDToINR } from "../../utils/currencyFormatter";
import DataTable from "../../Components/admin/DataTable";
import Badge from "../../Components/admin/Badge";
import Modal from "../../Components/admin/Modal";

export default function Orders() {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [editingOrder, setEditingOrder] = useState(null);
    const [newStatus, setNewStatus] = useState("");
    const [searchQuery, setSearchQuery] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalOrders, setTotalOrders] = useState(0);
    const itemsPerPage = 8;

    const fetchOrders = async () => {
        setLoading(true);
        try {
            const params = {
                page: currentPage,
                limit: itemsPerPage,
                status: statusFilter,
                search: searchQuery
            };
            const res = await getOrders(params);
            setOrders(res.data?.data || []);
            setTotalPages(res.data?.totalPages || 1);
            setTotalOrders(res.data?.totalOrders || 0);
        } catch (error) {
            console.error("Orders fetch error:", error);
            toast.error("Failed to load orders");
            setOrders([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const timeoutId = setTimeout(() => {
            fetchOrders();
        }, 500); // 500ms debounce

        return () => clearTimeout(timeoutId);
    }, [searchQuery, statusFilter, currentPage]);

    const handlePageChange = (p) => {
        if (p >= 1 && p <= totalPages) setCurrentPage(p);
    };

    const handleUpdateStatus = async () => {
        if (!newStatus) return;
        const orderId = editingOrder.id || editingOrder._id;
        try {
            await updateOrderStatus(orderId, { status: newStatus });
            toast.success(`Order updated to "${newStatus}"`);
            setEditingOrder(null);
            fetchOrders();
        } catch (err) {
            toast.error(err.response?.data?.message || "Failed to update order");
        }
    };

    return (
        <div className="max-w-7xl mx-auto space-y-8 pb-12">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-black text-white tracking-tight mb-1">Order Management</h1>
                    <p className="text-gray-400 font-medium">Track and resolve customer purchases.</p>
                </div>
                <div className="flex flex-col sm:flex-row items-center gap-4 w-full md:w-auto">
                    <div className="relative w-full sm:w-64">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 w-4 h-4" />
                        <input
                            type="text"
                            placeholder="Search by ID, User or Status..."
                            value={searchQuery}
                            onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
                            className="w-full bg-[#111111]/80 border border-white/[0.05] pl-10 pr-4 py-2.5 rounded-2xl text-gray-200 focus:outline-none focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/50 transition-all text-sm"
                        />
                    </div>
                    <div className="flex items-center gap-3 bg-[#111111]/80 px-5 py-2.5 border border-white/[0.05] rounded-2xl shadow-xl">
                        <span className="text-xs text-gray-400 font-bold uppercase tracking-widest hidden lg:block">Volume</span>
                        <span className="text-lg text-purple-400 font-black">{totalOrders}</span>
                    </div>
                </div>
            </div>

            <div className="flex flex-wrap gap-2 md:gap-3 bg-[#111111]/80 backdrop-blur-3xl p-3 rounded-3xl border border-white/[0.05] shadow-xl overflow-x-auto">
                {["all", "pending", "Pending COD", "Paid", "Delivered", "Cancelled"].map((type) => (
                    <button
                        key={type}
                        onClick={() => { setStatusFilter(type); setCurrentPage(1); }}
                        className={`px-5 py-2 rounded-xl text-sm font-bold capitalize transition-all whitespace-nowrap ${statusFilter === type
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
                {orders.map(order => {
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
                                        {order.shippingAddress && (
                                            <p className="text-[10px] text-gray-400 mt-1">
                                                {order.shippingAddress.city || "N/A"}, {order.shippingAddress.postalCode || "N/A"}
                                            </p>
                                        )}
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

            {totalPages > 1 && (
                <div className="flex items-center justify-between p-4 bg-[#111111]/50 rounded-2xl border border-white/5 shadow-lg">
                    <div className="text-xs font-bold text-gray-500 uppercase tracking-widest hidden sm:block">
                        Showing {(currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, totalOrders)} of {totalOrders} records
                    </div>
                    <div className="flex items-center gap-1 mx-auto sm:mx-0">
                        <button
                            onClick={() => handlePageChange(currentPage - 1)}
                            disabled={currentPage === 1}
                            className="p-2 bg-[#111111] rounded-lg text-white disabled:opacity-30 border border-white/10 hover:bg-white/5 transition-all"
                        >
                            <ChevronLeft size={18} />
                        </button>

                        <div className="flex items-center px-4 h-9 bg-purple-600/10 border border-purple-500/20 rounded-lg text-purple-400 font-bold text-sm">
                            {currentPage} / {totalPages}
                        </div>

                        <button
                            onClick={() => handlePageChange(currentPage + 1)}
                            disabled={currentPage === totalPages}
                            className="p-2 bg-[#111111] rounded-lg text-white disabled:opacity-30 border border-white/10 hover:bg-white/5 transition-all"
                        >
                            <ChevronRight size={18} />
                        </button>
                    </div>
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
                                <option value="pending" className="bg-[#111111]">Pending</option>
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
