import React, { useState, useEffect } from "react";
import { FaShoppingCart, FaUser, FaHeart, FaSearch } from "react-icons/fa";
import { BiSolidLogInCircle } from "react-icons/bi";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../Context/AuthContext";
import { useCart } from "../Context/CartContext";
import { useWishlist } from "../Context/WishlistContext";

function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { user, logout } = useAuth();
  const { cart, clearCart } = useCart();
  const { wishlist, clearWishlist } = useWishlist();
  const navigate = useNavigate();

  // Scroll effect for navbar
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const itemCount = Array.isArray(cart)
    ? cart.reduce((sum, item) => sum + item.quantity, 0)
    : 0;

  const wishlistCount = Array.isArray(wishlist) ? wishlist.length : 0;

  return (
    <header
      className={`fixed top-0 left-0 w-full z-50 transition-all duration-300 ${scrolled
        ? "bg-white/80 backdrop-blur-lg shadow-lg py-2"
        : "bg-transparent py-4 text-gray-800"
        }`}
    >
      <nav className="max-w-7xl mx-auto px-6 lg:px-12 flex justify-between items-center">
        {/*  Logo */}
        <Link to="/" className="flex items-center gap-2 group">
          <img
            src="/BaeBy Official Logo.png"
            alt="BaeBy Logo"
            className="h-12 w-auto object-contain transition-transform duration-300 group-hover:scale-105"
          />
        </Link>

        {/*  Navbar Links (Desktop) */}
        <ul className="hidden md:flex items-center space-x-10 text-sm font-semibold tracking-wide uppercase">
          {["Home", "Products", "Gen Z Picks"].map((item) => {
            const path =
              item === "Home"
                ? "/"
                : `/${item.toLowerCase().replace(/\s+/g, "-")}`;
            return (
              <li key={item}>
                <NavLink
                  to={path}
                  className={({ isActive }) =>
                    `relative transition-colors duration-300 ${isActive
                      ? "text-pink-600"
                      : "text-gray-600 hover:text-pink-500"
                    } after:content-[''] after:absolute after:left-0 after:-bottom-1 after:w-0 after:h-[2px] after:bg-pink-500 after:transition-all hover:after:w-full ${isActive ? 'after:w-full' : ''}`
                  }
                >
                  {item}
                </NavLink>
              </li>
            );
          })}
        </ul>

        {/* Right Side Icons */}
        <div className="flex items-center gap-6">
          {/* Wishlist Icon */}
          <div
            className="relative cursor-pointer group"
            onClick={() => navigate("/wishlist")}
            title="Wishlist"
          >
            <FaHeart className="text-xl text-gray-700 group-hover:text-pink-500 transition-all duration-300 transform group-hover:scale-110" />
            {wishlistCount > 0 && (
              <span className="absolute -top-2 -right-2 bg-pink-500 text-white text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center animate-pulse">
                {wishlistCount}
              </span>
            )}
          </div>

          {/* Cart Icon */}
          <div
            className="relative cursor-pointer group"
            onClick={() => navigate("/cart")}
            title="Cart"
          >
            <FaShoppingCart className="text-xl text-gray-700 group-hover:text-pink-500 transition-all duration-300 transform group-hover:scale-110" />
            {itemCount > 0 && (
              <span className="absolute -top-2 -right-2 bg-pink-500 text-white text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center animate-pulse">
                {itemCount}
              </span>
            )}
          </div>

          {/*  User / Login */}
          <div className="hidden lg:flex items-center gap-4">
            {user ? (
              <div className="flex items-center gap-4">
                <div
                  className="flex items-center gap-2 cursor-pointer group"
                  onClick={() => navigate("/orders")}
                >
                  <div className="w-8 h-8 rounded-full bg-pink-100 flex items-center justify-center border border-pink-200 group-hover:bg-pink-200 transition-colors">
                    <FaUser className="text-pink-600 text-sm" />
                  </div>
                  <span className="text-sm font-medium text-gray-700 group-hover:text-pink-600">
                    {user?.name?.split(' ')[0] || "User"}
                  </span>
                </div>
                <button
                  onClick={() => {
                    logout();
                    clearCart();
                    clearWishlist();
                  }}
                  className="px-5 py-2 rounded-full bg-gray-900 text-white text-xs font-bold hover:bg-pink-600 transition-all duration-300 transform active:scale-95"
                >
                  LOGOUT
                </button>
              </div>
            ) : (
              <Link
                to="/login"
                className="flex items-center gap-2 px-5 py-2 rounded-full bg-gray-900 text-white text-xs font-bold hover:bg-pink-600 transition-all duration-300 transform active:scale-95"
              >
                <BiSolidLogInCircle size={16} />
                LOGIN
              </Link>
            )}
          </div>

          {/*  Hamburger (Mobile) */}
          <button
            className="md:hidden text-2xl text-gray-800 focus:outline-none"
            onClick={() => setMenuOpen(!menuOpen)}
          >
            {menuOpen ? (
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" className="w-6 h-6">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" className="w-6 h-6">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            )}
          </button>
        </div>
      </nav>

      {/*  Mobile Menu */}
      <div
        className={`fixed inset-0 bg-white/95 backdrop-blur-md z-40 transition-transform duration-500 ease-in-out md:hidden flex flex-col items-center justify-center space-y-8 ${menuOpen ? "translate-y-0" : "-translate-y-full"
          }`}
      >
        <button
          className="absolute top-6 right-6 text-3xl text-gray-800"
          onClick={() => setMenuOpen(false)}
        >
          &times;
        </button>
        <ul className="flex flex-col items-center space-y-8 font-bold text-2xl text-gray-800 uppercase tracking-widest">
          {["Home", "Products", "Gen Z Picks"].map((item) => (
            <li key={item}>
              <Link
                to={item === "Home" ? "/" : `/${item.toLowerCase().replace(/\s+/g, "-")}`}
                onClick={() => setMenuOpen(false)}
                className="hover:text-pink-500 transition-colors"
              >
                {item}
              </Link>
            </li>
          ))}
          <li>
            <Link to="/orders" onClick={() => setMenuOpen(false)} className="hover:text-pink-500 transition-colors">Orders</Link>
          </li>
        </ul>

        {user ? (
          <button
            onClick={() => {
              logout();
              setMenuOpen(false);
            }}
            className="bg-gray-900 text-white px-10 py-4 rounded-full font-bold text-lg hover:bg-pink-600 transition-all"
          >
            LOGOUT
          </button>
        ) : (
          <Link
            to="/login"
            onClick={() => setMenuOpen(false)}
            className="bg-gray-900 text-white px-10 py-4 rounded-full font-bold text-lg hover:bg-pink-600 transition-all"
          >
            LOGIN
          </Link>
        )}
      </div>
    </header>
  );
}

export default Header;
