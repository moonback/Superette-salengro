# 🛣️ Roadmap — NeuroStock

> Statuts : **TODO** | **EN COURS** | **✅ FAIT**

---

## Vue d'ensemble

- **v0.x** — MVP inventaire PWA (scan, stock, sync, export, assistant vocal)
- **v1.0** — Authentification sécurisée, multi-utilisateur, rôles
- **v1.1** — Intégrations externes (caisse, fournisseurs)
- **v1.2+** — Automatisation avancée, IA prédictive

---



## ✅ v0.x — MVP livré (fondations)

| Feature | Statut | Notes |
|---|---|---|
| Scan code-barres (USB/BT) | ✅ | `useHardwareScanner` / capture globale |
| Lookup OpenFoodFacts | ✅ | `src/api.ts` v0 + v2 |
| Création produit manuelle | ✅ | `ManualProductModal` |
| Ajustement quantité + modale choix | ✅ | `QuantityModal`, `ScanChoiceModal` |
| Vue stock + filtres/tri | ✅ | `StockTab`, `CategoryFilterModal` |
| Vue compact / détaillé | ✅ | `InventoryGrid` modes |
| Export CSV | ✅ | `ExportModal` + `supabaseRest` |
| Export PDF | ✅ | `ExportPDFButton` / jspdf |
| Synchronisation Supabase | ✅ | `inventorySync.ts`, `supabaseInventory.ts` |
| Mode hors-ligne + queue | ✅ | `offlineDb.ts`, `useOfflineSync` |
| Realtime (last-write-wins) | ✅ | `useSupabaseRealtime.ts` |
| Gestion catégories CRUD | ✅ | `CategoriesManager`, `supabaseCategories.ts` |
| Auto-catégorisation | ✅ | `autoCategorization.ts` (OFF) |
| Recherche sémantique | ✅ | `embeddingService.ts` (OpenRouter + fallback) |
| Assistant vocal "Julien" | ✅ | Gemini Live + tools métiers |
| Contrôle embedding batch | ✅ | Header : start/pause/stop + progression |
| PWA installable | ✅ | manifest + Vite PWA ready |
| Interface mobile-first | ✅ | Tailwind v4 + glassmorphism + haptiques |

---



## 🔜 v1.0 — Authentification & collaboration

| Feature | Statut | Priorité | Estimation |
|---|---|---|---|
| Auth email/mot de passe | TODO | Critique | 3j |
| Rôles (admin / employé) | TODO | Haute | 2j |
| RLS policies authentifiées | TODO | Haute | 1j |
| Historique des modifications | TODO | Moyenne | 2j |
| Invitations équipe | TODO | Basse | 2j |

---



## 🔜 v1.1 — Intégrations externes

| Feature | Statut | Priorité | Estimation |
|---|---|---|---|
| API caisse (webhook/polling) | TODO | Haute | 5j |
| API fournisseurs | TODO | Basse | 5j |
| Intégration fournisseurs auto | TODO | Basse | 3j |
| Import Excel / CSV | TODO | Moyenne | 2j |

---



## 🔜 v1.2+ — IA & automatisation

| Feature | Statut | Priorité | Estimation |
|---|---|---|---|
| Relevé rapide mains-libres | TODO | Haute | 2j |
| Alertes stock bas vocales | TODO | Haute | 1j |
| Lots / DLC + alertes | TODO | Haute | 3j |
| Reconnaissance image (produits sans code-barres) | TODO | Moyenne | 3j |
| Commandes vocales batch | TODO | Moyenne | 2j |
| Suggestions de réapprovisionnement | TODO | Moyenne | 4j |
| Rapports financiers vocaux | TODO | Moyenne | 2j |
| Analyse sentimentale + feedback | TODO | Basse | 2.5j |
| Simulation "What if" | TODO | Basse | 3j |
| Wearables (Apple Watch / Wear OS) | TODO | Basse | 6j |
| Mode offline complet (Whisper local) | TODO | Moyenne | 4j |

---



## ✅ v0.x — Roadmap vocal livré

| Feature vocal | Statut | Notes |
|---|---|---|
| Gemini Live (PCM 16kHz duplex) | ✅ | `GeminiLiveSession`, `AudioManager` |
| Tools métiers (8) | ✅ | recherche, MAJ stock, CRUD catégorie, export CSV |
| Drawer + FloatingBubble | ✅ | Ouvre / minimise / mic on-off / stop |
| Système de confirmation | ✅ | Actions sensibles bloquées sans confirmation UI |
| Historique vocal persistant | TODO | — |

---

_MAJ : Juin 2026_
