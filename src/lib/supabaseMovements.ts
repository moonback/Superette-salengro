/**
 * supabaseMovements.ts
 * CRUD pour la table `stock_movements`.
 *
 * Schéma SQL minimal (à exécuter dans Supabase SQL editor) :
 *
 *   create table if not exists stock_movements (
 *     id          uuid primary key default gen_random_uuid(),
 *     barcode     text not null,
 *     delta       integer not null,
 *     quantity_after integer not null,
 *     source      text,
 *     note        text,
 *     created_at  bigint not null
 *   );
 *
 *   create index on stock_movements (barcode, created_at desc);
 *
 *   -- RLS (si activé sur votre projet) :
 *   alter table stock_movements enable row level security;
 *   create policy "authenticated users" on stock_movements
 *     for all using (auth.role() = 'authenticated');
 */

import { StockMovement } from '../types';
import {
  getHeaders,
  getRestUrl,
  isSupabaseConfigured,
  request,
} from './supabaseRest';

const MOVEMENTS_TABLE = 'stock_movements';

interface MovementRow {
  id: string;
  barcode: string;
  delta: number;
  quantity_after: number;
  source: string | null;
  note: string | null;
  created_at: number;
}

function toMovement(row: MovementRow): StockMovement {
  return {
    id: row.id,
    barcode: row.barcode,
    delta: row.delta,
    quantity_after: row.quantity_after,
    source: (row.source as StockMovement['source']) ?? undefined,
    note: row.note ?? undefined,
    created_at: row.created_at,
  };
}

function toRow(m: StockMovement): Omit<MovementRow, 'id'> {
  return {
    barcode: m.barcode,
    delta: m.delta,
    quantity_after: m.quantity_after,
    source: m.source ?? null,
    note: m.note ?? null,
    created_at: m.created_at,
  };
}

/**
 * Insère un mouvement de stock. Ne lance pas d'erreur si Supabase n'est pas
 * configuré — le logging est best-effort.
 */
export async function insertStockMovement(movement: StockMovement): Promise<void> {
  if (!isSupabaseConfigured) return;

  try {
    await request<MovementRow[]>(getRestUrl(MOVEMENTS_TABLE), {
      method: 'POST',
      headers: getHeaders({ Prefer: 'return=minimal' }),
      body: JSON.stringify(toRow(movement)),
    });
  } catch (error) {
    // Non-bloquant : on log sans faire échouer l'opération principale
    console.warn('[movements] Impossible de logger le mouvement:', error);
  }
}

/**
 * Récupère les N derniers mouvements d'un produit.
 */
export async function fetchMovementsForBarcode(
  barcode: string,
  limit = 20,
): Promise<StockMovement[]> {
  if (!isSupabaseConfigured) return [];

  try {
    const rows = await request<MovementRow[]>(
      getRestUrl(
        MOVEMENTS_TABLE,
        `?barcode=eq.${encodeURIComponent(barcode)}&order=created_at.desc&limit=${limit}&select=*`,
      ),
      { headers: getHeaders() },
    );
    return rows.map(toMovement);
  } catch (error) {
    console.warn('[movements] Impossible de charger les mouvements:', error);
    return [];
  }
}
