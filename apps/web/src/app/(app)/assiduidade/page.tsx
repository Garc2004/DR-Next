import type { Metadata } from 'next';
import { Suspense } from 'react';
import { PageContainer, Skeleton } from '@dr/ui';
import { Header } from '@/components/header';
import { AttendanceGrid } from './attendance-grid';

export const metadata: Metadata = { title: 'Assiduidade' };

export default function AssiduidadePage() {
  return (
    <>
      <Header title="Assiduidade" subtitle="Registro diário de operadores" />
      <PageContainer size="wide">
        <Suspense fallback={<Skeleton className="h-[60vh] w-full" />}>
          <AttendanceGrid />
        </Suspense>
      </PageContainer>
    </>
  );
}
