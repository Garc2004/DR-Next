'use client';

import { useEffect } from 'react';
import { Button, PageContainer, SectionHeader } from '@dr/ui';

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('[web] route error', error);
  }, [error]);

  return (
    <PageContainer size="narrow">
      <SectionHeader
        eyebrow="Erro inesperado"
        title="Algo deu errado"
        subtitle={error.message || 'Ocorreu uma falha ao carregar esta página.'}
      />
      <div className="flex gap-2">
        <Button onClick={reset}>Tentar novamente</Button>
      </div>
    </PageContainer>
  );
}
