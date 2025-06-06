// Command.js
export class Command {
    /**
     * @param {string} label
     * @param {function} execute
     */
    constructor(label, execute) {
        this.label = label;
        this.execute = execute;
    }
}
export class CalculDistanceCommand extends Command {
    constructor(piece1, piece2) {
        super('Calculer la distance', () => {
            const dx = piece1.position.x - piece2.position.x;
            const dy = piece1.position.y - piece2.position.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            alert(`Distance entre ${piece1.name} et ${piece2.name} : ${distance.toFixed(2)}`);
        });
    }
}

export class DeletePieceCommand extends Command {
    constructor(piece) {
        super('Supprimer', () => alert('Supprimer ' + piece.name));
    }
}

export class ChangeBackgroundCommand extends Command {
    constructor() {
        super('Changer le fond', () => alert('Changer le fond'));
    }
}

export class AddPieceCommand extends Command {
    constructor() {
        super('Ajouter une pièce', () => alert('Ajouter une pièce'));
    }
}
