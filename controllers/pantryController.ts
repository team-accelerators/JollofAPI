import { Request, Response } from "express";
import PantryItem from "../models/pantry";
import { visionAi } from "../utils/visionAI";

/**
 * @desc Upload pantry image, detect items using AI, and save to DB
 * @route POST /api/pantry/upload
 * @access Private (user must be authenticated)
 */
export const uploadPantryImage = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?._id;
    const imageUrl = (req.file as any)?.path;

    if (!imageUrl) {
      return res.status(400).json({ error: "No image uploaded" });
    }

    // Use AI to recognize items in the image
    const detectedItems = await visionAi(imageUrl);

    if (!detectedItems.length) {
      return res.status(200).json({
        message: "No recognizable pantry items found.",
        data: [],
      });
    }

    // Save detected items to database
    const savedItems = await PantryItem.insertMany(
      detectedItems.map((item) => ({
        name: item.name,
        category: item.category,
        expiryDate: item.expiryDate,
        imageUrl,
        user: userId,
      }))
    );

    res.status(201).json({
      message: "Pantry items detected and saved successfully.",
      count: savedItems.length,
      data: savedItems,
    });
  } catch (error: any) {
    console.error("Error uploading pantry image:", error);
    res.status(500).json({
      error: "Failed to process pantry image.",
      details: error.message,
    });
  }
};

/**
 * @desc Get all pantry items for a user
 * @route GET /api/pantry
 * @access Private
 */
export const getUserPantry = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?._id;
    const items = await PantryItem.find({ user: userId }).sort({ expiryDate: 1 });

    res.status(200).json({
      success: true,
      count: items.length,
      data: items,
    });
  } catch (error: any) {
    console.error("Error fetching pantry items:", error);
    res.status(500).json({ error: "Failed to fetch pantry items" });
  }
};

/**
 * @desc Delete a pantry item
 * @route DELETE /api/pantry/:id
 * @access Private
 */
export const deletePantryItem = async (req: Request, res: Response) => {
  try {
    const item = await PantryItem.findByIdAndDelete(req.params.id);

    if (!item) {
      return res.status(404).json({ error: "Pantry item not found" });
    }

    res.status(200).json({ message: "Pantry item deleted successfully" });
  } catch (error: any) {
    console.error("Error deleting pantry item:", error);
    res.status(500).json({ error: "Failed to delete pantry item" });
  }
};
