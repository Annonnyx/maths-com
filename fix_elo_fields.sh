#!/bin/bash

# SCRIPT DE CORRECTION AUTOMATIQUE DES CHAMPS ELO/RANK

echo "🔧 Correction automatique des champs elo/rankClass..."

# Remplacer tous les elo par soloElo dans les fichiers API
find /Users/Noe/Documents/APp-Maths/maths-com/src/app/api -name "*.ts" -type f -exec sed -i '' 's/\belo\b/soloElo/g' {} \;

# Remplacer tous les rankClass par soloRankClass dans les fichiers API  
find /Users/Noe/Documents/APp-Maths/maths-com/src/app/api -name "*.ts" -type f -exec sed -i '' 's/\brankClass\b/soloRankClass/g' {} \;

# Remplacer tous les bestElo par soloBestElo
find /Users/Noe/Documents/APp-Maths/maths-com/src/app/api -name "*.ts" -type f -exec sed -i '' 's/\bbestElo\b/soloBestElo/g' {} \;

# Remplacer tous les bestRankClass par soloBestRankClass
find /Users/Noe/Documents/APp-Maths/maths-com/src/app/api -name "*.ts" -type f -exec sed -i '' 's/\bbestRankClass\b/soloBestRankClass/g' {} \;

# Remplacer tous les currentStreak par soloCurrentStreak
find /Users/Noe/Documents/APp-Maths/maths-com/src/app/api -name "*.ts" -type f -exec sed -i '' 's/\bcurrentStreak\b/soloCurrentStreak/g' {} \;

# Remplacer tous les bestStreak par soloBestStreak
find /Users/Noe/Documents/APp-Maths/maths-com/src/app/api -name "*.ts" -type f -exec sed -i '' 's/\bbestStreak\b/soloBestStreak/g' {} \;

# Remplacer statistics par soloStatistics
find /Users/Noe/Documents/APp-Maths/maths-com/src/app/api -name "*.ts" -type f -exec sed -i '' 's/\bstatistics\b/soloStatistics/g' {} \;

# Remplacer test par soloTest
find /Users/Noe/Documents/APp-Maths/maths-com/src/app/api -name "*.ts" -type f -exec sed -i '' 's/\btest\b/soloTest/g' {} \;

# Remplacer question par soloQuestion
find /Users/Noe/Documents/APp-Maths/maths-com/src/app/api -name "*.ts" -type f -exec sed -i '' 's/\bquestion\b/soloQuestion/g' {} \;

echo "✅ Corrections appliquées !"
echo "🔄 Lancement du build..."

cd /Users/Noe/Documents/APp-Maths/maths-com
npm run build
