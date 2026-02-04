import React, { useState } from "react";
import {
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Calendar as CalendarIcon,
  MapPin,
  Clock,
  Sun,
  CloudRain,
  Wind,
  MoreHorizontal,
  Plus,
} from "lucide-react";

// --- MOCK DATA ---

const PET_DATA = {
  name: "Paçoca",
  image:
    "https://images.unsplash.com/photo-1552053831-71594a27632d?auto=format&fit=crop&w=150&q=80",
};

const WEATHER_DATA = {
  temp: 24,
  condition: "Ensolarado",
  high: 26,
  low: 18,
  insights: ["Ótimo para passeios longos.", "Hidratação extra recomendada à tarde."],
};

// Eventos mockados para dias específicos
const EVENTS_DB = {
  "2023-10-15": [
    {
      id: 1,
      title: "Vacina Antirrábica",
      time: "09:00",
      type: "medical",
      location: "Vet Care Center",
      duration: "1h",
    },
    {
      id: 2,
      title: "Passeio no Parque",
      time: "17:30",
      type: "activity",
      location: "Parque Ibirapuera",
      duration: "45m",
    },
    {
      id: 3,
      title: "Banho e Tosa",
      time: "14:00",
      type: "grooming",
      location: "PetShop Amigo",
      duration: "2h",
    },
  ],
  "2023-10-20": [
    {
      id: 4,
      title: "Consulta de Rotina",
      time: "10:00",
      type: "medical",
      location: "Dr. Silva",
      duration: "30m",
    },
  ],
};

// --- COMPONENTE PRINCIPAL ---

export default function AgendaScreen() {
  const [currentDate, setCurrentDate] = useState(new Date(2023, 9, 15)); // Outubro (Mês 9 index 0)
  const [selectedDay, setSelectedDay] = useState(15);

  // Helpers de Calendário
  const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
  const startDayOfWeek = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay(); // 0 = Domingo
  const monthName = currentDate.toLocaleString("pt-BR", { month: "long" });
  const year = currentDate.getFullYear();

  // Gerar chave de data para buscar eventos (YYYY-MM-DD)
  const getDataKey = (day) => {
    return `2023-10-${day.toString().padStart(2, "0")}`;
  };

  const selectedDateKey = getDataKey(selectedDay);
  const events = EVENTS_DB[selectedDateKey] || [];
  const hasEvents = events.length > 0;

  // Cores (Design System)
  const colors = {
    bg: "bg-gray-50",
    textMain: "text-gray-900",
    textSec: "text-gray-500",
    primary: "text-teal-600",
    primaryBg: "bg-teal-600",
    primaryLight: "bg-teal-50",
    accentBg: "bg-orange-50", // Para o clima
    accentText: "text-orange-500",
  };

  return (
    <div className={`w-full min-h-screen ${colors.bg} font-sans pb-24 relative select-none`}>
      {/* --- HEADER: PET SELECTOR (Compacto) --- */}
      <header className="px-6 pt-6 pb-2 bg-white sticky top-0 z-20 shadow-[0_4px_20px_-10px_rgba(0,0,0,0.05)]">
        <div className="flex justify-between items-center mb-4">
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
                Agenda do {PET_DATA.name}
              </span>
              <ChevronDown size={16} className="text-gray-400" />
            </button>
          </div>

          <button className="p-2 bg-gray-50 rounded-full hover:bg-gray-100 transition-colors text-teal-600">
            <Plus size={20} />
          </button>
        </div>
      </header>

      <main className="px-6 pt-6 space-y-8">
        {/* --- WEATHER WIDGET --- */}
        <section className="animate-[fadeIn_0.4s_ease-out]">
          {/* Card com gradiente sutil e sombra suave */}
          <div className="bg-gradient-to-br from-orange-50/80 to-white border border-orange-100/50 rounded-[24px] p-5 shadow-sm relative overflow-hidden">
            <div className="flex justify-between items-start relative z-10">
              <div>
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-bold text-gray-800">{WEATHER_DATA.temp}°</span>
                  <span className="text-sm text-gray-500 font-medium">Hoje</span>
                </div>
                <div className="flex items-center gap-2 mt-1 mb-3">
                  <Sun size={16} className="text-orange-400 fill-orange-400" />
                  <span className="text-sm font-semibold text-gray-700">
                    {WEATHER_DATA.condition}
                  </span>
                </div>

                {/* Insights (Bullets) */}
                <div className="space-y-1.5">
                  {WEATHER_DATA.insights.map((insight, idx) => (
                    <div key={idx} className="flex items-start gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-orange-300 mt-1.5 shrink-0"></div>
                      <p className="text-xs text-gray-600 leading-tight max-w-[200px]">{insight}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Ilustração Decorativa (Direita) */}
              <div className="text-right">
                <div className="w-16 h-16 bg-white rounded-2xl shadow-sm flex items-center justify-center mb-2">
                  <Sun size={32} className="text-orange-500" />
                </div>
                <div className="text-xs text-gray-400 font-medium text-center">
                  H:{WEATHER_DATA.high}° L:{WEATHER_DATA.low}°
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* --- CALENDÁRIO --- */}
        <section>
          {/* Controles do Mês */}
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center gap-1">
              <button className="p-1 hover:bg-gray-100 rounded-full transition-colors">
                <ChevronLeft size={20} className="text-gray-400" />
              </button>
              <span className="text-lg font-bold text-gray-900 capitalize min-w-[100px] text-center">
                {monthName} <span className="text-gray-400 font-normal">{year}</span>
              </span>
              <button className="p-1 hover:bg-gray-100 rounded-full transition-colors">
                <ChevronRight size={20} className="text-gray-400" />
              </button>
            </div>
            <button
              onClick={() => setSelectedDay(15)}
              className="text-xs font-bold text-teal-600 bg-teal-50 px-3 py-1.5 rounded-lg hover:bg-teal-100 transition-colors"
            >
              Hoje
            </button>
          </div>

          {/* Grid dos Dias Semana */}
          <div className="grid grid-cols-7 mb-2">
            {["D", "S", "T", "Q", "Q", "S", "S"].map((d, i) => (
              <div key={i} className="text-center text-xs font-bold text-gray-400 py-1">
                {d}
              </div>
            ))}
          </div>

          {/* Grid dos Dias */}
          <div className="grid grid-cols-7 gap-y-2 gap-x-1">
            {/* Espaços vazios do inicio do mês */}
            {Array.from({ length: startDayOfWeek }).map((_, i) => (
              <div key={`empty-${i}`} className="h-10"></div>
            ))}

            {/* Dias do Mês */}
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const day = i + 1;
              const isSelected = day === selectedDay;
              const isToday = day === 15; // Simulação fixa
              const dayKey = getDataKey(day);
              const hasEvent = !!EVENTS_DB[dayKey];

              return (
                <button
                  key={day}
                  onClick={() => setSelectedDay(day)}
                  className={`
                                relative h-11 w-full rounded-xl flex flex-col items-center justify-center transition-all duration-300
                                ${
                                  isSelected
                                    ? "bg-teal-600 text-white shadow-lg shadow-teal-600/30 scale-105 z-10"
                                    : "text-gray-700 hover:bg-gray-100 active:scale-95"
                                }
                                ${
                                  !isSelected && isToday
                                    ? "bg-teal-50 text-teal-700 font-bold border border-teal-100"
                                    : ""
                                }
                            `}
                >
                  <span className={`text-sm ${isSelected ? "font-bold" : "font-medium"}`}>
                    {day}
                  </span>

                  {/* Dots indicadores */}
                  <div className="flex gap-0.5 mt-0.5 h-1">
                    {hasEvent && (
                      <span
                        className={`w-1 h-1 rounded-full ${
                          isSelected ? "bg-white/80" : "bg-teal-500"
                        }`}
                      ></span>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </section>

        {/* --- LISTA DE LEMBRETES (Bottom Section) --- */}
        <section className="pt-2 pb-12">
          <div className="flex justify-between items-end mb-5">
            <h3 className="text-lg font-bold text-gray-900">
              {selectedDay === 15 ? "Eventos de hoje" : `Eventos dia ${selectedDay}`}
            </h3>
            {hasEvents && (
              <span className="text-xs text-gray-400 font-medium bg-white px-2 py-1 rounded-md border border-gray-100">
                {events.length} Lembretes
              </span>
            )}
          </div>

          {/* CONTEÚDO DINÂMICO DOS EVENTOS */}
          {!hasEvents ? (
            // --- ESTADO: SEM LEMBRETES ---
            <div className="bg-white border border-dashed border-gray-200 rounded-[24px] p-8 flex flex-col items-center justify-center text-center animate-[fadeIn_0.3s_ease-out]">
              <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4 text-gray-300">
                <CalendarIcon size={28} />
              </div>
              <p className="text-gray-900 font-semibold mb-1">Dia livre!</p>
              <p className="text-gray-400 text-sm max-w-[220px]">
                Nenhum compromisso agendado para este dia. Aproveite para descansar.
              </p>
              <button className="mt-6 text-teal-600 text-sm font-bold flex items-center gap-1 hover:gap-2 transition-all">
                Agendar atividade <ChevronRight size={14} />
              </button>
            </div>
          ) : (
            // --- ESTADO: COM LEMBRETES ---
            <div className="space-y-4 relative">
              {/* Linha Vertical Conectora (Timeline) */}
              <div className="absolute left-[19px] top-4 bottom-4 w-[2px] bg-gray-100 rounded-full z-0"></div>

              {events.map((evt, idx) => (
                <div
                  key={evt.id}
                  className="relative z-10 animate-[slideUp_0.3s_ease-out]"
                  style={{ animationDelay: `${idx * 0.1}s` }}
                >
                  <div className="flex gap-4 items-start group cursor-pointer">
                    {/* Coluna da Hora (Timeline Node) */}
                    <div className="flex flex-col items-center min-w-[40px]">
                      <div
                        className={`
                                        w-10 h-10 rounded-full border-4 border-gray-50 flex items-center justify-center bg-white shadow-sm z-10 transition-transform group-hover:scale-110
                                        ${idx === 0 ? "ring-2 ring-teal-100" : ""}
                                    `}
                      >
                        <div
                          className={`w-2.5 h-2.5 rounded-full ${
                            idx === 0 ? "bg-teal-500" : "bg-gray-300"
                          }`}
                        ></div>
                      </div>
                      <span className="text-xs font-bold text-gray-500 mt-2 bg-gray-50 px-1.5 rounded">
                        {evt.time}
                      </span>
                    </div>

                    {/* Card do Evento */}
                    <div className="flex-1 bg-white p-4 rounded-[20px] shadow-sm border border-transparent hover:border-teal-100 hover:shadow-md transition-all">
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="font-bold text-gray-800 text-base">{evt.title}</h4>
                        <button className="text-gray-300 hover:text-gray-500">
                          <MoreHorizontal size={18} />
                        </button>
                      </div>

                      <div className="flex flex-col gap-2">
                        {/* Localização */}
                        <div className="flex items-center gap-2 text-gray-500">
                          <MapPin size={14} className="shrink-0" />
                          <span className="text-xs font-medium truncate">{evt.location}</span>
                        </div>

                        {/* Duração Badge */}
                        <div className="flex items-center gap-2">
                          <div className="flex items-center gap-1 bg-gray-50 px-2 py-1 rounded-md text-gray-500 text-[10px] font-bold uppercase tracking-wide">
                            <Clock size={10} />
                            {evt.duration}
                          </div>

                          {/* Tag de Tipo */}
                          <span
                            className={`text-[10px] font-bold px-2 py-1 rounded-md uppercase tracking-wide
                                                ${
                                                  evt.type === "medical"
                                                    ? "bg-rose-50 text-rose-500"
                                                    : ""
                                                }
                                                ${
                                                  evt.type === "activity"
                                                    ? "bg-emerald-50 text-emerald-500"
                                                    : ""
                                                }
                                                ${
                                                  evt.type === "grooming"
                                                    ? "bg-blue-50 text-blue-500"
                                                    : ""
                                                }
                                            `}
                          >
                            {evt.type === "medical"
                              ? "Saúde"
                              : evt.type === "grooming"
                              ? "Estética"
                              : "Lazer"}
                          </span>
                        </div>
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
