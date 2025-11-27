
import { supabase } from './supabaseClient.ts';
import type { User, Bank, ATM, Product, Transaction, Message, Notification, Plan } from '../types';

// =============================================
// USER OPERATIONS
// =============================================

export const userService = {
  // Get user by email
  async getUserByEmail(email: string) {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .single();

    if (error) throw error;
    return data;
  },

  // Create or Update user (Upsert)
  async createUser(user: Partial<User>) {
    const { data, error } = await supabase
      .from('users')
      .upsert([{
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        is_business: user.isBusiness || false,
        is_admin: user.isAdmin || false,
        is_bank: user.isBank || false,
        nif: user.nif,
        plan: user.plan || 'Gratuito',
        profile_image: user.profileImage,
        cover_image: user.coverImage,
        address: user.address,
        province: user.province,
        municipality: user.municipality,
        wallet_balance: user.walletBalance || 0,
        topup_balance: user.topUpBalance || 0,
        account_status: user.accountStatus || 'Active',
        notifications_enabled: user.settings?.notifications ?? true,
        allow_messages: user.settings?.allowMessages ?? true
      }])
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Update user
  async updateUser(userId: string, updates: Partial<User>) {
    const { data, error } = await supabase
      .from('users')
      .update({
        name: updates.name,
        phone: updates.phone,
        profile_image: updates.profileImage,
        cover_image: updates.coverImage,
        address: updates.address,
        province: updates.province,
        municipality: updates.municipality,
        wallet_balance: updates.walletBalance,
        topup_balance: updates.topUpBalance,
        plan: updates.plan,
        account_status: updates.accountStatus
      })
      .eq('id', userId)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Get all users (admin only)
  async getAllUsers() {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  }
};

// =============================================
// BANK OPERATIONS
// =============================================

export const bankService = {
  // Get all banks
  async getAllBanks() {
    const { data, error } = await supabase
      .from('banks')
      .select('*')
      .order('followers', { ascending: false });

    if (error) throw error;
    return data;
  },

  // Get bank by ID
  async getBankById(bankId: string) {
    const { data, error } = await supabase
      .from('banks')
      .select('*')
      .eq('id', bankId)
      .single();

    if (error) throw error;
    return data;
  },

  // Create or Update bank/company (Upsert)
  async createBank(bank: Partial<Bank>) {
    const { data, error } = await supabase
      .from('banks')
      .upsert([bank]) // Using upsert prevents unique constraint errors
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Update bank
  async updateBank(bankId: string, updates: Partial<Bank>) {
    const { data, error } = await supabase
      .from('banks')
      .update(updates)
      .eq('id', bankId)
      .select()
      .single();

    if (error) throw error;
    return data;
  }
  ,
  // Delete bank
  async deleteBank(bankId: string) {
    const { error } = await supabase
      .from('banks')
      .delete()
      .eq('id', bankId);

    if (error) throw error;
  }
};

// =============================================
// PRODUCT OPERATIONS
// =============================================

export const productService = {
  // Get all products
  async getAllProducts() {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  },

  // Get products by owner
  async getProductsByOwner(ownerId: string) {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('owner_id', ownerId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  },

  // Create product (Upsert to allow overwrites/fixes)
  async createProduct(product: Partial<Product>) {
    const { data, error } = await supabase
      .from('products')
      .upsert([{
        id: product.id,
        title: product.title,
        price: product.price,
        image: product.image,
        company_name: product.companyName,
        category: product.category,
        is_promoted: product.isPromoted || false,
        bank_id: product.bankId,
        owner_id: product.ownerId,
        description: product.description
      }])
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Update product
  async updateProduct(productId: string, updates: Partial<Product>) {
    const { data, error } = await supabase
      .from('products')
      .update({
        title: updates.title,
        price: updates.price,
        image: updates.image,
        description: updates.description,
        is_promoted: updates.isPromoted
      })
      .eq('id', productId)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Delete product
  async deleteProduct(productId: string) {
    const { error } = await supabase
      .from('products')
      .delete()
      .eq('id', productId);

    if (error) throw error;
  }
};

// =============================================
// ATM OPERATIONS
// =============================================

export const atmService = {
  // Get all ATMs
  async getAllATMs() {
    const { data, error } = await supabase
      .from('atms')
      .select('*')
      .order('votes', { ascending: false });

    if (error) throw error;
    return data;
  },

  // Update ATM status
  async updateATMStatus(atmId: string, status: string) {
    const { data, error } = await supabase
      .from('atms')
      .update({ status, last_updated: new Date().toISOString() })
      .eq('id', atmId)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Create ATM
  async createATM(atm: Partial<ATM>) {
    const { data, error } = await supabase
      .from('atms')
      .upsert([{ // Changed to upsert to be safe
        id: atm.id,
        name: atm.name,
        bank: atm.bank,
        address: atm.address,
        status: atm.status || 'Online',
        lat: atm.lat,
        lng: atm.lng,
        votes: 0,
        last_updated: new Date().toISOString()
      }])
      .select()
      .single();

    if (error) {
      console.error('DEBUG: Erro ao criar ATM no Supabase:', error);
      throw error;
    }
    return data;
  },

  // Delete ATM
  async deleteATM(atmId: string) {
    const { error } = await supabase
      .from('atms')
      .delete()
      .eq('id', atmId);

    if (error) throw error;
  },

  // Vote on ATM
  async voteATM(userId: string, atmId: string) {
    // Check if already voted
    const { data: existingVote } = await supabase
      .from('atm_votes')
      .select('*')
      .eq('user_id', userId)
      .eq('atm_id', atmId)
      .single();

    if (existingVote) {
      // Remove vote
      await supabase
        .from('atm_votes')
        .delete()
        .eq('user_id', userId)
        .eq('atm_id', atmId);

      // Decrement votes
      const { data: atm } = await supabase
        .from('atms')
        .select('votes')
        .eq('id', atmId)
        .single();

      await supabase
        .from('atms')
        .update({ votes: Math.max(0, (atm?.votes || 0) - 1) })
        .eq('id', atmId);
    } else {
      // Add vote
      await supabase
        .from('atm_votes')
        .insert([{ user_id: userId, atm_id: atmId }]);

      // Increment votes
      const { data: atm } = await supabase
        .from('atms')
        .select('votes')
        .eq('id', atmId)
        .single();

      await supabase
        .from('atms')
        .update({ votes: (atm?.votes || 0) + 1 })
        .eq('id', atmId);
    }
  }
};

// =============================================
// TRANSACTION OPERATIONS
// =============================================

export const transactionService = {
  // Get user transactions
  async getUserTransactions(userId: string) {
    const { data, error } = await supabase
      .from('transactions')
      .select('*')
      .eq('user_id', userId)
      .order('timestamp', { ascending: false });

    if (error) throw error;
    return data;
  },

  // Create transaction
  async createTransaction(transaction: Partial<Transaction>) {
    const { data, error } = await supabase
      .from('transactions')
      .upsert([{ // Changed to upsert
        user_id: transaction.user,
        plan: transaction.plan,
        product_name: transaction.productName,
        amount: transaction.amount,
        date: transaction.date,
        timestamp: transaction.timestamp,
        status: transaction.status,
        method: transaction.method,
        category: transaction.category,
        reference: transaction.reference,
        other_party_name: transaction.otherPartyName,
        proof_url: transaction.proofUrl
      }])
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Update transaction status
  async updateTransactionStatus(transactionId: string, status: string) {
    const { data, error } = await supabase
      .from('transactions')
      .update({ status })
      .eq('id', transactionId)
      .select()
      .single();

    if (error) throw error;
    return data;
  }
};

// =============================================
// MESSAGE OPERATIONS
// =============================================

export const messageService = {
  // Get user messages
  async getUserMessages(userId: string) {
    const { data, error } = await supabase
      .from('messages')
      .select('*')
      .or(`sender_id.eq.${userId},receiver_id.eq.${userId}`)
      .order('timestamp', { ascending: false });

    if (error) throw error;
    return data;
  },

  // Send message
  async sendMessage(message: Partial<Message>) {
    const { data, error } = await supabase
      .from('messages')
      .upsert([{ // Changed to upsert
        sender_id: message.senderId,
        sender_name: message.senderName,
        receiver_id: message.receiverId,
        product_id: message.productId,
        product_name: message.productName,
        content: message.content,
        timestamp: message.timestamp,
        is_read: false,
        is_from_business: message.isFromBusiness || false
      }])
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Mark message as read
  async markAsRead(messageId: string) {
    const { error } = await supabase
      .from('messages')
      .update({ is_read: true })
      .eq('id', messageId);

    if (error) throw error;
  }
};

// =============================================
// FAVORITES OPERATIONS
// =============================================

export const favoriteService = {
  // Get user favorites
  async getUserFavorites(userId: string) {
    const { data, error } = await supabase
      .from('favorites')
      .select('*, products(*)')
      .eq('user_id', userId);

    if (error) throw error;
    return data;
  },

  // Toggle favorite
  async toggleFavorite(userId: string, productId: string) {
    const { data: existing } = await supabase
      .from('favorites')
      .select('*')
      .eq('user_id', userId)
      .eq('product_id', productId)
      .single();

    if (existing) {
      await supabase
        .from('favorites')
        .delete()
        .eq('user_id', userId)
        .eq('product_id', productId);
    } else {
      await supabase
        .from('favorites')
        .insert([{ user_id: userId, product_id: productId }]);
    }
  }
};

// =============================================
// REALTIME SUBSCRIPTIONS
// =============================================

export const realtimeService = {
  // Subscribe to new messages
  subscribeToMessages(userId: string, callback: (message: any) => void) {
    return supabase
      .channel('messages')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `receiver_id=eq.${userId}`
        },
        callback
      )
      .subscribe();
  },

  // Subscribe to transaction updates
  subscribeToTransactions(userId: string, callback: (transaction: any) => void) {
    return supabase
      .channel('transactions')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'transactions',
          filter: `user_id=eq.${userId}`
        },
        callback
      )
      .subscribe();
  }
};
