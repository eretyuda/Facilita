import React, { useState } from 'react';
import { Product, User } from '../types';
import { X, Trash2, ArrowRight, ShoppingBag, User as UserIcon, Phone, Mail, CheckCircle, ArrowLeft } from 'lucide-react';
import { Button } from './Button';

interface CartProps {
    items: Product[];
    user: User;
    onRemoveItem: (index: number) => void;
    onClose: () => void;
    onCheckout: () => void;
}

type CartView = 'LIST' | 'CHECKOUT' | 'SUCCESS';

export const Cart: React.FC<CartProps> = ({ items, user, onRemoveItem, onClose, onCheckout }) => {
    const [view, setView] = useState<CartView>('LIST');
    const [isProcessing, setIsProcessing] = useState(false);

    const total = items.reduce((sum, item) => sum + item.price, 0);

    const handlePayment = () => {
        setIsProcessing(true);
        // Simulate payment delay
        setTimeout(() => {
            setIsProcessing(false);
            setView('SUCCESS');
        }, 2000);
    };

    const handleFinish = () => {
        onCheckout(); // Clears cart in App.tsx
        onClose();
    };

    if (view === 'SUCCESS') {
        return (
            <div className="absolute inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-sm animate-[fadeIn_0.2s_ease-out]">
                <div className="bg-white rounded-3xl p-8 w-[90%] max-w-sm text-center animate-[scaleIn_0.3s_ease-out] shadow-2xl">
                    <div className="w-20 h-20 bg-teal-100 rounded-full flex items-center justify-center mx-auto mb-6">
                        <CheckCircle className="text-teal-600 w-10 h-10" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Pagamento Realizado!</h2>
                    <p className="text-gray-500 mb-8">A sua compra foi confirmada. Enviamos o recibo para o seu email.</p>
                    <Button onClick={handleFinish} fullWidth className="bg-teal-600 hover:bg-teal-700 shadow-teal-200">
                        Voltar à Loja
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <div className="absolute inset-0 z-[60] flex flex-col justify-end bg-black/60 backdrop-blur-sm animate-[fadeIn_0.2s_ease-out]">
             {/* Click backdrop to close */}
             <div className="absolute inset-0" onClick={onClose}></div>
             
             <div className="bg-white rounded-t-3xl h-[85%] w-full overflow-hidden flex flex-col animate-[slideUp_0.3s_ease-out] relative z-10">
                {/* Header */}
                <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-white">
                    <div className="flex items-center gap-3">
                        {view === 'CHECKOUT' ? (
                            <button onClick={() => setView('LIST')} className="p-2 -ml-2 hover:bg-gray-100 rounded-full">
                                <ArrowLeft size={20} className="text-gray-800" />
                            </button>
                        ) : (
                            <div className="bg-indigo-50 p-2 rounded-lg text-indigo-600">
                                <ShoppingBag size={20} />
                            </div>
                        )}
                        <h2 className="text-xl font-bold text-gray-900">
                            {view === 'CHECKOUT' ? 'Confirmar Dados' : `Seu Carrinho (${items.length})`}
                        </h2>
                    </div>
                    <button onClick={onClose} className="p-2 bg-gray-100 rounded-full hover:bg-gray-200 text-gray-500">
                        <X size={20} />
                    </button>
                </div>

                {/* Content */}
                {view === 'LIST' ? (
                    <>
                        <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-gray-50">
                            {items.length === 0 ? (
                                <div className="flex flex-col items-center justify-center h-full text-center p-6 opacity-50">
                                    <ShoppingBag size={48} className="mb-4 text-gray-400" />
                                    <p className="text-gray-500 font-medium">O seu carrinho está vazio.</p>
                                    <p className="text-xs text-gray-400 mt-1">Adicione produtos para começar.</p>
                                </div>
                            ) : (
                                items.map((item, index) => (
                                    <div key={`${item.id}-${index}`} className="flex gap-4 items-center bg-white p-3 rounded-2xl shadow-sm border border-gray-100">
                                        <div className="w-16 h-16 bg-gray-100 rounded-xl overflow-hidden shrink-0">
                                            <img src={item.image} alt={item.title} className="w-full h-full object-cover" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <h3 className="font-bold text-gray-900 text-sm truncate">{item.title}</h3>
                                            <p className="text-gray-500 text-xs mb-1">{item.companyName}</p>
                                            <p className="text-teal-600 font-bold text-sm">
                                                {item.price.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} Kz
                                            </p>
                                        </div>
                                        <button 
                                            onClick={() => onRemoveItem(index)}
                                            className="p-2 text-red-400 hover:bg-red-50 hover:text-red-500 rounded-lg transition-colors"
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                    </div>
                                ))
                            )}
                        </div>
                        <div className="p-6 bg-white border-t border-gray-100 shadow-[0_-5px_20px_rgba(0,0,0,0.05)]">
                            <div className="flex justify-between items-center mb-6">
                                <span className="text-gray-500 font-medium">Total a pagar</span>
                                <span className="text-2xl font-black text-gray-900">
                                    {total.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} Kz
                                </span>
                            </div>
                            <Button 
                                onClick={() => setView('CHECKOUT')} 
                                fullWidth 
                                disabled={items.length === 0} 
                                className="flex justify-between items-center h-14 text-lg"
                            >
                                <span>Finalizar Compra</span>
                                <div className="bg-white/20 p-1 rounded-full">
                                    <ArrowRight size={20} />
                                </div>
                            </Button>
                        </div>
                    </>
                ) : (
                    /* Checkout View */
                    <>
                        <div className="flex-1 overflow-y-auto p-6 bg-gray-50">
                            <h3 className="text-sm font-bold text-gray-500 uppercase mb-4">Dados de Envio e Faturação</h3>
                            
                            <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 space-y-4 mb-6">
                                <div className="flex items-center gap-4 p-2">
                                    <div className="bg-gray-100 p-2.5 rounded-xl text-gray-600">
                                        <UserIcon size={20} />
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-xs text-gray-400">Nome Completo</p>
                                        <p className="font-medium text-gray-900">{user.name}</p>
                                    </div>
                                </div>
                                <div className="h-px bg-gray-100 w-full"></div>
                                <div className="flex items-center gap-4 p-2">
                                    <div className="bg-gray-100 p-2.5 rounded-xl text-gray-600">
                                        <Mail size={20} />
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-xs text-gray-400">Email</p>
                                        <p className="font-medium text-gray-900">{user.email}</p>
                                    </div>
                                </div>
                                <div className="h-px bg-gray-100 w-full"></div>
                                <div className="flex items-center gap-4 p-2">
                                    <div className="bg-gray-100 p-2.5 rounded-xl text-gray-600">
                                        <Phone size={20} />
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-xs text-gray-400">Telefone</p>
                                        <p className="font-medium text-gray-900">{user.phone}</p>
                                    </div>
                                </div>
                            </div>

                            <h3 className="text-sm font-bold text-gray-500 uppercase mb-4">Pagamento</h3>
                            <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 mb-6">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-6 bg-gray-800 rounded flex items-center justify-center">
                                        <div className="w-6 h-3 border border-white/30 rounded-sm"></div>
                                    </div>
                                    <div className="flex-1">
                                        <p className="font-medium text-gray-900">Multicaixa Express</p>
                                        <p className="text-xs text-gray-400">**** 1290</p>
                                    </div>
                                    <div className="w-5 h-5 rounded-full border-2 border-teal-600 flex items-center justify-center">
                                        <div className="w-2.5 h-2.5 bg-teal-600 rounded-full"></div>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-teal-50 p-4 rounded-xl border border-teal-100">
                                <p className="text-sm text-teal-800 text-center">
                                    Ao confirmar, o valor será debitado da sua conta associada.
                                </p>
                            </div>
                        </div>

                        <div className="p-6 bg-white border-t border-gray-100 shadow-[0_-5px_20px_rgba(0,0,0,0.05)]">
                             <Button 
                                onClick={handlePayment} 
                                disabled={isProcessing}
                                fullWidth 
                                className="h-14 text-lg relative"
                            >
                                {isProcessing ? (
                                    <div className="flex items-center gap-2">
                                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                        <span>Processando...</span>
                                    </div>
                                ) : (
                                    <div className="flex justify-between items-center w-full">
                                        <span>Pagar</span>
                                        <span className="bg-indigo-800/50 px-3 py-1 rounded-lg text-sm">
                                            {total.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} Kz
                                        </span>
                                    </div>
                                )}
                            </Button>
                        </div>
                    </>
                )}
             </div>
        </div>
    );
};