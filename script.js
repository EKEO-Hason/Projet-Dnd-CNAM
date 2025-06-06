import { Board } from './Board.js';
import { BoardGraphic } from './BoardGraphic.js';

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
