import React from "react";
import { useNavigate } from "react-router-dom";
// import { useAuth } from "../Context/AuthContext"; // Unused import removed

function Home() {
  const navigate = useNavigate();
  // const { user, logout } = useAuth(); // Unused variables removed

  return (
    <div className="w-full h-full overflow-x-hidden scroll-smooth">
      {/* Hero Section */}
      <section className="relative h-screen flex flex-col items-center justify-center text-center text-white overflow-hidden">
        <video
          src="/FashionBanner.mp4"
          autoPlay
          loop
          muted
          playsInline
          className="absolute top-0 left-0 w-full h-full object-cover"
        ></video>

        <div className="relative z-10">
          <h1 className="text-5xl md:text-7xl font-bold drop-shadow-lg">
            BaeBy
          </h1>
          <p className="mt-4 text-lg md:text-2xl font-light">
            Trendy Picks for Gen Z Kids
          </p>
          {/* Cop the Look button (always visible, Gen Z glow style) */}
          <div className="mt-6 flex items-center justify-center">
            <button
              onClick={() => navigate("/gen-z-picks")}
              className="px-6 py-3 rounded-full bg-gradient-to-r from-pink-500 to-violet-500 
               text-white font-semibold shadow-lg hover:from-pink-600 hover:to-violet-600 
               transition-all"
            >
              Cop the Look
            </button>
          </div>

        </div>

        <div className="absolute inset-0 bg-gradient-to-b from-black/30 to-black/50"></div>
      </section>

      {/* Section 1: Featured Products */}
      <section className="relative min-h-screen flex flex-col justify-center items-center text-center text-white px-6 py-16 overflow-hidden">
        <video
          src="/ProductsHero.mp4"
          autoPlay
          loop
          muted
          playsInline
          className="absolute top-0 left-0 w-full h-full object-cover"
        ></video>

        <div className="absolute inset-0 bg-gradient-to-b from-black/30 to-black/60"></div>

        <div className="relative z-10">
          <h2 className="text-3xl md:text-4xl font-bold mb-6 drop-shadow-lg">
            Featured Products
          </h2>
          <p className="max-w-2xl text-lg md:text-xl font-light mx-auto mb-6 drop-shadow-md">
            Discover our top-selling baby clothing and accessories that Gen Z
            parents love the most.
          </p>
          <button
            onClick={() => navigate("/products")}
            className="px-6 py-3 rounded-full bg-gradient-to-r from-pink-500 to-violet-500 
               text-white font-semibold shadow-lg hover:from-pink-600 hover:to-violet-600 
               transition-all"          >
            Explore
          </button>
        </div>
      </section>

      {/* Section 2: New Arrivals */}
      <section className="relative min-h-screen flex flex-col justify-center items-center text-center text-white px-6 py-16 overflow-hidden">
        <video
          src="/NewDrop.mp4"
          autoPlay
          loop
          muted
          playsInline
          className="absolute top-0 left-0 w-full h-full object-cover"
        ></video>

        <div className="absolute inset-0 bg-gradient-to-b from-black/30 to-black/60"></div>

        <div className="relative z-10">
          <h2 className="text-3xl md:text-4xl font-bold mb-6 drop-shadow-lg">
            New Arrivals
          </h2>
          <p className="max-w-2xl text-lg md:text-xl font-light mx-auto mb-6 drop-shadow-md">
            Fresh drops every week! From cute rompers to stylish toys — your baby
            deserves the trendiest picks.
          </p>
          <button
            onClick={() => navigate("/products")}
            className="px-6 py-3 rounded-full bg-gradient-to-r from-pink-500 to-violet-500 
               text-white font-semibold shadow-lg hover:from-pink-600 hover:to-violet-600 
               transition-all"  >
            Shop New
          </button>
        </div>
      </section>

      {/* About */}
      <section className="min-h-screen bg-gradient-to-b from-pink-100 to-white flex flex-col justify-center items-center text-center px-6 py-16">
        <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-6">
          About BaeBy
        </h2>
        <p className="max-w-2xl text-gray-600 leading-relaxed">
          BaeBy is a Gen Z-inspired baby fashion brand that brings comfort and
          cuteness together. Our mission is to make every baby feel special with
          trendy, high-quality products.
        </p>
        <p className="mt-4 text-gray-500 italic">— Made with love for tiny trendsetters —</p>
      </section>
    </div>
  );
}

export default Home;
