import { createClient } from '@supabase/supabase-js';
import { config } from '../config.js';

export const supabase = createClient(
  config.supabase.url,
  config.supabase.serviceKey
);

// Fonctions utilitaires pour interagir avec Supabase
export const discordDb = {
  // Créer un code de liaison
  async createLinkCode(discordUserId: string, code: string) {
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000).toISOString();
    
    const { data, error } = await supabase
      .from('link_codes')
      .insert({
        discord_user_id: discordUserId,
        code,
        expires_at: expiresAt
      })
      .select()
      .single();
    
    if (error) {
      console.error('Error creating link code:', error);
      throw error;
    }
    
    return data;
  },

  // Vérifier un code de liaison
  async verifyLinkCode(code: string) {
    const { data, error } = await supabase
      .from('link_codes')
      .select('*')
      .eq('code', code.toUpperCase())
      .eq('used', false)
      .single();
    
    if (error) {
      return { valid: false, error: 'Code invalide' };
    }
    
    if (!data) {
      return { valid: false, error: 'Code invalide' };
    }
    
    if (new Date(data.expires_at) < new Date()) {
      return { valid: false, error: 'Code expiré' };
    }
    
    return { valid: true, data };
  },

  // Marquer un code comme utilisé
  async markCodeAsUsed(codeId: string) {
    const { error } = await supabase
      .from('link_codes')
      .update({ used: true })
      .eq('id', codeId);
    
    if (error) {
      console.error('Error marking code as used:', error);
      throw error;
    }
  },

  // Créer une liaison utilisateur (utiliser la table users directement)
  async createUserLink(supabaseUserId: string, discordUserId: string) {
    const { data, error } = await supabase
      .from('users')
      .update({
        discordId: discordUserId,
        discordLinkedAt: new Date().toISOString()
      })
      .eq('id', supabaseUserId)
      .select()
      .single();
    
    if (error) {
      console.error('Error creating user link:', error);
      throw error;
    }
    
    return data;
  },

  // Récupérer la liaison d'un utilisateur Discord
  async getUserLink(discordUserId: string) {
    const { data, error } = await supabase
      .from('users')
      .select(`
        id,
        username,
        displayName,
        discordId,
        discordLinkedAt
      `)
      .eq('discordId', discordUserId)
      .single();
    
    if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
      console.error('Error getting user link:', error);
      return null;
    }
    
    return data;
  },

  // Désactiver une liaison utilisateur
  async deactivateUserLink(discordUserId: string) {
    const { error } = await supabase
      .from('users')
      .update({ 
        discordId: null,
        discordLinkedAt: null
      })
      .eq('discordId', discordUserId);
    
    if (error) {
      console.error('Error deactivating user link:', error);
      throw error;
    }
  },

  // Récupérer le profil utilisateur complet
  async getUserProfile(supabaseUserId: string) {
    const { data, error } = await supabase
      .from('users')
      .select(`
        *,
        user_badges(
          badge:badges(*)
        )
      `)
      .eq('id', supabaseUserId)
      .single();
    
    if (error) {
      console.error('Error getting user profile:', error);
      return null;
    }
    
    return data;
  }
};
