import React, { useState, useMemo, useEffect } from "react";
import { useNavigate, useParams, useOutletContext, useSearchParams } from "react-router-dom";
import useProducts from "../../hooks/useProducts";
import { useCart } from "../../Context/CartContext";
import { useWishlist } from "../../Context/WishlistContext";
import { FaHeart, FaEye, FaShoppingBag } from "react-icons/fa";
import { useAuth } from "../../Context/AuthContext";
import { formatINR } from "../../utils/formatCurrency";


function AllProducts() {
  const { category } = useParams();
  const { addToCart } = useCart();
  const { wishlist, toggleWishlist } = useWishlist();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { sortType, filterType, priceRange } = useOutletContext();

  const [searchParams, setSearchParams] = useSearchParams();
  const [searchTerm, setSearchTerm] = useState(searchParams.get("keyword") || "");
  const [debouncedSearch, setDebouncedSearch] = useState(searchTerm);

  // Single source of truth for page
  const currentPage = Number(searchParams.get("page")) || 1;
  const productsPerPage = 8;

  // 1. Debounce Search Term
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchTerm);
    }, 400);
    return () => clearTimeout(handler);
  }, [searchTerm]);

  // 2. Sync Debounced Search to URL & Reset Page
  useEffect(() => {
    const currentSearchInUrl = searchParams.get("keyword") || "";
    if (debouncedSearch !== currentSearchInUrl) {
      setSearchParams(prev => {
        const params = new URLSearchParams(prev);
        if (debouncedSearch) params.set("keyword", debouncedSearch);
        else params.delete("keyword");
        params.set("page", "1"); // Reset to page 1 on new search
        return params;
      }, { replace: true });
    }
  }, [debouncedSearch, setSearchParams]);

  // 3. Stable Price Filter values
  const prices = useMemo(() => ({
    max: filterType === "1800to3600" ? 3600 : (filterType === "under1800" ? 1800 : (priceRange || undefined)),
    min: filterType === "1800to3600" ? 1800 : (filterType === "above3600" ? 3600 : undefined)
  }), [filterType, priceRange]);


  const { products, totalPages, loading, error } = useProducts({
    category,
    keyword: debouncedSearch,
    page: currentPage,
    limit: productsPerPage,
    sort: sortType,
    maxPrice: prices.max,
    minPrice: prices.min,
  });

  const [visible, setVisible] = useState(false);

  useEffect(() => {
    setVisible(true);
  }, []);

  // 4. Scroll to top on Page change
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [currentPage]);

  const handlePageChange = (page) => {
    if (page < 1 || page > totalPages) return;

    setSearchParams(prev => {
      const params = new URLSearchParams(prev);
      params.set("page", page.toString());
      return params;
    });
  };

  return (
    <section className={`transition-opacity duration-1000 ${visible ? 'opacity-100' : 'opacity-0'}`}>
      <div className="flex flex-col md:flex-row justify-between items-center mb-12 gap-6">
        <h2 className="text-4xl font-extrabold text-gray-900 tracking-tight">
          {category ? `${category.charAt(0).toUpperCase() + category.slice(1)}` : "All Collections"}
          <span className="block w-12 h-1 bg-pink-500 mt-2"></span>
        </h2>

        <div className="relative group w-full max-w-sm">
          <input
            type="text"
            placeholder="Search our treasures..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-white border border-gray-100 rounded-2xl shadow-sm focus:outline-none focus:ring-2 focus:ring-pink-200 transition-all text-gray-700 font-medium"
          />
          <FaShoppingBag className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-hover:text-pink-400 transition-colors" />
        </div>
      </div>

      {loading && !products.length ? (
        <div className="flex justify-center items-center py-20">
          <div className="w-16 h-16 border-4 border-pink-200 border-t-pink-500 rounded-full animate-spin"></div>
        </div>
      ) : error ? (
        <div className="text-center py-20">
          <p className="text-xl text-red-500 font-semibold">{error}</p>
          <button onClick={() => window.location.reload()} className="mt-4 px-6 py-2 bg-pink-500 text-white rounded-full">Retry</button>
        </div>
      ) : products.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-3xl shadow-sm border border-gray-50">
          <p className="text-gray-400 text-lg">We couldn't find any products matching your selection.</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-8 gap-y-12">
            {products.map((product) => {
              const isWishlisted = wishlist.some((item) => item.id === product.id);
              const name = product.name || product.title;

              return (
                <div
                  key={product.id}
                  className="group relative flex flex-col bg-white rounded-[2rem] overflow-hidden transition-all duration-500 hover:shadow-2xl hover:-translate-y-2 border border-gray-50"
                >
                  <div className="absolute top-4 left-4 z-10">
                    <span className="px-3 py-1 bg-white/90 backdrop-blur-sm text-[10px] font-bold uppercase tracking-widest text-pink-600 rounded-full shadow-sm">
                      {product.category || 'Essential'}
                    </span>
                  </div>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      user ? toggleWishlist(product) : navigate("/login");
                    }}
                    className={`absolute top-4 right-4 z-10 w-10 h-10 rounded-full flex items-center justify-center backdrop-blur-md transition-all duration-300 ${isWishlisted
                      ? "bg-pink-500 text-white shadow-pink-200 shadow-xl"
                      : "bg-white/80 text-gray-400 hover:text-pink-500 hover:bg-white"
                      }`}
                  >
                    <FaHeart className={isWishlisted ? "animate-bounce" : "transition-transform active:scale-150"} />
                  </button>

                  <div className="relative h-72 overflow-hidden cursor-pointer" onClick={() => navigate(`/product/${product.id}`)}>
                    <img
                      src={product.image}
                      alt={name}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    />

                    <div className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/product/${product.id}`);
                        }}
                        className="w-12 h-12 bg-white rounded-full flex items-center justify-center text-gray-800 shadow-xl transform translate-y-4 group-hover:translate-y-0 transition-all duration-300 hover:bg-pink-500 hover:text-white"
                      >
                        <FaEye />
                      </button>
                    </div>
                  </div>

                  <div className="p-6 flex flex-col items-center">
                    <h3 className="text-center font-bold text-gray-800 text-lg mb-1 line-clamp-1 group-hover:text-pink-600 transition-colors">
                      {name}
                    </h3>
                    <div className="flex items-center gap-2 mb-4">
                      <span className="text-xs text-gray-400 line-through tracking-wider">{formatINR(product.price * 1.2)}</span>
                      <span className="text-xl font-black text-gray-900 tracking-tight">{formatINR(product.price)}</span>
                    </div>


                    <button
                      onClick={() => {
                        user ? addToCart(product) : navigate("/login");
                      }}
                      className="w-full py-3 bg-gray-900 border-2 border-gray-900 text-white font-bold text-xs uppercase tracking-widest rounded-xl transition-all duration-300 hover:bg-transparent hover:text-gray-900 active:scale-95"
                    >
                      Add to Bag
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="flex justify-center items-center gap-6 mt-20">
            <button
              onClick={() => currentPage > 1 && handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className={`p-3 rounded-full border transition-all ${currentPage === 1
                ? "border-gray-100 text-gray-300"
                : "border-gray-200 text-gray-600 hover:bg-gray-100"
                }`}
            >
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
              </svg>
            </button>

            <span className="text-sm font-bold text-gray-500 tracking-widest uppercase">
              Page <span className="text-gray-900">{currentPage}</span> of {totalPages}
            </span>

            <button
              onClick={() => currentPage < totalPages && handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className={`p-3 rounded-full border transition-all ${currentPage === totalPages
                ? "border-gray-100 text-gray-300"
                : "border-gray-200 text-gray-600 hover:bg-gray-100"
                }`}
            >
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </>
      )}
    </section>
  );
}

export default AllProducts;
