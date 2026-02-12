# 🚀 GitHub Pages Setup for Maths.com

## ⚠️ **Problème actuel**
GitHub Pages ne peut pas exécuter les routes API Next.js. Pour un déploiement statique, il faut soit :

1. **Utiliser un backend externe** (Vercel, Netlify, Railway)
2. **Créer une version démo** sans fonctionnalités API
3. **Utiliser GitHub Actions** pour déployer sur Vercel

## 🎯 **Solution Recommandée**

### **Option 1 : Déployer sur Vercel (gratuit)**
1. Va sur https://vercel.com
2. Importe ton dépôt GitHub
3. Vercel gère automatiquement les API routes
4. URL : `https://maths-com.vercel.app`

### **Option 2 : Version démo GitHub Pages**
1. Désactive les routes API pour le build
2. Crée une version "showcase" du design
3. Les fonctionnalités qui nécessitent une API seront désactivées

### **Option 3 : GitHub Actions + Vercel**
1. GitHub Actions pour le CI/CD
2. Déploiement automatique sur Vercel
3. GitHub Pages pour la documentation

## 📋 **Étapes pour Vercel (recommandé)**

### **1. Connexion GitHub**
- Connecte ton compte GitHub à Vercel
- Importe `Annonnyx/maths-com`

### **2. Configuration**
- Framework Preset : Next.js
- Build Command : `npm run build`
- Output Directory : `.next`

### **3. Variables d'environnement**
- `NEXTAUTH_URL` : `https://maths-com.vercel.app`
- `NEXTAUTH_SECRET` : clé secrète
- `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET`
- etc.

### **4. Déploiement**
- Automatic deployment
- URL personnalisée possible

## 🎨 **Si tu veux quand même GitHub Pages**

Pour une version statique, il faut :
1. Commenter/désactiver les routes API
2. Remplacer les appels API par des données mock
3. Créer une version "portfolio" du site

---

**Recommandation** : Utilise Vercel pour le site principal, GitHub Pages pour la documentation.
