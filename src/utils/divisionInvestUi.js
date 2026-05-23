/**
 * Whether the My Division UI should allow wallet investment (mirrors server rules at a high level).
 */
export function canShowDivisionInvest({ isLeader, divisionId, riderId, isInactiveMember }) {
  return Boolean(isLeader || (divisionId && riderId && !isInactiveMember));
}
