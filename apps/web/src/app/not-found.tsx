import Link from 'next/link';
import { Button, PageContainer, SectionHeader } from '@dr/ui';

export default function NotFound() {
  return (
    <PageContainer size="narrow">
      <SectionHeader
        eyebrow="404"
        title="Página não encontrada"
        subtitle="A rota que você tentou acessar não existe ou foi movida."
      />
      <Button asChild>
        <Link href="/">Voltar para o início</Link>
      </Button>
    </PageContainer>
  );
}
