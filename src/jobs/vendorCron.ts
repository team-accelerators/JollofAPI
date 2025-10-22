import cron from "node-cron";
import {
  syncFromGoogle,
  syncFromFoursquare,
  syncFromHere,
  syncFromOSM,
} from "../../services/vendorService";
import SyncLog from "../../models/syncLog";

const DEFAULT_LAT = 6.5244;
const DEFAULT_LNG = 3.3792;

// Helper to log each sync attempt to MongoDB
async function logSync(source: string, lat: number, lng: number, count: number, success: boolean, message?: string) {
  try {
    await SyncLog.create({
      source,
      lat,
      lng,
      count,
      success,
      message: message || null,
    });
  } catch (err) {
    console.error(`❌ Failed to record sync log for ${source}:`, err);
  }
}

// Run monthly: 1st day of each month at 2 AM
cron.schedule("0 2 1 * *", async () => {
  console.log("🌍 Running monthly vendor data refresh...");

  const sources = [
    { name: "google", fn: syncFromGoogle },
    { name: "foursquare", fn: syncFromFoursquare },
    { name: "here", fn: syncFromHere },
    { name: "osm", fn: syncFromOSM },
  ];

  for (const { name, fn } of sources) {
    try {
      console.log(`🔄 Syncing vendors from ${name.toUpperCase()}...`);
      const result = await fn(DEFAULT_LAT, DEFAULT_LNG);
      const count = result?.count || 0;
      console.log(`✅ ${name.toUpperCase()} sync completed (${count} vendors updated).`);

      await logSync(name, DEFAULT_LAT, DEFAULT_LNG, count, true);
    } catch (err: any) {
      console.error(`⚠️ ${name.toUpperCase()} sync failed:`, err.message);
      await logSync(name, DEFAULT_LAT, DEFAULT_LNG, 0, false, err.message);
      // Continue to next provider even if one fails
    }
  }

  console.log("🎯 Monthly vendor data refresh completed for all providers.");
});
