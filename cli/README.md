# maths-cli

CLI officielle de [maths-app.fr](https://maths-app.fr) pour jouer aux sessions solo et duels directement depuis votre terminal.

## Installation

```bash
npm install -g maths-cli
```

Ou en développement local :

```bash
cd cli
npm install
npm link
```

## Configuration

### 1. Créer une clef API

1. Connectez-vous à [maths-app.fr](https://maths-app.fr)
2. Allez dans votre dashboard → Paramètres → CLI
3. Cliquez sur "Générer une clef API"
4. Copiez la clef (commence par `mths_`)

### 2. Se connecter

```bash
maths login
```

Collez votre clef API lorsque demandé.

## Commandes

### Authentification

```bash
maths login          # Se connecter avec une clef API
maths logout         # Se déconnecter
maths whoami         # Afficher les infos du compte
```

### Solo

```bash
maths solo                           # Mode interactif
maths solo -d easy -q 10 -t casual   # Options directes
```

**Options :**
- `-d, --difficulty` : `easy`, `medium`, `hard`, `mixed` (défaut: `mixed`)
- `-q, --questions` : `10`, `20` (défaut: `10`)
- `-t, --type` : `casual`, `training` (défaut: `casual`)

### Duels multijoueurs

```bash
maths duel create                    # Créer un duel (interactif)
maths duel create -d easy -t blitz   # Options directes
maths duel join ABC123               # Rejoindre avec un code
```

**Options de création :**
- `-d, --difficulty` : `easy`, `medium`, `hard`, `mixed`
- `-t, --time` : `bullet` (1min), `blitz` (3min), `rapid` (5min)
- `-q, --questions` : `10`, `20`

### Historique

```bash
maths history            # 5 dernières parties
maths history -n 10      # 10 dernières parties
```

## Exemples d'utilisation

### Partie solo rapide

```bash
$ maths solo -d easy -q 10
? Difficulté ? Easy
? Nombre de questions ? 10 questions
? Type de jeu ? Casual (30s/question)

Question 1/10
[████████████] 100%

Calcul : 15 + 27
? Ta réponse : 42
Réponse enregistrée (3s)

Question 2/10
[██████████░░] 80%
...
```

### Duel 1v1

```bash
$ maths duel create -t blitz
? Difficulté ? Mixte
? Contrôle du temps ? Blitz (3min)
? Nombre de questions ? 10 questions

╔═══════════════════════════╗
║         ABC123            ║
║     Partage ce code !     ║
╚═══════════════════════════╝

En attente d'un adversaire...
✓ Adversaire trouvé !

Adversaire trouvé : Player2 (ELO: 1250)

Question 1/10
[████░░░░░░░░] 40%

Calcul : 8 × 7
? Ta réponse : 56
✓ Correct ! | Score : Toi 1 — Adversaire 0
```

## Stockage local

La configuration est stockée dans `~/.maths-cli/config.json` :

```json
{
  "apiKey": "mths_...",
  "username": "votre_nom",
  "userId": "...",
  "soloElo": 1200,
  "multiplayerElo": 1150,
  "apiUrl": "https://maths-app.fr"
}
```

## Développement

### Structure du projet

```
cli/
├── bin/
│   └── maths.js          # Entry point
├── src/
│   ├── commands/
│   │   ├── login.js
│   │   ├── logout.js
│   │   ├── whoami.js
│   │   ├── solo.js
│   │   ├── duel.js
│   │   └── history.js
│   └── lib/
│       ├── api.js       # Requêtes HTTP
│       ├── config.js    # Gestion config
│       └── display.js   # Affichage terminal
├── package.json
└── README.md
```

### Lancement en développement

```bash
cd cli
npm install
npm run dev
# ou
node bin/maths.js
```

### Tests

```bash
npm test
```

## API Routes

La CLI utilise les routes API suivantes :

- `POST /api/cli/auth/verify` - Vérifier une clef
- `POST /api/cli/solo/start` - Démarrer une partie solo
- `POST /api/cli/solo/complete/[id]` - Terminer une partie solo
- `GET /api/cli/solo/history` - Historique solo
- `POST /api/cli/duel/create` - Créer un duel
- `POST /api/cli/duel/join` - Rejoindre un duel
- `POST /api/cli/duel/[id]/answer` - Répondre à une question
- `GET /api/cli/duel/[id]/status` - Statut d'un duel

## Dépannage

### "Clef invalide ou expirée"

```bash
maths logout
maths login
```

### Timeout réseau

Vérifiez votre connexion internet. La CLI a un timeout de 10 secondes par requête.

### Nettoyer la configuration

```bash
rm ~/.maths-cli/config.json
maths login
```

## Licence

MIT License - voir fichier LICENSE pour les détails.

## Support

Pour toute question ou problème :

1. Vérifiez ce README
2. Ouvrez une issue sur le GitHub du projet
3. Contactez le support sur [maths-app.fr](https://maths-app.fr)
