import axios from 'axios';

const API_BASE_URL = 'https://api.truckersmp.com/v2';

const truckersmpApi = {
  // Get VTC information including roles and members
  getVtcInfo: async (vtcId) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/vtc/${vtcId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching VTC info:', error);
      throw error;
    }
  },

  // Get VTC members with their roles
  getVtcMembers: async (vtcId) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/vtc/${vtcId}/members`);
      return response.data;
    } catch (error) {
      console.error('Error fetching VTC members:', error);
      throw error;
    }
  },

  // Get specific member details
  getMemberDetails: async (memberId) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/user/${memberId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching member details:', error);
      throw error;
    }
  },

  // Get VTC roles
  getVtcRoles: async (vtcId) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/vtc/${vtcId}/roles`);
      return response.data;
    } catch (error) {
      console.error('Error fetching VTC roles:', error);
      throw error;
    }
  },
};

export default truckersmpApi; 