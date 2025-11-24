import React, { useState, useMemo } from 'react';
import { Search, Bell, ChevronRight, ArrowLeft, X, Clock, CheckCircle, Star, Info, MapPin, Phone, Mail, FileText, Globe, GitBranch } from 'lucide-react';
import { Bank, Product, User } from '../types';

interface DashboardProps {
  products: Product[];
  banks: Bank[];
  otherCompanies: Bank[];
  onSelectBank: (bank: Bank) => void;
  onSelectProduct: (product: Product) => void;
  onViewMarket: () => void;
}

// Component helper to handle safe logo rendering
const BankLogo = ({ name, logo, large = false }: { name: string, logo: string, large?: boolean }) => {
    const [imgError, setImgError] = useState(false);

    if (!logo || imgError) {
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
            className={`w-full h-full object-cover rounded-full ${large ? '' : ''}`}
            onError={() => setImgError(true)}
        />
    );
};

export const Dashboard: React.FC<DashboardProps> = ({ products, banks, otherCompanies, onSelectBank, onSelectProduct, onViewMarket }) => {
  const [showNotifications, setShowNotifications] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Filter products for the "Highlights" slider - Memoized
  const highlightedProducts = useMemo(() => products.filter(p => p.isPromoted).slice(0, 8), [products]);
  
  // Logic for Search - Memoized to prevent heavy re-renders during typing
  const searchResultsProducts = useMemo(() => {
    if (!searchQuery) return [];
    const q = searchQuery.toLowerCase();
    return products.filter(p => 
        p.title.toLowerCase().includes(q) ||
        p.companyName.toLowerCase().includes(q)
    );
  }, [products, searchQuery]);
  
  const searchResultsBanks = useMemo(() => {
    if (!searchQuery) return [];
    const q = searchQuery.toLowerCase();
    return [...banks, ...otherCompanies].filter(b => 
        b.name.toLowerCase().includes(q)
    );
  }, [banks, otherCompanies, searchQuery]);

  return (
    <div className="h-full bg-gray-50 dark:bg-gray-900 overflow-y-auto pb-20 no-scrollbar relative transition-colors duration-300">
      
      {/* --- Search Overlay --- */}
      {showSearch && (
        <div className="absolute inset-0 bg-white dark:bg-gray-900 z-50 animate-[fadeIn_0.2s_ease-out] flex flex-col">
            <div className="p-4 pt-12 border-b border-gray-100 dark:border-gray-800 flex items-center gap-3 bg-white dark:bg-gray-900 sticky top-0 shadow-sm z-50">
                <button onClick={() => setShowSearch(false)} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full">
                    <ArrowLeft size={22} className="text-gray-600 dark:text-gray-300" />
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
                {searchQuery === '' ? (
                    <div className="flex flex-col items-center justify-center pt-20 text-gray-400">
                        <div className="w-16 h-16 bg-gray-50 dark:bg-gray-800 rounded-full flex items-center justify-center mb-4">
                            <Search size={32} className="opacity-20 text-gray-900 dark:text-white" />
                        </div>
                        <p className="text-sm font-medium">Digite para pesquisar</p>
                    </div>
                ) : (
                    <>
                        {/* Banks Results */}
                        {searchResultsBanks.length > 0 && (
                            <div>
                                <h3 className="text-xs font-bold text-gray-500 uppercase mb-3">Empresas e Bancos</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                                    {searchResultsBanks.map(bank => (
                                        <button 
                                            key={bank.id}
                                            onClick={() => { onSelectBank(bank); setShowSearch(false); }}
                                            className="w-full flex items-center gap-3 p-3 bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-2xl hover:bg-indigo-50 dark:hover:bg-indigo-900/20 hover:border-indigo-100 transition-all shadow-sm"
                                        >
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

                        {/* Products Results */}
                        {searchResultsProducts.length > 0 && (
                            <div>
                                <h3 className="text-xs font-bold text-gray-500 uppercase mb-3 mt-4">Produtos e Serviços</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                                    {searchResultsProducts.map(product => (
                                        <button 
                                            key={product.id}
                                            onClick={() => { onSelectProduct(product); setShowSearch(false); }}
                                            className="w-full flex items-center gap-3 p-3 bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-2xl hover:bg-indigo-50 dark:hover:bg-indigo-900/20 hover:border-indigo-100 transition-all shadow-sm"
                                        >
                                            <div className="w-12 h-12 bg-gray-50 dark:bg-gray-700 rounded-lg overflow-hidden shrink-0">
                                                <img src={product.image} alt={product.title} className="w-full h-full object-cover" />
                                            </div>
                                            <div className="text-left flex-1 min-w-0">
                                                <p className="font-bold text-gray-900 dark:text-white text-sm truncate">{product.title}</p>
                                                <p className="text-xs text-gray-500 dark:text-gray-400">{product.companyName}</p>
                                            </div>
                                            <span className="text-teal-600 dark:text-teal-400 font-bold text-xs whitespace-nowrap">
                                                {product.price.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} Kz
                                            </span>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {searchResultsBanks.length === 0 && searchResultsProducts.length === 0 && (
                            <div className="text-center py-10 text-gray-500">
                                <p>Nenhum resultado encontrado.</p>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
      )}

      {/* --- Notifications Overlay --- */}
      {showNotifications && (
        <div className="absolute inset-0 z-50 flex flex-col justify-end md:justify-center md:items-center">
             <div className="absolute inset-0 bg-black/30 backdrop-blur-sm transition-opacity" onClick={() => setShowNotifications(false)}></div>
             <div className="bg-gray-50 dark:bg-gray-900 rounded-t-3xl md:rounded-3xl h-[85%] md:h-[600px] w-full md:w-[450px] overflow-hidden flex flex-col animate-[slideUp_0.3s_ease-out] relative z-10 shadow-2xl">
                <div className="p-6 bg-white dark:bg-gray-800 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center rounded-t-3xl">
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white">Notificações</h2>
                    <button onClick={() => setShowNotifications(false)} className="p-2 bg-gray-100 dark:bg-gray-700 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600">
                        <X size={20} className="text-gray-600 dark:text-gray-300" />
                    </button>
                </div>
                <div className="flex-1 overflow-y-auto p-4 space-y-3">
                    {/* Mock Notifications */}
                    {[
                        { title: 'Promoção Relâmpago!', desc: 'iPhone 15 com 15% de desconto na Tech Angola.', time: '2 min atrás', icon: 'bg-teal-100 text-teal-600', type: 'promo' },
                        { title: 'Alerta de Segurança', desc: 'Novo acesso detetado na sua conta em Luanda.', time: '1 hora atrás', icon: 'bg-indigo-100 text-indigo-600', type: 'alert' },
                        { title: 'Pagamento Recebido', desc: 'Transferência de 50.000 Kz confirmada.', time: 'Ontem', icon: 'bg-green-100 text-green-600', type: 'success' },
                        { title: 'Bem-vindo ao Facilita', desc: 'Explore os melhores serviços e produtos de Angola.', time: '2 dias atrás', icon: 'bg-blue-100 text-blue-600', type: 'info' }
                    ].map((notif, idx) => (
                        <div key={idx} className="bg-white dark:bg-gray-800 p-4 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 flex gap-4 items-start">
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${notif.icon}`}>
                                {notif.type === 'promo' && <Bell size={18} />}
                                {notif.type === 'alert' && <Clock size={18} />}
                                {notif.type === 'success' && <CheckCircle size={18} />}
                                {notif.type === 'info' && <Bell size={18} />}
                            </div>
                            <div>
                                <h3 className="font-bold text-gray-900 dark:text-white text-sm">{notif.title}</h3>
                                <p className="text-gray-500 dark:text-gray-400 text-xs leading-relaxed mt-0.5">{notif.desc}</p>
                                <p className="text-[10px] text-gray-400 mt-2 font-medium">{notif.time}</p>
                            </div>
                        </div>
                    ))}
                </div>
             </div>
        </div>
      )}

      {/* Main Container for Desktop Padding */}
      <div className="max-w-7xl mx-auto w-full">

        {/* Header Content - Refactored for Desktop/Tablet Layout */}
        <div className="px-6 mt-8 mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4 md:pt-6">
            <div className="flex justify-between items-center w-full md:w-auto shrink-0">
                <h1 className="text-xl md:text-3xl font-black text-gray-900 dark:text-white tracking-tight">Destaques</h1>
                
                 {/* Mobile Actions - Only visible on small screens */}
                <div className="flex gap-3 md:hidden">
                    <button 
                        onClick={() => setShowSearch(true)}
                        className="w-10 h-10 flex items-center justify-center bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 text-gray-600 dark:text-gray-300 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 hover:border-indigo-200 hover:text-indigo-600 active:scale-95 transition-all shadow-sm"
                    >
                        <div className="min-w-0 max-w-full flex items-center justify-center overflow-hidden">
                             <Search size={20} className="shrink-0" />
                        </div>
                    </button>
                    <button 
                        onClick={() => setShowNotifications(true)}
                        className="w-10 h-10 flex items-center justify-center bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 text-gray-600 dark:text-gray-300 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 hover:border-indigo-200 hover:text-indigo-600 active:scale-95 transition-all shadow-sm relative"
                    >
                        <Bell size={20} />
                        <span className="absolute top-2 right-2.5 w-2 h-2 bg-teal-500 rounded-full border border-white dark:border-gray-800"></span>
                    </button>
                </div>
            </div>
            
            {/* Desktop Search Trigger - Centered and Larger - Optimized for Tablet */}
             <div className="hidden md:flex flex-1 max-w-2xl px-2 lg:px-8 min-w-0">
                 <button 
                    onClick={() => setShowSearch(true)}
                    className="w-full flex items-center gap-3 px-4 py-3.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl hover:bg-gray-50 dark:hover:bg-gray-700 hover:border-indigo-300 dark:hover:border-indigo-700 text-gray-500 dark:text-gray-400 transition-all shadow-sm group min-w-0"
                 >
                    <Search size={20} className="group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors shrink-0" />
                    <span className="text-sm font-medium truncate">Pesquisar empresas, produtos ou serviços...</span>
                </button>
             </div>

             {/* Spacer to avoid overlap with App.tsx absolute buttons on the right (Cart/Grid) */}
             <div className="hidden lg:block w-32 shrink-0"></div>
             {/* Smaller spacer for Tablet */}
             <div className="hidden md:block lg:hidden w-20 shrink-0"></div>
        </div>

        {/* Main Banner Slider (Destaques) */}
        <div className="mb-8">
            <div className="flex overflow-x-auto gap-4 px-6 pb-4 snap-x snap-mandatory no-scrollbar">
                {highlightedProducts.map((product) => (
                    <div key={product.id} className="min-w-[85%] md:min-w-[400px] aspect-[2/1] rounded-3xl overflow-hidden relative shadow-lg snap-center group">
                        <img 
                            src={product.image} 
                            alt={product.title} 
                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" 
                        />
                        <div className="absolute inset-0 bg-gradient-to-r from-indigo-900/90 via-indigo-900/40 to-transparent flex flex-col justify-center px-6">
                            <div className="w-4/5">
                                <span className="inline-block px-2 py-1 mb-2 text-[10px] font-bold text-white bg-indigo-600 rounded-md uppercase tracking-wider shadow-sm">
                                    {product.companyName}
                                </span>
                                <h2 className="text-white text-xl md:text-2xl font-bold mb-1 leading-tight line-clamp-2 drop-shadow-md">
                                    {product.title}
                                </h2>
                                {product.price > 0 && (
                                    <p className="text-teal-300 text-sm md:text-base font-bold tracking-wide">
                                        {product.price.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} Kz
                                    </p>
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

        {/* Informations Section (Slides) */}
        <div className="mb-8">
            <div className="px-6 flex justify-between items-end mb-4">
                <h2 className="text-xl md:text-2xl font-bold text-gray-800 dark:text-white">Informações</h2>
                <button 
                    onClick={onViewMarket}
                    className="text-indigo-600 dark:text-indigo-400 text-xs font-bold flex items-center hover:underline"
                >
                    Ver tudo <ChevronRight size={14} />
                </button>
            </div>
            
            <div className="flex gap-4 overflow-x-auto px-6 no-scrollbar pb-2 snap-x snap-mandatory">
                {[
                    { title: 'Linha de Apoio 24h', image: 'https://images.unsplash.com/photo-1556761175-5973dc0f32e7?auto=format&fit=crop&w=400&q=80', subtitle: 'Estamos aqui por si' },
                    { title: 'Crédito Habitação', image: 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&w=400&q=80', subtitle: 'A sua casa de sonho' },
                    { title: 'Soluções Digitais', image: 'https://images.unsplash.com/photo-1556742049-0cfed4f7a07d?auto=format&fit=crop&w=400&q=80', subtitle: 'Para a sua empresa' },
                    { title: 'Pagamentos Móveis', image: 'https://images.unsplash.com/photo-1556742031-c6961e8560b0?auto=format&fit=crop&w=400&q=80', subtitle: 'Rápido e seguro' }
                ].map((item, i) => (
                    <div key={i} className="min-w-[220px] h-[140px] rounded-2xl overflow-hidden relative shadow-md snap-center group">
                        <img src={item.image} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                        <div className="absolute inset-0 bg-gradient-to-t from-gray-900/80 via-gray-900/20 to-transparent flex flex-col justify-end p-4">
                            <p className="text-white text-sm font-bold leading-tight mb-0.5">{item.title}</p>
                            <p className="text-gray-300 text-[10px]">{item.subtitle}</p>
                        </div>
                    </div>
                ))}
            </div>
        </div>

        {/* Banks Section - Flex on mobile, Grid on Desktop */}
        <div className="mb-8">
            <h2 className="text-xl md:text-2xl font-bold text-gray-800 dark:text-white mb-4 px-6">Bancos</h2>
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
        </div>

        {/* Other Companies Section */}
        {otherCompanies.length > 0 && (
            <div className="mb-8">
                <h2 className="text-xl md:text-2xl font-bold text-gray-800 dark:text-white mb-4 px-6">Outras Empresas</h2>
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
                                <p className="text-[10px] text-gray-400 truncate">Ver perfil</p>
                            </div>
                        </button>
                    ))}
                </div>
            </div>
        )}
      </div>
    </div>
  );
};

interface BankProfileProps {
    user: User;
    bank: Bank;
    products: Product[];
    allBanks?: Bank[]; // Pass all banks to find branches
    onBack: () => void;
    onSelectProduct: (product: Product) => void;
    onToggleFollow: (companyId: string) => void;
    onRate: (companyId: string) => void;
    onSelectBranch?: (branch: Bank) => void;
}

export const BankProfile: React.FC<BankProfileProps> = ({ user, bank, products, allBanks = [], onBack, onSelectProduct, onToggleFollow, onRate, onSelectBranch }) => {
    // Dynamic Stats
    const bankProducts = products.filter(p => p.bankId === bank.id || p.ownerId === bank.id || p.companyName === bank.name);
    const publicationCount = bankProducts.length;
    
    // Find Branches
    const branches = allBanks.filter(b => b.parentId === bank.id);

    const isFollowing = user.following?.includes(bank.id);
    const [hasRated, setHasRated] = useState(false);
    const [view, setView] = useState<'PRODUCTS' | 'DETAILS'>('PRODUCTS');

    const handleRate = () => {
        if (!hasRated) {
            onRate(bank.id);
            setHasRated(true);
        }
    };

    const formatCount = (num: number) => {
        if (num >= 1000) return (num / 1000).toFixed(1) + 'k';
        return num.toString();
    };

    return (
        <div className="h-full bg-gray-50 dark:bg-gray-900 overflow-y-auto pb-20 relative animate-[slideInRight_0.3s_ease-out] transition-colors duration-300">
            {/* Bank Cover Header */}
            <div className="h-48 md:h-64 lg:h-80 w-full relative">
                 <img src={bank.coverImage} alt={bank.name} className="w-full h-full object-cover" />
                 <div className="absolute inset-0 bg-indigo-900/30"></div>
                 <button 
                    onClick={onBack}
                    className="absolute top-6 left-6 w-10 h-10 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center text-white hover:bg-white/30 transition-colors"
                 >
                    <ArrowLeft size={20} />
                 </button>
                 {bank.type === 'BRANCH' && (
                     <div className="absolute bottom-16 left-6 bg-white/90 backdrop-blur px-2 py-1 rounded text-[10px] font-bold text-gray-800">
                         AGÊNCIA / FILIAL
                     </div>
                 )}
            </div>

            {/* Content Container with Max Width for Desktop */}
            <div className="max-w-7xl mx-auto w-full px-4 md:px-8">
                {/* Bank Info Card */}
                <div className="-mt-12 relative z-10">
                    <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-xl shadow-gray-200 dark:shadow-gray-900/50 mb-6 relative">
                        <div className="flex flex-col md:flex-row md:items-end md:justify-between items-center mb-4 relative">
                            
                            <div className="flex flex-col items-center md:items-start md:flex-row md:gap-4">
                                <div className="w-24 h-24 bg-white dark:bg-gray-800 rounded-full shadow-md p-1 -mt-16 flex items-center justify-center overflow-hidden border border-gray-100 dark:border-gray-700 z-10">
                                    <BankLogo name={bank.name} logo={bank.logo} large />
                                </div>
                                <div className="text-center md:text-left mt-2 md:mt-0 md:mb-1">
                                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">{bank.name}</h1>
                                    <p className="text-gray-500 dark:text-gray-400 text-sm md:max-w-lg">{bank.description}</p>
                                </div>
                            </div>
                            
                            <div className="flex gap-2 mt-4 md:mt-0">
                                <button 
                                    onClick={handleRate}
                                    disabled={hasRated}
                                    className={`px-3 py-2 rounded-lg text-xs font-bold transition-colors flex items-center gap-1 ${hasRated ? 'bg-yellow-100 text-yellow-600 dark:bg-yellow-900/30 dark:text-yellow-400' : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-yellow-50 hover:text-yellow-600 dark:hover:bg-yellow-900/20 dark:hover:text-yellow-400'}`}
                                >
                                    <Star size={14} className={hasRated ? "fill-yellow-600 dark:fill-yellow-400" : ""} />
                                    {hasRated ? "Avaliado" : "Avaliar"}
                                </button>

                                <button 
                                    onClick={() => setView('DETAILS')}
                                    className={`px-3 py-2 bg-gray-100 dark:bg-gray-700 rounded-lg text-xs font-bold text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors flex items-center gap-1 ${view === 'DETAILS' ? 'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400' : ''}`}
                                >
                                    <Info size={14} />
                                    Detalhes
                                </button>

                                <button 
                                    onClick={() => onToggleFollow(bank.id)}
                                    className={`px-4 py-2 text-xs font-bold rounded-lg shadow-lg transition-all ${isFollowing 
                                        ? 'bg-white dark:bg-gray-900 text-indigo-600 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-800 shadow-sm' 
                                        : 'bg-indigo-600 text-white shadow-indigo-200 dark:shadow-indigo-900/40 hover:bg-indigo-700'}`}
                                >
                                    {isFollowing ? 'Seguindo' : 'Seguir'}
                                </button>
                            </div>
                        </div>
                        
                        <div className="flex gap-6 border-t border-gray-100 dark:border-gray-700 pt-4 justify-around md:justify-start md:gap-12">
                            <div className="text-center md:text-left">
                                <p className="font-bold text-gray-900 dark:text-white text-lg">{publicationCount}</p>
                                <p className="text-xs text-gray-500 dark:text-gray-400">Publicações</p>
                            </div>
                            <div className="text-center md:text-left">
                                <p className="font-bold text-gray-900 dark:text-white text-lg">{formatCount(bank.reviews)}</p>
                                <p className="text-xs text-gray-500 dark:text-gray-400">Avaliações</p>
                            </div>
                            <div className="text-center md:text-left">
                                <p className="font-bold text-gray-900 dark:text-white text-lg">{formatCount(bank.followers)}</p>
                                <p className="text-xs text-gray-500 dark:text-gray-400">Seguidores</p>
                            </div>
                        </div>
                    </div>

                    {view === 'PRODUCTS' ? (
                        <>
                            <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4 px-1">Serviços e Novidades</h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {bankProducts.length > 0 ? (
                                    bankProducts.map(product => (
                                        <button 
                                            key={product.id} 
                                            onClick={() => onSelectProduct(product)}
                                            className="bg-white dark:bg-gray-800 rounded-2xl overflow-hidden shadow-sm border border-gray-100 dark:border-gray-700 flex h-28 w-full text-left active:scale-[0.98] transition-transform hover:shadow-md"
                                        >
                                            <div className="w-28 h-full bg-gray-200 dark:bg-gray-700 shrink-0">
                                                <img src={product.image} className="w-full h-full object-cover" />
                                            </div>
                                            <div className="p-3 flex flex-col justify-between flex-1">
                                                <div>
                                                    <div className="flex justify-between items-start">
                                                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full mb-1 inline-block ${product.category === 'Serviço' ? 'bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-300' : 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300'}`}>
                                                            {product.category}
                                                        </span>
                                                        {product.isPromoted && <span className="text-[10px] text-teal-600 dark:text-teal-400 font-bold">★ Destaque</span>}
                                                    </div>
                                                    <h3 className="font-bold text-gray-900 dark:text-white text-sm leading-tight line-clamp-2">{product.title}</h3>
                                                </div>
                                                <div className="flex justify-between items-center mt-2">
                                                    <span className="text-indigo-600 dark:text-indigo-400 font-medium text-xs">Saber mais</span>
                                                    <ChevronRight size={16} className="text-gray-300 dark:text-gray-600" />
                                                </div>
                                            </div>
                                        </button>
                                    ))
                                ) : (
                                    <div className="col-span-full text-center py-10 bg-white dark:bg-gray-800 rounded-2xl border border-dashed border-gray-200 dark:border-gray-700">
                                        <p className="text-gray-400 text-sm">Nenhuma publicação recente.</p>
                                    </div>
                                )}
                            </div>
                        </>
                    ) : (
                        <div className="animate-[fadeIn_0.2s_ease-out] grid grid-cols-1 lg:grid-cols-3 gap-6">
                             <div className="lg:col-span-2 space-y-4">
                                 <div className="flex items-center gap-2 mb-4">
                                    <button onClick={() => setView('PRODUCTS')} className="p-1 bg-gray-100 dark:bg-gray-700 rounded-full hover:bg-gray-200 transition-colors">
                                        <ArrowLeft size={16} className="text-gray-700 dark:text-gray-300"/>
                                    </button>
                                    <h2 className="text-lg font-bold text-gray-900 dark:text-white">Informações da Empresa</h2>
                                 </div>
                                 
                                 {/* About */}
                                 <div className="bg-white dark:bg-gray-800 p-4 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm">
                                     <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-2">Sobre</h3>
                                     <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed">{bank.description}</p>
                                 </div>

                                 {/* Location */}
                                 {(bank.address || bank.province) && (
                                     <div className="bg-white dark:bg-gray-800 p-4 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm">
                                         <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-2">Localização</h3>
                                         <div className="flex items-start gap-3 text-sm">
                                             <div className="bg-gray-50 dark:bg-gray-700 p-2 rounded-lg"><MapPin size={16} className="text-gray-500 dark:text-gray-400"/></div>
                                             <div>
                                                 <p className="font-medium text-gray-800 dark:text-gray-200">{bank.address || 'Endereço não informado'}</p>
                                                 <p className="text-gray-500 dark:text-gray-400 text-xs mt-0.5">
                                                     {[bank.municipality, bank.province].filter(Boolean).join(', ')}
                                                 </p>
                                             </div>
                                         </div>
                                         {/* Real Map Iframe */}
                                         <div className="mt-3 h-64 md:h-80 w-full bg-gray-100 dark:bg-gray-700 rounded-xl relative overflow-hidden border border-gray-200 dark:border-gray-600">
                                             <iframe 
                                                title="Mapa de Localização"
                                                width="100%" 
                                                height="100%" 
                                                style={{ border: 0 }}
                                                loading="lazy"
                                                allowFullScreen
                                                referrerPolicy="no-referrer-when-downgrade"
                                                src={`https://maps.google.com/maps?q=${encodeURIComponent(
                                                    [bank.address, bank.municipality, bank.province, "Angola"].filter(Boolean).join(", ")
                                                )}&t=&z=15&ie=UTF8&iwloc=&output=embed`}
                                             ></iframe>
                                         </div>
                                     </div>
                                 )}
                             </div>
                             
                             <div className="space-y-4">
                                 {/* Contact & Legal */}
                                 <div className="bg-white dark:bg-gray-800 p-4 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm space-y-3">
                                     <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-2">Contactos e Dados</h3>
                                     
                                     {bank.nif && (
                                         <div className="flex items-center gap-3 text-sm">
                                             <div className="bg-gray-50 dark:bg-gray-700 p-2 rounded-lg"><FileText size={16} className="text-gray-500 dark:text-gray-400"/></div>
                                             <div>
                                                 <p className="text-xs text-gray-400">NIF</p>
                                                 <p className="font-medium text-gray-800 dark:text-gray-200">{bank.nif}</p>
                                             </div>
                                         </div>
                                     )}
                                     
                                     {bank.phone && (
                                         <div className="flex items-center gap-3 text-sm">
                                             <div className="bg-gray-50 dark:bg-gray-700 p-2 rounded-lg"><Phone size={16} className="text-gray-500 dark:text-gray-400"/></div>
                                             <div>
                                                 <p className="text-xs text-gray-400">Telefone</p>
                                                 <p className="font-medium text-gray-800 dark:text-gray-200">{bank.phone}</p>
                                             </div>
                                         </div>
                                     )}

                                     {bank.email && (
                                         <div className="flex items-center gap-3 text-sm">
                                             <div className="bg-gray-50 dark:bg-gray-700 p-2 rounded-lg"><Mail size={16} className="text-gray-500 dark:text-gray-400"/></div>
                                             <div>
                                                 <p className="text-xs text-gray-400">Email</p>
                                                 <p className="font-medium text-gray-800 dark:text-gray-200 break-all">{bank.email}</p>
                                             </div>
                                         </div>
                                     )}
                                 </div>
                                 
                                 {/* Branches Section - Only if HQ */}
                                 {branches.length > 0 && bank.type !== 'BRANCH' && (
                                    <div className="bg-white dark:bg-gray-800 p-4 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm">
                                        <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                                            <GitBranch size={16} className="text-indigo-600" />
                                            Agências e Filiais
                                        </h3>
                                        <div className="space-y-2">
                                            {branches.map(branch => (
                                                <button 
                                                    key={branch.id}
                                                    onClick={() => onSelectBranch && onSelectBranch(branch)}
                                                    className="w-full text-left p-3 bg-gray-50 dark:bg-gray-700 rounded-xl flex justify-between items-center hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
                                                >
                                                    <div>
                                                        <p className="text-sm font-bold text-gray-800 dark:text-white">{branch.name}</p>
                                                        <p className="text-xs text-gray-500 dark:text-gray-400">{branch.municipality}, {branch.province}</p>
                                                    </div>
                                                    <ChevronRight size={16} className="text-gray-400" />
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                 )}
                             </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};