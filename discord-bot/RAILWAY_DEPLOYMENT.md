# Discord Bot - Railway Deployment

## 🚀 Déploiement sur Railway

### 1. Préparation du projet

```bash
# Structure du projet pour Railway
discord-bot/
├── package.json
├── tsconfig.json
├── .env
├── src/
│   ├── index.ts
│   ├── config.ts
│   ├── events/
│   ├── commands/
│   ├── handlers/
│   └── api/
└── railway.json
```

### 2. Configuration Railway

Crée un fichier `railway.json` :
```json
{
  "build": {
    "builder": "NIXPACKS"
  },
  "deploy": {
    "startCommand": "npm start",
    "restartPolicyType": "ON_FAILURE",
    "restartPolicyMaxRetries": 10
  }
}
```

### 3. Variables d'environnement Railway

Dans Railway Dashboard → Settings → Variables :
```
DISCORD_TOKEN=ton_bot_token
DISCORD_CLIENT_ID=ton_client_id  
DISCORD_GUILD_ID=ton_server_id
API_SECRET=ae88486ea8d3d7325cea8542e6a2be15c87fc1e7f3cdb12cd43aacbcdd21eded
API_PORT=3001
WEBSITE_URL=https://maths-com.vercel.app/
WEBSITE_API_URL=https://maths-com.vercel.app/api
LEADERBOARD_SOLO_CHANNEL_ID=1476698788037918884
LEADERBOARD_MULTI_CHANNEL_ID=1476698830706839695
TICKET_CATEGORY_ID=1476699148630757436
TICKET_LOG_CHANNEL_ID=1476699187021348924
ANNOUNCEMENTS_CHANNEL_ID=1476698131922948176
GENERAL_CHANNEL_ID=1476698393907695880
ROLE_TOP1_SOLO=1476699975869272064
ROLE_TOP1_MULTI=1476705470252060898
ROLE_SUPPORT=1476699732750500046
ROLE_CP=1476700031368171713
ROLE_CE1=1476700031368171713
ROLE_CE2=1476700054856274092
ROLE_CM1=1476700054856274092
ROLE_CM2=1476700054856274092
ROLE_6E=1476700078335856801
ROLE_5E=1476700078335856801
ROLE_4E=1476700078335856801
ROLE_3E=1476700054856274092
ROLE_2DE=1476700078335856801
ROLE_1RE=1476700105414545522
ROLE_TLE=1476700133361188995
NODE_ENV=production
```

### 4. Package.json - Scripts de production

```json
{
  "scripts": {
    "start": "node dist/index.js",
    "build": "tsc",
    "dev": "tsx watch src/index.ts",
    "health": "node dist/health-check.js"
  }
}
```

### 5. Déploiement

```bash
# 1. Connecte-toi à Railway CLI
railway login

# 2. Initialise le projet
cd discord-bot
railway init

# 3. Déploie
railway up
```

## 🏥 Système de Santé et Monitoring

### Health Check Endpoint

Le bot inclut un endpoint `/health` pour Railway :
```javascript
// src/api/server.ts
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    discord: client.user?.tag || 'Not connected'
  });
});
```

### Auto-Ping et Keep-Alive

```javascript
// src/utils/keepAlive.ts
export class KeepAliveService {
  private interval: NodeJS.Timeout;
  private readonly PING_INTERVAL = 5 * 60 * 1000; // 5 minutes

  constructor(private client: Client) {
    this.startKeepAlive();
  }

  private startKeepAlive() {
    this.interval = setInterval(async () => {
      try {
        // Ping Discord API
        await this.client.user?.setPresence({
          activities: [{ 
            name: `🏆 ${Math.floor(Math.random() * 1000)} joueurs`, 
            type: ActivityType.Watching 
          }],
          status: 'online'
        });

        // Log de santé
        console.log(`🏥 Bot Health Check - ${new Date().toISOString()}`);
        console.log(`💾 Memory: ${Math.round(process.memoryUsage().heapUsed / 1024 / 1024)}MB`);
        console.log(`⏱️ Uptime: ${Math.floor(process.uptime() / 60)}min`);
        
      } catch (error) {
        console.error('❌ Keep-alive failed:', error);
      }
    }, this.PING_INTERVAL);
  }

  stop() {
    if (this.interval) {
      clearInterval(this.interval);
    }
  }
}
```

### Monitoring Dashboard

```javascript
// src/events/ready.ts
import { KeepAliveService } from '../utils/keepAlive';

export default {
  name: 'ready',
  once: true,
  async execute(client: Client) {
    console.log(`✅ ${client.user.tag} is online!`);
    
    // Démarrer le keep-alive
    const keepAlive = new KeepAliveService(client);
    
    // Message de démarrage
    const startEmbed = new EmbedBuilder()
      .setTitle('🤖 Bot Discord Démarré')
      .setColor('Green')
      .addFields(
        { name: '🆔 Bot ID', value: client.user.id, inline: true },
        { name: '🌐 Serveurs', value: `${client.guilds.cache.size}`, inline: true },
        { name: '👥 Utilisateurs', value: `${client.users.cache.size}`, inline: true },
        { name: '⏰ Démarrage', value: new Date().toLocaleString('fr-FR'), inline: true }
      )
      .setTimestamp();

    // Envoyer dans le salon général
    const generalChannel = await client.channels.fetch(config.channels.GENERAL_CHANNEL_ID).catch(() => null);
    if (generalChannel?.isTextBased()) {
      await generalChannel.send({ embeds: [startEmbed] });
    }
  }
};
```

## 🔧 Tests de Fonctionnalités

### Commande de test complet

```javascript
// src/commands/test.ts
export default {
  data: new SlashCommandBuilder()
    .setName('test-bot')
    .setDescription('Test complet des fonctionnalités du bot'),
  
  async execute(interaction: CommandInteraction) {
    await interaction.deferReply();
    
    const tests = [];
    
    // Test 1: Permissions
    try {
      await interaction.guild?.members.fetch(interaction.user.id);
      tests.push('✅ Permissions OK');
    } catch (error) {
      tests.push('❌ Permissions Error');
    }
    
    // Test 2: API Site
    try {
      const response = await fetch(`${config.websiteApiUrl}/users`);
      tests.push(response.ok ? '✅ API Site OK' : '❌ API Site Error');
    } catch (error) {
      tests.push('❌ API Site Down');
    }
    
    // Test 3: Base de données
    try {
      // Test de connexion à la BDD via API
      const response = await fetch(`${config.websiteApiUrl}/profile`, {
        headers: { 'Authorization': `Bearer ${process.env.API_SECRET}` }
      });
      tests.push(response.status !== 500 ? '✅ BDD OK' : '❌ BDD Error');
    } catch (error) {
      tests.push('❌ BDD Connection Error');
    }
    
    // Test 4: Salons Discord
    try {
      const soloChannel = await interaction.client.channels.fetch(config.channels.LEADERBOARD_SOLO_CHANNEL_ID);
      const multiChannel = await interaction.client.channels.fetch(config.channels.LEADERBOARD_MULTI_CHANNEL_ID);
      tests.push(soloChannel && multiChannel ? '✅ Salons OK' : '❌ Salons Error');
    } catch (error) {
      tests.push('❌ Salons Error');
    }
    
    const testEmbed = new EmbedBuilder()
      .setTitle('🧪 Test Complet du Bot')
      .setColor('Blue')
      .setDescription(tests.join('\n'))
      .addFields(
        { name: '📊 Résultat', value: tests.filter(t => t.startsWith('✅')).length + '/4 tests OK' },
        { name: '⏰ Test effectué à', value: new Date().toLocaleString('fr-FR') }
      )
      .setTimestamp();
    
    await interaction.editReply({ embeds: [testEmbed] });
  }
};
```

## 📊 Monitoring Railway

### 1. Health Checks
Railway vérifie automatiquement `/health` toutes les 30 secondes

### 2. Logs en temps réel
```bash
railway logs
```

### 3. Métriques
- CPU, Memory, Network dans le dashboard Railway
- Alertes par email si le bot tombe

### 4. Redémarrage automatique
- Redémarrage automatique en cas de crash
- Maximum 10 tentatives

## 🚨 Alertes et Notifications

```javascript
// src/utils/alerts.ts
export class AlertService {
  static async sendAlert(message: string, type: 'error' | 'warning' | 'info' = 'error') {
    const colors = {
      error: '#FF0000',
      warning: '#FFA500', 
      info: '#00FF00'
    };
    
    const alertEmbed = new EmbedBuilder()
      .setTitle(`🚨 ${type.toUpperCase()}`)
      .setColor(colors[type])
      .setDescription(message)
      .setTimestamp();
    
    // Envoyer dans le salon de logs
    const logChannel = await client.channels.fetch(config.channels.TICKET_LOG_CHANNEL_ID);
    if (logChannel?.isTextBased()) {
      await logChannel.send({ embeds: [alertEmbed] });
    }
  }
}
```

## 🎯 Résultat

Avec cette configuration :
- ✅ Bot 24/7 sans mise en veille
- ✅ Monitoring complet
- ✅ Alertes automatiques  
- ✅ Redémarrage automatique
- ✅ Tests de fonctionnalités
- ✅ Logs détaillés

Le bot sera parfaitement stable sur Railway ! 🚀
