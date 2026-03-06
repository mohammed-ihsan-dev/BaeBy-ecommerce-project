import React, { useState } from 'react';
import { Menu, Search, Bell, LogOut, Settings } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import GlobalSearch from './GlobalSearch';


export default function TopNavbar({ isOpen, setIsOpen }) {
    const [showLogout, setShowLogout] = useState(false);
    const navigate = useNavigate();

    const handleLogout = () => {
        localStorage.removeItem("adminToken");
        toast.success("Securely Logged Out");
        navigate("/admin/login");
    };

    return (
        <>
            <div className="sticky top-0 z-40 bg-[#0A0A0B]/80 backdrop-blur-2xl border-b border-white/[0.05] shadow-[0_4px_30px_rgba(0,0,0,0.1)] px-6 py-4 flex items-center justify-between">

                <div className="flex items-center gap-4">
                    <button
                        onClick={() => setIsOpen(!isOpen)}
                        className="md:hidden text-gray-400 hover:text-white p-2 bg-white/5 rounded-xl border border-white/5 transition-colors"
                    >
                        <Menu size={20} />
                    </button>

                    <GlobalSearch />

                </div>

                <div className="flex items-center gap-5">
                    <button className="relative text-gray-400 hover:text-purple-400 transition-colors p-2 bg-white/5 hover:bg-purple-500/10 rounded-xl border border-transparent hover:border-purple-500/20">
                        <Bell size={20} />
                        <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-rose-500 border-2 border-[#0A0A0B] rounded-full shadow-[0_0_10px_rgba(244,63,94,0.5)]"></span>
                    </button>

                    <div className="w-px h-8 bg-white/10 mx-2"></div>

                    <button
                        onClick={() => setShowLogout(true)}
                        className="flex items-center gap-3 p-1 rounded-2xl hover:bg-white/5 border border-transparent hover:border-white/5 transition-all outline-none"
                    >
                        <div className="text-right hidden sm:block">
                            <p className="text-sm font-bold text-white tracking-tight">System Admin</p>
                            <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Root Access</p>
                        </div>
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-600/20 to-pink-600/20 text-purple-400 flex items-center justify-center text-lg font-black border border-purple-500/20 shadow-[0_0_15px_rgba(168,85,247,0.2)]">
                            A
                        </div>
                    </button>
                </div>
            </div>

            <AnimatePresence>
                {showLogout && (
                    <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-[100] flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            className="bg-[#0F0F12] p-8 rounded-[32px] border border-white/10 shadow-2xl max-w-sm w-full relative overflow-hidden text-center"
                        >
                            <div className="absolute -top-32 -right-32 w-64 h-64 bg-rose-500/10 rounded-full blur-[80px] pointer-events-none"></div>

                            <div className="w-16 h-16 rounded-2xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center mx-auto mb-6 text-rose-500 shadow-[0_0_20px_rgba(244,63,94,0.3)]">
                                <LogOut size={28} />
                            </div>

                            <h3 className="text-2xl font-black text-white mb-2">End Session</h3>
                            <p className="text-sm font-medium text-gray-400 mb-8">
                                Are you sure you want to securely disconnect from the administrative workspace?
                            </p>

                            <div className="flex gap-3">
                                <button
                                    onClick={() => setShowLogout(false)}
                                    className="flex-1 bg-white/[0.03] hover:bg-white/[0.08] text-white py-3 rounded-2xl font-bold transition-all border border-white/10 text-sm"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleLogout}
                                    className="flex-1 bg-rose-600 hover:bg-rose-500 shadow-[0_0_20px_rgba(244,63,94,0.4)] text-white py-3 rounded-2xl font-bold transition-all text-sm"
                                >
                                    Confirm Logout
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </>
    );
}
