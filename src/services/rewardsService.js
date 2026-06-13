import axiosInstance from '../utils/axios';

export async function getStreakInfo() {
  const { data } = await axiosInstance.get('/rewards/streak');
  return data;
}

export async function getMilestones() {
  const { data } = await axiosInstance.get('/rewards/milestones');
  return data?.milestones || [];
}

export async function claimMilestone(milestoneId) {
  const { data } = await axiosInstance.post(`/rewards/milestones/${milestoneId}/claim`);
  return data;
}

export async function revealMilestone(milestoneId, powerupId) {
  const { data } = await axiosInstance.post(`/rewards/milestones/${milestoneId}/reveal`, { powerupId });
  return data;
}

export async function getPowerupInventory() {
  const { data } = await axiosInstance.get('/rewards/powerups');
  return data;
}

export async function activatePowerup(powerupId, payload = {}) {
  const { data } = await axiosInstance.post(`/rewards/powerups/${powerupId}/use`, payload);
  return data;
}
