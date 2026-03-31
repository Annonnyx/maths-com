#!/bin/bash

# Script pour remplacer les anciens champs de rangs par les nouveaux champs de classes françaises
# dans tous les fichiers API

echo "🔄 Mise à jour des champs de rangs vers classes françaises..."

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
)

# Parcourir tous les fichiers TypeScript dans les API
find /Users/Noe/Documents/APp-Maths/maths-com/src/app/api -name "*.ts" | while read file; do
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

echo "✅ Tous les fichiers API ont été mis à jour !"
echo "💡 Pensez à vérifier les imports et les types si nécessaire"
