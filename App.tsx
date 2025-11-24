

import React, { useState, useEffect } from 'react';
import { Login } from './components/Login';
import { MapView } from './components/MapView';
import { Marketplace } from './components/Marketplace';
import { Profile, ProfileView } from './components/Profile';
import { Dashboard, BankProfile } from './components/Dashboard';
import { ProductDetails } from './components/ProductDetails';
import { Cart } from './components/Cart';
import { PublishProduct } from './components/PublishProduct';
import { MyProducts } from './components/MyProducts';
import { AdminDashboard } from './components/AdminDashboard';
import { Map, ShoppingBag, User, Home, Menu, X, Settings, HelpCircle, FileText, LogOut, ChevronRight, LayoutGrid } from 'lucide-react';
import { User as UserType, Bank, Product, PlanType, ATM, Message } from './types';
import { MOCK_PRODUCTS, BANKS, MOCK_ATMS } from './constants';

const App: React.FC = () => {
  const [user, setUser] = useState<UserType | null>(null);
  const [activeTab, setActiveTab] = useState<'HOME' | 'MAP' | 'MARKET' | 'PROFILE'>('HOME');
  const [profileInitialView, setProfileInitialView] = useState<ProfileView>('MAIN');
  const [selectedBank, setSelectedBank] = useState<Bank | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  
  // State for forcing navigation updates in Profile
  const [navTimestamp, setNavTimestamp] = useState(Date.now());
  
  // State for Dynamic Data
  const [products, setProducts] = useState<Product[]>(MOCK_PRODUCTS);
  const [banks, setBanks] = useState<Bank[]>(BANKS);
  const [otherCompanies, setOtherCompanies] = useState<Bank[]>([]);
  const [atms, setAtms] = useState<ATM[]>(MOCK_ATMS);

  // Messaging State
  const [messages, setMessages] = useState<Message[]>([]);

  // User Votes State (To ensure 1 vote per ATM)
  const [votedAtms, setVotedAtms] = useState<string[]>([]);

  // Mock Users for Admin
  const [allUsers, setAllUsers] = useState<UserType[]>([
      { id: 'u1', name: 'Maria Silva', email: 'maria@gmail.com', phone: '923000000', isBusiness: false },
      { id: 'u2', name: 'Tech Angola', email: 'contato@tech.ao', phone: '923111111', isBusiness: true, plan: PlanType.PROFESSIONAL, profileImage: 'https://picsum.photos/200?1' },
  ]);

  // Cart State
  const [cartItems, setCartItems] = useState<Product[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);

  // Publishing State
  const [showPublishModal, setShowPublishModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [showMyProducts, setShowMyProducts] = useState(false);

  // Branch Product Management State (Override)
  const [branchManageId, setBranchManageId] = useState<string | null>(null);
  const [branchManageName, setBranchManageName] = useState<string | null>(null);

  // Dark Mode Effect
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  const handleLogin = (loggedInUser: UserType) => {
    const userWithFavs = { 
        ...loggedInUser, 
        favorites: loggedInUser.favorites || [],
        following: loggedInUser.following || [],
        profileImage: loggedInUser.profileImage || 'https://picsum.photos/200',
        coverImage: loggedInUser.coverImage || 'https://images.unsplash.com/photo-1579546929518-9e396f3cc809?auto=format&fit=crop&w=1000&q=80'
    };
    setUser(userWithFavs);
    
    // Add to allUsers list if not present (simple check)
    if (!allUsers.find(u => u.email === loggedInUser.email)) {
        setAllUsers([...allUsers, userWithFavs]);
    }

    if (loggedInUser.isBusiness) {
        const companyProfile: Bank = {
            id: loggedInUser.id,
            name: loggedInUser.name,
            logo: loggedInUser.profileImage || '', 
            coverImage: userWithFavs.coverImage,
            description: `Bem-vindo à ${loggedInUser.name}. Oferecemos os melhores produtos e serviços.`,
            followers: 0,
            reviews: 0,
            phone: loggedInUser.phone,
            email: loggedInUser.email,
            nif: loggedInUser.nif,
            address: loggedInUser.address,
            province: loggedInUser.province,
            municipality: loggedInUser.municipality,
            type: 'HQ'
        };

        if (loggedInUser.isBank) {
            if (!banks.find(b => b.name === loggedInUser.name)) {
                setBanks([...banks, companyProfile]);
            }
        } else {
            if (!otherCompanies.find(c => c.name === loggedInUser.name)) {
                setOtherCompanies([...otherCompanies, companyProfile]);
            }
        }
    }
  };

  const handleUpgradeToBusiness = (details: { name: string; phone: string; isBank: boolean; nif: string, plan: PlanType }) => {
    if (!user) return;

    const updatedUser: UserType = {
        ...user,
        name: details.name,
        phone: details.phone,
        isBusiness: true,
        isBank: details.isBank,
        nif: details.nif,
        plan: details.plan // Use the selected plan
    };

    setUser(updatedUser);
    // Update in allUsers list
    setAllUsers(allUsers.map(u => u.id === user.id ? updatedUser : u));

    const companyProfile: Bank = {
        id: updatedUser.id,
        name: details.name,
        logo: user.profileImage || '',
        coverImage: user.coverImage || 'https://images.unsplash.com/photo-1556742049-0cfed4f7a07d?auto=format&fit=crop&w=1000&q=80',
        description: `Bem-vindo à ${details.name}. Encontre aqui os nossos produtos e serviços.`,
        followers: 0,
        reviews: 0,
        phone: details.phone,
        nif: details.nif,
        email: user.email,
        address: user.address,
        province: user.province,
        municipality: user.municipality,
        type: 'HQ'
    };

    if (details.isBank) {
        setBanks([...banks, companyProfile]);
    } else {
        setOtherCompanies([...otherCompanies, companyProfile]);
    }
  };

  const handleUpdateUser = (updatedUser: UserType) => {
    setUser(updatedUser);
    setAllUsers(allUsers.map(u => u.id === updatedUser.id ? updatedUser : u));

    // If user is business, update their info in the public lists (Banks/Companies)
    if (updatedUser.isBusiness) {
        const updateList = (list: Bank[]) => {
            return list.map(item => {
                // Update HQ only
                if (item.id === updatedUser.id && item.type !== 'BRANCH') {
                    return {
                        ...item,
                        name: updatedUser.name,
                        logo: updatedUser.profileImage || item.logo,
                        coverImage: updatedUser.coverImage || item.coverImage,
                        phone: updatedUser.phone,
                        email: updatedUser.email,
                        nif: updatedUser.nif,
                        address: updatedUser.address,
                        province: updatedUser.province,
                        municipality: updatedUser.municipality
                    };
                }
                return item;
            });
        };

        setBanks(prev => updateList(prev));
        setOtherCompanies(prev => updateList(prev));

        // If currently viewing own bank profile, update that too
        if (selectedBank && selectedBank.id === updatedUser.id) {
            setSelectedBank(prev => prev ? {
                ...prev,
                name: updatedUser.name,
                logo: updatedUser.profileImage || prev.logo,
                coverImage: updatedUser.coverImage || prev.coverImage,
                phone: updatedUser.phone,
                email: updatedUser.email,
                nif: updatedUser.nif,
                address: updatedUser.address,
                province: updatedUser.province,
                municipality: updatedUser.municipality
            } : null);
        }
    }
  };

  const handleSendMessage = (receiverId: string, content: string, productId?: string, productName?: string) => {
      if (!user) return;
      
      const newMessage: Message = {
          id: Date.now().toString(),
          senderId: user.id,
          senderName: user.name,
          receiverId,
          productId,
          productName,
          content,
          timestamp: Date.now(),
          isRead: false,
          isFromBusiness: false // Initially sent by user (or business replying, handled in profile)
      };

      setMessages(prev => [newMessage, ...prev]);
  };

  // Function for business replying or user replying in chat
  const handleReplyMessage = (originalMessage: Message, content: string) => {
      if (!user) return;
      
      const newMessage: Message = {
          id: Date.now().toString(),
          senderId: user.id,
          senderName: user.name,
          receiverId: originalMessage.senderId === user.id ? originalMessage.receiverId : originalMessage.senderId,
          productId: originalMessage.productId,
          productName: originalMessage.productName,
          content,
          timestamp: Date.now(),
          isRead: false,
          isFromBusiness: user.isBusiness && user.id !== originalMessage.senderId // Simple check for business reply
      };
      
      setMessages(prev => [newMessage, ...prev]);
  };

  const handleManageATM = (action: 'ADD' | 'UPDATE' | 'DELETE', atmData: Partial<ATM> & { id?: string }) => {
      if (action === 'ADD' && atmData) {
          setAtms(prev => [...prev, atmData as ATM]);
      } else if (action === 'UPDATE' && atmData.id) {
          setAtms(prev => prev.map(atm => atm.id === atmData.id ? { ...atm, ...atmData } : atm));
      } else if (action === 'DELETE' && atmData.id) {
          setAtms(prev => prev.filter(atm => atm.id !== atmData.id));
      }
  };

  const handleValidateATM = (atmId: string) => {
      const hasVoted = votedAtms.includes(atmId);
      
      // Update the ATM vote count
      setAtms(prev => prev.map(atm => {
          if (atm.id === atmId) {
              const currentVotes = atm.votes || 0;
              // If already voted, decrease count (remove vote). If not voted, increase count.
              const newVotes = hasVoted ? Math.max(0, currentVotes - 1) : currentVotes + 1;
              return { ...atm, votes: newVotes };
          }
          return atm;
      }));

      // Update user voted list
      if (hasVoted) {
          setVotedAtms(prev => prev.filter(id => id !== atmId));
      } else {
          setVotedAtms(prev => [...prev, atmId]);
      }
  };

  const handleAddBranch = (branchData: Partial<Bank>) => {
      if (!user) return;
      
      const newBranch: Bank = {
          id: `${user.id}-branch-${Date.now()}`,
          name: branchData.name || '',
          logo: branchData.logo || '',
          coverImage: branchData.coverImage || '',
          description: branchData.description || '',
          followers: 0,
          reviews: 0,
          phone: branchData.phone,
          email: user.email,
          nif: user.nif, // Usually branches share the same NIF or have a sub-NIF
          address: branchData.address,
          province: branchData.province,
          municipality: branchData.municipality,
          parentId: user.id,
          type: 'BRANCH'
      };

      if (user.isBank) {
          setBanks(prev => [...prev, newBranch]);
      } else {
          setOtherCompanies(prev => [...prev, newBranch]);
      }
  };

  const handleUpdateBranch = (branchId: string, branchData: Partial<Bank>) => {
      const updateList = (list: Bank[]) => {
          return list.map(item => {
              if (item.id === branchId) {
                  return { ...item, ...branchData };
              }
              return item;
          });
      };

      if (user?.isBank) {
          setBanks(prev => updateList(prev));
      } else {
          setOtherCompanies(prev => updateList(prev));
      }
  };

  const handleDeleteBranch = (branchId: string) => {
      const deleteFromList = (prev: Bank[]) => prev.filter(b => b.id !== branchId);

      // Optimistic update using functional state update
      if (user?.isBank) {
          setBanks(deleteFromList);
      } else {
          setOtherCompanies(deleteFromList);
      }
  };

  const handleLogout = () => {
    setUser(null);
    setIsMenuOpen(false);
  };

  const navigateTo = (tab: 'HOME' | 'MAP' | 'MARKET' | 'PROFILE') => {
      setActiveTab(tab);
      setProfileInitialView('MAIN');
      setIsMenuOpen(false);
      setSelectedBank(null);
      setSelectedProduct(null);
      setShowMyProducts(false);
      setShowPublishModal(false);
      setBranchManageId(null);
  };

  const navigateToProfileSection = (section: ProfileView) => {
    setActiveTab('PROFILE');
    setProfileInitialView(section);
    setNavTimestamp(Date.now()); // Update timestamp to force view change
    setIsMenuOpen(false);
    setSelectedBank(null);
    setSelectedProduct(null);
    setShowMyProducts(false);
    setShowPublishModal(false);
    setBranchManageId(null);
  };

  // Follow/Unfollow Logic
  const handleToggleFollow = (companyId: string) => {
    if (!user) return;

    const isFollowing = user.following?.includes(companyId);
    let newFollowing = user.following || [];

    if (isFollowing) {
        newFollowing = newFollowing.filter(id => id !== companyId);
    } else {
        newFollowing = [...newFollowing, companyId];
    }

    // Update User
    setUser({ ...user, following: newFollowing });

    // Update Bank/Company Follower Count
    const updateFollowerCount = (list: Bank[]) => {
        return list.map(b => {
            if (b.id === companyId) {
                return { 
                    ...b, 
                    followers: isFollowing ? Math.max(0, b.followers - 1) : b.followers + 1 
                };
            }
            return b;
        });
    };

    setBanks(updateFollowerCount(banks));
    setOtherCompanies(updateFollowerCount(otherCompanies));
    
    // Update selected bank if active
    if (selectedBank && selectedBank.id === companyId) {
        setSelectedBank(prev => prev ? { 
            ...prev, 
            followers: isFollowing ? Math.max(0, prev.followers - 1) : prev.followers + 1 
        } : null);
    }
  };

  // Rating Logic
  const handleRateCompany = (companyId: string) => {
      // Update Bank/Company Review Count
      const updateReviewCount = (list: Bank[]) => {
          return list.map(b => {
              if (b.id === companyId) {
                  return { ...b, reviews: b.reviews + 1 };
              }
              return b;
          });
      };

      setBanks(updateReviewCount(banks));
      setOtherCompanies(updateReviewCount(otherCompanies));

      // Update selected bank if active
      if (selectedBank && selectedBank.id === companyId) {
          setSelectedBank(prev => prev ? { ...prev, reviews: prev.reviews + 1 } : null);
      }
  };

  // Admin Actions
  const handleUpdateUserStatus = (userId: string, action: 'block' | 'verify') => {
      console.log(`User ${userId} action: ${action}`);
      // In a real app, this would update backend state
  };

  if (!user) {
    return <Login onLogin={handleLogin} />;
  }

  // --- ADMIN VIEW ---
  if (user.isAdmin) {
      return (
          <AdminDashboard 
            users={allUsers}
            onUpdateUserStatus={handleUpdateUserStatus}
            onLogout={handleLogout}
          />
      );
  }

  // Cart Logic
  const addToCart = (product: Product) => {
    setCartItems([...cartItems, product]);
  };

  const removeFromCart = (index: number) => {
    const newCart = [...cartItems];
    newCart.splice(index, 1);
    setCartItems(newCart);
  };

  const handleCheckout = () => {
    setCartItems([]);
    setIsCartOpen(false);
    setSelectedProduct(null);
  };

  // Favorites Logic
  const toggleFavorite = (productId: string) => {
    if (!user) return;
    
    const currentFavorites = user.favorites || [];
    let newFavorites;

    if (currentFavorites.includes(productId)) {
        newFavorites = currentFavorites.filter(id => id !== productId);
    } else {
        newFavorites = [...currentFavorites, productId];
    }

    setUser({ ...user, favorites: newFavorites });
  };

  const handleSaveProduct = (newProduct: Product) => {
    if (editingProduct) {
        setProducts(products.map(p => p.id === newProduct.id ? newProduct : p));
    } else {
        setProducts([newProduct, ...products]);
    }
    setShowPublishModal(false);
    setEditingProduct(null);
  };

  const handleDeleteProduct = (productId: string) => {
      // Direct delete, confirmation is handled in the UI component (MyProducts)
      setProducts(prevProducts => prevProducts.filter(p => p.id !== productId));
  };

  const openPublishModal = (productToEdit?: Product) => {
    setEditingProduct(productToEdit || null);
    setShowPublishModal(true);
  };

  // Functions to handle Branch specific product management
  const openBranchProductManager = (branchId: string, branchName: string) => {
      setBranchManageId(branchId);
      setBranchManageName(branchName);
      setShowMyProducts(true);
  };

  const openBranchPublishModal = (productToEdit?: Product) => {
      setEditingProduct(productToEdit || null);
      setShowPublishModal(true);
  };

  const favoriteProducts = products.filter(p => user.favorites?.includes(p.id));
  
  // Get branches for current user
  const myBranches = [...banks, ...otherCompanies].filter(b => b.parentId === user.id);

  const renderContent = () => {
    if (showPublishModal) {
        return (
            <PublishProduct 
                user={user} 
                products={products}
                branches={myBranches} // Pass branches to enable selection
                onBack={() => setShowPublishModal(false)}
                onSave={handleSaveProduct}
                initialData={editingProduct}
                // Pass branch specific data if we are in branch mode
                overrideOwnerId={branchManageId || undefined}
                overrideCompanyName={branchManageName || undefined}
            />
        );
    }

    if (showMyProducts) {
        return (
            <MyProducts 
                user={user}
                products={products}
                branches={myBranches} // Pass branches so MyProducts knows what belongs to user
                onBack={() => {
                    setShowMyProducts(false);
                }}
                onEdit={(p) => openBranchPublishModal(p)}
                onDelete={handleDeleteProduct}
                onAddNew={() => openBranchPublishModal()}
                scopeId={branchManageId || undefined}
                scopeName={branchManageName || undefined}
            />
        );
    }

    if (selectedProduct) {
        return (
            <ProductDetails 
                product={selectedProduct} 
                onBack={() => setSelectedProduct(null)} 
                onAddToCart={addToCart}
                cartItemCount={cartItems.length}
                onOpenCart={() => setIsCartOpen(true)}
                isFavorite={user.favorites?.includes(selectedProduct.id) || false}
                onToggleFavorite={() => toggleFavorite(selectedProduct.id)}
                onSendMessage={(content) => handleSendMessage(selectedProduct.ownerId || '', content, selectedProduct.id, selectedProduct.title)}
            />
        );
    }

    switch (activeTab) {
      case 'HOME':
        if (selectedBank) {
            return (
                <BankProfile 
                    user={user}
                    bank={selectedBank} 
                    products={products}
                    allBanks={[...banks, ...otherCompanies]}
                    onBack={() => setSelectedBank(null)} 
                    onSelectProduct={setSelectedProduct}
                    onToggleFollow={handleToggleFollow}
                    onRate={handleRateCompany}
                    onSelectBranch={(branch) => setSelectedBank(branch)}
                />
            );
        }
        return (
            <Dashboard 
                products={products}
                banks={banks.filter(b => b.type !== 'BRANCH')} // Only show HQs in main list
                otherCompanies={otherCompanies.filter(b => b.type !== 'BRANCH')} // Only show HQs in main list
                onSelectBank={setSelectedBank} 
                onSelectProduct={setSelectedProduct} 
                onViewMarket={() => setActiveTab('MARKET')}
            />
        );
      case 'MAP':
        return (
            <MapView 
                atms={atms} 
                onValidateATM={handleValidateATM} 
                votedAtms={votedAtms}
            />
        );
      case 'MARKET':
        return (
            <Marketplace 
                user={user} 
                products={products}
                onSelectProduct={setSelectedProduct} 
                onOpenPublish={() => {
                    setBranchManageId(null);
                    setBranchManageName(null);
                    openPublishModal();
                }}
                onViewPlans={() => {
                    setProfileInitialView('PLANS');
                    setActiveTab('PROFILE');
                }}
            />
        );
      case 'PROFILE':
        return (
            <Profile 
                user={user} 
                onLogout={handleLogout} 
                onOpenMyProducts={() => {
                    setBranchManageId(null);
                    setBranchManageName(null);
                    setShowMyProducts(true);
                }}
                favoriteProducts={favoriteProducts}
                onSelectFavorite={setSelectedProduct}
                onUpgradeUser={handleUpgradeToBusiness}
                onUpdateUser={handleUpdateUser}
                initialView={profileInitialView}
                navigationTimestamp={navTimestamp}
                products={products}
                isDarkMode={isDarkMode}
                onToggleDarkMode={() => setIsDarkMode(!isDarkMode)}
                myBranches={myBranches}
                onAddBranch={handleAddBranch}
                onUpdateBranch={handleUpdateBranch}
                onDeleteBranch={handleDeleteBranch}
                onManageBranchProducts={openBranchProductManager}
                atms={atms}
                onManageATM={handleManageATM}
                messages={messages}
                onReplyMessage={handleReplyMessage}
            />
        );
      default:
        return (
            <Dashboard 
                products={products}
                banks={banks}
                otherCompanies={otherCompanies}
                onSelectBank={setSelectedBank} 
                onSelectProduct={setSelectedProduct} 
                onViewMarket={() => setActiveTab('MARKET')}
            />
        );
    }
  };

  // Nav Button Component for Desktop Sidebar
  const SidebarButton = ({ icon: Icon, label, tab, active }: any) => (
      <button 
        onClick={() => {
            navigateTo(tab);
        }}
        className={`w-full flex items-center gap-4 px-4 py-3.5 rounded-xl transition-all duration-200 group ${active ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200 dark:shadow-none' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'}`}
      >
        <Icon size={24} className={active ? 'text-white' : 'text-gray-500 dark:text-gray-400 group-hover:text-indigo-600 dark:group-hover:text-white transition-colors'} />
        <span className="font-bold text-sm">{label}</span>
      </button>
  );

  return (
    <div className={`h-screen w-full flex bg-gray-50 dark:bg-gray-900 transition-colors duration-300 overflow-hidden`}>
      
      {/* --- DESKTOP SIDEBAR --- */}
      <aside className="hidden md:flex w-72 flex-col bg-white dark:bg-gray-900 border-r border-gray-100 dark:border-gray-800 h-full shrink-0 z-30 relative">
        <div className="p-8">
             <div className="flex flex-col items-start">
                <div className="text-gray-900 dark:text-white font-black text-3xl tracking-tighter flex items-center gap-1 italic mb-1">
                    Facilita
                </div>
                <div className="w-12 h-1.5 bg-gradient-to-r from-indigo-500 to-teal-400 rounded-full"></div>
             </div>
        </div>

        <nav className="flex-1 px-6 space-y-2">
            <SidebarButton icon={Home} label="Início" tab="HOME" active={activeTab === 'HOME'} />
            <SidebarButton icon={Map} label="Mapa ATM" tab="MAP" active={activeTab === 'MAP'} />
            <SidebarButton icon={ShoppingBag} label="Loja" tab="MARKET" active={activeTab === 'MARKET'} />
            <SidebarButton icon={User} label="Perfil" tab="PROFILE" active={activeTab === 'PROFILE'} />
        </nav>

        {/* User Mini Profile in Sidebar */}
        <div className="p-6 border-t border-gray-100 dark:border-gray-800">
             <div className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors cursor-pointer" onClick={() => navigateTo('PROFILE')}>
                <div className="w-10 h-10 rounded-full bg-indigo-100 dark:bg-gray-600 overflow-hidden">
                    <img src={user.profileImage} alt={user.name} className="w-full h-full object-cover" />
                </div>
                <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-gray-900 dark:text-white truncate">{user.name}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{user.email}</p>
                </div>
                <Settings size={16} className="text-gray-400" />
             </div>
        </div>
      </aside>

      {/* --- MAIN CONTENT AREA --- */}
      <div className="flex-1 flex flex-col h-full relative w-full max-w-[100vw]">
        
        {/* Mobile Header (Only visible on small screens) */}
        <div className="md:hidden bg-gradient-to-r from-indigo-600 to-violet-700 h-24 pt-8 px-6 flex justify-between items-start shrink-0 z-20 shadow-xl shadow-indigo-600/20 relative dark:shadow-indigo-900/40 rounded-b-[2rem]">
             <button 
                onClick={() => setIsMenuOpen(true)}
                className="text-white p-2 hover:bg-white/20 rounded-xl active:scale-95 transition-transform"
             >
                <Menu size={24} />
             </button>
             
             <div className="flex flex-col items-center -mt-1">
                <div className="text-white font-black text-2xl tracking-tighter flex items-center gap-1 italic">
                    Facilita
                </div>
                <div className="w-12 h-1 bg-teal-400 rounded-full mt-1"></div>
             </div>

             <button 
                onClick={() => setIsCartOpen(true)}
                className="w-10 h-10 flex items-center justify-center text-white relative active:scale-95 transition-transform hover:bg-white/20 rounded-xl"
             >
                 <ShoppingBag size={24} />
                 {cartItems.length > 0 && (
                    <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-teal-400 text-teal-900 rounded-full text-[10px] font-bold flex items-center justify-center border-2 border-transparent shadow-sm">
                            {cartItems.length}
                        </span>
                 )}
             </button>
        </div>

        {/* Desktop Header (Cart & Notifications) */}
        <div className="hidden md:flex justify-end items-center p-6 bg-transparent absolute top-0 right-0 z-40 gap-4 pointer-events-none">
             <div className="pointer-events-auto flex gap-4">
                 {activeTab !== 'PROFILE' && (
                     <>
                        <button 
                            onClick={() => navigateTo('MARKET')} 
                            className="w-12 h-12 bg-white dark:bg-gray-800 rounded-full shadow-lg flex items-center justify-center hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                        >
                            <LayoutGrid size={20} className="text-gray-600 dark:text-gray-300" />
                        </button>
                        <button 
                            onClick={() => setIsCartOpen(true)} 
                            className="w-12 h-12 bg-indigo-600 text-white rounded-full shadow-lg shadow-indigo-200 dark:shadow-none flex items-center justify-center hover:bg-indigo-700 transition-colors relative"
                        >
                            <ShoppingBag size={20} />
                            {cartItems.length > 0 && (
                                <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white rounded-full text-[10px] font-bold flex items-center justify-center border-2 border-white dark:border-gray-900">
                                    {cartItems.length}
                                </span>
                            )}
                        </button>
                     </>
                 )}
             </div>
        </div>

        {/* Content Render Container */}
        <div className="flex-1 relative overflow-hidden bg-gray-50 dark:bg-gray-900">
            {/* The main content area now takes full width on desktop, centered content handled inside components if needed */}
            <div className="h-full w-full overflow-hidden relative">
                {renderContent()}
                
                {/* Cart Overlay */}
                {isCartOpen && user && (
                    <Cart 
                        user={user}
                        items={cartItems} 
                        onRemoveItem={removeFromCart} 
                        onClose={() => setIsCartOpen(false)} 
                        onCheckout={handleCheckout}
                    />
                )}
            </div>
        </div>

        {/* Mobile Bottom Navigation */}
        <div className="md:hidden h-20 bg-white dark:bg-gray-900 border-t border-gray-100 dark:border-gray-800 flex items-center justify-around px-4 pb-2 w-full z-40 shadow-[0_-5px_20px_rgba(0,0,0,0.05)] transition-colors duration-300">
          <button 
            onClick={() => { setActiveTab('HOME'); setSelectedBank(null); setSelectedProduct(null); setShowMyProducts(false); setShowPublishModal(false); setBranchManageId(null); }}
            className={`flex flex-col items-center justify-center w-16 h-14 rounded-2xl transition-all duration-300 ${activeTab === 'HOME' ? 'text-indigo-600 -translate-y-2 dark:text-indigo-400' : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-300'}`}
          >
            <div className={`p-1.5 rounded-xl transition-all ${activeTab === 'HOME' ? 'bg-indigo-50 dark:bg-indigo-900/40' : 'bg-transparent'}`}>
                <Home size={22} className={activeTab === 'HOME' ? 'fill-indigo-600 dark:fill-indigo-400' : ''} />
            </div>
            {activeTab === 'HOME' && <span className="text-[9px] font-bold mt-1 animate-fade-in">Início</span>}
          </button>

          <button 
            onClick={() => { setActiveTab('MAP'); setSelectedProduct(null); setShowMyProducts(false); setShowPublishModal(false); setBranchManageId(null); }}
            className={`flex flex-col items-center justify-center w-16 h-14 rounded-2xl transition-all duration-300 ${activeTab === 'MAP' ? 'text-indigo-600 -translate-y-2 dark:text-indigo-400' : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-300'}`}
          >
            <div className={`p-1.5 rounded-xl transition-all ${activeTab === 'MAP' ? 'bg-indigo-50 dark:bg-indigo-900/40' : 'bg-transparent'}`}>
                <Map size={22} className={activeTab === 'MAP' ? 'fill-indigo-600 dark:fill-indigo-400' : ''} />
            </div>
            {activeTab === 'MAP' && <span className="text-[9px] font-bold mt-1 animate-fade-in">Mapa</span>}
          </button>

          <button 
            onClick={() => { setActiveTab('MARKET'); setSelectedProduct(null); setShowMyProducts(false); setShowPublishModal(false); setBranchManageId(null); }}
            className={`flex flex-col items-center justify-center w-16 h-14 rounded-2xl transition-all duration-300 ${activeTab === 'MARKET' ? 'text-indigo-600 -translate-y-2 dark:text-indigo-400' : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-300'}`}
          >
             <div className={`p-1.5 rounded-xl transition-all ${activeTab === 'MARKET' ? 'bg-indigo-50 dark:bg-indigo-900/40' : 'bg-transparent'}`}>
                <ShoppingBag size={22} className={activeTab === 'MARKET' ? 'fill-indigo-600 dark:fill-indigo-400' : ''} />
            </div>
            {activeTab === 'MARKET' && <span className="text-[9px] font-bold mt-1 animate-fade-in">Loja</span>}
          </button>

          <button 
            onClick={() => { 
                setActiveTab('PROFILE'); 
                setProfileInitialView('MAIN');
                setSelectedProduct(null); 
                setShowMyProducts(false); 
                setShowPublishModal(false); 
                setBranchManageId(null);
            }}
            className={`flex flex-col items-center justify-center w-16 h-14 rounded-2xl transition-all duration-300 ${activeTab === 'PROFILE' ? 'text-indigo-600 -translate-y-2 dark:text-indigo-400' : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-300'}`}
          >
            <div className={`p-1.5 rounded-xl transition-all ${activeTab === 'PROFILE' ? 'bg-indigo-50 dark:bg-indigo-900/40' : 'bg-transparent'}`}>
                <User size={22} className={activeTab === 'PROFILE' ? 'fill-indigo-600 dark:fill-indigo-400' : ''} />
            </div>
            {activeTab === 'PROFILE' && <span className="text-[9px] font-bold mt-1 animate-fade-in">Perfil</span>}
          </button>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      {isMenuOpen && (
          <div className="md:hidden absolute inset-0 z-50 flex">
              <div className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity" onClick={() => setIsMenuOpen(false)}></div>
              <div className={`w-[85%] h-full shadow-2xl relative z-10 animate-[slideRight_0.3s_ease-out] flex flex-col transition-colors duration-300 ${isDarkMode ? 'bg-gray-900' : 'bg-white'}`}>
                  <div className="p-8 bg-gradient-to-br from-indigo-600 to-violet-800 text-white relative overflow-hidden">
                      <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-10 -mt-10"></div>
                      <button onClick={() => setIsMenuOpen(false)} className="absolute top-4 right-4 p-2 bg-white/20 rounded-full hover:bg-white/30">
                          <X size={20} />
                      </button>
                      <div className="w-16 h-16 bg-white rounded-full p-0.5 mb-4 shadow-lg">
                          <img src={user.profileImage} alt="User" className="w-full h-full rounded-full object-cover" />
                      </div>
                      <h2 className="text-xl font-bold">{user.name}</h2>
                      <p className="text-indigo-100 text-sm">{user.isBusiness ? 'Conta Empresarial' : 'Conta Pessoal'}</p>
                  </div>

                  <div className="flex-1 overflow-y-auto py-6">
                       <nav className="space-y-1 px-4">
                          <button onClick={() => navigateToProfileSection('SETTINGS')} className="w-full flex items-center justify-between px-4 py-3.5 rounded-xl text-gray-600 hover:bg-gray-50 transition-colors dark:text-gray-300 dark:hover:bg-gray-800">
                              <div className="flex items-center gap-3"><Settings size={20} /> Configurações</div>
                              <ChevronRight size={16} className="text-gray-300 dark:text-gray-600" />
                          </button>
                          <button onClick={() => navigateToProfileSection('HELP')} className="w-full flex items-center justify-between px-4 py-3.5 rounded-xl text-gray-600 hover:bg-gray-50 transition-colors dark:text-gray-300 dark:hover:bg-gray-800">
                              <div className="flex items-center gap-3"><HelpCircle size={20} /> Ajuda & Suporte</div>
                              <ChevronRight size={16} className="text-gray-300 dark:text-gray-600" />
                          </button>
                          <button onClick={() => navigateToProfileSection('TERMS')} className="w-full flex items-center justify-between px-4 py-3.5 rounded-xl text-gray-600 hover:bg-gray-50 transition-colors dark:text-gray-300 dark:hover:bg-gray-800">
                              <div className="flex items-center gap-3"><FileText size={20} /> Termos de Uso</div>
                              <ChevronRight size={16} className="text-gray-300 dark:text-gray-600" />
                          </button>
                      </nav>
                  </div>

                  <div className="p-6 border-t border-gray-100 dark:border-gray-800">
                      <button onClick={handleLogout} className="w-full flex items-center justify-center gap-2 p-4 text-red-600 font-bold bg-red-50 hover:bg-red-100 rounded-xl transition-colors dark:bg-red-900/20 dark:text-red-400 dark:hover:bg-red-900/30">
                          <LogOut size={20} /> Terminar Sessão
                      </button>
                  </div>
              </div>
          </div>
      )}

    </div>
  );
};

export default App;