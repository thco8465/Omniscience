// Observer.js
// uses the Observer pattern to notify subscribers when the timer changes, 
// and it includes the necessary logic for managing the game state in a memory-matching game.
export default class Observer {
    constructor() {
      this.observers = [];
    }
  
    subscribe(callback) {
      this.observers.push(callback);
    }
  
    notify(data) {
      this.observers.forEach(observer => observer(data));
    }
  }
  