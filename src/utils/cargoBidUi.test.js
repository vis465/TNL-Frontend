import {
  formatNextMinBid,
  bidStatusChipColor,
  canPlaceBid,
  isAwardConsumable,
} from './cargoBidUi';

describe('formatNextMinBid', () => {
  it('uses floor when no high bid', () => {
    expect(formatNextMinBid(0, 10, 25)).toBe(25);
  });

  it('adds increment to high bid', () => {
    expect(formatNextMinBid(100, 10, 1)).toBe(110);
  });
});

describe('canPlaceBid', () => {
  it('only allows bidding phase', () => {
    expect(canPlaceBid('bidding')).toBe(true);
    expect(canPlaceBid('preview')).toBe(false);
  });
});

describe('bidStatusChipColor', () => {
  it('maps active and won', () => {
    expect(bidStatusChipColor('active')).toBe('primary');
    expect(bidStatusChipColor('won')).toBe('success');
  });
});

describe('isAwardConsumable', () => {
  it('true for active with no deliveries', () => {
    expect(isAwardConsumable({ status: 'active', deliveriesUsed: 0 })).toBe(true);
  });

  it('false when fulfilled', () => {
    expect(isAwardConsumable({ status: 'fulfilled', deliveriesUsed: 1 })).toBe(false);
  });
});
