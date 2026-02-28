import { Events, Message, EmbedBuilder } from 'discord.js';

export default {
  name: Events.MessageCreate,
  async execute(message: Message) {
    // Ignorer les messages des bots
    if (message.author.bot) return;

    // Vérifier si c'est un DM (message.guild est null pour les DMs)
    if (!message.guild) return;

    const content = message.content.trim().toUpperCase();

    // Vérifier si le contenu ressemble à un code de liaison (12 caractères hex)
    if (!/^[A-F0-9]{12}$/.test(content)) return;

    try {
      console.log(`🔍 Vérification code liaison: ${content} de ${message.author.tag}`);

      // Appeler l'API de vérification
      const WEBSITE_API = process.env.WEBSITE_API_URL || 'http://localhost:3000';

      const response = await fetch(`${WEBSITE_API}/api/discord/link/verify`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          discordId: message.author.id,
          code: content,
          discordUsername: message.author.username
        })
      });

      const result = await response.json();

      if ((result as any).valid) {
        // Code valide - envoyer message de confirmation
        const successEmbed = new EmbedBuilder()
          .setTitle('✅ Compte lié avec succès !')
          .setColor('#00FF00')
          .setDescription('Votre compte Discord est maintenant lié à votre profil Maths-Com.')
          .addFields(
            { name: 'Utilisateur Discord', value: message.author.username, inline: true },
            { name: 'ID Discord', value: message.author.id, inline: true },
            { name: 'Statut', value: '✅ Vérifié', inline: true }
          )
          .setFooter({
            text: 'Vous pouvez maintenant recevoir des rôles automatiques selon vos progrès !'
          })
          .setTimestamp();

        await message.reply({ embeds: [successEmbed] });

        console.log(`✅ Compte lié: ${message.author.tag} (${message.author.id})`);

      } else {
        // Code invalide
        const errorEmbed = new EmbedBuilder()
          .setTitle('❌ Code invalide')
          .setColor('#FF0000')
          .setDescription('Le code que vous avez envoyé n\'est pas valide ou a expiré.')
          .addFields(
            { name: 'Raison possible', value: '• Code expiré (10 minutes)\n• Code déjà utilisé\n• Code incorrect' }
          )
          .setFooter({
            text: 'Réessayez en générant un nouveau code sur le site web.'
          });

        await message.reply({ embeds: [errorEmbed] });
        console.log(`❌ Code invalide de ${message.author.tag}: ${content}`);
      }

    } catch (error) {
      console.error('Erreur vérification liaison Discord:', error);

      const errorEmbed = new EmbedBuilder()
        .setTitle('⚠️ Erreur de vérification')
        .setColor('#FFA500')
        .setDescription('Une erreur s\'est produite lors de la vérification de votre code.')
        .setFooter({
          text: 'Réessayez dans quelques instants ou contactez le support.'
        });

      await message.reply({ embeds: [errorEmbed] });
    }
  }
};
