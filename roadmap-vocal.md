
# Roadmap Assistant Vocal - NeuroStock

> Miroir fonctionnel de `roadmap.md`.  
> Pour les features non vocales (scan, stock, catégories, exports), se référer à `roadmap.md`.

---



## Contexte actuel (vérifié dans le code)

- **Assistant Live** : Gemini Live actif (PCM, duplex, stream audio).
- **UX vocale** : FloatingBubble + GeminiDrawer (open/minimize/mic/stop).
- **Tools** : 8 tools métier exposées à Julien (recherche produit, MAJ stock, CRUD catégorie, export CSV).
- **Sécurité** : confirmation UI explicite pour les actions sensibles.
- **Offline** : les tools passent par `inventorySync` avec file de synchronisation différée.

---



## ✅ Livré

| Feature | Détail |
|---|---|
| Gemini Live connecté | `src/hooks/useGeminiAssistant.ts` |
| Drawer + contrôles | `GeminiDrawer.tsx`, `FloatingBubble.tsx` |
| 8 tools métier | `src/components/GeminiAssistant/tools.ts` |
| Confirmation actions sensibles | `FunctionDispatcher.ts` + modals |
| Bindings offline | réutilisent la pile existante `useOfflineSync` |

---



## TODO — Vocal priorisé

### 1. Historique des interactions vocales

**Pourquoi**: traçabilité, debug, retour utilisateur.  
**Comment**:

- Table Supabase `voice_interactions` (`timestamp`, `command`, `arguments`, `status`, `user_session`)
- Affichage compact dans le drawer (3 dernières commandes)
- Exportable (JSON/CSV)

**Estimation**: 1 jour

---



## 🟡 Backlog vocal (à prioriser selon usage)

| Feature | Description | Estimation |
|---|---|---|
| Scan vocal + contexte | Après un scan matériel, l'assistant garde le barcode en contexte pour "Ajoute 5", "Change le prix à 2.50" | 2j |
| Alertes stock bas vocales | Détection auto (stock <= seuil), rapport vocal court ex: "3 produits en stock bas" | 1j |
| Mode relevé rapide (hands-free) | Activation par phrase clé ou bouton physique ; réponse courte sans ouvrir le drawer | 2j |
| Multilangue FR/EN/AR | Sélection dans le profil + system prompt dynamique + TTS adapté | 1.5j |
| Lots / DLC + alertes | Nouveaux champs + tools `addExpiry` / `listExpiring` + alerte J-7 | 3j |
| Rapprochement inventaire | Mode "Comptage" : dictée "Coca : 15", rapport des écarts vocalisé | 2.5j |
| Commandes batch | "Ajoute 3 Coca et 2 Fanta" → parsing multi-actions + confirmation groupée | 2j |
| Image sans code-barres | Capture photo → Gemini Vision → identification → matching OpenFoodFacts | 3j |
| Suggestions réapprovisionnement | Basé sur `lastMovement` + historique, tool `suggestRestock` | 4j |
| Rapports financiers vocaux | `getStockValue`, `getCategoryStats`, `getMarginEstimate` | 2j |
| Assistant proactif | Rappels planifiés ("Vérifie les DLC des yaourts", "Stock bas Coca") | 3j |
| Feedback vocal | Post-tâche : "Comment ça s'est passé ?" → sentiment → dashboard | 2.5j |
| Templates vocaux | "Réappro provision hebdomadaire Boissons" sauvegardé et réutilisable | 1.5j |
| Import/export Excel | Complète l'export CSV existant | 2j |
| Wearables companion | App companion montre (React Native ou PWA watch) + sync stock | 6j |

---



## 🚧 Dépendances / risques

- API Gemini Live stable (disponibilité + quota).
- OpenRouter embeddings (optionnel, existe un fallback local).
- API caisse et API fournisseurs : à définir avec les prestataires.
- Wearables : nécessite un build séparé (React Native / Expo) → fort impact.

---



## 📊 KPIs vocal

| Métrique | Cible |
|---|---|
| Temps de réponse Live | < 2s |
| Taux de confirmation | > 90% des actions validées |
| Taux de compréhension (tool call) | > 85% |
| Adoption équipe | > 60% des utilisateurs actifs |

---

_Dernière mise à jour : Juin 2026_
