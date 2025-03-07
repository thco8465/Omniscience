// BronzeScoreAchievement.js
import AchievementStrategy from './AchievementStrat';

export default class BronzeScoreAchievement extends AchievementStrategy {
  constructor() {
    super(100, 'Bronze Medal for Score');
  }
}