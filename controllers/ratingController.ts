//@ts-nocheck
import { Request, Response } from "express";
import Rating from "../models/rating";

export const rateItem = async (req: Request, res: Response) => {
  try {
    const { targetId, targetType, rating, review } = req.body;
    const existing = await Rating.findOne({ userId: req.user._id, targetId, targetType });

    if (existing) {
      existing.rating = rating;
      existing.review = review;
      await existing.save();
      return res.json({ message: "Rating updated", rating: existing });
    }

    const newRating = await Rating.create({
      userId: req.user._id,
      targetId,
      targetType,
      rating,
      review,
    });

    res.status(201).json(newRating);
  } catch (error) {
    res.status(500).json({ error: "Error saving rating" });
  }
};

export const getAverageRating = async (req: Request, res: Response) => {
  const { targetId, targetType } = req.params;
  const ratings = await Rating.find({ targetId, targetType });
  const avg =
    ratings.reduce((acc, r) => acc + r.rating, 0) / (ratings.length || 1);
  res.json({ average: avg, count: ratings.length });
};
