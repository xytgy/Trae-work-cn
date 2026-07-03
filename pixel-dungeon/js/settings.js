/**
 * 设置系统
 * 负责游戏设置的管理、保存和加载
 */

class SettingsManager {
    constructor() {
        // 当前设置
        this.settings = {};

        // 初始化
        this.init();
    }

    /**
     * 初始化设置系统
     */
    init() {
        this.loadSettings();
        this.applySettings();
    }

    /**
     * 加载设置
     */
    loadSettings() {
        try {
            const data = localStorage.getItem(SETTINGS.STORAGE_KEY);

            if (data) {
                const savedSettings = JSON.parse(data);
                // 深拷贝默认设置，然后用保存的设置覆盖
                this.settings = this.deepMerge(JSON.parse(JSON.stringify(SETTINGS.DEFAULT)), savedSettings);
            } else {
                // 使用默认设置
                this.settings = JSON.parse(JSON.stringify(SETTINGS.DEFAULT));
            }
        } catch (e) {
            console.warn('加载设置失败，使用默认设置:', e);
            this.settings = JSON.parse(JSON.stringify(SETTINGS.DEFAULT));
        }
    }

    /**
     * 深合并两个对象
     * @param {Object} target - 目标对象
     * @param {Object} source - 源对象
     * @returns {Object} 合并后的对象
     */
    deepMerge(target, source) {
        const result = { ...target };

        for (const key in source) {
            if (source[key] && typeof source[key] === 'object' && !Array.isArray(source[key])) {
                result[key] = this.deepMerge(result[key] || {}, source[key]);
            } else {
                result[key] = source[key];
            }
        }

        return result;
    }

    /**
     * 保存设置
     * @returns {boolean} 是否保存成功
     */
    saveSettings() {
        try {
            localStorage.setItem(SETTINGS.STORAGE_KEY, JSON.stringify(this.settings));
            return true;
        } catch (e) {
            console.error('保存设置失败:', e);
            return false;
        }
    }

    /**
     * 应用设置（应用到游戏各个系统）
     */
    applySettings() {
        // 应用音频设置
        this.applyAudioSettings();

        // 应用画面设置
        this.applyGraphicsSettings();
    }

    /**
     * 应用音频设置
     */
    applyAudioSettings() {
        if (typeof audioManager !== 'undefined' && audioManager.initialized) {
            const audio = this.settings.audio;
            audioManager.setMasterVolume(audio.masterVolume / 100);
            audioManager.setSfxVolume(audio.sfxVolume / 100);
            audioManager.setMusicVolume(audio.musicVolume / 100);
        }
    }

    /**
     * 应用画面设置
     */
    applyGraphicsSettings() {
        // 画面设置在渲染时使用
    }

    /**
     * 获取设置
     * @param {string} category - 设置分类（可选）
     * @param {string} key - 设置键（可选）
     * @returns {*} 设置值
     */
    get(category, key) {
        if (category && key) {
            return this.settings[category]?.[key];
        } else if (category) {
            return this.settings[category];
        }
        return this.settings;
    }

    /**
     * 设置某个值
     * @param {string} category - 分类
     * @param {string} key - 键
     * @param {*} value - 值
     * @param {boolean} autoSave - 是否自动保存
     */
    set(category, key, value, autoSave = true) {
        if (this.settings[category]) {
            this.settings[category][key] = value;

            if (autoSave) {
                this.saveSettings();
            }

            // 应用设置
            this.applySettings();
        }
    }

    /**
     * 重置为默认设置
     */
    resetToDefault() {
        this.settings = JSON.parse(JSON.stringify(SETTINGS.DEFAULT));
        this.saveSettings();
        this.applySettings();
    }

    /**
     * 导出设置为JSON
     * @returns {string} JSON字符串
     */
    exportSettings() {
        return JSON.stringify(this.settings, null, 2);
    }

    /**
     * 从JSON导入设置
     * @param {string} jsonString - JSON字符串
     * @returns {boolean} 是否导入成功
     */
    importSettings(jsonString) {
        try {
            const imported = JSON.parse(jsonString);

            // 验证基本结构
            if (typeof imported === 'object' && imported.graphics && imported.audio) {
                this.settings = this.deepMerge(JSON.parse(JSON.stringify(SETTINGS.DEFAULT)), imported);
                this.saveSettings();
                this.applySettings();
                return true;
            }
        } catch (e) {
            console.error('导入设置失败:', e);
        }
        return false;
    }

    // ==================== 便捷方法 ====================

    /**
     * 获取主音量
     * @returns {number}
     */
    getMasterVolume() {
        return this.settings.audio.masterVolume;
    }

    /**
     * 设置主音量
     * @param {number} volume - 0-100
     */
    setMasterVolume(volume) {
        this.set('audio', 'masterVolume', Math.max(0, Math.min(100, volume)));
    }

    /**
     * 获取音效音量
     * @returns {number}
     */
    getSfxVolume() {
        return this.settings.audio.sfxVolume;
    }

    /**
     * 设置音效音量
     * @param {number} volume - 0-100
     */
    setSfxVolume(volume) {
        this.set('audio', 'sfxVolume', Math.max(0, Math.min(100, volume)));
    }

    /**
     * 获取音乐音量
     * @returns {number}
     */
    getMusicVolume() {
        return this.settings.audio.musicVolume;
    }

    /**
     * 设置音乐音量
     * @param {number} volume - 0-100
     */
    setMusicVolume(volume) {
        this.set('audio', 'musicVolume', Math.max(0, Math.min(100, volume)));
    }

    /**
     * 检查UI音效是否开启
     * @returns {boolean}
     */
    isUISoundEnabled() {
        return this.settings.audio.uiSound;
    }

    /**
     * 设置UI音效开关
     * @param {boolean} enabled
     */
    setUISoundEnabled(enabled) {
        this.set('audio', 'uiSound', enabled);
    }

    /**
     * 检查屏幕震动是否开启
     * @returns {boolean}
     */
    isScreenShakeEnabled() {
        return this.settings.graphics.screenShake;
    }

    /**
     * 设置屏幕震动开关
     * @param {boolean} enabled
     */
    setScreenShakeEnabled(enabled) {
        this.set('graphics', 'screenShake', enabled);
    }

    /**
     * 获取画质设置
     * @returns {string} 'low' | 'medium' | 'high'
     */
    getQuality() {
        return this.settings.graphics.quality;
    }

    /**
     * 设置画质
     * @param {string} quality - 'low' | 'medium' | 'high'
     */
    setQuality(quality) {
        if (['low', 'medium', 'high'].includes(quality)) {
            this.set('graphics', 'quality', quality);
        }
    }

    /**
     * 获取难度设置
     * @returns {string}
     */
    getDifficulty() {
        return this.settings.game.difficulty;
    }

    /**
     * 设置难度
     * @param {string} difficulty
     */
    setDifficulty(difficulty) {
        if (['easy', 'normal', 'hard', 'nightmare'].includes(difficulty)) {
            this.set('game', 'difficulty', difficulty);
        }
    }

    /**
     * 检查新手引导是否开启
     * @returns {boolean}
     */
    isTutorialEnabled() {
        return this.settings.game.tutorialEnabled;
    }

    /**
     * 设置新手引导开关
     * @param {boolean} enabled
     */
    setTutorialEnabled(enabled) {
        this.set('game', 'tutorialEnabled', enabled);
    }

    /**
     * 获取语言设置
     * @returns {string}
     */
    getLanguage() {
        return this.settings.game.language;
    }

    /**
     * 设置语言
     * @param {string} lang - 'zh' | 'en'
     */
    setLanguage(lang) {
        if (['zh', 'en'].includes(lang)) {
            this.set('game', 'language', lang);
        }
    }

    /**
     * 获取鼠标灵敏度
     * @returns {number}
     */
    getMouseSensitivity() {
        return this.settings.controls.mouseSensitivity;
    }

    getAimAssistStrength() {
        const level = this.settings.controls.aimAssist || 'off';
        return AIM_ASSIST.STRENGTH_LEVELS[level.toUpperCase()] || 0;
    }

    /**
     * 设置鼠标灵敏度
     * @param {number} sensitivity - 50-150
     */
    setMouseSensitivity(sensitivity) {
        this.set('controls', 'mouseSensitivity', Math.max(50, Math.min(150, sensitivity)));
    }

    /**
     * 检查自动拾取是否开启
     * @returns {boolean}
     */
    isAutoPickupEnabled() {
        return this.settings.game.autoPickup;
    }

    /**
     * 设置自动拾取开关
     * @param {boolean} enabled
     */
    setAutoPickupEnabled(enabled) {
        this.set('game', 'autoPickup', enabled);
    }

    /**
     * 切换全屏
     */
    toggleFullscreen() {
        const isFullscreen = this.settings.graphics.fullscreen;
        this.set('graphics', 'fullscreen', !isFullscreen);

        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen().catch((err) => {
                console.warn('无法进入全屏:', err);
            });
        } else {
            document.exitFullscreen().catch((err) => {
                console.warn('无法退出全屏:', err);
            });
        }
    }
}

// 创建全局设置管理器实例
const settingsManager = new SettingsManager();
