# Bot Discord Maths-App.com 🤖

Bot officiel de la communauté Maths-App.com avec gestion des classements, tickets, rôles automatiques et plus.

## 🚀 Fonctionnalités

- 📊 **Classements mensuels** auto (top solo/multi + attribution des rôles)
- 🎫 **Système de tickets** lié au panel admin du site
- 🏆 **Rôles par badge** (liaison compte Discord sans auth obligatoire)
- 💬 **Envoi de messages** depuis le panel admin
- 🔗 **Liaison compte** Discord via code de vérification

## 📁 Structure

```
discord-bot/
├── src/
│   ├── index.ts              # Point d'entrée
│   ├── client.ts             # Client Discord configuré
│   ├── config.ts             # Configuration (IDs, tokens)
│   ├── api/                  # Serveur Express pour communiquer avec le site
│   │   └── server.ts
│   ├── commands/             # Commandes slash
│   │   ├── link.ts           # /link - Lier son compte
│   │   ├── rank.ts           # /rank - Voir son classement
│   │   ├── leaderboard.ts    # /leaderboard - Classement
│   │   └── ticket.ts         # /ticket - Créer un ticket
│   ├── events/               # Events handlers
│   │   ├── ready.ts
│   │   ├── interactionCreate.ts
│   │   └── messageCreate.ts
│   ├── handlers/             # Logique métier
│   │   ├── roleManager.ts    # Gestion des rôles
│   │   ├── ticketManager.ts  # Gestion des tickets
│   │   └── leaderboard.ts    # Classements mensuels
│   └── utils/                # Utilitaires
│       ├── database.ts       # Connexion à la DB du site
│       └── embeds.ts         # Templates d'embeds
├── dist/                     # Code compilé
├── .env.example
├── package.json
└── tsconfig.json
```

## ⚙️ Configuration

1. **Variables d'environnement** (`.env`):
```env
# Discord
DISCORD_TOKEN=votre_token_bot
DISCORD_CLIENT_ID=votre_client_id
DISCORD_GUILD_ID=id_du_serveur

# API Interne (communication site ↔ bot)
API_SECRET=secret_pour_authentifier_les_requetes
API_PORT=3001

# Base de données (même que le site)
DATABASE_URL=votre_url_database

# IDs des salons Discord
LEADERBOARD_CHANNEL_ID=xxx
TICKET_CATEGORY_ID=xxx
TICKET_LOG_CHANNEL_ID=xxx
ANNOUNCEMENTS_CHANNEL_ID=xxx

# IDs des rôles
ROLE_TOP1_SOLO=xxx
ROLE_TOP1_MULTI=xxx
ROLE_TOP10_SOLO=xxx
ROLE_TOP10_MULTI=xxx
```

2. **Installation**:
```bash
cd discord-bot
npm install
npm run build
npm start
```

3. **Développement**:
```bash
npm run dev  # Mode watch avec tsx
```

## 🔗 Liaison avec le site

Le bot expose une API REST sur le port configuré pour recevoir les commandes du panel admin :

- `POST /api/send-message` - Envoyer un message dans un salon
- `POST /api/announcement` - Publier une annonce
- `GET /api/leaderboard` - Récupérer le classement pour publication
- `POST /api/ticket/reply` - Répondre à un ticket depuis le panel
- `POST /api/user/refresh-roles` - Forcer le refresh des rôles d'un utilisateur

## 🎮 Commandes Discord

| Commande | Description |
|----------|-------------|
| `/link` | Lier son compte Maths-App (génère un code) |
| `/rank [utilisateur]` | Voir son classement ELO |
| `/leaderboard [solo|multi]` | Afficher le classement |
| `/ticket [sujet]` | Créer un ticket support |
| `/unlink` | Délier son compte |

## 📝 Notes pour l'admin

Les IDs Discord nécessaires (à récupérer avec le mode développeur activé) :
- Guild ID (serveur)
- Channel IDs (salons classement, tickets, annonces)
- Role IDs (rôles top 1, top 10, badges)

Pour créer le bot : https://discord.com/developers/applications
