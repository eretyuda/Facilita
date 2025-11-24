import React, { useState, useMemo } from 'react';
import { Search, Filter, ShoppingBag, Plus, X, ArrowUpDown, Check, Zap } from 'lucide-react';
import { User, Product } from '../types';

interface MarketplaceProps {
    user: User;
    products: Product[];
    onSelectProduct: (product: Product) => void;
    onOpenPublish: () => void;
    onViewPlans: () => void;
}

export const Marketplace: React.FC<MarketplaceProps> = ({ user, products, onSelectProduct, onOpenPublish, onViewPlans }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [activeCategory, setActiveCategory] = useState('Tudo');
    const [showFilters, setShowFilters] = useState(false);
    
    // Filter States
    const [sortBy, setSortBy] = useState<'relevance' | 'price_asc' | 'price_desc'>('relevance');
    const [onlyPromoted, setOnlyPromoted] = useState(false);

    // Filter Logic - Memoized to prevent re-calculation on every render
    const filteredProducts = useMemo(() => {
        return products.filter(p => {
            // 1. Search Filter
            const searchLower = searchTerm.toLowerCase();
            const matchesSearch = p.title.toLowerCase().includes(searchLower) || 
                                  p.companyName.toLowerCase().includes(searchLower);
            
            // 2. Category Filter
            let matchesCategory = true;
            if (activeCategory === 'Produtos') matchesCategory = p.category === 'Produto';
            else if (activeCategory === 'Serviços') matchesCategory = p.category === 'Serviço';
            
            // 3. Promoted Filter
            const matchesPromoted = onlyPromoted ? p.isPromoted : true;

            return matchesSearch && matchesCategory && matchesPromoted;
        }).sort((a, b) => {
            // 4. Sorting
            if (sortBy === 'price_asc') return a.price - b.price;
            if (sortBy === 'price_desc') return b.price - a.price;
            return 0; // relevance (default order)
        });
    }, [products, searchTerm, activeCategory, onlyPromoted, sortBy]);

    const categories = ['Tudo', 'Produtos', 'Serviços'];

    return (
        <div className="h-full bg-gray-50 dark:bg-gray-900 overflow-y-auto pb-20 relative transition-colors duration-300">
            {/* Header */}
            <div className="bg-white dark:bg-gray-900 p-6 sticky top-0 z-10 shadow-sm border-b border-transparent dark:border-gray-800 md:pt-8">
                <div className="max-w-7xl mx-auto w-full">
                    <div className="flex justify-between items-center mb-4">
                        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">Loja</h1>
                        <div className="w-10 h-10 bg-indigo-50 dark:bg-indigo-900/30 rounded-full flex items-center justify-center">
                            <ShoppingBag className="text-indigo-600 dark:text-indigo-400" size={20} />
                        </div>
                    </div>

                    <div className="flex gap-2">
                        <div className="flex-1 relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                            <input 
                                type="text" 
                                placeholder="O que procura hoje?" 
                                className="w-full pl-10 pr-4 py-3 bg-gray-100 dark:bg-gray-800 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-900 dark:text-white transition-colors"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <button 
                            onClick={() => setShowFilters(true)}
                            className={`p-3 rounded-xl transition-colors ${showFilters || onlyPromoted || sortBy !== 'relevance' ? 'bg-indigo-100 text-indigo-600 dark:bg-indigo-900/50 dark:text-indigo-400' : 'bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700'}`}
                        >
                            <Filter size={18} />
                        </button>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto w-full">
                {/* Categories */}
                <div className="px-6 py-4 flex gap-3 overflow-x-auto no-scrollbar">
                    {categories.map((cat, idx) => (
                        <button 
                            key={idx} 
                            onClick={() => setActiveCategory(cat)}
                            className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${activeCategory === cat ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200 dark:shadow-indigo-900/50' : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700'}`}
                        >
                            {cat}
                        </button>
                    ))}
                </div>

                {/* Product Grid */}
                <div className="px-6 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6 pb-6">
                    {filteredProducts.length > 0 ? (
                        filteredProducts.map((product) => (
                            <button 
                                key={product.id} 
                                onClick={() => onSelectProduct(product)}
                                className="bg-white dark:bg-gray-800 rounded-2xl p-3 shadow-sm hover:shadow-md transition-all text-left group border border-gray-100 dark:border-gray-700 animate-[fadeIn_0.3s_ease-out] flex flex-col h-full"
                            >
                                <div className="relative aspect-square rounded-xl overflow-hidden bg-gray-100 dark:bg-gray-700 mb-3">
                                    <img src={product.image} alt={product.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                                    {product.isPromoted && (
                                        <span className="absolute top-2 left-2 bg-teal-400 text-teal-900 text-[10px] font-bold px-2 py-1 rounded-md">
                                            DESTAQUE
                                        </span>
                                    )}
                                </div>
                                <h3 className="font-semibold text-gray-900 dark:text-white text-sm line-clamp-2 mb-1 flex-1">{product.title}</h3>
                                <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">{product.companyName}</p>
                                <div className="flex items-center justify-between">
                                    <span className="font-bold text-teal-600 dark:text-teal-400 text-sm">
                                        {product.price.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} Kz
                                    </span>
                                </div>
                            </button>
                        ))
                    ) : (
                        <div className="col-span-full py-12 text-center text-gray-500 dark:text-gray-400">
                            <ShoppingBag size={48} className="mx-auto mb-3 opacity-20" />
                            <p>Nenhum produto encontrado.</p>
                            <button onClick={() => { setSearchTerm(''); setActiveCategory('Tudo'); setOnlyPromoted(false); }} className="text-indigo-600 dark:text-indigo-400 font-bold text-sm mt-2">
                                Limpar filtros
                            </button>
                        </div>
                    )}
                </div>

                 {/* Business Publish FAB */}
                 {user.isBusiness && (
                    <button 
                        onClick={onOpenPublish}
                        className="fixed bottom-28 right-6 md:bottom-10 md:right-10 w-14 h-14 bg-gray-900 dark:bg-white rounded-full shadow-lg shadow-gray-900/40 dark:shadow-white/20 flex items-center justify-center text-white dark:text-gray-900 z-20 hover:scale-110 transition-transform active:scale-95"
                    >
                        <Plus size={32} />
                    </button>
                 )}

                 {!user.isBusiness && filteredProducts.length > 0 && (
                    <div className="mx-6 mt-4 p-6 bg-gradient-to-r from-indigo-600 to-violet-700 rounded-2xl text-white text-center shadow-lg shadow-indigo-500/30">
                        <h3 className="font-bold text-xl mb-2">Venda no App</h3>
                        <p className="text-indigo-100 text-sm mb-4">Alcance milhares de clientes em Angola com nossos planos empresariais.</p>
                        <button onClick={onViewPlans} className="bg-white text-indigo-700 px-6 py-2 rounded-full text-sm font-bold shadow-sm">
                            Ver Planos
                        </button>
                    </div>
                 )}
             </div>

             {/* Filter Modal (Bottom Sheet / Modal on Desktop) */}
             {showFilters && (
                <div className="fixed inset-0 z-50 flex items-end md:items-center md:justify-center">
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowFilters(false)}></div>
                    <div className="bg-white dark:bg-gray-900 w-full md:w-[480px] md:rounded-3xl rounded-t-3xl p-6 relative z-10 animate-[slideUp_0.3s_ease-out] md:animate-[scaleIn_0.2s_ease-out] md:shadow-2xl">
                        <div className="w-12 h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full mx-auto mb-6 md:hidden"></div>
                        
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-xl font-bold text-gray-900 dark:text-white">Filtros e Ordenação</h2>
                            <button onClick={() => setShowFilters(false)} className="p-2 bg-gray-100 dark:bg-gray-800 rounded-full">
                                <X size={20} className="text-gray-600 dark:text-gray-400" />
                            </button>
                        </div>

                        <div className="space-y-6">
                            <div>
                                <h3 className="text-sm font-bold text-gray-500 dark:text-gray-400 uppercase mb-3">Ordenar por Preço</h3>
                                <div className="space-y-2">
                                    <button 
                                        onClick={() => setSortBy('relevance')}
                                        className={`w-full flex items-center justify-between p-4 rounded-xl border transition-all ${sortBy === 'relevance' ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400' : 'border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300'}`}
                                    >
                                        <span className="font-medium">Relevância</span>
                                        {sortBy === 'relevance' && <Check size={20} />}
                                    </button>
                                    <button 
                                        onClick={() => setSortBy('price_asc')}
                                        className={`w-full flex items-center justify-between p-4 rounded-xl border transition-all ${sortBy === 'price_asc' ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400' : 'border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300'}`}
                                    >
                                        <span className="font-medium flex items-center gap-2"><ArrowUpDown size={16} /> Menor Preço</span>
                                        {sortBy === 'price_asc' && <Check size={20} />}
                                    </button>
                                    <button 
                                        onClick={() => setSortBy('price_desc')}
                                        className={`w-full flex items-center justify-between p-4 rounded-xl border transition-all ${sortBy === 'price_desc' ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400' : 'border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300'}`}
                                    >
                                        <span className="font-medium flex items-center gap-2"><ArrowUpDown size={16} /> Maior Preço</span>
                                        {sortBy === 'price_desc' && <Check size={20} />}
                                    </button>
                                </div>
                            </div>

                            <div>
                                <h3 className="text-sm font-bold text-gray-500 dark:text-gray-400 uppercase mb-3">Filtros Especiais</h3>
                                <button 
                                    onClick={() => setOnlyPromoted(!onlyPromoted)}
                                    className={`w-full flex items-center justify-between p-4 rounded-xl border transition-all ${onlyPromoted ? 'border-yellow-500 bg-yellow-50 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-400' : 'border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300'}`}
                                >
                                    <div className="flex items-center gap-3">
                                        <div className={`p-2 rounded-lg ${onlyPromoted ? 'bg-yellow-200 dark:bg-yellow-900/50' : 'bg-gray-100 dark:bg-gray-800'}`}>
                                            <Zap size={20} className={onlyPromoted ? 'fill-yellow-700 text-yellow-700 dark:fill-yellow-400 dark:text-yellow-400' : 'text-gray-500 dark:text-gray-400'} />
                                        </div>
                                        <span className="font-medium">Apenas Destaques</span>
                                    </div>
                                    {onlyPromoted && <Check size={20} />}
                                </button>
                            </div>
                        </div>

                        <div className="mt-8">
                            <button 
                                onClick={() => setShowFilters(false)}
                                className="w-full py-4 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-xl font-bold shadow-lg shadow-gray-900/20 active:scale-95 transition-transform"
                            >
                                Ver Resultados
                            </button>
                        </div>
                    </div>
                </div>
             )}
        </div>
    );
};