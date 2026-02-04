import React, { useState } from 'react';
import { 
  Bell, 
  ChevronDown, 
  Plus, 
  Check, 
  Clock, 
  MapPin, 
  Home, 
  Calendar, 
  Image as ImageIcon, 
  User, 
  Play,
  Award,
  Bone,
  Search,
  Droplets
} from 'lucide-react';

// --- Dados Mockados ---

const PET_DATA = {
  name: "Paçoca",
  breed: "Golden Retriever",
  age: "2 anos",
  sex: "Macho",
  weight: "28kg",
  image: "https://images.unsplash.com/photo-1552053831-71594a27632d?auto=format&fit=crop&w=150&q=80"
};

const INITIAL_TASKS = [
  { id: 1, title: "Café da manhã", time: "08:00", type: "food", completed: true, action: "Registrar" },
  { id: 2, title: "Passeio Matinal", time: "09:30", type: "activity", completed: false, action: "Iniciar", duration: "30 min" },
  { id: 3, title: "Trocar Água", time: "12:00", type: "water", completed: false, action: "Check" },
  { id: 4, title: "Brincadeira no Parque", time: "17:00", type: "play", completed: false, action: "Iniciar" },
  { id: 5, title: "Jantar", time: "19:00", type: "food", completed: false, action: "Registrar" },
];

export default function App() {
  // Estado para simular os cenários solicitados (a, b, c)
  const [scenario, setScenario] = useState('partial'); // 'empty', 'partial', 'complete'
  const [tasks, setTasks] = useState(INITIAL_TASKS);

  // Lógica de filtro baseada no cenário para demonstração
  const getDisplayedTasks = () => {
    if (scenario === 'empty') return [];
    
    // No cenário completo, forçamos todas como true visualmente
    if (scenario === 'complete') {
        return tasks.map(t => ({ ...t, completed: true }));
    }
    
    // Cenário parcial usa o estado real (simulado inicial)
    return tasks;
  };

  const currentTasks = getDisplayedTasks();
  const completedCount = currentTasks.filter(t => t.completed).length;
  const totalCount = currentTasks.length;
  const progressPercentage = totalCount === 0 ? 0 : (completedCount / totalCount) * 100;

  const toggleTask = (id) => {
    if (scenario !== 'partial') return; // Bloqueia edição nos modos de demonstração estática
    setTasks(prev => prev.map(t => t.id === id ? { ...t, completed: !t.completed } : t));
  };

  // Cores do Design System (Mint Teal - Opção C)
  const colors = {
    bg: "bg-gray-50", // Fundo geral neutro
    cardBg: "bg-white",
    primary: "text-teal-600",
    primaryBg: "bg-teal-600",
    primaryLight: "bg-teal-50",
    primaryBorder: "border-teal-100",
    textMain: "text-gray-900",
    textSec: "text-gray-500",
    success: "text-emerald-500",
    successBg: "bg-emerald-50"
  };

  return (
    <div className={`w-full min-h-screen ${colors.bg} font-sans pb-28 relative overflow-hidden select-none`}>
      
      {/* --- DEV CONTROLS (Overlay para testar estados) --- */}
      <div className="fixed top-0 left-0 right-0 z-50 bg-gray-900/90 backdrop-blur-sm text-white text-[10px] py-2 px-4 flex justify-between items-center shadow-lg">
        <span className="font-bold opacity-70 uppercase tracking-widest hidden sm:inline">Simular Cenários:</span>
        <div className="flex gap-2 mx-auto sm:mx-0">
          <button onClick={() => setScenario('empty')} className={`px-3 py-1 rounded-full border transition-all ${scenario === 'empty' ? 'bg-teal-500 border-teal-500 text-white' : 'border-gray-600 text-gray-400 hover:border-gray-400'}`}>A. Vazio</button>
          <button onClick={() => setScenario('partial')} className={`px-3 py-1 rounded-full border transition-all ${scenario === 'partial' ? 'bg-teal-500 border-teal-500 text-white' : 'border-gray-600 text-gray-400 hover:border-gray-400'}`}>B. Parcial</button>
          <button onClick={() => setScenario('complete')} className={`px-3 py-1 rounded-full border transition-all ${scenario === 'complete' ? 'bg-teal-500 border-teal-500 text-white' : 'border-gray-600 text-gray-400 hover:border-gray-400'}`}>C. Completo</button>
        </div>
      </div>

      {/* Spacer para o header dev */}
      <div className="h-12"></div>

      {/* --- HEADER --- */}
      <header className="px-6 pt-4 pb-2 flex justify-between items-center">
        <div className="flex flex-col">
          <span className={`text-sm font-medium ${colors.textSec}`}>Bom dia,</span>
          <h1 className={`text-2xl font-bold ${colors.textMain} tracking-tight`}>Ana Silva</h1>
        </div>
        <button className="relative p-3 bg-white rounded-2xl shadow-sm border border-gray-100 hover:bg-gray-50 active:scale-95 transition-all">
          <Bell size={20} className={colors.textMain} />
          <span className="absolute top-3 right-3 w-2 h-2 bg-rose-500 rounded-full ring-2 ring-white"></span>
        </button>
      </header>

      {/* --- HERO: PET SELECTOR --- */}
      <section className="px-6 py-6">
        <div className="relative w-full bg-white rounded-[32px] p-1 shadow-[0_12px_30px_-8px_rgba(0,0,0,0.06)] overflow-hidden group">
          
          {/* Decorative Background Elements */}
          <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-br from-teal-50 to-transparent rounded-bl-[100px] opacity-60"></div>
          
          <div className="relative z-10 p-5">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-4">
                {/* Avatar com status */}
                <div className="relative">
                  <div className="w-16 h-16 rounded-full p-1 bg-white shadow-sm">
                    <img 
                      src={PET_DATA.image} 
                      alt={PET_DATA.name} 
                      className="w-full h-full rounded-full object-cover"
                    />
                  </div>
                  <div className="absolute bottom-1 right-0 w-4 h-4 bg-emerald-400 border-[3px] border-white rounded-full"></div>
                </div>
                
                {/* Info */}
                <div>
                  <button className="flex items-center gap-2 group-active:scale-95 transition-transform origin-left">
                    <h2 className={`text-2xl font-bold ${colors.textMain}`}>{PET_DATA.name}</h2>
                    <div className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center">
                      <ChevronDown size={14} className="text-gray-500" />
                    </div>
                  </button>
                  <p className={`text-sm ${colors.textSec} mt-0.5`}>{PET_DATA.breed}</p>
                </div>
              </div>
            </div>

            {/* Chips de Detalhes */}
            <div className="flex gap-2 mt-6">
              <div className={`px-4 py-2 rounded-2xl ${colors.primaryLight} border border-teal-100/50 flex items-center`}>
                <span className={`text-xs font-bold ${colors.primary} uppercase tracking-wide`}>{PET_DATA.sex}</span>
              </div>
              <div className="px-4 py-2 rounded-2xl bg-gray-50 border border-gray-100 flex items-center">
                <span className={`text-xs font-medium ${colors.textSec}`}>{PET_DATA.age}</span>
              </div>
              <div className="px-4 py-2 rounded-2xl bg-gray-50 border border-gray-100 flex items-center">
                <span className={`text-xs font-medium ${colors.textSec}`}>{PET_DATA.weight}</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* --- SECTION: CHECKLIST DO DIA --- */}
      <section className="px-6 mt-2 flex-1 flex flex-col">
        
        {/* Header da Seção + Progresso */}
        <div className="mb-6">
          <div className="flex justify-between items-end mb-4">
            <div>
              <h3 className={`text-xl font-bold ${colors.textMain}`}>Checklist do dia</h3>
              <p className={`text-sm ${colors.textSec} mt-1 font-medium`}>
                {completedCount}/{totalCount} completados
              </p>
            </div>
            
            {/* Botão Adicionar (Minimalista) */}
            <button className={`w-12 h-12 rounded-2xl ${colors.primaryBg} text-white flex items-center justify-center shadow-lg shadow-teal-600/20 active:scale-90 transition-all hover:bg-teal-700`}>
              <Plus size={24} />
            </button>
          </div>

          {/* Barra de Progresso Customizada */}
          <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
            <div 
              className={`h-full ${colors.primaryBg} transition-all duration-1000 ease-out rounded-full relative`} 
              style={{ width: `${progressPercentage}%` }}
            >
              {/* Brilho na ponta da barra */}
              <div className="absolute right-0 top-0 bottom-0 w-2 bg-white/30 rounded-full"></div>
            </div>
          </div>
        </div>

        {/* --- CONTEÚDO DA LISTA (ESTADOS) --- */}
        <div className="flex-1">
          
          {/* ESTADO A: VAZIO */}
          {scenario === 'empty' && (
            <div className="flex flex-col items-center justify-center py-12 text-center animate-[fadeIn_0.5s_ease-out]">
              <div className={`w-24 h-24 ${colors.primaryLight} rounded-full flex items-center justify-center mb-6`}>
                <Bone size={40} className="text-teal-300" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">Tudo limpo por aqui!</h3>
              <p className="text-gray-400 text-sm max-w-[200px] leading-relaxed">
                Nenhuma atividade pendente para o {PET_DATA.name} hoje.
              </p>
              <button className="mt-8 text-teal-600 font-semibold text-sm hover:underline">
                Ver histórico de ontem
              </button>
            </div>
          )}

          {/* ESTADO C: COMPLETO (Banner de Sucesso) */}
          {scenario === 'complete' && completedCount > 0 && (
             <div className="mb-8 bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-100 p-5 rounded-[24px] flex items-center gap-4 animate-[slideDown_0.4s_ease-out]">
               <div className="bg-white p-3 rounded-full shadow-sm">
                 <Award size={24} className="text-emerald-500" />
               </div>
               <div>
                 <p className="text-emerald-900 font-bold text-base">Parabéns!</p>
                 <p className="text-emerald-700/80 text-sm mt-0.5">Todas as tarefas foram concluídas.</p>
               </div>
             </div>
          )}

          {/* LISTA DE TAREFAS */}
          <div className="space-y-4 pb-24">
            {currentTasks.map((task) => (
              <div 
                key={task.id}
                onClick={() => toggleTask(task.id)}
                className={`
                  group relative bg-white rounded-[24px] p-4 pr-5 flex items-center justify-between 
                  transition-all duration-300 border border-transparent cursor-pointer
                  ${task.completed ? 'opacity-60 bg-gray-50/50 grayscale-[0.5]' : 'shadow-sm hover:shadow-[0_8px_20px_rgba(0,0,0,0.04)] hover:border-teal-50'}
                `}
              >
                <div className="flex items-center gap-4">
                  {/* Icon Box */}
                  <div className={`
                    w-14 h-14 rounded-[18px] flex items-center justify-center transition-colors
                    ${task.completed ? 'bg-gray-100 text-gray-400' : 'bg-teal-50 text-teal-600'}
                  `}>
                    {task.type === 'food' && <Bone size={22} />}
                    {task.type === 'activity' && <MapPin size={22} />}
                    {task.type === 'water' && <Droplets size={22} />}
                    {task.type === 'play' && <Play size={22} />}
                  </div>

                  {/* Texts */}
                  <div>
                    <h4 className={`text-base font-bold ${task.completed ? 'text-gray-400 line-through decoration-gray-300' : 'text-gray-800'}`}>
                      {task.title}
                    </h4>
                    <div className="flex items-center gap-2 mt-1.5">
                      <div className={`flex items-center gap-1 ${task.completed ? "text-gray-400" : "text-teal-500"}`}>
                        <Clock size={13} />
                        <span className="text-xs font-semibold tracking-wide">{task.time}</span>
                      </div>
                      {task.duration && (
                        <>
                          <span className="text-gray-300">•</span>
                          <span className="text-xs text-gray-400">{task.duration}</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                {/* Action Area */}
                <div>
                  {task.completed ? (
                    <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center animate-[scaleIn_0.2s_ease-out]">
                      <Check size={20} className="text-emerald-600" />
                    </div>
                  ) : (
                    <button 
                      onClick={(e) => {
                        e.stopPropagation(); // Evita trigger no card
                        toggleTask(task.id);
                      }}
                      className={`
                        px-5 py-2.5 rounded-xl text-xs font-bold transition-all transform active:scale-95
                        ${task.action === 'Iniciar' 
                          ? 'bg-teal-600 text-white shadow-lg shadow-teal-200 hover:bg-teal-700' 
                          : 'bg-teal-50 text-teal-700 hover:bg-teal-100'}
                      `}
                    >
                      {task.action}
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* --- BOTTOM NAVIGATION (Glassmorphism) --- */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-md border-t border-gray-100 pb-safe pt-2 px-8 h-[88px] flex justify-between items-start z-40 shadow-[0_-10px_40px_rgba(0,0,0,0.03)]">
        <NavIcon icon={<Home size={24} />} active label="Home" />
        <NavIcon icon={<Calendar size={24} />} label="Agenda" />
        <NavIcon icon={<ImageIcon size={24} />} label="Memórias" />
        <NavIcon icon={<Search size={24} />} label="Explorar" />
        <NavIcon icon={<User size={24} />} label="Perfil" />
      </nav>

    </div>
  );
}

// Componente NavIcon com suporte a Label opcional (oculto por padrão no estilo clean, mas acessível)
function NavIcon({ icon, active, label }) {
  return (
    <button className={`group pt-3 flex flex-col items-center gap-1.5 transition-colors ${active ? 'text-teal-600' : 'text-gray-400 hover:text-gray-600'}`}>
      <div className={`transition-transform duration-300 ${active ? '-translate-y-1' : 'group-hover:-translate-y-1'}`}>
        {icon}
      </div>
      {/* Indicador de ativo (Ponto) */}
      <span className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${active ? 'bg-teal-600 opacity-100' : 'bg-transparent opacity-0'}`}></span>
    </button>
  );
}