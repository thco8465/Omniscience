// SilverScoreAchievement.js
import AchievementStrategy from './AchievementStrat';

export default class SilverScoreAchievement extends AchievementStrategy {
  constructor() {
    super(500, 'Silver Medal for Score');
  }
}