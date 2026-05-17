import type { Metadata } from 'next';
import { PageContainer, SectionHeader, EmptyState } from '@dr/ui';

export const metadata: Metadata = { title: 'Produção' };

export default function ProducaoPage() {
  return (
    <PageContainer size="wide">
      <SectionHeader
        eyebrow="Produção"
        title="Gestão de envases"
        subtitle="CRUD completo de ordens e execuções. Em construção."
      />
      <EmptyState
        title="Em construção"
        description="Esta página replicará a tabela do app operacional com edição em massa, cancelamento e exclusão definitiva."
      />
    </PageContainer>
  );
}
