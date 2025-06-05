let boardState = null;
let lastBoardStateJSON = null;
let draggingPiece = null;
let canvas, ctx;
const pieceSize = 100;

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

async function preloadImages(data) {
    if (data.boardBackground.type === "image" && !imageCache.background) {
        imageCache.background = await loadImage(data.boardBackground.url);
    }

    for (const el of data.boardElements) {
        if (el.type === "piece" && !imageCache.pieces[el.image]) {
            imageCache.pieces[el.image] = await loadImage(el.image);
        }
    }
}

async function fetchBoardUpdate() {
    try {
        const response = await fetch('./api/board');
        if (!response.ok) throw new Error("Erreur de récupération");

        const newBoard = await response.json();
        const newBoardJSON = JSON.stringify(newBoard);

        if (newBoardJSON !== lastBoardStateJSON && !draggingPiece) {
            boardState = newBoard;
            lastBoardStateJSON = newBoardJSON;
            await preloadImages(boardState);
            renderBoard();
        }
    } catch (err) {
        console.warn("Erreur fetch périodique :", err);
    }
}

async function loadBoard() {
    try {
        const response = await fetch('./api/board');
        if (!response.ok) throw new Error("Erreur de chargement initial");

        boardState = await response.json();
        lastBoardStateJSON = JSON.stringify(boardState);
        await preloadImages(boardState);
        renderBoard();

        // Lancer l'intervalle de surveillance
        setInterval(fetchBoardUpdate, 100);
    } catch (error) {
        console.error("Erreur :", error);
    }
}

function renderBoard() {
    canvas = document.getElementById('board');
    ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    document.getElementById('board-title').textContent = boardState.boardName;

    if (imageCache.background) {
        ctx.drawImage(imageCache.background, 0, 0, canvas.width, canvas.height);
    } else {
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
    }

    for (let i = 0; i < boardState.boardElements.length; i++) {
        const el = boardState.boardElements[i];
        if (el.type === "piece") {
            const img = imageCache.pieces[el.image];
            if (!img) continue;

            let x, y;
            if (draggingPiece && draggingPiece.id === i) {
                x = draggingPiece.tempX;
                y = draggingPiece.tempY;
            } else {
                x = el.position.x;
                y = el.position.y;
            }

            ctx.drawImage(img, x, y, pieceSize, pieceSize);
        }
    }
}

// 🔧 Mouse Events
canvas = document.getElementById('board');
canvas.addEventListener('mousedown', (e) => {
    const rect = canvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    for (let i = 0; i < boardState.boardElements.length; i++) {
        const el = boardState.boardElements[i];
        const x = el.position.x;
        const y = el.position.y;

        if (
            mouseX >= x &&
            mouseX <= x + pieceSize &&
            mouseY >= y &&
            mouseY <= y + pieceSize
        ) {
            draggingPiece = {
                id: i,
                offsetX: mouseX - x,
                offsetY: mouseY - y,
                tempX: x,
                tempY: y
            };
            break;
        }
    }
});

canvas.addEventListener('mousemove', (e) => {
    if (draggingPiece) {
        const rect = canvas.getBoundingClientRect();
        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;

        // Coordonnées libres, mais bloquées à ≥ 0
        draggingPiece.tempX = Math.max(0, mouseX - draggingPiece.offsetX);
        draggingPiece.tempY = Math.max(0, mouseY - draggingPiece.offsetY);

        renderBoard();
    }
});

canvas.addEventListener('mouseup', async (e) => {
    if (draggingPiece) {
        const id = draggingPiece.id;
        const newX = Math.max(0, draggingPiece.tempX);
        const newY = Math.max(0, draggingPiece.tempY);

        const piece = boardState.boardElements[id];
        piece.position = {
            x: parseFloat(newX.toFixed(2)),
            y: parseFloat(newY.toFixed(2))
        };

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

        draggingPiece = null;
        renderBoard();
    }
});

loadBoard();

