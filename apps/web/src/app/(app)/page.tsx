import type { Metadata } from 'next';
import { Suspense } from 'react';
import { PageContainer, Skeleton } from '@dr/ui';
import { Header } from '@/components/header';
import { ControlPanel } from './control-panel';

export const metadata: Metadata = { title: 'Controle de envase' };

export default function ProductionPage() {
  return (
    <>
      <Header title="Controle de envase" subtitle="Acompanhe e registre envases em tempo real" />
      <PageContainer size="wide">
        <Suspense fallback={<Skeleton className="h-[60vh] w-full" />}>
          <ControlPanel />
        </Suspense>
      </PageContainer>
    </>
  );
}
