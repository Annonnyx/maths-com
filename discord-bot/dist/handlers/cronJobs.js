import cron from 'node-cron';
import { config } from '../config.js';
import { publishLeaderboard } from '../api/discordActions.js';
import { updateAllUserRoles } from './roleManager.js';
export function startCronJobs() {
    // Classement mensuel automatique (1er du mois à midi)
    cron.schedule(config.cron.monthlyLeaderboard, async () => {
        console.log('📅 Publication mensuelle du classement...');
        try {
            await publishLeaderboard('solo');
            await new Promise(resolve => setTimeout(resolve, 5000));
            await publishLeaderboard('multi');
            console.log('✅ Classements publiés');
        }
        catch (error) {
            console.error('❌ Erreur publication classement:', error);
        }
    });
    // Vérification des rôles toutes les heures
    cron.schedule(config.cron.roleCheck, async () => {
        console.log('🔄 Vérification des rôles...');
        try {
            await updateAllUserRoles();
            console.log('✅ Rôles mis à jour');
        }
        catch (error) {
            console.error('❌ Erreur mise à jour rôles:', error);
        }
    });
    console.log('⏰ Cron jobs configurés');
}
