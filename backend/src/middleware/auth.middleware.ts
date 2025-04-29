// src/middleware/auth.middleware.ts
import { Request, Response, NextFunction } from "express";
import { prisma } from "../prisma/client";

// Extend Express Request type
declare global {
  namespace Express {
    interface Request {
      user?: any;
      session?: any;
    }
  }
}

/**
 * Middleware to authenticate user based on session token
 */
export const authenticateToken = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<any> => {
  try {
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1];

    if (!token) {
      return res.status(401).json({ message: "Authentication required" });
    }

    // Find the session
    const session = await prisma.session.findUnique({
      where: { token },
      include: { user: true },
    });

    // Check if session exists and is not expired
    if (!session || new Date() > session.expiresAt) {
      if (session) {
        // Clean up expired session
        await prisma.session.delete({ where: { id: session.id } });
      }
      return res.status(401).json({ message: "Session expired or invalid" });
    }

    // Set user and session in request
    req.user = {
      id: session.user.id,
      email: session.user.email,
      name: session.user.name,
    };
    req.session = session;

    next();
  } catch (error) {
    console.error("Authentication error:", error);
    return res.status(500).json({ message: "Authentication failed" });
  }
};

/**
 * Middleware to check if user exists
 */
export const userExists = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<any> => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ message: "User ID not found in request" });
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Refresh user data
    req.user = {
      id: user.id,
      email: user.email,
      name: user.name,
    };

    next();
  } catch (error) {
    console.error("User exists check error:", error);
    return res.status(500).json({ message: "Failed to verify user" });
  }
};
