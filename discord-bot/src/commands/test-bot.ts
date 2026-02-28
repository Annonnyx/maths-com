import { SlashCommandBuilder, EmbedBuilder, CommandInteraction } from 'discord.js';
import { config } from '../config.js';

export default {
  data: new SlashCommandBuilder()
    .setName('test-bot')
    .setDescription('Test complet des fonctionnalités du bot'),
  
  async execute(interaction: CommandInteraction) {
    await interaction.deferReply();
    
    const tests = [];
    let passedTests = 0;
    
    // Test 1: Permissions Bot
    try {
      const member = await interaction.guild?.members.fetch(interaction.user.id);
      if (member) {
        tests.push('✅ Permissions Discord OK');
        passedTests++;
      } else {
        tests.push('❌ Permissions Discord Error');
      }
    } catch (error) {
      tests.push('❌ Permissions Discord Error');
    }
    
    // Test 2: API Site
    try {
      const response = await fetch(`${config.website.apiUrl}/users`, {
        method: 'GET',
        headers: { 'User-Agent': 'Discord-Bot-Test' }
      });
      if (response.ok) {
        tests.push('✅ API Site OK');
        passedTests++;
      } else {
        tests.push(`❌ API Site Error (${response.status})`);
      }
    } catch (error) {
      tests.push('❌ API Site Down');
    }
    
    // Test 3: Base de données (via API)
    try {
      const response = await fetch(`${config.website.apiUrl}/profile`, {
        method: 'GET',
        headers: { 'User-Agent': 'Discord-Bot-Test' }
      });
      if (response.status !== 500) {
        tests.push('✅ Base de données OK');
        passedTests++;
      } else {
        tests.push('❌ Base de données Error');
      }
    } catch (error) {
      tests.push('❌ Base de données Connection Error');
    }
    
    // Test 4: Salons Discord essentiels
    try {
      const soloChannel = await interaction.client.channels.fetch(config.channels.leaderboardSolo);
      const multiChannel = await interaction.client.channels.fetch(config.channels.leaderboardMulti);
      const ticketCategory = await interaction.client.channels.fetch(config.channels.ticketCategory);
      
      if (soloChannel && multiChannel && ticketCategory) {
        tests.push('✅ Salons Discord OK');
        passedTests++;
      } else {
        tests.push('❌ Salons Discord Error');
      }
    } catch (error) {
      tests.push('❌ Salons Discord Error');
    }
    
    // Test 5: Rôles Discord
    try {
      const guild = await interaction.client.guilds.fetch(config.discord.guildId);
      const top1Role = await guild.roles.fetch(config.roles.ROLE_TOP1_SOLO);
      const supportRole = await guild.roles.fetch(config.roles.ROLE_SUPPORT);
      
      if (top1Role && supportRole) {
        tests.push('✅ Rôles Discord OK');
        passedTests++;
      } else {
        tests.push('❌ Rôles Discord Error');
      }
    } catch (error) {
      tests.push('❌ Rôles Discord Error');
    }
    
    // Test 6: Mémoire et Performance
    const memory = process.memoryUsage();
    const memoryUsageMB = Math.round(memory.heapUsed / 1024 / 1024);
    if (memoryUsageMB < 500) { // Moins de 500MB
      tests.push(`✅ Mémoire OK (${memoryUsageMB}MB)`);
      passedTests++;
    } else {
      tests.push(`⚠️ Mémoire Élevée (${memoryUsageMB}MB)`);
    }
    
    // Test 7: Uptime
    const uptime = process.uptime();
    const uptimeMinutes = Math.floor(uptime / 60);
    if (uptimeMinutes > 5) { // Plus de 5 minutes
      tests.push(`✅ Uptime OK (${uptimeMinutes}min)`);
      passedTests++;
    } else {
      tests.push(`⚠️ Uptime Faible (${uptimeMinutes}min)`);
    }
    
    // Création de l'embed de résultats
    const testEmbed = new EmbedBuilder()
      .setTitle('🧪 Test Complet du Bot')
      .setColor(passedTests >= 6 ? '#00FF00' : passedTests >= 4 ? '#FFA500' : '#FF0000')
      .setDescription(tests.join('\n'))
      .addFields(
        { 
          name: '📊 Résultat Global', 
          value: `**${passedTests}/7** tests réussis (${Math.round(passedTests/7*100)}%)`,
          inline: true 
        },
        { 
          name: '🎯 Statut', 
          value: passedTests >= 6 ? '🟢 Excellent' : passedTests >= 4 ? '🟡 Correct' : '🔴 Problèmes',
          inline: true 
        },
        { 
          name: '🕐 Test effectué', 
          value: new Date().toLocaleString('fr-FR'),
          inline: true 
        },
        { 
          name: '💾 Mémoire', 
          value: `${memoryUsageMB}MB / ${Math.round(memory.heapTotal / 1024 / 1024)}MB`,
          inline: true 
        },
        { 
          name: '⏱️ Uptime', 
          value: `${uptimeMinutes}min ${Math.floor(uptime % 60)}s`,
          inline: true 
        },
        { 
          name: '🌐 Ping Discord', 
          value: `${Math.round(interaction.client.ws.ping)}ms`,
          inline: true 
        }
      )
      .setFooter({ 
        text: `Test demandé par ${interaction.user.username}`, 
        iconURL: interaction.user.displayAvatarURL() 
      })
      .setTimestamp();

    await interaction.editReply({ embeds: [testEmbed] });
  }
};
