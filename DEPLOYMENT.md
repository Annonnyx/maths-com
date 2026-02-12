# Maths.com - Guide de Déploiement Hostinger

## 📋 Prérequis
- Hébergement Hostinger Business ou Cloud
- Accès SSH activé
- Domaine configuré
- Node.js 18+ installé

## 🚀 Étapes de déploiement

### 1. Connexion SSH
```bash
ssh username@ton-serveur-hostinger.com
```

### 2. Préparation du serveur
```bash
# Mise à jour
sudo apt update && sudo apt upgrade -y

# Installation Node.js 18
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Vérification
node --version  # Doit être 18+
npm --version   # Doit être 9+
```

### 3. Installation PM2
```bash
npm install -g pm2
```

### 4. Clonage et build
```bash
# Clonage du projet
git clone https://github.com/ton-username/maths-com.git
cd maths-com

# Installation dépendances
npm install --production

# Build de production
npm run build
```

### 5. Configuration environnement
```bash
# Créer le fichier .env.production
cp .env.example .env.production
nano .env.production
```

Variables requises :
```env
NODE_ENV=production
NEXTAUTH_URL=https://ton-domaine.com
NEXTAUTH_SECRET=clé_secrete_32_caracteres_minimum
GOOGLE_CLIENT_ID=ton_google_client_id
GOOGLE_CLIENT_SECRET=ton_google_client_secret
DISCORD_CLIENT_ID=ton_discord_client_id
DISCORD_CLIENT_SECRET=ton_discord_client_secret
FACEBOOK_CLIENT_ID=ton_facebook_client_id
FACEBOOK_CLIENT_SECRET=ton_facebook_client_secret
```

### 6. Configuration base de données
```bash
# Transférer la base de données SQLite
scp dev.db username@ton-serveur-hostinger.com:/home/username/maths-com/

# Ou créer une nouvelle base
sqlite3 prod.db
```

### 7. Démarrage avec PM2
```bash
# Démarrer l'application
pm2 start npm --name "maths-com" -- start

# Configuration pour redémarrage automatique
pm2 startup
pm2 save

# Vérifier le statut
pm2 status
pm2 logs maths-com
```

### 8. Configuration Nginx
Créer `/etc/nginx/sites-available/maths-com` :
```nginx
server {
    listen 80;
    server_name ton-domaine.com www.ton-domaine.com;
    
    # Redirection HTTP vers HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name ton-domaine.com www.ton-domaine.com;
    
    # Configuration SSL
    ssl_certificate /chemin/vers/ton/certificat.crt;
    ssl_certificate_key /chemin/vers/ton/cle.key;
    
    # Headers de sécurité
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        
        # Timeout pour les longues requêtes
        proxy_read_timeout 300s;
        proxy_connect_timeout 75s;
    }
    
    # Fichiers statiques
    location /_next/static/ {
        proxy_pass http://localhost:3000;
        add_header Cache-Control "public, max-age=31536000, immutable";
    }
    
    location /static/ {
        proxy_pass http://localhost:3000;
        add_header Cache-Control "public, max-age=31536000, immutable";
    }
}
```

Activer le site :
```bash
sudo ln -s /etc/nginx/sites-available/maths-com /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

## 💰 Configuration Monétisation

### 1. Google AdSense
1. Créer un compte AdSense
2. Ajouter ton domaine
3. Obtenir les codes `ca-pub-XXXXXXXXXXXXXXXX`
4. Remplacer les XXX dans les composants :
   - `AdSenseBanner.tsx`
   - `layout.tsx`

### 2. Google Analytics
1. Créer un compte Analytics 4
2. Obtenir le code `G-XXXXXXXXXX`
3. Remplacer dans `layout.tsx`

### 3. Variables à remplacer
Dans les fichiers créés :
- `ca-pub-XXXXXXXXXXXXXXXX` → Ton ID AdSense
- `G-XXXXXXXXXX` → Ton ID Analytics
- Slots publicitaires → Tes IDs de slots

## 🔧 Maintenance

### Logs et monitoring
```bash
# Logs PM2
pm2 logs maths-com

# Logs Nginx
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log

# Redémarrer services
pm2 restart maths-com
sudo systemctl reload nginx
```

### Mises à jour
```bash
cd /home/username/maths-com
git pull origin main
npm install --production
npm run build
pm2 restart maths-com
```

### Backup automatique
```bash
# Script backup.sh
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
cp /home/username/maths-com/prod.db /home/username/backups/prod_$DATE.db
find /home/username/backups -name "prod_*.db" -mtime +7 -delete

# Crontab quotidien
0 2 * * * /home/username/backup.sh
```

## ✅ Checklist avant mise en production

- [ ] Build réussi en local
- [ ] Variables d'environnement configurées
- [ ] Base de données transférée
- [ ] SSL/TLS configuré
- [ ] Nginx configuré et testé
- [ ] AdSense IDs remplacés
- [ ] Analytics ID remplacé
- [ ] PM2 configuré
- [ ] Domaine pointé vers Hostinger
- [ ] Tests complets sur staging

## 🚨 Dépannage

### Problèmes courants
1. **Port 3000 déjà utilisé** : `sudo netstat -tulpn | grep :3000`
2. **Permissions** : `chmod +x backup.sh`
3. **Mémoire insuffisante** : `pm2 monit`
4. **SSL** : Vérifier les chemins des certificats

### Support Hostinger
- Panel : https://hpanel.hostinger.com
- Documentation : https://support.hostinger.com
- Support : 24/7 chat et tickets

---

**🎉 Félicitations !** Une fois ces étapes terminées, ton site sera en production avec monétisation intégrée !
