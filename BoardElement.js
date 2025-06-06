/**
 * @typedef {Object} Position
 * @property {number} x
 * @property {number} y
 */

/**
 * @typedef {Object} BoardElementData
 * @property {number} id
 * @property {string} type
 * @property {string} name
 * @property {Position} position
 * @property {string} image
 */

export class BoardElement {
    /**
     * @param {BoardElementData} data
     */
    constructor(data) {
        this.id = data.id;
        this.type = data.type;
        this.name = data.name;
        this.position = { ...data.position };
    }
}

export class Piece extends BoardElement {
    /**
     * @param {BoardElementData} data
     */
    constructor(data) {
        super(data);
        this.image = data.image;
    }
}
