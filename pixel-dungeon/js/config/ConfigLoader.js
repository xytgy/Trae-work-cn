class ConfigLoader {
    constructor() {
        this.configs = {};
        this.loaded = false;
    }

    async loadAll() {
        const files = {
            weapons: 'config/weapons.json',
            enemies: 'config/enemies.json',
            characters: 'config/characters.json',
            skills: 'config/skills.json',
            levels: 'config/levels.json',
            bosses: 'config/bosses.json',
            traps: 'config/traps.json'
        };

        const results = await Promise.allSettled(
            Object.entries(files).map(([key, path]) =>
                fetch(path)
                    .then((res) => {
                        if (!res.ok) {
                            throw new Error(`HTTP ${res.status}`);
                        }
                        return res.json();
                    })
                    .then((data) => {
                        this.configs[key] = data;
                    })
                    .catch((err) => {
                        console.warn(`[ConfigLoader] Failed to load ${path}:`, err.message);
                    })
            )
        );

        this.loaded = Object.keys(this.configs).length > 0;
        return this.loaded;
    }

    getCharacter(id) {
        const data = this.configs.characters && this.configs.characters[String(id)];
        if (!data) {
            return null;
        }
        if (typeof Character === 'undefined') {
            return data;
        }
        const character = new Character();
        character.id = data.id;
        character.name = data.name;
        character.title = data.title;
        character.description = data.description;
        character.icon = data.icon;
        character.category = data.category;
        character.maxHealth = data.maxHealth;
        character.speed = data.speed;
        character.damage = data.damage;
        character.color = data.color;
        character.accentColor = data.accentColor;
        if (data.activeSkill && typeof window[data.activeSkill] === 'function') {
            character.activeSkill = new window[data.activeSkill]();
        }
        if (data.passiveSkill && typeof window[data.passiveSkill] === 'function') {
            character.passiveSkill = new window[data.passiveSkill]();
        }
        return character;
    }

    getWeapon(type) {
        return (this.configs.weapons && this.configs.weapons[type.toLowerCase()]) || null;
    }

    getEnemy(type) {
        return (this.configs.enemies && this.configs.enemies[type.toLowerCase()]) || null;
    }

    getSkill(id) {
        return this.configs.skills || null;
    }

    getLevel(index) {
        if (!this.configs.levels) {
            return null;
        }
        if (index === undefined) {
            return this.configs.levels;
        }
        return (this.configs.levels.enemies && this.configs.levels.enemies[index]) || null;
    }

    getBoss(type) {
        if (!this.configs.bosses) {
            return null;
        }
        if (type === undefined) {
            return this.configs.bosses;
        }
        return this.configs.bosses[type.toLowerCase()] || null;
    }

    getTrap(type) {
        return (this.configs.traps && this.configs.traps[type.toLowerCase()]) || null;
    }

    async reload() {
        this.configs = {};
        this.loaded = false;
        return this.loadAll();
    }
}

window.configLoader = new ConfigLoader();
