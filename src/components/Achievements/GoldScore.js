// GoldScoreAchievement.js
import AchievementStrategy from './AchievementStrat';

export default class GoldScoreAchievement extends AchievementStrategy {
  constructor() {
    super(1000, 'Gold Medal for Score');
  }
}