import { ATM, ATMStatus, BankName, Product, Plan, PlanType, Bank } from './types';

export const BANKS: Bank[] = [
  {
    id: 'bai',
    name: 'BAI',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/2/2c/Logo_BAI.png',
    coverImage: 'https://images.unsplash.com/photo-1563986768609-322da13575f3?q=80&w=1000&auto=format&fit=crop',
    description: 'Banco Angolano de Investimentos. O parceiro de confiança para o seu futuro.',
    followers: 12500,
    reviews: 450,
    phone: '+244 923 123 456',
    email: 'atendimento@bancobai.ao',
    nif: '5401234567',
    address: 'Av. Ho Chi Minh, Torres BAI',
    province: 'Luanda',
    municipality: 'Luanda',
    isBank: true
  },
  {
    id: 'bfa',
    name: 'BFA',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/d/d4/Banco_de_Fomento_Angola_logo.png',
    coverImage: 'https://images.unsplash.com/photo-1601597111158-2fceff292cdc?auto=format&fit=crop&w=1000&q=80',
    description: 'Banco de Fomento Angola. Crescemos consigo.',
    followers: 9800,
    reviews: 320,
    phone: '+244 923 000 000',
    email: 'contacto@bfa.ao',
    nif: '5409876543',
    address: 'Rua Amilcar Cabral, Nº 58',
    province: 'Luanda',
    municipality: 'Ingombota',
    isBank: true
  },
  {
    id: 'bic',
    name: 'Banco BIC',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/9/9b/Banco_BIC_Angola_logo.png',
    coverImage: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&w=1000&q=80',
    description: 'Crescemos juntos.',
    followers: 5600,
    reviews: 180,
    phone: '+244 222 690 100',
    email: 'geral@bancobic.ao',
    address: 'Edifício BIC, Talatona',
    province: 'Luanda',
    municipality: 'Talatona',
    isBank: true
  },
  {
    id: 'sol',
    name: 'Banco Sol',
    logo: 'https://is1-ssl.mzstatic.com/image/thumb/Purple126/v4/4a/5b/89/4a5b89a8-3568-152e-503c-836798835905/AppIcon-0-0-1x_U007emarketing-0-0-0-7-0-0-sRGB-0-0-0-GLES2_U002c0-512MB-85-220-0-0.png/512x512bb.jpg',
    coverImage: 'https://images.unsplash.com/photo-1556742049-0cfed4f7a07d?auto=format&fit=crop&w=1000&q=80',
    description: 'O banco de todos nós.',
    followers: 3200,
    reviews: 95,
    isBank: true
  },
  {
    id: 'atl',
    name: 'Atlântico',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/6/6f/Banco_Millennium_Atl%C3%A2ntico.png',
    coverImage: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1000&q=80',
    description: 'Valores que contam.',
    followers: 8400,
    reviews: 210,
    isBank: true
  }
];

export const MOCK_ATMS: ATM[] = [
  {
    id: '1',
    name: 'ATM Vila Alice',
    bank: BankName.BAI,
    address: 'Rua Aníbal de Melo, Vila Alice',
    status: ATMStatus.HAS_MONEY,
    distance: '0.2 km',
    lat: 40,
    lng: 40,
    lastUpdated: '10 min atrás',
    votes: 124
  },
  {
    id: '2',
    name: 'ATM Largo da Família',
    bank: BankName.BFA,
    address: 'Largo da Família, Luanda',
    status: ATMStatus.OFFLINE,
    distance: '0.5 km',
    lat: 60,
    lng: 20,
    lastUpdated: '1 hora atrás',
    votes: 5
  },
  {
    id: '3',
    name: 'ATM Mutamba',
    bank: BankName.BIC,
    address: 'Rua da Missão',
    status: ATMStatus.HAS_MONEY,
    distance: '1.2 km',
    lat: 20,
    lng: 70,
    lastUpdated: '2 min atrás',
    votes: 450
  },
  {
    id: '4',
    name: 'ATM Atlantico Shopping',
    bank: BankName.ATL,
    address: 'Belas Shopping',
    status: ATMStatus.NO_MONEY,
    distance: '3.5 km',
    lat: 80,
    lng: 80,
    lastUpdated: '30 min atrás',
    votes: 12
  },
  {
    id: '5',
    name: 'ATM Banco Sol',
    bank: BankName.SOL,
    address: 'Av. Ho Chi Minh',
    status: ATMStatus.HAS_MONEY,
    distance: '0.8 km',
    lat: 50,
    lng: 50,
    lastUpdated: '5 min atrás',
    votes: 89
  }
];

export const MOCK_PRODUCTS: Product[] = [
  {
    id: '1',
    title: 'iPhone 15 Pro Max',
    price: 1200000,
    companyName: 'Tech Angola',
    category: 'Produto',
    image: 'https://images.unsplash.com/photo-1696446701796-da61225697cc?q=80&w=1000&auto=format&fit=crop',
    isPromoted: true
  },
  {
    id: '2',
    title: 'Consultoria Financeira',
    price: 50000,
    companyName: 'Global Finance',
    category: 'Serviço',
    image: 'https://picsum.photos/300/300?random=2',
    isPromoted: false
  },
  {
    id: 'bai1',
    title: 'Crédito Automóvel BAI',
    price: 0,
    companyName: 'BAI',
    category: 'Serviço',
    image: 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&w=500&q=80',
    isPromoted: true,
    bankId: 'bai'
  },
  {
    id: 'promo1',
    title: 'Seguro de Saúde Premium',
    price: 25000,
    companyName: 'Nossa Seguros',
    category: 'Serviço',
    image: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&w=500&q=80',
    isPromoted: true
  },
  {
    id: 'bai2',
    title: 'Conta Salário Plus',
    price: 5000,
    companyName: 'BAI',
    category: 'Serviço',
    image: 'https://images.unsplash.com/photo-1579621970563-ebec7560ff3e?auto=format&fit=crop&w=500&q=80',
    isPromoted: false,
    bankId: 'bai'
  },
  {
    id: 'bfa1',
    title: 'BFA Net Empresas',
    price: 0,
    companyName: 'BFA',
    category: 'Serviço',
    image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=500&q=80',
    isPromoted: true,
    bankId: 'bfa'
  },
  {
    id: 'promo2',
    title: 'Internet Fibra 5G',
    price: 15000,
    companyName: 'Unitel',
    category: 'Serviço',
    image: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=500&q=80',
    isPromoted: true
  },
  {
    id: 'promo3',
    title: 'Kit Solar Residencial',
    price: 450000,
    companyName: 'SunEnergy AO',
    category: 'Produto',
    image: 'https://images.unsplash.com/photo-1509391366360-2e959784a276?auto=format&fit=crop&w=500&q=80',
    isPromoted: true
  },
  {
    id: '3',
    title: 'Laptop Dell XPS',
    price: 850000,
    companyName: 'Mundo Digital',
    category: 'Produto',
    image: 'https://picsum.photos/300/300?random=3',
    isPromoted: false
  },
  {
    id: '4',
    title: 'Design de Interiores',
    price: 150000,
    companyName: 'Casa Bela',
    category: 'Serviço',
    image: 'https://picsum.photos/300/300?random=4',
    isPromoted: true
  }
];

export const PLANS: Plan[] = [
  {
    id: 'free',
    type: PlanType.FREE,
    price: 0,
    features: ['2 Publicações', '0 Destaques', 'Suporte Básico'],
    color: 'bg-white border-gray-200 text-gray-700',
    maxProducts: 2,
    maxHighlights: 0
  },
  {
    id: 'basic',
    type: PlanType.BASIC,
    price: 2000,
    features: ['30 Publicações', '10 Destaques', 'Suporte Básico'],
    color: 'bg-gray-100 border-gray-300 text-gray-800',
    maxProducts: 30,
    maxHighlights: 10
  },
  {
    id: 'pro',
    type: PlanType.PROFESSIONAL,
    price: 10000,
    features: ['100 Publicações', '50 Destaques', 'Estatísticas Básicas'],
    color: 'bg-yellow-50 border-yellow-400 text-yellow-900', // Gold/Yellow Theme
    maxProducts: 100,
    maxHighlights: 50
  },
  {
    id: 'premium',
    type: PlanType.PREMIUM,
    price: 25000,
    features: ['Publicações Ilimitadas', 'Destaques Ilimitados', 'Suporte VIP', 'Gestor de Conta'],
    color: 'bg-gray-900 border-red-600 text-white', // Black/Red Elite Theme
    maxProducts: -1, // Unlimited
    maxHighlights: -1 // Unlimited
  }
];

export const ANGOLA_PROVINCES = [
  "Bengo", "Benguela", "Bié", "Cabinda", "Cuando Cubango",
  "Cuanza Norte", "Cuanza Sul", "Cunene", "Huambo", "Huíla",
  "Luanda", "Lunda Norte", "Lunda Sul", "Malanje", "Moxico",
  "Namibe", "Uíge", "Zaire"
];

export const ANGOLA_MUNICIPALITIES: Record<string, string[]> = {
  "Bengo": ["Ambriz", "Bula Atumba", "Dande", "Dembos", "Nambuangongo", "Pango Aluquém"],
  "Benguela": ["Baía Farta", "Balombo", "Benguela", "Bocoio", "Caimbambo", "Catumbela", "Chongoroi", "Cubal", "Ganda", "Lobito"],
  "Bié": ["Andulo", "Camacupa", "Catabola", "Chinguar", "Chitembo", "Cuemba", "Cunhinga", "Cuíto", "Nharea"],
  "Cabinda": ["Belize", "Buco-Zau", "Cabinda", "Cacongo"],
  "Cuando Cubango": ["Calai", "Cuangar", "Cuchi", "Cuito Cuanavale", "Dirico", "Mavinga", "Menongue", "Nancova", "Rivungo"],
  "Cuanza Norte": ["Ambaca", "Banga", "Bolongongo", "Cambambe", "Cazengo", "Golungo Alto", "Gonguembo", "Lucala", "Quiculungo", "Samba Caju"],
  "Cuanza Sul": ["Amboim", "Cassongue", "Cela", "Conda", "Ebo", "Libolo", "Mussende", "Porto Amboim", "Quibala", "Quilenda", "Seles", "Sumbe"],
  "Cunene": ["Cahama", "Cuanhama", "Curoca", "Cuvelai", "Namacunde", "Ombadja"],
  "Huambo": ["Bailundo", "Caála", "Catchiungo", "Chicala-Choloanga", "Chinjenje", "Ecunha", "Huambo", "Londuimbali", "Longonjo", "Mungo", "Ucuma"],
  "Huíla": ["Caconda", "Cacula", "Caluquembe", "Chiange", "Chibia", "Chicomba", "Chipindo", "Cuvango", "Humpata", "Jamba", "Lubango", "Matala", "Quilengues", "Quipungo"],
  "Luanda": ["Belas", "Cacuaco", "Cazenga", "Ícolo e Bengo", "Luanda", "Quiçama", "Talatona", "Viana", "Kilamba Kiaxi"],
  "Lunda Norte": ["Cambulo", "Capenda-Camulemba", "Caungula", "Chitato", "Cuango", "Cuilo", "Lóvua", "Lubalo", "Lucapa", "Xá-Muteba"],
  "Lunda Sul": ["Cacolo", "Dala", "Muconda", "Saurimo"],
  "Malanje": ["Cacuso", "Calandula", "Cambundi-Catembo", "Cangandala", "Caombo", "Cuaba Nzogo", "Cunda-Dia-Baza", "Luquembo", "Malanje", "Marimba", "Massango", "Mucari", "Quela", "Quirima"],
  "Moxico": ["Alto Zambeze", "Bundas", "Camanongue", "Léua", "Luacano", "Luau", "Luchazes", "Cameia", "Moxico"],
  "Namibe": ["Bibala", "Camacuio", "Moçâmedes", "Tômbua", "Virei"],
  "Uíge": ["Alto Cauale", "Ambuíla", "Bembe", "Buengas", "Bungo", "Damba", "Maquela do Zombo", "Milunga", "Mucaba", "Negage", "Puri", "Quimbele", "Quitexe", "Songo", "Uíge"],
  "Zaire": ["Cuimba", "M'Banza Kongo", "Noqui", "N'Zeto", "Soyo", "Tomboco"]
};