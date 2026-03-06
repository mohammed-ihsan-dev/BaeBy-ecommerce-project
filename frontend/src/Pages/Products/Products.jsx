import React, { useEffect, useState } from "react";
import { Outlet, useSearchParams, NavLink } from "react-router-dom";
import { FaFilter, FaSortAmountDown, FaChevronRight } from "react-icons/fa";

function Products() {
  const [searchParams, setSearchParams] = useSearchParams();

  const [sortType, setSortType] = useState(searchParams.get("sort") || null);
  const [filterType, setFilterType] = useState(searchParams.get("filter") || null);
  const [priceRange, setPriceRange] = useState(10000);


  const categories = [
    { name: "All Collections", path: "/products" },
    { name: "Clothes", path: "/products/clothes" },
    { name: "Toys", path: "/products/toys" },
    { name: "Skin Care", path: "/products/skincare" },
  ];

  const handleSortChange = (type) => {
    setSortType(type === "default" ? null : type);
    setSearchParams((prev) => {
      const params = new URLSearchParams(prev);
      if (type === "default") params.delete("sort");
      else params.set("sort", type);
      return params;
    });
  };

  const handleFilterChange = (filter) => {
    setFilterType(filter === "default" ? null : filter);
    setSearchParams((prev) => {
      const params = new URLSearchParams(prev);
      if (filter === "default") params.delete("filter");
      else params.set("filter", filter);
      return params;
    });
  };

  useEffect(() => {
    const savedSort = searchParams.get("sort");
    const savedFilter = searchParams.get("filter");
    setSortType(savedSort || null);
    setFilterType(savedFilter || null);
  }, [searchParams]);

  return (
    <div className="min-h-screen bg-[#fafafa] pt-24 pb-20">
      <div className="max-w-[1440px] mx-auto px-6 lg:px-12">
        <div className="flex flex-col lg:flex-row gap-12">

          {/* ----- LEFT SIDEBAR (Desktop) ----- */}
          <aside className="hidden lg:block w-72 flex-shrink-0 space-y-10 sticky top-32 h-fit">

            {/* Categories */}
            <div>
              <h3 className="text-xs font-black uppercase tracking-[0.2em] text-gray-400 mb-6 flex items-center gap-2">
                <span className="w-4 h-px bg-gray-300"></span> Categories
              </h3>
              <ul className="space-y-4">
                {categories.map((cat) => (
                  <li key={cat.path}>
                    <NavLink
                      to={cat.path}
                      end={cat.path === "/products"}
                      className={({ isActive }) =>
                        `flex items-center justify-between group transition-all duration-300 ${isActive ? "text-pink-600 font-bold" : "text-gray-500 hover:text-gray-900"
                        }`
                      }
                    >
                      <span className="text-sm">{cat.name}</span>
                      <FaChevronRight className="text-[10px] opacity-0 group-hover:opacity-100 transition-all -translate-x-2 group-hover:translate-x-0" />
                    </NavLink>
                  </li>
                ))}
              </ul>
            </div>

            {/* Price Filter (UI Only) */}
            <div>
              <h3 className="text-xs font-black uppercase tracking-[0.2em] text-gray-400 mb-6 flex items-center gap-2">
                <span className="w-4 h-px bg-gray-300"></span> Filter by Price
              </h3>
              <div className="space-y-4">
                <input
                  type="range"
                  min="0"
                  max="10000"
                  step="100"
                  value={priceRange}
                  onChange={(e) => setPriceRange(e.target.value)}
                  className="w-full h-1 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-pink-500"
                />
                <div className="flex justify-between text-xs font-bold text-gray-600 uppercase tracking-widest">
                  <span>₹0</span>
                  <span className="text-pink-600">Up to ₹{new Intl.NumberFormat('en-IN').format(priceRange)}</span>
                </div>

                <div className="grid grid-cols-1 gap-2 pt-2">
                  {[
                    { label: "All Prices", value: "default" },
                    { label: "Under ₹1,800", value: "under1800" },
                    { label: "₹1,800 - ₹3,600", value: "1800to3600" },
                    { label: "Above ₹3,600", value: "above3600" },
                  ].map((opt) => (

                    <button
                      key={opt.value}
                      onClick={() => handleFilterChange(opt.value)}
                      className={`text-left text-xs py-2 px-3 rounded-lg transition-all ${filterType === opt.value || (filterType === null && opt.value === "default")
                        ? "bg-pink-50 text-pink-600 font-bold"
                        : "text-gray-500 hover:bg-gray-50"
                        }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Sort Options */}
            <div>
              <h3 className="text-xs font-black uppercase tracking-[0.2em] text-gray-400 mb-6 flex items-center gap-2">
                <span className="w-4 h-px bg-gray-300"></span> Sort By
              </h3>
              <div className="flex flex-col gap-2">
                {[
                  { label: "Default", value: "default" },
                  { label: "Price: Low to High", value: "lowToHigh" },
                  { label: "Price: High to Low", value: "highToLow" },
                  { label: "Name: A-Z", value: "name-az" },
                ].map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => handleSortChange(opt.value)}
                    className={`text-left text-xs py-2 px-3 rounded-lg transition-all ${sortType === opt.value || (sortType === null && opt.value === "default")
                      ? "bg-gray-900 text-white font-bold"
                      : "text-gray-500 hover:bg-gray-50"
                      }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

          </aside>

          {/* ----- MOBILE TOPBAR (Visible only on Mobile) ----- */}
          <div className="lg:hidden flex flex-wrap gap-4 items-center justify-between bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
            <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
              {categories.map((cat) => (
                <NavLink
                  key={cat.path}
                  to={cat.path}
                  end={cat.path === "/products"}
                  className={({ isActive }) =>
                    `whitespace-nowrap px-4 py-2 rounded-full text-xs font-bold uppercase tracking-widest transition-all ${isActive ? "bg-pink-500 text-white" : "bg-gray-50 text-gray-500"
                    }`
                  }
                >
                  {cat.name.split(' ')[0]}
                </NavLink>
              ))}
            </div>

            <div className="flex gap-4 w-full sm:w-auto">
              <select
                value={filterType || "default"}
                onChange={(e) => handleFilterChange(e.target.value)}
                className="flex-1 bg-gray-50 border-none rounded-xl px-4 py-2 text-xs font-bold text-gray-700 focus:ring-2 focus:ring-pink-200"
              >
                <option value="default">Filters</option>
                <option value="under1800">Under ₹1,800</option>
                <option value="1800to3600">₹1,800 - ₹3,600</option>
                <option value="above3600">Above ₹3,600</option>

              </select>

              <select
                value={sortType || "default"}
                onChange={(e) => handleSortChange(e.target.value)}
                className="flex-1 bg-gray-50 border-none rounded-xl px-4 py-2 text-xs font-bold text-gray-700 focus:ring-2 focus:ring-pink-200"
              >
                <option value="default">Sort By</option>
                <option value="lowToHigh">Price: Low to High</option>
                <option value="highToLow">Price: High to Low</option>
                <option value="name-az">Name: A-Z</option>
              </select>
            </div>
          </div>

          {/* ----- MAIN CONTENT ----- */}
          <main className="flex-1 min-w-0">
            <Outlet context={{ sortType, filterType, priceRange }} />
          </main>

        </div>
      </div>
    </div>
  );
}

export default Products;
