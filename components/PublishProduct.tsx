import React, { useState, useEffect, useRef } from 'react';
import { Button } from './Button';
import { ArrowLeft, Upload, DollarSign, Tag, FileText, Type, X, Image as ImageIcon, Plus, Zap, Loader2, GitBranch, Building2, MapPin } from 'lucide-react';
import { Product, User, PlanType, Bank } from '../types';
import { PLANS } from '../constants';
import { processImage } from '../utils/imageOptimizer';
import { Toast, ToastType } from './Toast';

interface PublishProductProps {
    user: User;
    products: Product[]; // Needed to calculate limits
    branches?: Bank[]; // List of available branches
    onBack: () => void;
    onSave: (product: Product) => void;
    initialData?: Product | null;
    // New optional props for Branch Management (Overrides default selection)
    overrideOwnerId?: string;
    overrideCompanyName?: string;
}

export const PublishProduct: React.FC<PublishProductProps> = ({ user, products, branches = [], onBack, onSave, initialData, overrideOwnerId, overrideCompanyName }) => {
    const [title, setTitle] = useState('');
    const [price, setPrice] = useState('');
    const [category, setCategory] = useState<'Produto' | 'Serviço'>('Produto');
    const [description, setDescription] = useState('');
    const [image, setImage] = useState('');
    const [gallery, setGallery] = useState<string[]>([]);
    const [isPromoted, setIsPromoted] = useState(false);
    
    // Branch Selection State
    // Default to overrideOwnerId if present (Branch Mode), otherwise default to HQ (empty string or user.id)
    const [selectedBranchId, setSelectedBranchId] = useState<string>(overrideOwnerId || '');

    // Processing State
    const [isProcessingImage, setIsProcessingImage] = useState(false);
    
    // Toast State
    const [toast, setToast] = useState<{ show: boolean; message: string; type: ToastType }>({
        show: false,
        message: '',
        type: 'success'
    });

    const showToast = (message: string, type: ToastType = 'success') => {
        setToast({ show: true, message, type });
    };

    const galleryInputRef = useRef<HTMLInputElement>(null);

    // Limit Calculations
    const userPlanType = user.plan || PlanType.BASIC;
    const planDetails = PLANS.find(p => p.type === userPlanType) || PLANS[0];
    
    // 1. Calculate Account-Wide Usage (HQ + All Branches)
    // Limits apply to the Account Holder (User), regardless of which entity publishes.
    const accountIds = [user.id, ...branches.map(b => b.id)];
    const accountNames = [user.name, ...branches.map(b => b.name)];
    
    // Robust filtering to catch all products owned by user or any of their branches
    const allAccountProducts = products.filter(p => {
        // Product owned by User OR any branch owned by User
        const isOwnerMatch = accountIds.includes(p.ownerId || '');
        // Fallback: Legacy check by company name
        const isNameMatch = accountNames.includes(p.companyName);
        
        return isOwnerMatch || isNameMatch;
    });

    // 2. Count Highlights (Global Account Level)
    const currentHighlights = allAccountProducts.filter(p => p.isPromoted && (initialData ? p.id !== initialData.id : true)).length;
    // Use custom limits if available, otherwise plan defaults
    const maxHighlights = user.customLimits?.maxHighlights ?? planDetails.maxHighlights;
    const canPromote = maxHighlights === -1 || currentHighlights < maxHighlights;

    // 3. Count Products (Global Account Level)
    const currentProductsCount = allAccountProducts.length;
    const maxProducts = user.customLimits?.maxProducts ?? planDetails.maxProducts;

    useEffect(() => {
        if (initialData) {
            setTitle(initialData.title);
            // Format existing price: 5000 -> "5.000,00"
            setPrice(initialData.price.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }));
            setCategory(initialData.category);
            setDescription(initialData.description || '');
            setImage(initialData.image);
            setGallery(initialData.gallery || []);
            setIsPromoted(initialData.isPromoted || false);
            
            // Set selected branch based on existing data
            if (initialData.ownerId && initialData.ownerId !== user.id) {
                // Check if it belongs to one of our branches
                const isBranch = branches.find(b => b.id === initialData.ownerId);
                if (isBranch) {
                    setSelectedBranchId(isBranch.id);
                }
            } else {
                setSelectedBranchId(''); // Set to HQ
            }
        }
    }, [initialData, user.id, branches]);

    const handleCoverUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            try {
                setIsProcessingImage(true);
                const { optimized } = await processImage(file);
                setImage(optimized);
                showToast("Imagem de capa carregada!", 'success');
            } catch (error) {
                showToast(error instanceof Error ? error.message : "Erro ao processar imagem.", 'error');
            } finally {
                setIsProcessingImage(false);
            }
        }
    };

    const handleGalleryUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const files = event.target.files;
        if (files && files.length > 0) {
            try {
                setIsProcessingImage(true);
                const processedImages = await Promise.all(
                    Array.from(files).map(async (file) => {
                        const { optimized } = await processImage(file);
                        return optimized;
                    })
                );
                setGallery(prev => [...prev, ...processedImages]);
                showToast(`${processedImages.length} fotos adicionadas à galeria!`, 'success');
            } catch (error) {
                showToast(error instanceof Error ? error.message : "Erro ao processar galeria.", 'error');
            } finally {
                setIsProcessingImage(false);
            }
        }
    };

    const handleRemoveGalleryImage = (index: number) => {
        const newGallery = [...gallery];
        newGallery.splice(index, 1);
        setGallery(newGallery);
    };

    // Format currency input: 1234 -> 12,34 -> 1.234,56
    const handlePriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        // Remove everything that is not a digit
        let value = e.target.value.replace(/\D/g, '');
        
        if (value === '') {
            setPrice('');
            return;
        }

        // Parse as integer and divide by 100 to get decimals
        const numberValue = parseInt(value, 10) / 100;
        
        // Format to "pt-BR" style (dots for thousands, comma for decimal)
        const formatted = numberValue.toLocaleString('pt-BR', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        });

        setPrice(formatted);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        // 1. Check Global Product Limits (If creating new)
        if (!initialData) {
            if (maxProducts !== -1 && currentProductsCount >= maxProducts) {
                showToast(`Limite global de ${maxProducts} publicações atingido. Atualize seu plano.`, 'error');
                return;
            }
        }

        // 2. Check Global Highlight Limits (If promoting)
        if (isPromoted && (!initialData || !initialData.isPromoted)) {
             if (maxHighlights !== -1 && currentHighlights >= maxHighlights) {
                 showToast(`Limite global de ${maxHighlights} destaques atingido.`, 'error');
                 return;
             }
        }
        
        // Resolve final owner details
        const finalOwnerId = selectedBranchId || user.id;
        const finalCompanyName = selectedBranchId 
            ? branches.find(b => b.id === selectedBranchId)?.name || user.name 
            : user.name;

        // Convert formatted string "1.234,56" back to number 1234.56
        const rawPriceString = price.replace(/\./g, '').replace(',', '.');
        const finalPriceValue = parseFloat(rawPriceString) || 0;

        const newProduct: Product = {
            id: initialData ? initialData.id : Date.now().toString(),
            title,
            price: finalPriceValue,
            image: image || 'https://picsum.photos/400/400', // Fallback image if nothing uploaded
            gallery,
            companyName: finalCompanyName,
            category,
            isPromoted,
            ownerId: finalOwnerId,
            description,
            // Link to main bank ID if applicable, regardless of branch
            bankId: user.isBank ? (user.id) : undefined 
        };

        // Notify and save
        showToast(initialData ? 'Produto atualizado com sucesso!' : 'Produto publicado com sucesso!', 'success');
        
        // Delay closing slightly to show the toast, but ensure good UX
        setTimeout(() => {
            onSave(newProduct);
        }, 800);
    };

    return (
        <div className="h-full bg-gray-50 dark:bg-gray-900 overflow-y-auto pb-20 animate-[slideUp_0.3s_ease-out] relative">
            <div className="bg-white dark:bg-gray-800 px-6 pt-6 pb-4 shadow-sm sticky top-0 z-10 border-b border-gray-100 dark:border-gray-700">
                <div className="flex items-center gap-4 mb-2">
                    <button onClick={onBack} className="p-2 -ml-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full">
                        <ArrowLeft size={24} className="text-gray-800 dark:text-gray-200" />
                    </button>
                    <div>
                        <h1 className="text-xl font-bold text-gray-900 dark:text-white">
                            {initialData ? 'Editar Publicação' : 'Nova Publicação'}
                        </h1>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                            Preencha os dados do seu produto ou serviço.
                        </p>
                    </div>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-6">
                
                {/* Branch Selection Section - Only show if user has branches */}
                {branches.length > 0 && (
                    <div className="bg-indigo-50 dark:bg-indigo-900/20 p-4 rounded-2xl border border-indigo-100 dark:border-indigo-800">
                        <label className="block text-sm font-bold text-indigo-900 dark:text-indigo-300 mb-2 flex items-center gap-2">
                            <GitBranch size={16} />
                            Local de Publicação
                        </label>
                        <div className="relative">
                            <select 
                                value={selectedBranchId}
                                onChange={(e) => setSelectedBranchId(e.target.value)}
                                disabled={!!overrideOwnerId} // Disable if explicitly forced by parent
                                className="w-full pl-10 pr-4 py-3 bg-white dark:bg-gray-800 rounded-xl border border-indigo-200 dark:border-indigo-700 focus:border-indigo-500 outline-none appearance-none text-gray-900 dark:text-white font-medium disabled:opacity-70"
                            >
                                <option value="">{user.name} (Sede / Principal)</option>
                                {branches.map(branch => (
                                    <option key={branch.id} value={branch.id}>
                                        {branch.name} — {branch.municipality}
                                    </option>
                                ))}
                            </select>
                            {selectedBranchId ? (
                                <Building2 size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-indigo-600 dark:text-indigo-400 pointer-events-none" />
                            ) : (
                                <MapPin size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                            )}
                        </div>
                        <p className="text-[10px] text-indigo-700 dark:text-indigo-400 mt-2 px-1">
                            {selectedBranchId 
                                ? "O produto será exibido como pertencente a esta agência. O uso contará para o limite global da conta." 
                                : "O produto será vinculado à conta principal da empresa."}
                        </p>
                    </div>
                )}

                {/* Cover Image Section */}
                <div>
                    <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
                        <ImageIcon size={16} className="text-indigo-600 dark:text-indigo-400" />
                        Imagem de Capa (Principal)
                    </label>
                    <div className="w-full h-48 bg-white dark:bg-gray-800 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-2xl flex flex-col items-center justify-center text-gray-400 hover:border-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-900/10 transition-all cursor-pointer relative overflow-hidden group">
                        {isProcessingImage && !gallery.length && !image ? (
                             <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-50 dark:bg-gray-900 z-20">
                                <Loader2 size={32} className="animate-spin text-indigo-600" />
                                <span className="text-xs font-bold text-gray-600 dark:text-gray-400">Otimizando...</span>
                            </div>
                        ) : null}
                        
                        {image ? (
                            <>
                                <img src={image} alt="Preview" className="w-full h-full object-cover" />
                                <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity z-10">
                                    <span className="text-white font-bold flex items-center gap-2">
                                        <Upload size={18} /> Alterar Capa
                                    </span>
                                </div>
                            </>
                        ) : (
                            <>
                                <Upload size={32} className="mb-2" />
                                <span className="text-sm font-medium">Toque para adicionar capa</span>
                            </>
                        )}
                        <input 
                            type="file" 
                            accept="image/*"
                            className="absolute inset-0 opacity-0 cursor-pointer z-20"
                            onChange={handleCoverUpload}
                            disabled={isProcessingImage}
                        />
                    </div>
                </div>

                {/* Gallery Section */}
                <div>
                    <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
                        <ImageIcon size={16} className="text-indigo-600 dark:text-indigo-400" />
                        Galeria de Fotos
                    </label>
                    <p className="text-xs text-gray-400 mb-3">Adicione fotos extras para mostrar detalhes.</p>
                    
                    <div className="flex gap-3 overflow-x-auto pb-2 no-scrollbar items-center">
                        {/* Add Button */}
                        <input 
                            type="file"
                            accept="image/*"
                            multiple
                            className="hidden"
                            ref={galleryInputRef}
                            onChange={handleGalleryUpload}
                        />
                        <button 
                            type="button"
                            onClick={() => !isProcessingImage && galleryInputRef.current?.click()}
                            disabled={isProcessingImage}
                            className="w-24 h-24 shrink-0 rounded-xl border-2 border-dashed border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 flex flex-col items-center justify-center text-gray-400 hover:border-indigo-500 hover:text-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-900/10 transition-all"
                        >
                            {isProcessingImage ? <Loader2 size={24} className="animate-spin" /> : <Plus size={24} />}
                            <span className="text-[10px] font-bold mt-1">{isProcessingImage ? '...' : 'Adicionar'}</span>
                        </button>

                        {/* Gallery Items */}
                        {gallery.map((img, idx) => (
                            <div key={idx} className="w-24 h-24 shrink-0 rounded-xl overflow-hidden relative group border border-gray-200 dark:border-gray-700">
                                <img src={img} alt={`Gallery ${idx}`} className="w-full h-full object-cover" />
                                <button 
                                    type="button"
                                    onClick={() => handleRemoveGalleryImage(idx)}
                                    className="absolute top-1 right-1 w-6 h-6 bg-red-500 rounded-full text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-sm z-10"
                                >
                                    <X size={14} />
                                </button>
                            </div>
                        ))}
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Título do Anúncio</label>
                    <div className="flex items-center px-4 py-3 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 focus-within:border-indigo-500 focus-within:ring-1 focus-within:ring-indigo-500 transition-all">
                        <Type size={20} className="text-gray-400 mr-3" />
                        <input 
                            type="text" 
                            required
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="Ex: iPhone 15 Pro Max"
                            className="w-full bg-transparent outline-none text-gray-900 dark:text-white placeholder-gray-400"
                        />
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Preço (Kz)</label>
                        <div className="flex items-center px-4 py-3 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 focus-within:border-indigo-500 transition-all">
                            <DollarSign size={20} className="text-gray-400 mr-2" />
                            <input 
                                type="text"
                                inputMode="numeric"
                                required
                                value={price}
                                onChange={handlePriceChange}
                                placeholder="0,00"
                                className="w-full bg-transparent outline-none text-gray-900 dark:text-white placeholder-gray-400"
                            />
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Categoria</label>
                        <div className="relative">
                            <select 
                                value={category}
                                onChange={(e) => setCategory(e.target.value as any)}
                                className="w-full px-4 py-3 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 focus:border-indigo-500 outline-none appearance-none text-gray-900 dark:text-white"
                            >
                                <option value="Produto">Produto</option>
                                <option value="Serviço">Serviço</option>
                            </select>
                            <Tag size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                        </div>
                    </div>
                </div>

                {/* Promotion Toggle */}
                <div 
                    onClick={() => canPromote && setIsPromoted(!isPromoted)}
                    className={`p-4 rounded-xl border-2 flex items-center justify-between transition-all cursor-pointer ${isPromoted ? 'border-yellow-400 bg-yellow-50 dark:bg-yellow-900/20' : canPromote ? 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:border-yellow-200' : 'border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-800 opacity-60 cursor-not-allowed'}`}
                >
                    <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg ${isPromoted ? 'bg-yellow-400 text-yellow-900' : 'bg-gray-100 dark:bg-gray-700 text-gray-400'}`}>
                            <Zap size={24} className={isPromoted ? 'fill-yellow-900' : ''} />
                        </div>
                        <div>
                            <p className={`font-bold ${isPromoted ? 'text-yellow-900 dark:text-yellow-400' : 'text-gray-700 dark:text-gray-300'}`}>Destacar Produto</p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                                {canPromote 
                                    ? `Aumente a visibilidade (${currentHighlights}/${maxHighlights === -1 ? '∞' : maxHighlights} usados)` 
                                    : `Limite de destaques atingido (${maxHighlights})`}
                            </p>
                        </div>
                    </div>
                    <div className={`w-12 h-6 rounded-full p-1 transition-colors ${isPromoted ? 'bg-yellow-400' : 'bg-gray-300 dark:bg-gray-600'}`}>
                        <div className={`w-4 h-4 bg-white rounded-full shadow-sm transition-transform ${isPromoted ? 'translate-x-6' : 'translate-x-0'}`}></div>
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Descrição</label>
                    <div className="flex items-start px-4 py-3 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 focus-within:border-indigo-500 transition-all">
                        <FileText size={20} className="text-gray-400 mr-3 mt-1" />
                        <textarea 
                            rows={4}
                            required
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="Descreva os detalhes do seu produto ou serviço..."
                            className="w-full bg-transparent outline-none text-gray-900 dark:text-white placeholder-gray-400 resize-none"
                        />
                    </div>
                </div>

                <div className="pt-4">
                    <Button type="submit" fullWidth className="h-14 text-lg shadow-xl shadow-indigo-200 dark:shadow-indigo-900/30" disabled={isProcessingImage}>
                        {isProcessingImage ? 'Processando Imagens...' : (initialData ? 'Atualizar Publicação' : 'Publicar Agora')}
                    </Button>
                </div>
            </form>
            
            <Toast 
                isVisible={toast.show} 
                message={toast.message} 
                type={toast.type} 
                onClose={() => setToast(prev => ({ ...prev, show: false }))} 
            />
        </div>
    );
};