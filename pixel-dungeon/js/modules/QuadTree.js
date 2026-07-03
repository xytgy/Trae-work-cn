class QuadTree {
    constructor(bounds, maxObjects = 10, maxLevels = 5, level = 0) {
        this.bounds = bounds;
        this.maxObjects = maxObjects;
        this.maxLevels = maxLevels;
        this.level = level;
        this.objects = [];
        this.nodes = [];
    }

    clear() {
        this.objects = [];
        for (let i = 0; i < this.nodes.length; i++) {
            if (this.nodes[i]) {
                this.nodes[i].clear();
            }
        }
        this.nodes = [];
    }

    split() {
        const level = this.level + 1;
        const subWidth = this.bounds.width / 2;
        const subHeight = this.bounds.height / 2;
        const x = this.bounds.x;
        const y = this.bounds.y;

        this.nodes[0] = new QuadTree(
            { x: x + subWidth, y: y, width: subWidth, height: subHeight },
            this.maxObjects,
            this.maxLevels,
            level
        );
        this.nodes[1] = new QuadTree(
            { x: x, y: y, width: subWidth, height: subHeight },
            this.maxObjects,
            this.maxLevels,
            level
        );
        this.nodes[2] = new QuadTree(
            { x: x, y: y + subHeight, width: subWidth, height: subHeight },
            this.maxObjects,
            this.maxLevels,
            level
        );
        this.nodes[3] = new QuadTree(
            { x: x + subWidth, y: y + subHeight, width: subWidth, height: subHeight },
            this.maxObjects,
            this.maxLevels,
            level
        );
    }

    getIndex(rect) {
        const verticalMidpoint = this.bounds.x + this.bounds.width / 2;
        const horizontalMidpoint = this.bounds.y + this.bounds.height / 2;

        const topQuadrant = rect.y < horizontalMidpoint && rect.y + rect.height < horizontalMidpoint;
        const bottomQuadrant = rect.y > horizontalMidpoint;

        if (rect.x < verticalMidpoint && rect.x + rect.width < verticalMidpoint) {
            if (topQuadrant) {
                return 1;
            } else if (bottomQuadrant) {
                return 2;
            }
        } else if (rect.x > verticalMidpoint) {
            if (topQuadrant) {
                return 0;
            } else if (bottomQuadrant) {
                return 3;
            }
        }

        return -1;
    }

    insert(rect) {
        if (this.nodes[0]) {
            const index = this.getIndex(rect);
            if (index !== -1) {
                this.nodes[index].insert(rect);
                return;
            }
        }

        this.objects.push(rect);

        if (this.objects.length > this.maxObjects && this.level < this.maxLevels) {
            if (!this.nodes[0]) {
                this.split();
            }

            let i = 0;
            while (i < this.objects.length) {
                const index = this.getIndex(this.objects[i]);
                if (index !== -1) {
                    this.nodes[index].insert(this.objects.splice(i, 1)[0]);
                } else {
                    i++;
                }
            }
        }
    }

    query(rect, found = []) {
        const index = this.getIndex(rect);
        if (index !== -1 && this.nodes[0]) {
            this.nodes[index].query(rect, found);
        }

        for (let i = 0; i < this.objects.length; i++) {
            if (this.intersects(rect, this.objects[i])) {
                found.push(this.objects[i]);
            }
        }

        return found;
    }

    intersects(a, b) {
        return (
            a.x < b.x + b.width &&
            a.x + a.width > b.x &&
            a.y < b.y + b.height &&
            a.y + a.height > b.y
        );
    }
}