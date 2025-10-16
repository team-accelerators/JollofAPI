//@ts-nocheck
import { Request, Response } from "express";
import CommunityPost from "../models/communityPost";

// Create post
export const createPost = async (req: Request, res: Response) => {
  try {
    const post = await CommunityPost.create({
      userId: req.user._id,
      ...req.body,
    });
    res.status(201).json(post);
  } catch (err) {
    res.status(500).json({ error: "Failed to create post" });
  }
};

// Get all posts
export const getPosts = async (req: Request, res: Response) => {
  const posts = await CommunityPost.find()
    .populate("userId", "name")
    .sort({ createdAt: -1 });
  res.json(posts);
};

// Like or Unlike a post
export const toggleLike = async (req: Request, res: Response) => {
  const post = await CommunityPost.findById(req.params.id);
  if (!post) return res.status(404).json({ error: "Post not found" });

  const hasLiked = post.likes.includes(req.user._id);
  if (hasLiked) {
    post.likes.pull(req.user._id);
  } else {
    post.likes.push(req.user._id);
  }
  await post.save();

  res.json({ message: hasLiked ? "Unliked" : "Liked", likes: post.likes.length });
};
