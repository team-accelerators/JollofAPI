import express from "express";
import { syncVendors, getNearbyVendors, getVendorById } from "../controllers/vendorControllers";

const router = express.Router();

router.post("/sync", syncVendors);
router.get("/nearby", getNearbyVendors);
router.get("/:id", getVendorById);

export default router;
