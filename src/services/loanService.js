import axiosInstance from '../utils/axios';

export async function getLoanPlans(principal) {
  const { data } = await axiosInstance.get('/loans/plans', { params: { principal } });
  return data;
}

export async function createLoan(payload) {
  const { data } = await axiosInstance.post('/loans', payload);
  return data;
}

export async function getMyLoans() {
  const { data } = await axiosInstance.get('/loans/me');
  return data;
}

export async function getMyLoanInstallments(loanId) {
  const { data } = await axiosInstance.get(`/loans/me/${loanId}/installments`);
  return data;
}

export async function forepayUpcomingEmi(loanId) {
  const { data } = await axiosInstance.post(`/loans/me/${loanId}/forepay`);
  return data;
}

export async function getAdminLoans(params = {}) {
  const { data } = await axiosInstance.get('/loans/admin', { params });
  return data;
}

export async function getAdminInstallments(params = {}) {
  const { data } = await axiosInstance.get('/loans/admin/installments', { params });
  return data;
}

export async function runMonthlyDeductions() {
  const { data } = await axiosInstance.post('/loans/admin/run-deductions');
  return data;
}

export async function getDivisionLoanPlans(principal) {
  const { data } = await axiosInstance.get('/loans/division/plans', { params: { principal } });
  return data;
}

export async function createDivisionLoan(payload) {
  const { data } = await axiosInstance.post('/loans/division', payload);
  return data;
}

export async function getDivisionLoans(divisionId) {
  const { data } = await axiosInstance.get(`/loans/division/${divisionId}`);
  return data;
}

export async function getDivisionLoanInstallments(divisionId, loanId) {
  const { data } = await axiosInstance.get(`/loans/division/${divisionId}/${loanId}/installments`);
  return data;
}
