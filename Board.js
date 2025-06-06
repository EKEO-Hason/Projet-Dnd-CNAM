// Board.js
import { Observable } from './Observable.js';
import { BoardElementFactory } from './BoardElementFactory.js';

export class Board extends Observable {
    constructor() {
        if (Board._instance) {
            return Board._instance;
        }
        super();
        this.boardName = '';
        this.boardBackground = null;
        this.boardElements = [];
        Board._instance = this;
    }
    /**
     * @param {Object} data
     */
    loadFromData(data) {
        this.boardName = data.boardName;
        this.boardBackground = data.boardBackground;
        // On retire toute gestion du zIndex
        this.boardElements = data.boardElements.map(e => {
            const el = BoardElementFactory.create(e);
            delete el.zIndex;
            return el;
        });
        this.notify();
    }
    /**
     * @param {number} id
     * @param {Position} pos
     */
    updateElementPosition(id, pos) {
        const el = this.boardElements.find(e => e.id === id);
        if (el) {
            el.position = { ...pos };
            this.notify();
        }
    }
    /**
     * @returns {Board}
     */
    static getInstance() {
        if (!Board._instance) {
            Board._instance = new Board();
        }
        return Board._instance;
    }

    // Permet de trouver l'élément sous la souris
    getElementAt(x, y) {
        // Parcours à l'envers pour prioriser les éléments au-dessus
        for (let i = this.boardElements.length - 1; i >= 0; i--) {
            const el = this.boardElements[i];
            if (el.type === 'piece') {
                // Suppose que la taille des pièces est connue globalement (ex: 100)
                if (
                    x >= el.position.x &&
                    x <= el.position.x + 100 &&
                    y >= el.position.y &&
                    y <= el.position.y + 100
                ) {
                    return el;
                }
            }
        }
        return null;
   }

    // Nouvelle méthode pour réordonner les zIndex de façon unique et continue
    bringElementToFront(element) {
        // Ne fait plus rien, zIndex supprimé
        this.notify();
    }
}
