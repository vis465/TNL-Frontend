import axiosInstance from '../utils/axios';

export async function listTemplates() {
  const { data } = await axiosInstance.get('/contracts/templates');
  return data;
}

export async function buyContract(templateId) {
  const { data } = await axiosInstance.post(`/contracts/buy/${templateId}`);
  return data;
}

export async function myContracts() {
  try {
    const { data } = await axiosInstance.get('/contracts/me');
    
    // Format contract data for better display
    const formattedData = {
      active: (data.active || []).map(contract => ({
        ...contract,
        formattedCreatedAt: new Date(contract.createdAt).toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'short',
          day: 'numeric'
        }),
        formattedDeadline: contract.deadline ? new Date(contract.deadline).toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'short',
          day: 'numeric'
        }) : null,
        daysRemaining: contract.deadline ? Math.ceil((new Date(contract.deadline) - new Date()) / (1000 * 60 * 60 * 24)) : null,
        progressPercentage: contract.tasks ? 
          Math.round((contract.tasks.filter(task => task.completed).length / contract.tasks.length) * 100) : 0,
        statusColor: getContractStatusColor(contract.status),
        isExpired: contract.deadline ? new Date(contract.deadline) < new Date() : false
      })),
      history: (data.history || []).map(contract => ({
        ...contract,
        formattedCreatedAt: new Date(contract.createdAt).toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'short',
          day: 'numeric'
        }),
        formattedCompletedAt: contract.completedAt ? new Date(contract.completedAt).toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'short',
          day: 'numeric'
        }) : null,
        statusColor: getContractStatusColor(contract.status),
        progressPercentage: contract.tasks ? 
          Math.round((contract.tasks.filter(task => task.completed).length / contract.tasks.length) * 100) : 0
      }))
    };

    return formattedData;
  } catch (error) {
    console.error('Contracts service error:', error);
    throw error;
  }
}

// Helper function to get status color
function getContractStatusColor(status) {
  switch (status) {
    case 'active':
      return 'success';
    case 'completed':
      return 'primary';
    case 'failed':
      return 'error';
    case 'expired':
      return 'warning';
    default:
      return 'default';
  }
}

// Get contract statistics
export async function getContractStats() {
  try {
    const contracts = await myContracts();
    const active = contracts.active || [];
    const history = contracts.history || [];
    
    const stats = {
      totalActive: active.length,
      totalCompleted: history.filter(c => c.status === 'completed').length,
      totalFailed: history.filter(c => c.status === 'failed').length,
      totalContracts: active.length + history.length,
      averageProgress: active.length > 0 ? 
        Math.round(active.reduce((sum, c) => sum + c.progressPercentage, 0) / active.length) : 0,
      expiringSoon: active.filter(c => c.daysRemaining !== null && c.daysRemaining <= 3).length,
      totalReward: active.reduce((sum, c) => sum + (c.templateId?.rewardTokens || 0), 0),
      totalPenalty: active.reduce((sum, c) => sum + (c.templateId?.penaltyTokens || 0), 0)
    };

    return stats;
  } catch (error) {
    console.error('Contract stats error:', error);
    throw error;
  }
}

// Get contract leaderboard
export async function getContractLeaderboard(limit = 20) {
  try {
    const { data } = await axiosInstance.get(`/contracts/leaderboard?limit=${limit}`);
    return data;
  } catch (error) {
    console.error('Contract leaderboard error:', error);
    throw error;
  }
}

// Admin CRUD
export async function createTemplate(payload) {
  const { data } = await axiosInstance.post('/contracts/templates', payload);
  return data;
}

export async function updateTemplate(id, payload) {
  const { data } = await axiosInstance.put(`/contracts/templates/${id}`, payload);
  return data;
}

export async function deleteTemplate(id) {
  const { data } = await axiosInstance.delete(`/contracts/templates/${id}`);
  return data;
}

// Admin list contract instances with progress
export async function adminListContractInstances(status) {
  const qs = status ? `?status=${encodeURIComponent(status)}` : '';
  const { data } = await axiosInstance.get(`/contracts/admin/instances${qs}`);
  return data;
}

