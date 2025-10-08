import { Response } from "express";
import jwt, { SignOptions } from "jsonwebtoken";
import { IUser } from "../models/user";

export const createSendToken = (res: Response, user: IUser): string => {
  const payload = { id: user._id, email: user.email, role: user.role };

  const secret = process.env.JWT_SECRET as string;

  const options: SignOptions = {
    expiresIn: (process.env.JWT_EXPIRES_IN as any) || "7d", // 👈 simple cast
  };

  const token = jwt.sign(payload, secret, options);

  res.cookie("jwt", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 1000 * 60 * 60 * 24 * 7,
  });

  return token;
};
