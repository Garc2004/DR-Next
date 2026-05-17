'use client';

import * as React from 'react';
import { useAtom } from 'jotai';
import {
  Button,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@dr/ui';
import { productionDialogAtom } from '@/lib/atoms/dialogs';
import { useCancelRun, useDeleteRun } from '../hooks';

export function CancelRunDialog() {
  const [dialog, setDialog] = useAtom(productionDialogAtom);
  const open = dialog.kind === 'cancel';
  const mutation = useCancelRun();

  return (
    <Dialog open={open} onOpenChange={(o) => !o && setDialog({ kind: 'none' })}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Cancelar envase</DialogTitle>
          <DialogDescription>
            Essa ação marca o envase como cancelado. Você poderá criar um novo registro depois.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => setDialog({ kind: 'none' })}
            disabled={mutation.isPending}
          >
            Voltar
          </Button>
          <Button
            type="button"
            variant="destructive"
            disabled={mutation.isPending}
            onClick={async () => {
              if (dialog.kind !== 'cancel') return;
              await mutation.mutateAsync(dialog.runId);
              setDialog({ kind: 'none' });
            }}
          >
            {mutation.isPending ? 'Cancelando…' : 'Confirmar cancelamento'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export function DeleteRunDialog() {
  const [dialog, setDialog] = useAtom(productionDialogAtom);
  const open = dialog.kind === 'delete';
  const mutation = useDeleteRun();

  return (
    <Dialog open={open} onOpenChange={(o) => !o && setDialog({ kind: 'none' })}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Excluir registro</DialogTitle>
          <DialogDescription>
            O registro será removido da lista. Líderes ainda poderão visualizar este envase no
            painel administrativo.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => setDialog({ kind: 'none' })}
            disabled={mutation.isPending}
          >
            Voltar
          </Button>
          <Button
            type="button"
            variant="destructive"
            disabled={mutation.isPending}
            onClick={async () => {
              if (dialog.kind !== 'delete') return;
              await mutation.mutateAsync(dialog.runId);
              setDialog({ kind: 'none' });
            }}
          >
            {mutation.isPending ? 'Excluindo…' : 'Excluir'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
