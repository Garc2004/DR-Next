// Feature flag keys consumed by Vercel Edge Config (<1ms latency).
// Read-only on the client (always via RSC); server-only otherwise.

export const FLAG_KEYS = {
  attendanceModule: 'attendance_module_enabled',
  graficoExportPdf: 'grafico_export_pdf_enabled',
  bulkOperatorImport: 'admin_bulk_operator_import_enabled',
  newDashboardLayout: 'web_new_dashboard_layout',
  realtimeBroadcasts: 'realtime_broadcasts_enabled',
  productionConflictResolver: 'production_conflict_resolver_enabled',
} as const;

export type FlagKey = keyof typeof FLAG_KEYS;

/**
 * Read a flag from Vercel Edge Config.
 *
 * Always call from server code (RSC, server actions, route handlers, middleware).
 * The local fallback path lets development run without a live Edge Config.
 */
export async function getFlag(key: FlagKey, fallback = false): Promise<boolean> {
  if (!process.env.EDGE_CONFIG) {
    return fallback;
  }

  try {
    const { get } = await import('@vercel/edge-config');
    const value = await get<unknown>(FLAG_KEYS[key]);
    return Boolean(value);
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.warn(`[flags] failed to read ${key}, falling back to ${fallback}`, error);
    }
    return fallback;
  }
}

export async function getAllFlags(): Promise<Record<FlagKey, boolean>> {
  const entries = await Promise.all(
    (Object.keys(FLAG_KEYS) as FlagKey[]).map(async (k) => [k, await getFlag(k)] as const),
  );
  return Object.fromEntries(entries) as Record<FlagKey, boolean>;
}
