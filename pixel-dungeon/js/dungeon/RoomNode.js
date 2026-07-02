const DOOR = {
    TOP: 1,
    BOTTOM: 2,
    LEFT: 4,
    RIGHT: 8
};

class RoomNode {
    constructor(gridX, gridY) {
        this.gridX = gridX;
        this.gridY = gridY;
        this.roomType = null;
        this.doors = 0;
        this.connections = [];
        this.enemies = [];
        this.cleared = false;
        this.entered = false;
        this.hasPortal = false;
        this.worldX = gridX * LEVELS.ROOM_WIDTH;
        this.worldY = gridY * LEVELS.ROOM_HEIGHT;
        this.neighbors = [];
        this.index = gridY * 5 + gridX;
    }

    addDoor(direction) {
        this.doors |= direction;
    }

    removeDoor(direction) {
        this.doors &= ~direction;
    }

    hasDoor(direction) {
        return (this.doors & direction) !== 0;
    }

    addConnection(roomNode) {
        if (!this.connections.includes(roomNode)) {
            this.connections.push(roomNode);
        }
    }

    getDoorDirections() {
        const directions = [];
        if (this.hasDoor(DOOR.TOP)) directions.push('top');
        if (this.hasDoor(DOOR.BOTTOM)) directions.push('bottom');
        if (this.hasDoor(DOOR.LEFT)) directions.push('left');
        if (this.hasDoor(DOOR.RIGHT)) directions.push('right');
        return directions;
    }

    getOppositeDirection(direction) {
        switch (direction) {
            case DOOR.TOP: return DOOR.BOTTOM;
            case DOOR.BOTTOM: return DOOR.TOP;
            case DOOR.LEFT: return DOOR.RIGHT;
            case DOOR.RIGHT: return DOOR.LEFT;
            default: return null;
        }
    }

    markCleared() {
        this.cleared = true;
    }

    markEntered() {
        this.entered = true;
    }

    spawnPortal() {
        this.hasPortal = true;
    }

    getRoomTypeName() {
        const names = {
            [ROOM_TYPES.BATTLE]: '战斗房',
            [ROOM_TYPES.CHEST]: '宝箱房',
            [ROOM_TYPES.SHOP]: '商店房',
            [ROOM_TYPES.TRAP]: '陷阱房',
            [ROOM_TYPES.ELITE]: '精英房',
            [ROOM_TYPES.REST]: '休息房',
            [ROOM_TYPES.BOSS]: 'Boss房',
            [ROOM_TYPES.START]: '初始房'
        };
        return names[this.roomType] || '未知房间';
    }
}