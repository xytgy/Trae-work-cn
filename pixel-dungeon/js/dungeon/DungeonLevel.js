class DungeonLevel {
    constructor(act, stage) {
        this.act = act;
        this.stage = stage;
        this.grid = [];
        this.rooms = [];
        this.currentRoomNode = null;
        this.theme = this.getRandomThemeForAct(act);
        this.startRoom = null;
        this.bossRoom = null;
        this.portalRooms = [];
        this.corridors = [];
    }

    initGrid() {
        this.grid = [];
        this.rooms = [];

        for (let y = 0; y < 5; y++) {
            const row = [];
            for (let x = 0; x < 5; x++) {
                const room = new RoomNode(x, y);
                row.push(room);
                this.rooms.push(room);
            }
            this.grid.push(row);
        }
    }

    getThemeForAct(act) {
        const actConfig = ACT_THEMES[act];
        if (!actConfig) {
            return null;
        }
        return actConfig.themes;
    }

    getRandomThemeForAct(act) {
        const themes = this.getThemeForAct(act);
        if (!themes || themes.length === 0) {
            return null;
        }
        return themes[Math.floor(Math.random() * themes.length)];
    }

    getDifficultyMultiplier() {
        const actConfig = ACT_THEMES[this.act];
        return actConfig ? actConfig.difficultyMultiplier : 1.0;
    }

    getRoomAt(gridX, gridY) {
        if (gridX < 0 || gridX >= 5 || gridY < 0 || gridY >= 5) {
            return null;
        }
        return this.grid[gridY][gridX];
    }

    setStartRoom(roomNode) {
        this.startRoom = roomNode;
        roomNode.roomType = ROOM_TYPES.BATTLE;
        roomNode.markEntered();
        this.currentRoomNode = roomNode;
    }

    setBossRoom(roomNode) {
        this.bossRoom = roomNode;
        roomNode.roomType = ROOM_TYPES.BOSS;
    }

    addPortalRoom(roomNode) {
        if (!this.portalRooms.includes(roomNode)) {
            this.portalRooms.push(roomNode);
            roomNode.hasPortal = true;
        }
    }

    getNeighbors(roomNode) {
        const neighbors = [];
        const { gridX, gridY } = roomNode;

        if (gridY > 0) {
            neighbors.push(this.getRoomAt(gridX, gridY - 1));
        }
        if (gridY < 4) {
            neighbors.push(this.getRoomAt(gridX, gridY + 1));
        }
        if (gridX > 0) {
            neighbors.push(this.getRoomAt(gridX - 1, gridY));
        }
        if (gridX < 4) {
            neighbors.push(this.getRoomAt(gridX + 1, gridY));
        }

        return neighbors.filter((n) => n !== null);
    }

    connectRooms(roomA, roomB) {
        let directionA = null;
        let directionB = null;

        if (roomA.gridX === roomB.gridX) {
            if (roomA.gridY < roomB.gridY) {
                directionA = DOOR.BOTTOM;
                directionB = DOOR.TOP;
            } else {
                directionA = DOOR.TOP;
                directionB = DOOR.BOTTOM;
            }
        } else if (roomA.gridY === roomB.gridY) {
            if (roomA.gridX < roomB.gridX) {
                directionA = DOOR.RIGHT;
                directionB = DOOR.LEFT;
            } else {
                directionA = DOOR.LEFT;
                directionB = DOOR.RIGHT;
            }
        }

        if (directionA && directionB) {
            roomA.addDoor(directionA);
            roomB.addDoor(directionB);
            roomA.addConnection(roomB);
            roomB.addConnection(roomA);
            const corridor = new Corridor(roomA, roomB);
            this.corridors.push(corridor);
            console.log(
                `走廊创建: [${roomA.gridX},${roomA.gridY}](${roomA.worldX},${roomA.worldY}) -> [${roomB.gridX},${roomB.gridY}](${roomB.worldX},${roomB.worldY}), 方向: ${corridor.direction}, x: ${corridor.x}, y: ${corridor.y}, 长度: ${corridor.length}, 宽度: ${corridor.width}`
            );
        }
    }

    getClearedRooms() {
        return this.rooms.filter((r) => r.cleared);
    }

    getEnteredRooms() {
        return this.rooms.filter((r) => r.entered);
    }

    getActiveRooms() {
        return this.rooms.filter((r) => r.roomType !== null);
    }

    getUnclearedBattleRooms() {
        return this.rooms.filter((r) => r.roomType === ROOM_TYPES.BATTLE && !r.cleared);
    }

    getAllReachableRooms(startRoom) {
        const reachable = new Set();
        const queue = [startRoom];

        while (queue.length > 0) {
            const current = queue.shift();
            if (reachable.has(current)) {
                continue;
            }

            reachable.add(current);

            for (const connection of current.connections) {
                if (!reachable.has(connection)) {
                    queue.push(connection);
                }
            }
        }

        return Array.from(reachable);
    }

    isFullyConnected() {
        if (!this.startRoom) {
            return false;
        }

        const activeRooms = this.getActiveRooms();
        if (activeRooms.length === 0) {
            return true;
        }

        const reachable = this.getAllReachableRooms(this.startRoom);
        const reachableSet = new Set(reachable);

        return activeRooms.every((room) => reachableSet.has(room));
    }

    generateEnemyList(roomNode) {
        const roomIndex = this.rooms.indexOf(roomNode);
        const enemyTypes = [];

        if (roomIndex <= 1) {
            enemyTypes.push('slime', 'skeleton');
        } else if (roomIndex <= 3) {
            enemyTypes.push('slime', 'bat', 'skeleton');
        } else {
            enemyTypes.push('slime', 'bat', 'ghost', 'skeleton', 'archer');
        }

        return enemyTypes;
    }

    findNextRoomByType(roomType) {
        if (!this.currentRoomNode) {
            return null;
        }

        const reachable = this.getAllReachableRooms(this.currentRoomNode);

        const candidates = reachable.filter(
            (room) => room.roomType === roomType && !room.entered && room !== this.currentRoomNode
        );

        if (candidates.length === 0) {
            const allCandidates = this.rooms.filter((room) => room.roomType === roomType && !room.entered);
            return allCandidates[0] || null;
        }

        return candidates[0];
    }

    toString() {
        let result = `Dungeon Level: Act ${this.act}, Stage ${this.stage}\n`;
        result += `Theme: ${this.theme ? this.theme.name : 'None'}\n`;
        result += 'Grid:\n';

        for (let y = 0; y < 5; y++) {
            let row = '';
            for (let x = 0; x < 5; x++) {
                const room = this.grid[y][x];
                if (!room.roomType) {
                    row += '[  ]';
                } else {
                    const type = room.roomType.charAt(0).toUpperCase();
                    const cleared = room.cleared ? '✓' : ' ';
                    const entered = room.entered ? '●' : '○';
                    row += `[${type}${cleared}${entered}]`;
                }
            }
            result += row + '\n';
        }

        return result;
    }
}
