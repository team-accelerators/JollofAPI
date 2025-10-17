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

