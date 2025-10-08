import cron from "node-cron";
import { syncVendorsFromGoogle } from "../../services/vendorService";

const DEFAULT_LAT = 6.5244;
const DEFAULT_LNG = 3.3792;

// Run monthly: 1st day at 2 AM
cron.schedule("0 2 1 * *", async () => {
  console.log("🌍 Running monthly vendor data refresh...");
  await syncVendorsFromGoogle(DEFAULT_LAT, DEFAULT_LNG);
});
