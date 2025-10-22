import express from "express";
import { protect, adminOnly } from "../middlewares/authMiddleware";
import {
  syncVendor,
  getNearbyVendors,
  getVendorById,
} from "../controllers/vendorControllers";

const router = express.Router();

/**
 * @route POST /api/vendors/sync
 * @desc Sync vendor data from external sources or manual input
 * @access Admin Only
 */
router.post("/vendors/sync", protect, adminOnly, syncVendor);

/**
 * @route GET /api/vendors/nearby
 * @desc Get vendors near the user’s current location
 * @query lat {number} Latitude of user
 * @query lng {number} Longitude of user
 * @access Public
 */
router.get("/vendors/nearby", getNearbyVendors);

/**
 * @route GET /api/vendors/:id
 * @desc Get details for a specific vendor by ID
 * @access Public
 */
router.get("/vendors/:id", getVendorById);

export default router;
