#!/bin/bash

# Script de déploiement Maths.com pour Hostinger
# Usage: ./deploy.sh [staging|production]

set -e  # Arrêter le script en cas d'erreur

# Configuration
ENVIRONMENT=${1:-production}
APP_NAME="maths-com"
APP_DIR="/home/$USER/$APP_NAME"
BACKUP_DIR="/home/$USER/backups"
DATE=$(date +%Y%m%d_%H%M%S)

echo "🚀 Déploiement Maths.com - Environnement: $ENVIRONMENT"
echo "📅 Date: $DATE"

# Couleurs pour les logs
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Fonctions de log
log_info() {
    echo -e "${GREEN}ℹ️  $1${NC}"
}

log_warn() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

log_error() {
    echo -e "${RED}❌ $1${NC}"
}

# Vérification des prérequis
check_prerequisites() {
    log_info "Vérification des prérequis..."
    
    if ! command -v node &> /dev/null; then
        log_error "Node.js n'est pas installé"
        exit 1
    fi
    
    if ! command -v npm &> /dev/null; then
        log_error "NPM n'est pas installé"
        exit 1
    fi
    
    if ! command -v pm2 &> /dev/null; then
        log_error "PM2 n'est pas installé"
        exit 1
    fi
    
    NODE_VERSION=$(node --version | cut -d'v' -f2)
    REQUIRED_NODE_VERSION="18"
    
    if [[ "$NODE_VERSION" < "$REQUIRED_NODE_VERSION" ]]; then
        log_error "Node.js $REQUIRED_NODE_VERSION+ requis, version actuelle: $NODE_VERSION"
        exit 1
    fi
    
    log_info "Prérequis vérifiés ✅"
}

# Backup de la version actuelle
backup_current() {
    if [ -d "$APP_DIR" ]; then
        log_info "Backup de la version actuelle..."
        mkdir -p "$BACKUP_DIR"
        
        # Backup de la base de données
        if [ -f "$APP_DIR/prod.db" ]; then
            cp "$APP_DIR/prod.db" "$BACKUP_DIR/prod_$DATE.db"
            log_info "Base de données backupée"
        fi
        
        # Backup du code
        if [ -d "$APP_DIR/.git" ]; then
            cd "$APP_DIR"
            git archive --format=tar.gz --prefix="$APP_NAME-$DATE/" HEAD > "$BACKUP_DIR/code_$DATE.tar.gz"
            log_info "Code source backupé"
        fi
    fi
}

# Mise à jour du code
update_code() {
    log_info "Mise à jour du code source..."
    
    if [ ! -d "$APP_DIR" ]; then
        log_info "Clonage du dépôt..."
        git clone https://github.com/ton-username/maths-com.git "$APP_DIR"
    else
        cd "$APP_DIR"
        git fetch origin
        git reset --hard origin/main
        log_info "Code mis à jour"
    fi
}

# Installation des dépendances
install_dependencies() {
    log_info "Installation des dépendances..."
    cd "$APP_DIR"
    
    if [ "$ENVIRONMENT" = "production" ]; then
        npm ci --production
    else
        npm ci
    fi
    
    log_info "Dépendances installées"
}

# Build de l'application
build_app() {
    log_info "Build de l'application..."
    cd "$APP_DIR"
    
    if [ "$ENVIRONMENT" = "production" ]; then
        cp next.config.production.js next.config.js
        npm run build
    else
        npm run build
    fi
    
    log_info "Build terminé"
}

# Migration de la base de données
migrate_database() {
    log_info "Migration de la base de données..."
    cd "$APP_DIR"
    
    # Générer les fichiers Prisma
    npx prisma generate
    
    # Appliquer les migrations
    npx prisma migrate deploy
    
    log_info "Migration terminée"
}

# Redémarrage de l'application
restart_app() {
    log_info "Redémarrage de l'application..."
    
    cd "$APP_DIR"
    
    # Arrêter l'application existante
    pm2 delete "$APP_NAME" || true
    
    # Démarrer la nouvelle version
    if [ "$ENVIRONMENT" = "production" ]; then
        pm2 start npm --name "$APP_NAME" -- start -- --production
    else
        pm2 start npm --name "$APP_NAME" -- start -- --env=staging
    fi
    
    # Sauvegarder la configuration PM2
    pm2 save
    pm2 startup
    
    log_info "Application redémarrée"
}

# Vérification du déploiement
verify_deployment() {
    log_info "Vérification du déploiement..."
    
    # Attendre que l'application démarre
    sleep 10
    
    # Vérifier le statut PM2
    if pm2 describe "$APP_NAME" | grep -q "online"; then
        log_info "Application en ligne ✅"
    else
        log_error "L'application n'a pas démarré correctement"
        pm2 logs "$APP_NAME" --lines 20
        exit 1
    fi
    
    # Vérifier la réponse HTTP (si curl est disponible)
    if command -v curl &> /dev/null; then
        if curl -f -s http://localhost:3000 > /dev/null; then
            log_info "Serveur HTTP répondant ✅"
        else
            log_error "Le serveur HTTP ne répond pas"
            exit 1
        fi
    fi
}

# Nettoyage des anciens backups
cleanup_old_backups() {
    log_info "Nettoyage des anciens backups..."
    
    # Supprimer les backups de plus de 7 jours
    find "$BACKUP_DIR" -name "prod_*.db" -mtime +7 -delete || true
    find "$BACKUP_DIR" -name "code_*.tar.gz" -mtime +7 -delete || true
    
    log_info "Nettoyage terminé"
}

# Fonction principale
main() {
    check_prerequisites
    backup_current
    update_code
    install_dependencies
    build_app
    migrate_database
    restart_app
    verify_deployment
    cleanup_old_backups
    
    log_info "🎉 Déploiement terminé avec succès !"
    log_info "📊 Statut: pm2 status"
    log_info "📝 Logs: pm2 logs $APP_NAME"
    
    if [ "$ENVIRONMENT" = "production" ]; then
        log_info "🌐 URL: https://ton-domaine.com"
    else
        log_info "🌐 URL: https://staging.ton-domaine.com"
    fi
}

# Gestion des erreurs
trap 'log_error "Une erreur est survenue pendant le déploiement"; exit 1' ERR

# Exécution
main "$@"
