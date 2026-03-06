import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Users, Package, ShoppingCart, X, CornerDownLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { getUsers, getProducts, getOrders } from '../../api/adminApi';

export default function SearchModal({ isOpen, onClose }) {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState({ users: [], products: [], orders: [] });
    const [loading, setLoading] = useState(false);
    const [data, setData] = useState({ users: [], products: [], orders: [] });
    const inputRef = useRef(null);
    const navigate = useNavigate();

    useEffect(() => {
        if (isOpen) {
            inputRef.current?.focus();
            fetchAllData();
        } else {
            setQuery('');
        }
    }, [isOpen]);

    const fetchAllData = async () => {
        setLoading(true);
        try {
            const [usersRes, productsRes, ordersRes] = await Promise.all([
                getUsers(),
                getProducts(),
                getOrders()
            ]);
            setData({
                users: usersRes.data?.data || [],
                products: productsRes.data?.data || [],
                orders: ordersRes.data?.data || []
            });
        } catch (err) {
            console.error("Search data fetch failed:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (!query.trim()) {
            setResults({ users: [], products: [], orders: [] });
            return;
        }

        const q = query.toLowerCase();
        setResults({
            users: data.users.filter(u => u.name?.toLowerCase().includes(q) || u.email?.toLowerCase().includes(q)).slice(0, 4),
            products: data.products.filter(p => p.title?.toLowerCase().includes(q) || p.category?.toLowerCase().includes(q)).slice(0, 4),
            orders: data.orders.filter(o =>
                (o.orderId || o.id || o._id)?.toString().toLowerCase().includes(q) ||
                o.user?.name?.toLowerCase().includes(q)
            ).slice(0, 4)
        });
    }, [query, data]);

    const handleNavigate = (path) => {
        navigate(path);
        onClose();
    };

    const hasResults = results.users.length > 0 || results.products.length > 0 || results.orders.length > 0;

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[100] flex items-start justify-center pt-[10vh] px-4 sm:px-6">
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-[#050505]/80 backdrop-blur-md"
                    />

                    {/* Modal Content */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: -20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: -20 }}
                        className="relative w-full max-w-2xl bg-[#0F0F12] border border-white/10 rounded-3xl shadow-[0_0_50px_rgba(0,0,0,0.5)] overflow-hidden"
                    >
                        <div className="p-4 border-b border-white/5 flex items-center gap-3">
                            <Search size={20} className="text-gray-500" />
                            <input
                                ref={inputRef}
                                type="text"
                                value={query}
                                onChange={(e) => setQuery(e.target.value)}
                                placeholder="Search users, products, orders..."
                                className="flex-1 bg-transparent text-lg text-white placeholder:text-gray-600 outline-none"
                            />
                            <div className="flex items-center gap-2">
                                {query && (
                                    <button
                                        onClick={() => setQuery('')}
                                        className="p-1 hover:bg-white/10 rounded-lg text-gray-500 transition-colors"
                                    >
                                        <X size={16} />
                                    </button>
                                )}
                                <div className="hidden sm:flex items-center gap-1.5 px-2 py-1 bg-white/5 rounded-lg border border-white/5 text-[10px] font-bold text-gray-500 uppercase tracking-widest">
                                    <span>Esc</span>
                                </div>
                            </div>
                        </div>

                        <div className="max-h-[60vh] overflow-y-auto p-2 scrollbar-thin scrollbar-thumb-white/10">
                            {!query ? (
                                <div className="py-12 text-center">
                                    <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-white/5 text-gray-500">
                                        <Search size={24} />
                                    </div>
                                    <p className="text-gray-400 font-medium">Type to search across your workspace</p>
                                    <p className="text-xs text-gray-600 mt-1 uppercase tracking-widest font-bold">Quickly find users, products, and order status</p>
                                </div>
                            ) : loading ? (
                                <div className="py-12 flex flex-col items-center justify-center gap-3">
                                    <div className="w-6 h-6 border-2 border-purple-500/30 border-t-purple-500 rounded-full animate-spin" />
                                    <p className="text-xs text-gray-500 font-bold uppercase tracking-widest">Warming search engine...</p>
                                </div>
                            ) : !hasResults ? (
                                <div className="py-12 text-center text-gray-500">
                                    <p className="font-medium">No results found for "{query}"</p>
                                    <p className="text-xs mt-1 uppercase tracking-widest font-bold">Try searching for something else</p>
                                </div>
                            ) : (
                                <div className="space-y-4 p-2">
                                    {results.users.length > 0 && (
                                        <div>
                                            <h3 className="px-3 py-2 text-[10px] font-bold text-gray-500 uppercase tracking-widest">Users</h3>
                                            {results.users.map(user => (
                                                <button
                                                    key={user.id || user._id}
                                                    onClick={() => handleNavigate('/admin/users')}
                                                    className="w-full flex items-center gap-3 p-3 hover:bg-white/5 rounded-2xl transition-all group"
                                                >
                                                    <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center border border-blue-500/20 group-hover:scale-110 transition-transform">
                                                        <Users size={18} />
                                                    </div>
                                                    <div className="text-left">
                                                        <p className="text-sm font-bold text-gray-200">{user.name}</p>
                                                        <p className="text-xs text-gray-500">{user.email}</p>
                                                    </div>
                                                    <CornerDownLeft size={14} className="ml-auto text-gray-700 opacity-0 group-hover:opacity-100 transition-opacity" />
                                                </button>
                                            ))}
                                        </div>
                                    )}

                                    {results.products.length > 0 && (
                                        <div>
                                            <h3 className="px-3 py-2 text-[10px] font-bold text-gray-500 uppercase tracking-widest">Products</h3>
                                            {results.products.map(product => (
                                                <button
                                                    key={product.id || product._id}
                                                    onClick={() => handleNavigate('/admin/products')}
                                                    className="w-full flex items-center gap-3 p-3 hover:bg-white/5 rounded-2xl transition-all group"
                                                >
                                                    <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center border border-emerald-500/20 group-hover:scale-110 transition-transform">
                                                        <Package size={18} />
                                                    </div>
                                                    <div className="text-left">
                                                        <p className="text-sm font-bold text-gray-200">{product.title}</p>
                                                        <p className="text-xs text-gray-500">{product.category}</p>
                                                    </div>
                                                    <CornerDownLeft size={14} className="ml-auto text-gray-700 opacity-0 group-hover:opacity-100 transition-opacity" />
                                                </button>
                                            ))}
                                        </div>
                                    )}

                                    {results.orders.length > 0 && (
                                        <div>
                                            <h3 className="px-3 py-2 text-[10px] font-bold text-gray-500 uppercase tracking-widest">Orders</h3>
                                            {results.orders.map(order => (
                                                <button
                                                    key={order.id || order._id}
                                                    onClick={() => handleNavigate('/admin/orders')}
                                                    className="w-full flex items-center gap-3 p-3 hover:bg-white/5 rounded-2xl transition-all group"
                                                >
                                                    <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center border border-purple-500/20 group-hover:scale-110 transition-transform">
                                                        <ShoppingCart size={18} />
                                                    </div>
                                                    <div className="text-left">
                                                        <p className="text-sm font-bold text-gray-200">Order #{(order.id || order._id)?.toString().slice(-8).toUpperCase()}</p>
                                                        <p className="text-xs text-gray-500">{order.user?.name || 'Guest'}</p>
                                                    </div>
                                                    <CornerDownLeft size={14} className="ml-auto text-gray-700 opacity-0 group-hover:opacity-100 transition-opacity" />
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>

                        <div className="p-3 bg-white/[0.02] border-t border-white/5 flex items-center justify-between">
                            <div className="flex gap-4">
                                <div className="flex items-center gap-1.5 text-[10px] font-bold text-gray-600 uppercase tracking-widest">
                                    <CornerDownLeft size={12} />
                                    <span>Select</span>
                                </div>
                                <div className="flex items-center gap-1.5 text-[10px] font-bold text-gray-600 uppercase tracking-widest">
                                    <span className="bg-white/5 px-1 rounded border border-white/10 text-[8px] mt-0.5">↑↓</span>
                                    <span>Navigate</span>
                                </div>
                            </div>
                            <p className="text-[10px] font-bold text-gray-700 uppercase tracking-widest">Search Console • Frontend Driven</p>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
