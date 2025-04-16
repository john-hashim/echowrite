// src/types/auth.types.ts
import { Request } from 'express';

// Define a User interface that matches your Prisma schema
export interface User {
  id: string;
  email: string;
  name?: string | null;
  password: string;
  role: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface AuthRequest extends Request {
  user?: User;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  name?: string;
}

export interface TokenPayload {
  userId: string;
  email: string;
}