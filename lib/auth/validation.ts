import { z } from "zod";

// Email validation schema
export const emailSchema = z.string().email("Please enter a valid email address");

// Password validation schema
export const passwordSchema = z
  .string()
  .min(8, "Password must be at least 8 characters")
  .regex(/[a-z]/, "Password must contain at least one lowercase letter")
  .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
  .regex(/[0-9]/, "Password must contain at least one number")
  .regex(/[^a-zA-Z0-9]/, "Password must contain at least one special character");

// Login form validation
export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, "Password is required"),
  rememberMe: z.boolean().optional(),
});

// Registration form validation
export const registerSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: emailSchema,
  password: passwordSchema,
  confirmPassword: z.string(),
  role: z.enum(["developer", "gamer"]),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

// Developer profile validation
export const developerProfileSchema = z.object({
  developerType: z.enum(["INDIE", "STUDIO"], {
    required_error: "Please select your developer type",
  }),
  teamSize: z.number()
    .int("Team size must be a whole number")
    .min(0, "Team size cannot be negative")
    .max(500, "Team size cannot exceed 500"),
  hasPublisher: z.boolean({
    required_error: "Please indicate if you have a publisher",
  }),
  ownsIP: z.boolean({
    required_error: "Please indicate if you own your IP",
  }),
  fundingSources: z.array(z.enum(["SELF", "CROWDFUND", "ANGEL", "VC", "MAJOR_PUBLISHER"]))
    .min(1, "Please select at least one funding source"),
  companyType: z.enum(["NONE", "SOLE_PROP", "LLC", "CORP"], {
    required_error: "Please select your company type",
  }),
  evidenceLinks: z.array(z.string().url("Please enter valid URLs"))
    .min(1, "Please provide at least one evidence link")
    .max(5, "Maximum 5 evidence links allowed"),
  attestIndie: z.boolean()
    .refine((val) => val === true, {
      message: "You must attest to meet the indie criteria to continue",
    }),
});

// Combined registration with developer profile
export const developerRegistrationSchema = registerSchema.extend({
  developerProfile: developerProfileSchema.optional(),
});

// Password reset request validation
export const resetRequestSchema = z.object({
  email: emailSchema,
});

// Password reset validation
export const resetPasswordSchema = z.object({
  token: z.string().min(1, "Reset token is required"),
  password: passwordSchema,
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

// Password strength calculator
export interface PasswordStrength {
  score: number; // 0-4
  label: "weak" | "fair" | "good" | "strong";
  feedback: string[];
}

export function calculatePasswordStrength(password: string): PasswordStrength {
  let score = 0;
  const feedback: string[] = [];

  if (!password) {
    return { score: 0, label: "weak", feedback: ["Password is required"] };
  }

  // Length check
  if (password.length >= 8) score++;
  else feedback.push("At least 8 characters");

  if (password.length >= 12) score++;

  // Character variety checks
  if (/[a-z]/.test(password)) score++;
  else feedback.push("Add lowercase letters");

  if (/[A-Z]/.test(password)) score++;
  else feedback.push("Add uppercase letters");

  if (/[0-9]/.test(password)) score++;
  else feedback.push("Add numbers");

  if (/[^a-zA-Z0-9]/.test(password)) score++;
  else feedback.push("Add special characters");

  // Common patterns penalty
  const commonPatterns = [
    /123456/, /password/i, /qwerty/i, /abc123/i, /letmein/i,
    /111111/, /admin/i, /welcome/i, /monkey/i, /dragon/i
  ];
  
  const hasCommonPattern = commonPatterns.some(pattern => pattern.test(password));
  if (hasCommonPattern) {
    score = Math.max(0, score - 2);
    feedback.push("Avoid common patterns");
  }

  // Normalize score to 0-4
  score = Math.min(4, Math.max(0, Math.floor(score / 1.5)));

  let label: "weak" | "fair" | "good" | "strong";
  if (score <= 1) label = "weak";
  else if (score === 2) label = "fair";
  else if (score === 3) label = "good";
  else label = "strong";

  return { score, label, feedback };
}

