'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { valibotResolver } from '@hookform/resolvers/valibot';
import * as v from 'valibot';
import { Button, Input, Label, SurfaceCard, toast } from '@dr/ui';
import { UpdateProfileInputSchema, type UpdateProfileInput } from '@dr/db/schemas/profile';
import { getBrowserClient } from '@dr/db/client/browser';
import type { Profile } from '@dr/db/types';

interface Props {
  profile: Profile | null;
  email: string;
}

export function ProfileForm({ profile, email }: Props) {
  const router = useRouter();
  const [pending, setPending] = React.useState(false);

  const form = useForm<UpdateProfileInput>({
    resolver: valibotResolver(UpdateProfileInputSchema),
    defaultValues: {
      display_name: profile?.display_name ?? '',
      avatar_url: profile?.avatar_url ?? '',
    },
  });

  async function onSubmit(values: UpdateProfileInput) {
    if (!profile) return;
    setPending(true);
    const { error } = await getBrowserClient()
      .from('profiles')
      .update({
        display_name: values.display_name,
        avatar_url: values.avatar_url ?? null,
      })
      .eq('id', profile.id);
    setPending(false);
    if (error) {
      toast.error('Erro ao atualizar perfil', { description: error.message });
      return;
    }
    toast.success('Perfil atualizado');
    router.refresh();
  }

  async function changePassword() {
    const next = prompt('Nova senha (mínimo 8 caracteres):');
    if (!next || next.length < 8) {
      toast.error('Senha curta demais');
      return;
    }
    const { error } = await getBrowserClient().auth.updateUser({ password: next });
    if (error) {
      toast.error('Erro ao atualizar senha', { description: error.message });
      return;
    }
    toast.success('Senha atualizada');
  }

  return (
    <div className="space-y-4">
      <SurfaceCard eyebrow="Informações" title="Dados pessoais">
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="email">Email</Label>
            <Input id="email" value={email} disabled readOnly />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="display_name">Nome de exibição</Label>
            <Input id="display_name" {...form.register('display_name')} />
            {form.formState.errors.display_name ? (
              <p className="text-xs text-[var(--color-status-error)]">
                {form.formState.errors.display_name.message}
              </p>
            ) : null}
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="avatar_url">URL do avatar (opcional)</Label>
            <Input id="avatar_url" type="url" {...form.register('avatar_url')} />
          </div>
          <div className="flex justify-end">
            <Button type="submit" variant="accent" disabled={pending}>
              {pending ? 'Salvando…' : 'Salvar alterações'}
            </Button>
          </div>
        </form>
      </SurfaceCard>

      <SurfaceCard eyebrow="Segurança" title="Senha">
        <p className="mb-3 text-sm text-[var(--color-ink-mid)]">
          Defina uma nova senha. Você será solicitado a fazer login novamente.
        </p>
        <Button variant="outline" onClick={changePassword}>
          Alterar senha
        </Button>
      </SurfaceCard>
    </div>
  );
}
