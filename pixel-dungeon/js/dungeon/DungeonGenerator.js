class DungeonGenerator {
    constructor() {
        this.MAX_RETRIES = 100;
        this.MIN_BATTLE_ROOMS = 3;
        this.MAX_BATTLE_ROOMS = 5;
        this.BRANCH_CHANCE = 0.4;
    }

    generate(act, stage) {
        let attempts = 0;
        let level = null;

        while (attempts < this.MAX_RETRIES) {
            level = this.tryGenerate(act, stage);
            if (level && this.isValidLevel(level)) {
                break;
            }
            attempts++;
        }

        if (!level) {
            level = this.generateFallback(act, stage);
        }

        return level;
    }

    tryGenerate(act, stage) {
        const level = new DungeonLevel(act, stage);
        level.initGrid();

        this.generateMainPath(level);
        this.generateBranches(level);
        this.assignRoomTypes(level);

        return level;
    }

    generateMainPath(level) {
        const startX = Math.floor(Math.random() * 3) + 1;
        const startRoom = level.getRoomAt(startX, 4);
        level.setStartRoom(startRoom);

        let currentRoom = startRoom;
        const mainPath = [currentRoom];

        const battleRoomCount = this.MIN_BATTLE_ROOMS + 
            Math.floor(Math.random() * (this.MAX_BATTLE_ROOMS - this.MIN_BATTLE_ROOMS + 1));

        for (let i = 0; i < battleRoomCount; i++) {
            const nextRoom = this.findNextMainPathRoom(level, currentRoom, mainPath);
            if (!nextRoom) break;

            level.connectRooms(currentRoom, nextRoom);
            nextRoom.roomType = ROOM_TYPES.BATTLE;
            mainPath.push(nextRoom);
            currentRoom = nextRoom;
        }

        const bossRoom = this.findBossRoom(level, currentRoom, mainPath);
        if (bossRoom) {
            level.connectRooms(currentRoom, bossRoom);
            mainPath.push(bossRoom);
            level.setBossRoom(bossRoom);
        }

        level.mainPath = mainPath;
    }

    findNextMainPathRoom(level, currentRoom, mainPath) {
        const neighbors = level.getNeighbors(currentRoom);
        const available = neighbors.filter(n => 
            !mainPath.includes(n) && 
            n.gridY <= currentRoom.gridY &&
            Math.abs(n.gridX - currentRoom.gridX) <= 1
        );

        if (available.length === 0) return null;

        const sorted = available.sort((a, b) => {
            const distA = Math.abs(a.gridX - 2);
            const distB = Math.abs(b.gridX - 2);
            return distA - distB;
        });

        const weighted = [];
        for (let i = 0; i < sorted.length; i++) {
            const weight = Math.pow(0.5, i);
            weighted.push({ room: sorted[i], weight });
        }

        const totalWeight = weighted.reduce((sum, w) => sum + w.weight, 0);
        let rand = Math.random() * totalWeight;

        for (const { room, weight } of weighted) {
            rand -= weight;
            if (rand <= 0) return room;
        }

        return sorted[0];
    }

    findBossRoom(level, currentRoom, mainPath) {
        const candidates = [];
        for (let y = 0; y <= currentRoom.gridY; y++) {
            for (let x = 0; x < 5; x++) {
                const room = level.getRoomAt(x, y);
                if (room && !mainPath.includes(room) && room.gridY === 0) {
                    candidates.push(room);
                }
            }
        }

        if (candidates.length === 0) {
            const topRooms = [];
            for (let x = 0; x < 5; x++) {
                const room = level.getRoomAt(x, 0);
                if (room) topRooms.push(room);
            }
            return topRooms[Math.floor(Math.random() * topRooms.length)];
        }

        return candidates[Math.floor(Math.random() * candidates.length)];
    }

    generateBranches(level) {
        const mainPathSet = new Set(level.mainPath);
        const battleRooms = level.mainPath.filter(r => 
            r !== level.startRoom && r !== level.bossRoom
        );

        for (const room of battleRooms) {
            if (Math.random() < this.BRANCH_CHANCE) {
                this.tryAddBranch(level, room, mainPathSet);
            }
        }

        const additionalBranches = Math.floor(Math.random() * 2);
        for (let i = 0; i < additionalBranches; i++) {
            const availableRooms = level.getActiveRooms().filter(r => 
                r !== level.startRoom && r !== level.bossRoom &&
                r.connections.length < 3
            );

            if (availableRooms.length > 0) {
                const room = availableRooms[Math.floor(Math.random() * availableRooms.length)];
                this.tryAddBranch(level, room, mainPathSet);
            }
        }
    }

    tryAddBranch(level, sourceRoom, mainPathSet) {
        const neighbors = level.getNeighbors(sourceRoom);
        const emptyNeighbors = neighbors.filter(n => 
            n.roomType === null && 
            n !== level.startRoom && 
            n !== level.bossRoom
        );

        if (emptyNeighbors.length === 0) return;

        const branchRoom = emptyNeighbors[Math.floor(Math.random() * emptyNeighbors.length)];
        level.connectRooms(sourceRoom, branchRoom);
        branchRoom.roomType = ROOM_TYPES.BATTLE;
    }

    assignRoomTypes(level) {
        const battleRooms = level.getActiveRooms().filter(r => 
            r.roomType === ROOM_TYPES.BATTLE &&
            r !== level.startRoom &&
            r !== level.bossRoom
        );

        const branchRooms = battleRooms.filter(r => 
            r.connections.length === 1 &&
            !level.mainPath.includes(r)
        );

        for (const room of branchRooms) {
            const rand = Math.random();
            if (rand < 0.35) {
                room.roomType = ROOM_TYPES.CHEST;
            } else if (rand < 0.55) {
                room.roomType = ROOM_TYPES.REST;
            } else if (rand < 0.70) {
                room.roomType = ROOM_TYPES.SHOP;
            } else if (rand < 0.85) {
                room.roomType = ROOM_TYPES.TRAP;
            } else if (rand < 0.95) {
                room.roomType = ROOM_TYPES.ELITE;
            }
        }

        const midIndex = Math.floor(battleRooms.length / 2);
        if (midIndex > 0 && battleRooms[midIndex]) {
            if (Math.random() < 0.2) {
                battleRooms[midIndex].roomType = ROOM_TYPES.ELITE;
            }
        }

        const portalCount = Math.min(battleRooms.length, 2);
        for (let i = 0; i < portalCount; i++) {
            const portalIndex = battleRooms.length - 1 - i;
            if (battleRooms[portalIndex]) {
                level.addPortalRoom(battleRooms[portalIndex]);
            }
        }
    }

    isValidLevel(level) {
        if (!level.startRoom || !level.bossRoom) return false;
        if (!level.isFullyConnected()) return false;

        const activeRooms = level.getActiveRooms();
        if (activeRooms.length < 5) return false;

        const battleRooms = activeRooms.filter(r => r.roomType === ROOM_TYPES.BATTLE);
        if (battleRooms.length < this.MIN_BATTLE_ROOMS) return false;

        const mainPathLength = level.mainPath?.length || 0;
        if (mainPathLength < 4) return false;

        return true;
    }

    generateFallback(act, stage) {
        const level = new DungeonLevel(act, stage);
        level.initGrid();

        const startRoom = level.getRoomAt(2, 4);
        level.setStartRoom(startRoom);

        const path = [
            level.getRoomAt(2, 3),
            level.getRoomAt(2, 2),
            level.getRoomAt(2, 1),
            level.getRoomAt(2, 0)
        ];

        let current = startRoom;
        for (const room of path) {
            level.connectRooms(current, room);
            room.roomType = ROOM_TYPES.BATTLE;
            current = room;
        }

        level.setBossRoom(path[path.length - 1]);

        const branches = [
            { from: path[0], to: level.getRoomAt(1, 3), type: ROOM_TYPES.CHEST },
            { from: path[1], to: level.getRoomAt(3, 2), type: ROOM_TYPES.REST },
            { from: path[2], to: level.getRoomAt(1, 1), type: ROOM_TYPES.TRAP }
        ];

        for (const branch of branches) {
            if (branch.to && branch.to.roomType === null) {
                level.connectRooms(branch.from, branch.to);
                branch.to.roomType = branch.type;
            }
        }

        level.mainPath = [startRoom, ...path];

        return level;
    }

    generateTestLevel(act, stage) {
        const level = new DungeonLevel(act, stage);
        level.initGrid();

        const rooms = [
            { x: 2, y: 4, type: ROOM_TYPES.BATTLE, isStart: true },
            { x: 2, y: 3, type: ROOM_TYPES.BATTLE },
            { x: 2, y: 2, type: ROOM_TYPES.BATTLE },
            { x: 2, y: 1, type: ROOM_TYPES.BATTLE },
            { x: 2, y: 0, type: ROOM_TYPES.BOSS, isBoss: true },
            { x: 1, y: 3, type: ROOM_TYPES.CHEST },
            { x: 3, y: 2, type: ROOM_TYPES.REST },
            { x: 1, y: 1, type: ROOM_TYPES.TRAP },
            { x: 3, y: 3, type: ROOM_TYPES.SHOP },
            { x: 0, y: 2, type: ROOM_TYPES.ELITE }
        ];

        for (const r of rooms) {
            const room = level.getRoomAt(r.x, r.y);
            if (room) {
                room.roomType = r.type;
                if (r.isStart) level.setStartRoom(room);
                if (r.isBoss) level.setBossRoom(room);
            }
        }

        const connections = [
            [[2, 4], [2, 3]],
            [[2, 3], [2, 2]],
            [[2, 2], [2, 1]],
            [[2, 1], [2, 0]],
            [[2, 3], [1, 3]],
            [[2, 2], [3, 2]],
            [[2, 1], [1, 1]],
            [[2, 3], [3, 3]],
            [[2, 2], [0, 2]]
        ];

        for (const [[x1, y1], [x2, y2]] of connections) {
            const room1 = level.getRoomAt(x1, y1);
            const room2 = level.getRoomAt(x2, y2);
            if (room1 && room2) {
                level.connectRooms(room1, room2);
            }
        }

        level.mainPath = [
            level.getRoomAt(2, 4),
            level.getRoomAt(2, 3),
            level.getRoomAt(2, 2),
            level.getRoomAt(2, 1),
            level.getRoomAt(2, 0)
        ];

        return level;
    }
}