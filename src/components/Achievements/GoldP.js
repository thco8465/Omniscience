import AchievementStrategy from "./AchievementStrat";
export default class GoldPlayerAchievement extends AchievementStrategy {
  constructor() {
    super(30, 'Gold');
  }
}