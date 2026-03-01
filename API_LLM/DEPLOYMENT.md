# DEPLOYMENT — Notes et pièges Vercel

## 🚨 Problème critique : Redirections www

### ⚠️ NE JAMAIS ajouter de redirection www.maths-app.com dans vercel.json

**Pourquoi ?** Vercel gère automatiquement les redirections www vers le domaine principal. Si vous ajoutez une redirection manuelle pour www dans vercel.json, cela crée une boucle infinie :
```
www.maths-app.com → maths-app.com → www.maths-app.com → ...
```

**Résultat :** `ERR_TOO_MANY_REDIRECTS`

### ✅ Configuration correcte vercel.json

Seuls les domaines alternatifs (pas www) doivent être redirigés :
```json
{
  "redirects": [
    {
      "source": "/:path*",
      "has": [{ "type": "host", "value": "maths-app.fr" }],
      "destination": "https://maths-app.com/:path*",
      "permanent": true
    },
    {
      "source": "/:path*",
      "has": [{ "type": "host", "value": "www.maths-app.fr" }],
      "destination": "https://maths-app.com/:path*",
      "permanent": true
    }
  ]
}
```

**Note :** www.maths-app.com n'est PAS dans cette liste - Vercel le gère nativement.

---

## 🔧 Variables d'environnement Vercel

### Variables obligatoires
```
NEXTAUTH_URL=https://maths-app.com
NEXTAUTH_SECRET=<random_string_32_chars>
DATABASE_URL=postgresql://...
SUPABASE_URL=https://...
SUPABASE_ANON_KEY=...
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...
DISCORD_CLIENT_ID=...
DISCORD_CLIENT_SECRET=...
```

### ⚠️ Important : NEXTAUTH_URL
- Doit être le domaine canonique (maths-app.com, pas www.maths-app.com)
- Sans slash final
- En production : https://maths-app.com
- En local : http://localhost:3000

---

## 🔄 Ordre des redirections

Les redirections dans vercel.json sont exécutées en ordre. Placez les plus spécifiques en premier.

---

## 📝 Règle d'or

**Si vous voyez ERR_TOO_MANY_REDIRECTS sur le domaine www :**
1. Vérifiez que www n'est pas dans vercel.json redirects
2. Laissez Vercel gérer www automatiquement
3. Ne redirigez que les domaines alternatifs (.fr, etc.)

---

## 🚀 Déploiement

Après chaque push sur main, Vercel auto-déploie. Si erreur :
1. Vérifier les logs dans Vercel Dashboard
2. Vérifier les variables d'env
3. Vérifier que `npm run build` passe en local

**Domaine canonique :** maths-app.com (sans www)
**Redirections auto par Vercel :** www.maths-app.com → maths-app.com
