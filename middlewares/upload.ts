import { v2 as cloudinary } from "cloudinary";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import multer from "multer";

// 🔐 Cloudinary Config
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME!,
  api_key: process.env.CLOUDINARY_API_KEY!,
  api_secret: process.env.CLOUDINARY_API_SECRET!,
});

// 🧠 Dynamic folder selector — supports 'recipes' and 'pantry' uploads
const storage = new CloudinaryStorage({
  cloudinary,
  params: async (req, file) => {
    // Determine upload type from route path or query
    let folder = "uploads";
    if (req.baseUrl.includes("recipe")) folder = "recipes";
    if (req.baseUrl.includes("pantry")) folder = "pantry";

    return {
      folder,
      allowed_formats: ["jpg", "jpeg", "png", "webp"],
      public_id: `${Date.now()}-${file.originalname.split(".")[0]}`,
      transformation: [{ quality: "auto", fetch_format: "auto" }],
    };
  },
});

// 🚀 Initialize Multer
export const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB
  },
  fileFilter: (req, file, cb) => {
    const allowed = ["image/jpeg", "image/png", "image/jpg", "image/webp"];
    if (allowed.includes(file.mimetype)) cb(null, true);
    else cb(new Error("Invalid file type. Only images are allowed."));
  },
});
