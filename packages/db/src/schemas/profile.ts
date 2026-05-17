import * as v from 'valibot';

export const UserRoleSchema = v.picklist(['leader', 'operator']);
export type UserRole = v.InferOutput<typeof UserRoleSchema>;

export const ProfileSchema = v.object({
  id: v.pipe(v.string(), v.uuid()),
  username: v.pipe(v.string(), v.minLength(2), v.maxLength(60)),
  display_name: v.pipe(v.string(), v.minLength(2), v.maxLength(80)),
  role: UserRoleSchema,
  avatar_url: v.nullable(v.pipe(v.string(), v.url())),
  created_at: v.pipe(v.string(), v.isoTimestamp()),
  updated_at: v.pipe(v.string(), v.isoTimestamp()),
  deleted_at: v.nullable(v.pipe(v.string(), v.isoTimestamp())),
});
export type Profile = v.InferOutput<typeof ProfileSchema>;

export const UpdateProfileInputSchema = v.object({
  display_name: v.pipe(v.string(), v.minLength(2), v.maxLength(80)),
  avatar_url: v.optional(v.pipe(v.string(), v.url())),
});
export type UpdateProfileInput = v.InferOutput<typeof UpdateProfileInputSchema>;

export const ChangePasswordInputSchema = v.pipe(
  v.object({
    current: v.pipe(v.string(), v.minLength(8, 'A senha atual é obrigatória')),
    next: v.pipe(v.string(), v.minLength(8, 'A nova senha deve ter pelo menos 8 caracteres')),
    confirm: v.string(),
  }),
  v.check((input) => input.next === input.confirm, 'As senhas não coincidem'),
);
export type ChangePasswordInput = v.InferOutput<typeof ChangePasswordInputSchema>;
