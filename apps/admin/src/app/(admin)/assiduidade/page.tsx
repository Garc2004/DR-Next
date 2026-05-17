import type { Metadata } from 'next';
import { PageContainer, SectionHeader, EmptyState } from '@dr/ui';

export const metadata: Metadata = { title: 'Assiduidade' };

export default function AdminAssiduidadePage() {
  return (
    <PageContainer size="wide">
      <SectionHeader
        eyebrow="Assiduidade"
        title="Gestão de operadores"
        subtitle="CRUD de operadores + edição livre de assiduidade. Em construção."
      />
      <EmptyState title="Em construção" />
    </PageContainer>
  );
}
