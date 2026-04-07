import React, { useEffect, useState } from "react";
import { UserCheck, UserX, Users as UsersIcon, Edit2, Trash2, Search, Filter, Shield, User as SingleUser, ChevronLeft, ChevronRight } from "lucide-react";
import toast from "react-hot-toast";
import { getUsers, deleteUser, updateUser } from "../../api/adminApi";
import DataTable from "../../Components/admin/DataTable";
import Badge from "../../Components/admin/Badge";
import Modal from "../../Components/admin/Modal";
import StatCard from "../../Components/admin/StatCard";

export default function Users() {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [roleFilter, setRoleFilter] = useState("all");
    const [statusFilter, setStatusFilter] = useState("all");
    const [editingUser, setEditingUser] = useState(null);
    const [editForm, setEditForm] = useState({ name: "", email: "", role: "", status: "" });
    const [deleteUserModal, setDeleteUserModal] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalUsers, setTotalUsers] = useState(0);
    const itemsPerPage = 8;

    const fetchUsers = async () => {
        setLoading(true);
        try {
            const res = await getUsers({
                page: currentPage,
                limit: itemsPerPage,
                search: searchQuery
            });
            setUsers(res.data?.data || []);
            setTotalPages(res.data?.totalPages || 1);
            setTotalUsers(res.data?.totalUsers || 0);
        } catch (err) {
            toast.error(err.response?.data?.message || "Failed to fetch users");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, [currentPage, searchQuery]);

    const handlePageChange = (p) => {
        if (p >= 1 && p <= totalPages) setCurrentPage(p);
    };

    const confirmDelete = async () => {
        const userId = deleteUserModal.id || deleteUserModal._id;
        try {
            await deleteUser(userId);
            toast.success("User deleted successfully");
            setDeleteUserModal(null);
            fetchUsers();
        } catch (err) {
            toast.error(err.response?.data?.message || "Failed to delete user");
        }
    };

    const openEditModal = (user) => {
        setEditingUser(user);
        setEditForm({ name: user.name || "", email: user.email || "", role: user.role || "user", status: user.status || "active" });
    };

    const handleEditChange = (e) => setEditForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

    const handleSaveChanges = async () => {
        const userId = editingUser.id || editingUser._id;
        try {
            await updateUser(userId, editForm);
            toast.success("User updated successfully");
            setEditingUser(null);
            fetchUsers();
        } catch (err) {
            toast.error(err.response?.data?.message || "Failed to update user");
        }
    };

    return (
        <div className="max-w-7xl mx-auto space-y-8 pb-12">
            <div>
                <h1 className="text-3xl font-black text-white tracking-tight mb-1">User Management</h1>
                <p className="text-gray-400 font-medium">Manage platform accounts and roles.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <StatCard title="Total Users" value={totalUsers} icon={UsersIcon} color="blue" />
                <StatCard title="Users on Page" value={users.length} icon={UserCheck} color="emerald" />
                <StatCard title="Search Pattern" value={searchQuery || "None"} icon={Filter} color="purple" />
            </div>

            <div className="flex flex-col lg:flex-row gap-4 bg-[#111111]/80 backdrop-blur-3xl p-4 rounded-3xl border border-white/[0.05] shadow-xl">
                <div className="relative flex-1">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 w-5 h-5" />
                    <input
                        placeholder="Search by name or email..."
                        value={searchQuery}
                        onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
                        className="w-full bg-white/[0.02] border border-white/[0.05] pl-12 pr-4 py-3 rounded-2xl text-gray-200 focus:outline-none focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/50 transition-all text-sm placeholder:text-gray-600"
                    />
                </div>
            </div>

            <DataTable
                isLoading={loading}
                emptyMessage="No users found matching your search."
                headers={[
                    { label: "Avatar" }, { label: "Name" }, { label: "Email" },
                    { label: "Role" }, { label: "Status" }, { label: "Actions", align: "right" }
                ]}
            >
                {users.map(user => {
                    const uid = user.id || user._id;
                    return (
                        <tr key={uid} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors">
                            <td className="py-4 pr-4">
                                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500/20 to-pink-500/20 text-purple-400 flex items-center justify-center font-bold border border-purple-500/20">
                                    {user.name?.charAt(0).toUpperCase()}
                                </div>
                            </td>
                            <td className="py-4 pr-4 font-bold text-gray-200 text-sm">{user.name}</td>
                            <td className="py-4 pr-4 text-gray-400 text-sm">{user.email}</td>
                            <td className="py-4 pr-4">
                                <Badge type={user.role === "admin" ? "admin" : "user"}>
                                    <span className="flex items-center gap-1">
                                        {user.role === "admin" ? <Shield size={11} /> : <SingleUser size={11} />} {user.role}
                                    </span>
                                </Badge>
                            </td>
                            <td className="py-4 pr-4">
                                <Badge type={user.status || "active"}>{user.status || "active"}</Badge>
                            </td>
                            <td className="py-4 text-right">
                                <div className="flex justify-end gap-2">
                                    <button onClick={() => openEditModal(user)} className="p-2 bg-white/5 hover:bg-white/10 rounded-xl text-gray-400 hover:text-white transition-colors" title="Edit User">
                                        <Edit2 size={16} />
                                    </button>
                                    <button onClick={() => setDeleteUserModal(user)} className="p-2 bg-rose-500/5 hover:bg-rose-500/20 text-rose-400 rounded-xl transition-colors" title="Delete User">
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            </td>
                        </tr>
                    );
                })}
            </DataTable>

            {totalPages > 1 && (
                <div className="flex items-center justify-between p-4 bg-[#111111]/50 rounded-2xl border border-white/5">
                    <div className="text-xs font-bold text-gray-500 uppercase tracking-widest hidden sm:block">
                        Showing {(currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, totalUsers)} of {totalUsers} records
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

            <Modal isOpen={!!editingUser} onClose={() => setEditingUser(null)} title="Edit User" icon={Edit2}>
                <div className="space-y-4">
                    <div>
                        <label className="block text-xs font-semibold text-gray-400 mb-1 uppercase tracking-wider">Full Name</label>
                        <input type="text" name="name" value={editForm.name} onChange={handleEditChange} className="w-full bg-white/[0.02] border border-white/10 rounded-xl p-3 text-white focus:outline-none focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/50 text-sm" />
                    </div>
                    <div>
                        <label className="block text-xs font-semibold text-gray-400 mb-1 uppercase tracking-wider">Email</label>
                        <input type="email" name="email" value={editForm.email} onChange={handleEditChange} className="w-full bg-white/[0.02] border border-white/10 rounded-xl p-3 text-white focus:outline-none focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/50 text-sm" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-semibold text-gray-400 mb-1 uppercase tracking-wider">Role</label>
                            <select name="role" value={editForm.role} onChange={handleEditChange} className="w-full bg-white/[0.02] border border-white/10 rounded-xl p-3 text-white focus:outline-none focus:border-purple-500/50 text-sm appearance-none">
                                <option value="user" className="bg-[#111111]">Regular User</option>
                                <option value="admin" className="bg-[#111111]">Admin</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-gray-400 mb-1 uppercase tracking-wider">Status</label>
                            <select name="status" value={editForm.status} onChange={handleEditChange} className="w-full bg-white/[0.02] border border-white/10 rounded-xl p-3 text-white focus:outline-none focus:border-purple-500/50 text-sm appearance-none">
                                <option value="active" className="bg-[#111111]">Active</option>
                                <option value="inactive" className="bg-[#111111]">Inactive</option>
                            </select>
                        </div>
                    </div>
                    <div className="flex gap-3 pt-4 border-t border-white/5 mt-4">
                        <button onClick={() => setEditingUser(null)} className="flex-1 bg-white/5 hover:bg-white/10 text-white p-3 rounded-xl font-medium text-sm transition-all">Cancel</button>
                        <button onClick={handleSaveChanges} className="flex-1 bg-purple-600 hover:bg-purple-500 text-white p-3 rounded-xl font-bold text-sm transition-all shadow-[0_0_15px_rgba(168,85,247,0.3)]">Save Changes</button>
                    </div>
                </div>
            </Modal>

            <Modal isOpen={!!deleteUserModal} onClose={() => setDeleteUserModal(null)} title="Delete User" icon={Trash2}>
                <p className="text-gray-400 text-sm mb-6">Are you sure you want to permanently delete <span className="text-white font-bold">{deleteUserModal?.name}</span>? This cannot be undone.</p>
                <div className="flex gap-3">
                    <button onClick={() => setDeleteUserModal(null)} className="flex-1 bg-white/5 hover:bg-white/10 text-white p-3 rounded-xl font-medium text-sm">Cancel</button>
                    <button onClick={confirmDelete} className="flex-1 bg-rose-600 hover:bg-rose-500 text-white p-3 rounded-xl font-bold text-sm shadow-[0_0_15px_rgba(244,63,94,0.3)]">Delete Account</button>
                </div>
            </Modal>
        </div>
    );
}
