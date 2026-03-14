import React, { useState, useEffect, useRef } from "react";
import { Menu, Bell, LogOut } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { useAuth } from "../../Context/AuthContext";
import GlobalSearch from "./GlobalSearch";
import { getUnreadCount } from "../../api/adminApi";

export default function TopNavbar({ isOpen, setIsOpen }) {
  const [showLogout, setShowLogout] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  const intervalRef = useRef(null); // prevents multiple intervals
  const navigate = useNavigate();
  const { logout } = useAuth();

  const fetchUnreadCount = async () => {
    try {
      const res = await getUnreadCount();
      setUnreadCount(res.data?.count || 0);
    } catch (err) {
      console.error("Failed to fetch unread count:", err);
    }
  };

  useEffect(() => {
    // fetch immediately
    fetchUnreadCount();

    // prevent multiple intervals
    if (!intervalRef.current) {
      intervalRef.current = setInterval(() => {
        fetchUnreadCount();
      }, 600000); // 30 seconds
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, []);

  const handleLogout = async () => {
    await logout();
    toast.success("Securely Logged Out");
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
          <button
            onClick={() => navigate("/admin/notifications")}
            className="relative text-gray-400 hover:text-purple-400 transition-colors p-2 bg-white/5 hover:bg-purple-500/10 rounded-xl border border-transparent hover:border-purple-500/20"
          >
            <Bell size={20} />

            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 bg-rose-500 border-2 border-[#0A0A0B] rounded-full text-[10px] font-bold text-white flex items-center justify-center">
                {unreadCount > 9 ? "9+" : unreadCount}
              </span>
            )}
          </button>

          <div className="w-px h-8 bg-white/10 mx-2"></div>

          <button
            onClick={() => setShowLogout(true)}
            className="flex items-center gap-3 p-1 rounded-2xl hover:bg-white/5 border border-transparent hover:border-white/5 transition-all"
          >
            <div className="text-right hidden sm:block">
              <p className="text-sm font-bold text-white tracking-tight">
                System Admin
              </p>
              <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">
                Root Access
              </p>
            </div>

            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-600/20 to-pink-600/20 text-purple-400 flex items-center justify-center text-lg font-black border border-purple-500/20">
              A
            </div>
          </button>
        </div>
      </div>

      <AnimatePresence>
        {showLogout && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-[100] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-[#0F0F12] p-8 rounded-[32px] border border-white/10 shadow-2xl max-w-sm w-full text-center"
            >
              <div className="w-16 h-16 rounded-2xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center mx-auto mb-6 text-rose-500">
                <LogOut size={28} />
              </div>

              <h3 className="text-2xl font-black text-white mb-2">
                End Session
              </h3>

              <p className="text-sm text-gray-400 mb-8">
                Are you sure you want to securely disconnect?
              </p>

              <div className="flex gap-3">
                <button
                  onClick={() => setShowLogout(false)}
                  className="flex-1 bg-white/[0.03] hover:bg-white/[0.08] text-white py-3 rounded-2xl font-bold border border-white/10 text-sm"
                >
                  Cancel
                </button>

                <button
                  onClick={handleLogout}
                  className="flex-1 bg-rose-600 hover:bg-rose-500 text-white py-3 rounded-2xl font-bold text-sm"
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