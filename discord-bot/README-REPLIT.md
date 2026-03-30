# 🤖 Maths-App Discord Bot - Replit

## 🚀 Déploiement sur Replit

### 1. Importer le projet
- Va sur [Replit.com](https://replit.com)
- Clique sur "Import from GitHub"
- Entre le repo URL : `https://github.com/Annonnyx/maths-com.git`
- Sélectionne le dossier `discord-bot`

### 2. Configurer les variables d'environnement
Dans la barre latérale gauche, clique sur "Secrets" (icône 🔐) et ajoute :

```
DISCORD_TOKEN=TON_DISCORD_TOKEN_ICI
DISCORD_CLIENT_ID=TON_CLIENT_ID_ICI
DISCORD_GUILD_ID=TON_GUILD_ID_ICI
API_SECRET=TON_API_SECRET_ICI
DATABASE_URL=TA_DATABASE_URL_ICI
SUPABASE_URL=TA_SUPABASE_URL_ICI
SUPABASE_SERVICE_KEY=TA_SUPABASE_SERVICE_KEY_ICI
WEBSITE_URL=https://maths-app.com
WEBSITE_API_URL=https://maths-app.com/api
API_PORT=3010
NODE_ENV=production
```

### 3. Lancer le bot
- Clique sur le bouton "Run" (▶️) en haut
- Le bot va s'installer et démarrer automatiquement
- Tu verras les logs dans la console

### 4. Activer "Always On"
- Une fois le bot démarré, va dans les paramètres du Repl
- Clique sur "Always On" pour garder le bot actif 24/7 (gratuit pour les bots Discord)

## 📋 Commandes disponibles
- `/link` - Lier son compte Discord
- `/unlink` - Délier son compte
- `/rank` - Voir son classement
- `/leaderboard` - Voir le classement général
- `/ticket` - Créer un ticket de support
- `/close-ticket` - Fermer un ticket (admin)

## 🔧 Maintenance
- Les logs sont visibles en temps réel dans la console Replit
- Pour redémarrer le bot : Stop → Run
- Pour mettre à jour : Pull changes → Run

## ✅ Vérification
Le bot est opérationnel quand tu vois :
```
✅ Bot connecté en tant que Maths-app.com#1011
🎯 Bot pleinement opérationnel et monitoré !
```
