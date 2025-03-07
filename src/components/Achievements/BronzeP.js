import AchievementStrategy from "./AchievementStrat";
export default class BronzePlayerAchievement extends AchievementStrategy {
    constructor() {
      super(10, 'Bronze');
    }
  }