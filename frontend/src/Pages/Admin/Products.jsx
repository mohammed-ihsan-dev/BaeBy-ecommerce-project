import React, { useEffect, useState } from "react";
import { Plus, Trash2, Loader2, Edit2, Search, Image as ImageIcon, ChevronLeft, ChevronRight } from "lucide-react";
import toast from "react-hot-toast";
import { getProducts, createProduct, updateProduct, deleteProduct } from "../../api/adminApi";
import { convertUSDToINR } from "../../utils/currencyFormatter";
import DataTable from "../../Components/admin/DataTable";
import Modal from "../../Components/admin/Modal";

export default function Products() {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showAddModal, setShowAddModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [newProduct, setNewProduct] = useState({ title: "", category: "", price: "", image: "", description: "" });
    const [editProductData, setEditProductData] = useState(null);
    const [productToDelete, setProductToDelete] = useState(null);
    const [deleting, setDeleting] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalProducts, setTotalProducts] = useState(0);
    const itemsPerPage = 8;

    const fetchProducts = async () => {
        setLoading(true);
        try {
            const res = await getProducts({
                page: currentPage,
                limit: itemsPerPage,
                search: searchQuery
            });
            setProducts(res.data?.data || []);
            setTotalPages(res.data?.totalPages || 1);
            setTotalProducts(res.data?.totalProducts || 0);
        } catch (err) {
            toast.error(err.response?.data?.message || "Failed to fetch products");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProducts();
    }, [currentPage, searchQuery]);

    const handlePageChange = (p) => {
        if (p >= 1 && p <= totalPages) setCurrentPage(p);
    };

    const confirmDeleteProduct = async () => {
        if (!productToDelete) return;
        setDeleting(true);
        const pid = productToDelete.id || productToDelete._id;
        try {
            await deleteProduct(pid);
            toast.success("Product deleted");
            setProductToDelete(null);
            fetchProducts();
        } catch (err) {
            toast.error(err.response?.data?.message || "Failed to delete product");
        } finally {
            setDeleting(false);
        }
    };

    const handleAddProduct = async () => {
        const { title, category, price } = newProduct;
        if (!title || !category || !price) { toast.error("Title, category and price are required"); return; }
        try {
            const payload = { title, description: newProduct.description || "", image: newProduct.image || "https://placehold.co/400x400?text=No+Image", price: parseFloat(price), category };
            await createProduct(payload);
            toast.success("Product added");
            setShowAddModal(false);
            setNewProduct({ title: "", category: "", price: "", image: "", description: "" });
            fetchProducts();
        } catch (err) {
            toast.error(err.response?.data?.message || "Failed to add product");
        }
    };

    const handleEditSave = async () => {
        const { title, category, price } = editProductData;
        if (!title || !category || !price) { toast.error("Title, category and price are required"); return; }
        const pid = editProductData.id || editProductData._id;
        try {
            const payload = { title, description: editProductData.description || "", image: editProductData.image || "https://placehold.co/400x400?text=No+Image", price: parseFloat(price), category };
            await updateProduct(pid, payload);
            toast.success("Product updated");
            setShowEditModal(false);
            fetchProducts();
        } catch (err) {
            toast.error(err.response?.data?.message || "Failed to update product");
        }
    };

    return (
        <div className="max-w-7xl mx-auto space-y-8 pb-12">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div>
                    <h1 className="text-3xl font-black text-white tracking-tight mb-1">Catalog Management</h1>
                    <p className="text-gray-400 font-medium">Add, edit, and organize your products.</p>
                </div>
                <div className="flex flex-col sm:flex-row items-center gap-4 w-full md:w-auto">
                    <div className="relative w-full sm:w-64">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 w-4 h-4" />
                        <input
                            type="text" placeholder="Search catalog..." value={searchQuery}
                            onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
                            className="w-full bg-[#111111]/80 border border-white/[0.05] pl-10 pr-4 py-2.5 rounded-2xl text-gray-200 focus:outline-none focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/50 transition-all text-sm"
                        />
                    </div>
                    <button
                        onClick={() => setShowAddModal(true)}
                        className="w-full sm:w-auto flex items-center justify-center gap-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:opacity-90 px-5 py-2.5 rounded-2xl text-white text-sm font-bold shadow-[0_0_15px_rgba(168,85,247,0.3)] transition-all"
                    >
                        <Plus size={18} /> New Product
                    </button>
                </div>
            </div>

            <DataTable
                isLoading={loading}
                emptyMessage={searchQuery ? "No products match your search." : "Your catalog is empty."}
                headers={[{ label: "Product" }, { label: "Category" }, { label: "Price", align: "right" }, { label: "Actions", align: "right" }]}
            >
                {products.map((product) => {
                    const pid = product.id || product._id;
                    return (
                        <tr key={pid} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors group">
                            <td className="py-4 pr-4">
                                <div className="flex items-center gap-4">
                                    <div className="relative w-14 h-14 rounded-2xl border border-white/10 overflow-hidden bg-black/50 shrink-0">
                                        <img
                                            src={product.image || "https://placehold.co/400x300?text=No+Image"}
                                            alt={product.title}
                                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                            onError={(e) => { e.target.src = "https://placehold.co/400x300?text=No+Image"; }}
                                        />
                                    </div>
                                    <div>
                                        <p className="text-sm font-bold text-gray-200 line-clamp-1 max-w-xs">{product.title}</p>
                                        <p className="text-xs text-gray-500 mt-1 truncate max-w-xs">{product.description || "No description."}</p>
                                    </div>
                                </div>
                            </td>
                            <td className="py-4 pr-4">
                                <span className="text-sm font-medium text-gray-400 bg-white/5 px-3 py-1 rounded-lg border border-white/5">{product.category}</span>
                            </td>
                            <td className="py-4 pr-4 text-right">
                                <p className="text-sm font-black text-purple-400">{convertUSDToINR(product.price || 0)}</p>
                            </td>
                            <td className="py-4 text-right">
                                <div className="flex justify-end gap-2">
                                    <button onClick={() => { setEditProductData(product); setShowEditModal(true); }} className="p-2 bg-white/5 hover:bg-white/10 rounded-xl text-gray-400 hover:text-white transition-colors">
                                        <Edit2 size={16} />
                                    </button>
                                    <button onClick={() => setProductToDelete(product)} className="p-2 bg-rose-500/5 hover:bg-rose-500/20 text-rose-400 rounded-xl transition-colors">
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            </td>
                        </tr>
                    );
                })}
            </DataTable>

            {totalPages > 1 && (
                <div className="flex items-center justify-between p-4 bg-[#111111]/50 rounded-2xl border border-white/5 shadow-lg">
                    <div className="text-xs font-bold text-gray-500 uppercase tracking-widest hidden sm:block">
                        Showing {(currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, totalProducts)} of {totalProducts} records
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

            <Modal isOpen={showAddModal} onClose={() => setShowAddModal(false)} title="Add New Product" icon={Plus}>
                <ProductForm product={newProduct} setProduct={setNewProduct} onSave={handleAddProduct} onCancel={() => setShowAddModal(false)} submitLabel="Create Product" />
            </Modal>

            <Modal isOpen={showEditModal && !!editProductData} onClose={() => setShowEditModal(false)} title="Edit Product" icon={Edit2}>
                <ProductForm product={editProductData} setProduct={setEditProductData} onSave={handleEditSave} onCancel={() => setShowEditModal(false)} submitLabel="Save Changes" />
            </Modal>

            <Modal isOpen={!!productToDelete} onClose={() => setProductToDelete(null)} title="Delete Product" icon={Trash2}>
                <p className="text-gray-400 text-sm mb-6">Permanently delete <span className="text-white font-bold">{productToDelete?.title}</span>? This cannot be undone.</p>
                <div className="flex gap-3">
                    <button onClick={() => setProductToDelete(null)} className="flex-1 bg-white/5 hover:bg-white/10 text-white p-3 rounded-xl font-medium text-sm">Cancel</button>
                    <button onClick={confirmDeleteProduct} disabled={deleting} className="flex-1 flex justify-center items-center bg-rose-600 hover:bg-rose-500 text-white p-3 rounded-xl font-bold text-sm shadow-[0_0_15px_rgba(244,63,94,0.3)] disabled:opacity-60">
                        {deleting ? <Loader2 size={16} className="animate-spin" /> : "Delete"}
                    </button>
                </div>
            </Modal>
        </div>
    );
}

function ProductForm({ product, setProduct, onSave, onCancel, submitLabel }) {
    const handleChange = (e) => setProduct(prev => ({ ...prev, [e.target.name]: e.target.value }));
    return (
        <div className="space-y-4">
            <div>
                <label className="block text-xs font-semibold text-gray-400 mb-1 uppercase tracking-wider">Title *</label>
                <input name="title" value={product?.title || ""} onChange={handleChange} className="w-full bg-white/[0.02] border border-white/10 rounded-xl p-3 text-white focus:outline-none focus:border-purple-500/50 text-sm" />
            </div>
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="block text-xs font-semibold text-gray-400 mb-1 uppercase tracking-wider">Category *</label>
                    <input name="category" value={product?.category || ""} onChange={handleChange} className="w-full bg-white/[0.02] border border-white/10 rounded-xl p-3 text-white focus:outline-none focus:border-purple-500/50 text-sm" />
                </div>
                <div>
                    <label className="block text-xs font-semibold text-gray-400 mb-1 uppercase tracking-wider">Price INR *</label>
                    <input type="number" name="price" value={product?.price || ""} onChange={handleChange} className="w-full bg-white/[0.02] border border-white/10 rounded-xl p-3 text-white focus:outline-none focus:border-purple-500/50 text-sm" />
                </div>
            </div>
            <div className="relative">
                <label className="block text-xs font-semibold text-gray-400 mb-1 uppercase tracking-wider">Image URL</label>
                <input name="image" value={product?.image || ""} onChange={handleChange} placeholder="https://..." className="w-full bg-white/[0.02] border border-white/10 rounded-xl p-3 text-white focus:outline-none focus:border-purple-500/50 text-sm pr-10" />
                <ImageIcon className="absolute right-4 top-9 text-gray-600 w-4 h-4 pointer-events-none" />
            </div>
            <div>
                <label className="block text-xs font-semibold text-gray-400 mb-1 uppercase tracking-wider">Description</label>
                <textarea name="description" value={product?.description || ""} onChange={handleChange} rows="3" className="w-full bg-white/[0.02] border border-white/10 rounded-xl p-3 text-white focus:outline-none focus:border-purple-500/50 resize-none text-sm" />
            </div>
            <div className="flex gap-3 pt-4 border-t border-white/5 mt-4">
                <button onClick={onCancel} className="flex-1 bg-white/5 hover:bg-white/10 text-white p-3 rounded-xl font-medium text-sm">Cancel</button>
                <button onClick={onSave} className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 hover:opacity-90 text-white p-3 rounded-xl font-bold text-sm shadow-[0_0_15px_rgba(168,85,247,0.3)]">{submitLabel}</button>
            </div>
        </div>
    );
}
