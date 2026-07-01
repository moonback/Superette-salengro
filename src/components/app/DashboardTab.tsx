import React, { useMemo } from "react";
import {
  Package, TrendingUp, AlertTriangle, ShoppingCart, Layers,
  BarChart3, ArrowUpRight, Euro, Activity,
} from "lucide-react";
import { motion } from "motion/react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend, RadialBarChart, RadialBar,
} from "recharts";
import { InventoryItem, CategoryItem } from "../../types";

type DashboardTabProps = {
  inventory: InventoryItem[];
  dbCategories: CategoryItem[];
};

type CategoryStats = {
  name: string;
  count: number;
  qty: number;
  value: number;
  salesValue: number;
};

function formatCurrency(value: number): string {
  return new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR", maximumFractionDigits: 0 }).format(value);
}

function formatCurrencyFull(value: number): string {
  return new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR" }).format(value);
}

// ─── KPI Card ────────────────────────────────────────────────────────────────
function KpiCard({
  label, value, sub, icon: Icon, gradient, trend,
}: {
  label: string;
  value: string | number;
  sub?: string;
  icon: React.ComponentType<{ className?: string }>;
  gradient: string;
  trend?: { value: number; label: string };
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className="relative overflow-hidden rounded-2xl p-5 text-white shadow-md"
      style={{ background: gradient }}
    >
      {/* Background circle */}
      <div className="pointer-events-none absolute -right-4 -top-4 h-24 w-24 rounded-full bg-white/10" />
      <div className="pointer-events-none absolute -right-1 -bottom-6 h-16 w-16 rounded-full bg-white/10" />

      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <p className="text-[10px] font-black uppercase tracking-widest text-white/70">{label}</p>
          <p className="text-2xl font-black tabular-nums leading-tight">
            {typeof value === "number" ? value.toLocaleString("fr-FR") : value}
          </p>
          {sub && <p className="text-[11px] text-white/60 font-semibold">{sub}</p>}
        </div>
        <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl bg-white/20 backdrop-blur-sm">
          <Icon className="h-5 w-5" />
        </div>
      </div>

      {trend && (
        <div className="mt-3 flex items-center gap-1">
          <ArrowUpRight className="h-3.5 w-3.5 text-white/70" />
          <span className="text-[10px] font-bold text-white/70">{trend.label}</span>
        </div>
      )}
    </motion.div>
  );
}

// ─── Section wrapper ──────────────────────────────────────────────────────────
function Section({ title, icon: Icon, children }: {
  title: string;
  icon?: React.ComponentType<{ className?: string }>;
  children: React.ReactNode;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm"
    >
      <div className="mb-4 flex items-center gap-2">
        {Icon && <Icon className="h-4 w-4 text-slate-400" />}
        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">{title}</p>
      </div>
      {children}
    </motion.div>
  );
}

// ─── Custom Tooltip ───────────────────────────────────────────────────────────
function CustomBarTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-xl border border-slate-100 bg-white px-3 py-2 shadow-lg text-xs">
      <p className="font-black text-slate-700 mb-1 max-w-[160px] truncate">{label}</p>
      {payload.map((p: any) => (
        <p key={p.name} className="font-bold" style={{ color: p.color }}>
          {p.name}: <span className="tabular-nums">{typeof p.value === "number" && p.value > 100 ? formatCurrencyFull(p.value) : p.value}</span>
        </p>
      ))}
    </div>
  );
}

function CustomPieTooltip({ active, payload }: any) {
  if (!active || !payload?.length) return null;
  const d = payload[0];
  return (
    <div className="rounded-xl border border-slate-100 bg-white px-3 py-2 shadow-lg text-xs">
      <p className="font-black text-slate-700">{d.name}</p>
      <p className="font-bold text-slate-500">{d.value} réf. · {d.payload.pct}%</p>
      <p className="font-bold text-slate-500">{formatCurrency(d.payload.value)}</p>
    </div>
  );
}

// ─── Donut label ──────────────────────────────────────────────────────────────
function renderDonutLabel({ cx, cy, midAngle, innerRadius, outerRadius, pct }: any) {
  if (pct < 5) return null;
  const RADIAN = Math.PI / 180;
  const r = innerRadius + (outerRadius - innerRadius) * 0.55;
  const x = cx + r * Math.cos(-midAngle * RADIAN);
  const y = cy + r * Math.sin(-midAngle * RADIAN);
  return (
    <text x={x} y={y} fill="#fff" textAnchor="middle" dominantBaseline="central" className="text-[9px] font-black" fontSize={9}>
      {pct}%
    </text>
  );
}

// ─── PALETTE ─────────────────────────────────────────────────────────────────
const CHART_COLORS = ["#6366f1", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#06b6d4", "#f97316", "#ec4899"];

// ─────────────────────────────────────────────────────────────────────────────
export function DashboardTab({ inventory, dbCategories }: DashboardTabProps) {
  const stats = useMemo(() => {
    const totalItems = inventory.reduce((sum, i) => sum + i.quantity, 0);
    const lowStockCount = inventory.filter((i) => i.quantity <= 5 && i.quantity > 0).length;
    const outOfStockCount = inventory.filter((i) => i.quantity === 0).length;
    const inStockCount = inventory.filter((i) => i.quantity > 5).length;

    const totalPurchaseVal = inventory.reduce((sum, i) => sum + i.quantity * (i.purchasePrice ?? 0), 0);
    const totalSalesVal = inventory.reduce((sum, i) => sum + i.quantity * (i.salesPrice ?? 0), 0);
    const potentialMargin = totalSalesVal - totalPurchaseVal;
    const marginPct = totalSalesVal > 0 ? Math.round((potentialMargin / totalSalesVal) * 100) : 0;

    // Top 6 by qty — for bar chart
    const topByQty = [...inventory]
      .sort((a, b) => b.quantity - a.quantity)
      .slice(0, 6)
      .map((i) => ({ name: i.name.length > 14 ? i.name.slice(0, 14) + "…" : i.name, qty: i.quantity }));

    // Top 6 by value
    const topByValue = [...inventory]
      .sort((a, b) => b.quantity * (b.purchasePrice ?? 0) - a.quantity * (a.purchasePrice ?? 0))
      .slice(0, 6)
      .map((i) => ({
        name: i.name.length > 14 ? i.name.slice(0, 14) + "…" : i.name,
        valeur: Math.round(i.quantity * (i.purchasePrice ?? 0)),
      }));

    // Category map
    const categoryMap = new Map<string, CategoryStats>();
    inventory.forEach((item) => {
      const cat = item.category?.trim() || "Non classé";
      const e = categoryMap.get(cat) || { name: cat, count: 0, qty: 0, value: 0, salesValue: 0 };
      e.count += 1;
      e.qty += item.quantity;
      e.value += item.quantity * (item.purchasePrice ?? 0);
      e.salesValue += item.quantity * (item.salesPrice ?? 0);
      categoryMap.set(cat, e);
    });

    const categoryStats = Array.from(categoryMap.values()).sort((a, b) => b.value - a.value);

    // Donut data — top 6 + "Autres"
    const top6 = categoryStats.slice(0, 6);
    const others = categoryStats.slice(6);
    const totalCatValue = categoryStats.reduce((s, c) => s + c.value, 0) || 1;
    const donutData = [
      ...top6.map((c) => ({
        name: c.name,
        value: c.count,
        pct: Math.round((c.count / inventory.length) * 100),
        catValue: Math.round(c.value),
        value_display: c.value,
      })),
      ...(others.length > 0
        ? [{
          name: "Autres",
          value: others.reduce((s, c) => s + c.count, 0),
          pct: Math.round((others.reduce((s, c) => s + c.count, 0) / inventory.length) * 100),
          catValue: Math.round(others.reduce((s, c) => s + c.value, 0)),
          value_display: others.reduce((s, c) => s + c.value, 0),
        }]
        : []),
    ].map((d) => ({ ...d, value: d.value }));

    // Radial stock health
    const total = inStockCount + lowStockCount + outOfStockCount || 1;
    const stockHealth = [
      { name: "En stock", value: Math.round((inStockCount / total) * 100), fill: "#10b981" },
      { name: "Stock faible", value: Math.round((lowStockCount / total) * 100), fill: "#f59e0b" },
      { name: "Rupture", value: Math.round((outOfStockCount / total) * 100), fill: "#ef4444" },
    ];

    const recentlyScanned = [...inventory].sort((a, b) => b.lastUpdated - a.lastUpdated).slice(0, 6);

    return {
      totalItems, lowStockCount, outOfStockCount, inStockCount,
      totalPurchaseVal, totalSalesVal, potentialMargin, marginPct,
      topByQty, topByValue, categoryStats, donutData, stockHealth, recentlyScanned,
    };
  }, [inventory]);

  if (inventory.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-slate-400 gap-3">
        <Package className="h-10 w-10 stroke-[1.5]" />
        <p className="text-sm font-semibold">Aucune donnée à afficher</p>
        <p className="text-xs">Commencez par scanner ou ajouter des produits.</p>
      </div>
    );
  }

  return (
    <div className="space-y-5 pb-6">

      {/* ── KPI row ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <KpiCard
          label="Références"
          value={inventory.length}
          sub={`${stats.totalItems.toLocaleString("fr-FR")} unités total`}
          icon={Package}
          gradient="linear-gradient(135deg,#6366f1,#818cf8)"
        />
        <KpiCard
          label="Valeur stock"
          value={formatCurrency(stats.totalPurchaseVal)}
          sub="au prix d'achat"
          icon={ShoppingCart}
          gradient="linear-gradient(135deg,#f59e0b,#fbbf24)"
        />
        <KpiCard
          label="CA Potentiel"
          value={formatCurrency(stats.totalSalesVal)}
          sub="au prix de vente"
          icon={TrendingUp}
          gradient="linear-gradient(135deg,#10b981,#34d399)"
        />
        <KpiCard
          label="Marge est."
          value={formatCurrency(stats.potentialMargin)}
          sub={`${stats.marginPct}% du CA`}
          icon={Euro}
          gradient={stats.potentialMargin >= 0
            ? "linear-gradient(135deg,#06b6d4,#22d3ee)"
            : "linear-gradient(135deg,#ef4444,#f87171)"}
        />
      </div>

      {/* ── Alertes + Santé du stock ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

        {/* Alertes */}
        <Section title="Alertes stock" icon={AlertTriangle}>
          <div className="flex items-center gap-4">
            {/* Rupture */}
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="flex-1 rounded-xl bg-rose-50 border border-rose-100 p-4 text-center"
            >
              <p className="text-3xl font-black text-rose-600 tabular-nums">{stats.outOfStockCount}</p>
              <p className="mt-1 text-[10px] font-black uppercase tracking-widest text-rose-400">Ruptures</p>
            </motion.div>
            {/* Stock faible */}
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.08 }}
              className="flex-1 rounded-xl bg-amber-50 border border-amber-100 p-4 text-center"
            >
              <p className="text-3xl font-black text-amber-600 tabular-nums">{stats.lowStockCount}</p>
              <p className="mt-1 text-[10px] font-black uppercase tracking-widest text-amber-400">Stock faible</p>
            </motion.div>
            {/* En stock */}
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.16 }}
              className="flex-1 rounded-xl bg-emerald-50 border border-emerald-100 p-4 text-center"
            >
              <p className="text-3xl font-black text-emerald-600 tabular-nums">{stats.inStockCount}</p>
              <p className="mt-1 text-[10px] font-black uppercase tracking-widest text-emerald-400">En stock</p>
            </motion.div>
          </div>

          {/* Stacked progress bar */}
          <div className="mt-4 h-3 w-full rounded-full bg-slate-100 overflow-hidden flex gap-0.5">
            {[
              { v: stats.inStockCount, bg: "bg-emerald-500" },
              { v: stats.lowStockCount, bg: "bg-amber-500" },
              { v: stats.outOfStockCount, bg: "bg-rose-500" },
            ].map(({ v, bg }, i) => {
              const total = stats.inStockCount + stats.lowStockCount + stats.outOfStockCount || 1;
              return (
                <motion.div
                  key={i}
                  initial={{ scaleX: 0 }}
                  animate={{ scaleX: 1 }}
                  transition={{ duration: 0.6, delay: i * 0.1, ease: "easeOut" }}
                  className={`h-full ${bg} rounded-full`}
                  style={{ width: `${(v / total) * 100}%`, transformOrigin: "left" }}
                />
              );
            })}
          </div>
        </Section>

        {/* Radial bar — santé du stock */}
        <Section title="Santé du stock" icon={Activity}>
          <ResponsiveContainer width="100%" height={140}>
            <RadialBarChart
              cx="50%"
              cy="100%"
              innerRadius="40%"
              outerRadius="90%"
              startAngle={180}
              endAngle={0}
              data={stats.stockHealth}
            >
              <RadialBar dataKey="value" cornerRadius={6} background={{ fill: "#f1f5f9" }} />
              <Legend
                iconSize={8}
                iconType="circle"
                formatter={(value: string) => <span className="text-[10px] font-bold text-slate-500">{value}</span>}
              />
              <Tooltip
                formatter={(v: number, name: string) => [`${v}%`, name]}
                contentStyle={{ borderRadius: 12, fontSize: 11, border: "1px solid #e2e8f0" }}
              />
            </RadialBarChart>
          </ResponsiveContainer>
        </Section>
      </div>

      {/* ── Top 6 Quantité / Valeur ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

        {/* Bar chart — quantité */}
        <Section title="Top produits — quantité" icon={Layers}>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={stats.topByQty} layout="vertical" margin={{ left: 0, right: 20, top: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" horizontal={false} />
              <XAxis type="number" tick={{ fontSize: 10, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
              <YAxis type="category" dataKey="name" width={110} tick={{ fontSize: 10, fill: "#475569", fontWeight: 700 }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomBarTooltip />} />
              <Bar dataKey="qty" name="Quantité" radius={[0, 6, 6, 0]} fill="#6366f1">
                {stats.topByQty.map((_, i) => (
                  <Cell key={i} fill={`hsl(${240 - i * 12}, 78%, ${62 - i * 3}%)`} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </Section>

        {/* Bar chart — valeur */}
        <Section title="Top produits — valeur d'achat" icon={BarChart3}>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={stats.topByValue} layout="vertical" margin={{ left: 0, right: 20, top: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" horizontal={false} />
              <XAxis type="number" tick={{ fontSize: 10, fill: "#94a3b8" }} axisLine={false} tickLine={false}
                tickFormatter={(v) => `${Math.round(v / 1000) > 0 ? Math.round(v / 1000) + "k" : v}€`} />
              <YAxis type="category" dataKey="name" width={110} tick={{ fontSize: 10, fill: "#475569", fontWeight: 700 }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomBarTooltip />} />
              <Bar dataKey="valeur" name="Valeur (€)" radius={[0, 6, 6, 0]}>
                {stats.topByValue.map((_, i) => (
                  <Cell key={i} fill={`hsl(${158 - i * 8}, 68%, ${48 - i * 3}%)`} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </Section>
      </div>

      {/* ── Répartition catégories ── */}
      <Section title="Répartition par catégorie" icon={ShoppingCart}>
        {stats.donutData.length > 0 ? (
          <div className="flex flex-col xl:flex-row items-center gap-6">
            {/* Donut */}
            <div className="flex-shrink-0">
              <ResponsiveContainer width={240} height={240}>
                <PieChart>
                  <Pie
                    data={stats.donutData}
                    cx="50%"
                    cy="50%"
                    innerRadius={65}
                    outerRadius={105}
                    paddingAngle={2}
                    dataKey="value"
                    labelLine={false}
                    label={renderDonutLabel}
                  >
                    {stats.donutData.map((_, i) => (
                      <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomPieTooltip />} />
                </PieChart>
              </ResponsiveContainer>
            </div>

            {/* Legend table */}
            <div className="flex-1 w-full">
              <div className="space-y-2">
                {stats.donutData.map((d, i) => (
                  <div key={d.name} className="flex items-center gap-3">
                    <span
                      className="h-2.5 w-2.5 flex-shrink-0 rounded-full"
                      style={{ background: CHART_COLORS[i % CHART_COLORS.length] }}
                    />
                    <span className="flex-1 text-xs font-bold text-slate-700 truncate">{d.name}</span>
                    <span className="text-xs font-black tabular-nums text-slate-500">{d.value} réf.</span>
                    <div className="w-16 h-1.5 rounded-full bg-slate-100 overflow-hidden">
                      <motion.div
                        initial={{ scaleX: 0 }}
                        animate={{ scaleX: 1 }}
                        transition={{ duration: 0.5, delay: i * 0.05 }}
                        className="h-full rounded-full"
                        style={{
                          width: `${d.pct}%`,
                          background: CHART_COLORS[i % CHART_COLORS.length],
                          transformOrigin: "left",
                        }}
                      />
                    </div>
                    <span className="w-10 text-right text-[10px] font-black tabular-nums text-slate-400">{d.pct}%</span>
                    <span className="w-20 text-right text-[10px] font-bold tabular-nums text-slate-400">
                      {formatCurrency(d.value_display)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <p className="text-xs text-slate-400">Aucune catégorie renseignée.</p>
        )}
      </Section>

      {/* ── Derniers scans ── */}
      <Section title="Derniers produits scannés / modifiés">
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-2">
          {stats.recentlyScanned.map((item, i) => {
            const itemValue = item.quantity * (item.purchasePrice ?? 0);
            const isLow = item.quantity <= 5 && item.quantity > 0;
            const isOut = item.quantity === 0;
            return (
              <motion.div
                key={item.barcode}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
                className="flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50/60 px-3 py-2.5"
              >
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-black text-slate-800 truncate">{item.name}</p>
                  <p className="text-[10px] font-semibold text-slate-400 truncate">{item.barcode}</p>
                </div>
                <div className="text-right ml-2 flex-shrink-0">
                  <p className={`text-xs font-black tabular-nums ${isOut ? "text-rose-600" : isLow ? "text-amber-600" : "text-slate-800"}`}>
                    {item.quantity} u.
                  </p>
                  {itemValue > 0 && (
                    <p className="text-[10px] font-bold tabular-nums text-slate-500">{itemValue.toFixed(2)} €</p>
                  )}
                </div>
              </motion.div>
            );
          })}
          {stats.recentlyScanned.length === 0 && (
            <p className="text-xs text-slate-400 col-span-3">Aucune activité récente.</p>
          )}
        </div>
      </Section>
    </div>
  );
}
