# 🎮 Template Serveur Discord Maths-App.com

Structure complète du serveur Discord avec tous les salons, rôles et permissions nécessaires.

## 📋 Sommaire

- [Structure des catégories](#structure-des-catégories)
- [Liste des salons](#liste-des-salons)
- [Rôles et hiérarchie](#rôles-et-hiérarchie)
- [Permissions](#permissions)
- [Configuration du bot](#configuration-du-bot)

---

## 🏗️ Structure des catégories

```
📁 **INFORMATION**
   ├── 📢 annonces
   ├── 📋 règlement
   ├── 🎉 nouveautés
   └── 🔗 liens-importants

📁 **COMMUNAUTÉ**
   ├── 💬 général
   ├── 🎮 discussion-jeux
   ├── 🎓 entraide-maths
   └── 🎨 créations

📁 **CLASSEMENTS**
   ├── 🏆 top-solo-mensuel
   ├── ⚔️ top-multi-mensuel
   ├── 📊 stats-globales
   └── 🎯 mes-scores

📁 **COMPÉTITION**
   ├── 🔥 tournois-en-cours
   ├── 📅 calendrier-events
   ├── 🏅 défis-quotidiens
   └── 💪 entraînements

📁 **TICKETS & SUPPORT**
   ├── 🎫 créer-ticket
   ├── ❓ questions-fréquentes
   └── 📞 support

📁 **VOIX**
   ├── 🔊 Salon Général 1
   ├── 🔊 Salon Général 2
   ├── 🔇 Solo Focus
   └── 🎮 Squad Mathématique

📁 **STAFF** (Caché aux membres)
   ├── 🔒 modération
   ├── 🔒 logs-messages
   ├── 🔒 logs-membres
   └── 🔒 réunion-staff

📁 **TICKETS ACTIFS** (Caché - créés dynamiquement)
   └── 🎫 ticket-utilisateur-xxx (salons privés)
```

---

## 📱 Liste détaillée des salons

### 📁 INFORMATION
| Salon | Type | Description |
|-------|------|-------------|
| `📢 annonces` | Texte | Annonces officielles du site et du serveur |
| `📋 règlement` | Texte | Règles du serveur (lecture seule) |
| `🎉 nouveautés` | Texte | Mises à jour du site et nouvelles fonctionnalités |
| `🔗 liens-importants` | Texte | Liens vers le site, doc, réseaux sociaux |

### 📁 COMMUNAUTÉ
| Salon | Type | Description |
|-------|------|-------------|
| `💬 général` | Texte | Discussion libre |
| `🎮 discussion-jeux` | Texte | Parlons maths et stratégies ! |
| `🎓 entraide-maths` | Texte | Aide aux devoirs et explications |
| `🎨 créations` | Texte | Partage de contenu mathématique créatif |

### 📁 CLASSEMENTS
| Salon | Type | Description |
|-------|------|-------------|
| `🏆 top-solo-mensuel` | Texte | Classement solo auto-publié par le bot |
| `⚔️ top-multi-mensuel` | Texte | Classement multijoueur auto-publié |
| `📊 stats-globales` | Texte | Statistiques du serveur |
| `🎯 mes-scores` | Texte | Commande !rank pour voir ses stats |

### 📁 COMPÉTITION
| Salon | Type | Description |
|-------|------|-------------|
| `🔥 tournois-en-cours` | Texte | Annonces de tournois en cours |
| `📅 calendrier-events` | Texte | Planning des événements à venir |
| `🏅 défis-quotidiens` | Texte | Défi du jour, challenge communautaire |
| `💪 entraînements` | Texte | Sessions d'entraînement groupées |

### 📁 TICKETS & SUPPORT
| Salon | Type | Description |
|-------|------|-------------|
| `🎫 créer-ticket` | Texte | Instructions + bouton pour créer un ticket |
| `❓ questions-fréquentes` | Texte | FAQ du site et du serveur |
| `📞 support` | Texte | Support général non-privé |

### 📁 VOIX
| Salon | Type | Limite | Description |
|-------|------|--------|-------------|
| `🔊 Salon Général 1` | Vocal | Illimité | Discussions libres |
| `🔊 Salon Général 2` | Vocal | Illimité | Discussions libres (overflow) |
| `🔇 Solo Focus` | Vocal | 1 personne | Mode concentré solo |
| `🎮 Squad Mathématique` | Vocal | 5 personnes | Petits groupes d'entraînement |

---

## 👑 Rôles et hiérarchie

### Rôles Staff (Haut de la hiérarchie)

| Rôle | Couleur | Permissions | Description |
|------|---------|-------------|-------------|
| `👑 Fondateur` | #ff0000 | Tout | Créateur du serveur |
| `🔧 Administrateur` | #ff4444 | Tout sauf propriété | Admins du site |
| `👮‍♂️ Modérateur` | #00ff00 | Modération | Gère le chat et les tickets |
| `💼 Support` | #00ccff | Tickets uniquement | Répond aux tickets |
| `🤖 Bot` | #7289da | API + gestion rôles | Bot officiel |

### Rôles Classement (Mensuel - Auto-attribués par le bot)

| Rôle | Couleur | Condition | Badge |
|------|---------|-----------|-------|
| `👑 Top 1 Solo` | #ffd700 | 1er du mois en solo | 🥇 |
| `👑 Top 1 Multi` | #ffd700 | 1er du mois en multi | 🥇 |
| `🏆 Top 10 Solo` | #c0c0c0 | Top 10 mensuel solo | 🥈 |
| `🏆 Top 10 Multi` | #c0c0c0 | Top 10 mensuel multi | 🥈 |

### Rôles Badges (Auto-attribués par le bot)

| Rôle | Couleur | Condition d'obtention |
|------|---------|----------------------|
| `🔥 Série 7j` | #ff6600 | Streak de 7 jours |
| `🔥🔥 Série 30j` | #ff4400 | Streak de 30 jours |
| `🔥🔥🔥 Série 100j` | #ff0000 | Streak de 100 jours |
| `💯 Score Parfait` | #ff00ff | 20/20 en test |
| `📈 ELO 1000` | #00ff00 | Atteindre 1000 ELO |
| `📈📈 ELO 1500` | #00ccff | Atteindre 1500 ELO |
| `📈📈📈 ELO 2000` | #ff00ff | Atteindre 2000 ELO |
| `⚔️ 100 Parties` | #8844ff | 100 parties multi |
| `🏅 50 Victoires` | #ffaa00 | 50 victoires multi |
| `👑 Champion` | #ffd700 | Top 1 all-time |
| `🎖️ Vétéran` | #888888 | 1 an sur le site |

### Rôles Niveau (Progression)

| Rôle | Couleur | Condition |
|------|---------|-----------|
| `🌱 Débutant` | #88cc88 | 0-500 ELO |
| `🌿 Intermédiaire` | #44aa44 | 500-1000 ELO |
| `🌳 Avancé` | #228822 | 1000-1500 ELO |
| `⭐ Expert` | #1166cc | 1500-2000 ELO |
| `🌟 Maître` | #6600cc | 2000-2500 ELO |
| `💫 Légende` | #ff00ff | 2500+ ELO |

### Rôles Spéciaux

| Rôle | Couleur | Description |
|------|---------|-------------|
| `🎓 Professeur` | #ff8800 | Pédagogues vérifiés |
| `🎯 Bêta Testeur` | #8800ff | Accès aux features en beta |
| `💎 Premium` | #00ffff | Membres premium |
| `🎉 Nitro Booster` | #ff66aa | Boosteurs du serveur |
| `👋 Nouveau` | #aaaaaa | Membres récents (< 7 jours) |

---

## 🔐 Permissions détaillées

### Catégorie STAFF (Permissions par défaut: ❌ pour @everyone)

| Salon | @everyone | Modérateur | Admin |
|-------|-----------|------------|-------|
| `modération` | ❌ | ✅ | ✅ |
| `logs-*` | ❌ | ✅ | ✅ |
| `réunion-staff` | ❌ | ✅ | ✅ |

### Salon 🔒 créer-ticket
```
@everyone:
  - Voir le salon: ✅
  - Envoyer des messages: ❌ (lecture seule)
  
Membres avec rôle:
  - Utiliser les boutons d'application: ✅
```

### Salons de tickets (créés dynamiquement)
```
Créateur du ticket:
  - Voir le salon: ✅
  - Envoyer des messages: ✅
  
Staff (Support/Modo/Admin):
  - Voir le salon: ✅
  - Toutes permissions: ✅
  
@everyone:
  - Voir le salon: ❌
```

### Salons information (📢 annonces, 📋 règlement)
```
@everyone:
  - Voir le salon: ✅
  - Envoyer des messages: ❌
  - Réagir: ✅
  
Admin uniquement:
  - Envoyer des messages: ✅
  - Gérer les messages: ✅
```

---

## 🤖 Configuration du Bot

### Variables d'environnement à configurer

```env
# Discord
DISCORD_TOKEN=votre_token_bot
DISCORD_CLIENT_ID=votre_client_id
DISCORD_GUILD_ID=id_du_serveur

# IDs des salons
GENERAL_CHANNEL_ID=xxx
ANNOUNCEMENTS_CHANNEL_ID=xxx
LEADERBOARD_CHANNEL_ID=xxx
TICKET_CATEGORY_ID=xxx
TICKET_LOG_CHANNEL_ID=xxx

# IDs des rôles de classement
ROLE_TOP1_SOLO=xxx
ROLE_TOP1_MULTI=xxx
ROLE_TOP10_SOLO=xxx
ROLE_TOP10_MULTI=xxx
```

### Récupérer les IDs (Mode Développeur)

1. Discord → Paramètres utilisateur → Avancé
2. Activer "Mode développeur"
3. Clic droit sur un salon/rôle → "Copier l'ID"

---

## 📝 Notes pour l'admin

### Points importants

1. **Hiérarchie des rôles**: Les rôles staff doivent être au-dessus des rôles membres
2. **Bot**: Doit avoir le rôle "Bot" en haut de la hiérarchie pour gérer les autres rôles
3. **Catégorie Tickets**: Définir les permissions sur la catégorie, pas sur chaque salon
4. **Logs**: Créer un webhook pour les logs si besoin d'intégration externe

### Commandes du bot à configurer

```
/link - Génère un code de liaison
/rank [@user] - Affiche le classement
/leaderboard [solo|multi] - Top 10
/ticket - Crée un ticket support
/unlink - Délier le compte
```

### Fréquence des publications auto

- **Classement mensuel**: 1er du mois à 12h00
- **Vérification des rôles**: Toutes les heures
- **Reset des rôles Top**: 1er du mois (pour réattribution)

---

## 🎨 Assets suggérés

### Icône du serveur
- Logo Maths-App en 512x512
- Format PNG avec transparence

### Bannière
- 960x540 ou 1920x1080
- Design avec le thème maths/éducatif

### Emojis personnalisés (optionnel)
- `:elo:` - Icône ELO
- `:streak:` - Flamme stylisée  
- `:badge:` - Médaille
- `:maths:` - Symbole mathématique

---

## 🔗 Lien d'invitation suggéré

```
Permissions nécessaires pour le bot:
- Manage Roles
- Manage Channels  
- Send Messages
- Embed Links
- Attach Files
- Read Message History
- Mention Everyone
- Add Reactions
- Use Slash Commands
- Create Private Threads
- Send Messages in Threads

Lien: https://discord.com/oauth2/authorize?client_id=VOTRE_CLIENT_ID&permissions=268443670&scope=bot%20applications.commands
```

---

**Créé pour Maths-App.com** 🤖✨
