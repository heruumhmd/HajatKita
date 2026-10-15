import { z } from "zod";

export const rsvpSchema = z.object({
  action: z.literal("RSVP"),
  weddingId: z.string().optional(),
  slug: z.string().optional(),
  guest: z.object({
    name: z.string().trim().min(1, "Nama tamu wajib diisi").max(100, "Nama maksimal 100 karakter"),
    phone: z.string().max(30, "Nomor telepon maksimal 30 karakter").optional().default("-"),
    notes: z.string().max(500, "Catatan maksimal 500 karakter").optional().default(""),
    pax: z.number().int("Jumlah pax harus bilangan bulat").min(0, "Pax minimal 0").max(20, "Pax maksimal 20").optional().default(2),
    side: z.enum(["GROOM", "BRIDE", "BOTH"], { errorMap: () => ({ message: "Pihak pengundang harus GROOM, BRIDE, atau BOTH" }) }).optional().default("BOTH"),
    rsvpStatus: z.enum(["CONFIRMED_ATTENDING", "DECLINED"], { errorMap: () => ({ message: "Status RSVP harus CONFIRMED_ATTENDING atau DECLINED" }) }).optional().default("CONFIRMED_ATTENDING"),
  }),
});

export const claimGiftSchema = z.object({
  action: z.literal("CLAIM_GIFT"),
  weddingId: z.string().optional(),
  slug: z.string().optional(),
  itemId: z.string().min(1, "ID kado wajib diisi"),
  friendName: z.string().trim().min(1, "Nama pemberi kado wajib diisi").max(100, "Nama maksimal 100 karakter"),
});

export type RsvpInput = z.infer<typeof rsvpSchema>;
export type ClaimGiftInput = z.infer<typeof claimGiftSchema>;
