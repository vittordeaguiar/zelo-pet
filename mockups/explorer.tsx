import React, { useState } from "react";
import {
  Search,
  MapPin,
  Filter,
  Star,
  ChevronDown,
  Navigation,
  Store,
  Stethoscope,
  GraduationCap,
  AlertCircle,
  ArrowRight,
} from "lucide-react";

// --- MOCK DATA ---

const PET_DATA = {
  name: "Paçoca",
  image:
    "https://images.unsplash.com/photo-1552053831-71594a27632d?auto=format&fit=crop&w=150&q=80",
};

const CATEGORIES = [
  { id: "all", label: "Todos", icon: null },
  { id: "vet", label: "Saúde", icon: <Stethoscope size={18} /> },
  { id: "shop", label: "Petshop", icon: <Store size={18} /> },
  { id: "train", label: "Adestrar", icon: <GraduationCap size={18} /> },
];

const PLACES_DB = [
  {
    id: 1,
    name: "PetShop Amigo Fiel",
    category: "Petshop",
    distance: "0.8 km",
    rating: 4.8,
    reviews: 124,
    image:
      "https://images.unsplash.com/photo-1516734212186-a967f81ad0d7?auto=format&fit=crop&w=200&q=80",
    isOpen: true,
  },
  {
    id: 2,
    name: "Clínica Vet Care 24h",
    category: "Saúde",
    distance: "1.2 km",
    rating: 4.9,
    reviews: 850,
    image:
      "https://images.unsplash.com/photo-1532938911079-1b06ac7ceec7?auto=format&fit=crop&w=200&q=80",
    isOpen: true,
  },
  {
    id: 3,
    name: "Escola Cão Educado",
    category: "Adestrar",
    distance: "3.5 km",
    rating: 4.5,
    reviews: 42,
    image:
      "https://images.unsplash.com/photo-1587300003388-59208cc962cb?auto=format&fit=crop&w=200&q=80",
    isOpen: false,
  },
  {
    id: 4,
    name: "Spa dos Bichos",
    category: "Petshop",
    distance: "4.0 km",
    rating: 4.7,
    reviews: 210,
    image:
      "https://images.unsplash.com/photo-1516734212186-a967f81ad0d7?auto=format&fit=crop&w=200&q=80",
    isOpen: true,
  },
];

// --- COMPONENTE PRINCIPAL ---

export default function ExploreScreen() {
  // Estados de Interface
  const [viewState, setViewState] = useState("results"); // 'results', 'loading', 'empty', 'no_location'
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [radius, setRadius] = useState(5); // km
  const [sortBy, setSortBy] = useState("dist"); // 'dist', 'name'

  // Filtros de Lógica (Simulados)
  const filteredPlaces = PLACES_DB.filter((place) => {
    if (
      selectedCategory !== "all" &&
      place.category.toLowerCase() !==
        CATEGORIES.find((c) => c.id === selectedCategory)?.label.toLowerCase()
    )
      return false;
    if (searchQuery && !place.name.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  // Cores do Design System
  const colors = {
    bg: "bg-gray-50",
    textMain: "text-gray-900",
    textSec: "text-gray-500",
    primary: "text-teal-600",
    primaryBg: "bg-teal-600",
    primaryLight: "bg-teal-50",
    primaryBorder: "border-teal-100",
  };

  return (
    <div className={`w-full min-h-screen ${colors.bg} font-sans pb-24 relative select-none`}>
      {/* --- DEV CONTROLS --- */}
      <div className="fixed top-0 left-0 right-0 z-50 bg-gray-900/90 backdrop-blur-sm text-white text-[10px] py-2 px-4 flex justify-between items-center shadow-lg">
        <span className="font-bold opacity-70 uppercase tracking-widest hidden sm:inline">
          Simular Estados:
        </span>
        <div className="flex gap-2 mx-auto sm:mx-0 overflow-x-auto no-scrollbar w-full sm:w-auto px-2 sm:px-0">
          <button
            onClick={() => setViewState("results")}
            className={`whitespace-nowrap px-3 py-1 rounded-full border transition-all ${
              viewState === "results"
                ? "bg-teal-500 border-teal-500 text-white"
                : "border-gray-600 text-gray-400"
            }`}
          >
            Resultados
          </button>
          <button
            onClick={() => setViewState("loading")}
            className={`whitespace-nowrap px-3 py-1 rounded-full border transition-all ${
              viewState === "loading"
                ? "bg-teal-500 border-teal-500 text-white"
                : "border-gray-600 text-gray-400"
            }`}
          >
            Carregando
          </button>
          <button
            onClick={() => setViewState("empty")}
            className={`whitespace-nowrap px-3 py-1 rounded-full border transition-all ${
              viewState === "empty"
                ? "bg-teal-500 border-teal-500 text-white"
                : "border-gray-600 text-gray-400"
            }`}
          >
            Vazio
          </button>
          <button
            onClick={() => setViewState("no_location")}
            className={`whitespace-nowrap px-3 py-1 rounded-full border transition-all ${
              viewState === "no_location"
                ? "bg-teal-500 border-teal-500 text-white"
                : "border-gray-600 text-gray-400"
            }`}
          >
            Sem GPS
          </button>
        </div>
      </div>
      <div className="h-12"></div>

      {/* --- HEADER --- */}
      <header className="px-6 pt-6 pb-2 sticky top-12 z-20 bg-gray-50/95 backdrop-blur-sm">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-3">
            <img
              src={PET_DATA.image}
              alt={PET_DATA.name}
              className="w-10 h-10 rounded-full object-cover ring-2 ring-white shadow-sm"
            />
            <button className="flex items-center gap-2 group">
              <span
                className={`text-lg font-bold ${colors.textMain} group-active:opacity-70 transition-opacity`}
              >
                Explorar com {PET_DATA.name}
              </span>
              <ChevronDown size={16} className="text-gray-400" />
            </button>
          </div>

          <div className="flex items-center gap-2 text-teal-600 bg-white px-3 py-1.5 rounded-full shadow-sm text-xs font-bold border border-teal-50">
            <MapPin size={12} fill="currentColor" />
            <span>São Paulo</span>
          </div>
        </div>

        {/* Search Bar */}
        <div className="relative mb-6">
          <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
            <Search size={20} />
          </div>
          <input
            type="text"
            placeholder="Buscar clínicas, parques..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white h-14 pl-12 pr-4 rounded-[20px] shadow-[0_4px_20px_-8px_rgba(0,0,0,0.05)] text-gray-800 placeholder:text-gray-400 outline-none focus:ring-2 focus:ring-teal-500/20 transition-all"
          />
          <button className="absolute right-3 top-1/2 -translate-y-1/2 p-2 bg-gray-50 rounded-xl text-gray-500 hover:text-teal-600 hover:bg-teal-50 transition-colors">
            <Filter size={18} />
          </button>
        </div>

        {/* Categories (Horizontal Scroll) */}
        <div className="flex gap-3 overflow-x-auto no-scrollbar pb-2">
          {CATEGORIES.map((cat) => {
            const isActive = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`
                  flex items-center gap-2 px-5 py-2.5 rounded-full whitespace-nowrap transition-all duration-300 font-semibold text-sm
                  ${
                    isActive
                      ? "bg-teal-600 text-white shadow-lg shadow-teal-600/20 scale-105"
                      : "bg-white text-gray-500 shadow-sm border border-gray-100 hover:border-teal-100 hover:text-teal-600"
                  }
                `}
              >
                {cat.icon}
                {cat.label}
              </button>
            );
          })}
        </div>
      </header>

      <main className="px-6 pt-4 space-y-6">
        {/* --- FILTERS (Chips) --- */}
        {viewState === "results" && (
          <div className="flex flex-wrap items-center gap-3 animate-[fadeIn_0.3s_ease-out]">
            <span className="text-xs font-bold text-gray-400 uppercase tracking-wide mr-1">
              Raio:
            </span>
            {[1, 3, 5, 10].map((km) => (
              <button
                key={km}
                onClick={() => setRadius(km)}
                className={`
                  px-3 py-1 rounded-lg text-xs font-bold transition-all border
                  ${
                    radius === km
                      ? "bg-gray-800 text-white border-gray-800"
                      : "bg-white text-gray-500 border-gray-200 hover:border-gray-400"
                  }
                `}
              >
                {km}km
              </button>
            ))}

            <div className="w-[1px] h-6 bg-gray-200 mx-1"></div>

            <button
              onClick={() => setSortBy(sortBy === "dist" ? "name" : "dist")}
              className="text-xs font-bold text-teal-600 flex items-center gap-1 hover:underline"
            >
              {sortBy === "dist" ? "Mais próximos" : "Nome (A-Z)"}
            </button>
          </div>
        )}

        {/* --- RESULTS SECTION --- */}
        <section className="min-h-[300px]">
          {/* STATE: LOADING */}
          {viewState === "loading" && (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="bg-white p-4 rounded-[24px] flex gap-4 animate-pulse">
                  <div className="w-24 h-24 bg-gray-200 rounded-xl"></div>
                  <div className="flex-1 py-2 space-y-3">
                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                    <div className="h-8 bg-gray-200 rounded w-full mt-2"></div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* STATE: NO LOCATION PERMISSION */}
          {viewState === "no_location" && (
            <div className="bg-white border border-rose-100 rounded-[32px] p-8 text-center flex flex-col items-center animate-[fadeIn_0.4s_ease-out]">
              <div className="w-20 h-20 bg-rose-50 rounded-full flex items-center justify-center mb-6 text-rose-400">
                <Navigation size={40} className="ml-1" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">GPS Desativado</h3>
              <p className="text-gray-500 text-sm mb-8 leading-relaxed max-w-[240px]">
                Precisamos da sua localização para encontrar serviços e parques próximos ao{" "}
                {PET_DATA.name}.
              </p>
              <button className="w-full bg-gray-900 text-white font-bold py-4 rounded-xl shadow-lg shadow-gray-900/20 active:scale-95 transition-transform">
                Ativar Localização
              </button>
            </div>
          )}

          {/* STATE: EMPTY RESULTS */}
          {(viewState === "empty" || (viewState === "results" && filteredPlaces.length === 0)) && (
            <div className="flex flex-col items-center justify-center py-12 text-center animate-[fadeIn_0.5s]">
              <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-6 grayscale opacity-50">
                <Search size={32} />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">Nenhum local encontrado</h3>
              <p className="text-gray-400 text-sm max-w-[200px]">
                Tente aumentar o raio de busca ou mudar a categoria.
              </p>
              <button
                onClick={() => {
                  setRadius(10);
                  setSelectedCategory("all");
                  setSearchQuery("");
                }}
                className="mt-6 text-teal-600 font-bold text-sm"
              >
                Limpar filtros
              </button>
            </div>
          )}

          {/* STATE: LIST RESULTS */}
          {viewState === "results" && filteredPlaces.length > 0 && (
            <div className="space-y-5">
              <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider pl-1">
                {filteredPlaces.length} Resultados encontrados
              </h3>

              {filteredPlaces.map((place, idx) => (
                <div
                  key={place.id}
                  className="group bg-white rounded-[24px] p-4 shadow-sm hover:shadow-lg hover:shadow-teal-900/5 transition-all duration-300 border border-transparent hover:border-teal-50 animate-[slideUp_0.4s_ease-out]"
                  style={{ animationDelay: `${idx * 0.1}s` }}
                >
                  <div className="flex gap-4">
                    {/* Image */}
                    <div className="relative w-24 h-24 shrink-0">
                      <img
                        src={place.image}
                        alt={place.name}
                        className="w-full h-full object-cover rounded-xl bg-gray-100"
                      />
                      {!place.isOpen && (
                        <div className="absolute inset-0 bg-black/50 rounded-xl flex items-center justify-center backdrop-blur-[1px]">
                          <span className="text-[10px] font-bold text-white uppercase tracking-wider bg-black/60 px-2 py-1 rounded">
                            Fechado
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Content */}
                    <div className="flex-1 flex flex-col justify-between">
                      <div>
                        <div className="flex justify-between items-start">
                          <h4 className="font-bold text-gray-900 leading-tight group-hover:text-teal-700 transition-colors">
                            {place.name}
                          </h4>
                          {place.rating && (
                            <div className="flex items-center gap-1 bg-yellow-50 px-1.5 py-0.5 rounded text-[10px] font-bold text-yellow-600">
                              <Star size={10} fill="currentColor" />
                              {place.rating}
                            </div>
                          )}
                        </div>
                        <p className="text-xs text-gray-400 mt-1">{place.category}</p>
                      </div>

                      <div className="flex items-end justify-between mt-3">
                        <div className="flex items-center gap-1.5 text-gray-500 bg-gray-50 px-2 py-1 rounded-lg">
                          <Navigation size={12} className="text-teal-500" />
                          <span className="text-xs font-semibold">{place.distance}</span>
                        </div>

                        <button className="text-teal-600 text-xs font-bold flex items-center gap-1 hover:gap-2 transition-all p-1">
                          Ver detalhes <ArrowRight size={14} />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
