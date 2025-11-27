
import React, { useState, useRef, useEffect, useMemo } from 'react';
import { PLANS, ANGOLA_PROVINCES, ANGOLA_MUNICIPALITIES } from '../constants';
import { generateAdCopy, analyzeBusinessStats } from '../services/geminiService';
import { Button } from './Button';
import { BarChart, Bar, Tooltip, ResponsiveContainer } from 'recharts';
import { User as UserType, Product, PlanType, Bank, ATM, ATMStatus, BankName, Message, Attachment, Transaction, UserBankDetails, PlatformBankAccount } from '../types';
import { processImage } from '../utils/imageOptimizer';
import { Toast, ToastType } from './Toast';
import {
    CreditCard, LogOut, Check, Star, Sparkles, ChevronRight, ArrowLeft, ToggleLeft, ToggleRight,
    Moon, Globe, Bell, Package, Heart, Building2, Phone, Landmark, FileText, Camera, MapPin,
    ChevronDown, Plus, Wallet, X, Trash2, Loader2, GitBranch, Edit2, ShoppingBag, Map, HelpCircle,
    Shield, MessageCircle, Send, User as UserIcon, Paperclip, Image as ImageIcon, ArrowUpRight,
    ArrowDownLeft, Share2, Printer, Download, Copy, Upload, Clock, MessageSquare, Search, Crown,
    Store, LocateFixed, Sun, Eye, CheckCircle, XCircle, Calendar, Smartphone, Lock, Key, Banknote,
    Settings
} from 'lucide-react';

export type ProfileView = 'MAIN' | 'PERSONAL' | 'WALLET' | 'SETTINGS' | 'PLANS' | 'AI_TOOLS' | 'FAVORITES' | 'UPGRADE' | 'PLAN_PAYMENT' | 'HELP' | 'TERMS' | 'BRANCHES' | 'ATM_MANAGEMENT' | 'MESSAGES';

interface ProfileProps {
    user: UserType;
    onLogout: () => void;
    onOpenMyProducts: () => void;
    favoriteProducts?: Product[];
    onSelectFavorite?: (product: Product) => void;
    onUpgradeUser?: (details: { name: string; phone: string; isBank: boolean; nif: string, plan: PlanType }) => void;
    onUpdateUser?: (user: UserType) => void;
    initialView?: ProfileView;
    navigationTimestamp?: number;
    targetConversationId?: string | null;
    products?: Product[];
    isDarkMode?: boolean;
    onToggleDarkMode?: () => void;
    myBranches?: Bank[];
    onAddBranch?: (branchData: Partial<Bank>) => void;
    onUpdateBranch?: (branchId: string, branchData: Partial<Bank>) => void;
    onDeleteBranch?: (branchId: string) => void;
    onManageBranchProducts?: (branchId: string, branchName: string) => void;
    atms?: ATM[];
    onManageATM?: (action: 'ADD' | 'UPDATE' | 'DELETE', atmData: Partial<ATM> & { id?: string }) => void;
    messages?: Message[];
    onReplyMessage?: (originalMessage: Message, content: string, attachment?: Attachment) => void;
    transactions?: Transaction[];
    onRequestDeposit?: (amount: number, method: 'Multicaixa' | 'Visa' | 'Transferencia' | 'Carteira', proof?: string) => void;
    onRequestWithdrawal?: (amount: number, details: string) => void;
    onSendMessage?: (receiverId: string, content: string, productId?: string, productName?: string, attachment?: Attachment) => void;
    onNavigateToMap?: () => void;
    onProcessTransaction?: (id: string, action: 'approve' | 'reject') => void;
    platformAccounts?: PlatformBankAccount[];
    onAddToCart?: (product: Product) => void;
}

const Header = ({ title, onBack }: { title: string; onBack: () => void }) => (
    <div className="flex items-center gap-4 mb-6 sticky top-0 bg-gray-50 dark:bg-gray-900 z-10 py-2">
        <button onClick={onBack} className="p-2 -ml-2 hover:bg-gray-100 rounded-full dark:hover:bg-gray-800 transition-colors">
            <ArrowLeft size={24} className="text-gray-800 dark:text-gray-200" />
        </button>
        <h2 className="text-xl font-bold text-gray-900 dark:text-white">{title}</h2>
    </div>
);

const ProfileContainer = ({ children, className = '' }: { children: React.ReactNode; className?: string }) => (
    <div className={`h-full bg-gray-50 dark:bg-gray-900 overflow-y-auto pb-20 p-6 animate-[slideInRight_0.2s_ease-out] ${className}`}>
        <div className="max-w-3xl mx-auto w-full h-full">
            {children}
        </div>
    </div>
);

const FAQItem = ({ question, answer }: { question: string, answer: string }) => {
    const [isOpen, setIsOpen] = useState(false);
    return (
        <div className="border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden bg-white dark:bg-gray-800 transition-all mb-3">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="w-full flex items-center justify-between p-4 text-left font-medium text-gray-900 dark:text-white hover:bg-gray-50 dark:hover:bg-gray-700/50"
            >
                {question}
                <ChevronDown size={18} className={`text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
            </button>
            {isOpen && (
                <div className="p-4 pt-0 text-sm text-gray-600 dark:text-gray-300 bg-gray-50/50 dark:bg-gray-800/50 leading-relaxed border-t border-gray-100 dark:border-gray-700">
                    {answer}
                </div>
            )}
        </div>
    );
};

export const Profile: React.FC<ProfileProps> = ({ user, onLogout, onOpenMyProducts, favoriteProducts = [], onSelectFavorite, onUpgradeUser, onUpdateUser, initialView, navigationTimestamp, targetConversationId, products = [], isDarkMode, onToggleDarkMode, myBranches = [], onAddBranch, onUpdateBranch, onDeleteBranch, onManageBranchProducts, atms = [], onManageATM, messages = [], onReplyMessage, transactions = [], onRequestDeposit, onRequestWithdrawal, onSendMessage, onNavigateToMap, onProcessTransaction, platformAccounts = [], onAddToCart }) => {
    const [view, setView] = useState<ProfileView>(initialView || 'MAIN');
    const [aiResult, setAiResult] = useState('');
    const [loadingAi, setLoadingAi] = useState(false);
    const [selectedUpgradePlan, setSelectedUpgradePlan] = useState<PlanType>(PlanType.FREE);
    const [isProcessingPayment, setIsProcessingPayment] = useState(false);

    // Derived state for selected plan
    const selectedPlan = useMemo(() => PLANS.find(p => p.type === selectedUpgradePlan), [selectedUpgradePlan]);

    // Settings State
    const [allowNotifications, setAllowNotifications] = useState(user.settings?.notifications ?? true);
    const [allowMessages, setAllowMessages] = useState(user.settings?.allowMessages ?? true);

    // Change Password State
    const [isChangingPassword, setIsChangingPassword] = useState(false);
    const [passData, setPassData] = useState({ current: '', new: '', confirm: '' });

    const [isOptimizingImage, setIsOptimizingImage] = useState(false);
    const [isOptimizingCover, setIsOptimizingCover] = useState(false);

    // Messaging State
    const [replyContent, setReplyContent] = useState('');
    const [selectedMessageId, setSelectedMessageId] = useState<string | null>(null);
    const [replyAttachment, setReplyAttachment] = useState<Attachment | undefined>(undefined);
    const [isUploading, setIsUploading] = useState(false);
    const replyFileInputRef = useRef<HTMLInputElement>(null);

    const [supportMessage, setSupportMessage] = useState('');

    // Wallet States
    const [activeWalletTab, setActiveWalletTab] = useState<'ALL' | 'SALES' | 'PURCHASES' | 'PENDING'>('ALL');
    const [showDepositModal, setShowDepositModal] = useState(false);
    const [showWithdrawModal, setShowWithdrawModal] = useState(false);
    const [amountAction, setAmountAction] = useState('');
    const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);

    // Deposit Specific States
    const [depositStep, setDepositStep] = useState<1 | 2 | 3>(1);
    const [depositMethod, setDepositMethod] = useState<'Multicaixa' | 'Visa' | 'Transferencia'>('Multicaixa');
    const [depositProof, setDepositProof] = useState<string | null>(null);
    const [cardDetails, setCardDetails] = useState({ number: '', expiry: '', cvc: '', phone: user.phone });

    // Bank Details State
    const [isEditingBank, setIsEditingBank] = useState(false);
    const [bankName, setBankName] = useState('');
    const [iban, setIban] = useState('');
    const [accountNumber, setAccountNumber] = useState('');
    const [beneficiaryName, setBeneficiaryName] = useState('');

    const [isLocating, setIsLocating] = useState(false);
    const [atmName, setAtmName] = useState('');
    const [atmAddress, setAtmAddress] = useState('');
    const [atmStatus, setAtmStatus] = useState<ATMStatus>(ATMStatus.ONLINE);
    const [atmLat, setAtmLat] = useState('');
    const [atmLng, setAtmLng] = useState('');

    const [toast, setToast] = useState<{ show: boolean; message: string; type: ToastType }>({
        show: false,
        message: '',
        type: 'success'
    });

    const showToast = (message: string, type: ToastType = 'success') => {
        setToast({ show: true, message, type });
    };

    // Update view if initialView prop or timestamp changes
    useEffect(() => {
        if (initialView) {
            setView(initialView);
        }
    }, [initialView, navigationTimestamp]);

    // Form states
    const [name, setName] = useState(user.name || '');
    const [email, setEmail] = useState(user.email || '');
    const [phone, setPhone] = useState(user.phone || '');
    const [address, setAddress] = useState(user.address || '');
    const [province, setProvince] = useState(user.province || '');
    const [municipality, setMunicipality] = useState(user.municipality || '');
    const [nif, setNif] = useState(user.nif || '');

    const [showAddBranch, setShowAddBranch] = useState(false);
    const [editingBranch, setEditingBranch] = useState<Bank | null>(null);
    const [branchName, setBranchName] = useState('');
    const [branchPhone, setBranchPhone] = useState('');
    const [branchAddress, setBranchAddress] = useState('');
    const [branchProvince, setBranchProvince] = useState('');
    const [branchMunicipality, setBranchMunicipality] = useState('');

    const [showAddATM, setShowAddATM] = useState(false);

    const [profileImage, setProfileImage] = useState(user.profileImage || 'https://picsum.photos/200');
    const [coverImage, setCoverImage] = useState(user.coverImage || 'https://images.unsplash.com/photo-1579546929518-9e396f3cc809?auto=format&fit=crop&w=1000&q=80');

    const fileInputRef = useRef<HTMLInputElement>(null);
    const coverInputRef = useRef<HTMLInputElement>(null);

    // Upgrade Form States
    const [upgradeName, setUpgradeName] = useState(user.name || '');
    const [upgradePhone, setUpgradePhone] = useState(user.phone || '');
    const [upgradeIsBank, setUpgradeIsBank] = useState(false);
    const [upgradeNif, setUpgradeNif] = useState('');

    useEffect(() => {
        setName(user.name || '');
        setEmail(user.email || '');
        setPhone(user.phone || '');
        setAddress(user.address || '');
        setProvince(user.province || '');
        setMunicipality(user.municipality || '');
        setNif(user.nif || '');
        setProfileImage(user.profileImage || 'https://picsum.photos/200');
        setCoverImage(user.coverImage || 'https://images.unsplash.com/photo-1579546929518-9e396f3cc809?auto=format&fit=crop&w=1000&q=80');
        setAllowNotifications(user.settings?.notifications ?? true);
        setAllowMessages(user.settings?.allowMessages ?? true);

        if (user.bankDetails) {
            setBankName(user.bankDetails.bankName);
            setIban(user.bankDetails.iban);
            setAccountNumber(user.bankDetails.accountNumber);
            setBeneficiaryName(user.bankDetails.beneficiaryName);
        } else {
            setBankName('');
            setIban('');
            setAccountNumber('');
            setBeneficiaryName(user.name || '');
        }
    }, [user]);

    useEffect(() => {
        if (view === 'MESSAGES' && targetConversationId) {
            const myMessages = messages.filter(m => m.receiverId === user.id || m.senderId === user.id);
            const targetMsg = myMessages.find(m => m.senderId === targetConversationId && m.receiverId === user.id);
            if (targetMsg) {
                setSelectedMessageId(targetMsg.id);
            }
        }
    }, [view, targetConversationId, messages, user.id]);

    useEffect(() => {
        if (editingBranch) {
            setBranchName(editingBranch.name || '');
            const cleanPhone = (editingBranch.phone || '').replace('+244', '').replace(/^244/, '').trim();
            setBranchPhone(cleanPhone);
            setBranchAddress(editingBranch.address || '');
            setBranchProvince(editingBranch.province || '');
            setBranchMunicipality(editingBranch.municipality || '');
            setShowAddBranch(true);
        }
    }, [editingBranch]);

    const handleGenerateAd = async () => {
        setLoadingAi(true);
        const result = await generateAdCopy("Tênis Nike Air", "confortável, barato, original");
        setAiResult(result);
        setLoadingAi(false);
    }

    const handleAnalyzeStats = async () => {
        setLoadingAi(true);
        const result = await analyzeBusinessStats(1500, 45); // Mock stats
        setAiResult(result);
        setLoadingAi(false);
    }

    const handleUpgradeSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (upgradeNif.length !== 10) {
            showToast("O NIF deve conter exatamente 10 dígitos numéricos.", 'error');
            return;
        }

        if (onUpgradeUser) {
            onUpgradeUser({
                name: upgradeName,
                phone: upgradePhone,
                isBank: upgradeIsBank,
                nif: upgradeNif,
                plan: selectedUpgradePlan
            });
            showToast(`Conta criada com sucesso! Plano ${selectedUpgradePlan} ativado.`);
            setTimeout(() => setView('MAIN'), 1500);
        }
    };

    const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            try {
                setIsOptimizingImage(true);
                const { optimized } = await processImage(file);

                setProfileImage(optimized);
                if (onUpdateUser) {
                    onUpdateUser({ ...user, profileImage: optimized });
                    showToast('Foto de perfil atualizada!');
                }
            } catch (error) {
                showToast(error instanceof Error ? error.message : "Erro ao processar imagem", 'error');
            } finally {
                setIsOptimizingImage(false);
            }
        }
    };

    const handleCoverUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            try {
                setIsOptimizingCover(true);
                const { optimized } = await processImage(file);
                setCoverImage(optimized);
                if (onUpdateUser) {
                    onUpdateUser({ ...user, coverImage: optimized });
                    showToast('Foto de capa atualizada!');
                }
            } catch (error) {
                showToast(error instanceof Error ? error.message : "Erro ao processar imagem", 'error');
            } finally {
                setIsOptimizingCover(false);
            }
        }
    };

    const triggerFileInput = () => !isOptimizingImage && fileInputRef.current?.click();
    const triggerCoverInput = () => !isOptimizingCover && coverInputRef.current?.click();

    const handleSavePersonalData = () => {
        if (onUpdateUser) {
            if (user.isBusiness && nif.length !== 10) {
                showToast("O NIF deve ter exatamente 10 dígitos.", 'error');
                return;
            }
            onUpdateUser({ ...user, name, email, phone, address, province, municipality, nif: user.isBusiness ? nif : undefined, profileImage, coverImage });
            showToast('Dados atualizados com sucesso!');
        }
    };

    const handleChangePassword = (e: React.FormEvent) => {
        e.preventDefault();
        if (!passData.current) return showToast("Digite a senha atual.", 'error');
        if (passData.new.length < 6) return showToast("A nova senha deve ter pelo menos 6 caracteres.", 'error');
        if (passData.new !== passData.confirm) return showToast("A nova senha e a confirmação não coincidem.", 'error');
        setTimeout(() => { showToast("Palavra-passe alterada com sucesso!", 'success'); setIsChangingPassword(false); setPassData({ current: '', new: '', confirm: '' }); }, 1000);
    };

    const handleSaveBankDetails = () => {
        if (onUpdateUser) {
            onUpdateUser({ ...user, bankDetails: { bankName, iban, accountNumber, beneficiaryName } });
            setIsEditingBank(false);
            showToast('Dados bancários salvos com sucesso!');
        }
    };

    const handleUpdateSettings = (newSettings: { notifications?: boolean, allowMessages?: boolean }) => {
        const updated = { notifications: newSettings.notifications ?? allowNotifications, allowMessages: newSettings.allowMessages ?? allowMessages };
        setAllowNotifications(updated.notifications);
        setAllowMessages(updated.allowMessages);
        if (onUpdateUser) { onUpdateUser({ ...user, settings: updated }); showToast('Configurações atualizadas!'); }
    };

    const handleSubmitBranch = (e: React.FormEvent) => {
        e.preventDefault();
        const formattedPhone = branchPhone ? `+244 ${branchPhone}` : '';
        if (editingBranch && onUpdateBranch) {
            onUpdateBranch(editingBranch.id, { name: branchName, phone: formattedPhone, address: branchAddress, province: branchProvince, municipality: branchMunicipality });
            showToast("Agência atualizada com sucesso!");
        } else if (onAddBranch) {
            onAddBranch({ name: branchName, phone: formattedPhone, address: branchAddress, province: branchProvince, municipality: branchMunicipality, coverImage: user.coverImage, logo: user.profileImage, description: user.isBank ? `Agência do ${user.name} localizada em ${branchMunicipality || 'localização estratégica'}.` : `Filial da ${user.name}.` });
            showToast("Agência adicionada com sucesso!");
        }
        setShowAddBranch(false); setEditingBranch(null); setBranchName(''); setBranchPhone(''); setBranchAddress(''); setBranchProvince(''); setBranchMunicipality('');
    };

    const handleWithdrawSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const amount = parseFloat(amountAction);
        if (!amount || amount <= 0) return;
        if (!user.walletBalance || user.walletBalance < amount) return showToast("Saldo de vendas insuficiente para levantamento.", 'error');
        if (user.isBusiness && !user.bankDetails) { setIsEditingBank(true); setShowWithdrawModal(false); return showToast("Por favor, adicione os dados bancários para recebimento antes de solicitar o levantamento.", 'error'); }
        if (onRequestWithdrawal) {
            const details = user.isBusiness && user.bankDetails ? `${user.bankDetails.bankName} - IBAN: ${user.bankDetails.iban}` : 'Conta Pessoal';
            onRequestWithdrawal(amount, details);
            showToast("Pedido de levantamento enviado para aprovação!", 'success');
            setShowWithdrawModal(false); setAmountAction('');
        }
    };

    const handleDepositProofUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            try { const { optimized } = await processImage(file); setDepositProof(optimized); showToast("Comprovativo anexado!", 'success'); } catch (error) { showToast("Erro ao processar imagem", 'error'); }
        }
    };

    const handleDepositSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (depositStep === 1) { const amount = parseFloat(amountAction); if (!amount || amount <= 0) return showToast("Insira um valor válido.", 'error'); setDepositStep(2); return; }
        if (depositStep === 2) { setDepositStep(3); return; }
        if (depositStep === 3) {
            if (depositMethod === 'Transferencia' && !depositProof) return showToast("Por favor, anexe o comprovativo de pagamento.", 'error');
            if (depositMethod === 'Multicaixa' && (!cardDetails.number || cardDetails.number.length < 10)) return showToast("Por favor, insira um número de cartão válido.", 'error');
            const amount = parseFloat(amountAction);
            if (onRequestDeposit) {
                onRequestDeposit(amount, depositMethod, depositProof || undefined);
                showToast(depositMethod === 'Transferencia' ? "Comprovativo enviado! Aguarde a verificação." : "Carregamento realizado com sucesso!", 'success');
                setShowDepositModal(false); setAmountAction(''); setDepositStep(1); setDepositMethod('Multicaixa'); setDepositProof(null); setCardDetails({ number: '', expiry: '', cvc: '', phone: user.phone });
            }
        }
    };

    const handleSelectPlan = (planType: PlanType) => {
        // Encontrar o plano selecionado
        const plan = PLANS.find(p => p.type === planType);
        if (!plan) return;

        // Criar um "Produto" que representa este plano
        const planProduct: Product = {
            id: `plan_${planType}_${Date.now()}`,
            title: `Plano ${planType}`,
            price: plan.price,
            companyName: 'Facilita Oficial',
            category: 'Serviço', // Corrected from 'Servico' to 'Serviço' to match type definition
            image: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&w=500&q=80',
            isPromoted: false,
            description: `Subscrição mensal do plano ${planType}. Acesso a mais funcionalidades para o seu negócio.`,
            ownerId: 'admin-master'
        };

        // Adicionar ao carrinho se a função existir
        if (onAddToCart) {
            onAddToCart(planProduct);
            showToast(`Plano ${planType} adicionado ao carrinho! Finalize a compra na loja.`, 'success');
        } else {
            // Fallback se não houver carrinho (comportamento antigo)
            setSelectedUpgradePlan(planType);
            setView(user.isBusiness ? 'PLAN_PAYMENT' : 'UPGRADE');
        }
    };

    const handlePlanPayment = () => {
        // Legacy function kept for "UPGRADE" view fallback
        setIsProcessingPayment(true);
        setTimeout(() => {
            setIsProcessingPayment(false);
            if (onUpdateUser) {
                const currentPlanDetails = PLANS.find(p => p.type === (user.plan || PlanType.FREE));
                const currentMaxProd = user.customLimits?.maxProducts ?? currentPlanDetails?.maxProducts ?? 2;
                const currentMaxHigh = user.customLimits?.maxHighlights ?? currentPlanDetails?.maxHighlights ?? 0;
                const myProducts = products.filter(p => p.ownerId === user.id || p.companyName === user.name);
                const currentUsageProducts = myProducts.length;
                const currentUsageHighlights = myProducts.filter(p => p.isPromoted).length;
                const remainingProd = currentMaxProd === -1 ? 0 : Math.max(0, currentMaxProd - currentUsageProducts);
                const remainingHigh = currentMaxHigh === -1 ? 0 : Math.max(0, currentMaxHigh - currentUsageHighlights);
                const newPlanDetails = PLANS.find(p => p.type === selectedUpgradePlan);
                let newMaxProd = newPlanDetails?.maxProducts ?? 0;
                let newMaxHigh = newPlanDetails?.maxHighlights ?? 0;
                if (newMaxProd !== -1) newMaxProd += remainingProd;
                if (newMaxHigh !== -1) newMaxHigh += remainingHigh;

                onUpdateUser({ ...user, plan: selectedUpgradePlan, walletBalance: (user.walletBalance || 0) - (selectedPlan?.price || 0), customLimits: { maxProducts: newMaxProd, maxHighlights: newMaxHigh } });

                if (onRequestDeposit) onRequestDeposit((selectedPlan?.price || 0), 'Carteira', undefined);

                showToast(`Plano ${selectedUpgradePlan} ativado com sucesso!`);
                setTimeout(() => setView('MAIN'), 1500);
            }
        }, 2000);
    }

    const handleSubmitATM = (e: React.FormEvent) => {
        e.preventDefault();
        if (onManageATM) {
            onManageATM('ADD', { id: crypto.randomUUID(), name: atmName || `ATM ${user.name}`, bank: user.name as any, address: atmAddress, status: atmStatus, lat: parseFloat(atmLat) || 0, lng: parseFloat(atmLng) || 0, distance: 'Calculando...', lastUpdated: 'Agora', votes: 0 });
            showToast("ATM adicionado com sucesso!");
            // Kept on management page without redirection as requested
            setShowAddATM(false); setAtmName(''); setAtmAddress(''); setAtmStatus(ATMStatus.ONLINE); setAtmLat(''); setAtmLng('');
        }
    };

    const handleGetLocation = () => {
        setIsLocating(true);
        if (!navigator.geolocation) {
            showToast("Geolocalização não suportada.", 'error');
            setIsLocating(false);
            return;
        }

        // Simular um atraso de GPS e gerar coordenadas visuais (0-100%) para o Mapa Mock
        // Ajustado para garantir que o pino apareça na tela (20-80%)
        setTimeout(() => {
            const visualLat = Math.floor(Math.random() * 60) + 20; // 20% a 80%
            const visualLng = Math.floor(Math.random() * 60) + 20; // 20% a 80%

            setAtmLat(visualLat.toString());
            setAtmLng(visualLng.toString());
            setIsLocating(false);
            showToast("Localização obtida com sucesso!");
        }, 1500);
    };

    const toggleATMStatus = (atm: ATM, type: 'MONEY' | 'ONLINE') => {
        if (!onManageATM) return;
        let newStatus = atm.status;
        if (type === 'MONEY') newStatus = atm.status === ATMStatus.HAS_MONEY ? ATMStatus.NO_MONEY : ATMStatus.HAS_MONEY;
        else newStatus = atm.status === ATMStatus.ONLINE ? ATMStatus.OFFLINE : ATMStatus.ONLINE;
        onManageATM('UPDATE', { id: atm.id, status: newStatus, lastUpdated: 'Agora' });
        showToast("Status atualizado!");
    };

    const handleDeleteATM = (id: string) => { if (window.confirm("Remover este ATM?")) { onManageATM && onManageATM('DELETE', { id }); showToast("ATM removido."); } }

    const handleReplyFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setIsUploading(true);
            try {
                let url = ''; let type: 'image' | 'document' = 'document';
                if (file.type.startsWith('image/')) { const { optimized } = await processImage(file); url = optimized; type = 'image'; } else { const reader = new FileReader(); url = await new Promise((res) => { reader.onload = (e) => res(e.target?.result as string); reader.readAsDataURL(file); }); }
                setReplyAttachment({ type, url, name: file.name });
            } catch (error) { showToast('Erro ao carregar arquivo', 'error'); } finally { setIsUploading(false); }
        }
    };

    const handleReplySubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (selectedMessageId && (replyContent || replyAttachment) && onReplyMessage) {
            const msg = messages.find(m => m.id === selectedMessageId);
            if (msg) { onReplyMessage(msg, replyContent, replyAttachment); setReplyContent(''); setReplyAttachment(undefined); showToast("Resposta enviada!", 'success'); }
        }
    }

    const handleSendSupportMessage = (e: React.FormEvent) => {
        e.preventDefault();
        if (supportMessage.trim() && onSendMessage) { onSendMessage('admin-master', supportMessage); setSupportMessage(''); showToast("Mensagem enviada para o suporte!", 'success'); }
    };

    // --- RENDER VIEWS ---

    // Explicitly handle WALLET view for Business Users
    if (view === 'WALLET') {
        const safeTransactions = Array.isArray(transactions) ? transactions : [];
        const sortedTransactions = [...safeTransactions].sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));
        const filteredTransactions = activeWalletTab === 'ALL' ? sortedTransactions : activeWalletTab === 'PENDING' ? sortedTransactions.filter(t => t.category === 'SALE' && t.status === 'Pendente') : sortedTransactions.filter(t => t.category === (activeWalletTab === 'SALES' ? 'SALE' : 'PURCHASE'));

        return (
            <ProfileContainer>
                <Header title="Minha Carteira" onBack={() => setView('MAIN')} />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                    {user.isBusiness && (
                        <div className="bg-gradient-to-br from-indigo-600 to-indigo-800 rounded-2xl p-6 text-white shadow-lg shadow-indigo-200 dark:shadow-indigo-900/40 relative overflow-hidden">
                            <div className="absolute top-0 right-0 p-4 opacity-10"><Wallet size={64} /></div>
                            <p className="text-indigo-200 text-sm font-medium mb-1">Saldo de Vendas</p>
                            <h3 className="text-3xl font-black mb-4">{(user.walletBalance || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })} Kz</h3>
                            <button onClick={() => setShowWithdrawModal(true)} className="bg-white/20 backdrop-blur-md border border-white/30 rounded-lg px-4 py-2 text-sm font-bold hover:bg-white/30 transition-colors w-full">Levantar Dinheiro</button>
                        </div>
                    )}
                    <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-100 dark:border-gray-700 shadow-sm relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-4 opacity-5 text-teal-600"><CreditCard size={64} /></div>
                        <p className="text-gray-500 dark:text-gray-400 text-sm font-medium mb-1">Saldo de Carregamento</p>
                        <h3 className="text-3xl font-black text-gray-900 dark:text-white mb-4">{(user.topUpBalance || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })} Kz</h3>
                        <button onClick={() => setShowDepositModal(true)} className="bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-lg px-4 py-2 text-sm font-bold hover:bg-indigo-100 dark:hover:bg-indigo-900/50 transition-colors w-full">Carregar Conta</button>
                    </div>
                </div>

                {user.isBusiness && (
                    <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-100 dark:border-gray-700 shadow-sm mb-8">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="font-bold text-gray-900 dark:text-white flex items-center gap-2"><Banknote size={18} /> Dados Bancários (Recebimentos)</h3>
                            <button onClick={() => setIsEditingBank(!isEditingBank)} className="text-indigo-600 font-bold text-xs hover:underline">{isEditingBank ? 'Cancelar' : 'Editar'}</button>
                        </div>
                        {isEditingBank ? (
                            <div className="space-y-4 animate-[fadeIn_0.3s_ease-out]">
                                <div><label className="text-xs font-bold text-gray-500">Nome do Banco</label><input type="text" value={bankName} onChange={e => setBankName(e.target.value)} className="w-full border p-2 rounded-lg text-sm dark:bg-gray-900 dark:border-gray-600 dark:text-white" placeholder="Ex: BAI" /></div>
                                <div><label className="text-xs font-bold text-gray-500">Titular da Conta</label><input type="text" value={beneficiaryName} onChange={e => setBeneficiaryName(e.target.value)} className="w-full border p-2 rounded-lg text-sm dark:bg-gray-900 dark:border-gray-600 dark:text-white" /></div>
                                <div><label className="text-xs font-bold text-gray-500">IBAN</label><input type="text" value={iban} onChange={e => setIban(e.target.value)} className="w-full border p-2 rounded-lg text-sm font-mono dark:bg-gray-900 dark:border-gray-600 dark:text-white" placeholder="AO06..." /></div>
                                <div><label className="text-xs font-bold text-gray-500">Número da Conta</label><input type="text" value={accountNumber} onChange={e => setAccountNumber(e.target.value)} className="w-full border p-2 rounded-lg text-sm dark:bg-gray-900 dark:border-gray-600 dark:text-white" /></div>
                                <Button onClick={handleSaveBankDetails} className="bg-indigo-600 text-white w-full">Salvar Dados</Button>
                            </div>
                        ) : (
                            <div className="grid grid-cols-2 gap-4 text-sm">
                                <div><p className="text-xs text-gray-400 font-bold">Banco</p><p className="text-gray-900 dark:text-white font-medium">{bankName || 'Não configurado'}</p></div>
                                <div><p className="text-xs text-gray-400 font-bold">Titular</p><p className="text-gray-900 dark:text-white font-medium">{beneficiaryName || 'N/A'}</p></div>
                                <div className="col-span-2"><p className="text-xs text-gray-400 font-bold">IBAN</p><p className="text-gray-900 dark:text-white font-mono font-bold tracking-wide bg-gray-50 dark:bg-gray-900 p-2 rounded border border-gray-100 dark:border-gray-700">{iban || 'N/A'}</p></div>
                            </div>
                        )}
                    </div>
                )}

                <div>
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Histórico de Transações</h3>
                    <div className="flex gap-2 mb-4 overflow-x-auto pb-2 no-scrollbar">
                        <button onClick={() => setActiveWalletTab('ALL')} className={`px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-colors ${activeWalletTab === 'ALL' ? 'bg-indigo-600 text-white' : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300'}`}>Todas</button>
                        <button onClick={() => setActiveWalletTab('SALES')} className={`px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-colors ${activeWalletTab === 'SALES' ? 'bg-indigo-600 text-white' : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300'}`}>Vendas</button>
                        <button onClick={() => setActiveWalletTab('PURCHASES')} className={`px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-colors ${activeWalletTab === 'PURCHASES' ? 'bg-indigo-600 text-white' : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300'}`}>Compras</button>
                        <button onClick={() => setActiveWalletTab('PENDING')} className={`px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-colors ${activeWalletTab === 'PENDING' ? 'bg-indigo-600 text-white' : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300'}`}>Pendentes</button>
                    </div>

                    <div className="space-y-3">
                        {filteredTransactions.length === 0 ? <div className="text-center py-8 text-gray-400 text-sm">Nenhuma transação encontrada.</div> : filteredTransactions.map(tx => (
                            <div key={tx.id} onClick={() => setSelectedTransaction(tx)} className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 flex justify-between items-center cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                                <div className="flex items-center gap-3">
                                    <div className={`p-2 rounded-full ${tx.category === 'SALE' || tx.category === 'DEPOSIT' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                                        {tx.category === 'SALE' ? <ArrowDownLeft size={18} /> : tx.category === 'PURCHASE' ? <ShoppingBag size={18} /> : tx.category === 'DEPOSIT' ? <Plus size={18} /> : <ArrowUpRight size={18} />}
                                    </div>
                                    <div>
                                        <p className="font-bold text-gray-900 dark:text-white text-sm">{tx.category === 'SALE' ? 'Venda realizada' : tx.category === 'PURCHASE' ? 'Compra' : tx.category === 'DEPOSIT' ? 'Carregamento' : tx.category === 'WITHDRAWAL' ? 'Levantamento' : 'Pagamento de Plano'}</p>
                                        <p className="text-xs text-gray-500">{tx.productName || tx.otherPartyName || tx.method}</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className={`font-bold text-sm ${tx.category === 'SALE' || tx.category === 'DEPOSIT' ? 'text-green-600' : 'text-gray-900 dark:text-white'}`}>{tx.category === 'SALE' || tx.category === 'DEPOSIT' ? '+' : '-'} {tx.amount.toLocaleString('pt-BR')} Kz</p>
                                    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${tx.status === 'Aprovado' ? 'bg-green-100 text-green-700' : tx.status === 'Pendente' ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'}`}>{tx.status}</span>
                                </div>
                            </div>
                        ))
                        }
                    </div>
                </div>

                {selectedTransaction && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                        <div className="bg-white dark:bg-gray-800 w-full max-w-sm rounded-2xl p-6 shadow-2xl animate-[scaleIn_0.2s_ease-out]">
                            <div className="flex justify-between items-start mb-4"><h3 className="font-bold text-lg text-gray-900 dark:text-white">Detalhes da Transação</h3><button onClick={() => setSelectedTransaction(null)} className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full"><X size={20} className="text-gray-500" /></button></div>
                            <div className="space-y-4">
                                <div className="text-center py-4 bg-gray-50 dark:bg-gray-900/50 rounded-xl">
                                    <p className="text-xs text-gray-500 mb-1">Valor</p>
                                    <p className="text-3xl font-black text-gray-900 dark:text-white">{selectedTransaction.amount.toLocaleString('pt-BR')} Kz</p>
                                    <span className={`inline-block mt-2 px-3 py-1 rounded-full text-xs font-bold ${selectedTransaction.status === 'Aprovado' ? 'bg-green-100 text-green-700' : selectedTransaction.status === 'Pendente' ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'}`}>{selectedTransaction.status}</span>
                                </div>
                                <div className="text-sm space-y-2 text-gray-600 dark:text-gray-300">
                                    <p><strong>Ref:</strong> {selectedTransaction.reference}</p>
                                    <p><strong>Data:</strong> {selectedTransaction.date} - {new Date(selectedTransaction.timestamp).toLocaleTimeString()}</p>
                                    <p><strong>Método:</strong> {selectedTransaction.method}</p>
                                    {selectedTransaction.productName && <p><strong>Produto:</strong> {selectedTransaction.productName}</p>}
                                    {selectedTransaction.otherPartyName && <p><strong>Parte:</strong> {selectedTransaction.otherPartyName}</p>}
                                </div>
                                {selectedTransaction.proofUrl && (<div className="mt-4"><p className="text-xs font-bold text-gray-500 mb-2">Comprovativo Anexado</p><div className="bg-gray-100 dark:bg-gray-900 rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700"><img src={selectedTransaction.proofUrl} alt="Comprovativo" className="w-full object-contain max-h-48" /></div></div>)}
                                {selectedTransaction.category === 'SALE' && selectedTransaction.status === 'Pendente' && selectedTransaction.method === 'Transferencia' && user.isBusiness && (<div className="grid grid-cols-2 gap-3 mt-4 pt-4 border-t border-gray-100 dark:border-gray-700"><Button onClick={() => { if (onProcessTransaction) onProcessTransaction(selectedTransaction.id, 'reject'); setSelectedTransaction(null); }} variant="danger">Rejeitar</Button><Button onClick={() => { if (onProcessTransaction) onProcessTransaction(selectedTransaction.id, 'approve'); setSelectedTransaction(null); }} className="bg-green-600 hover:bg-green-700 text-white border-none shadow-none">Aprovar</Button></div>)}
                            </div>
                        </div>
                    </div>
                )}

                {showDepositModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                        <div className="bg-white dark:bg-gray-800 w-full max-w-sm rounded-2xl p-6 shadow-2xl animate-[scaleIn_0.2s_ease-out] overflow-hidden">
                            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Carregar Conta</h3>
                            <form onSubmit={handleDepositSubmit}>
                                {depositStep === 1 && (<><label className="text-sm font-bold text-gray-600 dark:text-gray-300 mb-2 block">Valor a carregar (Kz)</label><input type="number" autoFocus value={amountAction} onChange={e => setAmountAction(e.target.value)} className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl mb-4 text-lg font-bold outline-none focus:border-indigo-500 dark:text-white" placeholder="5.000" /></>)}
                                {depositStep === 2 && (<div className="space-y-3 mb-6"><p className="text-sm text-gray-500 mb-2">Escolha o método:</p><button type="button" onClick={() => setDepositMethod('Multicaixa')} className={`w-full p-3 rounded-xl border flex items-center gap-3 ${depositMethod === 'Multicaixa' ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-900/20' : 'border-gray-200 dark:border-gray-700'}`}><CreditCard size={20} className="text-indigo-600" /> Multicaixa Express</button><button type="button" onClick={() => setDepositMethod('Transferencia')} className={`w-full p-3 rounded-xl border flex items-center gap-3 ${depositMethod === 'Transferencia' ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-900/20' : 'border-gray-200 dark:border-gray-700'}`}><Landmark size={20} className="text-indigo-600" /> Transferência Bancária</button></div>)}
                                {depositStep === 3 && (<div className="mb-4">{depositMethod === 'Transferencia' ? (<div className="space-y-4"><p className="text-sm text-gray-600">Envie o comprovativo para processamento.</p><input type="file" onChange={handleDepositProofUpload} className="w-full" /></div>) : (<p className="text-sm text-gray-600">Simulação de pagamento Multicaixa.</p>)}</div>)}
                                <div className="flex gap-3 mt-4"><Button type="button" variant="outline" onClick={() => setShowDepositModal(false)} className="flex-1">Cancelar</Button><Button type="submit" fullWidth className="flex-1 bg-indigo-600 text-white shadow-lg">{depositStep === 3 ? 'Confirmar' : 'Continuar'}</Button></div>
                            </form>
                        </div>
                    </div>
                )}

                {showWithdrawModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                        <div className="bg-white dark:bg-gray-800 w-full max-w-sm rounded-2xl p-6 shadow-2xl animate-[scaleIn_0.2s_ease-out]">
                            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Levantar Dinheiro</h3>
                            <div className="bg-indigo-50 dark:bg-indigo-900/20 p-4 rounded-xl mb-6"><p className="text-xs text-indigo-500 font-bold uppercase mb-1">Saldo Disponível</p><p className="text-3xl font-black text-indigo-900 dark:text-indigo-200">{(user.walletBalance || 0).toLocaleString()} Kz</p></div>
                            <form onSubmit={handleWithdrawSubmit}><label className="text-sm font-bold text-gray-600 dark:text-gray-300 mb-2 block">Valor a levantar (Kz)</label><input type="number" autoFocus value={amountAction} onChange={e => setAmountAction(e.target.value)} className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl mb-4 text-lg font-bold outline-none focus:border-indigo-500 dark:text-white" placeholder="0" max={user.walletBalance || 0} /><div className="text-xs text-gray-500 mb-6 bg-gray-100 dark:bg-gray-800 p-3 rounded-lg">O valor será transferido para a conta bancária associada ao perfil da empresa em até 2 dias úteis.</div><div className="flex gap-3"><Button type="button" variant="outline" onClick={() => setShowWithdrawModal(false)} className="flex-1">Cancelar</Button><Button type="submit" fullWidth className="flex-1 bg-indigo-600 text-white">Confirmar</Button></div></form>
                        </div>
                    </div>
                )}
                <Toast isVisible={toast.show} message={toast.message} type={toast.type} onClose={() => setToast(prev => ({ ...prev, show: false }))} />
            </ProfileContainer>
        );
    }

    if (view === 'PERSONAL') {
        return (
            <ProfileContainer>
                <Header title="Dados Pessoais" onBack={() => setView('MAIN')} />
                <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-100 dark:border-gray-700 shadow-sm space-y-4">
                    <div className="space-y-4">
                        <div><label className="text-sm font-bold text-gray-600 dark:text-gray-300 block mb-1">Nome Completo</label><input type="text" value={name} onChange={e => setName(e.target.value)} className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl outline-none dark:text-white" /></div>
                        <div><label className="text-sm font-bold text-gray-600 dark:text-gray-300 block mb-1">Email</label><input type="email" value={email} onChange={e => setEmail(e.target.value)} className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl outline-none dark:text-white" /></div>
                        <div><label className="text-sm font-bold text-gray-600 dark:text-gray-300 block mb-1">Telefone</label><input type="text" value={phone} onChange={e => setPhone(e.target.value)} className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl outline-none dark:text-white" /></div>
                        <div className="grid grid-cols-2 gap-4">
                            <div><label className="text-sm font-bold text-gray-600 dark:text-gray-300 block mb-1">Província</label><select value={province} onChange={e => { setProvince(e.target.value); setMunicipality(''); }} className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl outline-none dark:text-white"><option value="">Selecione</option>{ANGOLA_PROVINCES.map(p => <option key={p} value={p}>{p}</option>)}</select></div>
                            <div><label className="text-sm font-bold text-gray-600 dark:text-gray-300 block mb-1">Município</label><select value={municipality} onChange={e => setMunicipality(e.target.value)} disabled={!province} className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl outline-none dark:text-white disabled:opacity-50"><option value="">Selecione</option>{province && ANGOLA_MUNICIPALITIES[province]?.map(m => <option key={m} value={m}>{m}</option>)}</select></div>
                        </div>
                        <div><label className="text-sm font-bold text-gray-600 dark:text-gray-300 block mb-1">Endereço</label><input type="text" value={address} onChange={e => setAddress(e.target.value)} className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl outline-none dark:text-white" /></div>
                        {user.isBusiness && (<div><label className="text-sm font-bold text-gray-600 dark:text-gray-300 block mb-1">NIF</label><input type="text" value={nif} onChange={e => setNif(e.target.value)} maxLength={10} className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl outline-none dark:text-white" /></div>)}
                    </div>
                    <Button onClick={handleSavePersonalData} fullWidth className="bg-indigo-600 text-white shadow-lg shadow-indigo-200 dark:shadow-none mt-4">Salvar Alterações</Button>
                </div>
            </ProfileContainer>
        );
    }

    // --- NEW VIEWS IMPLEMENTATION ---

    if (view === 'MESSAGES') {
        const myConversations: Record<string, Message[]> = {};
        const myMsgs = messages.filter(m => m.senderId === user.id || m.receiverId === user.id);
        myMsgs.forEach(m => {
            const partnerId = m.senderId === user.id ? m.receiverId : m.senderId;
            if (!myConversations[partnerId]) myConversations[partnerId] = [];
            myConversations[partnerId].push(m);
        });

        // Simplified Logic: if selectedMessageId is set, show chat, else show list
        // Note: selectedMessageId points to a specific message, we derive conversation from it
        let conversationPartnerId: string | null = null;

        if (selectedMessageId) {
            const msg = messages.find(m => m.id === selectedMessageId);
            if (msg) {
                conversationPartnerId = msg.senderId === user.id ? msg.receiverId : msg.senderId;
            }
        }

        return (
            <ProfileContainer>
                <Header title="Mensagens" onBack={() => selectedMessageId ? setSelectedMessageId(null) : setView('MAIN')} />
                {selectedMessageId && conversationPartnerId ? (
                    <div className="flex flex-col h-[calc(100vh-180px)]">
                        <div className="flex-1 overflow-y-auto space-y-4 mb-4 pr-2">
                            {myMsgs.filter(m => m.senderId === conversationPartnerId || m.receiverId === conversationPartnerId).sort((a, b) => a.timestamp - b.timestamp).map(msg => (
                                <div key={msg.id} className={`flex ${msg.senderId === user.id ? 'justify-end' : 'justify-start'}`}>
                                    <div className={`max-w-[80%] p-3 rounded-2xl text-sm ${msg.senderId === user.id ? 'bg-indigo-600 text-white rounded-tr-none' : 'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-800 dark:text-gray-200 rounded-tl-none'}`}>
                                        {msg.productName && <p className="text-xs font-bold mb-1 opacity-80 flex items-center gap-1"><Package size={10} /> {msg.productName}</p>}
                                        {msg.attachment && (
                                            <div className="mb-2 p-1 bg-black/10 rounded overflow-hidden">
                                                {msg.attachment.type === 'image' ? <img src={msg.attachment.url} className="max-w-full rounded" /> : <div className="flex items-center gap-2 text-xs"><Paperclip size={12} /> {msg.attachment.name}</div>}
                                            </div>
                                        )}
                                        <p>{msg.content}</p>
                                        <p className="text-[9px] mt-1 opacity-70 text-right">{new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <div className="bg-white dark:bg-gray-800 p-2 rounded-xl border border-gray-200 dark:border-gray-700 flex gap-2 items-center">
                            <input type="file" ref={replyFileInputRef} className="hidden" onChange={handleReplyFileSelect} />
                            <button onClick={() => replyFileInputRef.current?.click()} className="p-2 text-gray-400 hover:text-indigo-600"><Paperclip size={20} /></button>
                            <input value={replyContent} onChange={e => setReplyContent(e.target.value)} className="flex-1 bg-transparent outline-none text-sm dark:text-white" placeholder="Escreva uma resposta..." />
                            {replyAttachment && <span className="text-xs bg-indigo-100 text-indigo-700 px-2 py-1 rounded">1 anexo</span>}
                            <button onClick={handleReplySubmit} disabled={isUploading} className="p-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"><Send size={18} /></button>
                        </div>
                    </div>
                ) : (
                    <div className="space-y-2">
                        {Object.keys(myConversations).length === 0 ? <p className="text-center text-gray-500 py-10">Nenhuma mensagem.</p> :
                            Object.keys(myConversations).map(partnerId => {
                                const msgs = myConversations[partnerId].sort((a, b) => b.timestamp - a.timestamp);
                                const lastMsg = msgs[0];
                                const name = lastMsg.senderId === user.id ? (lastMsg.receiverId === 'admin-master' ? 'Suporte' : 'Utilizador') : lastMsg.senderName;
                                return (
                                    <button key={partnerId} onClick={() => setSelectedMessageId(lastMsg.id)} className="w-full bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm flex gap-4 text-left hover:border-indigo-200 transition-colors">
                                        <div className="w-12 h-12 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center font-bold text-gray-500 dark:text-gray-300">{name.charAt(0)}</div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex justify-between mb-1"><h4 className="font-bold text-gray-900 dark:text-white truncate">{name}</h4><span className="text-xs text-gray-400">{new Date(lastMsg.timestamp).toLocaleDateString()}</span></div>
                                            <p className="text-sm text-gray-500 dark:text-gray-400 truncate">{lastMsg.content || 'Anexo...'}</p>
                                        </div>
                                        {!lastMsg.isRead && lastMsg.receiverId === user.id && <div className="w-2.5 h-2.5 bg-red-500 rounded-full mt-2"></div>}
                                    </button>
                                );
                            })
                        }
                    </div>
                )}
            </ProfileContainer>
        );
    }

    if (view === 'BRANCHES') {
        return (
            <ProfileContainer>
                <Header title="Gerir Agências" onBack={() => setView('MAIN')} />
                {showAddBranch ? (
                    <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm animate-[fadeIn_0.3s_ease-out]">
                        <h3 className="font-bold text-lg mb-4 text-gray-900 dark:text-white">{editingBranch ? 'Editar Agência' : 'Nova Agência'}</h3>
                        <form onSubmit={handleSubmitBranch} className="space-y-4">
                            <div><label className="text-xs font-bold text-gray-500">Nome da Agência</label><input type="text" value={branchName} onChange={e => setBranchName(e.target.value)} className="w-full border p-3 rounded-xl dark:bg-gray-900 dark:border-gray-700 dark:text-white" placeholder="Ex: Filial Talatona" required /></div>
                            <div><label className="text-xs font-bold text-gray-500">Telefone</label><input type="text" value={branchPhone} onChange={e => setBranchPhone(e.target.value)} className="w-full border p-3 rounded-xl dark:bg-gray-900 dark:border-gray-700 dark:text-white" placeholder="9xx..." /></div>
                            <div><label className="text-xs font-bold text-gray-500">Endereço</label><input type="text" value={branchAddress} onChange={e => setBranchAddress(e.target.value)} className="w-full border p-3 rounded-xl dark:bg-gray-900 dark:border-gray-700 dark:text-white" required /></div>
                            <div className="grid grid-cols-2 gap-4">
                                <div><label className="text-xs font-bold text-gray-500">Província</label><select value={branchProvince} onChange={e => { setBranchProvince(e.target.value); setBranchMunicipality(''); }} className="w-full border p-3 rounded-xl dark:bg-gray-900 dark:border-gray-700 dark:text-white"><option value="">Selecione</option>{ANGOLA_PROVINCES.map(p => <option key={p} value={p}>{p}</option>)}</select></div>
                                <div><label className="text-xs font-bold text-gray-500">Município</label><select value={branchMunicipality} onChange={e => setBranchMunicipality(e.target.value)} disabled={!branchProvince} className="w-full border p-3 rounded-xl dark:bg-gray-900 dark:border-gray-700 dark:text-white"><option value="">Selecione</option>{branchProvince && ANGOLA_MUNICIPALITIES[branchProvince]?.map(m => <option key={m} value={m}>{m}</option>)}</select></div>
                            </div>
                            <div className="flex gap-3 pt-2">
                                <Button type="button" variant="outline" onClick={() => { setShowAddBranch(false); setEditingBranch(null); }}>Cancelar</Button>
                                <Button type="submit" className="bg-indigo-600 text-white">Salvar</Button>
                            </div>
                        </form>
                    </div>
                ) : (
                    <div className="space-y-4">
                        <Button onClick={() => setShowAddBranch(true)} fullWidth className="bg-indigo-600 text-white shadow-lg"><Plus size={20} className="mr-2" /> Adicionar Agência</Button>
                        {myBranches.length === 0 ? (
                            <div className="text-center py-10 text-gray-400"><GitBranch size={48} className="mx-auto mb-2 opacity-50" /><p>Nenhuma agência cadastrada.</p></div>
                        ) : (
                            myBranches.map(branch => (
                                <div key={branch.id} className="bg-white dark:bg-gray-800 p-4 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm flex justify-between items-center">
                                    <div>
                                        <h4 className="font-bold text-gray-900 dark:text-white">{branch.name}</h4>
                                        <p className="text-sm text-gray-500 dark:text-gray-400">{branch.municipality}, {branch.province}</p>
                                    </div>
                                    <div className="flex gap-2">
                                        <button onClick={() => { if (onManageBranchProducts) onManageBranchProducts(branch.id, branch.name); }} className="p-2 bg-indigo-50 text-indigo-600 rounded-lg hover:bg-indigo-100"><Package size={18} /></button>
                                        <button onClick={() => { setEditingBranch(branch); setShowAddBranch(true); }} className="p-2 bg-gray-50 text-gray-600 rounded-lg hover:bg-gray-100"><Edit2 size={18} /></button>
                                        <button onClick={() => onDeleteBranch && onDeleteBranch(branch.id)} className="p-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100"><Trash2 size={18} /></button>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                )}
            </ProfileContainer>
        );
    }

    if (view === 'ATM_MANAGEMENT') {
        const myATMs = atms.filter(a => a.bank === user.name);
        return (
            <ProfileContainer>
                <Header title="Gestão de ATMs" onBack={() => setView('MAIN')} />
                {showAddATM ? (
                    <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-100 dark:border-gray-700 animate-[fadeIn_0.3s_ease-out]">
                        <h3 className="font-bold text-lg mb-4 text-gray-900 dark:text-white">Adicionar ATM</h3>
                        <form onSubmit={handleSubmitATM} className="space-y-4">
                            <div><label className="text-xs font-bold text-gray-500">Nome do ATM</label><input type="text" value={atmName} onChange={e => setAtmName(e.target.value)} className="w-full border p-3 rounded-xl dark:bg-gray-900 dark:border-gray-700 dark:text-white" placeholder="ATM Rua X" required /></div>
                            <div><label className="text-xs font-bold text-gray-500">Endereço</label><input type="text" value={atmAddress} onChange={e => setAtmAddress(e.target.value)} className="w-full border p-3 rounded-xl dark:bg-gray-900 dark:border-gray-700 dark:text-white" placeholder="Rua..." required /></div>
                            <div className="grid grid-cols-2 gap-4">
                                <div><label className="text-xs font-bold text-gray-500">Latitude</label><input type="text" value={atmLat} onChange={e => setAtmLat(e.target.value)} className="w-full border p-3 rounded-xl dark:bg-gray-900 dark:border-gray-700 dark:text-white" placeholder="-8.8..." required /></div>
                                <div><label className="text-xs font-bold text-gray-500">Longitude</label><input type="text" value={atmLng} onChange={e => setAtmLng(e.target.value)} className="w-full border p-3 rounded-xl dark:bg-gray-900 dark:border-gray-700 dark:text-white" placeholder="13.2..." required /></div>
                            </div>
                            <button type="button" onClick={handleGetLocation} className="w-full py-2 bg-teal-50 text-teal-700 font-bold rounded-xl flex items-center justify-center gap-2 text-sm">{isLocating ? <Loader2 className="animate-spin" /> : <LocateFixed size={16} />} Usar minha localização</button>
                            <div className="flex gap-3 pt-2"><Button type="button" variant="outline" onClick={() => setShowAddATM(false)}>Cancelar</Button><Button type="submit" className="bg-indigo-600 text-white">Adicionar</Button></div>
                        </form>
                    </div>
                ) : (
                    <div className="space-y-4">
                        <Button onClick={() => setShowAddATM(true)} fullWidth className="bg-indigo-600 text-white"><Plus size={20} className="mr-2" /> Registar ATM</Button>
                        {myATMs.length === 0 ? <div className="text-center py-10 text-gray-400">Nenhum ATM registado.</div> : myATMs.map(atm => (
                            <div key={atm.id} className="bg-white dark:bg-gray-800 p-4 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm">
                                <div className="flex justify-between items-start mb-2">
                                    <h4 className="font-bold text-gray-900 dark:text-white">{atm.name}</h4>
                                    <button onClick={() => handleDeleteATM(atm.id)} className="text-red-500 hover:bg-red-50 p-1 rounded"><Trash2 size={16} /></button>
                                </div>
                                <p className="text-sm text-gray-500 mb-3">{atm.address}</p>
                                <div className="flex gap-2">
                                    <button onClick={() => toggleATMStatus(atm, 'MONEY')} className={`flex-1 py-1.5 rounded-lg text-xs font-bold border ${atm.status === ATMStatus.HAS_MONEY ? 'bg-teal-50 border-teal-200 text-teal-700' : 'bg-gray-50 border-gray-200 text-gray-500'}`}>💵 {atm.status === ATMStatus.HAS_MONEY ? 'Tem Dinheiro' : 'Sem Dinheiro'}</button>
                                    <button onClick={() => toggleATMStatus(atm, 'ONLINE')} className={`flex-1 py-1.5 rounded-lg text-xs font-bold border ${atm.status === ATMStatus.ONLINE || atm.status === ATMStatus.HAS_MONEY ? 'bg-green-50 border-green-200 text-green-700' : 'bg-red-50 border-red-200 text-red-700'}`}>📡 {atm.status === ATMStatus.OFFLINE ? 'Offline' : 'Online'}</button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </ProfileContainer>
        );
    }

    if (view === 'AI_TOOLS') {
        return (
            <ProfileContainer>
                <Header title="Assistente IA" onBack={() => setView('MAIN')} />
                <div className="space-y-6">
                    <div className="bg-gradient-to-br from-indigo-600 to-purple-700 rounded-2xl p-6 text-white relative overflow-hidden">
                        <Sparkles size={64} className="absolute -top-4 -right-4 text-white/20" />
                        <h3 className="font-bold text-lg mb-2 relative z-10">Gerador de Anúncios</h3>
                        <p className="text-indigo-100 text-sm mb-4 relative z-10">Crie descrições incríveis para seus produtos em segundos.</p>
                        <Button onClick={handleGenerateAd} className="bg-white text-indigo-700 w-full font-bold shadow-none hover:bg-indigo-50" disabled={loadingAi}>
                            {loadingAi ? 'Gerando...' : 'Gerar Exemplo de Anúncio'}
                        </Button>
                    </div>

                    <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm">
                        <h3 className="font-bold text-gray-900 dark:text-white mb-4">Análise de Negócio</h3>
                        <Button onClick={handleAnalyzeStats} className="w-full bg-gray-100 text-gray-800 hover:bg-gray-200 dark:bg-gray-700 dark:text-white" disabled={loadingAi}>
                            {loadingAi ? 'Analisando...' : 'Analisar Desempenho'}
                        </Button>
                    </div>

                    {aiResult && (
                        <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl border border-indigo-100 dark:border-indigo-900 shadow-md animate-[slideUp_0.3s_ease-out]">
                            <h4 className="text-sm font-bold text-indigo-600 dark:text-indigo-400 uppercase mb-2">Resultado da IA</h4>
                            <p className="text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-wrap">{aiResult}</p>
                            <button onClick={() => { navigator.clipboard.writeText(aiResult); showToast("Copiado!"); }} className="mt-4 flex items-center gap-2 text-sm font-bold text-gray-500 hover:text-indigo-600 transition-colors"><Copy size={16} /> Copiar Texto</button>
                        </div>
                    )}
                </div>
            </ProfileContainer>
        );
    }

    if (view === 'SETTINGS') {
        return (
            <ProfileContainer>
                <Header title="Configurações" onBack={() => setView('MAIN')} />
                <div className="space-y-6">
                    <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
                        <h3 className="font-bold text-gray-900 dark:text-white mb-4">Preferências</h3>
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3"><Bell size={20} className="text-gray-400" /> <span className="text-gray-700 dark:text-gray-300 font-medium">Notificações</span></div>
                                <button onClick={() => handleUpdateSettings({ notifications: !allowNotifications })} className={`w-12 h-7 rounded-full transition-colors flex items-center px-1 ${allowNotifications ? 'bg-indigo-600' : 'bg-gray-300 dark:bg-gray-600'}`}><div className={`w-5 h-5 bg-white rounded-full shadow-sm transform transition-transform ${allowNotifications ? 'translate-x-5' : 'translate-x-0'}`}></div></button>
                            </div>
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3"><MessageCircle size={20} className="text-gray-400" /> <span className="text-gray-700 dark:text-gray-300 font-medium">Mensagens Diretas</span></div>
                                <button onClick={() => handleUpdateSettings({ allowMessages: !allowMessages })} className={`w-12 h-7 rounded-full transition-colors flex items-center px-1 ${allowMessages ? 'bg-indigo-600' : 'bg-gray-300 dark:bg-gray-600'}`}><div className={`w-5 h-5 bg-white rounded-full shadow-sm transform transition-transform ${allowMessages ? 'translate-x-5' : 'translate-x-0'}`}></div></button>
                            </div>
                            <div className="flex items-center justify-between pt-2 border-t border-gray-50 dark:border-gray-700">
                                <div className="flex items-center gap-3"><Sun size={20} className="text-gray-400" /> <span className="text-gray-700 dark:text-gray-300 font-medium">Modo Escuro</span></div>
                                <button onClick={onToggleDarkMode} className={`w-12 h-7 rounded-full transition-colors flex items-center px-1 ${isDarkMode ? 'bg-indigo-600' : 'bg-gray-300 dark:bg-gray-600'}`}><div className={`w-5 h-5 bg-white rounded-full shadow-sm transform transition-transform ${isDarkMode ? 'translate-x-5' : 'translate-x-0'}`}></div></button>
                            </div>
                        </div>
                    </div>
                    <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
                        <h3 className="font-bold text-gray-900 dark:text-white mb-4">Segurança</h3>
                        {isChangingPassword ? (
                            <form onSubmit={handleChangePassword} className="space-y-3 animate-[fadeIn_0.3s_ease-out]">
                                <input type="password" placeholder="Senha Atual" value={passData.current} onChange={e => setPassData({ ...passData, current: e.target.value })} className="w-full border p-3 rounded-xl dark:bg-gray-900 dark:border-gray-600 dark:text-white" required />
                                <input type="password" placeholder="Nova Senha" value={passData.new} onChange={e => setPassData({ ...passData, new: e.target.value })} className="w-full border p-3 rounded-xl dark:bg-gray-900 dark:border-gray-600 dark:text-white" required />
                                <input type="password" placeholder="Confirmar Nova Senha" value={passData.confirm} onChange={e => setPassData({ ...passData, confirm: e.target.value })} className="w-full border p-3 rounded-xl dark:bg-gray-900 dark:border-gray-600 dark:text-white" required />
                                <div className="flex gap-2"><Button type="button" variant="outline" onClick={() => setIsChangingPassword(false)}>Cancelar</Button><Button type="submit" className="bg-indigo-600 text-white">Alterar</Button></div>
                            </form>
                        ) : (
                            <button onClick={() => setIsChangingPassword(true)} className="flex items-center gap-3 text-gray-700 dark:text-gray-300 hover:text-indigo-600 font-medium w-full text-left p-2 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition-colors"><Key size={20} className="text-gray-400" /> Alterar Palavra-passe</button>
                        )}
                    </div>
                </div>
            </ProfileContainer>
        );
    }

    if (view === 'HELP') {
        return (
            <ProfileContainer>
                <Header title="Ajuda e Suporte" onBack={() => setView('MAIN')} />
                <div className="space-y-6">
                    <div className="bg-indigo-600 rounded-2xl p-6 text-white shadow-lg">
                        <h3 className="font-bold text-lg mb-2">Como podemos ajudar?</h3>
                        <p className="text-indigo-100 text-sm mb-4">Envie uma mensagem direta para nossa equipa de suporte.</p>
                        <form onSubmit={handleSendSupportMessage} className="flex gap-2">
                            <input value={supportMessage} onChange={e => setSupportMessage(e.target.value)} placeholder="Descreva seu problema..." className="flex-1 rounded-xl px-4 py-2 text-gray-900 text-sm focus:outline-none" />
                            <button type="submit" className="bg-white text-indigo-600 p-2 rounded-xl hover:bg-indigo-50"><Send size={20} /></button>
                        </form>
                    </div>
                    <div>
                        <h3 className="font-bold text-gray-900 dark:text-white mb-4 px-2">Perguntas Frequentes</h3>
                        <FAQItem question="Como criar uma conta empresa?" answer="No momento do cadastro, selecione a opção 'Empresa' e preencha o NIF e dados bancários." />
                        <FAQItem question="Como destacar meus produtos?" answer="Nos planos Profissional e Premium, você tem direito a destaques. Ao criar um produto, marque a opção 'Destacar Produto'." />
                        <FAQItem question="Como funcionam os pagamentos?" answer="Os pagamentos são processados via Multicaixa ou Transferência. O saldo fica disponível na sua Carteira digital." />
                        <FAQItem question="Posso cancelar meu plano?" answer="Sim, pode cancelar a renovação a qualquer momento nas configurações de plano." />
                    </div>
                </div>
            </ProfileContainer>
        );
    }

    if (view === 'TERMS') {
        return (
            <ProfileContainer>
                <Header title="Termos de Uso" onBack={() => setView('MAIN')} />
                <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-100 dark:border-gray-700 shadow-sm text-sm text-gray-600 dark:text-gray-300 space-y-4 leading-relaxed">
                    <p><strong>1. Aceitação</strong><br />Ao usar o Facilita, você concorda com estes termos.</p>
                    <p><strong>2. Serviços</strong><br />Somos uma plataforma de intermediação e localização de serviços.</p>
                    <p><strong>3. Responsabilidades</strong><br />Os vendedores são responsáveis pela qualidade e entrega dos seus produtos.</p>
                    <p><strong>4. Pagamentos</strong><br />A plataforma retém o valor até a confirmação de entrega para segurança de ambas as partes.</p>
                    <p><strong>5. Privacidade</strong><br />Seus dados são protegidos e não compartilhados com terceiros sem consentimento.</p>
                    <div className="pt-4 text-xs text-gray-400">Última atualização: Março 2024</div>
                </div>
            </ProfileContainer>
        );
    }

    if (view === 'FAVORITES') {
        return (
            <ProfileContainer>
                <Header title="Meus Favoritos" onBack={() => setView('MAIN')} />
                {favoriteProducts.length === 0 ? (
                    <div className="text-center py-20 text-gray-400">
                        <Heart size={48} className="mx-auto mb-4 opacity-20" />
                        <p>Você ainda não tem favoritos.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-2 gap-4">
                        {favoriteProducts.map(product => (
                            <button key={product.id} onClick={() => onSelectFavorite && onSelectFavorite(product)} className="bg-white dark:bg-gray-800 p-3 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm text-left">
                                <div className="aspect-square bg-gray-100 dark:bg-gray-700 rounded-xl mb-3 overflow-hidden"><img src={product.image} className="w-full h-full object-cover" /></div>
                                <h3 className="font-bold text-gray-900 dark:text-white text-sm line-clamp-2">{product.title}</h3>
                                <p className="text-indigo-600 dark:text-indigo-400 font-bold text-xs mt-1">{product.price.toLocaleString()} Kz</p>
                            </button>
                        ))}
                    </div>
                )}
            </ProfileContainer>
        );
    }

    if (view === 'UPGRADE') {
        return (
            <ProfileContainer>
                <Header title="Atualizar Conta" onBack={() => setView('MAIN')} />
                <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm">
                    <h3 className="font-bold text-lg mb-4 text-gray-900 dark:text-white">Dados da Empresa</h3>
                    <form onSubmit={handleUpgradeSubmit} className="space-y-4">
                        <div><label className="text-xs font-bold text-gray-500">Nome da Empresa</label><input type="text" value={upgradeName} onChange={e => setUpgradeName(e.target.value)} className="w-full border p-3 rounded-xl dark:bg-gray-900 dark:border-gray-700 dark:text-white" required /></div>
                        <div><label className="text-xs font-bold text-gray-500">NIF (10 Dígitos)</label><input type="text" value={upgradeNif} onChange={e => setUpgradeNif(e.target.value)} maxLength={10} className="w-full border p-3 rounded-xl dark:bg-gray-900 dark:border-gray-700 dark:text-white" required /></div>
                        <div><label className="text-xs font-bold text-gray-500">Telefone Comercial</label><input type="text" value={upgradePhone} onChange={e => setUpgradePhone(e.target.value)} className="w-full border p-3 rounded-xl dark:bg-gray-900 dark:border-gray-700 dark:text-white" required /></div>
                        <div className="flex items-center gap-2 py-2">
                            <input type="checkbox" checked={upgradeIsBank} onChange={e => setUpgradeIsBank(e.target.checked)} className="w-5 h-5 accent-indigo-600" />
                            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">É uma instituição bancária?</span>
                        </div>
                        <div className="p-4 bg-indigo-50 dark:bg-indigo-900/20 rounded-xl mb-4">
                            <p className="text-xs font-bold text-indigo-800 dark:text-indigo-300 mb-1">Plano Selecionado</p>
                            <p className="text-lg font-black text-indigo-900 dark:text-indigo-100">{selectedUpgradePlan}</p>
                            <p className="text-xs text-indigo-600 dark:text-indigo-400 mt-1">{selectedPlan?.price.toLocaleString()} Kz / mês</p>
                        </div>
                        <div className="flex gap-3">
                            <Button type="button" variant="outline" onClick={() => setView('PLANS')}>Alterar Plano</Button>
                            <Button type="submit" className="flex-1 bg-indigo-600 text-white">Confirmar Upgrade</Button>
                        </div>
                    </form>
                </div>
            </ProfileContainer>
        );
    }

    if (view === 'PLAN_PAYMENT') {
        return (
            <ProfileContainer>
                <Header title="Pagamento do Plano" onBack={() => setView('PLANS')} />
                <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm text-center">
                    <div className="w-20 h-20 bg-indigo-100 dark:bg-indigo-900/30 rounded-full flex items-center justify-center mx-auto mb-4 text-indigo-600 dark:text-indigo-400">
                        <Crown size={32} />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Upgrade para {selectedUpgradePlan}</h3>
                    <p className="text-gray-500 dark:text-gray-400 mb-6">Desbloqueie mais produtos e destaques para o seu negócio.</p>

                    <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-xl mb-6 text-left">
                        <div className="flex justify-between mb-2">
                            <span className="text-sm text-gray-600 dark:text-gray-400">Preço Mensal</span>
                            <span className="font-bold text-gray-900 dark:text-white">{selectedPlan?.price.toLocaleString()} Kz</span>
                        </div>
                        <div className="flex justify-between border-t border-gray-200 dark:border-gray-700 pt-2">
                            <span className="font-bold text-gray-900 dark:text-white">Total a Pagar</span>
                            <span className="font-black text-indigo-600 dark:text-indigo-400">{selectedPlan?.price.toLocaleString()} Kz</span>
                        </div>
                    </div>

                    <Button onClick={handlePlanPayment} fullWidth className="h-12 bg-indigo-600 text-white shadow-lg" disabled={isProcessingPayment}>
                        {isProcessingPayment ? <><Loader2 className="animate-spin mr-2" /> Processando...</> : 'Pagar e Ativar'}
                    </Button>
                    <p className="text-[10px] text-gray-400 mt-4">O valor será descontado do seu saldo de carteira.</p>
                </div>
            </ProfileContainer>
        );
    }

    if (view === 'PLANS') {
        return (
            <ProfileContainer>
                <Header title="Planos Disponíveis" onBack={() => setView('MAIN')} />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {PLANS.map(plan => (
                        <div key={plan.id} className={`p-6 rounded-2xl border transition-all ${user.plan === plan.type ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-900/20 ring-1 ring-indigo-600' : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800'}`}>
                            <div className="flex justify-between items-start mb-4">
                                <div>
                                    <h3 className="text-lg font-bold text-gray-900 dark:text-white">{plan.type}</h3>
                                    <p className="text-2xl font-black text-indigo-600 dark:text-indigo-400">{plan.price.toLocaleString()} Kz<span className="text-sm font-normal text-gray-500">/mês</span></p>
                                </div>
                                {user.plan === plan.type && <div className="bg-indigo-600 text-white text-[10px] font-bold px-2 py-1 rounded">ATUAL</div>}
                            </div>
                            <ul className="space-y-2 mb-6">
                                {plan.features.map((f, i) => (
                                    <li key={i} className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                                        <Check size={16} className="text-green-500" /> {f}
                                    </li>
                                ))}
                            </ul>
                            <Button
                                fullWidth
                                variant={user.plan === plan.type ? 'outline' : 'primary'}
                                onClick={() => user.plan !== plan.type && handleSelectPlan(plan.type as PlanType)}
                                disabled={user.plan === plan.type}
                            >
                                {user.plan === plan.type ? 'Plano Atual' : 'Adicionar ao Carrinho'}
                            </Button>
                        </div>
                    ))}
                </div>
            </ProfileContainer>
        );
    }

    // Default Main View
    return (
        <ProfileContainer>
            <div className="relative mb-8">
                {/* Cover Image */}
                <div className="w-full h-32 md:h-48 rounded-xl bg-gray-200 overflow-hidden relative group">
                    <img src={coverImage} alt="Capa" className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <button onClick={triggerCoverInput} className="bg-white/90 p-2 rounded-full shadow-lg text-gray-700 hover:text-indigo-600 transition-colors flex items-center gap-2 px-4 text-xs font-bold">
                            {isOptimizingCover ? <Loader2 size={16} className="animate-spin" /> : <Camera size={16} />}
                            Alterar Capa
                        </button>
                    </div>
                    <input type="file" ref={coverInputRef} className="hidden" accept="image/*" onChange={handleCoverUpload} />
                </div>

                <div className="flex items-end gap-4 px-4 -mt-10 relative z-10">
                    <div className="relative group">
                        <div className="w-20 h-20 rounded-full overflow-hidden border-4 border-white dark:border-gray-900 shadow-lg group-hover:shadow-indigo-500/20 transition-all bg-white">
                            <img src={profileImage} alt={name} className="w-full h-full object-cover" />
                        </div>
                        <button
                            onClick={triggerFileInput}
                            disabled={isOptimizingImage}
                            className="absolute bottom-0 right-0 w-7 h-7 bg-indigo-600 text-white rounded-full flex items-center justify-center shadow-sm border-2 border-white dark:border-gray-900 hover:bg-indigo-700 transition-colors"
                        >
                            {isOptimizingImage ? <Loader2 size={12} className="animate-spin" /> : <Camera size={14} />}
                        </button>
                        <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleImageUpload} />
                    </div>
                    <div className="mb-2">
                        <h2 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight">{name}</h2>
                        <p className="text-gray-500 dark:text-gray-400 font-medium text-sm">{user.isBusiness ? 'Conta Empresarial' : 'Conta Pessoal'}</p>
                    </div>
                </div>
            </div>

            {/* QUICK ACTIONS GRID */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
                <button onClick={() => setView('PERSONAL')} className="p-4 bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 flex flex-col items-center gap-2 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors group">
                    <div className="w-10 h-10 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                        <UserIcon size={20} />
                    </div>
                    <span className="text-xs font-bold text-gray-700 dark:text-gray-300">Dados Pessoais</span>
                </button>

                <button onClick={() => setView('WALLET')} className="p-4 bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 flex flex-col items-center gap-2 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors group">
                    <div className="w-10 h-10 bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                        <Wallet size={20} />
                    </div>
                    <span className="text-xs font-bold text-gray-700 dark:text-gray-300">Carteira</span>
                </button>

                <button onClick={() => setView('MESSAGES')} className="p-4 bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 flex flex-col items-center gap-2 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors group">
                    <div className="w-10 h-10 bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform relative">
                        <MessageCircle size={20} />
                        {messages.some(m => !m.isRead && m.receiverId === user.id) && <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full"></span>}
                    </div>
                    <span className="text-xs font-bold text-gray-700 dark:text-gray-300">Mensagens</span>
                </button>


                {user.isBusiness && (
                    <button onClick={onOpenMyProducts} className="p-4 bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 flex flex-col items-center gap-2 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors group">
                        <div className="w-10 h-10 bg-orange-50 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                            <Package size={20} />
                        </div>
                        <span className="text-xs font-bold text-gray-700 dark:text-gray-300">Meus Produtos</span>
                    </button>
                )}
            </div>

            {/* BUSINESS TOOLS SECTION (If Business) */}
            {user.isBusiness && (
                <div className="mb-6 animate-[fadeIn_0.3s_ease-out]">
                    <h3 className="text-sm font-bold text-gray-50 dark:text-gray-400 uppercase mb-3 ml-1">Ferramentas de Negócio</h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        <button onClick={() => setView('BRANCHES')} className="p-3 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 flex flex-col items-center gap-2 hover:border-indigo-200 dark:hover:border-indigo-700 transition-colors">
                            <GitBranch size={20} className="text-indigo-600 dark:text-indigo-400" />
                            <span className="text-xs font-bold text-gray-700 dark:text-gray-300">Gerir Agências</span>
                        </button>
                        {user.isBank && (
                            <button onClick={() => setView('ATM_MANAGEMENT')} className="p-3 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 flex flex-col items-center gap-2 hover:border-indigo-200 dark:hover:border-indigo-700 transition-colors">
                                <MapPin size={20} className="text-indigo-600 dark:text-indigo-400" />
                                <span className="text-xs font-bold text-gray-700 dark:text-gray-300">Gestão de ATMs</span>
                            </button>
                        )}
                        <button onClick={() => setView('AI_TOOLS')} className="p-3 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 flex flex-col items-center gap-2 hover:border-indigo-200 dark:hover:border-indigo-700 transition-colors">
                            <Sparkles size={20} className="text-indigo-600 dark:text-indigo-400" />
                            <span className="text-xs font-bold text-gray-700 dark:text-gray-300">Assistente IA</span>
                        </button>
                        <button onClick={() => setView('PLANS')} className="p-3 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 flex flex-col items-center gap-2 hover:border-indigo-200 dark:hover:border-indigo-700 transition-colors">
                            <Crown size={20} className="text-yellow-500" />
                            <span className="text-xs font-bold text-gray-700 dark:text-gray-300">Meu Plano</span>
                        </button>
                    </div>
                </div>
            )}

            {/* Upgrade Banner for Personal Accounts */}
            {!user.isBusiness && (
                <div className="mb-6 p-4 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl text-white shadow-lg shadow-indigo-200 dark:shadow-indigo-900/40 relative overflow-hidden">
                    <div className="relative z-10">
                        <h3 className="font-bold text-lg mb-1">Crie sua Conta Empresa</h3>
                        <p className="text-indigo-100 text-sm mb-3">Venda produtos, gerencie agências e muito mais.</p>
                        <button onClick={() => setView('UPGRADE')} className="bg-white text-indigo-600 px-4 py-2 rounded-lg text-xs font-bold shadow-sm hover:bg-indigo-50 transition-colors">
                            Começar Agora
                        </button>
                    </div>
                    <Building2 className="absolute -right-4 -bottom-4 text-white/10 w-32 h-32" />
                </div>
            )}

            {/* GENERAL MENU LIST */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden divide-y divide-gray-50 dark:divide-gray-700/50">
                <button onClick={() => setView('FAVORITES')} className="w-full flex items-center justify-between p-4 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-left group">
                    <div className="flex items-center gap-3">
                        <div className="bg-red-50 dark:bg-red-900/20 p-2 rounded-lg text-red-500"><Heart size={18} /></div>
                        <span className="font-medium text-gray-700 dark:text-gray-300 text-sm">Meus Favoritos</span>
                    </div>
                    <ChevronRight size={16} className="text-gray-300 dark:text-gray-600 group-hover:text-gray-500" />
                </button>
                <button onClick={() => setView('SETTINGS')} className="w-full flex items-center justify-between p-4 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-left group">
                    <div className="flex items-center gap-3">
                        <div className="bg-gray-100 dark:bg-gray-700 p-2 rounded-lg text-gray-500 dark:text-gray-400"><Settings size={18} /></div>
                        <span className="font-medium text-gray-700 dark:text-gray-300 text-sm">Configurações</span>
                    </div>
                    <ChevronRight size={16} className="text-gray-300 dark:text-gray-600 group-hover:text-gray-500" />
                </button>
                <button onClick={() => setView('HELP')} className="w-full flex items-center justify-between p-4 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-left group">
                    <div className="flex items-center gap-3">
                        <div className="bg-blue-50 dark:bg-blue-900/20 p-2 rounded-lg text-blue-500"><HelpCircle size={18} /></div>
                        <span className="font-medium text-gray-700 dark:text-gray-300 text-sm">Ajuda e Suporte</span>
                    </div>
                    <ChevronRight size={16} className="text-gray-300 dark:text-gray-600 group-hover:text-gray-500" />
                </button>
                <button onClick={() => setView('TERMS')} className="w-full flex items-center justify-between p-4 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-left group">
                    <div className="flex items-center gap-3">
                        <div className="bg-gray-100 dark:bg-gray-700 p-2 rounded-lg text-gray-500 dark:text-gray-400"><FileText size={18} /></div>
                        <span className="font-medium text-gray-700 dark:text-gray-300 text-sm">Termos de Uso</span>
                    </div>
                    <ChevronRight size={16} className="text-gray-300 dark:text-gray-600 group-hover:text-gray-500" />
                </button>
                <button onClick={onLogout} className="w-full flex items-center gap-3 p-4 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors text-left text-red-600">
                    <div className="bg-red-50 dark:bg-red-900/20 p-2 rounded-lg"><LogOut size={18} /></div>
                    <span className="font-medium text-sm">Terminar Sessão</span>
                </button>
            </div>

            <Toast isVisible={toast.show} message={toast.message} type={toast.type} onClose={() => setToast(prev => ({ ...prev, show: false }))} />
        </ProfileContainer>
    );
};
