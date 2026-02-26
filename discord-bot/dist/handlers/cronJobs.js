"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.startCronJobs = startCronJobs;
const node_cron_1 = __importDefault(require("node-cron"));
const config_js_1 = require("../config.js");
const discordActions_js_1 = require("../api/discordActions.js");
const roleManager_js_1 = require("./roleManager.js");
function startCronJobs() {
    // Classement mensuel automatique (1er du mois à midi)
    node_cron_1.default.schedule(config_js_1.config.cron.monthlyLeaderboard, async () => {
        console.log('📅 Publication mensuelle du classement...');
        try {
            await (0, discordActions_js_1.publishLeaderboard)('solo');
            await new Promise(resolve => setTimeout(resolve, 5000));
            await (0, discordActions_js_1.publishLeaderboard)('multi');
            console.log('✅ Classements publiés');
        }
        catch (error) {
            console.error('❌ Erreur publication classement:', error);
        }
    });
    // Vérification des rôles toutes les heures
    node_cron_1.default.schedule(config_js_1.config.cron.roleCheck, async () => {
        console.log('🔄 Vérification des rôles...');
        try {
            await (0, roleManager_js_1.updateAllUserRoles)();
            console.log('✅ Rôles mis à jour');
        }
        catch (error) {
            console.error('❌ Erreur mise à jour rôles:', error);
        }
    });
    console.log('⏰ Cron jobs configurés');
}
//# sourceMappingURL=cronJobs.js.map