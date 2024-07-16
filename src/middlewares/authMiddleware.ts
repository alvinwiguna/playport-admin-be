import { Request, Response, NextFunction } from "express";
import jwt, { Secret, JwtPayload } from "jsonwebtoken";
import dotenv from "dotenv";
import { MyRequest } from "../types/requestTypes";

dotenv.config();

const secretKey: Secret = process.env.JWT_SECRET as string;

export const authMiddleware = (
  req: MyRequest,
  res: Response,
  next: NextFunction
) => {
  // Retrieve authorization header
  const authHeader = req.headers.authorization;

  // Check for authorization header and Bearer schema
  if (!authHeader?.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const token = authHeader.split(" ")[1];

  // Verify the JWT token
  try {
    const decoded: string | JwtPayload = jwt.verify(token, secretKey);
    if (typeof decoded === "string") {
      return res.status(401).json({ message: "Invalid token" });
    }

    req.user = {
      user_panel_id: parseInt(decoded.user_panel_id),
      user_id: parseInt(decoded.user_id),
    };
    next();
  } catch (error) {
    return res.status(401).json({ message: "Invalid token" });
  }
};
