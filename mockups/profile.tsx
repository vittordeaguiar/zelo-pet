import React from "react";
import {
  Weight,
  Calendar,
  Scissors,
  CheckCircle2,
  Users,
  ChevronRight,
  Syringe,
  Stethoscope,
  Settings,
  Edit3,
  Share2,
} from "lucide-react";

// --- MOCK DATA ---

const PET_DATA = {
  name: "Paçoca",
  breed: "Golden Retriever",
  image:
    "https://images.unsplash.com/photo-1552053831-71594a27632d?auto=format&fit=crop&w=300&q=80",
  microchip: "981.123.456.789",
  stats: {
    weight: "28.5 kg",
    isIdealWeight: true,
    neutered: true,
    birthDate: "12 Mai 2021",
    age: "2 anos e 5 meses",
  },
};

const GUARDIANS = [
  {
    id: 1,
    name: "Ana Silva",
    role: "Tutor Principal (Eu)",
    image:
      "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=100&q=80",
  },
  {
    id: 2,
    name: "Carlos Rocha",
    role: "Co-tutor",
    image:
      "https://images.unsplash.com/photo-1599566150163-29194dcaad36?auto=format&fit=crop&w=100&q=80",
  },
];

const VACCINES = [
  {
    id: 1,
    name: "V10 (Polivalente)",
    date: "10 Out 2023",
    nextDose: "10 Out 2024",
    vet: "Dr. André Souza",
  },
  {
    id: 2,
    name: "Antirrábica",
    date: "15 Ago 2023",
    nextDose: "15 Ago 2024",
    vet: "Clínica Vet Care",
  },
  { id: 3, name: "Giárdia", date: "02 Fev 2023", nextDose: "02 Fev 2024", vet: "Dr. André Souza" },
];

// --- COMPONENTE PRINCIPAL ---

export default function ProfileScreen() {
  // Cores do Design System
  const colors = {
    bg: "bg-gray-50",
    cardBg: "bg-white",
    textMain: "text-gray-900",
    textSec: "text-gray-500",
    primary: "text-teal-600",
    primaryBg: "bg-teal-600",
    primaryLight: "bg-teal-50",
    divider: "border-gray-100",
  };

  return (
    <div className={`w-full min-h-screen ${colors.bg} font-sans pb-24 relative select-none`}>
      {/* --- HEADER --- */}
      <header className="px-6 pt-6 flex justify-between items-center mb-6">
        <h1 className="text-xl font-bold text-gray-900">Perfil do Pet</h1>
        <button className="p-2 bg-white rounded-full text-gray-400 hover:text-teal-600 shadow-sm border border-gray-100 transition-colors">
          <Settings size={20} />
        </button>
      </header>

      <main className="px-6 space-y-6">
        {/* --- HERO CARD (PET IDENTITY) --- */}
        <section className="relative">
          <div className="bg-white rounded-[32px] p-6 shadow-sm border border-gray-100 flex flex-col items-center text-center relative overflow-hidden group">
            {/* Background Decorativo */}
            <div className="absolute top-0 w-full h-24 bg-gradient-to-b from-teal-50 to-transparent opacity-50"></div>

            {/* Avatar Grande */}
            <div className="relative mb-4 z-10">
              <div className="w-28 h-28 rounded-full p-1.5 bg-white shadow-md">
                <img
                  src={PET_DATA.image}
                  alt={PET_DATA.name}
                  className="w-full h-full rounded-full object-cover"
                />
              </div>
              <button className="absolute bottom-1 right-1 bg-teal-600 text-white p-2 rounded-full shadow-lg hover:scale-105 transition-transform">
                <Edit3 size={16} />
              </button>
            </div>

            {/* Infos Básicas */}
            <div className="z-10">
              <h2 className="text-2xl font-bold text-gray-900 mb-1">{PET_DATA.name}</h2>
              <p className="text-gray-500 font-medium">{PET_DATA.breed}</p>

              <div className="mt-3 inline-flex items-center gap-2 px-3 py-1 bg-gray-50 rounded-lg border border-gray-200/50">
                <span className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">
                  Microchip
                </span>
                <span className="text-xs font-mono text-gray-600">{PET_DATA.microchip}</span>
              </div>
            </div>
          </div>
        </section>

        {/* --- SECTION 1: ESTATÍSTICAS VITAIS --- */}
        <section>
          <div className="grid grid-cols-3 gap-3">
            {/* Peso */}
            <div className="bg-white p-4 rounded-[20px] shadow-sm border border-gray-100 flex flex-col items-center justify-center gap-2 relative overflow-hidden">
              {PET_DATA.stats.isIdealWeight && (
                <div className="absolute top-2 right-2">
                  <div className="w-2 h-2 rounded-full bg-emerald-400"></div>
                </div>
              )}
              <div className="w-8 h-8 rounded-full bg-blue-50 text-blue-500 flex items-center justify-center">
                <Weight size={16} />
              </div>
              <div className="text-center">
                <span className="block text-sm font-bold text-gray-900">
                  {PET_DATA.stats.weight}
                </span>
                <span className="text-[10px] text-gray-400 font-medium">Peso atual</span>
              </div>
              {PET_DATA.stats.isIdealWeight && (
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-emerald-400 opacity-50"></div>
              )}
            </div>

            {/* Nascimento */}
            <div className="bg-white p-4 rounded-[20px] shadow-sm border border-gray-100 flex flex-col items-center justify-center gap-2">
              <div className="w-8 h-8 rounded-full bg-orange-50 text-orange-500 flex items-center justify-center">
                <Calendar size={16} />
              </div>
              <div className="text-center">
                <span className="block text-sm font-bold text-gray-900 leading-tight mb-0.5">
                  2 anos
                </span>
                <span className="text-[10px] text-gray-400 font-medium block">12/05/21</span>
              </div>
            </div>

            {/* Castrado */}
            <div className="bg-white p-4 rounded-[20px] shadow-sm border border-gray-100 flex flex-col items-center justify-center gap-2">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  PET_DATA.stats.neutered
                    ? "bg-purple-50 text-purple-500"
                    : "bg-gray-100 text-gray-400"
                }`}
              >
                <Scissors size={16} />
              </div>
              <div className="text-center">
                <span className="block text-sm font-bold text-gray-900">
                  {PET_DATA.stats.neutered ? "Sim" : "Não"}
                </span>
                <span className="text-[10px] text-gray-400 font-medium">Castrado</span>
              </div>
            </div>
          </div>
        </section>

        {/* --- SECTION 2: TUTORES --- */}
        <section className="bg-white rounded-[24px] p-5 shadow-sm border border-gray-100">
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center gap-2">
              <Users size={18} className="text-teal-600" />
              <h3 className="font-bold text-gray-900 text-base">Tutores</h3>
            </div>
            <button className="text-xs font-bold text-teal-600 hover:text-teal-700">
              Gerenciar
            </button>
          </div>

          <div className="space-y-3">
            {GUARDIANS.map((guardian, idx) => (
              <div key={guardian.id} className="flex items-center justify-between group">
                <div className="flex items-center gap-3">
                  <img
                    src={guardian.image}
                    alt={guardian.name}
                    className="w-10 h-10 rounded-full object-cover ring-2 ring-gray-50"
                  />
                  <div>
                    <p className="text-sm font-bold text-gray-900">{guardian.name}</p>
                    <p className="text-xs text-gray-500">{guardian.role}</p>
                  </div>
                </div>
                {/* Apenas para demonstrar que é compartilhável */}
                {idx === 0 && (
                  <div className="w-6 h-6 rounded-full bg-teal-50 flex items-center justify-center text-teal-600">
                    <CheckCircle2 size={12} />
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* --- SECTION 3: CARTEIRA DE VACINAÇÃO --- */}
        <section className="bg-white rounded-[24px] p-5 shadow-sm border border-gray-100 mb-8">
          <div className="flex justify-between items-center mb-5">
            <div className="flex items-center gap-2">
              <Syringe size={18} className="text-teal-600" />
              <h3 className="font-bold text-gray-900 text-base">Vacinas</h3>
            </div>
            <button className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center text-gray-400 hover:text-teal-600 hover:bg-teal-50 transition-colors">
              <Share2 size={16} />
            </button>
          </div>

          <div className="space-y-6 relative">
            {/* Linha vertical pontilhada */}
            <div className="absolute left-[7px] top-2 bottom-2 w-[1px] border-l border-dashed border-gray-200"></div>

            {VACCINES.map((vac) => (
              <div key={vac.id} className="relative pl-6">
                {/* Dot Indicador */}
                <div className="absolute left-0 top-1.5 w-4 h-4 rounded-full border-[3px] border-white bg-teal-500 shadow-sm z-10"></div>

                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="text-sm font-bold text-gray-900">{vac.name}</h4>
                    <div className="flex items-center gap-1.5 mt-1 text-gray-500">
                      <Stethoscope size={12} />
                      <span className="text-xs">{vac.vet}</span>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="bg-teal-50 px-2 py-1 rounded-lg border border-teal-100 inline-block">
                      <span className="block text-[10px] font-bold text-teal-700 uppercase tracking-wide mb-0.5">
                        Próxima
                      </span>
                      <span className="block text-xs font-bold text-teal-900">{vac.nextDose}</span>
                    </div>
                    <span className="block text-[10px] text-gray-400 mt-1">Última: {vac.date}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <button className="w-full mt-6 py-3 rounded-xl border border-dashed border-gray-300 text-gray-500 text-sm font-bold hover:bg-gray-50 hover:border-gray-400 transition-all flex items-center justify-center gap-2">
            <Syringe size={16} /> Adicionar Vacina
          </button>
        </section>
      </main>
    </div>
  );
}
