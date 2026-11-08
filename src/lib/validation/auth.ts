import { z } from "zod";

export const credentialsSchema = z.object({
  email: z.string().trim().toLowerCase().pipe(z.email("Enter a valid e-mail.").max(254)),
  password: z.string().min(8, "Use at least 8 characters.").max(200),
});

export const registerSchema = credentialsSchema.extend({
  name: z.string().trim().min(1).max(60).optional(),
});
