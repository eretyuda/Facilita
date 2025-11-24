

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
  type: PlanType;
  price: number;
  features: string[];
  color: string;
  maxProducts: number; // -1 for unlimited
  maxHighlights: number; // -1 for unlimited
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
  plan?: PlanType;
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
}

export interface Transaction {
  id: string;
  user: string;
  plan: PlanType;
  amount: number;
  date: string;
  status: 'Pendente' | 'Aprovado' | 'Rejeitado';
  method: 'Multicaixa' | 'Visa';
}

export interface Message {
  id: string;
  senderId: string;
  senderName: string;
  receiverId: string; // Company ownerId or User ID
  productId?: string;
  productName?: string;
  content: string;
  timestamp: number;
  isRead: boolean;
  isFromBusiness: boolean; // True if it's a reply from the company
}