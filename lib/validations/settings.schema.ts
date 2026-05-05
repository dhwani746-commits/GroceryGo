import { z } from 'zod';

/** Admin profile fields editable from Settings (omit `phone` to leave unchanged) */
export const AdminProfileSchema = z
  .object({
    full_name: z.string().min(1, 'Name is required').max(120),
    phone: z.union([z.string(), z.null()]).optional(),
  })
  .transform((data) => ({
    full_name: data.full_name.trim(),
    phone:
      data.phone === undefined
        ? undefined
        : data.phone === null
          ? null
          : String(data.phone).trim() === ''
            ? null
            : String(data.phone).trim(),
  }))
  .superRefine((data, ctx) => {
    if (data.phone === undefined || data.phone === null) return;
    if (!/^\d{10}$/.test(data.phone)) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Phone must be exactly 10 digits', path: ['phone'] });
    }
  });

export type AdminProfileInput = z.infer<typeof AdminProfileSchema>;

/** Change password — re-authenticates with current password server-side */
export const ChangePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, 'Current password is required'),
    newPassword: z.string().min(8, 'New password must be at least 8 characters').max(128),
    confirmPassword: z.string().min(1, 'Confirm password is required'),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

export type ChangePasswordInput = z.infer<typeof ChangePasswordSchema>;

const optionalNonEmptyString = z
  .union([z.string(), z.null(), z.undefined()])
  .transform((v) => {
    if (v === undefined || v === null) return null;
    const t = String(v).trim();
    return t === '' ? null : t;
  });

const gstLoose = optionalNonEmptyString.refine(
  (v) => v === null || /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/i.test(v),
  { message: 'Invalid GST number format' },
);

const logoUrlSchema = optionalNonEmptyString.refine(
  (v) => v === null || /^https:\/\/.+/i.test(v),
  { message: 'Logo URL must be a valid https URL' },
);

const pincodeSchema = optionalNonEmptyString.refine(
  (v) => v === null || /^\d{6}$/.test(v),
  { message: 'Pincode must be 6 digits' },
);

const emailSchema = optionalNonEmptyString.refine(
  (v) => v === null || z.string().email().safeParse(v).success,
  { message: 'Invalid email address' },
);

const phoneSchema = optionalNonEmptyString.refine(
  (v) => v === null || /^\d{10}$/.test(v),
  { message: 'Support phone must be 10 digits' },
);

/** Partial patch for store settings — all fields optional; at least one required at route layer */
export const StoreSettingsPatchSchema = z.object({
  store_name: z.string().min(1).max(200).optional(),
  support_email: emailSchema.optional(),
  support_phone: phoneSchema.optional(),
  address_line1: optionalNonEmptyString.optional(),
  address_line2: optionalNonEmptyString.optional(),
  city: optionalNonEmptyString.optional(),
  state: optionalNonEmptyString.optional(),
  pincode: pincodeSchema.optional(),
  gst_number: gstLoose.optional(),
  logo_url: logoUrlSchema.optional(),
});

export type StoreSettingsPatchInput = z.infer<typeof StoreSettingsPatchSchema>;
