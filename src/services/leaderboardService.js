import axiosInstance from '../utils/axios';

export const leaderboardService = {
  // Fetch global leaderboard stats
  getGlobalStats: async () => {
    try {
      const response = await axiosInstance.get('/leaderboard');
      return response.data;
    } catch (error) {
      console.error('Error fetching leaderboard stats:', error);
      throw error;
    }
  },

  // Format large numbers for display
  formatNumber: (num) => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    } else if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
  },

  // Format distance for display
  formatDistance: (distance) => {
    if (distance >= 1000000) {
      return (distance / 1000000).toFixed(1) + 'M km';
    } else if (distance >= 1000) {
      return (distance / 1000).toFixed(1) + 'K km';
    }
    return distance + ' km';
  },

  // Format revenue for display
  formatRevenue: (revenue) => {
    if (revenue >= 1000000) {
      return '₹' + (revenue / 1000000).toFixed(1) + 'M';
    } else if (revenue >= 1000) {
      return '₹' + (revenue / 1000).toFixed(1) + 'K';
    }
    return '₹' + revenue;
  }
};
