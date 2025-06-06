// BoardElementFactory.js
import { Piece } from './BoardElement.js';

export class BoardElementFactory {
    /**
     * @param {BoardElementData} data
     * @returns {BoardElement}
     */
    static create(data) {
        switch (data.type) {
            case 'piece':
                // On retire le zIndex à la création
                const d = { ...data };
                delete d.zIndex;
                return new Piece(d);
            // Ajoute d'autres types ici si besoin
            default:
                throw new Error('Type inconnu: ' + data.type);
        }
    }
}
