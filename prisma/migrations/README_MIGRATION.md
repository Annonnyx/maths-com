# Migration Rangs → Classes Françaises

## 📋 Description

Cette migration convertit le système de rangs `F-, F, F+, E-, E, E+, D-, D, D+, C-, C, C+, B-, B, B+, A-, A, A+, S-, S, S+` vers le système de classes françaises `CP, CE1, CE2, CM1, CM2, 6e, 5e, 4e, 3e, 2de, 1re, Tle, Sup1, Sup2, Sup3, Pro`.

## 🔄 Mapping de conversion

| Rang ancien | Classe française | Plage ELO approximative |
|-------------|------------------|------------------------|
| F-, F       | CP               | 0-599                  |
| F+          | CE1              | 500-749                |
| E-, E       | CE2              | 600-874                |
| E+          | CM1              | 750-999                |
| D-, D       | CM2              | 900-1199               |
| D+          | 6e               | 1100-1399              |
| C-, C       | 5e               | 1200-1699              |
| C+          | 4e               | 1400-1899              |
| B-, B       | 3e               | 1500-2099              |
| B+          | 2de              | 1700-2399              |
| A-, A       | 1re              | 1800-2699              |
| A+          | Tle              | 2000-2999              |
| S-          | Sup1             | 2100-3249              |
| S           | Sup2             | 2250-3749              |
| S+          | Sup3             | 2500+                 |
| Pro         | Pro              | 3750+                  |

## 🗄️ Nouveaux champs ajoutés

### Mode Solo
- `solo_class` : Classe actuelle basée sur l'ELO solo
- `solo_best_class` : Meilleure classe jamais atteinte en solo

### Mode Multiplayer  
- `multiplayer_class` : Classe actuelle basée sur l'ELO multiplayer
- `multiplayer_best_class` : Meilleure classe jamais atteinte en multiplayer

## 📊 Étapes de la migration

1. **Ajout des nouveaux champs** avec valeurs par défaut
2. **Conversion des rangs existants** via fonction de mapping
3. **Recalcul basé sur l'ELO** pour plus de précision
4. **Création d'index** pour optimiser les performances
5. **Ajout de contraintes CHECK** pour valider les valeurs
6. **Rapport de migration** avec statistiques

## ⚠️ Notes importantes

- Les anciens champs sont conservés temporairement (commentés dans la migration)
- La conversion se base d'abord sur le rang existant, puis sur l'ELO pour plus de précision
- Des contraintes CHECK empêchent les valeurs invalides
- La migration est réversible grâce aux fonctions de conversion

## 🚀 Exécution

```bash
# Exécuter la migration
psql $DATABASE_URL -f migrate_ranks_to_french_classes.sql

# Vérifier le résultat
psql $DATABASE_URL -c "SELECT solo_rank_class, solo_class, solo_elo FROM auth.users LIMIT 10;"
```

## ✅ Validation post-migration

```sql
-- Vérifier que tous les utilisateurs ont une classe
SELECT COUNT(*) as total_users, 
       COUNT(CASE WHEN solo_class IS NOT NULL THEN 1 END) as users_with_class
FROM auth.users;

-- Vérifier la distribution des classes
SELECT solo_class, COUNT(*) as user_count
FROM auth.users 
GROUP BY solo_class 
ORDER BY user_count DESC;
```

## 🔄 Rollback (si nécessaire)

```sql
-- Restaurer les anciens champs (si jamais supprimés)
ALTER TABLE auth.users 
DROP COLUMN IF EXISTS solo_class,
DROP COLUMN IF EXISTS solo_best_class,
DROP COLUMN IF EXISTS multiplayer_class,
DROP COLUMN IF EXISTS multiplayer_best_class;
```
