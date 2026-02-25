class Calculation {
    constructor() {
        this.history = [];
    }

    addEntry(operation, result) {
        const entry = {
            operation,
            result,
            timestamp: new Date().toISOString()
        };
        this.history.push(entry);
    }

    getHistory() {
        return this.history;
    }

    clearHistory() {
        this.history = [];
    }
}

module.exports = Calculation;