import axiosInstance from '../utils/axios';

// Enhanced wallet service with better error handling and data formatting
export async function getMyWallet() {
  try {
    const { data } = await axiosInstance.get('/wallet/me');
    
    // Format transactions with better structure
    const formattedTransactions = (data.transactions || []).map(tx => {
      // Use the type field from backend if available, otherwise determine from amount
      const isCredit = tx.type === 'credit' || (tx.type === undefined && tx.amount > 0);
      const transactionType = tx.type || (tx.amount > 0 ? 'credit' : 'debit');
      
      return {
        ...tx,
        formattedAmount: isCredit ? `+${Math.abs(tx.amount)}` : `-${Math.abs(tx.amount)}`,
        formattedDate: new Date(tx.createdAt).toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'short',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        }),
        isCredit,
        type: transactionType
      };
    });

    return {
      ...data,
      transactions: formattedTransactions,
      formattedBalance: data.balance?.toLocaleString() || '0'
    };
  } catch (error) {
    console.error('Wallet service error:', error);
    throw error;
  }
}

export async function getRecentTransactions(limit = 10) {
  try {
    const wallet = await getMyWallet();
    return {
      transactions: wallet.transactions.slice(0, limit),
      totalTransactions: wallet.transactions.length
    };
  } catch (error) {
    console.error('Recent transactions error:', error);
    throw error;
  }
}

export async function purchase(amount, title, metadata, idempotencyKey) {
  try {
    const { data } = await axiosInstance.post('/wallet/purchase', {
      amount, title, metadata, idempotencyKey
    });
    return data;
  } catch (error) {
    console.error('Purchase error:', error);
    throw error;
  }
}

// Get wallet statistics
export async function getWalletStats() {
  try {
    const wallet = await getMyWallet();
    const transactions = wallet.transactions || [];
    
    const stats = {
      totalTransactions: transactions.length,
      totalCredits: transactions.filter(tx => tx.isCredit).length,
      totalDebits: transactions.filter(tx => !tx.isCredit).length,
      totalCreditAmount: transactions
        .filter(tx => tx.isCredit)
        .reduce((sum, tx) => sum + Math.abs(tx.amount), 0),
      totalDebitAmount: transactions
        .filter(tx => !tx.isCredit)
        .reduce((sum, tx) => sum + Math.abs(tx.amount), 0),
      recentActivity: transactions.slice(0, 5)
    };

    return stats;
  } catch (error) {
    console.error('Wallet stats error:', error);
    throw error;
  }
}


