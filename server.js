// import express from "express";
// import dotenv from "dotenv";
// import cors from "cors";
// import connectDB from "./config/db.js";
// import authRoutes from "./routes/authRoutes.js";
// import dashboardRoutes from "./routes/dashboardRoutes.js";
// import cookieParser from "cookie-parser";
// import helmet from "helmet";
// import { loginLimiter } from "./middleware/rateLimiter.js";
// import heroRoutes from "./routes/heroRoutes.js";
// import path from "path";

// // Load environment variables based on NODE_ENV
// const envFile = process.env.NODE_ENV === "production" ? ".env.production" : ".env.development";
// dotenv.config({ path: envFile });
// dotenv.config(); // fallback

// connectDB();

// const app = express();

// const allowedOrigins = process.env.CORS_ORIGIN 
//   ? process.env.CORS_ORIGIN.split(",").map(o => o.trim())
//   : ["http://localhost:3000", "https://eram-next.vercel.app"];

// app.use(
//   cors({
//     origin: (origin, callback) => {
//       if (!origin) return callback(null, true);
//       if (allowedOrigins.indexOf(origin) !== -1 || allowedOrigins.includes("*")) {
//         callback(null, true);
//       } else {
//         callback(new Error(`Origin ${origin} not allowed by CORS`));
//       }
//     },
//     credentials: true,
//   })
// );

// app.use(express.json());
// app.use(cookieParser());
// app.use(helmet());
// app.use("/uploads", express.static(path.join(process.cwd(), "public", "uploads")));
// app.use(helmet({ crossOriginResourcePolicy: { policy: "cross-origin" } }));

// app.use("/api/auth/login", loginLimiter);

// app.use("/api/auth", authRoutes);
// app.use("/api/dashboard", dashboardRoutes);
// app.use("/api/hero", heroRoutes);

// app.get("/", (req, res) => {
//   res.send("ERAM Backend Running 🚀");
// });

// // Global error handler
// app.use((err, req, res, next) => {
//   console.error(err.stack);
//   res.status(err.status || 500).json({
//     success: false,
//     message: err.message || "Internal Server Error",
//   });
// });

// const PORT = process.env.PORT || 5000;

// app.listen(PORT, () => {
//   console.log(`Server running on port ${PORT}`);
// });

import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import connectDB from "./config/db.js";
import authRoutes from "./routes/authRoutes.js";
import dashboardRoutes from "./routes/dashboardRoutes.js";
import cookieParser from "cookie-parser";
import helmet from "helmet";
import { loginLimiter } from "./middleware/rateLimiter.js";
import heroRoutes from "./routes/heroRoutes.js";
import path from "path";

// Load environment variables based on NODE_ENV
const envFile = process.env.NODE_ENV === "production" ? ".env.production" : ".env.development";
dotenv.config({ path: envFile });
dotenv.config(); // fallback

connectDB();

const app = express();

const allowedOrigins = process.env.CORS_ORIGIN 
  ? process.env.CORS_ORIGIN.split(",").map(o => o.trim())
  : ["http://localhost:3000", "https://eram-next.vercel.app"];

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);
      if (allowedOrigins.indexOf(origin) !== -1 || allowedOrigins.includes("*")) {
        callback(null, true);
      } else {
        callback(new Error(`Origin ${origin} not allowed by CORS`));
      }
    },
    credentials: true,
  })
);

app.use(express.json());
app.use(cookieParser());

// Single helmet call — CORP set to cross-origin so /uploads images
// can be loaded by the Next.js frontend on a different domain
app.use(helmet({ crossOriginResourcePolicy: { policy: "cross-origin" } }));

app.use("/uploads", express.static(path.join(process.cwd(), "public", "uploads")));

app.use("/api/auth/login", loginLimiter);

app.use("/api/auth", authRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/hero", heroRoutes);

app.get("/", (req, res) => {
  res.send("ERAM Backend Running 🚀");
});

// Global error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || "Internal Server Error",
  });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});