import "dotenv/config";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import donationsRouter from "./routes/donations";
import notificationsRouter from "./routes/notifications";

export function createServer() {
  const app = express();

  // Security Middleware
  app.use(
    helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'", "*"],
          imgSrc: [
            "'self'",
            "data:",
            "blob:",
            "https://*.openstreetmap.org",
            "https://*.tile.openstreetmap.org",
            "https://*.basemaps.cartocdn.com",
            "https://server.arcgisonline.com",
            "https://*.arcgisonline.com",
            "https://*.supabase.co",
            "https://images.unsplash.com",
            "*"
          ],
          scriptSrc: [
            "'self'",
            "'unsafe-inline'",
            "'unsafe-eval'",
            "https://checkout.razorpay.com",
            "https://unpkg.com"
          ],
          connectSrc: [
            "'self'",
            "*",
            "https://*.supabase.co",
            "https://api.razorpay.com",
            "https://*.tile.openstreetmap.org",
            "https://*.basemaps.cartocdn.com"
          ],
          frameSrc: ["'self'", "https://api.razorpay.com"],
          styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com", "https://unpkg.com"],
          fontSrc: ["'self'", "https://fonts.gstatic.com", "data:"]
        }
      },
      crossOriginEmbedderPolicy: false,
      referrerPolicy: { policy: "origin-when-cross-origin" }
    })
  );
  app.use(cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true
  }));
  app.use(express.json({ limit: '1mb' }));
  app.use(express.urlencoded({ extended: true, limit: '1mb' }));

  // Rate Limiting
  const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    standardHeaders: true,
    legacyHeaders: false,
    message: 'Too many requests from this IP, please try again after 15 minutes'
  });
  
  app.use("/api/", limiter);

  // API routes
  app.get("/api/ping", (_req, res) => {
    res.json({ message: process.env.PING_MESSAGE ?? "pong" });
  });

  app.use("/api/donations", donationsRouter);
  app.use("/api/notifications", notificationsRouter);

  return app;
}
