class Corridor {
    constructor(fromRoom, toRoom) {
        this.fromRoom = fromRoom;
        this.toRoom = toRoom;

        const dx = toRoom.gridX - fromRoom.gridX;
        const dy = toRoom.gridY - fromRoom.gridY;

        if (dx !== 0) {
            this.direction = dx > 0 ? 'right' : 'left';
            this.width = LEVELS.DOOR_SIZE;
            this.length = LEVELS.ROOM_WIDTH / 2;

            const startX = dx > 0 ? fromRoom.right : toRoom.right;
            const startY = fromRoom.worldY + (LEVELS.ROOM_HEIGHT - this.width) / 2;

            this.x = startX;
            this.y = startY;
            this.left = startX;
            this.right = startX + this.length;
            this.top = startY;
            this.bottom = startY + this.width;
        } else {
            this.direction = dy > 0 ? 'down' : 'up';
            this.width = LEVELS.DOOR_SIZE;
            this.length = LEVELS.ROOM_HEIGHT / 2;

            const startX = fromRoom.worldX + (LEVELS.ROOM_WIDTH - this.width) / 2;
            const startY = dy > 0 ? fromRoom.bottom : toRoom.bottom;

            this.x = startX;
            this.y = startY;
            this.left = startX;
            this.right = startX + this.width;
            this.top = startY;
            this.bottom = startY + this.length;
        }

        this.tiles = [];
    }

    render(ctx) {
        ctx.fillStyle = '#ff0000';
        if (this.direction === 'right' || this.direction === 'left') {
            ctx.fillRect(this.left, this.top - 20, this.length, 20);
            ctx.fillRect(this.left, this.bottom, this.length, 20);
        } else {
            ctx.fillRect(this.left - 20, this.top, 20, this.length);
            ctx.fillRect(this.right, this.top, 20, this.length);
        }

        const tileSize = 32;
        ctx.fillStyle = '#00ff00';
        for (let ty = 0; ty < this.length; ty += tileSize) {
            for (let tx = 0; tx < this.width; tx += tileSize) {
                ctx.fillRect(this.x + tx, this.y + ty, tileSize, tileSize);
                ctx.strokeStyle = 'rgba(0, 0, 0, 0.3)';
                ctx.lineWidth = 1;
                ctx.strokeRect(this.x + tx + 0.5, this.y + ty + 0.5, tileSize - 1, tileSize - 1);
            }
        }
    }

    containsPoint(x, y) {
        return x >= this.left && x <= this.right && y >= this.top && y <= this.bottom;
    }
}
