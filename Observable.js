// Observable.js
export class Observable {
    constructor() {
        this._observers = [];
    }
    addObserver(fn) {
        this._observers.push(fn);
    }
    notify() {
        for (const fn of this._observers) fn(this);
    }
}
