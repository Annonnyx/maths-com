#!/bin/bash

# Script pour remplacer les anciens rangs par les classes françaises dans le frontend
# Components, pages, hooks, etc.

echo "🔄 Mise à jour du frontend pour les classes françaises..."

# Liste des remplacements à faire
declare -A replacements=(
    "soloRankClass|soloClass"
    "soloBestRankClass|soloBestClass" 
    "multiplayerRankClass|multiplayerClass"
    "multiplayerBestRankClass|multiplayerBestClass"
    "getRankFromElo|getClassFromElo"
    "RANK_CLASSES|FRENCH_CLASSES"
    "RANK_THRESHOLDS|FRENCH_CLASS_THRESHOLDS"
    "RANK_COLORS|FRENCH_CLASS_COLORS"
    "RANK_BG_COLORS|FRENCH_CLASS_BG_COLORS"
    "RankClass|FrenchClass"
    "getNextRank|getNextClass"
    "getRankProgress|getClassProgress"
    "getPerformanceTier|getPerformanceTier" # à adapter manuellement
)

# Parcourir tous les fichiers TypeScript/TSX dans le frontend (sauf API)
find /Users/Noe/Documents/APp-Maths/maths-com/src -name "*.ts" -o -name "*.tsx" | grep -v "/api/" | while read file; do
    echo "Traitement de: $file"
    
    # Faire une sauvegarde
    cp "$file" "$file.backup"
    
    # Appliquer tous les remplacements
    for replacement in "${replacements[@]}"; do
        old=$(echo "$replacement" | cut -d'|' -f1)
        new=$(echo "$replacement" | cut -d'|' -f2)
        
        # Remplacer seulement si le fichier contient l'ancien terme
        if grep -q "$old" "$file"; then
            echo "  Remplacement: $old -> $new"
            sed -i '' "s/$old/$new/g" "$file"
        fi
    done
    
    echo "  ✅ $file mis à jour"
done

echo "✅ Tous les fichiers frontend ont été mis à jour !"
echo "💡 Pensez à vérifier:"
echo "   - Les imports des constantes depuis elo.ts"
echo "   - Les types dans les interfaces"
echo "   - Les appels de fonctions utilitaires"
echo "   - Les affichages dans les composants"
