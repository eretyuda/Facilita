

import React, { useState } from 'react';
import { Product } from '../types';
import { ArrowLeft, Share2, Heart, CheckCircle2, ShieldCheck, Truck, Star, MessageCircle, Phone, ShoppingCart, Plus, Image as ImageIcon, Send, X } from 'lucide-react';
import { Button } from './Button';
import { Toast, ToastType } from './Toast';

interface ProductDetailsProps {
  product: Product;
  onBack: () => void;
  onAddToCart: (product: Product) => void;
  cartItemCount: number;
  onOpenCart: () => void;
  isFavorite: boolean;
  onToggleFavorite: () => void;
  onSendMessage?: (content: string) => void;
}

export const ProductDetails: React.FC<ProductDetailsProps> = ({ 
  product, 
  onBack, 
  onAddToCart, 
  cartItemCount, 
  onOpenCart,
  isFavorite,
  onToggleFavorite,
  onSendMessage
}) => {
  const isService = product.category === 'Serviço';
  const [activeImage, setActiveImage] = useState(product.image);
  const [showShareToast, setShowShareToast] = useState(false);
  const [showMsgModal, setShowMsgModal] = useState(false);
  const [msgContent, setMsgContent] = useState('');
  
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

  const handleSendInternalMessage = (e: React.FormEvent) => {
      e.preventDefault();
      if (!msgContent.trim()) return;
      
      if (onSendMessage) {
          onSendMessage(msgContent);
          setToast({ show: true, message: 'Mensagem enviada com sucesso!', type: 'success' });
          setMsgContent('');
          setShowMsgModal(false);
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

      {/* Message Modal for Services */}
      {showMsgModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-[fadeIn_0.2s_ease-out]">
              <div className="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-sm p-6 shadow-2xl animate-[scaleIn_0.2s_ease-out]">
                  <div className="flex justify-between items-center mb-4">
                      <h3 className="font-bold text-lg text-gray-900 dark:text-white">Contactar Empresa</h3>
                      <button onClick={() => setShowMsgModal(false)} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full">
                          <X size={20} className="text-gray-500 dark:text-gray-400" />
                      </button>
                  </div>
                  <form onSubmit={handleSendInternalMessage}>
                      <textarea 
                          value={msgContent}
                          onChange={(e) => setMsgContent(e.target.value)}
                          placeholder="Olá, gostaria de saber mais sobre este serviço..."
                          className="w-full h-32 p-4 bg-gray-50 dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 outline-none text-gray-900 dark:text-white resize-none mb-4"
                          autoFocus
                      />
                      <Button fullWidth type="submit" className="bg-indigo-600 hover:bg-indigo-700 text-white">
                          <Send size={18} className="mr-2" />
                          Enviar Mensagem
                      </Button>
                  </form>
              </div>
          </div>
      )}

      {/* Hero Image Section */}
      <div className="relative h-72 w-full bg-gray-100 dark:bg-gray-800">
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
        </div>
      </div>

      {/* Bottom Action Bar */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-white dark:bg-gray-900 border-t border-gray-100 dark:border-gray-800 flex items-center gap-3 z-40 max-w-md mx-auto shadow-[0_-5px_20px_rgba(0,0,0,0.05)]">
        {isService ? (
            <>
                <Button 
                    variant="outline" 
                    className="w-16 p-0 flex items-center justify-center border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800" 
                    onClick={() => window.open(`https://wa.me/244923456789?text=Olá, tenho interesse no serviço: ${product.title}`)}
                    title="WhatsApp"
                >
                    <MessageCircle size={24} className="text-green-600" />
                </Button>
                <Button 
                    className="flex-1 gap-2 bg-indigo-600 hover:bg-indigo-700 text-white shadow-indigo-200 border-none" 
                    onClick={() => setShowMsgModal(true)}
                >
                    <Send size={20} />
                    Mensagem Interna
                </Button>
            </>
        ) : (
            <>
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
                        // Optional: Open cart automatically if preferred, but adding to cart + toast is usually better ux
                        // onOpenCart(); 
                    }}
                >
                    <ShoppingCart size={20} className="mr-1" />
                    Comprar
                </Button>
            </>
        )}
      </div>
    </div>
  );
};