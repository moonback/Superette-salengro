
# Roadmap Assistant Vocal - Superette Salengro

## Context
- **Actuel**: Assistant vocal Gemini Live avec 8 outils métier (recherche, modification, création, suppression, export)
- **Tech stack**: React + Vite + Supabase + Google Gemini Multimodal Live
- **État**: Automatisation activée par défaut, persistence du contexte produit

---

## Priorité 1 - Immediate (S1 - 4 semaines)

### 1. Historique des conversations et commandes vocales
**Description**: Sauvegarde des interactions vocales pour relecture et audit.
**Impact**: Traçabilité des actions, retour utilisateur, debug.
**Implémentation**:
  - Table `voice_interactions` dans Supabase (timestamp, command, result, user_id)
  - Affichage compact dans le drawer (3 dernières actions)
  - Export de l'historique en JSON/CSV
**Priorité**: Haute
**Estimation**: 1 jour

### 2. Intégration scan vocal + barcode
**Description**: Combiner scan hardware et voix pour confirmation/modification rapide.
**Impact**: Gain de temps massif pour les réapprovisionnements.
**Implémentation**:
  - Écoute passive après scan: "Ajoute 5", "Change le prix à 2.50"
  - Liaison automatique du produit scanné au contexte vocal
  - Confirmation haptique + vocale
**Priorité**: Critique
**Estimation**: 2 jours

### 3. Alertes stock bas vocalisées
**Description**: Rappel automatique des produits en rupture ou stock critique.
**Impact**: Réduction des ruptures, meilleure gestion du stock.
**Implémentation**:
  - Détection automatique au démarrage (stock &lt;= 5)
  - Rapport vocal: "3 produits en stock bas : Coca (3), Fanta (2), Sprite (1)"
  - Tool `listLowStock` dédié
**Priorité**: Haute
**Estimation**: 1 jour

### 4. Mode "Relevé rapide" (hands-free)
**Description**: Mode scan vocal mains-libres pour les inventaires physiques.
**Impact**: Productivité ×2 pour les inventaires.
**Implémentation**:
  - Activation par phrase clé ("Hey Julien") ou bouton physique
  - Réponse rapide sans ouverture du drawer
  - Répétition auto de la confirmation
**Priorité**: Haute
**Estimation**: 2 jours

### 5. Multilangue (FR/EN/AR)
**Description**: Support de plusieurs langues pour les équipes multiculturelles.
**Impact**: Accessibilité élargie.
**Implémentation**:
  - Persistance du choix de langue dans le profil utilisateur
  - Mise à jour du system prompt dynamique
  - Traduction des réponses vocales
**Priorité**: Moyenne
**Estimation**: 1.5 jours

---

## Priorité 2 - Court terme (S2 - 8 semaines)

### 6. Gestion des lots et dates de péremption
**Description**: Ajout de champs pour suivi des DLC et numéros de lot.
**Impact**: Conformité alimentaire, réduction du gaspillage.
**Implémentation**:
  - Nouveaux champs dans `inventory_items` (expiry_date, lot_number)
  - Tools `addExpiry`, `listExpiringProducts`
  - Alertes vocales 7 jours avant DLC
**Priorité**: Haute
**Estimation**: 3 jours

### 7. Rapprochement inventaire physique vs digital
**Description**: Comparaison automatique entre comptage vocal et stock enregistré.
**Impact**: Fiabilité des données ×10.
**Implémentation**:
  - Mode "Comptage" : "Coca : 15", "Fanta : 8"
  - Rapport des écarts vocalisé
  - Tool `reconcileInventory`
**Priorité**: Haute
**Estimation**: 2.5 jours

### 8. Gestion multi-utilisateurs et droits
**Description**: Contrôle d'accès aux outils sensibles.
**Impact**: Sécurité renforcée.
**Implémentation**:
  - Rôles (admin/manager/employé)
  - Restriction des outils (ex: suppression uniquement admin)
  - Historique lié à l'utilisateur
**Priorité**: Moyenne
**Estimation**: 2 jours

### 9. Commandes groupées ("Batch")
**Description**: Exécution de plusieurs actions en une commande.
**Impact**: Productivité ×3.
**Implémentation**:
  - Ex: "Ajoute 3 Coca et 2 Fanta et change le prix de Sprite à 1.90"
  - Parsing multi-actions
  - Confirmation groupée
**Priorité**: Moyenne
**Estimation**: 2 jours

### 10. Reconnaissance d'image (produits sans barcode)
**Description**: Utiliser Gemini Vision pour identifier des produits via caméra.
**Impact**: Gestion des produits sans code-barres.
**Implémentation**:
  - Intégration de la modalité vidéo/image
  - Tool `identifyProductFromImage`
  - Matching avec OpenFoodFacts
**Priorité**: Moyenne
**Estimation**: 3 jours

---

## Priorité 3 - Moyen terme (S3 - 12 semaines)

### 11. Suggestions de réapprovisionnement intelligentes
**Description**: AI propose des quantités à réapprovisionner selon l'historique.
**Impact**: Optimisation du stock, réduction des surstocks.
**Implémentation**:
  - Table `sales_history` pour tracking des ventes
  - Calcul des tendances (semaine/mois)
  - Tool `suggestRestock`
**Priorité**: Moyenne
**Estimation**: 4 jours

### 12. Intégration caisse/enregistreur
**Description**: Synchronisation avec le système de caisse pour ventes en temps réel.
**Impact**: Stock toujours à jour automatiquement.
**Implémentation**:
  - Webhook ou polling depuis la caisse
  - Déduction auto du stock à la vente
  - Tool `recordSale`
**Priorité**: Haute
**Estimation**: 5 jours (dépend de l'API caisse)

### 13. Rapports financiers vocaux
**Description**: Bilans rapides vocalisés.
**Impact**: Prise de décision plus rapide.
**Implémentation**:
  - "Quel est mon stock total ?"
  - "Quelle est ma marge potentielle ?"
  - "Combien ai-je de produits dans Boissons ?"
  - Tools `getFinancialStats`, `getCategoryStats`
**Priorité**: Moyenne
**Estimation**: 2 jours

### 14. Mode offline complet
**Description**: Assistant vocal fonctionnel sans connexion.
**Impact**: Fiabilité totale, même sans internet.
**Implémentation**:
  - Modèle de voix local (ex: Whisper)
  - Stockage des commandes offline
  - Synchronisation au rétablissement
**Priorité**: Moyenne
**Estimation**: 4 jours

### 15. Templates de tâches récurrentes
**Description**: Sauvegarde et réutilisation de commandes fréquentes.
**Impact**: Économie de temps répétable.
**Implémentation**:
  - "Réapprovisionnement hebdomadaire Boissons"
  - Stockage des templates
  - Exécution en une commande vocale
**Priorité**: Basse
**Estimation**: 1.5 jours

---

## Priorité 4 - Long terme (S4 - 16 semaines)

### 16. Assistant proactif (notifications push)
**Description**: Notifications vocales intelligentes sans sollicitation.
**Impact**: Anticipation des besoins.
**Implémentation**:
  - "N'oublie pas de vérifier les DLC des yaourts"
  - "Le stock de Coca est à 3, pense à réapprovisionner"
  - Planification des rappels
**Priorité**: Moyenne
**Estimation**: 3 jours

### 17. Analyse sentimentale et feedback
**Description**: Collecte et analyse du feedback vocal.
**Impact**: Amélioration continue.
**Implémentation**:
  - "Comment ça s'est passé ?" après grosse tâche
  - Analyse du ton (satisfait/frustré)
  - Dashboard de feedback
**Priorité**: Basse
**Estimation**: 2.5 jours

### 18. Intégration fournisseurs
**Description**: Commander automatiquement auprès des fournisseurs.
**Impact**: Réapprovisionnement en 1 clic vocal.
**Implémentation**:
  - Catalogue fournisseurs
  - Tool `placeSupplierOrder`
  - Suivi des commandes
**Priorité**: Basse
**Estimation**: 5 jours (dépend des API fournisseurs)

### 19. Simulation et scénarios ("What if")
**Description**: Test d'impact des modifications avant application.
**Impact**: Réduction des erreurs.
**Implémentation**:
  - "Si j'augmente le prix de Coca de 10%, quelle est la marge ?"
  - Mode simulation sans modification du réel
  - Validation vocale avant application
**Priorité**: Basse
**Estimation**: 3 jours

### 20. Assistant vocal en wearables (Apple Watch/Android Wear)
**Description**: Application companion pour montres connectées.
**Impact**: Liberté de mouvement totale.
**Implémentation**:
  - App react-native companion
  - Sync avec le stock
  - Interface réduite pour petits écrans
**Priorité**: Basse
**Estimation**: 6 jours

---

## KPIs de succès

| Métrique | Cible |
|----------|-------|
| Utilisation quotidienne | &gt; 75% des employés |
| Temps par inventaire | -50% |
| Erreurs de saisie | -80% |
| Satisfaction utilisateur | &gt; 4.5/5 |
| Temps de réponse vocal | &lt; 2s |

---

## Dépendances techniques

- API Gemini Live stable
- Whisper (pour offline)
- API caisse (si existante)
- API fournisseurs (si existantes)
