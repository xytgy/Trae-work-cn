/**
 * 成就系统
 * 从 GameLogic 中提取成就相关方法
 */
class AchievementSystem {
    constructor({ eventBus, gameLogic }) {
        this.eventBus = eventBus;
        this.gameLogic = gameLogic;
    }

    /**
     * 检查成就通知
     */
    checkAchievementNotifications() {
        const gl = this.gameLogic;
        const achievement = gl.achievementManager.popNewAchievement();
        if (achievement) {
            gl.achievementNotifications.push({
                achievement: achievement,
                timer: 3000,
                y: -50
            });

            if (achievement.reward) {
                if (achievement.reward.gold) {
                    gl.inventory.addGold(achievement.reward.gold, gl.player);
                }
                if (achievement.reward.gems) {
                    gl.inventory.addGems(achievement.reward.gems);
                }
            }
        }

        for (let i = gl.achievementNotifications.length - 1; i >= 0; i--) {
            const notif = gl.achievementNotifications[i];
            notif.timer -= 16;

            if (notif.y < 20) {
                notif.y += 2;
            }

            if (notif.timer <= 0) {
                gl.achievementNotifications.splice(i, 1);
            }
        }
    }
}
