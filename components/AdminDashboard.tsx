import React, { useState } from 'react';
import { User, Transaction, PlanType } from '../types';
import { User as UserIcon, Building2, CreditCard, BarChart2, CheckCircle, XCircle, Search, MoreVertical, LogOut, LayoutDashboard, ShieldCheck } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface AdminDashboardProps {
    users: User[];
    onUpdateUserStatus: (userId: string, action: 'block' | 'verify') => void;
    onLogout: () => void;
}

// Mock Data for SaaS Stats
const revenueData = [
  { name: 'Jan', value: 450000 },
  { name: 'Fev', value: 620000 },
  { name: 'Mar', value: 850000 },
  { name: 'Abr', value: 780000 },
  { name: 'Mai', value: 1100000 },
  { name: 'Jun', value: 1450000 },
];

const mockTransactions: Transaction[] = [
    { id: 't1', user: 'Tech Angola Lda', plan: PlanType.PROFESSIONAL, amount: 10000, date: '2023-10-24', status: 'Pendente', method: 'Multicaixa' },
    { id: 't2', user: 'Casa Bela', plan: PlanType.PREMIUM, amount: 25000, date: '2023-10-23', status: 'Aprovado', method: 'Visa' },
    { id: 't3', user: 'Global Finance', plan: PlanType.BASIC, amount: 2000, date: '2023-10-22', status: 'Aprovado', method: 'Multicaixa' },
    { id: 't4', user: 'Mundo Digital', plan: PlanType.PROFESSIONAL, amount: 10000, date: '2023-10-21', status: 'Rejeitado', method: 'Visa' },
];

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ users, onUpdateUserStatus, onLogout }) => {
    const [view, setView] = useState<'OVERVIEW' | 'USERS' | 'PAYMENTS'>('OVERVIEW');
    const [transactions, setTransactions] = useState<Transaction[]>(mockTransactions);
    const [searchTerm, setSearchTerm] = useState('');
    const [autoConfirm, setAutoConfirm] = useState(false);

    // Stats Calculation
    const totalUsers = users.length;
    const businessUsers = users.filter(u => u.isBusiness).length;
    const mrr = transactions.filter(t => t.status === 'Aprovado').reduce((acc, curr) => acc + curr.amount, 0);

    const filteredUsers = users.filter(u => 
        u.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
        u.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleTransactionAction = (id: string, action: 'approve' | 'reject') => {
        setTransactions(transactions.map(t => {
            if (t.id === id) {
                return { ...t, status: action === 'approve' ? 'Aprovado' : 'Rejeitado' };
            }
            return t;
        }));
    };

    const StatusBadge = ({ status }: { status: string }) => {
        const styles = {
            'Pendente': 'bg-yellow-100 text-yellow-700',
            'Aprovado': 'bg-green-100 text-green-700',
            'Rejeitado': 'bg-red-100 text-red-700'
        };
        return (
            <span className={`px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider ${styles[status as keyof typeof styles] || 'bg-gray-100'}`}>
                {status}
            </span>
        );
    };

    const SidebarItem = ({ icon: Icon, label, active, onClick }: any) => (
        <button 
            onClick={onClick}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${active ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200' : 'text-gray-500 hover:bg-gray-100'}`}
        >
            <Icon size={20} />
            <span className="font-medium text-sm">{label}</span>
        </button>
    );

    return (
        <div className="h-screen w-full bg-gray-100 flex overflow-hidden">
            {/* Sidebar */}
            <div className="w-64 bg-white border-r border-gray-200 flex flex-col p-6">
                <div className="flex items-center gap-2 mb-10 px-2">
                    <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
                        <ShieldCheck className="text-white" size={18} />
                    </div>
                    <h1 className="text-xl font-black text-gray-900 tracking-tight">Facilita <span className="text-indigo-600">Admin</span></h1>
                </div>

                <div className="space-y-2 flex-1">
                    <SidebarItem icon={LayoutDashboard} label="Visão Geral" active={view === 'OVERVIEW'} onClick={() => setView('OVERVIEW')} />
                    <SidebarItem icon={UserIcon} label="Utilizadores" active={view === 'USERS'} onClick={() => setView('USERS')} />
                    <SidebarItem icon={CreditCard} label="Pagamentos" active={view === 'PAYMENTS'} onClick={() => setView('PAYMENTS')} />
                </div>

                <button onClick={onLogout} className="flex items-center gap-3 px-4 py-3 text-red-600 hover:bg-red-50 rounded-xl transition-colors">
                    <LogOut size={20} />
                    <span className="font-medium text-sm">Sair</span>
                </button>
            </div>

            {/* Main Content */}
            <div className="flex-1 overflow-y-auto">
                {/* Top Header */}
                <div className="bg-white border-b border-gray-200 px-8 py-5 flex justify-between items-center sticky top-0 z-20">
                    <h2 className="text-2xl font-bold text-gray-800">
                        {view === 'OVERVIEW' && 'Dashboard'}
                        {view === 'USERS' && 'Gestão de Utilizadores'}
                        {view === 'PAYMENTS' && 'Financeiro'}
                    </h2>
                    <div className="flex items-center gap-4">
                        <div className="text-right">
                            <p className="text-sm font-bold text-gray-900">Admin Master</p>
                            <p className="text-xs text-gray-500">super@facilita.ao</p>
                        </div>
                        <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center border-2 border-white shadow-sm">
                            <UserIcon size={20} className="text-gray-500" />
                        </div>
                    </div>
                </div>

                <div className="p-8">
                    {view === 'OVERVIEW' && (
                        <div className="space-y-8">
                            {/* KPI Cards */}
                            <div className="grid grid-cols-3 gap-6">
                                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                                    <div className="flex justify-between items-start mb-4">
                                        <div className="p-3 bg-indigo-50 rounded-xl text-indigo-600"><Building2 size={24} /></div>
                                        <span className="text-green-500 text-xs font-bold">+12%</span>
                                    </div>
                                    <p className="text-gray-500 text-sm font-medium">Receita Mensal (MRR)</p>
                                    <h3 className="text-3xl font-bold text-gray-900 mt-1">
                                        {mrr.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} Kz
                                    </h3>
                                </div>
                                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                                    <div className="flex justify-between items-start mb-4">
                                        <div className="p-3 bg-teal-50 rounded-xl text-teal-600"><UserIcon size={24} /></div>
                                        <span className="text-green-500 text-xs font-bold">+5%</span>
                                    </div>
                                    <p className="text-gray-500 text-sm font-medium">Total Utilizadores</p>
                                    <h3 className="text-3xl font-bold text-gray-900 mt-1">{totalUsers}</h3>
                                </div>
                                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                                    <div className="flex justify-between items-start mb-4">
                                        <div className="p-3 bg-orange-50 rounded-xl text-orange-600"><BarChart2 size={24} /></div>
                                        <span className="text-gray-400 text-xs font-bold">0%</span>
                                    </div>
                                    <p className="text-gray-500 text-sm font-medium">Empresas Ativas</p>
                                    <h3 className="text-3xl font-bold text-gray-900 mt-1">{businessUsers}</h3>
                                </div>
                            </div>

                            {/* Chart */}
                            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                                <h3 className="text-lg font-bold text-gray-900 mb-6">Crescimento da Receita</h3>
                                <div className="h-80 w-full">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <AreaChart data={revenueData}>
                                            <defs>
                                                <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                                                    <stop offset="5%" stopColor="#4F46E5" stopOpacity={0.3}/>
                                                    <stop offset="95%" stopColor="#4F46E5" stopOpacity={0}/>
                                                </linearGradient>
                                            </defs>
                                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                                            <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#9CA3AF', fontSize: 12}} dy={10} />
                                            <YAxis axisLine={false} tickLine={false} tick={{fill: '#9CA3AF', fontSize: 12}} tickFormatter={(value) => `${value/1000}k`} />
                                            <Tooltip 
                                                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)' }}
                                                formatter={(value: number) => `${value.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} Kz`}
                                            />
                                            <Area type="monotone" dataKey="value" stroke="#4F46E5" strokeWidth={3} fillOpacity={1} fill="url(#colorValue)" />
                                        </AreaChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>
                        </div>
                    )}

                    {view === 'USERS' && (
                        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                            <div className="p-6 border-b border-gray-200 flex justify-between items-center">
                                <div className="relative w-64">
                                    <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                    <input 
                                        type="text" 
                                        placeholder="Buscar utilizador..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-indigo-500"
                                    />
                                </div>
                                <div className="flex gap-2">
                                    <button className="px-4 py-2 bg-gray-100 text-gray-600 rounded-lg text-sm font-bold hover:bg-gray-200">Exportar</button>
                                </div>
                            </div>
                            <table className="w-full text-left">
                                <thead className="bg-gray-50 text-gray-500 text-xs uppercase font-bold">
                                    <tr>
                                        <th className="px-6 py-4">Utilizador</th>
                                        <th className="px-6 py-4">Tipo</th>
                                        <th className="px-6 py-4">Plano</th>
                                        <th className="px-6 py-4">Estado</th>
                                        <th className="px-6 py-4 text-right">Ações</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {filteredUsers.map(u => (
                                        <tr key={u.id} className="hover:bg-gray-50 transition-colors">
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 rounded-full bg-gray-200 overflow-hidden">
                                                        <img src={u.profileImage} alt="" className="w-full h-full object-cover" />
                                                    </div>
                                                    <div>
                                                        <p className="font-bold text-gray-900 text-sm">{u.name}</p>
                                                        <p className="text-gray-500 text-xs">{u.email}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`px-2 py-1 rounded-md text-[10px] font-bold uppercase ${u.isBusiness ? 'bg-indigo-100 text-indigo-700' : 'bg-gray-100 text-gray-600'}`}>
                                                    {u.isBusiness ? 'Empresa' : 'Pessoal'}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                {u.isBusiness ? (
                                                    <span className="text-sm font-medium text-gray-700">{u.plan || 'Básico'}</span>
                                                ) : (
                                                    <span className="text-gray-400 text-sm">-</span>
                                                )}
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className="inline-flex items-center gap-1.5 text-green-600 text-xs font-bold bg-green-50 px-2 py-1 rounded-full">
                                                    <div className="w-1.5 h-1.5 rounded-full bg-green-500"></div> Ativo
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <button className="text-gray-400 hover:text-gray-600">
                                                    <MoreVertical size={18} />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}

                    {view === 'PAYMENTS' && (
                        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                             <div className="p-6 border-b border-gray-200 flex justify-between items-center bg-gray-50">
                                <div>
                                    <h3 className="font-bold text-gray-900">Transações Recentes</h3>
                                    <p className="text-sm text-gray-500">Controle de pagamentos de planos</p>
                                </div>
                                <div className="flex items-center gap-3">
                                    <span className="text-sm font-medium text-gray-600">Confirmação Automática</span>
                                    <button 
                                        onClick={() => setAutoConfirm(!autoConfirm)}
                                        className={`w-12 h-6 rounded-full p-1 transition-colors ${autoConfirm ? 'bg-green-500' : 'bg-gray-300'}`}
                                    >
                                        <div className={`w-4 h-4 bg-white rounded-full shadow-sm transition-transform ${autoConfirm ? 'translate-x-6' : 'translate-x-0'}`}></div>
                                    </button>
                                </div>
                            </div>
                            <table className="w-full text-left">
                                <thead className="bg-white text-gray-500 text-xs uppercase font-bold border-b border-gray-100">
                                    <tr>
                                        <th className="px-6 py-4">Empresa</th>
                                        <th className="px-6 py-4">Plano</th>
                                        <th className="px-6 py-4">Valor</th>
                                        <th className="px-6 py-4">Método</th>
                                        <th className="px-6 py-4">Estado</th>
                                        <th className="px-6 py-4 text-right">Ações</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {transactions.map(t => (
                                        <tr key={t.id} className="hover:bg-gray-50 transition-colors">
                                            <td className="px-6 py-4 font-bold text-gray-900 text-sm">{t.user}</td>
                                            <td className="px-6 py-4 text-sm text-gray-600">{t.plan}</td>
                                            <td className="px-6 py-4 font-mono text-sm text-gray-900">
                                                {t.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} Kz
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-500">{t.method}</td>
                                            <td className="px-6 py-4">
                                                <StatusBadge status={t.status} />
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                {t.status === 'Pendente' && (
                                                    <div className="flex justify-end gap-2">
                                                        <button 
                                                            onClick={() => handleTransactionAction(t.id, 'approve')}
                                                            className="p-1 text-green-600 hover:bg-green-50 rounded"
                                                        >
                                                            <CheckCircle size={18} />
                                                        </button>
                                                        <button 
                                                            onClick={() => handleTransactionAction(t.id, 'reject')}
                                                            className="p-1 text-red-600 hover:bg-red-50 rounded"
                                                        >
                                                            <XCircle size={18} />
                                                        </button>
                                                    </div>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};