import { SlashCommandBuilder, ChatInputCommandInteraction, EmbedBuilder } from 'discord.js';
import { COLORS } from '../config.js';
import { discordDb } from '../utils/supabase.js';
import { assignRoles } from '../utils/roles.js';

// Générer un code aléatoire de 6 caractères alphanumériques
function generateLinkCode(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

export default {
  data: new SlashCommandBuilder()
    .setName('link')
    .setDescription('Lier votre compte Discord à Maths-App.com')
    .addStringOption(option =>
      option.setName('code')
        .setDescription('Code de liaison obtenu sur Maths-App.com')
        .setRequired(false)
    ),
  
  async execute(interaction: ChatInputCommandInteraction) {
    const code = interaction.options.getString('code');
    
    try {
      const discordUserId = interaction.user.id;
      const discordUsername = interaction.user.username;
      
      // Si aucun code n'est fourni, donner les instructions
      if (!code) {
        const embed = new EmbedBuilder()
          .setTitle('🔗 Lier votre compte Discord')
          .setDescription('**Pour lier votre compte, suivez ces étapes :**\n\n1. Allez sur **[Maths-App.com](https://maths-app.com)**\n2. Connectez-vous et allez sur votre profil\n3. Cliquez sur "Lier mon compte Discord"\n4. Copiez le code de liaison\n5. Revenez ici et utilisez : `/link code:VOTRE_CODE`\n\n⏰ Le code expire dans **10 minutes**.')
          .setColor(COLORS.info)
          .addFields(
            { name: '🎯 Commande finale', value: '`/link code:ABC123`', inline: false },
            { name: '🔒 Sécurité', value: 'Ce code est personnel et unique. Ne le partagez avec personne.', inline: false }
          )
          .setFooter({ text: 'Maths-App.com • Lien sécurisé' })
          .setTimestamp();
        
        if (interaction.replied || interaction.deferred) {
          return interaction.editReply({ embeds: [embed], ephemeral: true });
        } else {
          return interaction.reply({ embeds: [embed], ephemeral: true });
        }
      }
      
      // Vérifier si l'utilisateur a déjà un compte lié
      const existingLink = await discordDb.getUserLink(discordUserId);
      if (existingLink) {
        const embed = new EmbedBuilder()
          .setTitle('⚠️ Compte déjà lié')
          .setDescription('Votre compte Discord est déjà lié à Maths-App.com.')
          .addFields(
            { name: 'Utilisateur lié', value: existingLink.username || 'Inconnu', inline: true },
            { name: 'Date de liaison', value: existingLink.discordLinkedAt ? new Date(existingLink.discordLinkedAt).toLocaleDateString('fr-FR') : 'Inconnue', inline: true }
          )
          .setColor(COLORS.warning)
          .setFooter({ text: 'Utilisez /unlink pour délier votre compte' })
          .setTimestamp();
        
        if (interaction.replied || interaction.deferred) {
          return interaction.editReply({ embeds: [embed] });
        } else {
          return interaction.reply({ embeds: [embed], ephemeral: true });
        }
      }
      
      // Vérifier le code avec le site web
      try {
        const response = await fetch(`${config.website.apiUrl}/discord/bot-verify`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${config.api.secret}`
          },
          body: JSON.stringify({
            discordId: discordUserId,
            code: code.toUpperCase(),
            discordUsername: discordUsername
          })
        });
        
        const result = await response.json();
        
        if (result.valid) {
          const embed = new EmbedBuilder()
            .setTitle('✅ Compte lié avec succès !')
            .setDescription(`Félicitations ${interaction.user.username} ! Votre compte Discord est maintenant lié à votre profil Maths-App.com.`)
            .setColor(COLORS.success)
            .addFields(
              { name: '🎯 Utilisateur lié', value: result.username || 'Inconnu', inline: true },
              { name: '� Date de liaison', value: new Date().toLocaleDateString('fr-FR'), inline: true }
            )
            .setFooter({ text: 'Maths-App.com • Liaison réussie' })
            .setTimestamp();
          
          if (interaction.replied || interaction.deferred) {
            await interaction.editReply({ embeds: [embed] });
          } else {
            await interaction.reply({ embeds: [embed], ephemeral: true });
          }
        } else {
          const embed = new EmbedBuilder()
            .setTitle('❌ Code invalide')
            .setDescription('Le code que vous avez fourni est invalide ou a expiré.')
            .setColor(COLORS.error)
            .addFields(
              { name: '💡 Conseil', value: 'Générez un nouveau code sur Maths-App.com et réessayez.', inline: false }
            )
            .setFooter({ text: 'Maths-App.com' })
            .setTimestamp();
          
          if (interaction.replied || interaction.deferred) {
            await interaction.editReply({ embeds: [embed] });
          } else {
            await interaction.reply({ embeds: [embed], ephemeral: true });
          }
        }
      } catch (fetchError) {
        console.error('Erreur vérification code:', fetchError);
        const embed = new EmbedBuilder()
          .title('❌ Erreur de vérification')
          .setDescription('Impossible de vérifier votre code avec le site web. Réessayez plus tard.')
          .setColor(COLORS.error)
          .setFooter({ text: 'Maths-App.com' })
          .setTimestamp();
        
        if (interaction.replied || interaction.deferred) {
          await interaction.editReply({ embeds: [embed] });
        } else {
          await interaction.reply({ embeds: [embed], ephemeral: true });
        }
      }
      
    } catch (error) {
      console.error('Error in link command:', error);
      const errorEmbed = new EmbedBuilder()
        .setTitle('❌ Erreur')
        .setDescription('Une erreur est survenue lors de la liaison de votre compte.')
        .setColor(COLORS.error)
        .setFooter({ text: 'Maths-App.com' })
        .setTimestamp();
      
      if (interaction.replied || interaction.deferred) {
        await interaction.editReply({ embeds: [errorEmbed] });
      } else {
        await interaction.reply({ embeds: [errorEmbed], ephemeral: true });
      }
    }
  }
};

// Fonction pour vérifier un code (utilisée par l'API du site)
export async function verifyLinkCode(code: string, supabaseUserId: string) {
  try {
    const verification = await discordDb.verifyLinkCode(code);
    
    if (!verification.valid) {
      return { valid: false, error: verification.error };
    }
    
    const linkCode = verification.data!;
    
    // Créer la liaison utilisateur
    await discordDb.createUserLink(supabaseUserId, linkCode.discord_user_id);
    
    // Marquer le code comme utilisé
    await discordDb.markCodeAsUsed(linkCode.id);
    
    // Attribuer les rôles Discord
    await assignRoles(linkCode.discord_user_id, supabaseUserId);
    
    return {
      valid: true,
      discordUserId: linkCode.discord_user_id,
      message: 'Compte lié avec succès ! Vos rôles Discord ont été attribués.'
    };
    
  } catch (error) {
    console.error('Error verifying link code:', error);
    return { valid: false, error: 'Erreur lors de la vérification du code' };
  }
}
