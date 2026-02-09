
import React, { useState, useEffect } from 'react';
import { LayoutDashboard, ListTodo, Settings, FileSpreadsheet, PlusCircle, AlertCircle, Download } from 'lucide-react';
import { Ticket } from './types';
import Dashboard from './components/Dashboard';
import TicketTable from './components/TicketTable';
import StatusConfig from './components/StatusConfig';
import ExcelGuide from './components/ExcelGuide';
import TicketForm from './components/TicketForm';

const INITIAL_STATUSES: string[] = [
  "Resolvido",
  "Pendente Usuário",
  "Pendente Fornecedor",
  "N1",
  "Exaudi",
  "2G",
  "Pendente PO"
];

const App: React.FC = () => {
  const [view, setView] = useState<'dashboard' | 'tickets' | 'config' | 'guide' | 'form'>('dashboard');
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [statuses, setStatuses] = useState<string[]>(INITIAL_STATUSES);
  const [editingTicket, setEditingTicket] = useState<Ticket | null>(null);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);

  useEffect(() => {
    const saved = localStorage.getItem('tickets_data');
    if (saved) setTickets(JSON.parse(saved));

    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
    });
  }, []);

  useEffect(() => {
    localStorage.setItem('tickets_data', JSON.stringify(tickets));
  }, [tickets]);

  const handleInstall = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') setDeferredPrompt(null);
    }
  };

  const handleAddUpdateTicket = (ticket: Ticket) => {
    setTickets(prev => {
      const index = prev.findIndex(t => t.id === ticket.id);
      if (index >= 0) {
        const updated = [...prev];
        updated[index] = ticket;
        return updated;
      }
      return [...prev, ticket];
    });
    setView('tickets');
    setEditingTicket(null);
  };

  const menuItems = [
    { id: 'dashboard', label: 'Painel KPI', icon: LayoutDashboard },
    { id: 'tickets', label: 'Chamados', icon: ListTodo },
    { id: 'form', label: 'Novo/Editar', icon: PlusCircle },
    { id: 'config', label: 'Status', icon: Settings },
    { id: 'guide', label: 'Manual & Host', icon: FileSpreadsheet },
  ];

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      <aside className="w-64 bg-slate-900 text-white flex flex-col shrink-0">
        <div className="p-6 flex items-center gap-3">
          <div className="bg-blue-600 p-2 rounded-lg">
            <AlertCircle size={24} />
          </div>
          <span className="font-bold text-xl tracking-tight">TicketMaster</span>
        </div>
        
        <nav className="flex-1 px-4 py-4 space-y-1">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => {
                setView(item.id as any);
                if (item.id !== 'form') setEditingTicket(null);
              }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                view === item.id 
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/20' 
                : 'text-slate-400 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <item.icon size={20} />
              <span className="font-medium">{item.label}</span>
            </button>
          ))}
        </nav>

        <div className="p-4 space-y-3 border-t border-slate-800">
          {deferredPrompt && (
            <button 
              onClick={handleInstall}
              className="w-full flex items-center gap-2 justify-center bg-emerald-600 hover:bg-emerald-700 text-white py-2 rounded-lg text-xs font-bold transition-all"
            >
              <Download size={14} /> Instalar Aplicativo
            </button>
          )}
          <div className="bg-slate-800 rounded-lg p-3 text-[10px] text-slate-400 text-center">
            SISTEMA ATIVO 24H • PWA READY
          </div>
        </div>
      </aside>

      <main className="flex-1 flex flex-col overflow-hidden">
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-8 shrink-0">
          <h1 className="text-xl font-semibold text-slate-800">
            {menuItems.find(m => m.id === view)?.label}
          </h1>
          <div className="flex items-center gap-4">
            <span className="text-sm text-slate-500 font-medium">Acesso via Cloud</span>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
          {view === 'dashboard' && <Dashboard tickets={tickets} />}
          {view === 'tickets' && (
            <TicketTable 
              tickets={tickets} 
              onEdit={(t) => { setEditingTicket(t); setView('form'); }} 
              onDelete={(id) => setTickets(prev => prev.filter(t => t.id !== id))}
            />
          )}
          {view === 'form' && (
            <TicketForm 
              initialData={editingTicket} 
              onSubmit={handleAddUpdateTicket} 
              statuses={statuses}
            />
          )}
          {view === 'config' && <StatusConfig statuses={statuses} onUpdate={setStatuses} />}
          {view === 'guide' && <ExcelGuide />}
        </div>
      </main>
    </div>
  );
};

export default App;
