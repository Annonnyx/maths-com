# Discord Integration - Configuration du site

Ajoutez ces variables à votre fichier `.env` principal du site :

```env
# Discord Bot Integration
DISCORD_BOT_API_URL=http://localhost:3001
DISCORD_BOT_SECRET=votre_secret_commun_avec_le_bot

# IDs des salons Discord (pour le panel admin)
NEXT_PUBLIC_DISCORD_GENERAL_CHANNEL=xxxxxxxxxxxxxxxxxxx
NEXT_PUBLIC_DISCORD_ANNOUNCEMENTS_CHANNEL=xxxxxxxxxxxxxxxxxxx
NEXT_PUBLIC_DISCORD_LEADERBOARD_CHANNEL=xxxxxxxxxxxxxxxxxxx
```

## Instructions d'installation

### 1. Installer et lancer le bot Discord

```bash
cd discord-bot
npm install
npm run build
npm start
```

Pour le développement :
```bash
npm run dev
```

### 2. Mettre à jour la base de données

Après avoir ajouté les champs Discord au schema Prisma :

```bash
npx prisma migrate dev --name add_discord_fields
npx prisma generate
```

### 3. Configurer le serveur Discord

1. Créez un serveur Discord suivant le template dans `discord-bot/SERVER_TEMPLATE.md`
2. Créez un bot sur https://discord.com/developers/applications
3. Copiez le token et client ID
4. Configurez les variables d'environnement dans `discord-bot/.env`

### 4. Lancer le site avec l'intégration Discord

Le site communiquera automatiquement avec le bot via l'API.

## Fonctionnalités disponibles

### Pour les utilisateurs
- Lier son compte Discord via `/link` sur Discord
- Voir son classement avec `/rank`
- Consulter le top 10 avec `/leaderboard`
- Créer des tickets de support avec `/ticket`

### Pour les admins
- Panel admin complet sur `/admin/discord`
- Envoi de messages dans les salons Discord
- Publication manuelle des classements
- Réponse aux tickets depuis le panel

### Automatique
- Classements mensuels publiés le 1er de chaque mois
- Attribution des rôles de classement (Top 1, Top 10)
- Attribution des rôles de badges
- Système de tickets synchronisé

## Architecture

```
┌─────────────────┐      API REST      ┌─────────────────┐
│   Site Web      │ ◄────────────────► │   Bot Discord   │
│  (Next.js)      │   (Bearer Token)   │  (Discord.js)   │
└─────────────────┘                    └─────────────────┘
       │                                      │
       │ Prisma                             │ Discord API
       ▼                                      ▼
┌─────────────────┐                    ┌─────────────────┐
│   Database      │                      │   Discord       │
│   (PostgreSQL)  │                      │   Server        │
└─────────────────┘                      └─────────────────┘
```

## Endpoints API du bot

- `POST /api/verify-link` - Vérifier un code de liaison
- `POST /api/send-message` - Envoyer un message
- `POST /api/publish-leaderboard` - Publier le classement
- `POST /api/ticket/create` - Créer un ticket
- `POST /api/ticket/reply` - Répondre à un ticket
- `GET /api/status` - Statut du bot

## Commandes Discord disponibles

| Commande | Description |
|----------|-------------|
| `/link` | Génère un code pour lier le compte |
| `/rank [utilisateur]` | Affiche le classement |
| `/leaderboard [type]` | Top 10 solo ou multi |
| `/ticket` | Crée un ticket support |
| `/unlink` | Délie le compte |

## Sécurité

- Toutes les communications entre le site et le bot sont authentifiées avec un Bearer Token
- Les codes de liaison expirent après 10 minutes
- Les tickets créent des salons privés avec permissions restrictives
- Les rôles ne peuvent être attribués que par le bot
