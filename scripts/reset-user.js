const { createClient } = require('@supabase/supabase-js');

require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

async function resetUserProfile(email) {
  console.log(`Suppression du profil pour: ${email}`);
  
  // Supprimer le profil de la table profiles
  const { error } = await supabase
    .from('profiles')
    .delete()
    .eq('email', email);
  
  if (error) {
    console.error('Erreur:', error);
    return false;
  }
  
  console.log('✅ Profil supprimé avec succès');
  console.log('Tu peux maintenant te réinscrire normalement');
  return true;
}

// Met ton email ici
const email = 'ton.email@example.com'; // ← CHANGE CETTE VALEUR

resetUserProfile(email);
