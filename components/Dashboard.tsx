

import React, { useState } from 'react';
import { Search, Bell, ShoppingBag, ArrowRight, Star, MapPin, Phone, Mail, Globe, ChevronRight } from 'lucide-react';
import { Bank, Product, Notification, User } from '../types';
import { Button } from './Button';

// Helper Component for Bank Logo
const BankLogo = ({ name, logo, large = false }: { name: string; logo: string; large?: boolean }) => {
  const [error, setError] = useState(false);

  if (!logo || error) {
    return (
      <div className={`w-full h-full bg-indigo-50 flex items-center justify-center text-indigo-600 font-bold rounded-full ${large ? 'text-2xl' : 'text-xs'}`}>
        {name.substring(0, 3).toUpperCase()}
      </div>
    );
  }

  return (
    <img
      src={logo}
      alt={name}
      className="w-full h-full object-cover rounded-full "
      onError={() => setError(true)}
    />
  );
};

interface DashboardProps {
  products: Product[];
  banks: Bank[];
  otherCompanies: Bank[];
  onSelectBank: (bank: Bank) => void;
  onSelectProduct: (product: Product) => void;
  onViewMarket: () => void;
  notifications: Notification[];
  onClearNotifications?: () => void;
  onNotificationClick?: (notification: Notification) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({
  products,
  banks,
  otherCompanies,
  onSelectBank,
  onSelectProduct,
  onViewMarket,
  notifications = [],
  onClearNotifications,
  onNotificationClick
}) => {
  const [showNotifications, setShowNotifications] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Notifications count
  const unreadCount = notifications.filter(n => !n.read).length;

  // Filtered lists
  const promotedProducts = products.filter(p => p.isPromoted).slice(0, 8);
  
  // Search Logic
  const filteredProducts = searchQuery 
    ? products.filter(p => p.title.toLowerCase().includes(searchQuery.toLowerCase()) || p.companyName.toLowerCase().includes(searchQuery.toLowerCase()))
    : [];
    
  const filteredBanks = searchQuery
    ? [...banks, ...otherCompanies].filter(b => b.name.toLowerCase().includes(searchQuery.toLowerCase()))
    : [];

  const getNotificationIconColor = (type: string) => {
    switch (type) {
      case 'promo': return 'bg-teal-100 text-teal-600';
      case 'alert': return 'bg-red-100 text-red-600';
      case 'success': return 'bg-green-100 text-green-600';
      case 'message': return 'bg-blue-100 text-blue-600';
      default: return 'bg-indigo-100 text-indigo-600';
    }
  };

  return (
    <div className="h-full bg-gray-50 dark:bg-gray-900 overflow-y-auto pb-20 no-scrollbar relative transition-colors duration-300">
      {/* Search Overlay */}
      {searchQuery && (
        <div className="absolute inset-0 bg-white dark:bg-gray-900 z-50 animate-[fadeIn_0.2s_ease-out] flex flex-col">
             <div className="p-4 pt-12 border-b border-gray-100 dark:border-gray-800 flex items-center gap-3 bg-white dark:bg-gray-900 sticky top-0 shadow-sm z-50">
                <button onClick={() => setSearchQuery('')} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full">
                    <ArrowRight size={22} className="text-gray-600 dark:text-gray-300 rotate-180" />
                </button>
                <div className="flex-1 relative">
                    <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input 
                        type="text" 
                        autoFocus
                        placeholder="Buscar empresas, produtos..." 
                        className="w-full pl-10 pr-4 py-3 bg-gray-50 dark:bg-gray-800 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:text-white transition-all"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
             </div>
             <div className="flex-1 overflow-y-auto p-4 space-y-6 max-w-4xl mx-auto w-full">
                {filteredBanks.length > 0 && (
                    <div>
                        <h3 className="text-xs font-bold text-gray-500 uppercase mb-3">Empresas e Bancos</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                            {filteredBanks.map(bank => (
                                <button key={bank.id} onClick={() => { onSelectBank(bank); setSearchQuery(''); }} className="w-full flex items-center gap-3 p-3 bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-2xl hover:bg-indigo-50 dark:hover:bg-indigo-900/20 hover:border-indigo-100 transition-all shadow-sm">
                                    <div className="w-10 h-10 bg-gray-50 dark:bg-gray-700 rounded-full overflow-hidden flex items-center justify-center">
                                        <BankLogo name={bank.name} logo={bank.logo} />
                                    </div>
                                    <div className="text-left">
                                        <p className="font-bold text-gray-900 dark:text-white text-sm">{bank.name}</p>
                                        <p className="text-[10px] text-gray-500 dark:text-gray-400">Ver perfil</p>
                                    </div>
                                    <ChevronRight size={16} className="ml-auto text-gray-300 dark:text-gray-600" />
                                </button>
                            ))}
                        </div>
                    </div>
                )}
                {filteredProducts.length > 0 && (
                    <div>
                        <h3 className="text-xs font-bold text-gray-500 uppercase mb-3 mt-4">Produtos e Serviços</h3>
                         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                            {filteredProducts.map(product => (
                                <button key={product.id} onClick={() => { onSelectProduct(product); setSearchQuery(''); }} className="w-full flex items-center gap-3 p-3 bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-2xl hover:bg-indigo-50 dark:hover:bg-indigo-900/20 hover:border-indigo-100 transition-all shadow-sm">
                                    <div className="w-12 h-12 bg-gray-50 dark:bg-gray-700 rounded-lg overflow-hidden shrink-0">
                                        <img src={product.image} alt={product.title} className="w-full h-full object-cover" />
                                    </div>
                                    <div className="text-left flex-1 min-w-0">
                                        <p className="font-bold text-gray-900 dark:text-white text-sm truncate">{product.title}</p>
                                        <p className="text-xs text-gray-500 dark:text-gray-400">{product.companyName}</p>
                                    </div>
                                    <span className="text-teal-600 dark:text-teal-400 font-bold text-xs whitespace-nowrap">{product.price.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} Kz</span>
                                </button>
                            ))}
                        </div>
                    </div>
                )}
                {filteredBanks.length === 0 && filteredProducts.length === 0 && (
                    <div className="text-center py-10 text-gray-500">
                        <p>Nenhum resultado encontrado.</p>
                    </div>
                )}
             </div>
        </div>
      )}

      {/* Notifications Panel (Bottom Sheet style on mobile, Modal on desktop) */}
      {showNotifications && (
        <div className="absolute inset-0 z-50 flex flex-col justify-end md:justify-center md:items-center">
            <div className="absolute inset-0 bg-black/30 backdrop-blur-sm transition-opacity" onClick={() => setShowNotifications(false)}></div>
            <div className="bg-gray-50 dark:bg-gray-900 rounded-t-3xl md:rounded-3xl h-[85%] md:h-[600px] w-full md:w-[450px] overflow-hidden flex flex-col animate-[slideUp_0.3s_ease-out] relative z-10 shadow-2xl">
                <div className="p-6 bg-white dark:bg-gray-800 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center rounded-t-3xl">
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white">Notificações</h2>
                    <button onClick={() => setShowNotifications(false)} className="p-2 bg-gray-100 dark:bg-gray-700 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600">
                        <ArrowRight size={20} className="text-gray-600 dark:text-gray-300 rotate-45" />
                    </button>
                </div>
                <div className="flex-1 overflow-y-auto p-4 space-y-3">
                    {notifications.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-full text-center p-8 opacity-60">
                            <Bell size={48} className="text-gray-400 mb-4" />
                            <p className="text-gray-500 font-medium">Sem novas notificações.</p>
                        </div>
                    ) : (
                        notifications.map(notif => (
                            <div key={notif.id} onClick={() => { if(onNotificationClick) onNotificationClick(notif); setShowNotifications(false); }} className={`bg-white dark:bg-gray-800 p-4 rounded-2xl shadow-sm border ${notif.read ? 'border-gray-100 dark:border-gray-700' : 'border-indigo-100 dark:border-indigo-900 bg-indigo-50/50 dark:bg-indigo-900/10'} flex gap-4 items-start cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors active:scale-95`}>
                                <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${getNotificationIconColor(notif.type)}`}>
                                    {notif.type === 'promo' && <Bell size={18} />}
                                    {notif.type === 'alert' && <div className="font-bold">!</div>}
                                    {notif.type === 'success' && <div className="font-bold">✓</div>}
                                    {notif.type === 'info' && <Bell size={18} />}
                                    {notif.type === 'message' && <Mail size={18} />}
                                </div>
                                <div>
                                    <h3 className="font-bold text-gray-900 dark:text-white text-sm">{notif.title}</h3>
                                    <p className="text-gray-500 dark:text-gray-400 text-xs leading-relaxed mt-0.5">{notif.desc}</p>
                                    <p className="text-[10px] text-gray-400 mt-2 font-medium">{new Date(notif.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</p>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto w-full">
        {/* Header & Search */}
        <div className="px-6 mt-8 mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4 md:pt-6">
          <div className="flex justify-between items-center w-full md:w-auto shrink-0">
            <h1 className="text-xl md:text-3xl font-black text-gray-900 dark:text-white tracking-tight">Destaques</h1>
            <div className="flex gap-3 md:hidden">
                <button 
                    onClick={() => setSearchQuery(' ')} // Hack to open search overlay
                    className="w-10 h-10 flex items-center justify-center bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 text-gray-600 dark:text-gray-300 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 hover:border-indigo-200 hover:text-indigo-600 active:scale-95 transition-all shadow-sm"
                >
                    <div className="min-w-0 max-w-full flex items-center justify-center overflow-hidden">
                        <Search size={20} className="shrink-0" />
                    </div>
                </button>
                <button 
                    onClick={() => { setShowNotifications(true); if(onClearNotifications) onClearNotifications(); }}
                    className="w-10 h-10 flex items-center justify-center bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 text-gray-600 dark:text-gray-300 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 hover:border-indigo-200 hover:text-indigo-600 active:scale-95 transition-all shadow-sm relative"
                >
                    <Bell size={20} />
                    {unreadCount > 0 && (
                        <span className="absolute top-2 right-2.5 w-2 h-2 bg-red-500 rounded-full border border-white dark:border-gray-800"></span>
                    )}
                </button>
            </div>
          </div>
          
          <div className="hidden md:flex flex-1 max-w-2xl px-2 lg:px-8 min-w-0">
            <button onClick={() => setSearchQuery(' ')} className="w-full flex items-center gap-3 px-4 py-3.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl hover:bg-gray-50 dark:hover:bg-gray-700 hover:border-indigo-300 dark:hover:border-indigo-700 text-gray-500 dark:text-gray-400 transition-all shadow-sm group min-w-0">
                <Search size={20} className="group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors shrink-0" />
                <span className="text-sm font-medium truncate">Pesquisar empresas, produtos ou serviços...</span>
            </button>
          </div>
          
          <div className="hidden lg:block w-32 shrink-0"></div>
          <div className="hidden md:block lg:hidden w-20 shrink-0"></div>
        </div>

        {/* Featured Banners (Promoted Products) */}
        {promotedProducts.length > 0 && (
            <div className="mb-8">
                <div className="flex overflow-x-auto gap-4 px-6 pb-4 snap-x snap-mandatory no-scrollbar">
                {promotedProducts.map((product) => (
                    <div key={product.id} className="min-w-[85%] md:min-w-[400px] aspect-[2/1] rounded-3xl overflow-hidden relative shadow-lg snap-center group">
                    <img src={product.image} alt={product.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                    <div className="absolute inset-0 bg-gradient-to-r from-indigo-900/90 via-indigo-900/40 to-transparent flex flex-col justify-center px-6">
                        <div className="w-4/5">
                            <span className="inline-block px-2 py-1 mb-2 text-[10px] font-bold text-white bg-indigo-600 rounded-md uppercase tracking-wider shadow-sm">{product.companyName}</span>
                            <h2 className="text-white text-xl md:text-2xl font-bold mb-1 leading-tight line-clamp-2 drop-shadow-md">{product.title}</h2>
                            {product.price > 0 && (
                                <p className="text-teal-300 text-sm md:text-base font-bold tracking-wide">{product.price.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} Kz</p>
                            )}
                            <button 
                                onClick={() => onSelectProduct(product)}
                                className="mt-3 px-4 py-2 bg-white/20 backdrop-blur-md border border-white/30 text-white rounded-lg text-xs font-bold hover:bg-white hover:text-indigo-900 transition-all cursor-pointer"
                            >
                                Ver Oferta
                            </button>
                        </div>
                    </div>
                    </div>
                ))}
                </div>
            </div>
        )}

        {/* Recent Products/Info */}
        {products.length > 0 && (
            <div className="mb-8">
                <div className="px-6 flex justify-between items-end mb-4">
                    <h2 className="text-xl md:text-2xl font-bold text-gray-800 dark:text-white">Informações</h2>
                    <button onClick={onViewMarket} className="text-indigo-600 dark:text-indigo-400 text-xs font-bold flex items-center hover:underline">
                        Ver tudo <ChevronRight size={14} />
                    </button>
                </div>
                <div className="flex gap-4 overflow-x-auto px-6 no-scrollbar pb-2 snap-x snap-mandatory">
                    {products.slice(0, 8).map((product) => (
                        <button 
                            key={product.id} 
                            onClick={() => onSelectProduct(product)}
                            className="min-w-[220px] h-[140px] rounded-2xl overflow-hidden relative shadow-md snap-center group cursor-pointer"
                        >
                            <img src={product.image} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                            <div className="absolute inset-0 bg-gradient-to-t from-gray-900/80 via-gray-900/20 to-transparent flex flex-col justify-end p-4">
                                <p className="text-white text-sm font-bold leading-tight mb-0.5 line-clamp-2">{product.title}</p>
                                <p className="text-gray-300 text-[10px]">{product.companyName}</p>
                                {product.price > 0 && (
                                    <p className="text-teal-300 text-xs font-bold mt-1">{product.price.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} Kz</p>
                                )}
                            </div>
                        </button>
                    ))}
                </div>
            </div>
        )}

        {/* Banks Section */}
        <div className="mb-8">
            <h2 className="text-xl md:text-2xl font-bold text-gray-800 dark:text-white mb-4 px-6">Bancos</h2>
            {banks.length > 0 ? (
                <div className="flex md:grid md:grid-cols-4 lg:grid-cols-6 gap-4 overflow-x-auto px-6 no-scrollbar pb-4 snap-x snap-mandatory">
                    {banks.map((bank) => (
                        <button
                            key={bank.id}
                            onClick={() => onSelectBank(bank)}
                            className="flex flex-col items-center gap-2 group min-w-[72px] snap-start hover:scale-105 transition-transform p-2 rounded-xl"
                        >
                            <div className="w-16 h-16 rounded-full bg-white dark:bg-gray-800 flex items-center justify-center shadow-sm border border-gray-100 dark:border-gray-700 group-hover:border-indigo-500 group-hover:shadow-indigo-200 dark:group-hover:shadow-indigo-900/30 transition-all overflow-hidden shrink-0">
                                <BankLogo name={bank.name} logo={bank.logo} />
                            </div>
                            <span className="text-[10px] md:text-xs font-medium text-gray-600 dark:text-gray-300 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors text-center line-clamp-1 w-full">
                                {bank.name}
                            </span>
                        </button>
                    ))}
                </div>
            ) : (
                <div className="px-6 py-8 text-center text-gray-400 dark:text-gray-500 bg-gray-100/50 dark:bg-gray-800/30 rounded-xl mx-6 border border-dashed border-gray-200 dark:border-gray-700">
                    <p className="text-sm italic">Nenhum banco registado no momento.</p>
                </div>
            )}
        </div>

        {/* Other Companies Section */}
        <div className="mb-8">
            <h2 className="text-xl md:text-2xl font-bold text-gray-800 dark:text-white mb-4 px-6">Outras Empresas</h2>
            {otherCompanies.length > 0 ? (
                <div className="flex md:grid md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 overflow-x-auto px-6 no-scrollbar pb-4 snap-x snap-mandatory">
                    {otherCompanies.map((company) => (
                        <button
                            key={company.id}
                            onClick={() => onSelectBank(company)}
                            className="flex items-center gap-3 p-3 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 hover:shadow-md hover:border-indigo-100 transition-all text-left group min-w-[200px] snap-start"
                        >
                            <div className="w-10 h-10 rounded-full bg-indigo-50 dark:bg-indigo-900/30 flex items-center justify-center shrink-0 overflow-hidden text-indigo-600 dark:text-indigo-400">
                                <BankLogo name={company.name} logo={company.logo} />
                            </div>
                            <div className="min-w-0">
                                <h3 className="text-sm font-bold text-gray-900 dark:text-white truncate group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">{company.name}</h3>
                                <p className="text-xs text-gray-400 truncate">Ver perfil</p>
                            </div>
                        </button>
                    ))}
                </div>
            ) : (
                 <div className="px-6 py-8 text-center text-gray-400 dark:text-gray-500 bg-gray-100/50 dark:bg-gray-800/30 rounded-xl mx-6 border border-dashed border-gray-200 dark:border-gray-700">
                    <p className="text-sm italic">Nenhuma empresa registada no momento.</p>
                </div>
            )}
        </div>
      </div>
    </div>
  );
};

interface BankProfileProps {
  user: User;
  bank: Bank;
  products: Product[];
  allBanks: Bank[];
  onBack: () => void;
  onSelectProduct: (product: Product) => void;
  onToggleFollow: (bankId: string) => void;
  onRate: (bankId: string) => void;
  onSelectBranch: (branch: Bank) => void;
}

export const BankProfile: React.FC<BankProfileProps> = ({
  user,
  bank,
  products,
  allBanks,
  onBack,
  onSelectProduct,
  onToggleFollow,
  onRate,
  onSelectBranch
}) => {
  const [showDetails, setShowDetails] = useState(false);
  const [activeTab, setActiveTab] = useState<'INFO' | 'BRANCHES'>('INFO');
  const [selectedBranch, setSelectedBranch] = useState<Bank | null>(null);

  const branches = allBanks.filter(b => b.parentId === bank.id && b.type === 'BRANCH');
  const branchProducts = selectedBranch ? products.filter(p => p.ownerId === selectedBranch.id) : [];

  return (
    <div className="h-full bg-gray-50 dark:bg-gray-900 overflow-y-auto pb-20 relative animate-[slideInRight_0.3s_ease-out] transition-colors duration-300">
      {/* Cover Image */}
      <div className="h-48 md:h-64 lg:h-80 w-full relative">
        <img src={bank.coverImage} alt={bank.name} className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-indigo-900/30"></div>
        <button onClick={onBack} className="absolute top-6 left-6 w-10 h-10 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center text-white hover:bg-white/30 transition-colors">
          <ArrowRight size={20} className="rotate-180" />
        </button>
        {bank.type === 'BRANCH' && (
             <div className="absolute bottom-16 left-6 bg-white/90 backdrop-blur px-2 py-1 rounded text-[10px] font-bold text-gray-800">
                AGÊNCIA / FILIAL
             </div>
        )}
      </div>

      <div className="max-w-7xl mx-auto w-full px-4 md:px-8">
          <div className="-mt-12 relative z-10">
            {/* Header Card */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-xl shadow-gray-200 dark:shadow-gray-900/50 mb-6 relative">
                <div className="flex flex-col md:flex-row md:items-end md:justify-between items-center mb-4 relative">
                    <div className="flex flex-col items-center md:items-start md:flex-row md:gap-4">
                         <div className="w-24 h-24 bg-white dark:bg-gray-800 rounded-full shadow-md p-1 -mt-16 flex items-center justify-center overflow-hidden border border-gray-100 dark:border-gray-700 z-10">
                            <BankLogo name={bank.name} logo={bank.logo} large />
                        </div>
                        <div className="text-center md:text-left mt-2 md:mt-0 md:mb-1">
                            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">{bank.name}</h1>
                            <p className="text-gray-500 dark:text-gray-400 text-sm md:max-w-lg line-clamp-2">{bank.description}</p>
                        </div>
                    </div>
                    <div className="flex gap-2 mt-4 md:mt-0">
                        <button onClick={() => onToggleFollow(bank.id)} className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-xs font-bold hover:bg-indigo-700 transition-colors">
                            Seguir
                        </button>
                         <button onClick={() => onRate(bank.id)} className="px-4 py-2 bg-white border border-gray-200 text-gray-700 dark:bg-gray-700 dark:border-gray-600 dark:text-white rounded-lg text-xs font-bold hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors flex items-center gap-1">
                            <Star size={14} /> Avaliar
                        </button>
                        <button onClick={() => { setShowDetails(true); setActiveTab('INFO'); setSelectedBranch(null); }} className="px-4 py-2 bg-white border border-gray-200 text-gray-700 dark:bg-gray-700 dark:border-gray-600 dark:text-white rounded-lg text-xs font-bold hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors flex items-center gap-1">
                            <MapPin size={14} /> Detalhes
                        </button>
                    </div>
                </div>
                
                <div className="flex gap-6 border-t border-gray-100 dark:border-gray-700 pt-4 justify-around md:justify-start md:gap-12">
                    <div className="text-center md:text-left">
                        <p className="font-bold text-gray-900 dark:text-white text-lg">{products.filter(p => p.ownerId === bank.id).length}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">Publicações</p>
                    </div>
                    <div className="text-center md:text-left">
                        <p className="font-bold text-gray-900 dark:text-white text-lg">{bank.reviews}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">Avaliações</p>
                    </div>
                     <div className="text-center md:text-left">
                        <p className="font-bold text-gray-900 dark:text-white text-lg">{bank.followers}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">Seguidores</p>
                    </div>
                </div>
            </div>

            {/* Products Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {products.filter(p => p.ownerId === bank.id || p.companyName === bank.name).map(product => (
                    <button key={product.id} onClick={() => onSelectProduct(product)} className="bg-white dark:bg-gray-800 rounded-2xl overflow-hidden shadow-sm border border-gray-100 dark:border-gray-700 flex h-28 w-full text-left active:scale-[0.98] transition-transform hover:shadow-md">
                        <div className="w-28 h-full bg-gray-200 dark:bg-gray-700 shrink-0">
                            <img src={product.image} className="w-full h-full object-cover" />
                        </div>
                        <div className="p-3 flex flex-col justify-between flex-1">
                             <div>
                                <div className="flex justify-between items-start">
                                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-700 mb-1 inline-block">{product.category}</span>
                                </div>
                                <h3 className="font-bold text-gray-900 dark:text-white text-sm leading-tight line-clamp-2">{product.title}</h3>
                             </div>
                             <div className="flex justify-between items-center mt-2">
                                 <span className="text-indigo-600 dark:text-indigo-400 font-medium text-xs">Saber mais</span>
                                 <ChevronRight size={16} className="text-gray-300 dark:text-gray-600" />
                             </div>
                        </div>
                    </button>
                ))}
            </div>
          </div>
      </div>

      {/* Details Modal (Bottom Sheet) */}
      {showDetails && (
        <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center p-0 md:p-4 bg-black/60 backdrop-blur-sm animate-[fadeIn_0.2s_ease-out]">
            <div className="bg-white dark:bg-gray-800 rounded-t-3xl md:rounded-3xl w-full max-w-lg md:max-w-2xl h-[90vh] md:h-[800px] shadow-2xl relative animate-[slideUp_0.3s_ease-out] flex flex-col overflow-hidden">
                <div className="p-6 border-b border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-800 z-20 flex flex-col gap-4">
                    <div className="flex justify-between items-start">
                        <div className="flex items-center gap-3">
                             {selectedBranch ? (
                                <button onClick={() => setSelectedBranch(null)} className="p-1 -ml-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full mr-1">
                                    <ArrowRight size={20} className="text-gray-600 dark:text-gray-300 rotate-180" />
                                </button>
                             ) : (
                                <div className="w-10 h-10 bg-gray-50 dark:bg-gray-700 rounded-full overflow-hidden border border-gray-200 dark:border-gray-600">
                                    <BankLogo name={bank.name} logo={bank.logo} />
                                </div>
                             )}
                            <div>
                                <h2 className="text-xl font-bold text-gray-900 dark:text-white line-clamp-1">{selectedBranch ? selectedBranch.name : bank.name}</h2>
                                <p className="text-xs text-gray-500 dark:text-gray-400">{selectedBranch ? "Detalhes da Agência" : (bank.isBank ? "Instituição Bancária" : "Empresa Verificada")}</p>
                            </div>
                        </div>
                        <button onClick={() => setShowDetails(false)} className="p-2 bg-gray-100 dark:bg-gray-700 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-500 dark:text-gray-300 transition-colors">
                             <span className="font-bold px-1">✕</span>
                        </button>
                    </div>
                    
                    {!selectedBranch && (
                        <div className="flex p-1 bg-gray-100 dark:bg-gray-700 rounded-xl">
                            <button onClick={() => setActiveTab('INFO')} className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === 'INFO' ? 'bg-white dark:bg-gray-600 text-indigo-600 dark:text-white shadow-sm' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'}`}>
                                Sobre
                            </button>
                            <button onClick={() => setActiveTab('BRANCHES')} className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all flex items-center justify-center gap-2 ${activeTab === 'BRANCHES' ? 'bg-white dark:bg-gray-600 text-indigo-600 dark:text-white shadow-sm' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'}`}>
                                Agências
                                {branches.length > 0 && <span className="bg-indigo-100 dark:bg-indigo-800 text-indigo-700 dark:text-indigo-200 text-[10px] px-1.5 py-0.5 rounded-full">{branches.length}</span>}
                            </button>
                        </div>
                    )}
                </div>

                <div className="flex-1 overflow-y-auto p-6 bg-gray-50 dark:bg-gray-900">
                    {activeTab === 'INFO' && !selectedBranch && (
                        <div className="space-y-6 animate-[fadeIn_0.3s_ease-out]">
                            <div>
                                <h4 className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase mb-3 flex items-center gap-2">
                                    <MapPin size={14} /> Descrição
                                </h4>
                                <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed bg-white dark:bg-gray-800 p-4 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm">
                                    {bank.description || "Sem descrição disponível."}
                                </p>
                            </div>

                            <div className="grid grid-cols-1 gap-3">
                                <h4 className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase mb-1 flex items-center gap-2"><Phone size={14} /> Contactos e Sede</h4>
                                <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm overflow-hidden">
                                    {bank.address && (
                                        <div className="flex items-start gap-4 p-4 border-b border-gray-50 dark:border-gray-700/50">
                                            <div className="bg-indigo-50 dark:bg-indigo-900/30 p-2 rounded-lg text-indigo-600 dark:text-indigo-400">
                                                <MapPin size={18} />
                                            </div>
                                            <div>
                                                <p className="text-xs text-gray-400 uppercase font-bold mb-0.5">Endereço Principal</p>
                                                <span className="text-sm text-gray-800 dark:text-gray-200 font-medium">{bank.address}, {bank.municipality}, {bank.province}</span>
                                            </div>
                                        </div>
                                    )}
                                    {bank.phone && (
                                        <div className="flex items-center gap-4 p-4 border-b border-gray-50 dark:border-gray-700/50">
                                            <div className="bg-teal-50 dark:bg-teal-900/30 p-2 rounded-lg text-teal-600 dark:text-teal-400">
                                                <Phone size={18} />
                                            </div>
                                            <div>
                                                <p className="text-xs text-gray-400 uppercase font-bold mb-0.5">Telefone</p>
                                                <span className="text-sm text-gray-800 dark:text-gray-200 font-medium">{bank.phone}</span>
                                            </div>
                                        </div>
                                    )}
                                    {bank.email && (
                                        <div className="flex items-center gap-4 p-4 border-b border-gray-50 dark:border-gray-700/50">
                                            <div className="bg-blue-50 dark:bg-blue-900/30 p-2 rounded-lg text-blue-600 dark:text-blue-400">
                                                <Mail size={18} />
                                            </div>
                                            <div>
                                                <p className="text-xs text-gray-400 uppercase font-bold mb-0.5">Email</p>
                                                <span className="text-sm text-gray-800 dark:text-gray-200 font-medium">{bank.email}</span>
                                            </div>
                                        </div>
                                    )}
                                    {bank.nif && (
                                        <div className="flex items-center gap-4 p-4">
                                            <div className="bg-orange-50 dark:bg-orange-900/30 p-2 rounded-lg text-orange-600 dark:text-orange-400">
                                                <Globe size={18} />
                                            </div>
                                            <div>
                                                <p className="text-xs text-gray-400 uppercase font-bold mb-0.5">NIF</p>
                                                <span className="text-sm text-gray-800 dark:text-gray-200 font-medium">{bank.nif}</span>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'BRANCHES' && !selectedBranch && (
                        <div className="animate-[fadeIn_0.3s_ease-out]">
                            {branches.length === 0 ? (
                                <div className="flex flex-col items-center justify-center py-10 opacity-60">
                                    <MapPin size={48} className="text-gray-400 mb-4" />
                                    <p className="text-gray-500 font-medium text-center">Nenhuma agência cadastrada.</p>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {branches.map(branch => (
                                        <button key={branch.id} onClick={() => setSelectedBranch(branch)} className="w-full bg-white dark:bg-gray-800 p-4 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm hover:shadow-md hover:border-indigo-100 transition-all flex items-center justify-between group">
                                            <div className="flex items-center gap-4">
                                                <div className="w-12 h-12 bg-indigo-50 dark:bg-indigo-900/30 rounded-full flex items-center justify-center text-indigo-600 dark:text-indigo-400 shrink-0">
                                                    <MapPin size={20} />
                                                </div>
                                                <div className="text-left">
                                                    <h4 className="font-bold text-gray-900 dark:text-white text-sm group-hover:text-indigo-600 transition-colors">{branch.name}</h4>
                                                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{branch.municipality}, {branch.province}</p>
                                                    <div className="flex items-center gap-2 mt-1.5">
                                                        <span className="text-[10px] font-medium bg-gray-100 dark:bg-gray-700 px-2 py-0.5 rounded-md text-gray-600 dark:text-gray-300">
                                                            {products.filter(p => p.ownerId === branch.id).length} Produtos
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="w-8 h-8 bg-gray-50 dark:bg-gray-700 rounded-full flex items-center justify-center text-gray-400 group-hover:bg-indigo-50 group-hover:text-indigo-600 transition-colors">
                                                <ArrowRight size={16} />
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    {/* Branch Details View */}
                    {selectedBranch && (
                        <div className="space-y-6 animate-[slideLeft_0.2s_ease-out]">
                             <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm p-4">
                                <h4 className="text-xs font-bold text-gray-400 uppercase mb-3">Localização e Contacto</h4>
                                <div className="space-y-3">
                                    <div className="flex gap-3">
                                        <MapPin size={18} className="text-indigo-600 shrink-0 mt-0.5" />
                                        <p className="text-sm text-gray-800 dark:text-gray-200">{selectedBranch.address || "Endereço não informado"}, {selectedBranch.municipality}</p>
                                    </div>
                                    {selectedBranch.phone && (
                                        <div className="flex gap-3">
                                            <Phone size={18} className="text-indigo-600 shrink-0 mt-0.5" />
                                            <p className="text-sm text-gray-800 dark:text-gray-200">{selectedBranch.phone}</p>
                                        </div>
                                    )}
                                </div>
                             </div>

                             <div>
                                <h4 className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase mb-3 flex items-center gap-2">
                                    <ShoppingBag size={14} /> Produtos nesta Agência
                                </h4>
                                {branchProducts.length === 0 ? (
                                    <div className="text-center py-8 bg-gray-100 dark:bg-gray-800/50 rounded-2xl border border-dashed border-gray-300 dark:border-gray-700">
                                        <p className="text-sm text-gray-500 font-medium">Nenhum produto exclusivo desta agência.</p>
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-1 gap-3">
                                        {branchProducts.map(product => (
                                            <button key={product.id} onClick={() => { setShowDetails(false); onSelectProduct(product); }} className="flex gap-3 p-2 bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm hover:border-indigo-200 transition-colors text-left">
                                                <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-lg overflow-hidden shrink-0">
                                                    <img src={product.image} className="w-full h-full object-cover" />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <h5 className="font-bold text-gray-900 dark:text-white text-sm truncate">{product.title}</h5>
                                                    <span className="text-[10px] bg-indigo-50 text-indigo-700 px-1.5 py-0.5 rounded font-bold inline-block mb-1">{product.category}</span>
                                                    <p className="text-teal-600 font-bold text-xs">{product.price.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} Kz</p>
                                                </div>
                                                <div className="self-center pr-2">
                                                    <ChevronRight size={16} className="text-gray-300" />
                                                </div>
                                            </button>
                                        ))}
                                    </div>
                                )}
                             </div>
                             
                             {/* Option to navigate to the branch full profile if supported by app logic */}
                             <div className="pt-4">
                                <button 
                                    onClick={() => { onSelectBranch(selectedBranch); setShowDetails(false); }} 
                                    className="w-full py-3 border-2 border-indigo-600 text-indigo-600 dark:border-indigo-400 dark:text-indigo-400 font-bold rounded-xl hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-colors"
                                >
                                    Ir para Página da Agência
                                </button>
                             </div>
                        </div>
                    )}
                </div>
                
                <div className="p-4 border-t border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-800 z-20">
                    <button onClick={() => setShowDetails(false)} className="w-full py-3.5 bg-gray-900 dark:bg-white text-white dark:text-gray-900 font-bold rounded-xl hover:opacity-90 transition-opacity shadow-lg shadow-gray-200 dark:shadow-none">
                        Fechar Detalhes
                    </button>
                </div>
            </div>
        </div>
      )}

    </div>
  );
};