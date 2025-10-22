import { Request, Response } from "express";
import Vendor from "../models/vendors";
import { syncVendors } from "../services/vendorService";


export const syncVendor = async (req: Request, res: Response) => {
  const { lat, lng } = req.query;
  if (!lat || !lng)
    return res.status(400).json({ error: "Missing lat/lng parameters" });

  try {
    const result = await syncVendors(Number(lat), Number(lng));
    res.json({
      success: true,
      source: result.source,
      count: result.count,
    });
  } catch (error) {
    res.status(500).json({
      error: "All sources failed",
      message: (error as any).message,
    });
  }
}

export const getNearbyVendors = async (req: Request, res: Response) => {
  try {
    const { lat, lng, radius = 5000 } = req.query;

    if (!lat || !lng)
      return res.status(400).json({ message: "Latitude and longitude required" });

    const vendors = await Vendor.find({
      location: {
        $geoWithin: {
          $centerSphere: [
            [parseFloat(lng as string), parseFloat(lat as string)],
            Number(radius) / 6371000,
          ],
        },
      },
    }).limit(50);

    res.status(200).json(vendors);
  } catch (err: any) {
    res.status(500).json({ message: "Error fetching nearby vendors", error: err.message });
  }
};

export const getVendorById = async (req: Request, res: Response) => {
  try {
    const vendor = await Vendor.findById(req.params.id);
    if (!vendor) return res.status(404).json({ message: "Vendor not found" });
    res.status(200).json(vendor);
  } catch (err: any) {
    res.status(500).json({ message: "Error fetching vendor", error: err.message });
  }
};
