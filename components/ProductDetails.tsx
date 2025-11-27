import React, { useState, useRef } from 'react';
import { Product, Attachment } from '../types';
import { ArrowLeft, Share2, Heart, CheckCircle2, ShieldCheck, Truck, Star, MessageCircle, ShoppingCart, Plus, Image as ImageIcon, Send, X, FileText, Paperclip, Loader2, CreditCard } from 'lucide-react';
import { Button } from './Button';
import { Toast, ToastType } from './Toast';
import { processImage } from '../utils/imageOptimizer';

interface ProductDetailsProps {
    product: Product;
    onBack: () => void;
    onAddToCart: (product: Product) => void;
    cartItemCount: number;
    onOpenCart: () => void;
    isFavorite: boolean;
    onToggleFavorite: () => void;
    onSendMessage?: (content: string, attachment?: Attachment) => void;
    companyPhone?: string; // New prop for dynamic phone number
}

export const ProductDetails: React.FC<ProductDetailsProps> = ({
    product,
    onBack,
    onAddToCart,
    cartItemCount,
    onOpenCart,
    isFavorite,
    onToggleFavorite,
    onSendMessage,
    companyPhone
}) => {
    const isService = product.category === 'Serviço';
    const [activeImage, setActiveImage] = useState(product.image);
    const [showShareToast, setShowShareToast] = useState(false);
    const [showMsgModal, setShowMsgModal] = useState(false);
    const [msgContent, setMsgContent] = useState('');

    // Attachment State
    const [attachment, setAttachment] = useState<Attachment | undefined>(undefined);
    const [isUploading, setIsUploading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Toast State for actions
    const [toast, setToast] = useState<{ show: boolean; message: string; type: ToastType }>({
        show: false,
        message: '',
        type: 'success'
    });

    const handleShare = async () => {
        const shareData = {
            title: product.title,
            text: `Confira ${product.title} na Facilita!`,
            url: window.location.href // In a real app, this would be a specific product link
        };

        if (navigator.share) {
            try {
                await navigator.share(shareData);
            } catch (err) {
                console.log('Error sharing:', err);
            }
        } else {
            // Fallback for browsers that don't support Web Share API
            navigator.clipboard.writeText(`${product.title} - ${product.price} Kz\n${window.location.href}`);
            setShowShareToast(true);
            setTimeout(() => setShowShareToast(false), 2000);
        }
    };

    const handleAddToCart = () => {
        onAddToCart(product);
        setToast({ show: true, message: 'Produto adicionado ao carrinho!', type: 'success' });
    };

    const handleBuyNow = () => {
        onAddToCart(product);
        onOpenCart();
    };

    const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setIsUploading(true);
            try {
                let url = '';
                let type: 'image' | 'document' = 'document';

                if (file.type.startsWith('image/')) {
                    const { optimized } = await processImage(file);
                    url = optimized;
                    type = 'image';
                } else {
                    // For docs, simple reader
                    const reader = new FileReader();
                    url = await new Promise((resolve) => {
                        reader.onload = (e) => resolve(e.target?.result as string);
                        reader.readAsDataURL(file);
                    });
                }

                setAttachment({
                    type,
                    url,
                    name: file.name
                });
            } catch (error) {
                setToast({ show: true, message: 'Erro ao carregar arquivo', type: 'error' });
            } finally {
                setIsUploading(false);
            }
        }
    };

    const handleSendInternalMessage = (e: React.FormEvent) => {
        e.preventDefault();
        if (!msgContent.trim() && !attachment) return;

        if (onSendMessage) {
            onSendMessage(msgContent, attachment);
            // Feedback personalizado para serviços conforme solicitado
            const successMessage = isService
                ? 'Solicitação enviada! Aguarde a resposta da empresa.'
                : 'Mensagem enviada com sucesso!';

            setToast({ show: true, message: successMessage, type: 'success' });
            setMsgContent('');
            setAttachment(undefined);
            setShowMsgModal(false);
        }
    };

    const handleWhatsAppClick = () => {
        // Use company phone if available
        let cleanPhone = companyPhone ? companyPhone.replace(/[^0-9]/g, '') : '';

        // Auto-fix for Angola numbers: Ensure it starts with 244
        // If length is 9 (e.g. 923123456), add 244 prefix
        if (cleanPhone.length === 9 && (cleanPhone.startsWith('9') || cleanPhone.startsWith('2'))) {
            cleanPhone = '244' + cleanPhone;
        }

        // If starts with 00244, remove 00
        if (cleanPhone.startsWith('00')) cleanPhone = cleanPhone.substring(2);

        if (cleanPhone) {
            window.open(`https://wa.me/${cleanPhone}?text=Olá, tenho interesse no serviço: ${product.title}`, '_blank');
        } else {
            setToast({ show: true, message: 'Número da empresa não disponível ou inválido.', type: 'error' });
        }
    };

    return (
        <div className="h-full bg-white dark:bg-gray-900 overflow-y-auto pb-20 relative animate-[fadeIn_0.3s_ease-out] transition-colors duration-300">
            {/* Toast Notification */}
            <Toast
                isVisible={toast.show}
                message={toast.message}
                type={toast.type}
                onClose={() => setToast(prev => ({ ...prev, show: false }))}
            />

            {/* Share Toast */}
            {showShareToast && (
                <div className="fixed top-24 left-1/2 -translate-x-1/2 bg-gray-900 text-white px-4 py-2 rounded-full text-sm z-50 animate-[fadeIn_0.2s_ease-out]">
                    Link copiado!
                </div>
            )}

            {/* Message Modal for Services/Contact */}
            {showMsgModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-[fadeIn_0.2s_ease-out]">
                    <div className="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-sm p-6 shadow-2xl animate-[scaleIn_0.2s_ease-out]">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="font-bold text-lg text-gray-900 dark:text-white">
                                {isService ? 'Solicitar Serviço' : 'Contactar Empresa'}
                            </h3>
                            <button onClick={() => setShowMsgModal(false)} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full">
                                <X size={20} className="text-gray-500 dark:text-gray-400" />
                            </button>
                        </div>

                        {isService && (
                            <div className="mb-4 bg-indigo-50 dark:bg-indigo-900/20 p-3 rounded-lg flex gap-3 items-start">
                                <FileText size={18} className="text-indigo-600 dark:text-indigo-400 shrink-0 mt-0.5" />
                                <p className="text-xs text-indigo-800 dark:text-indigo-200">
                                    Descreva o que precisa. A empresa receberá o seu pedido e entrará em contacto pelo chat do aplicativo.
                                </p>
                            </div>
                        )}

                        <form onSubmit={handleSendInternalMessage}>
                            <textarea
                                value={msgContent}
                                onChange={(e) => setMsgContent(e.target.value)}
                                placeholder={isService ? "Olá, gostaria de um orçamento para..." : "Olá, tenho uma dúvida sobre este produto..."}
                                className="w-full h-32 p-4 bg-gray-50 dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 outline-none text-gray-900 dark:text-white resize-none mb-2 focus:border-indigo-500 transition-colors"
                                autoFocus
                            />

                            {/* Attachment Preview */}
                            {attachment && (
                                <div className="mb-3 p-2 bg-gray-100 dark:bg-gray-700 rounded-lg flex justify-between items-center">
                                    <div className="flex items-center gap-2 overflow-hidden">
                                        {attachment.type === 'image' ? (
                                            <ImageIcon size={16} className="text-indigo-500" />
                                        ) : (
                                            <FileText size={16} className="text-orange-500" />
                                        )}
                                        <span className="text-xs text-gray-700 dark:text-gray-300 truncate max-w-[180px]">{attachment.name}</span>
                                    </div>
                                    <button type="button" onClick={() => setAttachment(undefined)} className="text-gray-500 hover:text-red-500">
                                        <X size={14} />
                                    </button>
                                </div>
                            )}

                            <div className="flex justify-between items-center mb-4">
                                <input
                                    type="file"
                                    ref={fileInputRef}
                                    className="hidden"
                                    onChange={handleFileSelect}
                                    accept="image/*,application/pdf"
                                />
                                <button
                                    type="button"
                                    onClick={() => fileInputRef.current?.click()}
                                    className="text-xs font-bold text-gray-500 hover:text-indigo-600 flex items-center gap-1"
                                    disabled={isUploading}
                                >
                                    {isUploading ? <Loader2 size={16} className="animate-spin" /> : <Paperclip size={16} />}
                                    {isUploading ? 'Carregando...' : 'Anexar arquivo'}
                                </button>
                            </div>

                            <Button fullWidth type="submit" className="bg-indigo-600 hover:bg-indigo-700 text-white" disabled={isUploading}>
                                <Send size={18} className="mr-2" />
                                {isService ? 'Enviar Solicitação' : 'Enviar Mensagem'}
                            </Button>
                        </form>
                    </div>
                </div>
            )}

            {/* Hero Image Section */}
            <div className="relative h-[400px] md:h-[550px] lg:h-[650px] w-full bg-gray-100 dark:bg-gray-800">
                <img
                    src={activeImage}
                    alt={product.title}
                    className="w-full h-full object-cover transition-opacity duration-300"
                />
                <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-black/60"></div>

                {/* Top Navigation */}
                <div className="absolute top-6 left-6 right-6 flex justify-between items-center text-white z-10">
                    <button
                        onClick={onBack}
                        className="w-10 h-10 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center hover:bg-white/30 transition-colors"
                    >
                        <ArrowLeft size={20} />
                    </button>
                    <div className="flex gap-3">
                        {!isService && (
                            <button
                                onClick={onOpenCart}
                                className="w-10 h-10 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center hover:bg-white/30 transition-colors relative"
                            >
                                <ShoppingCart size={20} />
                                {cartItemCount > 0 && (
                                    <span className="absolute -top-1 -right-1 w-5 h-5 bg-teal-400 text-teal-900 rounded-full text-[10px] font-bold flex items-center justify-center border-2 border-transparent shadow-sm">
                                        {cartItemCount}
                                    </span>
                                )}
                            </button>
                        )}
                        <button
                            onClick={handleShare}
                            className="w-10 h-10 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center hover:bg-white/30 transition-colors"
                        >
                            <Share2 size={20} />
                        </button>
                        <button
                            onClick={onToggleFavorite}
                            className={`w-10 h-10 backdrop-blur-md rounded-full flex items-center justify-center transition-all duration-300 ${isFavorite ? 'bg-white text-red-600 shadow-md transform scale-110' : 'bg-white/20 text-white hover:bg-white/30'}`}
                        >
                            <Heart size={20} className={`transition-all ${isFavorite ? 'fill-red-600' : ''}`} />
                        </button>
                    </div>
                </div>

                {/* Company Badge */}
                <div className="absolute bottom-6 left-6 bg-white/90 backdrop-blur px-3 py-1.5 rounded-lg flex items-center gap-2 shadow-lg z-10">
                    <div className="w-4 h-4 rounded-full bg-indigo-600 flex items-center justify-center text-[8px] font-bold text-white">
                        {product.companyName.charAt(0)}
                    </div>
                    <span className="text-xs font-bold text-gray-900">{product.companyName}</span>
                </div>
            </div>

            {/* Content */}
            <div className="p-6 -mt-6 bg-white dark:bg-gray-900 rounded-t-3xl relative z-20">
                {/* Header */}
                <div className="flex justify-between items-start mb-2">
                    <div>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full mb-2 inline-block ${isService ? 'bg-teal-100 text-teal-800 dark:bg-teal-900/30 dark:text-teal-300' : 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-300'}`}>
                            {product.category.toUpperCase()}
                        </span>
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white leading-tight mb-1">{product.title}</h1>
                        <div className="flex items-center gap-1">
                            <Star size={14} className="fill-yellow-400 text-yellow-400" />
                            <span className="text-sm font-bold text-gray-900 dark:text-gray-200">4.8</span>
                            <span className="text-sm text-gray-400">(124 avaliações)</span>
                        </div>
                    </div>
                </div>

                {/* Price */}
                <div className="mt-6 mb-8">
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Preço total</p>
                    <div className="flex items-end gap-2">
                        <span className="text-3xl font-black text-teal-600 dark:text-teal-400">
                            {product.price === 0 ? 'Sob Consulta' : `${product.price.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} Kz`}
                        </span>
                        {product.isPromoted && <span className="text-sm text-indigo-700 dark:text-indigo-300 font-bold mb-1.5 px-2 py-0.5 bg-indigo-100 dark:bg-indigo-900/30 rounded-md">Oferta Especial</span>}
                    </div>
                </div>

                {/* Gallery View */}
                {product.gallery && product.gallery.length > 0 && (
                    <div className="mb-8">
                        <h3 className="font-bold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                            <ImageIcon size={18} className="text-gray-400" />
                            Galeria
                        </h3>
                        <div className="flex gap-3 overflow-x-auto pb-2 no-scrollbar">
                            {/* Main Image Thumbnail */}
                            <button
                                onClick={() => setActiveImage(product.image)}
                                className={`w-20 h-20 rounded-xl overflow-hidden shrink-0 border-2 transition-all ${activeImage === product.image ? 'border-indigo-600 scale-95' : 'border-transparent'}`}
                            >
                                <img src={product.image} className="w-full h-full object-cover" />
                            </button>

                            {/* Gallery Thumbnails */}
                            {product.gallery.map((img, idx) => (
                                <button
                                    key={idx}
                                    onClick={() => setActiveImage(img)}
                                    className={`w-20 h-20 rounded-xl overflow-hidden shrink-0 border-2 transition-all ${activeImage === img ? 'border-indigo-600 scale-95' : 'border-transparent'}`}
                                >
                                    <img src={img} className="w-full h-full object-cover" />
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                <div className="h-px w-full bg-gray-100 dark:bg-gray-800 mb-6"></div>

                {/* Description */}
                <div className="space-y-4 mb-8">
                    <h3 className="font-bold text-gray-900 dark:text-white">Sobre</h3>
                    <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed">
                        Aproveite esta oferta exclusiva da {product.companyName}.
                        Garantimos a melhor qualidade e suporte para {isService ? 'este serviço' : 'este produto'}.
                        Ideal para quem procura eficiência e segurança em Angola.
                        <br /><br />
                        {product.description || "Inclui garantia de satisfação e suporte local dedicado."}
                    </p>

                    {/* Features Grid */}
                    <div className="grid grid-cols-2 gap-3 mt-4">
                        <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded-xl flex items-center gap-3">
                            <ShieldCheck className="text-indigo-600 dark:text-indigo-400 shrink-0" size={20} />
                            <span className="text-xs font-medium text-gray-700 dark:text-gray-200">Garantia verificada</span>
                        </div>
                        <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded-xl flex items-center gap-3">
                            <CheckCircle2 className="text-teal-600 dark:text-teal-400 shrink-0" size={20} />
                            <span className="text-xs font-medium text-gray-700 dark:text-gray-200">{isService ? 'Aprovação Imediata' : 'Produto Original'}</span>
                        </div>
                        {!isService && (
                            <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded-xl flex items-center gap-3 col-span-2">
                                <Truck className="text-gray-600 dark:text-gray-400 shrink-0" size={20} />
                                <span className="text-xs font-medium text-gray-700 dark:text-gray-200">Entrega disponível em Luanda e Benguela</span>
                            </div>
                        )}
                    </div>

                    {/* Buy Now Button (Below Delivery Info) */}
                    {!isService && (
                        <div className="mt-4 animate-[fadeIn_0.3s_ease-out]">
                            <Button
                                fullWidth
                                onClick={handleBuyNow}
                                className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold h-12 shadow-lg shadow-indigo-200 dark:shadow-indigo-900/30 border-none"
                            >
                                <CreditCard className="mr-2" size={20} />
                                Comprar Agora
                            </Button>
                        </div>
                    )}
                </div>

                {/* Service Action Buttons (Inline) */}
                {isService && (
                    <div className="mt-8 mb-6 flex flex-col gap-3 animate-[fadeIn_0.3s_ease-out]">
                        <Button
                            className="w-full gap-2 bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-200 dark:shadow-indigo-900/40 h-12 text-lg border-none"
                            onClick={() => setShowMsgModal(true)}
                        >
                            <Send size={20} />
                            Solicitar Serviço
                        </Button>
                        <Button
                            variant="outline"
                            className="w-full gap-2 border-green-500 text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20 h-12 text-lg dark:text-green-400 dark:border-green-800"
                            onClick={handleWhatsAppClick}
                            title="WhatsApp"
                        >
                            <MessageCircle size={20} />
                            Puxar no WhatsApp
                        </Button>
                        <Button
                            className="w-full gap-2 bg-gray-900 hover:bg-black text-white shadow-lg shadow-gray-200 dark:shadow-none h-12 text-lg border-none"
                            onClick={handleBuyNow}
                        >
                            <CreditCard size={20} />
                            Pagar pelo Serviço
                        </Button>
                    </div>
                )}
            </div>

            {/* Bottom Action Bar (Only for Products now) */}
            {!isService && (
                <div className="fixed bottom-0 left-0 right-0 p-4 bg-white dark:bg-gray-900 border-t border-gray-100 dark:border-gray-800 flex items-center gap-3 z-40 max-w-md mx-auto shadow-[0_-5px_20px_rgba(0,0,0,0.05)]">
                    <button
                        onClick={handleAddToCart}
                        className="px-4 rounded-xl border-2 border-indigo-600 dark:border-indigo-500 text-indigo-600 dark:text-indigo-400 font-bold hover:bg-indigo-50 dark:hover:bg-indigo-900/30 transition-colors active:scale-95 flex flex-col items-center justify-center h-full min-h-[52px]"
                        aria-label="Adicionar ao Carrinho"
                    >
                        <Plus size={24} />
                        <span className="text-[9px] uppercase tracking-wide">Adicionar</span>
                    </button>
                    <Button
                        fullWidth
                        variant="primary"
                        className="shadow-indigo-600/30 flex-1 h-full min-h-[52px] dark:bg-indigo-600 dark:hover:bg-indigo-700"
                        onClick={() => {
                            handleAddToCart();
                        }}
                    >
                        <ShoppingCart size={20} className="mr-1" />
                        Comprar
                    </Button>
                </div>
            )}
        </div>
    );
};