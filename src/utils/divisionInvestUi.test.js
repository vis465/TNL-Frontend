import { canShowDivisionInvest } from './divisionInvestUi';

describe('canShowDivisionInvest', () => {
  const divisionId = 'div-1';
  const riderId = 'rider-1';

  it('allows division leader', () => {
    expect(
      canShowDivisionInvest({
        isLeader: true,
        divisionId: null,
        riderId: null,
        isInactiveMember: true,
      })
    ).toBe(true);
  });

  it('allows active member with division and rider (no leader-only members list)', () => {
    expect(
      canShowDivisionInvest({
        isLeader: false,
        divisionId,
        riderId,
        isInactiveMember: false,
      })
    ).toBe(true);
  });

  it('blocks when members list is empty but user has no rider context', () => {
    expect(
      canShowDivisionInvest({
        isLeader: false,
        divisionId,
        riderId: '',
        isInactiveMember: false,
      })
    ).toBe(false);
  });

  it('blocks inactive members', () => {
    expect(
      canShowDivisionInvest({
        isLeader: false,
        divisionId,
        riderId,
        isInactiveMember: true,
      })
    ).toBe(false);
  });
});
