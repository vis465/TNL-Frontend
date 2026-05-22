const DIVISION_FUEL_CAPACITY_L = 20_000;

/**
 * Fleet wear, maintenance, and fuel runway estimates for division leaders.
 */
export function computeDivisionLeaderInsights({ division, fleetTrucks = [] }) {
  const premiumFuel = Math.max(0, Number(division?.fuelTankPremiumLiters) || 0);
  const standardFuel = Math.max(0, Number(division?.fuelTankNormalLiters ?? division?.fuelTankLiters) || 0);
  const totalFuel = premiumFuel + standardFuel;
  const totalFuelBurned = Math.max(0, Number(division?.stats?.totalFuelBurned) || 0);
  const totalJobs = Math.max(0, Number(division?.stats?.totalJobs) || 0);
  const avgFuelPerJob = totalJobs > 0 ? totalFuelBurned / totalJobs : 0;

  const createdAt = division?.createdAt ? new Date(division.createdAt) : null;
  const daysSinceCreated = createdAt && !Number.isNaN(createdAt.getTime())
    ? Math.max(1, Math.floor((Date.now() - createdAt.getTime()) / 86400000))
    : 30;
  const avgJobsPerDay = totalJobs / daysSinceCreated;
  const avgDailyFuelBurn = avgFuelPerJob * avgJobsPerDay;
  const runwayDays =
    totalFuel > 0 && avgDailyFuelBurn > 0 ? Math.floor(totalFuel / avgDailyFuelBurn) : null;

  const wearAlerts = [];
  const maintenanceDue = [];

  for (const t of fleetTrucks) {
    const threshold = Math.max(1, Number(t.wearThresholdKm) || 1);
    const wearPct = Math.round((Number(t.wearKm || 0) / threshold) * 100);
    const label = [t.brandName, t.modelName].filter(Boolean).join(' ') || t.truckItemId || 'Truck';

    if (t.blocked) {
      const secs = Number(t.repairSecondsRemaining) || 0;
      maintenanceDue.push({
        id: String(t._id || t.divisionTruckId),
        label,
        maintenanceCost: Number(t.maintenanceCost) || 0,
        repairSecondsRemaining: secs,
        inGarage: secs > 0,
      });
    } else if (wearPct >= 70) {
      wearAlerts.push({ id: String(t._id), label, wearPct, odometerKm: Number(t.odometerKm) || 0 });
    }
  }

  return {
    totalFuel,
    capacityPct: Math.round((totalFuel / DIVISION_FUEL_CAPACITY_L) * 100),
    avgDailyFuelBurn: Math.round(avgDailyFuelBurn * 10) / 10,
    runwayDays,
    wearAlerts,
    maintenanceDue,
    blockedCount: maintenanceDue.length,
    wearHighCount: wearAlerts.length,
  };
}
