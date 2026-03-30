# Utiliser une image Node.js officielle optimisée pour Fly
FROM node:18-alpine

# Définir le répertoire de travail
WORKDIR /app

# Copier les fichiers de package d'abord
COPY package*.json ./

# Installer les dépendances
RUN npm ci --only=production

# Copier le code source
COPY . .

# Installer TypeScript globalement pour le build
RUN npm install -g typescript

# Construire l'application
RUN npm run build

# Créer un utilisateur non-root pour la sécurité
RUN addgroup -g 1001 -S nodejs && adduser -S nodejs -u 1001

# Changer vers le nouvel utilisateur
USER nodejs

# Exposer le port (Fly utilise généralement 8080 en interne)
EXPOSE 8080

# Variables d'environnement
ENV PORT=8080
ENV NODE_ENV=production

# Commande de démarrage
CMD ["npm", "start"]
