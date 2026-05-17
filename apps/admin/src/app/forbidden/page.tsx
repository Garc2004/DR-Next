import Link from 'next/link';
import { Button, PageContainer, SectionHeader } from '@dr/ui';

export default function ForbiddenPage() {
  const webUrl = process.env.NEXT_PUBLIC_WEB_URL ?? 'http://localhost:3000';
  return (
    <PageContainer size="narrow">
      <SectionHeader
        eyebrow="Acesso restrito"
        title="Apenas líderes acessam este painel"
        subtitle="Solicite acesso ao seu líder caso precise entrar nesta área."
      />
      <Button asChild>
        <Link href={webUrl}>Voltar para a aplicação</Link>
      </Button>
    </PageContainer>
  );
}
