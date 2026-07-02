class DoorManager {
    constructor() {
        this.doorStates = new Map();
        this.dungeonLevel = null;
    }

    getDoorKey(roomNode, direction) {
        return `${roomNode.gridX},${roomNode.gridY},${direction}`;
    }

    initDoors(dungeonLevel) {
        this.doorStates.clear();
        this.dungeonLevel = dungeonLevel;

        if (!dungeonLevel || !dungeonLevel.rooms) return;

        for (const roomNode of dungeonLevel.rooms) {
            const directions = roomNode.getDoorDirections();

            for (const direction of directions) {
                let initialState = 'open';

                const roomType = roomNode.roomType;
                if (roomType === ROOM_TYPES.BATTLE ||
                    roomType === ROOM_TYPES.ELITE ||
                    roomType === ROOM_TYPES.BOSS) {
                    initialState = 'open';
                } else {
                    initialState = 'open';
                }

                this.setDoorState(roomNode, direction, initialState);
            }
        }
    }

    setDoorState(roomNode, direction, state) {
        if (!['open', 'closed', 'locked'].includes(state)) {
            throw new Error(`Invalid door state: ${state}`);
        }
        const key = this.getDoorKey(roomNode, direction);
        this.doorStates.set(key, state);
    }

    getDoorState(roomNode, direction) {
        const key = this.getDoorKey(roomNode, direction);
        return this.doorStates.get(key) || 'open';
    }

    isDoorOpen(roomNode, direction) {
        const state = this.getDoorState(roomNode, direction);
        return state === 'open';
    }

    closeAndLockDoor(roomNode, direction) {
        this.setDoorState(roomNode, direction, 'locked');

        const oppositeDir = this.getOppositeDirection(direction);
        const neighbor = this.getNeighborInDirection(roomNode, direction);

        if (neighbor && oppositeDir) {
            this.setDoorState(neighbor, oppositeDir, 'locked');
        }
    }

    openDoor(roomNode, direction) {
        this.setDoorState(roomNode, direction, 'open');

        const oppositeDir = this.getOppositeDirection(direction);
        const neighbor = this.getNeighborInDirection(roomNode, direction);

        if (neighbor && oppositeDir) {
            this.setDoorState(neighbor, oppositeDir, 'open');
        }
    }

    closeDoor(roomNode, direction) {
        this.setDoorState(roomNode, direction, 'closed');

        const oppositeDir = this.getOppositeDirection(direction);
        const neighbor = this.getNeighborInDirection(roomNode, direction);

        if (neighbor && oppositeDir) {
            this.setDoorState(neighbor, oppositeDir, 'closed');
        }
    }

    onPlayerEnterRoom(roomNode) {
        const isInitialRoom = this.dungeonLevel && 
                              this.dungeonLevel.startRoom && 
                              roomNode === this.dungeonLevel.startRoom;

        if (!isInitialRoom) {
            const roomType = roomNode.roomType;

            if (roomType === ROOM_TYPES.BATTLE ||
                roomType === ROOM_TYPES.ELITE ||
                roomType === ROOM_TYPES.BOSS) {
                const directions = roomNode.getDoorDirections();
                for (const direction of directions) {
                    this.closeAndLockDoor(roomNode, direction);
                }
            }
        }
    }

    onRoomCleared(roomNode) {
        const roomType = roomNode.roomType;

        if (roomType === ROOM_TYPES.BATTLE ||
            roomType === ROOM_TYPES.ELITE ||
            roomType === ROOM_TYPES.BOSS) {
            const directions = roomNode.getDoorDirections();
            for (const direction of directions) {
                this.openDoor(roomNode, direction);
            }
        }
    }

    getOppositeDirection(direction) {
        switch (direction) {
            case 'top': return 'bottom';
            case 'bottom': return 'top';
            case 'left': return 'right';
            case 'right': return 'left';
            default: return null;
        }
    }

    getNeighborInDirection(roomNode, direction) {
        if (!roomNode) return null;

        if (this.dungeonLevel && this.dungeonLevel.getRoomAt) {
            let targetX = roomNode.gridX;
            let targetY = roomNode.gridY;

            switch (direction) {
                case 'top': targetY -= 1; break;
                case 'bottom': targetY += 1; break;
                case 'left': targetX -= 1; break;
                case 'right': targetX += 1; break;
                default: return null;
            }

            return this.dungeonLevel.getRoomAt(targetX, targetY);
        }

        if (!roomNode.neighbors || !Array.isArray(roomNode.neighbors)) return null;

        for (const neighbor of roomNode.neighbors) {
            if (neighbor && this.isNeighborInDirection(roomNode, neighbor, direction)) {
                return neighbor;
            }
        }
        return null;
    }

    isNeighborInDirection(roomNode, neighbor, direction) {
        const dx = neighbor.gridX - roomNode.gridX;
        const dy = neighbor.gridY - roomNode.gridY;

        switch (direction) {
            case 'top': return dy === -1 && dx === 0;
            case 'bottom': return dy === 1 && dx === 0;
            case 'left': return dx === -1 && dy === 0;
            case 'right': return dx === 1 && dy === 0;
            default: return false;
        }
    }

    canEnterRoom(playerRoom, targetRoom) {
        const dx = targetRoom.gridX - playerRoom.gridX;
        const dy = targetRoom.gridY - playerRoom.gridY;

        let direction = null;
        if (dy === -1) direction = 'top';
        else if (dy === 1) direction = 'bottom';
        else if (dx === -1) direction = 'left';
        else if (dx === 1) direction = 'right';

        if (!direction) return false;

        const doorState = this.getDoorState(playerRoom, direction);
        return doorState === 'open';
    }

    getLockedDoors(roomNode) {
        const lockedDoors = [];
        const directions = roomNode.getDoorDirections();

        for (const direction of directions) {
            if (this.getDoorState(roomNode, direction) === 'locked') {
                lockedDoors.push(direction);
            }
        }
        return lockedDoors;
    }

    getClosedDoors(roomNode) {
        const closedDoors = [];
        const directions = roomNode.getDoorDirections();

        for (const direction of directions) {
            const state = this.getDoorState(roomNode, direction);
            if (state === 'closed' || state === 'locked') {
                closedDoors.push(direction);
            }
        }
        return closedDoors;
    }

    reset() {
        this.doorStates.clear();
    }

    debugPrint() {
        console.log('=== Door States ===');
        for (const [key, state] of this.doorStates) {
            console.log(`${key}: ${state}`);
        }
        console.log('=== End Door States ===');
    }
}