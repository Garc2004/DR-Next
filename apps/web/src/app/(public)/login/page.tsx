import type { Metadata } from 'next';
import { LoginForm } from './login-form';

export const metadata: Metadata = { title: 'Entrar' };

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const { next } = await searchParams;
  return (
    <main className="grid min-h-screen place-items-center bg-[var(--color-canvas)] px-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 flex items-center gap-3">
          <div className="grid size-9 place-items-center rounded-md bg-[var(--color-accent)] text-sm font-bold text-white">
            DR
          </div>
          <div>
            <p className="text-xs font-medium uppercase tracking-wider text-[var(--color-ink-muted)]">
              Controle de envase
            </p>
            <h1 className="text-lg font-semibold tracking-tight">DR-Next</h1>
          </div>
        </div>
        <LoginForm next={next ?? '/'} />
      </div>
    </main>
  );
}
