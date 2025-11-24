import React, { useState } from 'react';
import { Product, User, PlanType, Bank } from '../types';
import { PLANS } from '../constants';
import { ArrowLeft, Edit2, Trash2, Plus, PackageOpen, Crown, Building2, GitBranch, AlertTriangle, X } from 'lucide-react';
import { Button } from './Button';

interface MyProductsProps {
    user: User;
    products: Product[];
    branches?: Bank[]; // Add branches prop to know which sub-entities belong to user
    onBack: () => void;
    onEdit: (product: Product) => void;
    onDelete: (productId: string) => void;
    onAddNew: () => void;
    // New props for Branch Management
    scopeId?: string; // If present, shows products for this specific ID (Branch)
    scopeName?: string; // Name of the branch being managed
}

export const MyProducts: React.FC<MyProductsProps> = ({ user, products, branches = [], onBack, onEdit, onDelete, onAddNew, scopeId, scopeName }) => {
    // State for custom delete confirmation
    const [productToDelete, setProductToDelete] = useState<string | null>(null);

    // 1. Calculate Account-Wide Usage (Global) for the Plan Usage Card
    // This ensures the user sees their total consumption against the limit, even if filtering by a specific branch.
    const accountIds = [user.id, ...branches.map(b => b.id)];
    
    // Robust filter for account products (HQ + All Branches)
    const allAccountProducts = products.filter(p => {
        const isOwner = p.ownerId === user.id;
        const isBranchOwned = branches.some(b => b.id === p.ownerId);
        // Also check by company name in case ownerId is missing/legacy
        const isNameMatch = p.companyName === user.name || branches.some(b => b.name === p.companyName);
        
        return isOwner || isBranchOwned || isNameMatch;
    });

    const globalProductCount = allAccountProducts.length;
    const globalHighlightCount = allAccountProducts.filter(p => p.isPromoted).length;

    // 2. Filter products for the LIST view
    const visibleProducts = products.filter(p => {
        if (scopeId) {
            // If viewing a specific branch, show its products
            return p.ownerId === scopeId || p.companyName === scopeName;
        } else {
            // Main View: Include HQ + All Branch products
            // We use the same robust list as calculated for usage
            return allAccountProducts.includes(p);
        }
    });
    
    // Determine user plan (Branches use HQ's plan)
    const userPlanType = user.plan || PlanType.BASIC;
    const planDetails = PLANS.find(p => p.type === userPlanType) || PLANS[0];
    
    // Use custom limits if available (from upgrade rollover), otherwise plan defaults
    const maxProducts = user.customLimits?.maxProducts ?? planDetails.maxProducts;
    const maxHighlights = user.customLimits?.maxHighlights ?? planDetails.maxHighlights;
    
    // Check if limits reached based on GLOBAL usage
    const isProductLimitReached = maxProducts !== -1 && globalProductCount >= maxProducts;

    const handleAddNewClick = () => {
        if (isProductLimitReached) {
            alert(`Limite de publicações atingido para o plano ${userPlanType}. Atualize o seu plano para adicionar mais produtos.`);
            return;
        }
        onAddNew();
    };

    const confirmDelete = () => {
        if (productToDelete) {
            onDelete(productToDelete);
            setProductToDelete(null);
        }
    };

    const getProgressColor = (current: number, max: number) => {
        if (max === -1) return 'bg-yellow-500'; // Unlimited is Gold
        const percent = (current / max) * 100;
        if (percent >= 90) return 'bg-red-600';
        if (percent >= 70) return 'bg-yellow-500';
        return 'bg-gray-800'; // Default black/dark gray
    };

    // Helper to get branch name if product belongs to branch
    const getProductSourceLabel = (ownerId?: string, companyName?: string) => {
        // If ownerId matches user, it's HQ
        if (ownerId === user.id) return null;
        
        // Try to find branch by ID
        const branchById = branches.find(b => b.id === ownerId);
        if (branchById) return branchById.name;

        // Try to find branch by Name (fallback)
        if (companyName && companyName !== user.name) {
            const branchByName = branches.find(b => b.name === companyName);
            if (branchByName) return branchByName.name;
        }
        
        return null;
    };

    return (
        <div className="h-full bg-gray-50 dark:bg-gray-900 overflow-y-auto pb-20 animate-[slideInRight_0.2s_ease-out] relative">
            {/* Delete Confirmation Modal */}
            {productToDelete && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-[fadeIn_0.2s_ease-out]">
                    <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 w-full max-w-sm shadow-2xl animate-[scaleIn_0.2s_ease-out]">
                        <div className="w-12 h-12 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mb-4 mx-auto text-red-600 dark:text-red-400">
                            <Trash2 size={24} />
                        </div>
                        <h3 className="text-lg font-bold text-center text-gray-900 dark:text-white mb-2">Excluir Produto?</h3>
                        <p className="text-center text-gray-500 dark:text-gray-400 text-sm mb-6">
                            Esta ação não pode ser desfeita. O produto será removido permanentemente da sua loja.
                        </p>
                        <div className="flex gap-3">
                            <button 
                                type="button"
                                onClick={() => setProductToDelete(null)}
                                className="flex-1 py-3 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 font-bold rounded-xl hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                            >
                                Cancelar
                            </button>
                            <button 
                                type="button"
                                onClick={confirmDelete}
                                className="flex-1 py-3 bg-red-600 text-white font-bold rounded-xl hover:bg-red-700 shadow-lg shadow-red-200 dark:shadow-red-900/20 transition-colors"
                            >
                                Excluir
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <div className="bg-white dark:bg-gray-800 px-6 pt-6 pb-4 shadow-sm sticky top-0 z-10 flex justify-between items-center border-b border-gray-100 dark:border-gray-700">
                <div className="flex items-center gap-4">
                    <button onClick={onBack} className="p-2 -ml-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full">
                        <ArrowLeft size={24} className="text-gray-800 dark:text-gray-200" />
                    </button>
                    <div>
                        <h1 className="text-xl font-bold text-gray-900 dark:text-white">
                            {scopeName ? `Produtos: ${scopeName}` : 'Meus Produtos'}
                        </h1>
                        <span className="text-[10px] uppercase font-bold text-gray-500 dark:text-gray-400 tracking-wider flex items-center gap-1">
                            {scopeName && <Building2 size={10} />}
                            Plano {userPlanType}
                        </span>
                    </div>
                </div>
                <button 
                    onClick={handleAddNewClick}
                    className={`w-10 h-10 rounded-full flex items-center justify-center shadow-lg transition-all ${isProductLimitReached ? 'bg-gray-400 cursor-not-allowed' : 'bg-red-600 text-white hover:bg-red-700'}`}
                >
                    <Plus size={24} className={isProductLimitReached ? 'text-gray-200' : 'text-white'} />
                </button>
            </div>

            {/* Plan Usage Card */}
            <div className="px-6 mt-4 mb-2">
                <div className="bg-white dark:bg-gray-800 p-4 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
                    <h3 className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase mb-3 flex items-center gap-2">
                        <Crown size={14} className="text-yellow-500" />
                        Uso Global da Conta {scopeName && '(Incluindo Agências)'}
                    </h3>
                    
                    {/* Products Limit */}
                    <div className="mb-3">
                        <div className="flex justify-between text-xs mb-1">
                            <span className="text-gray-600 dark:text-gray-400">Publicações Totais</span>
                            <span className="font-bold text-gray-900 dark:text-white">
                                {globalProductCount} {maxProducts !== -1 && `/ ${maxProducts}`}
                            </span>
                        </div>
                        <div className="w-full h-2 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                            <div 
                                className={`h-full rounded-full ${getProgressColor(globalProductCount, maxProducts)} transition-all duration-500`} 
                                style={{ width: maxProducts === -1 ? '100%' : `${Math.min((globalProductCount / maxProducts) * 100, 100)}%` }}
                            ></div>
                        </div>
                    </div>

                    {/* Highlights Limit */}
                    <div>
                        <div className="flex justify-between text-xs mb-1">
                            <span className="text-gray-600 dark:text-gray-400">Destaques Ativos</span>
                            <span className="font-bold text-gray-900 dark:text-white">
                                {globalHighlightCount} {maxHighlights !== -1 && `/ ${maxHighlights}`}
                            </span>
                        </div>
                        <div className="w-full h-2 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                             <div 
                                className={`h-full rounded-full ${getProgressColor(globalHighlightCount, maxHighlights)} transition-all duration-500`} 
                                style={{ width: maxHighlights === -1 ? '100%' : `${Math.min((globalHighlightCount / maxHighlights) * 100, 100)}%` }}
                            ></div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="p-6 space-y-4 pt-2">
                {visibleProducts.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 opacity-60">
                        <PackageOpen size={64} className="text-gray-400 mb-4" />
                        <p className="text-lg font-medium text-gray-600 dark:text-gray-400">
                            {scopeName ? 'Esta agência não tem produtos.' : 'Ainda não tem produtos.'}
                        </p>
                        <p className="text-sm text-gray-500 dark:text-gray-500 mb-6">Comece a vender hoje mesmo!</p>
                        <Button onClick={handleAddNewClick} variant="outline" disabled={isProductLimitReached}>
                            Criar primeiro anúncio
                        </Button>
                    </div>
                ) : (
                    visibleProducts.map((product) => {
                        const sourceLabel = getProductSourceLabel(product.ownerId, product.companyName);
                        return (
                            <div key={product.id} className="bg-white dark:bg-gray-800 p-4 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 flex gap-4">
                                <div className="w-24 h-24 bg-gray-100 dark:bg-gray-700 rounded-xl overflow-hidden shrink-0 relative">
                                    <img src={product.image} alt={product.title} className="w-full h-full object-cover" />
                                    {product.isPromoted && (
                                        <div className="absolute bottom-0 left-0 right-0 bg-yellow-400 text-[10px] font-bold text-yellow-900 text-center py-0.5">
                                            DESTAQUE
                                        </div>
                                    )}
                                </div>
                                
                                <div className="flex-1 flex flex-col justify-between">
                                    <div>
                                        <div className="flex flex-wrap gap-2 items-center mb-1">
                                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${product.category === 'Serviço' ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300' : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300'}`}>
                                                {product.category.toUpperCase()}
                                            </span>
                                            {sourceLabel && (
                                                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-300 flex items-center gap-1 border border-indigo-100 dark:border-indigo-800">
                                                    <GitBranch size={8} />
                                                    {sourceLabel}
                                                </span>
                                            )}
                                        </div>
                                        <h3 className="font-bold text-gray-900 dark:text-white text-sm leading-tight line-clamp-2">{product.title}</h3>
                                        <p className="text-red-600 dark:text-red-400 font-bold mt-1">
                                            {product.price.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} Kz
                                        </p>
                                    </div>
                                    
                                    <div className="flex justify-end gap-2 mt-2">
                                        <button 
                                            type="button"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                onEdit(product);
                                            }}
                                            className="p-2 bg-gray-50 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 hover:text-gray-900 dark:hover:text-white transition-colors"
                                        >
                                            <Edit2 size={16} />
                                        </button>
                                        <button 
                                            type="button"
                                            onClick={(e) => {
                                                e.preventDefault(); // Stop any default form action
                                                e.stopPropagation(); // Stop bubbling
                                                setProductToDelete(product.id); // Trigger modal
                                            }}
                                            className="p-3 bg-red-50 dark:bg-red-900/20 text-red-500 hover:bg-red-100 dark:hover:bg-red-900/40 rounded-xl transition-colors active:scale-95"
                                            title="Excluir Produto"
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        );
                    })
                )}
            </div>
        </div>
    );
};