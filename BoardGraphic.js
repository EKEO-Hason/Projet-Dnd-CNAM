// BoardGraphic.js
import { Board } from './Board.js';
import { Command, DeletePieceCommand, ChangeBackgroundCommand, AddPieceCommand, CalculDistanceCommand } from './Command.js';

export class BoardGraphic {
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
        this.selectedPiece = null; // Ajout pour la sélection
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
        // On dessine les éléments dans l'ordre du tableau (plus de tri zIndex)
        const elements = [...this.board.boardElements];
        for (let i = 0; i < elements.length; i++) {
            const el = elements[i];
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
        // Bordure de sélection toujours au-dessus
        if (this.selectedPiece) {
            const el = this.selectedPiece;
            let x, y;
            if (this.draggingPiece && this.draggingPiece.id === el.id) {
                x = this.draggingPiece.tempX;
                y = this.draggingPiece.tempY;
            } else {
                x = el.position.x;
                y = el.position.y;
            }
            this.ctx.save();
            this.ctx.strokeStyle = '#000000';
            this.ctx.lineWidth = 1;
            this.ctx.strokeRect(x - 2, y - 2, this.pieceSize + 4, this.pieceSize + 4);
            this.ctx.restore();
        }
    }

    _bindEvents() {
        this.canvas.addEventListener('mousedown', (e) => this._onMouseDown(e));
        this.canvas.addEventListener('mousemove', (e) => this._onMouseMove(e));
        this.canvas.addEventListener('mouseup', (e) => this._onMouseUp(e));
        this.canvas.addEventListener('contextmenu', (e) => this._onContextMenu(e));
    }

    _onMouseDown(e) {
        // Désactive le déplacement si clic droit (bouton 2)
        if (e.button === 2) return;
        const rect = this.canvas.getBoundingClientRect();
        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;
        let found = false;
        // On parcourt dans l'ordre du tableau (plus de tri zIndex)
        const elements = [...this.board.boardElements].slice().reverse();
        for (let i = 0; i < elements.length; i++) {
            const el = elements[i];
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
                if (!this.selectedPiece || this.selectedPiece.id !== el.id) {
                    this.selectedPiece = el;
                }
                // bringElementToFront ne fait plus rien
                this.board.bringElementToFront(el);
                this.selectedPiece = this.board.boardElements.find(e => e.id === el.id);
                this.render();
                found = true;
                break;
            }
        }
        if (!found) {
            this.selectedPiece = null;
            this.render();
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
            // bringElementToFront ne fait plus rien
            this.board.bringElementToFront(piece);
            this.selectedPiece = this.board.boardElements.find(e => e.id === id);
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

    _onContextMenu(e) {
        e.preventDefault();
        const rect = this.canvas.getBoundingClientRect();
        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;
        const element = this.board.getElementAt(mouseX, mouseY);
        this._showContextMenu(e.clientX, e.clientY, element);
    }

    _showContextMenu(x, y, element) {
        // Supprime un ancien menu s'il existe
        const oldMenu = document.getElementById('context-menu');
        if (oldMenu) oldMenu.remove();

        const menu = document.createElement('div');
        menu.id = 'context-menu';
        menu.style.position = 'absolute';
        menu.style.left = x + 'px';
        menu.style.top = y + 'px';
        menu.style.background = '#fff';
        menu.style.border = '1px solid #ccc';
        menu.style.zIndex = 1000;
        menu.style.padding = '6px 0';
        menu.style.boxShadow = '0 2px 8px rgba(0,0,0,0.15)';
        menu.style.minWidth = '140px';

        let commands = [];
        if (element && element.type === 'piece') {
            // Si une autre pièce est sélectionnée, propose la commande de calcul de distance
            if (this.selectedPiece && this.selectedPiece.id !== element.id) {
                commands.push(new CalculDistanceCommand(this.selectedPiece, element));
            }
            commands.push(new DeletePieceCommand(element));
        } else if (element && element.type === 'background') {
            commands.push(new ChangeBackgroundCommand());
        } else {
            commands.push(new AddPieceCommand());
        }
        for (const cmd of commands) {
            menu.appendChild(this._makeMenuItem(cmd.label, () => {
                cmd.execute();
                // Après calcul de distance, désélectionne la pièce
                if (cmd instanceof CalculDistanceCommand) {
                    this.selectedPiece = null;
                }
            }));
        }

        // Fermer le menu si on clique ailleurs
        setTimeout(() => {
            document.addEventListener('click', () => menu.remove(), { once: true });
        }, 0);

        document.body.appendChild(menu);
    }

    _makeMenuItem(label, action) {
        const item = document.createElement('div');
        item.textContent = label;
        item.style.padding = '6px 16px';
        item.style.cursor = 'pointer';
        item.addEventListener('click', (e) => {
            e.stopPropagation();
            document.getElementById('context-menu')?.remove();
            action();
        });
        item.addEventListener('mouseover', () => {
            item.style.background = '#eee';
        });
        item.addEventListener('mouseout', () => {
            item.style.background = '';
        });
        return item;
    }
}
