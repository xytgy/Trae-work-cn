class RoomRenderer {
    constructor() {
        this.width = LEVELS.ROOM_WIDTH;
        this.height = LEVELS.ROOM_HEIGHT;
        this.wallThickness = LEVELS.WALL_THICKNESS;
        this.doorSize = LEVELS.DOOR_SIZE;
        this.floorTileSize = FLOOR_TILE.SIZE;

        this.themeColors = {
            default: {
                backgroundColor: COLORS.DUNGEON.BACKGROUND,
                floorColor: COLORS.DUNGEON.FLOOR,
                wallColor: COLORS.DUNGEON.WALL,
                doorColor: COLORS.DUNGEON.DOOR
            },
            elite: {
                backgroundColor: '#2d1010',
                floorColor: '#1a0a0a',
                wallColor: '#5a2020',
                doorColor: '#ff4444'
            },
            boss: {
                backgroundColor: '#1a0a2e',
                floorColor: '#0f051a',
                wallColor: '#3a1a4e',
                doorColor: '#9c27b0'
            },
            chest: {
                backgroundColor: '#1a1a0a',
                floorColor: '#101005',
                wallColor: '#3a3a1a',
                doorColor: '#ffd700'
            },
            shop: {
                backgroundColor: '#0a1a2a',
                floorColor: '#05101a',
                wallColor: '#1a3a4a',
                doorColor: '#2196f3'
            },
            rest: {
                backgroundColor: '#0a2a1a',
                floorColor: '#051a10',
                wallColor: '#1a4a2a',
                doorColor: '#4caf50'
            },
            trap: {
                backgroundColor: '#1a1a1a',
                floorColor: '#101010',
                wallColor: '#3a3a3a',
                doorColor: '#888888'
            }
        };

        this.decorations = [];
        this.floorTiles = [];
        this.backgroundCanvas = null;
        this.backgroundCtx = null;
    }

    getThemeColors(roomType) {
        return this.themeColors[roomType] || this.themeColors.default;
    }

    generateFloorTiles(colors) {
        this.floorTiles = [];
        const tileSize = this.floorTileSize;
        const rows = Math.ceil(this.height / tileSize);
        const cols = Math.ceil(this.width / tileSize);

        for (let row = 0; row < rows; row++) {
            for (let col = 0; col < cols; col++) {
                const x = col * tileSize;
                const y = row * tileSize;

                if (x >= this.wallThickness &&
                    x < this.width - this.wallThickness &&
                    y >= this.wallThickness &&
                    y < this.height - this.wallThickness) {

                    let type = FLOOR_TILE.TYPES.NORMAL;
                    const rand = Math.random();
                    if (rand < FLOOR_TILE.PATTERN_CHANCE) {
                        type = FLOOR_TILE.TYPES.PATTERN;
                    } else if (rand < FLOOR_TILE.PATTERN_CHANCE + FLOOR_TILE.WORN_CHANCE) {
                        type = FLOOR_TILE.TYPES.WORN;
                    }

                    this.floorTiles.push({ x, y, type, baseColor: this.getRandomFloorColor(), detailColor: FLOOR_TILE.COLORS.DETAIL });
                }
            }
        }
    }

    getRandomFloorColor() {
        const colors = FLOOR_TILE.COLORS.BASE;
        return colors[Math.floor(Math.random() * colors.length)];
    }

    generateDecorations(roomType) {
        this.decorations = [];
        const margin = 50;
        const playableArea = this.getPlayableArea();

        const torchPositions = [
            { x: this.wallThickness + 30, y: this.wallThickness + 30 },
            { x: this.width - this.wallThickness - 30, y: this.wallThickness + 30 },
            { x: this.wallThickness + 30, y: this.height - this.wallThickness - 30 },
            { x: this.width - this.wallThickness - 30, y: this.height - this.wallThickness - 30 }
        ];

        for (let i = 0; i < DECORATIONS.TORCH_COUNT && i < torchPositions.length; i++) {
            const pos = torchPositions[i];
            this.decorations.push({ x: pos.x, y: pos.y, type: DECORATIONS.TYPES.TORCH, animTimer: Math.random() * 1000 });
        }

        for (let i = 0; i < DECORATIONS.SKULL_COUNT; i++) {
            const x = playableArea.x + margin + Math.random() * (playableArea.width - margin * 2);
            const y = playableArea.y + margin + Math.random() * (playableArea.height - margin * 2);
            this.decorations.push({ x, y, type: DECORATIONS.TYPES.SKULL });
        }

        for (let i = 0; i < DECORATIONS.PILLAR_COUNT; i++) {
            let x, y;
            let attempts = 0;
            do {
                x = playableArea.x + margin + Math.random() * (playableArea.width - margin * 2);
                y = playableArea.y + margin + Math.random() * (playableArea.height - margin * 2);
                attempts++;
            } while (
                Math.abs(x - this.width / 2) < 100 &&
                Math.abs(y - this.height / 2) < 100 &&
                attempts < 10
            );
            this.decorations.push({ x, y, type: DECORATIONS.TYPES.PILLAR });
        }

        if (roomType !== ROOM_TYPES.CHEST) {
            for (let i = 0; i < DECORATIONS.CHEST_COUNT; i++) {
                const x = playableArea.x + margin + Math.random() * (playableArea.width - margin * 2);
                const y = playableArea.y + margin + Math.random() * (playableArea.height - margin * 2);
                this.decorations.push({ x, y, type: DECORATIONS.TYPES.CHEST });
            }
        }
    }

    getPlayableArea() {
        return {
            x: this.wallThickness,
            y: this.wallThickness,
            width: this.width - this.wallThickness * 2,
            height: this.height - this.wallThickness * 2
        };
    }

    preRenderBackground(roomNode) {
        if (!roomNode) return;

        const colors = this.getThemeColors(roomNode.roomType);

        this.backgroundCanvas = document.createElement('canvas');
        this.backgroundCanvas.width = this.width;
        this.backgroundCanvas.height = this.height;
        this.backgroundCtx = this.backgroundCanvas.getContext('2d');

        this.generateFloorTiles(colors);
        this.generateDecorations(roomNode.roomType);

        const ctx = this.backgroundCtx;

        ctx.fillStyle = colors.backgroundColor;
        ctx.fillRect(0, 0, this.width, this.height);

        this.drawFloorPattern(ctx);
        this.drawWalls(ctx, colors, roomNode);
        this.drawDoors(ctx, roomNode, colors);
        this.drawDoorGlows(ctx, roomNode, colors);
    }

    drawFloorPattern(ctx) {
        for (const tile of this.floorTiles) {
            const size = this.floorTileSize;

            ctx.fillStyle = tile.baseColor;
            ctx.fillRect(tile.x, tile.y, size, size);

            if (tile.type === FLOOR_TILE.TYPES.PATTERN) {
                ctx.fillStyle = tile.detailColor;
                ctx.fillRect(tile.x + 14, tile.y + 14, 4, 4);
                ctx.fillRect(tile.x + 4, tile.y + 4, 2, 2);
                ctx.fillRect(tile.x + 26, tile.y + 4, 2, 2);
                ctx.fillRect(tile.x + 4, tile.y + 26, 2, 2);
                ctx.fillRect(tile.x + 26, tile.y + 26, 2, 2);
            } else if (tile.type === FLOOR_TILE.TYPES.WORN) {
                ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
                ctx.fillRect(tile.x + 8, tile.y + 16, 16, 2);
                ctx.fillRect(tile.x + 12, tile.y + 12, 8, 2);
            }

            ctx.strokeStyle = FLOOR_TILE.COLORS.GAP;
            ctx.lineWidth = 1;
            ctx.strokeRect(tile.x + 0.5, tile.y + 0.5, size - 1, size - 1);
        }
    }

    drawWalls(ctx, colors, roomNode) {
        const centerX = this.width / 2;
        const centerY = this.height / 2;
        const doorWidth = this.doorSize;
        const halfDoorWidth = doorWidth / 2;

        if (roomNode.hasDoor(DOOR.TOP)) {
            this.drawBrickWall(ctx, 0, 0, centerX - halfDoorWidth, this.wallThickness, 'top', colors);
            this.drawBrickWall(ctx, centerX + halfDoorWidth, 0, this.width - centerX - halfDoorWidth, this.wallThickness, 'top', colors);
        } else {
            this.drawBrickWall(ctx, 0, 0, this.width, this.wallThickness, 'top', colors);
        }

        if (roomNode.hasDoor(DOOR.BOTTOM)) {
            this.drawBrickWall(ctx, 0, this.height - this.wallThickness, centerX - halfDoorWidth, this.wallThickness, 'bottom', colors);
            this.drawBrickWall(ctx, centerX + halfDoorWidth, this.height - this.wallThickness, this.width - centerX - halfDoorWidth, this.wallThickness, 'bottom', colors);
        } else {
            this.drawBrickWall(ctx, 0, this.height - this.wallThickness, this.width, this.wallThickness, 'bottom', colors);
        }

        if (roomNode.hasDoor(DOOR.LEFT)) {
            this.drawBrickWall(ctx, 0, 0, this.wallThickness, centerY - halfDoorWidth, 'left', colors);
            this.drawBrickWall(ctx, 0, centerY + halfDoorWidth, this.wallThickness, this.height - centerY - halfDoorWidth, 'left', colors);
        } else {
            this.drawBrickWall(ctx, 0, 0, this.wallThickness, this.height, 'left', colors);
        }

        if (roomNode.hasDoor(DOOR.RIGHT)) {
            this.drawBrickWall(ctx, this.width - this.wallThickness, 0, this.wallThickness, centerY - halfDoorWidth, 'right', colors);
            this.drawBrickWall(ctx, this.width - this.wallThickness, centerY + halfDoorWidth, this.wallThickness, this.height - centerY - halfDoorWidth, 'right', colors);
        } else {
            this.drawBrickWall(ctx, this.width - this.wallThickness, 0, this.wallThickness, this.height, 'right', colors);
        }
    }

    drawBrickWall(ctx, x, y, width, height, side, colors) {
        const brickWidth = WALL_BRICK.BRICK_WIDTH;
        const brickHeight = WALL_BRICK.BRICK_HEIGHT;

        const rows = Math.ceil(height / brickHeight);
        const cols = Math.ceil(width / brickWidth);

        for (let row = 0; row < rows; row++) {
            for (let col = 0; col < cols; col++) {
                const offset = row % 2 === 0 ? 0 : brickWidth / 2;
                const bx = x + col * brickWidth + offset;
                const by = y + row * brickHeight;

                if (bx > x + width) continue;
                if (bx + brickWidth - 2 < x) continue;

                ctx.fillStyle = colors.wallColor;
                ctx.fillRect(bx, by, brickWidth - 2, brickHeight - 2);

                ctx.fillStyle = WALL_BRICK.COLORS.HIGHLIGHT;
                ctx.fillRect(bx, by, brickWidth - 2, 2);
                ctx.fillRect(bx, by, 2, brickHeight - 2);

                ctx.fillStyle = WALL_BRICK.COLORS.SHADOW;
                ctx.fillRect(bx, by + brickHeight - 4, brickWidth - 2, 2);
                ctx.fillRect(bx + brickWidth - 4, by, 2, brickHeight - 2);
            }
        }
    }

    drawDoors(ctx, roomNode, colors) {
        const doorWidth = this.doorSize;
        const doorHeight = this.wallThickness;
        const centerX = this.width / 2;
        const centerY = this.height / 2;
        const frameThickness = 3;

        const drawDoorFrame = (x, y, w, h, isVertical) => {
            ctx.fillStyle = colors.doorColor;
            ctx.fillRect(x, y, w, h);

            ctx.fillStyle = '#3a3a4a';
            ctx.fillRect(x + frameThickness, y + frameThickness, w - frameThickness * 2, h - frameThickness * 2);

            ctx.fillStyle = '#5a5a6a';
            if (isVertical) {
                ctx.fillRect(x + 2, y + 2, 2, h - 4);
                ctx.fillRect(x + w - 4, y + 2, 2, h - 4);
            } else {
                ctx.fillRect(x + 2, y + 2, w - 4, 2);
                ctx.fillRect(x + 2, y + h - 4, w - 4, 2);
            }

            ctx.fillStyle = '#2a2a3a';
            if (isVertical) {
                ctx.fillRect(x + w - 1, y, 1, h);
                ctx.fillRect(x, y + h - 1, w, 1);
            } else {
                ctx.fillRect(x + w - 1, y, 1, h);
                ctx.fillRect(x, y + h - 1, w, 1);
            }
        };

        if (roomNode.hasDoor(DOOR.TOP)) {
            drawDoorFrame(centerX - doorWidth / 2, 0, doorWidth, doorHeight, false);
        }

        if (roomNode.hasDoor(DOOR.BOTTOM)) {
            drawDoorFrame(centerX - doorWidth / 2, this.height - doorHeight, doorWidth, doorHeight, false);
        }

        if (roomNode.hasDoor(DOOR.LEFT)) {
            drawDoorFrame(0, centerY - doorWidth / 2, doorHeight, doorWidth, true);
        }

        if (roomNode.hasDoor(DOOR.RIGHT)) {
            drawDoorFrame(this.width - doorHeight, centerY - doorWidth / 2, doorHeight, doorWidth, true);
        }
    }

    drawDoorGlows(ctx, roomNode, colors) {
        const doorWidth = this.doorSize;
        const centerX = this.width / 2;
        const centerY = this.height / 2;
        const glowSize = 40;

        const drawGlow = (cx, cy, direction) => {
            const gradient = ctx.createRadialGradient(cx, cy, 0, cx, cy, glowSize);
            gradient.addColorStop(0, 'rgba(255, 255, 200, 0.2)');
            gradient.addColorStop(0.5, 'rgba(255, 255, 200, 0.1)');
            gradient.addColorStop(1, 'rgba(255, 255, 200, 0)');
            ctx.fillStyle = gradient;

            let rectX, rectY, rectW, rectH;
            if (direction === 'top') {
                rectX = cx - glowSize;
                rectY = this.wallThickness - 5;
                rectW = glowSize * 2;
                rectH = glowSize;
            } else if (direction === 'bottom') {
                rectX = cx - glowSize;
                rectY = this.height - this.wallThickness - glowSize + 5;
                rectW = glowSize * 2;
                rectH = glowSize;
            } else if (direction === 'left') {
                rectX = this.wallThickness - 5;
                rectY = cy - glowSize;
                rectW = glowSize;
                rectH = glowSize * 2;
            } else {
                rectX = this.width - this.wallThickness - glowSize + 5;
                rectY = cy - glowSize;
                rectW = glowSize;
                rectH = glowSize * 2;
            }
            ctx.fillRect(rectX, rectY, rectW, rectH);
        };

        if (roomNode.hasDoor(DOOR.TOP)) {
            drawGlow(centerX, this.wallThickness, 'top');
        }
        if (roomNode.hasDoor(DOOR.BOTTOM)) {
            drawGlow(centerX, this.height - this.wallThickness, 'bottom');
        }
        if (roomNode.hasDoor(DOOR.LEFT)) {
            drawGlow(this.wallThickness, centerY, 'left');
        }
        if (roomNode.hasDoor(DOOR.RIGHT)) {
            drawGlow(this.width - this.wallThickness, centerY, 'right');
        }
    }

    render(ctx, roomNode, doorManager) {
        if (this.backgroundCanvas) {
            ctx.drawImage(this.backgroundCanvas, 0, 0);
        } else {
            this.preRenderBackground(roomNode);
            ctx.drawImage(this.backgroundCanvas, 0, 0);
        }

        this.renderDecorations(ctx);

        if (doorManager) {
            this.renderDoorsWithState(ctx, roomNode, doorManager);
        }

        this.renderEliteRoomEffects(ctx, roomNode);
    }

    renderDecorations(ctx) {
        const time = Date.now();

        for (const decoration of this.decorations) {
            switch (decoration.type) {
                case DECORATIONS.TYPES.TORCH:
                    this.renderTorch(ctx, decoration, time);
                    break;
                case DECORATIONS.TYPES.SKULL:
                    this.renderSkull(ctx, decoration);
                    break;
                case DECORATIONS.TYPES.CHEST:
                    this.renderChest(ctx, decoration);
                    break;
                case DECORATIONS.TYPES.PILLAR:
                    this.renderPillar(ctx, decoration);
                    break;
            }
        }
    }

    renderTorch(ctx, torch, time) {
        ctx.fillStyle = '#5a3010';
        ctx.fillRect(torch.x - 2, torch.y, 4, 20);

        const flicker = Math.sin(time / 50 + torch.animTimer) * 2;
        ctx.fillStyle = '#ff6600';
        ctx.beginPath();
        ctx.moveTo(torch.x - 5, torch.y);
        ctx.quadraticCurveTo(torch.x, torch.y - 15 + flicker, torch.x + 5, torch.y);
        ctx.fill();

        ctx.fillStyle = '#ffff00';
        ctx.beginPath();
        ctx.moveTo(torch.x - 3, torch.y - 2);
        ctx.quadraticCurveTo(torch.x, torch.y - 10 + flicker, torch.x + 3, torch.y - 2);
        ctx.fill();
    }

    renderSkull(ctx, skull) {
        ctx.fillStyle = '#d0d0d0';
        ctx.beginPath();
        ctx.arc(skull.x, skull.y, 8, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#1a1a1a';
        ctx.beginPath();
        ctx.arc(skull.x - 3, skull.y - 1, 2, 0, Math.PI * 2);
        ctx.arc(skull.x + 3, skull.y - 1, 2, 0, Math.PI * 2);
        ctx.fill();

        ctx.beginPath();
        ctx.moveTo(skull.x, skull.y + 2);
        ctx.lineTo(skull.x - 2, skull.y + 5);
        ctx.lineTo(skull.x + 2, skull.y + 5);
        ctx.fill();
    }

    renderChest(ctx, chest) {
        ctx.fillStyle = '#8b4513';
        ctx.fillRect(chest.x - 12, chest.y - 10, 24, 20);

        ctx.fillStyle = '#a0522d';
        ctx.fillRect(chest.x - 14, chest.y - 14, 28, 8);

        ctx.fillStyle = '#daa520';
        ctx.fillRect(chest.x - 14, chest.y - 2, 28, 2);
        ctx.fillRect(chest.x - 2, chest.y - 14, 4, 24);

        ctx.fillStyle = '#ffd700';
        ctx.fillRect(chest.x - 3, chest.y - 4, 6, 6);
    }

    renderPillar(ctx, pillar) {
        ctx.fillStyle = '#606070';
        ctx.fillRect(pillar.x - 10, pillar.y - 30, 20, 40);

        ctx.fillStyle = '#707080';
        ctx.fillRect(pillar.x - 14, pillar.y - 34, 28, 6);
        ctx.fillRect(pillar.x - 14, pillar.y + 6, 28, 6);

        ctx.fillStyle = '#505060';
        for (let i = 0; i < 3; i++) {
            ctx.fillRect(pillar.x - 8, pillar.y - 20 + i * 12, 16, 2);
        }
    }

    renderDoorsWithState(ctx, roomNode, doorManager) {
        const doorWidth = this.doorSize;
        const doorHeight = this.wallThickness;
        const centerX = this.width / 2;
        const centerY = this.height / 2;

        const directions = ['top', 'bottom', 'left', 'right'];
        const doorDirections = [DOOR.TOP, DOOR.BOTTOM, DOOR.LEFT, DOOR.RIGHT];
        const positions = [
            { x: centerX - doorWidth / 2, y: 0, w: doorWidth, h: doorHeight },
            { x: centerX - doorWidth / 2, y: this.height - doorHeight, w: doorWidth, h: doorHeight },
            { x: 0, y: centerY - doorWidth / 2, w: doorHeight, h: doorWidth },
            { x: this.width - doorHeight, y: centerY - doorWidth / 2, w: doorHeight, h: doorWidth }
        ];

        for (let i = 0; i < directions.length; i++) {
            if (roomNode.hasDoor(doorDirections[i])) {
                const state = doorManager.getDoorState(roomNode, directions[i]);
                const pos = positions[i];

                if (state === 'closed' || state === 'locked') {
                    ctx.fillStyle = state === 'locked' ? '#8b0000' : '#4a4060';
                    ctx.fillRect(pos.x + 2, pos.y + 2, pos.w - 4, pos.h - 4);

                    if (state === 'locked') {
                        ctx.fillStyle = '#ffd700';
                        ctx.font = '14px "Courier New", monospace';
                        ctx.textAlign = 'center';
                        ctx.textBaseline = 'middle';
                        ctx.fillText('🔒', pos.x + pos.w / 2, pos.y + pos.h / 2);
                    }
                }
            }
        }
    }

    renderEliteRoomEffects(ctx, roomNode) {
        if (roomNode.roomType !== ROOM_TYPES.ELITE) return;

        const time = Date.now() / 1000;
        const centerX = this.width / 2;
        const centerY = this.height / 2;
        const pulseRadius = 100 + Math.sin(time * 2) * 20;
        const pulseAlpha = 0.1 + Math.sin(time * 3) * 0.05;

        for (let i = 0; i < 3; i++) {
            const radius = pulseRadius + i * 50;
            const alpha = pulseAlpha * (1 - i * 0.3);

            const gradient = ctx.createRadialGradient(
                centerX, centerY, radius * 0.8,
                centerX, centerY, radius
            );
            gradient.addColorStop(0, `rgba(255, 50, 50, 0)`);
            gradient.addColorStop(0.8, `rgba(255, 50, 50, ${alpha})`);
            gradient.addColorStop(1, `rgba(255, 20, 20, ${alpha * 0.5})`);

            ctx.fillStyle = gradient;
            ctx.fillRect(0, 0, this.width, this.height);
        }

        const groundGradient = ctx.createLinearGradient(
            0, this.height * 0.6,
            0, this.height
        );
        groundGradient.addColorStop(0, 'transparent');
        groundGradient.addColorStop(0.5, `rgba(255, 50, 50, ${pulseAlpha * 0.3})`);
        groundGradient.addColorStop(1, `rgba(255, 20, 20, ${pulseAlpha * 0.5})`);

        ctx.fillStyle = groundGradient;
        ctx.fillRect(0, this.height * 0.6, this.width, this.height * 0.4);
    }

    renderPortal(ctx, roomNode) {
        if (!roomNode.hasPortal) return;

        const centerX = this.width / 2;
        const centerY = this.height / 2;
        const time = Date.now() / 1000;
        const rotation = time * 2;

        ctx.save();
        ctx.translate(centerX, centerY);
        ctx.rotate(rotation);

        for (let i = 0; i < 3; i++) {
            const size = PORTAL.SIZE - i * 8;
            const ringAlpha = 0.3 + (i * 0.2);
            ctx.fillStyle = `rgba(156, 39, 176, ${ringAlpha})`;
            ctx.fillRect(-size / 2, -size / 2, size, size);
        }

        ctx.restore();

        ctx.fillStyle = COLORS.PARTICLE.PORTAL;
        ctx.beginPath();
        ctx.arc(centerX, centerY, 10, 0, Math.PI * 2);
        ctx.fill();
    }

    renderTraps(ctx, traps) {
        if (!traps || !traps.length) return;

        for (const trap of traps) {
            if (trap.active) {
                trap.render(ctx);
            }
        }
    }

    renderChests(ctx, chests) {
        if (!chests || !chests.length) return;

        for (const chest of chests) {
            chest.render(ctx);
        }
    }

    getTorchLights() {
        const torches = this.decorations.filter(d => d.type === DECORATIONS.TYPES.TORCH);
        return torches.map(torch => ({
            x: torch.x,
            y: torch.y - 10,
            radius: LIGHTING.TORCH_LIGHT.RADIUS,
            intensity: LIGHTING.TORCH_LIGHT.INTENSITY,
            color: LIGHTING.TORCH_LIGHT.COLOR
        }));
    }
}