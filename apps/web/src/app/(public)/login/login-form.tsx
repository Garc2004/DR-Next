'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { valibotResolver } from '@hookform/resolvers/valibot';
import * as v from 'valibot';
import { Button, Input, Label, toast } from '@dr/ui';
import { getBrowserClient } from '@dr/db/client/browser';

const LoginSchema = v.object({
  username: v.pipe(v.string(), v.minLength(2, 'Informe um usuário válido')),
  password: v.pipe(v.string(), v.minLength(6, 'Senha curta demais')),
});

type LoginInput = v.InferOutput<typeof LoginSchema>;

export function LoginForm({ next }: { next: string }) {
  const router = useRouter();
  const [pending, setPending] = React.useState(false);

  const form = useForm<LoginInput>({
    resolver: valibotResolver(LoginSchema),
    defaultValues: { username: '', password: '' },
  });

  async function onSubmit(values: LoginInput) {
    setPending(true);
    const supabase = getBrowserClient();
    const email = values.username.includes('@')
      ? values.username
      : `${values.username.trim().toLowerCase()}@dr.local`;

    const { error } = await supabase.auth.signInWithPassword({ email, password: values.password });
    setPending(false);

    if (error) {
      toast.error('Não foi possível entrar', { description: error.message });
      return;
    }

    toast.success('Bem-vindo!');
    router.replace(next || '/');
    router.refresh();
  }

  return (
    <form
      onSubmit={form.handleSubmit(onSubmit)}
      className="rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] p-6 shadow-[var(--shadow-base)]"
    >
      <div className="space-y-1.5">
        <h2 className="text-base font-semibold">Entrar</h2>
        <p className="text-xs text-[var(--color-ink-mid)]">
          Use suas credenciais corporativas para acessar o sistema.
        </p>
      </div>
      <div className="mt-6 space-y-4">
        <div className="space-y-1.5">
          <Label htmlFor="username">Usuário</Label>
          <Input
            id="username"
            autoComplete="username"
            autoCapitalize="none"
            spellCheck={false}
            disabled={pending}
            {...form.register('username')}
          />
          {form.formState.errors.username ? (
            <p className="text-xs text-[var(--color-status-error)]">
              {form.formState.errors.username.message}
            </p>
          ) : null}
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="password">Senha</Label>
          <Input
            id="password"
            type="password"
            autoComplete="current-password"
            disabled={pending}
            {...form.register('password')}
          />
          {form.formState.errors.password ? (
            <p className="text-xs text-[var(--color-status-error)]">
              {form.formState.errors.password.message}
            </p>
          ) : null}
        </div>
      </div>
      <Button type="submit" variant="accent" className="mt-6 w-full" disabled={pending}>
        {pending ? 'Entrando…' : 'Entrar'}
      </Button>
    </form>
  );
}
