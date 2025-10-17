# 🍲 JollofAI Backend

**JollofAI** is an intelligent cooking companion that blends **AI recipe recommendations**, **community engagement**, and **personalized nutrition** — tailored for the modern African kitchen 🇳🇬.  
This backend powers all API endpoints, authentication, gamification, and real-time cook-along sessions.

---

## 🚀 Features

### 👤 Authentication & Users
- Email/password + Google OAuth login  
- JWT-based authentication  
- User profiles with dietary preferences, cooking habits & cultural background  

### 🧠 AI-Powered Recipe Recommendations
- Personalized "For You" feed using OpenAI embeddings  
- Smart search & filtering (diet, culture, skill level)  

### 🧑🏾‍🍳 Cook-Along (Live)
- WebSocket-powered **live cook-along chat + timer**  
- Users can join cooking sessions and message in real time  

### 🍱 Meal Planning
- AI-generated weekly meal plans  
- Smart substitutions for allergies and budget  

### 🌍 Community
- Share recipes, like, comment, and discuss  
- Social-style interaction among food lovers  

### 🥕 Nutrition
- Ingredient-based nutrition breakdown  
- Calorie and macro tracking  

### 🏅 Gamification (New!)
- Cooking streaks tracking  
- Achievement badges (`"Budget Chef"`, `"Zero-Waste Pro"`, etc.)  
- Weekly cooking challenges (e.g., *“5 Meals Under ₦2000”*)  

---

## 🧩 Tech Stack

| Category | Tech |
|-----------|------|
| **Runtime** | Node.js (TypeScript) |
| **Framework** | Express.js |
| **Database** | MongoDB + Mongoose |
| **Auth** | JWT + Google OAuth2 |
| **AI Integration** | OpenAI Embeddings |
| **Real-Time** | Socket.io |
| **Cache/Scaling (optional)** | Redis |
| **Docs** | Swagger (OpenAPI 3.0) |

---

## 🗂️ Folder Structure

backend/
├── controllers/
│ ├── authController.ts
│ ├── userController.ts
│ ├── mealPlanController.ts
│ ├── communityController.ts
│ ├── cookAlongController.ts
│ ├── nutritionController.ts
│ └── gamificationController.ts
│
├── models/
│ ├── user.ts
│ ├── userPreference.ts
│ ├── recipe.ts
│ ├── communityPost.ts
│ ├── mealPlan.ts
│ └── gamification/
│ ├── streak.ts
│ ├── badge.ts
│ └── challenge.ts
│
├── routes/
│ ├── authRoutes.ts
│ ├── userRoutes.ts
│ ├── mealPlanRoutes.ts
│ ├── communityRoutes.ts
│ ├── cookAlongRoutes.ts
│ ├── nutritionRoutes.ts
│ └── gamificationRoutes.ts
│
├── middleware/
│ └── authMiddleware.ts
│
├── utils/
│ ├── sendEmail.ts
│ └── embedding.ts
│
├── config/
│ └── db.ts
│
├── swagger.json
├── app.ts
└── server.ts


---

## ⚙️ Environment Variables

Create a `.env` file in your project root:

```bash
PORT=5000
MONGO_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/yourdb
JWT_SECRET=<your_jwt_secret>
JWT_EXPIRES=7d
OPENAI_API_KEY=<your_openai_key>
GOOGLE_CLIENT_ID=<google_client_id>
GOOGLE_CLIENT_SECRET=<google_client_secret>
REDIS_URL=<optional_for_scaling>
FRONTEND_URL=http://localhost:3000

```

# 1️⃣ Clone the repo
git clone https://github.com/<your-org>/jollofai-backend.git
cd jollofai-backend

# 2️⃣ Install dependencies
npm install

# 3️⃣ Run development server
npm run dev

# 4️⃣ For production
npm run build
npm start

🧪 API Documentation

Swagger UI is available at:

It includes:

/api/auth → Login, Register, Google Auth

/api/users → Profile management

/api/mealplans → AI meal planner

/api/community → Posts, likes, comments

/api/cookalong → Live cooking chat

/api/nutrition → Nutrition facts

/api/gamification → Streaks, badges, challenges


🧡 Credits

Built with love by the JollofAI Team — inspiring creativity and connection through food.
🍛 “Cook smarter, not harder.”

📜 License

This project is licensed under the MIT License.

MIT © 2025 JollofAI
