import React from "react";
import { Link, useLocation } from "react-router-dom";
import { LayoutDashboard, Users, Package, ShoppingCart } from "lucide-react";
import { motion } from "framer-motion";

export default function Sidebar({ isOpen, setIsOpen }) {
    const location = useLocation();

    const navItems = [
        { path: "/admin", icon: LayoutDashboard, label: "Overview" },
        { path: "/admin/users", icon: Users, label: "Users" },
        { path: "/admin/products", icon: Package, label: "Products" },
        { path: "/admin/orders", icon: ShoppingCart, label: "Orders" },
    ];

    return (
        <>
            <div
                className={`fixed md:relative top-0 left-0 h-screen w-64 bg-[#0A0A0B]/95 backdrop-blur-3xl border-r border-white/5 flex flex-col transition-transform duration-300 z-50 shadow-2xl ${isOpen ? "translate-x-0" : "-translate-x-full"
                    } md:translate-x-0`}
            >
                <div className="p-6">
                    <Link to="/admin" className="flex items-center gap-3 group">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center text-white font-black text-xl shadow-[0_0_20px_rgba(168,85,247,0.4)] group-hover:scale-105 transition-transform duration-300">
                            B
                        </div>
                        <span className="text-2xl font-black text-white tracking-tight">
                            BaeBy<span className="text-purple-500">Admin</span>
                        </span>
                    </Link>
                </div>

                <nav className="flex-1 px-4 mt-8 space-y-2">
                    {navItems.map((item) => {
                        const isActive = location.pathname === item.path;
                        const Icon = item.icon;

                        return (
                            <Link
                                key={item.path}
                                to={item.path}
                                onClick={() => window.innerWidth < 768 && setIsOpen(false)}
                                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 relative group overflow-hidden ${isActive
                                        ? "text-white font-medium"
                                        : "text-gray-400 hover:text-white hover:bg-white/[0.03]"
                                    }`}
                            >
                                {isActive && (
                                    <motion.div
                                        layoutId="activeTab"
                                        className="absolute inset-0 bg-gradient-to-r from-purple-600/10 to-transparent border-l-4 border-purple-500 rounded-xl"
                                        initial={false}
                                        transition={{ type: "spring", stiffness: 300, damping: 30 }}
                                    />
                                )}

                                <Icon size={18} className={`relative z-10 transition-colors ${isActive ? "text-purple-400 font-bold" : "group-hover:text-purple-400"}`} />
                                <span className="relative z-10">{item.label}</span>
                            </Link>
                        );
                    })}
                </nav>

                <div className="p-6 border-t border-white/5">
                    <div className="bg-[#111111] p-4 rounded-2xl border border-white/5 relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/10 rounded-full blur-[40px] pointer-events-none"></div>
                        <p className="text-xs text-gray-500 font-semibold uppercase tracking-widest relative z-10 mb-1">Status</p>
                        <div className="flex items-center gap-2 relative z-10">
                            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_10px_rgba(16,185,129,0.5)]"></span>
                            <span className="text-xs text-emerald-400 font-medium">Systems Operational</span>
                        </div>
                    </div>
                </div>
            </div>

            {isOpen && (
                <div
                    onClick={() => setIsOpen(false)}
                    className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 md:hidden transition-opacity"
                />
            )}
        </>
    );
}
