class Minimap {
    constructor() {
        this.visible = false;
        this.left = 20;
        this.top = 80;
        this.cellSize = 20;
        this.gap = 2;
        this.gridSize = 5;
        this.borderSize = 4;

        this.colors = {
            background: 'rgba(0, 0, 0, 0.7)',
            border: '#4a4060',
            visited: '#4caf50',
            connected: '#606070',
            unvisited: '#1a1a2e',
            player: '#4fc3f7',
            playerGlow: 'rgba(79, 195, 247, 0.5)',
            elite: '#ff4444',
            chest: '#ffd700',
            boss: '#9c27b0',
            trap: '#888888',
            shop: '#2196f3',
            rest: '#4caf50',
            marker: '#ffd700',
            fog: 'rgba(0, 0, 0, 0.8)'
        };

        this.INITIAL_ROOM_GRID_X = 2;
        this.INITIAL_ROOM_GRID_Y = 2;
        this.hasLeftInitialRoom = false;
    }

    init() {
        this.visible = false;
        this.hasLeftInitialRoom = false;
        this.playerRoom = null;
    }

    setPlayerRoom(roomNode) {
        this.playerRoom = roomNode;
    }

    updateRoomState(roomNode) {
        roomNode.markCleared();
    }

    show() {
        this.visible = true;
    }

    hide() {
        this.visible = false;
    }

    toggle() {
        this.visible = !this.visible;
    }

    setVisible(visible) {
        this.visible = visible;
    }

    onPlayerEnterRoom(roomNode) {
        const isInitialRoom =
            roomNode.gridX === this.INITIAL_ROOM_GRID_X && roomNode.gridY === this.INITIAL_ROOM_GRID_Y;

        if (!isInitialRoom) {
            this.hasLeftInitialRoom = true;
            this.visible = true;
        }
    }

    render(ctx, dungeonLevel, playerRoom) {
        if (!this.visible || !dungeonLevel || !dungeonLevel.rooms) {
            return;
        }

        const totalWidth = this.gridSize * (this.cellSize + this.gap) + this.borderSize * 2;
        const totalHeight = this.gridSize * (this.cellSize + this.gap) + this.borderSize * 2;

        this.drawBackground(ctx, totalWidth, totalHeight);
        this.drawGrid(ctx, dungeonLevel.rooms, playerRoom);
        this.drawConnections(ctx, dungeonLevel.rooms, playerRoom);
        this.drawPlayer(ctx, playerRoom);
        this.drawMarkers(ctx, dungeonLevel.rooms);
        this.drawFog(ctx, dungeonLevel.rooms, playerRoom, totalWidth, totalHeight);
    }

    drawBackground(ctx, width, height) {
        ctx.fillStyle = this.colors.background;
        ctx.fillRect(this.left, this.top, width, height);

        ctx.strokeStyle = this.colors.border;
        ctx.lineWidth = 2;
        ctx.strokeRect(this.left + 0.5, this.top + 0.5, width - 1, height - 1);
    }

    drawGrid(ctx, rooms, playerRoom) {
        for (const roomNode of rooms) {
            const screenX = this.left + this.borderSize + roomNode.gridX * (this.cellSize + this.gap);
            const screenY = this.top + this.borderSize + roomNode.gridY * (this.cellSize + this.gap);

            const color = this.getRoomColor(roomNode, playerRoom);

            ctx.fillStyle = color;
            ctx.fillRect(screenX, screenY, this.cellSize, this.cellSize);

            if (roomNode.cleared) {
                ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
                ctx.fillRect(screenX + 2, screenY + 2, this.cellSize - 4, this.cellSize - 4);
            }

            if (roomNode.hasPortal) {
                ctx.fillStyle = '#9c27b0';
                ctx.beginPath();
                ctx.arc(screenX + this.cellSize / 2, screenY + this.cellSize / 2, 3, 0, Math.PI * 2);
                ctx.fill();
            }
        }
    }

    getRoomColor(roomNode, playerRoom) {
        if (roomNode === playerRoom) {
            return this.colors.player;
        }

        if (roomNode.entered) {
            return this.colors.visited;
        }

        if (this.isConnectedToVisited(roomNode)) {
            return this.colors.connected;
        }

        return this.colors.unvisited;
    }

    isConnectedToVisited(roomNode) {
        if (!roomNode.connections) {
            return false;
        }

        for (const connection of roomNode.connections) {
            if (connection.entered && connection.cleared) {
                return true;
            }
        }
        return false;
    }

    drawConnections(ctx, rooms, playerRoom) {
        for (const roomNode of rooms) {
            const screenX =
                this.left + this.borderSize + roomNode.gridX * (this.cellSize + this.gap) + this.cellSize / 2;
            const screenY =
                this.top + this.borderSize + roomNode.gridY * (this.cellSize + this.gap) + this.cellSize / 2;

            if (!roomNode.entered && !this.isConnectedToVisited(roomNode)) {
                continue;
            }

            for (const neighbor of roomNode.connections) {
                if (
                    neighbor.gridX < roomNode.gridX ||
                    (neighbor.gridX === roomNode.gridX && neighbor.gridY < roomNode.gridY)
                ) {
                    continue;
                }

                const neighborX =
                    this.left + this.borderSize + neighbor.gridX * (this.cellSize + this.gap) + this.cellSize / 2;
                const neighborY =
                    this.top + this.borderSize + neighbor.gridY * (this.cellSize + this.gap) + this.cellSize / 2;

                ctx.strokeStyle = this.colors.border;
                ctx.lineWidth = 2;
                ctx.beginPath();
                ctx.moveTo(screenX, screenY);
                ctx.lineTo(neighborX, neighborY);
                ctx.stroke();
            }
        }
    }

    drawPlayer(ctx, playerRoom) {
        if (!playerRoom) {
            return;
        }

        const screenX = this.left + this.borderSize + playerRoom.gridX * (this.cellSize + this.gap) + this.cellSize / 2;
        const screenY = this.top + this.borderSize + playerRoom.gridY * (this.cellSize + this.gap) + this.cellSize / 2;

        const glowGradient = ctx.createRadialGradient(screenX, screenY, 0, screenX, screenY, 8);
        glowGradient.addColorStop(0, this.colors.playerGlow);
        glowGradient.addColorStop(1, 'transparent');

        ctx.fillStyle = glowGradient;
        ctx.beginPath();
        ctx.arc(screenX, screenY, 8, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = this.colors.player;
        ctx.beginPath();
        ctx.arc(screenX, screenY, 4, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(screenX, screenY, 2, 0, Math.PI * 2);
        ctx.fill();
    }

    drawMarkers(ctx, rooms) {
        for (const roomNode of rooms) {
            if (!roomNode.entered && !this.isConnectedToVisited(roomNode)) {
                continue;
            }

            const screenX =
                this.left + this.borderSize + roomNode.gridX * (this.cellSize + this.gap) + this.cellSize / 2;
            const screenY =
                this.top + this.borderSize + roomNode.gridY * (this.cellSize + this.gap) + this.cellSize / 2;

            if (this.isSpecialRoom(roomNode)) {
                ctx.fillStyle = this.colors.marker;
                ctx.font = 'bold 12px "Courier New", monospace';
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.fillText('!', screenX, screenY);
            }
        }
    }

    isSpecialRoom(roomNode) {
        const specialTypes = [ROOM_TYPES.ELITE, ROOM_TYPES.CHEST, ROOM_TYPES.BOSS];
        return specialTypes.includes(roomNode.roomType);
    }

    drawFog(ctx, rooms, playerRoom, totalWidth, totalHeight) {
        for (let gridY = 0; gridY < this.gridSize; gridY++) {
            for (let gridX = 0; gridX < this.gridSize; gridX++) {
                const roomNode = this.findRoomByGrid(rooms, gridX, gridY);

                if (!roomNode) {
                    const screenX = this.left + this.borderSize + gridX * (this.cellSize + this.gap);
                    const screenY = this.top + this.borderSize + gridY * (this.cellSize + this.gap);

                    ctx.fillStyle = this.colors.fog;
                    ctx.fillRect(screenX, screenY, this.cellSize, this.cellSize);
                } else if (!roomNode.entered && !this.isConnectedToVisited(roomNode)) {
                    const screenX = this.left + this.borderSize + gridX * (this.cellSize + this.gap);
                    const screenY = this.top + this.borderSize + gridY * (this.cellSize + this.gap);

                    ctx.fillStyle = this.colors.fog;
                    ctx.fillRect(screenX, screenY, this.cellSize, this.cellSize);
                }
            }
        }
    }

    findRoomByGrid(rooms, gridX, gridY) {
        return rooms.find((r) => r.gridX === gridX && r.gridY === gridY);
    }

    getRoomTypeColor(roomType) {
        switch (roomType) {
            case ROOM_TYPES.ELITE:
                return this.colors.elite;
            case ROOM_TYPES.CHEST:
                return this.colors.chest;
            case ROOM_TYPES.BOSS:
                return this.colors.boss;
            case ROOM_TYPES.TRAP:
                return this.colors.trap;
            case ROOM_TYPES.SHOP:
                return this.colors.shop;
            case ROOM_TYPES.REST:
                return this.colors.rest;
            default:
                return this.colors.visited;
        }
    }

    update(deltaTime) {}

    reset() {
        this.visible = false;
        this.hasLeftInitialRoom = false;
    }
}
