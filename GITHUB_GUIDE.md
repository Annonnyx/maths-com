# 🚀 Guide GitHub pour Maths.com

## 📋 **Étapes de Configuration GitHub**

### **1. Création du dépôt GitHub**
1. Va sur https://github.com
2. Connecte-toi avec ton compte
3. Clique sur "New repository"
4. Nom : `maths-com`
5. Description : `Plateforme d'entraînement au calcul mental gamifiée`
6. **Important** : ✅ **Public** (pour le projet scolaire)
7. ✅ **Add README** 
8. ✅ **Add .gitignore** (Node.js)
9. ❌ **License** (pour l'instant)
10. Clique sur "Create repository"

### **2. Lien local ↔ GitHub**
```bash
# Ajouter le dépôt distant
git remote add origin https://github.com/Annonnyx/maths-com.git

# Vérifier la connexion
git remote -v

# Pousser le code initial
git push -u origin main
```

## 🌳 **Stratégie des Branches**

### **Branches principales :**
- **`main`** : Version stable, production-ready
- **`develop`** : Version de développement, fusion des features
- **`feature/*`** : Nouvelles fonctionnalités
- **`hotfix/*`** : Corrections urgentes
- **`release/*`** : Préparation de version

### **Workflow recommandé :**

#### **Pour une nouvelle fonctionnalité :**
```bash
# 1. Partir de develop
git checkout develop
git pull origin develop

# 2. Créer une branche feature
git checkout -b feature/nom-de-la-feature

# 3. Travailler sur la feature
# ... faire les modifications ...

# 4. Commiter régulièrement
git add .
git commit -m "feat: description de la feature"

# 5. Pousser la branche
git push origin feature/nom-de-la-feature

# 6. Créer une Pull Request sur GitHub
# develop ← feature/nom-de-la-feature

# 7. Après validation, merger dans develop
```

#### **Pour corriger un bug urgent :**
```bash
# 1. Partir de main
git checkout main
git pull origin main

# 2. Créer branche hotfix
git checkout -b hotfix/correction-urgente

# 3. Faire la correction rapide
# ... modifications ...

# 4. Commiter et pousser
git add .
git commit -m "fix: correction urgente du bug X"
git push origin hotfix/correction-urgente

# 5. Faire une Pull Request : main ← hotfix/correction-urgente
# 6. Merger directement dans main
# 7. Merger aussi dans develop
```

## 🏷️ **Tags et Versions**

### **Créer une version :**
```bash
# 1. S'assurer d'être sur main
git checkout main
git pull origin main

# 2. Créer un tag
git tag -a v1.0.0 -m "Version 1.0.0 - Lancement initial"

# 3. Pousser le tag
git push origin v1.0.0

# 4. Ou pousser tous les tags
git push --tags
```

### **Numérotation sémantique :**
- **v1.0.0** : Version majeure (changements importants)
- **v1.1.0** : Version mineure (nouvelles features)
- **v1.1.1** : Version patch (corrections de bugs)

## 🔄 **Workflow Quotidien**

### **Avant de travailler :**
```bash
# Mettre à jour les branches
git checkout main
git pull origin main

git checkout develop  
git pull origin develop
```

### **Pendant le travail :**
```bash
# Commiter régulièrement avec messages clairs
git add .
git commit -m "feat: ajout nouvelle fonctionnalité"

# Pousser régulièrement pour backup
git push origin feature/nom-de-la-feature
```

### **Fin de journée :**
```bash
# Pousser le travail
git push origin feature/nom-de-la-feature

# Créer une Pull Request si feature terminée
```

## 📝 **Messages de Commit Conventionnels**

### **Format :**
```
type: description

[optional body]

[optional footer]
```

### **Types :**
- **feat** : Nouvelle fonctionnalité
- **fix** : Correction de bug
- **docs** : Documentation
- **style** : Style/formatting
- **refactor** : Refactoring
- **test** : Tests
- **chore** : Tâches de maintenance

### **Exemples :**
```bash
git commit -m "feat: ajout système de monétisation"
git commit -m "fix: correction bug affichage bannières multijoueur"
git commit -m "docs: mise à jour guide déploiement"
git commit -m "refactor: optimisation composants publicitaires"
```

## 🚨 **Bonnes Pratiques**

### **À faire :**
✅ Committer souvent avec messages clairs  
✅ Utiliser des branches pour chaque feature  
✅ Faire des Pull Requests pour revoir le code  
✅ Protéger la branche main (pas de push direct)  
✅ Ajouter des tests quand possible  

### **À éviter :**
❌ Travailler directement sur main  
❌ Faire des commits énormes  
❌ Pousser du code cassé  
❌ Commiter de fichiers sensibles (.env)  
❌ Oublier de mettre à jour avant de travailler  

## 🔧 **Configuration GitHub**

### **Activer la protection de main :**
1. Va sur ton dépôt GitHub
2. Settings → Branches
3. Add rule pour `main`
4. ✅ Require pull request reviews
5. ✅ Require status checks to pass

### Configurer GitHub Pages (optionnel) :
1. Settings → Pages
2. Source : Deploy from a branch
3. Branch : main / (root)
4. Ton site sera disponible sur `https://Annonnyx.github.io/maths-com`

## Monitoring et Statistiques

### GitHub Insights :
- Contribution graph (activité)
- Traffic (visites du dépôt)
- Forks et stars
- Issues et Pull Requests

### **Actions recommandées :**
- ⭐ Ajouter une star à ton propre dépôt
- 📝 Écrire une bonne README
- 🏷️ Utiliser des releases
- 📊 Activer GitHub Insights

---

**🎯 Prochaine étape :** Crée ton dépôt GitHub et connecte-le avec ce guide !
