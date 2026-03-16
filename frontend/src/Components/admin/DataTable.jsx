import React from 'react';
import { motion } from 'framer-motion';

export default function DataTable({ headers, children, emptyMessage, isLoading }) {
    if (isLoading) {
        return (
            <div className="flex justify-center items-center py-32">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500 shadow-[0_0_15px_rgba(168,85,247,0.5)]" />
            </div>
        );
    }

    if (React.Children.count(children) === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-20 text-gray-500 bg-[#111111]/50 backdrop-blur-xl rounded-3xl border border-white/[0.05]">
                <p className="text-xl font-medium text-gray-400">{emptyMessage || "No data available."}</p>
            </div>
        );
    }

    return (
        <div className="bg-[#111111]/80 backdrop-blur-2xl rounded-3xl p-6 border border-white/[0.05] shadow-2xl relative overflow-hidden">
            <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl pointer-events-none"></div>

            <div className="overflow-x-auto relative z-10 custom-scrollbar">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="text-gray-400 text-xs border-b border-white/10 uppercase tracking-widest font-bold">
                            {headers.map((header, idx) => (
                                <th key={idx} className={`pb-4 pr-4 ${header.align ? `text-${header.align}` : ''}`}>
                                    {header.label}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <motion.tbody
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ staggerChildren: 0.1 }}
                    >
                        {children} 
                    </motion.tbody>
                </table>
            </div>
        </div>
    );
}
