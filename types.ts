

export enum ATMStatus {
  ONLINE = 'Online',
  OFFLINE = 'Offline',
  NO_MONEY = 'Sem Dinheiro',
  HAS_MONEY = 'Tem Dinheiro'
}

export enum BankName {
  BAI = 'BAI',
  BFA = 'BFA',
  BIC = 'BIC',
  SOL = 'Banco Sol',
  ATL = 'Atlantico'
}

export interface Bank {
  id: string;
  name: string;
  logo: string;
  coverImage: string;
  description: string;
  followers: number; // Added follower count
  reviews: number;   // Added review count
  // Contact & Location Details
  phone?: string;
  email?: string;
  nif?: string;
  address?: string;
  province?: string;
  municipality?: string;
  
  // Hierarchy for Branches/Affiliates
  parentId?: string; // ID of the HQ if this is a branch
  type?: 'HQ' | 'BRANCH'; // Type of entity
  isBank?: boolean; // Optional flag to distinguish banks from companies
}

export interface ATM {
  id: string;
  name: string;
  bank: BankName;
  address: string;
  status: ATMStatus;
  distance: string;
  lat: number;
  lng: number;
  lastUpdated: string;
  votes: number; // Community trust score
}

export interface Product {
  id: string;
  title: string;
  price: number;
  image: string;
  gallery?: string[]; // New property for image gallery
  companyName: string;
  category: 'Produto' | 'Serviço';
  isPromoted?: boolean;
  bankId?: string; // Optional link to a bank
  ownerId?: string; // ID of the user who posted it
  description?: string;
}

export enum PlanType {
  FREE = 'Gratuito',
  BASIC = 'Básico',
  PROFESSIONAL = 'Profissional',
  PREMIUM = 'Premium'
}

export interface Plan {
  id: string;
  type: string; // Changed from PlanType enum to string to allow dynamic plans
  price: number;
  features: string[];
  color: string;
  maxProducts: number; // -1 for unlimited
  maxHighlights: number; // -1 for unlimited
}

export interface UserSettings {
  notifications: boolean;
  allowMessages: boolean;
}

export interface UserBankDetails {
  bankName: string;
  iban: string;
  accountNumber: string;
  beneficiaryName: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  isBusiness: boolean;
  isAdmin?: boolean; // Added Admin Flag
  isBank?: boolean;
  nif?: string; // Added NIF property
  plan?: string; // Changed to string to match dynamic Plan interface
  // Dynamic limits calculated based on upgrades/rollovers
  customLimits?: {
    maxProducts: number;
    maxHighlights: number;
  };
  favorites?: string[]; // Array of Product IDs
  following?: string[]; // Array of Company/Bank IDs the user follows
  profileImage?: string; // Added profile image
  coverImage?: string; // Added cover image
  address?: string; // Added address/location
  province?: string; // Added province
  municipality?: string; // Added municipality
  walletBalance?: number; // Saldo de Vendas (Receitas)
  topUpBalance?: number; // Saldo de Carregamento (Para gastar na plataforma)
  settings?: UserSettings; // New User Settings
  accountStatus?: 'Active' | 'Blocked' | 'Pending'; // Admin status control
  bankDetails?: UserBankDetails; // New: Company Bank Details for withdrawals
}

export interface Transaction {
  id: string;
  user: string; // User ID who owns this transaction record
  plan?: string;
  productName?: string; // For product sales/purchases
  amount: number;
  date: string;
  timestamp: number;
  status: 'Pendente' | 'Aprovado' | 'Rejeitado';
  method: 'Multicaixa' | 'Visa' | 'Carteira' | 'Transferencia' | 'Referencia';
  category: 'PURCHASE' | 'SALE' | 'DEPOSIT' | 'WITHDRAWAL' | 'PLAN_PAYMENT';
  reference: string; // Transaction ID for receipt
  otherPartyName?: string; // Who bought or sold
  proofUrl?: string; // URL of the payment proof
}

export interface Attachment {
  type: 'image' | 'document';
  url: string;
  name: string;
}

export interface Message {
  id: string;
  senderId: string;
  senderName: string;
  receiverId: string; // Company ownerId or User ID
  productId?: string;
  productName?: string;
  content: string;
  attachment?: Attachment; // Added Attachment
  timestamp: number;
  isRead: boolean;
  isFromBusiness: boolean; // True if it's a reply from the company
}

export interface Notification {
  id: string;
  userId: string; // Who receives the notification
  title: string;
  desc: string;
  timestamp: number;
  read: boolean;
  type: 'message' | 'promo' | 'alert' | 'success' | 'info';
  relatedEntityId?: string; // ID of the sender or related resource (e.g., Message Sender ID)
}

// --- NEW ADMIN TYPES ---

export interface PaymentGatewayConfig {
  id: string;
  name: string; // e.g., 'Multicaixa Express', 'Visa'
  provider: string; // 'Proxypay', 'CyberSource', 'Stripe', etc.
  apiKey?: string;
  apiSecret?: string;
  environment: 'Sandbox' | 'Production';
  isActive: boolean;
  supportsReferences: boolean; // Does it support generating references?
}

export interface PlatformBankAccount {
  id: string;
  bankName: string;
  iban: string;
  accountNumber: string;
  holderName: string;
  isActive: boolean;
}

export interface WithdrawalRequest {
  id: string;
  companyId: string;
  companyName: string;
  amount: number;
  requestDate: string;
  status: 'Pendente' | 'Processado' | 'Rejeitado';
  bankDetails: string; // Summary of where to send money
}