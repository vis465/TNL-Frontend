export function formatNextMinBid(high, increment, floor = 1) {
  const h = Number(high) || 0;
  const inc = Number(increment) || 10;
  const f = Math.max(1, Number(floor) || 1);
  if (h < f) return f;
  return h + inc;
}

export function bidStatusChipColor(status) {
  switch (status) {
    case 'active':
      return 'primary';
    case 'won':
      return 'success';
    case 'outbid':
    case 'lost':
      return 'default';
    case 'forfeited':
      return 'error';
    case 'fulfilled':
      return 'success';
    case 'expired':
      return 'warning';
    default:
      return 'default';
  }
}

export function canPlaceBid(phase) {
  return phase === 'bidding';
}

export function isBiddingClosed(phase) {
  return phase === 'closed' || phase === 'fulfillment' || phase === 'ended';
}

export function getSessionPhaseLabel(phase) {
  switch (phase) {
    case 'preview':
      return 'Planning';
    case 'bidding':
      return 'Live bidding';
    case 'closed':
      return 'Bidding closed';
    case 'fulfillment':
      return 'Fulfillment';
    case 'ended':
      return 'Ended';
    default:
      return phase || '—';
  }
}

export function getPhaseDescription(phase) {
  switch (phase) {
    case 'preview':
      return 'Review cargos and typical payouts. Bidding is not open yet — plan which lots you want to target.';
    case 'bidding':
      return 'Place token bids on cargos you want to haul. Highest bids win limited slots; tokens are held in escrow while you lead.';
    case 'closed':
      return 'Bidding has ended. Winners have been selected — check My awards if you bid.';
    case 'fulfillment':
      return 'Winners must deliver the matching cargo in-game once. Your first qualifying job earns the revenue multiplier.';
    case 'ended':
      return 'This auction session has finished.';
    default:
      return '';
  }
}

export function getPhaseColor(phase) {
  switch (phase) {
    case 'preview':
      return 'info';
    case 'bidding':
      return 'success';
    case 'fulfillment':
      return 'warning';
    case 'closed':
      return 'error';
    default:
      return 'default';
  }
}

export function isAwardConsumable(award) {
  return award?.status === 'active' && Number(award?.deliveriesUsed || 0) < 1;
}

export function formatCargoClass(cargoClass) {
  if (!cargoClass) return 'General';
  return String(cargoClass).replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
}

/** Illustrative max payout if reference base applies (actual job revenue varies). */
export function getIllustrativePayoutEur(basePriceEur, revenueMultiplier) {
  const base = Math.max(0, Number(basePriceEur) || 0);
  const mult = Math.max(1, Number(revenueMultiplier) || 1);
  return Math.round(base * mult);
}

export function getMyBidLabel(lot, phase) {
  if (!lot?.myBid) return null;
  const status = lot.myBid.status;
  const amount = lot.myBid.amountTokens;
  if (status === 'active' && canPlaceBid(phase)) {
    return { text: `Your bid: ${amount} tokens`, color: 'primary' };
  }
  if (status === 'outbid') {
    return { text: `Outbid at ${amount}`, color: 'warning' };
  }
  if (status === 'won') {
    return { text: `Won · ${amount} tokens`, color: 'success' };
  }
  return { text: `Bid: ${amount} (${status})`, color: 'default' };
}
