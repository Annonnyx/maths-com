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
    .setDescription('Lier votre compte Discord à Maths-App.com'),
  
  async execute(interaction: ChatInputCommandInteraction) {
    await interaction.deferReply({ ephemeral: true });
    
    try {
      const discordUserId = interaction.user.id;
      const discordUsername = interaction.user.username;
      
      // Vérifier si l'utilisateur a déjà un compte lié
      const existingLink = await discordDb.getUserLink(discordUserId);
      if (existingLink) {
        const embed = new EmbedBuilder()
          .setTitle('⚠️ Compte déjà lié')
          .setDescription('Votre compte Discord est déjà lié à Maths-App.com.')
          .addFields(
            { name: 'Utilisateur lié', value: existingLink.users?.username || 'Inconnu', inline: true },
            { name: 'Date de liaison', value: new Date(existingLink.linked_at).toLocaleDateString('fr-FR'), inline: true }
          )
          .setColor(COLORS.warning)
          .setFooter({ text: 'Utilisez /unlink pour délier votre compte' })
          .setTimestamp();
        
        return interaction.editReply({ embeds: [embed] });
      }
      
      // Générer un code unique de 6 caractères
      const code = generateLinkCode();
      
      // Insérer le code dans Supabase
      await discordDb.createLinkCode(discordUserId, code);
      
      const embed = new EmbedBuilder()
        .setTitle('🔗 Lier votre compte Discord')
        .setDescription(`**Code de liaison généré :**\n\n\`\`\`${code}\`\`\`\n\n**📋 Étapes à suivre :**\n1. Allez sur **[Maths-App.com](https://maths-app.com/profile)**\n2. Cliquez sur "Lier mon compte Discord"\n3. Entrez le code : \`${code}\`\n4. Votre compte sera automatiquement lié et vos rôles seront attribués !\n\n⏰ Ce code expire dans **15 minutes**.\n\n💡 Une fois lié, vous recevrez automatiquement vos rôles selon votre classe et votre classement !`)
        .setColor(COLORS.info)
        .addFields(
          { name: '🎯 Rôles automatiques', value: '• Rôle de rang (basé sur votre ELO)\n• Rôle de classe française\n• Rôles de badges spéciaux', inline: false },
          { name: '🔒 Sécurité', value: 'Ce code est personnel et unique. Ne le partagez avec personne.', inline: false }
        )
        .setFooter({ text: 'Maths-App.com • Lien sécurisé' })
        .setTimestamp();
      
      // Envoyer en DM pour la sécurité
      try {
        await interaction.user.send({ embeds: [embed] });
        await interaction.editReply({
          content: '✅ Je vous ai envoyé votre code de liaison en message privé !'
        });
      } catch (error) {
        // Si les DM sont fermés, afficher dans le canal (mais éphémère)
        await interaction.editReply({
          embeds: [embed]
        });
      }
      
    } catch (error) {
      console.error('Error in link command:', error);
      const errorEmbed = new EmbedBuilder()
        .setTitle('❌ Erreur')
        .setDescription('Une erreur est survenue lors de la génération de votre code de liaison.')
        .setColor(COLORS.error)
        .setFooter({ text: 'Maths-App.com' })
        .setTimestamp();
      
      await interaction.editReply({ embeds: [errorEmbed] });
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
