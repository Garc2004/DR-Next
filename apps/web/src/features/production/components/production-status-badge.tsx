import { StatusBadge } from '@dr/ui';
import {
  PRODUCTION_STATUS_LABELS,
  PRODUCTION_STATUS_TOKENS,
  type ProductionStatus,
} from '@dr/db/enums';

export function ProductionStatusBadge({ status }: { status: ProductionStatus }) {
  return (
    <StatusBadge
      label={PRODUCTION_STATUS_LABELS[status]}
      color={PRODUCTION_STATUS_TOKENS[status]}
      pulse={status === 'active'}
    />
  );
}
