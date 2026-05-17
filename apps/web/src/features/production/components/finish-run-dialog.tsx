'use client';

import * as React from 'react';
import { useAtom } from 'jotai';
import { useForm } from 'react-hook-form';
import { valibotResolver } from '@hookform/resolvers/valibot';
import * as v from 'valibot';
import {
  Button,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  Input,
  Label,
} from '@dr/ui';
import { productionDialogAtom } from '@/lib/atoms/dialogs';
import { useFinishRun } from '../hooks';

const Schema = v.object({
  units: v.pipe(
    v.string(),
    v.regex(/^\d+([.,]\d{0,3})?$/, 'Use um número (até 3 casas)'),
  ),
});
type Input = v.InferOutput<typeof Schema>;

export function FinishRunDialog() {
  const [dialog, setDialog] = useAtom(productionDialogAtom);
  const open = dialog.kind === 'finish';
  const finishRun = useFinishRun();

  const form = useForm<Input>({
    resolver: valibotResolver(Schema),
    defaultValues: { units: '' },
  });

  React.useEffect(() => {
    if (!open) form.reset();
  }, [open, form]);

  async function onSubmit(values: Input) {
    if (dialog.kind !== 'finish') return;
    const units = Number(values.units.replace(',', '.'));
    if (Number.isNaN(units) || units <= 0) {
      form.setError('units', { message: 'Informe um volume positivo' });
      return;
    }
    await finishRun.mutateAsync({ id: dialog.runId, units_produced: units });
    setDialog({ kind: 'none' });
  }

  return (
    <Dialog open={open} onOpenChange={(o) => !o && setDialog({ kind: 'none' })}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Finalizar envase</DialogTitle>
          <DialogDescription>
            Informe o volume produzido em metros cúbicos para encerrar este envase.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="units">Volume produzido (m³)</Label>
            <Input
              id="units"
              inputMode="decimal"
              autoFocus
              placeholder="0,000"
              {...form.register('units')}
            />
            {form.formState.errors.units ? (
              <p className="text-xs text-[var(--color-status-error)]">
                {form.formState.errors.units.message}
              </p>
            ) : null}
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setDialog({ kind: 'none' })}
              disabled={finishRun.isPending}
            >
              Cancelar
            </Button>
            <Button type="submit" variant="accent" disabled={finishRun.isPending}>
              {finishRun.isPending ? 'Finalizando…' : 'Finalizar envase'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
