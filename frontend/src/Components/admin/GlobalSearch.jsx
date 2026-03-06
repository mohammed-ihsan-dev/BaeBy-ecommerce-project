import React, { useState, useEffect } from 'react';
import { Search } from 'lucide-react';
import SearchModal from './SearchModal';

export default function GlobalSearch() {
    const [isModalOpen, setIsModalOpen] = useState(false);

    useEffect(() => {
        const handleKeyDown = (e) => {
            if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
                e.preventDefault();
                setIsModalOpen(true);
            }
            if (e.key === 'Escape') {
                setIsModalOpen(false);
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, []);

    return (
        <>
            <div
                onClick={() => setIsModalOpen(true)}
                className="hidden sm:flex items-center gap-2 bg-[#111111] px-4 py-2.5 rounded-2xl border border-white/5 w-72 hover:border-purple-500/50 hover:bg-white/[0.02] cursor-pointer transition-all group lg:min-w-[320px]"
            >
                <div className="text-sm text-gray-600 font-medium flex-1">
                    Search users, products, orders...
                </div>
                <div className="flex items-center gap-3">
                    <div className="hidden lg:flex items-center justify-center bg-white/5 rounded px-2 py-0.5 border border-white/5 text-[10px] text-gray-500 font-bold uppercase tracking-widest group-hover:text-purple-400 group-hover:border-purple-500/20 transition-all">
                        <span>{navigator.platform.toUpperCase().includes('MAC') ? '⌘' : 'Ctrl+'}K</span>
                    </div>
                    <button className="p-1 hover:bg-white/10 rounded-lg text-gray-500 group-hover:text-purple-400 transition-colors">
                        <Search size={18} />
                    </button>
                </div>
            </div>

            {/* Mobile Icon */}
            <button
                onClick={() => setIsModalOpen(true)}
                className="flex sm:hidden p-2.5 bg-white/5 border border-white/5 rounded-xl text-gray-400 hover:text-white transition-colors"
            >
                <Search size={20} />
            </button>

            <SearchModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
            />
        </>
    );
}
