import express from "express";
import { protect, adminOnly } from "../middlewares/authMiddleware";
import { getUserProfile, updateUserProfile, getAllUsers, getAuthUser } from "../controllers/userProfileController";

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Users
 *   description: User account and profile management
 */

/**
 * @swagger
 * /users/profile:
 *   get:
 *     summary: Get the logged-in user's profile
 *     description: Returns the authenticated user's profile along with preferences and related data.
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Successfully retrieved user profile.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 user:
 *                   $ref: '#/components/schemas/User'
 *                 preferences:
 *                   $ref: '#/components/schemas/UserPreference'
 *       401:
 *         description: Unauthorized — missing or invalid token.
 */
router.get("/profile", protect, getUserProfile);

/**
 * @swagger
 * /users/profile:
 *   put:
 *     summary: Update user profile and preferences
 *     description: Allows the logged-in user to update profile details and preferences.
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               avatar:
 *                 type: string
 *               preferences:
 *                 $ref: '#/components/schemas/UserPreference'
 *     responses:
 *       200:
 *         description: User profile successfully updated.
 *       400:
 *         description: Invalid request data.
 *       401:
 *         description: Unauthorized.
 */
router.put("/profile", protect, updateUserProfile);
/**
 * @swagger
 * /users:
 *   get:
 *     summary: Get authenticated user 
 *     description:  view loggedin  registered users.
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of all users.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/User'
 *       403:
 *         description: Forbidden — Admin access required.
 */
router.get("/me", protect, getAuthUser);



/**
 * @swagger
 * /users:
 *   get:
 *     summary: Get all users (admin only)
 *     description: Admin can view a list of all registered users.
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of all users.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/User'
 *       403:
 *         description: Forbidden — Admin access required.
 */
router.get("/all", protect, adminOnly, getAllUsers);



export default router;
