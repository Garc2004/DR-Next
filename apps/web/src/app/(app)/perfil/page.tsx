import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { PageContainer, SectionHeader } from '@dr/ui';
import { getServerClient } from '@dr/db/client/server';
import { getSession } from '@dr/db/auth/get-session';
import { Header } from '@/components/header';
import { ProfileForm } from './profile-form';

export const metadata: Metadata = { title: 'Perfil' };

export default async function PerfilPage() {
  const { user } = await getSession();
  if (!user) redirect('/login');

  const supabase = await getServerClient();
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .maybeSingle();

  return (
    <>
      <Header title="Perfil" subtitle="Suas informações e preferências" />
      <PageContainer size="narrow">
        <SectionHeader
          title={profile?.display_name ?? user.email ?? 'Usuário'}
          subtitle={`@${profile?.username ?? user.email?.split('@')[0]}`}
        />
        <ProfileForm
          profile={profile ?? null}
          email={user.email ?? ''}
        />
      </PageContainer>
    </>
  );
}
