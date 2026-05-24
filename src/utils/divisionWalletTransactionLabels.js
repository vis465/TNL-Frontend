/** Plain-language labels for DivisionWalletTransaction.source.kind */
export const DIVISION_WALLET_KIND_OPTIONS = [
  { value: '', label: 'All types' },
  { value: 'job_tax', label: 'Job tax (credit)' },
  { value: 'adjustment', label: 'Adjustment / attendance bonus' },
  { value: 'distribute', label: 'Paid to member' },
  { value: 'split', label: 'Split payout' },
  { value: 'refund', label: 'Refund' },
  { value: 'truck_purchase', label: 'Truck purchase' },
  { value: 'truck_maintenance', label: 'Truck maintenance' },
  { value: 'truck_sale', label: 'Truck sale' },
  { value: 'fuel_purchase', label: 'Fuel purchase' },
  { value: 'division_investment', label: 'Member investment' },
  { value: 'bank_credit', label: 'Bank → division' },
  { value: 'bank_debit', label: 'Division → bank' },
  { value: 'division_loan_disbursal', label: 'Loan disbursal' },
  { value: 'division_emi_deduction', label: 'Loan EMI deduction' },
  { value: 'rto_fine', label: 'RTO fine settlement' },
];

const KIND_LABELS = Object.fromEntries(
  DIVISION_WALLET_KIND_OPTIONS.filter((o) => o.value).map((o) => [o.value, o.label])
);

export function labelDivisionWalletKind(kind) {
  if (!kind) return 'Other';
  return KIND_LABELS[kind] || kind.replace(/_/g, ' ');
}

export function formatDivisionWalletRow(tx) {
  const kind = tx?.source?.kind || '';
  const type = tx?.type === 'credit' ? 'In' : 'Out';
  return {
    kindLabel: labelDivisionWalletKind(kind),
    typeLabel: type,
    signedAmount: tx?.type === 'credit' ? Number(tx.amount) : -Number(tx.amount),
  };
}
