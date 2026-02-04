import React, { useState } from "react";
import {
  ArrowLeft,
  Plus,
  Calendar,
  MapPin,
  Heart,
  Share2,
  MoreVertical,
  Camera,
  ChevronDown,
  X,
} from "lucide-react";

// --- MOCK DATA ---

const PET_DATA = {
  name: "Paçoca",
  image:
    "https://images.unsplash.com/photo-1552053831-71594a27632d?auto=format&fit=crop&w=150&q=80",
};

const MEMORIES_DB = [
  {
    id: 1,
    title: "Primeiro dia na praia",
    date: "12 Jan 2023",
    location: "Florianópolis, SC",
    description:
      "Ele ficou com medo das ondas no começo, mas depois não queria mais sair da água! Cavou muitos buracos e correu atrás de gaivotas.",
    image:
      "https://images.unsplash.com/photo-1594145070146-5db2e622b724?auto=format&fit=crop&w=500&q=80",
    likes: 12,
  },
  {
    id: 2,
    title: "Soninho da tarde",
    date: "05 Mar 2023",
    location: "Em casa",
    description: "Nada como um cochilo no sofá num domingo chuvoso.",
    image:
      "https://images.unsplash.com/photo-1541599540903-216a46ca1dc0?auto=format&fit=crop&w=500&q=80",
    likes: 8,
  },
  {
    id: 3,
    title: "Aniversário de 2 anos",
    date: "15 Mai 2023",
    location: "Parque Villa-Lobos",
    description: "Teve bolo de carne e muitos aumigos reunidos. O melhor dia!",
    image:
      "https://images.unsplash.com/photo-1530281700549-e82e7bf110d6?auto=format&fit=crop&w=500&q=80",
    likes: 24,
  },
  {
    id: 4,
    title: "Destruidor de chinelos",
    date: "20 Jun 2023",
    location: "Em casa",
    description: "A cara de culpado não nega. Foi o terceiro par esse mês...",
    image:
      "https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?auto=format&fit=crop&w=500&q=80",
    likes: 5,
  },
  {
    id: 5,
    title: "Passeio na trilha",
    date: "10 Ago 2023",
    location: "Pedra Grande",
    description: "Muita lama e diversão.",
    image:
      "https://images.unsplash.com/photo-1548199973-03cce0bbc87b?auto=format&fit=crop&w=500&q=80",
    likes: 15,
  },
];

// --- COMPONENTE PRINCIPAL ---

export default function MemoriesScreen() {
  const [selectedMemory, setSelectedMemory] = useState(null); // Se null, mostra grid. Se obj, mostra detalhe.
  const [isEmptyState, setIsEmptyState] = useState(false); // Toggle para demo

  // Cores do Design System
  const colors = {
    bg: "bg-gray-50",
    textMain: "text-gray-900",
    textSec: "text-gray-500",
    primary: "text-teal-600",
    primaryBg: "bg-teal-600",
    primaryLight: "bg-teal-50",
    card: "bg-white",
  };

  // --- DETAIL VIEW (MODAL) ---
  if (selectedMemory) {
    return (
      <div className={`fixed inset-0 z-50 bg-white flex flex-col animate-[fadeIn_0.3s_ease-out]`}>
        {/* Header Detalhe (Transparente sobre a foto ou Sólido dependendo do scroll - simplificado aqui) */}
        <div className="absolute top-0 left-0 right-0 p-6 flex justify-between items-center z-20">
          <button
            onClick={() => setSelectedMemory(null)}
            className="w-10 h-10 rounded-full bg-black/20 backdrop-blur-md flex items-center justify-center text-white hover:bg-black/40 transition-colors"
          >
            <ArrowLeft size={20} />
          </button>

          <div className="flex gap-2">
            <button className="w-10 h-10 rounded-full bg-black/20 backdrop-blur-md flex items-center justify-center text-white hover:bg-black/40 transition-colors">
              <Share2 size={18} />
            </button>
            <button className="w-10 h-10 rounded-full bg-black/20 backdrop-blur-md flex items-center justify-center text-white hover:bg-black/40 transition-colors">
              <MoreVertical size={18} />
            </button>
          </div>
        </div>

        {/* Imagem Hero */}
        <div className="relative w-full h-[55vh] shrink-0">
          <img
            src={selectedMemory.image}
            alt={selectedMemory.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/60"></div>

          {/* Infos Sobre a Imagem */}
          <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
            <div className="flex items-center gap-2 mb-2 opacity-90">
              <Calendar size={14} />
              <span className="text-xs font-medium uppercase tracking-wider">
                {selectedMemory.date}
              </span>
            </div>
            <h2 className="text-3xl font-bold leading-tight mb-1">{selectedMemory.title}</h2>
            {selectedMemory.location && (
              <div className="flex items-center gap-1.5 opacity-80">
                <MapPin size={14} />
                <span className="text-sm font-medium">{selectedMemory.location}</span>
              </div>
            )}
          </div>
        </div>

        {/* Conteúdo Textual */}
        <div className="flex-1 bg-white relative -mt-6 rounded-t-[32px] px-6 py-8 overflow-y-auto">
          <div className="w-12 h-1 bg-gray-200 rounded-full mx-auto mb-6"></div>

          <p className="text-gray-600 text-lg leading-relaxed mb-8 font-light">
            {selectedMemory.description}
          </p>

          <div className="flex items-center gap-4">
            <button className="flex-1 bg-rose-50 text-rose-500 py-3 rounded-xl font-bold flex items-center justify-center gap-2 active:scale-95 transition-transform">
              <Heart size={20} fill={selectedMemory.likes > 0 ? "currentColor" : "none"} />
              {selectedMemory.likes} Amei
            </button>
            <button className="flex-1 bg-gray-50 text-gray-700 py-3 rounded-xl font-bold flex items-center justify-center gap-2 active:scale-95 transition-transform">
              Comentar
            </button>
          </div>
        </div>
      </div>
    );
  }

  // --- MAIN LIST VIEW ---
  return (
    <div className={`w-full min-h-screen ${colors.bg} font-sans pb-24 relative select-none`}>
      {/* DEV CONTROLS */}
      <div className="fixed top-0 left-0 right-0 z-50 flex justify-center pt-2 pointer-events-none">
        <button
          onClick={() => setIsEmptyState(!isEmptyState)}
          className="pointer-events-auto bg-gray-900/80 backdrop-blur-md text-white px-4 py-1.5 rounded-full text-[10px] font-bold shadow-lg hover:bg-gray-800 transition-colors"
        >
          Mudar Estado: {isEmptyState ? "Vazio" : "Com Memórias"}
        </button>
      </div>

      {/* HEADER */}
      <header className="px-6 pt-12 pb-4 sticky top-0 z-10 bg-gray-50/95 backdrop-blur-sm">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-3">
            <img
              src={PET_DATA.image}
              alt={PET_DATA.name}
              className="w-10 h-10 rounded-full object-cover ring-2 ring-white shadow-sm"
            />
            <div className="flex flex-col">
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                Álbum de
              </span>
              <button className="flex items-center gap-1 group">
                <span className={`text-xl font-bold ${colors.textMain} leading-none`}>
                  {PET_DATA.name}
                </span>
                <ChevronDown size={16} className="text-gray-400 group-hover:text-gray-600" />
              </button>
            </div>
          </div>

          <div className="w-10 h-10 rounded-full bg-white border border-gray-100 flex items-center justify-center text-gray-400 shadow-sm">
            <Calendar size={18} />
          </div>
        </div>
      </header>

      {/* CONTENT */}
      <main className="px-5 pt-2">
        {isEmptyState ? (
          // --- ESTADO VAZIO ---
          <div className="flex flex-col items-center justify-center pt-20 text-center animate-[fadeIn_0.5s]">
            <div className="w-40 h-40 bg-teal-50 rounded-full flex items-center justify-center mb-6 relative">
              <Camera size={64} className="text-teal-200" />
              <div className="absolute top-8 right-8 w-4 h-4 bg-teal-400 rounded-full animate-ping"></div>
            </div>
            <h2 className={`text-2xl font-bold ${colors.textMain} mb-2`}>Crie memórias</h2>
            <p className={`${colors.textSec} text-sm max-w-[250px] leading-relaxed mb-8`}>
              Tire fotos dos momentos especiais com o {PET_DATA.name} e guarde tudo aqui para
              sempre.
            </p>
            <button className="flex items-center gap-2 px-6 py-3 bg-teal-600 text-white rounded-2xl shadow-lg shadow-teal-600/30 hover:bg-teal-700 active:scale-95 transition-all font-bold">
              <Plus size={20} />
              Adicionar primeira foto
            </button>
          </div>
        ) : (
          // --- GRID DE FOTOS ---
          <div className="columns-2 gap-4 space-y-4 pb-20">
            {MEMORIES_DB.map((memory, idx) => (
              <div
                key={memory.id}
                onClick={() => setSelectedMemory(memory)}
                className="break-inside-avoid relative group rounded-[20px] overflow-hidden bg-white shadow-sm hover:shadow-lg transition-all cursor-pointer animate-[slideUp_0.5s_ease-out]"
                style={{ animationDelay: `${idx * 0.1}s` }}
              >
                <img
                  src={memory.image}
                  alt={memory.title}
                  className="w-full h-auto object-cover transform group-hover:scale-105 transition-transform duration-500"
                />

                {/* Gradiente Overlay (Visível sempre ou no hover? Sempre para legibilidade) */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-3">
                  <span className="text-white text-xs font-bold truncate">{memory.title}</span>
                  <span className="text-white/80 text-[10px]">{memory.date}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* FAB (Floating Action Button) - Apenas se não estiver vazio (pois o vazio já tem CTA) */}
      {!isEmptyState && (
        <button className="fixed bottom-6 right-6 w-14 h-14 bg-teal-600 rounded-full shadow-[0_8px_30px_rgba(13,148,136,0.4)] flex items-center justify-center text-white z-40 hover:scale-110 active:scale-90 transition-all duration-300">
          <Plus size={28} strokeWidth={2.5} />
        </button>
      )}
    </div>
  );
}
