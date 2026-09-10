import { z } from "zod";
import mongoose from "mongoose";

// --- Custom Reusable Schemas ---

const objectIdSchema = z.string().refine((val) => mongoose.Types.ObjectId.isValid(val), {
  message: "Invalid resource ID",
});

const usernameRegex = /^[a-zA-Z0-9_-]{3,30}$/;

// --- Auth Schemas ---

export const registerSchema = z.object({
  body: z.object({
    username: z
      .string({ required_error: "Username is required" })
      .trim()
      .regex(usernameRegex, "Username must be 3-30 characters and can only contain letters, numbers, _ and -"),
    password: z
      .string({ required_error: "Password is required" })
      .min(6, "Password must be at least 6 characters"),
  }),
});

export const loginSchema = z.object({
  body: z.object({
    username: z.string({ required_error: "Username is required" }).trim().min(1, "Username is required"),
    password: z.string({ required_error: "Password is required" }).min(1, "Password is required"),
  }),
});

export const exchangeOAuthCodeSchema = z.object({
  body: z.object({
    code: z.string({ required_error: "Code is required" }).min(1, "Code is required"),
  }),
});

// --- Resume Schemas ---

export const createResumeSchema = z.object({
  body: z.object({
    title: z.string().trim().min(1, "Title is required").max(100, "Title is too long"),
    slug: z.string({ required_error: "slug is required" }).trim().min(1, "slug is required").regex(/^[a-zA-Z0-9-]+$/, "Slug can only contain letters, numbers, and dashes"),
  }).strict(), // Prevent unexpected fields like userId, currentVersionId
});

export const updateResumeTitleSchema = z.object({
  params: z.object({
    resumeId: objectIdSchema,
  }),
  body: z.object({
    title: z.string().trim().min(1, "Title is required").max(100, "Title is too long"),
  }).strict(),
});

export const resumeIdParamSchema = z.object({
  params: z.object({
    resumeId: objectIdSchema,
  }),
});

export const versionIdParamSchema = z.object({
  params: z.object({
    resumeId: objectIdSchema,
    versionId: objectIdSchema,
  }),
});

export const getPublicResumeMetaSchema = z.object({
  params: z.object({
    username: z.string().min(1),
    slug: z.string().min(1),
  }),
});

export const getPublicDefaultResumeMetaSchema = z.object({
  params: z.object({
    username: z.string().min(1),
  }),
});
