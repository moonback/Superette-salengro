# NeuroStock — Design System v1

> Référence unique pour l'apparence et le comportement visuel de l'application.
> Chaque composant listé ci-dessous décrit sa surface, ses couleurs, sa typographie et ses états.

---

## 1. Fond du monde & palette globale

| Rôle | Valeur | Usage |
|------|--------|-------|
| Fond global | `#ffffff` pur (fixe) | `body` / `html` |
| Surface | `var(--color-surface)` = #ffffff | Cartes, fonds de section |
| Surface profonde | `#f8fafc` | states alternatifs, badges désactivés |
| Encre | `#0f172a` (`stone-900`) | Texte principal, bordures fortes |
| Marque principal | `indigo-600 / indigo-500` | Boutons primaires, focus input, accents actifs |
| Variant attention | `amber-500/600/700` | Stock faible, onglet Scan Rapide |
| Variant Danger | `rose-500/600` | Suppression, rupture de stock |
| Variant Succès | `emerald-500/600` | Confirmations, stock ok |
| Variant Info | `sky-500/600` | Badges "Nouveau", éléments récents |

**Racine Tailwind** : `stone` pour surfaces neutres, `indigo/violet` pour la marque. Absence totale de beige/grain sur les surfaces de fond.

---

## 2. Typographie

| Classe Tailwind | Usage |
|-----------------|-------|
| `font-extrabold tracking-tight` | Titres d'app, nom produit |
| `text-xl font-bold tracking-tight` | Titres de section desktop |
| `text-sm font-bold` | Texte courant, input, labels |
| `text-xs font-semibold` | Métadonnées, sous-titres, sous-labels |
| `text-[10px] font-bold uppercase tracking-wider` | Labels de formulaire (pattern obligatoire) |
| `font-mono tabular` | Barre code, prix, quantités, dates |
| `font-black` (via `font-extrabold`) | Logo "NS" dans la sidebar |

**Fontes déclarées** :
- Série : `Plus Jakarta Sans` (sans serif moderne)
- Mono : `IBM Plex Mono`

---

## 3. Formes & Rayons (radius)

| Élément | Rayon | Classe Tailwind |
|---------|-------|-----------------|
| Carte pleine mobile | 1.5 rem | `rounded-[1.75rem]` |
| Carte / panneau desktop | 2 rem | `rounded-2xl` |
| Bouton / input standard | 0.75 rem | `rounded-xl` |
| Bouton pill (quantité) | Full | `rounded-full` |
| Badge / pastille | Full | `rounded-full` |
| Modal bottom sheet (mobile) | 2 rem (top only) | `rounded-t-[2rem] sm:rounded-[2rem]` |
| Modal desktop | 2 rem | `rounded-[2rem]` |
| Logo app | 1 rem carré | `rounded-2xl` |
| Avatar produit | 0.75 rem | `rounded-xl` |
| Logo admin sidebar | 1 rem | `rounded-2xl` |

---

## 4. Layout & Billes (spacing)

- **Padding section mobile** : `px-4 py-6` (défini par `.app-main`)
- **Padding section desktop** : `max-w-6xl mx-auto px-4 xl:px-6 py-6`
- **Safe-area iOS** : `.pb-safe` (padding-bottom = `max(0.75rem, env(safe-area-inset-bottom))`)
- **Gap standard entre sections** : `gap-4` / `space-y-4`
- **Gap resserré boutons** : `gap-2` / `gap-1.5`
- **Touch target minimum** : 44 × 44 px (`.touch-target { min-height: 44px; min-width: 44px }`)

---

## 5. Classes utilitaires personnalisées (`src/index.css`)

| Classe | Description |
|--------|-------------|
| `surface-card` | Fond blanc translucide + box-shadow violet subtile |
| `glass-panel` | Fond blanc 82% + flou 18px + saturate 1.6 — pour header / navbar / sidebar |
| `glass-card` | Variante glass avec ombre plus marquée |
| `glass-input` | Input blanc sans flou, bordure slate, focus indigo avec ring 3px |
| `pb-safe` | Padding-bottom safe area |
| `pt-safe` | Padding-top safe area |
| `app-shell` | `min-height: 100dvh; padding-bottom: calc(6.75rem + env(safe-area-inset-bottom))` |
| `no-scrollbar` | Cache la scrollbar webkit / firefox |
| `tap-active:active` | Scale 0.96 au touch (feedback tactile) |
| `tabular` | `font-variant-numeric: tabular-nums` |
| `product-grid-enter` | Animation fade-in + translateY échelonnée (staggered) |
| `animate-scan-line` | Scan line animé dans le scanner caméra |

---

## 6. États visuels récurrents

### Boutons
```
Inactif         → bg-white border-slate-200 text-slate-700
Hover           → bg-slate-50 hover:border-stone-300
Actif / touch   → active:scale-95 (ou tap-active scale-0.96)
Privé           → disabled:opacity-40 disabled:pointer-events-none
Primaire        → bg-slate-900 text-white hover:bg-slate-800
Marque (indigo) → bg-indigo-600 text-white hover:bg-indigo-700
```

### Inputs
```
Inactif         → glass-input (fond blanc, bordure slate-200)
Focus           → glass-input:focus (bordure indigo + ring indigo-14)
Validation ok   → border-indigo-600 (force focus par `focus:border-slate-900`)
```

### Badges de stock
```
Rupture (0)     → badge: bg-rose-50 border-rose-200 text-rose-700
                 dot:   bg-rose-500
Faible (≤5)     → badge: bg-amber-50 border-amber-200 text-amber-700
                 dot:   bg-amber-500
OK (>5)         → badge: bg-emerald-50 border-emerald-200 text-emerald-700
                 dot:   bg-emerald-500
Texte qty       → `text-amber-600` si qty ≤ 5, `text-stone-900` sinon
```

---

## 7. Comportement commun

- **Orientation** : mobile-first. La version desktop (≥ lg) utilisée par AdminDesktop impose une sidebar fixe gauche + contenu centré `max-w-6xl`.
- **Transitions** : `transition` court (0.18s) sur les inputs, `spring` (damping 30 / stiffness 350) pour les modals via Motion.
- **Animations** : `AnimatePresence` de Motion pour entrées/sorties des modals et dialogs. Stagger via `product-grid-enter`.
- **Haptique** : `triggerHaptic('light'|'success'|'warning')` appelé sur les actions importantes.
- **Z-index** :
  - Header / bottom-nav : `z-40`
  - Modals : `z-50`
  - Loading overlay scanner : `z-10` dans le contexte du scanner

---

## 8. Composants — référence implémentée

### 8.1 Header (mobile & desktop réutilisé)

| Élément | Style |
|---------|-------|
| Conteneur | `sticky top-0 z-40 glass-panel border-b pt-safe` |
| Logo | Carré 40×40, `rounded-2xl`, bg-slate-900, icône Store blanche |
| Titre | `text-base font-extrabold tracking-tight text-stone-950` |
| Stats | `text-[11px] font-semibold text-stone-500` (articles + emoji 📦) |
| Bouton action | `h-10 w-10 grid place-items-center rounded-2xl border-slate-200 bg-white` |
| Bouton logout | Même pattern, icône LogOut |
| Bouton sync | Icône CloudUpload / RefreshCw (spin si actif) |
| Bouton embeddings | Icône Brain → Pause / Play lorsque en cours + stop circulaire `h-5 w-5` en `-top-1 -right-1` |
| Bannière offline / pending | `border-slate-200 bg-white rounded-xl`, texte `text-xs font-semibold`, bouton si sync dispo |
| Bannière vectorisation | `border-slate-200 bg-white rounded-xl` + barre de progression `h-2 bg-slate-100` |
| Export | Icône Download dans bouton `touch-target` |

### 8.2 Bottom Navigation (AppNavigation)

| Élément | Style |
|---------|-------|
| Conteneur | `fixed bottom-0 left-0 right-0 z-40 px-3 pb-safe` |
| Wrapper | `glass-panel mx-auto max-w-md rounded-[1.75rem] border px-2 py-2 shadow-2xl shadow-stone-900/10` |
| Item actif	Scanner | `text-indigo-600` + fond `bg-indigo-50` sur l'icône |
| Item actif	Scan Rapide | `text-amber-600` + fond `bg-amber-50` |
| Item actif	Gestion Stock | `text-emerald-600` + fond `bg-emerald-50` |
| Item actif	Catégories | `text-indigo-600` + fond `bg-indigo-50` |
| Item inactif | `text-stone-400 hover:text-stone-700` |
| Icon fill active | `<Icon className={`w-6 h-6 ${isActive ? "fill-current" : ""}`} />` |
| Assistant (Julien) | Couleur active = `text-violet-600` + `bg-violet-50` |

### 8.3 Sidebar Desktop (DesktopShell + AdminDesktop)

| Élément | Style |
|---------|-------|
| Aside | `hidden lg:flex lg:w-64 xl:w-72 lg:fixed lg:inset-y-0 lg:left-0 lg:z-30 lg:border-r lg:border-slate-200 lg:bg-white` |
| Brand | Carré `rounded-2xl bg-slate-900 text-white` avec initiales "NS" `font-black` |
| Titre | `text-sm font-extrabold tracking-tight text-slate-900` |
| Sous-label "Admin" | `text-[11px] font-semibold text-slate-500` |
| Séparateur | `h-px bg-slate-200` |
| Nav | Sync avec `SidebarNav` (voir AppNavigation pour la palette active) |

### 8.4 ScanTab

| Élément | Style |
|---------|-------|
| Carte scanner (hardware) | `rounded-3xl bg-slate-900 p-6 lg:p-8 text-white` |
| Icône scanner | `h-14 w-14 rounded-2xl bg-white/15 grid place-items-center` + Scan animate-pulse |
| Titre carte | `text-lg font-bold lg:text-xl` |
| Description | `text-xs text-white/80 lg:text-sm` |
| Champ caméra | `rounded-3xl bg-slate-900 border border-slate-200 shadow-lg` + aspect-video desktop |
| Carte mode input | `rounded-3xl border border-slate-200 bg-white` |
| Carte manual input | `rounded-3xl border-slate-200 bg-white` |
| Loading scanner | Overlay `absolute inset-0 z-10 rounded-3xl bg-white/95 backdrop-blur-md` + pastille `border-slate-200 bg-white px-4 py-2.5` |
| Élément récent scan | `rounded-2xl border border-slate-200 bg-white flex items-center gap-3` |
| Image produit | `h-12 w-12 rounded-xl border border-slate-200` |
| Bouton qty + / − | `h-9 w-9 grid place-items-center` dans `rounded-full border border-slate-200 bg-slate-50` |
| Badge qty faible | `rounded-full bg-amber-50 border-amber-200 text-amber-700` |

### 8.5 AutomaticScanPanel

| Élément | Style |
|---------|-------|
| Container | `rounded-3xl border border-slate-200 bg-white p-4 sm:p-6` |
| Cartouche icône | `h-11 w-11 rounded-2xl border border-slate-200 bg-slate-50` (sm: 14×14) |
| Titre | `text-xl font-bold tracking-tight sm:text-2xl` |
| Badge statut | `rounded-full border border-slate-200 bg-slate-50 px-2 py-0.5 text-[11px] font-semibold text-slate-700` |
| Mode toggle | Sous-composant avec fond activé selon le mode |
| Area scanner | Même conteneur que ScanTab |
| Message inactif | `rounded-2xl border-slate-200 bg-slate-50 text-[11px] font-semibold text-slate-700` |

### 8.6 StockTab

| Élément | Style |
|---------|-------|
| Titre section | `text-xl font-bold text-slate-900` |
| Pastille compteur | `rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-600` |
| Bouton filtre toggle | `h-10 w-10 rounded-xl border border-slate-200 text-slate-500` → actif `border-slate-900 bg-slate-900 text-white` |
| Input recherche | `h-14 rounded-2xl border-slate-200 bg-white pl-12 text-sm font-semibold` |
| QuickFilter chip | `px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold` → actif `bg-indigo-600 text-white border-indigo-600` |
| Catégorie chip | Même pattern QuickFilter, séparateur `border-indigo-200` |
| Bouton stats | `rounded-2xl border border-slate-200 bg-white text-xs font-semibold` |
| StatCard | `rounded-2xl border p-3 min-w-[120px]`, label `text-[9px] uppercase`, valeur `font-mono text-sm font-bold` |
| Full filters | `rounded-2xl border-slate-200 bg-white p-3 grid grid-cols-2 gap-3` |
| Select | `h-11 rounded-xl border-slate-200 bg-white text-sm font-semibold outline-none` |
| Loading state | `py-12 border-dashed border-slate-300 rounded-2xl bg-slate-50/50` + Loader2 |
| Pagination | `p-3 rounded-2xl border-slate-200 bg-white` |
| Bouton page prev/next | `min-h-10 rounded-xl border-slate-200 px-3 text-xs font-semibold` → disabled `opacity-40 cursor-not-allowed` |
| Bouton page active | `border-slate-900 bg-slate-900 text-white` |
| Bouton page inactive | `border-slate-200 bg-white text-slate-600 hover:bg-slate-50` |

### 8.7 InventoryGrid (Carte produit en deux vues)

Vue compacte (dans StockTab par défaut) :

| Élément | Style |
|---------|-------|
| Carte | `rounded-xl border border-stone-200 bg-white px-3 py-3 flex gap-3` |
| Image | `h-12 w-12 rounded-xl border-stone-200 bg-stone-50` |
| Badge stock faible | `h-2.5 w-2.5 rounded-full ring-2 ring-white` positionné absolute sur l'image |
| Titre | `font-bold text-stone-900 truncate lg:text-base` |
| Marque | `text-xs text-stone-500 truncate` |
| Barcode | `font-mono text-[11px] text-stone-400` |
| Badge stock | `inline-flex rounded-full border px-2 py-0.5 text-[10px] font-bold` |
| Qty pill | `rounded-full border border-stone-200 bg-stone-100` |

Vue détaillée (isCompactView = false) :

| Élément | Style |
|---------|-------|
| Carte | `rounded-2xl border border-stone-200 bg-white p-4 shadow-sm hover:shadow-md` |
| Image | `h-14 w-14 rounded-2xl border-stone-200 bg-stone-50` |
| Section métadonnées | `border-t border-stone-100 pt-3 mt-4 flex justify-end` |
| Skeleton du bas | `rounded-xl border border-stone-200 bg-stone-50` pour les contrôles qty |

Swipe behavior :
- Swipe right (delta > 85) → `bg-emerald-100` + icône Plus "Ajouter +1"
- Swipe left (delta < −85) → `bg-rose-100` + icône Trash2 "Supprimer"
- Swipe limité ±120px, `transition-transform duration-200 ease-out` sur lâchement

### 8.8 CategoriesManager

| Élément | Style |
|---------|-------|
| Cartouche header | `rounded-3xl border-slate-200 bg-white p-4 sm:p-6` |
| Icône catégorie | `h-11 w-11 rounded-2xl border-slate-200 bg-slate-100` (sm: 14×14) |
| Badge compteur | `rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-semibold text-slate-900` |
| Bouton nouvelle | `min-h-11 rounded-xl bg-slate-900 text-white text-[10px] font-bold` |
| Formulaire (AnimatePresence) | `rounded-2xl border-slate-200 bg-white` |
| Label formulaire | `text-[9px] font-bold uppercase tracking-wider text-slate-500` |
| Input | `glass-input rounded-xl` |
| Émoji picker | `rounded-xl border-slate-200 bg-white`, item `w-7 h-7 rounded-lg` |
| Badge produit associé | `rounded-lg border-slate-200 bg-white px-2 py-1 font-mono text-[10px] font-bold` |
| Item catégorie | `rounded-xl border-slate-200 bg-white`, sélectionné `borderColor: #6366f1 + boxShadow 3px` |

### 8.9 ManualProductModal

| Élément | Style |
|---------|-------|
| Backdrop | `fixed inset-0 bg-stone-900/40 z-50 backdrop-blur-sm` |
| Conteneur modal | `bg-white rounded-t-[2rem] sm:rounded-[2rem] shadow-2xl shadow-stone-900/25 pb-safe max-h-[92vh]` |
| Handle mobile | `w-12 h-1.5 bg-stone-300 rounded-full` (sticky top, hidden sm) |
| Header modal | Icône carrée `bg-indigo-600 text-white rounded-xl shadow-md shadow-indigo-600/25` |
| Labels | `text-[10px] font-bold uppercase tracking-wider text-stone-500` |
| Inputs | `glass-input rounded-xl h-11` |
| Photo placeholder | `h-28 rounded-2xl border-dashed border-stone-300 bg-stone-50` |
| Photo rendue | `h-28 rounded-2xl border-slate-200 bg-stone-50` avec overlay `bg-stone-900/40` |
| Zone qty | `bg-stone-50 border-stone-200 rounded-2xl` |
| Bouton +/- qty | `w-14 h-14 bg-white border-stone-200 rounded-2xl shadow-sm` |
| Input qty | `text-4xl font-bold font-mono tabular text-stone-900 text-center` |
| Actions bas | "Annuler" translucide slate, "Sauvegarder" `bg-indigo-600 text-white shadow-lg` |

> Les modals QuantityModal, ExportModal, ProductDetailsModal partagent la même structure de bottom-sheet Motion (drag config `velocity > 500 || offset > 150` → fermeture).

### 8.10 QuantityModal (style similaire)

| Élément | Style |
|---------|-------|
| Pastille catégorie | `bg-indigo-50 border-indigo-200 text-indigo-600 px-2 py-0.5 rounded-full text-[10px] font-bold` |
| Mode toggle | `grid grid-cols-2 gap-1 p-1 bg-stone-100 border-stone-200 rounded-2xl` |
| Chip actif | `bg-white text-stone-900 shadow-sm border-stone-200 rounded-xl` |
| Chip inactif | `text-stone-500 hover:text-stone-700` |
| Bouton preset (grille 4) | `rounded-xl border-stone-200 bg-stone-50 font-bold font-mono tabular` |

### 8.11 AuthScreen

| Élément | Style |
|---------|-------|
| Container page | `min-h-screen flex items-center justify-center p-4` |
| Logo | `inline-grid h-14 w-14 rounded-2xl bg-indigo-600 text-white shadow-lg shadow-indigo-600/30` |
| Carte form | `surface-card rounded-[2rem] p-6 max-w-md w-full` |
| Titre form | `text-lg font-bold text-stone-900 mb-2` |
| Label | `text-[10px] font-bold uppercase tracking-wider text-stone-500` |
| Input | `glass-input rounded-xl h-11 pl-10` avec icône absolute gauche |
| Erreur | `border-rose-200 bg-rose-50 px-3.5 py-3 text-xs text-rose-600` + icône AlertTriangle |
| Succès | `border-emerald-200 bg-emerald-50` + point pulse `animate-pulse` |
| Bouton submit | `h-12 bg-indigo-600 text-white rounded-xl text-sm font-bold shadow-lg shadow-indigo-600/25` |

### 8.12 Toast

| Élément | Style |
|---------|-------|
| Backdrop Aucun | Rien, toast flottant |
| Position | `fixed bottom-24 left-1/2` |
| Conteneur | `bg-stone-900 text-white px-4 py-3 rounded-2xl shadow-xl shadow-stone-900/25 ring-1 ring-white/10 z-55` |
| Icône | `CheckCircle2 w-4 h-4 text-emerald-400` |
| Message | `font-semibold text-xs tracking-wide text-stone-50 whitespace-nowrap` |

### 8.13 Scanner Matériel (ManualInput)

| Élément | Style |
|---------|-------|
| Conteneur | `space-y-2` |
| Input | `h-12 rounded-2xl border-slate-200 bg-white px-4 text-sm font-semibold font-mono tabular text-slate-900` |
| Bouton envoyer | `h-12 w-12 grid place-items-center rounded-2xl bg-slate-900 text-white` icône CornerDownLeft |

### 8.14 Scanner Caméra (CameraBarcodeScanner)

Utilise un conteneur `overflow-hidden rounded-3xl border border-slate-200 bg-slate-900`.

---

## 9. États de chargement

- **Loader circulaire** : `Loader2` de `lucide-react`, `animate-spin`, couleur `text-slate-900` dans les cartes claires, `text-white` dans les zones sombres.
- **Pastille chargement scanner** : `border border-slate-200 bg-white px-4 py-2.5 rounded-2xl`, texte `text-xs font-semibold tracking-wider text-slate-900`.
- **État vide (aucun produit)** : `rounded-3xl border-dashed border-stone-300 bg-stone-50/50`, icône Package `text-stone-300`, titre `font-bold text-stone-900 text-sm`, explication `text-xs leading-relaxed text-stone-500`.

---

## 10. État "Nouveau produit"

Badge `inline-flex items-center rounded-full bg-sky-50 border border-sky-200 px-2 py-0.5 text-[9px] font-bold text-sky-700` collé en `absolute` à droite du titre (avec `group` pour hover reveal). Condition : `isRecentTimestamp(item.lastUpdated)` (définie dans `lib/utils.ts`).

---

## 11. Shadow (nuances)

| Classe | Usage |
|--------|-------|
| `shadow-sm` | Cartes légères |
| `shadow-lg` | Boutons marque |
| `shadow-2xl` | Modals |
| `shadow-xl shadow-stone-900/25` | Toast |
| `shadow-indigo-600/30` (ou 25) | Bouton Export, Authentification |

---

## 12. Responsive breakpoints

- **Mobile** : base (< 639 px)
- **sm** : ≥ 640 px (grilles 2 colonnes Catégories, padding accru)
- **lg** : ≥ 1024 px (desktop layout, sidebar visible, `max-w-6xl` sur le contenu)
- **xl** : ≥ 1280 px (sidebar `xl:w-72`)

---

## 13. Checklist de cohérence design (à respecter sur chaque modification)

- [ ] Fond visible = `#ffffff` ou `rgba(255,255,255,…)` ; jamais `stone-100` par défaut
- [ ] Texte principal = `stone-900`, secondaire = `stone-500/400`, jamais direct `gray-*`
- [ ] Bouton primaire = `indigo-600` ou `slate-900`
- [ ] Labels inputs = `text-[10px] font-bold uppercase tracking-wider text-stone-500`
- [ ] Rayon cohérent avec le rôle (voir tableau §3)
- [ ] États disabled respectés (`disabled:opacity-40` ou `disabled:opacity-50`)
- [ ] Feedback tactile : `.tap-active` ou `active:scale-95/0.98`
- [ ] Modal / drawer avec drag-to-dismiss (si modal bottom sheet)
- [ ] `animate-spin` sur les Loader dans tous les états async visibles

---

*Dernière mise à jour : auto-généré depuis l'analyse statique de `src/` — 2026-06-29*
