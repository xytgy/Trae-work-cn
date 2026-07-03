class SaveSystem {
    constructor({ eventBus }) {
        this.eventBus = eventBus;
        this.STORAGE_KEY = 'pixel_dungeon_save';
        this.SLOT_COUNT = 3;
        this.VERSION = '1.0.0';
        this.SAVE_SCHEMAS = {
            '1.0.0': {
                version: '1.0.0',
                fields: [
                    'version',
                    'timestamp',
                    'slotIndex',
                    'characterId',
                    'characterName',
                    'difficulty',
                    'currentLevel',
                    'playerHealth',
                    'maxHealth',
                    'gold',
                    'killCount',
                    'survivalTime',
                    'playTime',
                    'weapons',
                    'currentWeaponIndex',
                    'relics',
                    'buffs',
                    'achievements',
                    'completed'
                ]
            }
        };
    }

    save(slotIndex) {
        if (slotIndex < 0 || slotIndex >= this.SLOT_COUNT) {
            return false;
        }

        const gameStateRef = typeof gameState !== 'undefined' ? gameState : null;
        if (!gameStateRef) {
            return false;
        }

        const data = gameStateRef.getData();
        const selectedChar = gameStateRef.getSelectedCharacter();

        const saveData = {
            version: this.VERSION,
            timestamp: Date.now(),
            slotIndex: slotIndex,
            characterId: selectedChar ? selectedChar.id || 1 : data.selectedCharacterId || 1,
            characterName: selectedChar ? selectedChar.name || '未知' : '未知',
            difficulty: data.difficulty || 'normal',
            currentLevel: data.currentLevel || 1,
            playerHealth: data.playerHealth || PLAYER.MAX_HEALTH,
            maxHealth: data.maxHealth || PLAYER.MAX_HEALTH,
            gold: data.gold || 0,
            killCount: data.killCount || 0,
            survivalTime: data.survivalTime || 0,
            playTime: data.playTime || 0,
            weapons: (data.playerWeapons || []).map(function (w) {
                return w.id || w.ID || 1;
            }),
            currentWeaponIndex: data.currentWeaponIndex || 0,
            relics: data.relics || [],
            buffs: data.buffs || [],
            achievements: data.achievements || [],
            completed: data.completed || false
        };

        const encrypted = this.encrypt(saveData);
        if (!encrypted) {
            return false;
        }

        try {
            var key = this.STORAGE_KEY + '_slot_' + slotIndex;
            localStorage.setItem(key, encrypted);
            if (this.eventBus) {
                this.eventBus.publish('SAVE_GAME', { slotIndex: slotIndex, saveData: saveData });
            }
            return true;
        } catch (e) {
            console.error('[SaveSystem] 保存失败:', e);
            return false;
        }
    }

    load(slotIndex) {
        if (slotIndex < 0 || slotIndex >= this.SLOT_COUNT) {
            return null;
        }

        try {
            var key = this.STORAGE_KEY + '_slot_' + slotIndex;
            var raw = localStorage.getItem(key);
            if (!raw) {
                return null;
            }

            var saveData = this.decrypt(raw);
            if (!saveData) {
                return null;
            }

            saveData = this.migrateVersion(saveData);

            var gameStateRef = typeof gameState !== 'undefined' ? gameState : null;
            if (gameStateRef) {
                var d = gameStateRef.getData();
                d.currentLevel = saveData.currentLevel || 1;
                d.playerHealth = saveData.playerHealth || PLAYER.MAX_HEALTH;
                d.maxHealth = saveData.maxHealth || PLAYER.MAX_HEALTH;
                d.gold = saveData.gold || 0;
                d.killCount = saveData.killCount || 0;
                d.survivalTime = saveData.survivalTime || 0;
                d.playTime = saveData.playTime || 0;
                d.difficulty = saveData.difficulty || 'normal';
                d.currentWeaponIndex = saveData.currentWeaponIndex || 0;
                d.selectedCharacterId = saveData.characterId || 1;
                d.completed = saveData.completed || false;

                if (saveData.achievements && saveData.achievements.length > 0) {
                    d.achievements = saveData.achievements;
                }
            }

            if (this.eventBus) {
                this.eventBus.publish('LOAD_GAME', { slotIndex: slotIndex, saveData: saveData });
            }
            return saveData;
        } catch (e) {
            console.error('[SaveSystem] 加载失败:', e);
            return null;
        }
    }

    delete(slotIndex) {
        if (slotIndex < 0 || slotIndex >= this.SLOT_COUNT) {
            return false;
        }

        try {
            var key = this.STORAGE_KEY + '_slot_' + slotIndex;
            localStorage.removeItem(key);
            if (this.eventBus) {
                this.eventBus.publish('DELETE_SAVE', { slotIndex: slotIndex });
            }
            return true;
        } catch (e) {
            console.error('[SaveSystem] 删除失败:', e);
            return false;
        }
    }

    getSaveInfo(slotIndex) {
        if (slotIndex < 0 || slotIndex >= this.SLOT_COUNT) {
            return null;
        }

        try {
            var key = this.STORAGE_KEY + '_slot_' + slotIndex;
            var raw = localStorage.getItem(key);
            if (!raw) {
                return null;
            }

            var saveData = this.decrypt(raw);
            if (!saveData) {
                return null;
            }

            saveData = this.migrateVersion(saveData);

            return {
                slotIndex: slotIndex,
                timestamp: saveData.timestamp || 0,
                characterId: saveData.characterId || 1,
                characterName: saveData.characterName || '未知',
                difficulty: saveData.difficulty || 'normal',
                currentLevel: saveData.currentLevel || 1,
                killCount: saveData.killCount || 0,
                gold: saveData.gold || 0,
                completed: saveData.completed || false
            };
        } catch (e) {
            console.error('[SaveSystem] 获取存档信息失败:', e);
            return null;
        }
    }

    hasSave(slotIndex) {
        if (slotIndex < 0 || slotIndex >= this.SLOT_COUNT) {
            return false;
        }

        try {
            var key = this.STORAGE_KEY + '_slot_' + slotIndex;
            var raw = localStorage.getItem(key);
            if (!raw) {
                return false;
            }

            var saveData = this.decrypt(raw);
            return saveData !== null;
        } catch (e) {
            return false;
        }
    }

    autoSave() {
        var gameStateRef = typeof gameState !== 'undefined' ? gameState : null;
        if (!gameStateRef) {
            return false;
        }

        var data = gameStateRef.getData();
        var selectedChar = gameStateRef.getSelectedCharacter();

        var saveData = {
            version: this.VERSION,
            timestamp: Date.now(),
            slotIndex: -1,
            characterId: selectedChar ? selectedChar.id || 1 : data.selectedCharacterId || 1,
            characterName: selectedChar ? selectedChar.name || '未知' : '未知',
            difficulty: data.difficulty || 'normal',
            currentLevel: data.currentLevel || 1,
            playerHealth: data.playerHealth || PLAYER.MAX_HEALTH,
            maxHealth: data.maxHealth || PLAYER.MAX_HEALTH,
            gold: data.gold || 0,
            killCount: data.killCount || 0,
            survivalTime: data.survivalTime || 0,
            playTime: data.playTime || 0,
            weapons: (data.playerWeapons || []).map(function (w) {
                return w.id || w.ID || 1;
            }),
            currentWeaponIndex: data.currentWeaponIndex || 0,
            relics: data.relics || [],
            buffs: data.buffs || [],
            achievements: data.achievements || [],
            completed: data.completed || false
        };

        var encrypted = this.encrypt(saveData);
        if (!encrypted) {
            return false;
        }

        try {
            var key = this.STORAGE_KEY + '_autosave';
            localStorage.setItem(key, encrypted);
            if (this.eventBus) {
                this.eventBus.publish('AUTO_SAVE', { saveData: saveData });
            }
            return true;
        } catch (e) {
            console.error('[SaveSystem] 自动保存失败:', e);
            return false;
        }
    }

    migrateVersion(data) {
        if (!data || !data.version) {
            return this.migrateFromLegacy(data);
        }

        var currentVersion = data.version;
        if (currentVersion === this.VERSION) {
            return data;
        }

        var migrated = Object.assign({}, data);

        if (this.compareVersions(currentVersion, '1.0.0') < 0) {
            migrated = this.migrate100(migrated);
        }

        migrated.version = this.VERSION;
        return migrated;
    }

    migrateFromLegacy(data) {
        if (!data) {
            return null;
        }

        var migrated = Object.assign({}, data);
        migrated.version = this.VERSION;

        if (migrated.weapons === undefined && migrated.playerWeapons) {
            migrated.weapons = migrated.playerWeapons.map(function (w) {
                return w.id || w.ID || 1;
            });
        }
        if (migrated.currentLevel === undefined) {
            migrated.currentLevel = 1;
        }
        if (migrated.playerHealth === undefined) {
            migrated.playerHealth = PLAYER.MAX_HEALTH;
        }
        if (migrated.killCount === undefined) {
            migrated.killCount = 0;
        }
        if (migrated.gold === undefined) {
            migrated.gold = 0;
        }
        if (migrated.achievements === undefined) {
            migrated.achievements = [];
        }
        if (migrated.completed === undefined) {
            migrated.completed = false;
        }

        return migrated;
    }

    migrate100(data) {
        if (!data) {
            return data;
        }
        if (data.version && this.compareVersions(data.version, '1.0.0') >= 0) {
            return data;
        }

        var migrated = Object.assign({}, data);
        migrated.version = '1.0.0';

        if (migrated.weapons === undefined) {
            migrated.weapons = [];
        }
        if (migrated.maxHealth === undefined) {
            migrated.maxHealth = PLAYER.MAX_HEALTH;
        }
        if (migrated.relics === undefined) {
            migrated.relics = [];
        }
        if (migrated.buffs === undefined) {
            migrated.buffs = [];
        }

        return migrated;
    }

    compareVersions(v1, v2) {
        var parts1 = v1.split('.').map(Number);
        var parts2 = v2.split('.').map(Number);

        for (var i = 0; i < Math.max(parts1.length, parts2.length); i++) {
            var p1 = parts1[i] || 0;
            var p2 = parts2[i] || 0;
            if (p1 > p2) {
                return 1;
            }
            if (p1 < p2) {
                return -1;
            }
        }
        return 0;
    }

    encrypt(data) {
        try {
            var jsonStr = JSON.stringify(data);
            var checksum = this._computeChecksum(jsonStr);
            var payload = jsonStr + '|' + checksum;
            var encoded = btoa(unescape(encodeURIComponent(payload)));
            return encoded;
        } catch (e) {
            console.error('[SaveSystem] 加密失败:', e);
            return null;
        }
    }

    decrypt(encoded) {
        try {
            var payload = decodeURIComponent(escape(atob(encoded)));
            var lastPipe = payload.lastIndexOf('|');
            if (lastPipe === -1) {
                return null;
            }

            var jsonStr = payload.substring(0, lastPipe);
            var checksum = payload.substring(lastPipe + 1);

            var expected = this._computeChecksum(jsonStr);
            if (checksum !== expected) {
                console.warn('[SaveSystem] 校验和不匹配，存档可能已损坏');
            }

            return JSON.parse(jsonStr);
        } catch (e) {
            console.error('[SaveSystem] 解密失败:', e);
            return null;
        }
    }

    _computeChecksum(str) {
        var hash = 0;
        for (var i = 0; i < str.length; i++) {
            var ch = str.charCodeAt(i);
            hash = (hash << 5) - hash + ch;
            hash = hash & hash;
        }
        return Math.abs(hash).toString(36);
    }

    getAllSlotInfo() {
        var infos = [];
        for (var i = 0; i < this.SLOT_COUNT; i++) {
            infos.push(this.getSaveInfo(i));
        }
        return infos;
    }

    exportSave(slotIndex) {
        var info = this.getSaveInfo(slotIndex);
        if (!info) {
            return null;
        }

        try {
            var key = this.STORAGE_KEY + '_slot_' + slotIndex;
            return localStorage.getItem(key);
        } catch (e) {
            return null;
        }
    }

    importSave(slotIndex, data) {
        if (slotIndex < 0 || slotIndex >= this.SLOT_COUNT) {
            return false;
        }
        if (!data) {
            return false;
        }

        try {
            var saveData = this.decrypt(data);
            if (!saveData) {
                return false;
            }

            saveData = this.migrateVersion(saveData);
            if (!saveData) {
                return false;
            }

            saveData.slotIndex = slotIndex;
            var reEncrypted = this.encrypt(saveData);
            if (!reEncrypted) {
                return false;
            }

            var key = this.STORAGE_KEY + '_slot_' + slotIndex;
            localStorage.setItem(key, reEncrypted);
            return true;
        } catch (e) {
            console.error('[SaveSystem] 导入存档失败:', e);
            return false;
        }
    }
}
