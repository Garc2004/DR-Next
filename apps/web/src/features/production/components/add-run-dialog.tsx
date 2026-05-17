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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Textarea,
} from '@dr/ui';
import { productionDialogAtom } from '@/lib/atoms/dialogs';
import { useCreateRun, useResources } from '../hooks';

const Schema = v.pipe(
  v.object({
    order_number: v.pipe(v.string(), v.regex(/^\d{6,10}$/, 'Ordem deve ter 6 a 10 dígitos')),
    batch_number: v.pipe(v.string(), v.regex(/^\d{6,12}$/, 'Lote deve ter 6 a 12 dígitos')),
    resource_id: v.pipe(v.string(), v.uuid('Selecione um reator')),
    product_name: v.optional(v.string()),
    notes: v.optional(v.string()),
  }),
);
type Input = v.InferOutput<typeof Schema>;

export function AddRunDialog() {
  const [dialog, setDialog] = useAtom(productionDialogAtom);
  const open = dialog.kind === 'add';
  const resources = useResources();
  const createRun = useCreateRun();

  const form = useForm<Input>({
    resolver: valibotResolver(Schema),
    defaultValues: { order_number: '', batch_number: '', resource_id: '' },
  });

  React.useEffect(() => {
    if (!open) form.reset();
  }, [open, form]);

  async function onSubmit(values: Input) {
    await createRun.mutateAsync({
      order_number: Number(values.order_number),
      batch_number: Number(values.batch_number),
      resource_id: values.resource_id,
      product_name: values.product_name,
      notes: values.notes,
    });
    setDialog({ kind: 'none' });
  }

  return (
    <Dialog open={open} onOpenChange={(o) => !o && setDialog({ kind: 'none' })}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Novo registro de envase</DialogTitle>
          <DialogDescription>
            Informe a ordem, o lote e o reator. O envase ficará pendente até ser iniciado.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="order_number">Ordem</Label>
              <Input
                id="order_number"
                inputMode="numeric"
                autoFocus
                {...form.register('order_number')}
              />
              {form.formState.errors.order_number ? (
                <p className="text-xs text-[var(--color-status-error)]">
                  {form.formState.errors.order_number.message}
                </p>
              ) : null}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="batch_number">Lote</Label>
              <Input
                id="batch_number"
                inputMode="numeric"
                {...form.register('batch_number')}
              />
              {form.formState.errors.batch_number ? (
                <p className="text-xs text-[var(--color-status-error)]">
                  {form.formState.errors.batch_number.message}
                </p>
              ) : null}
            </div>
          </div>
          <div className="space-y-1.5">
            <Label>Reator</Label>
            <Select
              value={form.watch('resource_id')}
              onValueChange={(v) => form.setValue('resource_id', v, { shouldValidate: true })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione…" />
              </SelectTrigger>
              <SelectContent>
                {resources.data?.map((r) => (
                  <SelectItem key={r.id} value={r.id}>
                    {r.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {form.formState.errors.resource_id ? (
              <p className="text-xs text-[var(--color-status-error)]">
                {form.formState.errors.resource_id.message}
              </p>
            ) : null}
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="product_name">Produto (opcional)</Label>
            <Input id="product_name" {...form.register('product_name')} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="notes">Observações</Label>
            <Textarea id="notes" rows={2} {...form.register('notes')} />
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setDialog({ kind: 'none' })}
              disabled={createRun.isPending}
            >
              Cancelar
            </Button>
            <Button type="submit" variant="accent" disabled={createRun.isPending}>
              {createRun.isPending ? 'Salvando…' : 'Criar registro'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
