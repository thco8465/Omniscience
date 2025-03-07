// The AchievementStrategy class is a base class for 
// all achievement strategies, defining a common interface 
//(isAchieved) that will be implemented by concrete achievements.
// BronzePlayerAchievement, SilverPlayerAchievement, 
// and GoldPlayerAchievement are concrete 
// implementations of the strategy, each with its 
// own threshold and name.
// The timeBasedAchievements array holds 
// instances of these strategies.
//Purpose: Easily add new achievements by creating additional strategy classes without modifying the Achievements Page component. 
//The Achievements Page component works with the interface defined by the AchievementStrategy base class, allowing for dynamic interchangeability 
//of achievements.

export default class AchievementStrategy {
  constructor(threshold, name) {
    this.threshold = threshold;
    this.name = name;
  }

  isAchieved(totalTimePlayed) {
    return totalTimePlayed >= this.threshold;
  }
}