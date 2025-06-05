// --- Interfaces (JSDoc) ---
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

// --- BoardElement & Piece ---
class BoardElement {
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

class Piece extends BoardElement {
    /**
     * @param {BoardElementData} data
     */
    constructor(data) {
        super(data);
        this.image = data.image;
    }
}

// --- Factory ---
class BoardElementFactory {
    /**
     * @param {BoardElementData} data
     * @returns {BoardElement}
     */
    static create(data) {
        switch (data.type) {
            case 'piece':
                return new Piece(data);
            // Ajoute d'autres types ici si besoin
            default:
                throw new Error('Type inconnu: ' + data.type);
        }
    }
}

// --- Observer Pattern ---
class Observable {
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

// --- Board (Singleton) ---
class Board extends Observable {

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
        this.boardElements = data.boardElements.map(BoardElementFactory.create);
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
}

// --- BoardGraphic ---
class BoardGraphic {
    /**
     * @param {HTMLCanvasElement} canvas
     * @param {Board} board
     * @param {Object} imageCache
     * @param {number} pieceSize
     */
    constructor(canvas, board, imageCache, pieceSize = 100) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.board = board;
        this.imageCache = imageCache;
        this.pieceSize = pieceSize;
        this.draggingPiece = null;
        this._bindEvents();
    }

    render() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        document.getElementById('board-title').textContent = this.board.boardName;
        if (this.imageCache.background) {
            this.ctx.drawImage(this.imageCache.background, 0, 0, this.canvas.width, this.canvas.height);
        } else {
            this.ctx.fillStyle = "#ffffff";
            this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        }
        for (let i = 0; i < this.board.boardElements.length; i++) {
            const el = this.board.boardElements[i];
            if (el.type === "piece") {
                const img = this.imageCache.pieces[el.image];
                if (!img) continue;
                let x, y;
                if (this.draggingPiece && this.draggingPiece.id === el.id) {
                    x = this.draggingPiece.tempX;
                    y = this.draggingPiece.tempY;
                } else {
                    x = el.position.x;
                    y = el.position.y;
                }
                this.ctx.drawImage(img, x, y, this.pieceSize, this.pieceSize);
            }
        }
    }

    _bindEvents() {
        this.canvas.addEventListener('mousedown', (e) => this._onMouseDown(e));
        this.canvas.addEventListener('mousemove', (e) => this._onMouseMove(e));
        this.canvas.addEventListener('mouseup', (e) => this._onMouseUp(e));
    }

    _onMouseDown(e) {
        const rect = this.canvas.getBoundingClientRect();
        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;
        for (let i = 0; i < this.board.boardElements.length; i++) {
            const el = this.board.boardElements[i];
            const x = el.position.x;
            const y = el.position.y;
            if (
                mouseX >= x &&
                mouseX <= x + this.pieceSize &&
                mouseY >= y &&
                mouseY <= y + this.pieceSize
            ) {
                this.draggingPiece = {
                    id: el.id,
                    offsetX: mouseX - x,
                    offsetY: mouseY - y,
                    tempX: x,
                    tempY: y
                };
                break;
            }
        }
    }

    _onMouseMove(e) {
        if (this.draggingPiece) {
            const rect = this.canvas.getBoundingClientRect();
            const mouseX = e.clientX - rect.left;
            const mouseY = e.clientY - rect.top;
            this.draggingPiece.tempX = Math.max(0, mouseX - this.draggingPiece.offsetX);
            this.draggingPiece.tempY = Math.max(0, mouseY - this.draggingPiece.offsetY);
            this.render();
        }
    }

    async _onMouseUp(e) {
        if (this.draggingPiece) {
            const id = this.draggingPiece.id;
            const newX = Math.max(0, this.draggingPiece.tempX);
            const newY = Math.max(0, this.draggingPiece.tempY);
            this.board.updateElementPosition(id, {
                x: parseFloat(newX.toFixed(2)),
                y: parseFloat(newY.toFixed(2))
            });
            const piece = this.board.boardElements.find(e => e.id === id);
            try {
                const response = await fetch('./api/board', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ ...piece, id })
                });
                const result = await response.json();
                if (result.status !== 'success') {
                    console.error("Erreur de sauvegarde :", result.message);
                }
            } catch (err) {
                console.error("Erreur API :", err);
            }
            this.draggingPiece = null;
        }
    }
}


// --- Image Cache ---
const imageCache = {
    background: null,
    pieces: {}
};

async function loadImage(url) {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.crossOrigin = "anonymous";
        img.onload = () => resolve(img);
        img.onerror = reject;
        img.src = url;
    });
}

async function preloadImages(board) {
    if (board.boardBackground.type === "image" && !imageCache.background) {
        imageCache.background = await loadImage(board.boardBackground.url);
    }
    for (const el of board.boardElements) {
        if (el.type === "piece" && !imageCache.pieces[el.image]) {
            imageCache.pieces[el.image] = await loadImage(el.image);
        }
    }
}

// --- Main Logic ---
let lastBoardStateJSON = null;
const canvas = document.getElementById('board');
const ctx = canvas.getContext('2d');
let boardGraphic = new BoardGraphic(canvas, Board.getInstance(), imageCache);

async function fetchBoardUpdate() {
    try {
        const response = await fetch('./api/board');
        if (!response.ok) throw new Error("Erreur de récupération");
        const newBoard = await response.json();
        const newBoardJSON = JSON.stringify(newBoard);
        if (newBoardJSON !== lastBoardStateJSON && !boardGraphic.draggingPiece) {
            await preloadImages({
                boardBackground: newBoard.boardBackground,
                boardElements: newBoard.boardElements
            });
            Board.getInstance().loadFromData(newBoard);
            lastBoardStateJSON = newBoardJSON;
        }
    } catch (err) {
        console.warn("Erreur fetch périodique :", err);
    }
}

async function loadBoard() {
    try {
        const response = await fetch('./api/board');
        if (!response.ok) throw new Error("Erreur de chargement initial");
        const data = await response.json();
        await preloadImages({
            boardBackground: data.boardBackground,
            boardElements: data.boardElements
        });
        Board.getInstance().loadFromData(data);
        lastBoardStateJSON = JSON.stringify(data);
        setInterval(fetchBoardUpdate, 100);
    } catch (error) {
        console.error("Erreur :", error);
    }
}

// --- Observer: Vue s'abonne ---
Board.getInstance().addObserver(() => boardGraphic.render());

loadBoard();

