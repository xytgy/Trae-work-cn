/**
 * 增强版音效管理器
 * 支持预加载真实音效文件 + 振荡器fallback
 * 多层合成BGM无限循环
 */

class SoundManager {
    constructor() {
        // 音频上下文
        this.ctx = null;

        // 主音量节点
        this.masterGain = null;
        this.sfxGain = null;
        this.musicGain = null;
        this.ambientGain = null;

        // 音量设置
        this.masterVolume = 0.7;
        this.sfxVolume = 0.8;
        this.musicVolume = 0.5;
        this.ambientVolume = 0.3;

        // UI音效开关
        this.uiSoundEnabled = true;
        this.ambientSoundEnabled = true;

        // 当前播放的音乐
        this.currentMusic = null;
        this.musicOscillators = [];

        // 环境音
        this.ambientSound = null;

        // 是否已初始化
        this.initialized = false;

        // 音效缓存
        this.soundCache = {};

        // 音效文件映射
        this.soundFiles = {
            pistol: 'assets/audio/sfx/pistol.wav',
            shotgun: 'assets/audio/sfx/shotgun.wav',
            lightning: 'assets/audio/sfx/lightning.wav',
            grenade: 'assets/audio/sfx/grenade.wav',
            flame: 'assets/audio/sfx/flame.wav',
            freeze: 'assets/audio/sfx/freeze.wav',
            homing: 'assets/audio/sfx/homing.wav',
            hit: 'assets/audio/sfx/hit.wav',
            hurt: 'assets/audio/sfx/hurt.wav',
            kill: 'assets/audio/sfx/kill.wav',
            pickup: 'assets/audio/sfx/pickup.wav',
            portal: 'assets/audio/sfx/portal.wav',
            chest: 'assets/audio/sfx/chest.wav',
            boss_appear: 'assets/audio/sfx/boss_appear.wav',
            boss_attack: 'assets/audio/sfx/boss_attack.wav',
            victory: 'assets/audio/sfx/victory.wav',
            defeat: 'assets/audio/sfx/defeat.wav',
            click: 'assets/audio/sfx/click.wav',
            switch: 'assets/audio/sfx/switch.wav',
            levelup: 'assets/audio/sfx/levelup.wav',
            heal: 'assets/audio/sfx/heal.wav',
            shield: 'assets/audio/sfx/shield.wav'
        };

        // 已加载的Audio元素缓存
        this.audioCache = {};

        // 预加载完成标记
        this.preloaded = false;
    }

    /**
     * 初始化音频系统
     */
    init() {
        try {
            this.ctx = new (window.AudioContext || window.webkitAudioContext)();

            // 创建主音量节点
            this.masterGain = this.ctx.createGain();
            this.masterGain.connect(this.ctx.destination);
            this.masterGain.gain.value = this.masterVolume;

            // 音效音量
            this.sfxGain = this.ctx.createGain();
            this.sfxGain.connect(this.masterGain);
            this.sfxGain.gain.value = this.sfxVolume;

            // 音乐音量
            this.musicGain = this.ctx.createGain();
            this.musicGain.connect(this.masterGain);
            this.musicGain.gain.value = this.musicVolume;

            // 环境音音量
            this.ambientGain = this.ctx.createGain();
            this.ambientGain.connect(this.masterGain);
            this.ambientGain.gain.value = this.ambientVolume;

            this.initialized = true;
            console.log('音效系统初始化完成');

            // 预加载音效文件（异步，不阻塞初始化）
            this.preloadSounds().catch((err) => {
                console.warn('音效预加载失败:', err);
            });

            return true;
        } catch (e) {
            console.warn('音效系统初始化失败:', e);
            return false;
        }
    }

    /**
     * 确保音频上下文运行
     */
    ensureRunning() {
        if (this.ctx && this.ctx.state === 'suspended') {
            this.ctx.resume();
        }
    }

    /**
     * 预加载所有音效文件
     * @returns {Promise} 预加载完成的Promise
     */
    preloadSounds() {
        return new Promise((resolve) => {
            const entries = Object.entries(this.soundFiles);
            let loaded = 0;
            const total = entries.length;

            if (total === 0) {
                this.preloaded = true;
                resolve();
                return;
            }

            const checkComplete = () => {
                loaded++;
                if (loaded >= total) {
                    this.preloaded = true;
                    console.log(`音效预加载完成: ${total}个文件`);
                    resolve();
                }
            };

            entries.forEach(([name, path]) => {
                const audio = new Audio();
                audio.preload = 'auto';
                audio.volume = 1.0;

                audio.oncanplaythrough = () => {
                    this.audioCache[name] = audio;
                    checkComplete();
                };

                audio.onerror = () => {
                    console.warn(`音效加载失败: ${name} (${path})，将使用合成音效`);
                    this.audioCache[name] = null;
                    checkComplete();
                };

                audio.src = path;
            });
        });
    }

    /**
     * 播放音效
     * @param {string} soundName - 音效名称
     */
    play(soundName) {
        if (!this.initialized) {
            return;
        }
        this.ensureRunning();

        // 尝试播放预加载的音频文件
        if (this.preloaded && this.audioCache[soundName]) {
            this.playFromCache(soundName);
            return;
        }

        // Fallback: 使用振荡器合成
        this.playSynthesized(soundName);
    }

    /**
     * 从缓存播放音频
     * @param {string} soundName - 音效名称
     */
    playFromCache(soundName) {
        const audio = this.audioCache[soundName];
        if (!audio) {
            return;
        }

        const clone = audio.cloneNode(true);
        clone.volume = this.sfxVolume;

        clone.onended = () => {
            clone.src = '';
        };

        clone.play().catch((e) => {
            console.warn('音效播放失败:', e);
        });
    }

    /**
     * 使用振荡器合成音效（fallback）
     * @param {string} soundName - 音效名称
     */
    playSynthesized(soundName) {
        // 映射SOUND_EFFECTS常量到合成方法
        const synthMap = {
            [SOUND_EFFECTS.PISTOL]: 'synthPistol',
            [SOUND_EFFECTS.SHOTGUN]: 'synthShotgun',
            [SOUND_EFFECTS.LASER]: 'synthLaser',
            [SOUND_EFFECTS.EXPLOSION]: 'synthExplosion',
            [SOUND_EFFECTS.FLAME]: 'synthFlame',
            [SOUND_EFFECTS.HOMING]: 'synthHoming',
            [SOUND_EFFECTS.FREEZE]: 'synthFreeze',
            [SOUND_EFFECTS.HIT]: 'synthHit',
            [SOUND_EFFECTS.COIN]: 'synthCoin',
            [SOUND_EFFECTS.KILL]: 'synthKill',
            [SOUND_EFFECTS.PICKUP]: 'synthPickup',
            [SOUND_EFFECTS.HURT]: 'synthHurt',
            [SOUND_EFFECTS.DEATH]: 'synthDeath',
            [SOUND_EFFECTS.DASH]: 'synthDash',
            [SOUND_EFFECTS.SHIELD]: 'synthShield',
            [SOUND_EFFECTS.HEAL]: 'synthHeal',
            [SOUND_EFFECTS.LEVELUP]: 'synthLevelUp',
            [SOUND_EFFECTS.CLICK]: 'synthClick',
            [SOUND_EFFECTS.SWITCH]: 'synthSwitch',
            [SOUND_EFFECTS.CHEST]: 'synthChest',
            [SOUND_EFFECTS.PORTAL]: 'synthPortal',
            [SOUND_EFFECTS.BOSS]: 'synthBoss',
            [SOUND_EFFECTS.BOSS_ATTACK]: 'synthBossAttack',
            [SOUND_EFFECTS.VICTORY]: 'synthVictory',
            [SOUND_EFFECTS.DEFEAT]: 'synthDefeat'
        };

        const method = synthMap[soundName];
        if (method && typeof this[method] === 'function') {
            if (soundName === SOUND_EFFECTS.CLICK || soundName === SOUND_EFFECTS.SWITCH) {
                if (!this.uiSoundEnabled) {
                    return;
                }
            }
            this[method]();
        }
    }

    // ==================== 振荡器合成音效（fallback） ====================

    synthPistol() {
        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const filter = this.ctx.createBiquadFilter();
        const gain = this.ctx.createGain();
        osc.connect(filter);
        filter.connect(gain);
        gain.connect(this.sfxGain);
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(800, now);
        osc.frequency.exponentialRampToValueAtTime(200, now + 0.1);
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(2000, now);
        filter.frequency.exponentialRampToValueAtTime(500, now + 0.1);
        gain.gain.setValueAtTime(0, now);
        gain.gain.linearRampToValueAtTime(0.2, now + 0.01);
        gain.gain.linearRampToValueAtTime(0.15, now + 0.03);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.1);
        osc.start(now);
        osc.stop(now + 0.1);
        this.playNoise(0.08, 0.08);
    }

    synthShotgun() {
        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const filter = this.ctx.createBiquadFilter();
        const gain = this.ctx.createGain();
        osc.connect(filter);
        filter.connect(gain);
        gain.connect(this.sfxGain);
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(200, now);
        osc.frequency.exponentialRampToValueAtTime(50, now + 0.2);
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(1000, now);
        filter.frequency.exponentialRampToValueAtTime(200, now + 0.2);
        gain.gain.setValueAtTime(0, now);
        gain.gain.linearRampToValueAtTime(0.25, now + 0.02);
        gain.gain.linearRampToValueAtTime(0.2, now + 0.05);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.2);
        osc.start(now);
        osc.stop(now + 0.2);
        this.playNoise(0.12, 0.18);
    }

    synthLaser() {
        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const filter = this.ctx.createBiquadFilter();
        const gain = this.ctx.createGain();
        osc.connect(filter);
        filter.connect(gain);
        gain.connect(this.sfxGain);
        osc.type = 'sine';
        osc.frequency.setValueAtTime(1500, now);
        osc.frequency.exponentialRampToValueAtTime(500, now + 0.15);
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(4000, now);
        filter.frequency.exponentialRampToValueAtTime(1500, now + 0.15);
        gain.gain.setValueAtTime(0, now);
        gain.gain.linearRampToValueAtTime(0.18, now + 0.01);
        gain.gain.linearRampToValueAtTime(0.15, now + 0.03);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.15);
        osc.start(now);
        osc.stop(now + 0.15);
        this.playNoise(0.05, 0.12);
    }

    synthExplosion() {
        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const filter = this.ctx.createBiquadFilter();
        const gain = this.ctx.createGain();
        osc.connect(filter);
        filter.connect(gain);
        gain.connect(this.sfxGain);
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(100, now);
        osc.frequency.exponentialRampToValueAtTime(30, now + 0.4);
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(800, now);
        filter.frequency.exponentialRampToValueAtTime(100, now + 0.4);
        gain.gain.setValueAtTime(0, now);
        gain.gain.linearRampToValueAtTime(0.25, now + 0.03);
        gain.gain.linearRampToValueAtTime(0.2, now + 0.1);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.4);
        osc.start(now);
        osc.stop(now + 0.4);
        this.playNoise(0.2, 0.35);
    }

    synthHit() {
        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const filter = this.ctx.createBiquadFilter();
        const gain = this.ctx.createGain();
        osc.connect(filter);
        filter.connect(gain);
        gain.connect(this.sfxGain);
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(300, now);
        osc.frequency.exponentialRampToValueAtTime(100, now + 0.08);
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(1500, now);
        filter.frequency.exponentialRampToValueAtTime(300, now + 0.08);
        gain.gain.setValueAtTime(0, now);
        gain.gain.linearRampToValueAtTime(0.2, now + 0.01);
        gain.gain.linearRampToValueAtTime(0.15, now + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.08);
        osc.start(now);
        osc.stop(now + 0.08);
        this.playNoise(0.06, 0.06);
    }

    synthCoin() {
        const now = this.ctx.currentTime;
        const osc1 = this.ctx.createOscillator();
        const filter1 = this.ctx.createBiquadFilter();
        const gain1 = this.ctx.createGain();
        osc1.connect(filter1);
        filter1.connect(gain1);
        gain1.connect(this.sfxGain);
        osc1.type = 'sine';
        osc1.frequency.setValueAtTime(1200, now);
        osc1.frequency.setValueAtTime(1800, now + 0.05);
        filter1.type = 'lowpass';
        filter1.frequency.setValueAtTime(5000, now);
        gain1.gain.setValueAtTime(0, now);
        gain1.gain.linearRampToValueAtTime(0.18, now + 0.01);
        gain1.gain.linearRampToValueAtTime(0.15, now + 0.03);
        gain1.gain.exponentialRampToValueAtTime(0.01, now + 0.15);
        osc1.start(now);
        osc1.stop(now + 0.15);
        const osc2 = this.ctx.createOscillator();
        const filter2 = this.ctx.createBiquadFilter();
        const gain2 = this.ctx.createGain();
        osc2.connect(filter2);
        filter2.connect(gain2);
        gain2.connect(this.sfxGain);
        osc2.type = 'sine';
        osc2.frequency.setValueAtTime(2400, now + 0.02);
        filter2.type = 'lowpass';
        filter2.frequency.setValueAtTime(6000, now);
        gain2.gain.setValueAtTime(0, now + 0.02);
        gain2.gain.linearRampToValueAtTime(0.1, now + 0.03);
        gain2.gain.exponentialRampToValueAtTime(0.01, now + 0.2);
        osc2.start(now + 0.02);
        osc2.stop(now + 0.2);
    }

    synthPickup() {
        const now = this.ctx.currentTime;
        const notes = [523.25, 659.25, 783.99];
        notes.forEach((freq, i) => {
            const osc = this.ctx.createOscillator();
            const filter = this.ctx.createBiquadFilter();
            const gain = this.ctx.createGain();
            osc.connect(filter);
            filter.connect(gain);
            gain.connect(this.sfxGain);
            osc.type = 'sine';
            osc.frequency.value = freq;
            filter.type = 'lowpass';
            filter.frequency.setValueAtTime(6000, now);
            const startTime = now + i * 0.08;
            gain.gain.setValueAtTime(0, startTime);
            gain.gain.linearRampToValueAtTime(0.18, startTime + 0.02);
            gain.gain.linearRampToValueAtTime(0.15, startTime + 0.05);
            gain.gain.exponentialRampToValueAtTime(0.01, startTime + 0.3);
            osc.start(startTime);
            osc.stop(startTime + 0.3);
        });
    }

    synthHurt() {
        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const filter = this.ctx.createBiquadFilter();
        const gain = this.ctx.createGain();
        osc.connect(filter);
        filter.connect(gain);
        gain.connect(this.sfxGain);
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(400, now);
        osc.frequency.exponentialRampToValueAtTime(100, now + 0.25);
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(2000, now);
        filter.frequency.exponentialRampToValueAtTime(500, now + 0.25);
        gain.gain.setValueAtTime(0, now);
        gain.gain.linearRampToValueAtTime(0.2, now + 0.03);
        gain.gain.linearRampToValueAtTime(0.15, now + 0.08);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.25);
        osc.start(now);
        osc.stop(now + 0.25);
    }

    synthDeath() {
        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const filter = this.ctx.createBiquadFilter();
        const gain = this.ctx.createGain();
        osc.connect(filter);
        filter.connect(gain);
        gain.connect(this.sfxGain);
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(300, now);
        osc.frequency.exponentialRampToValueAtTime(50, now + 0.8);
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(1500, now);
        filter.frequency.exponentialRampToValueAtTime(200, now + 0.8);
        gain.gain.setValueAtTime(0, now);
        gain.gain.linearRampToValueAtTime(0.22, now + 0.05);
        gain.gain.linearRampToValueAtTime(0.18, now + 0.2);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.8);
        osc.start(now);
        osc.stop(now + 0.8);
    }

    synthDash() {
        const now = this.ctx.currentTime;
        const bufferSize = this.ctx.sampleRate * 0.2;
        const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
            data[i] = Math.random() * 2 - 1;
        }
        const noise = this.ctx.createBufferSource();
        noise.buffer = buffer;
        const filter = this.ctx.createBiquadFilter();
        filter.type = 'bandpass';
        filter.frequency.setValueAtTime(1000, now);
        filter.frequency.exponentialRampToValueAtTime(3000, now + 0.2);
        filter.Q.value = 1;
        const lowpass = this.ctx.createBiquadFilter();
        lowpass.type = 'lowpass';
        lowpass.frequency.setValueAtTime(4000, now);
        const gain = this.ctx.createGain();
        gain.gain.setValueAtTime(0, now);
        gain.gain.linearRampToValueAtTime(0.18, now + 0.02);
        gain.gain.linearRampToValueAtTime(0.15, now + 0.05);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.2);
        noise.connect(filter);
        filter.connect(lowpass);
        lowpass.connect(gain);
        gain.connect(this.sfxGain);
        noise.start(now);
        noise.stop(now + 0.2);
    }

    synthShield() {
        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const filter = this.ctx.createBiquadFilter();
        const gain = this.ctx.createGain();
        osc.connect(filter);
        filter.connect(gain);
        gain.connect(this.sfxGain);
        osc.type = 'sine';
        osc.frequency.setValueAtTime(300, now);
        osc.frequency.exponentialRampToValueAtTime(800, now + 0.15);
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(3000, now);
        gain.gain.setValueAtTime(0, now);
        gain.gain.linearRampToValueAtTime(0.2, now + 0.03);
        gain.gain.linearRampToValueAtTime(0.18, now + 0.1);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.3);
        osc.start(now);
        osc.stop(now + 0.3);
    }

    synthHeal() {
        const now = this.ctx.currentTime;
        const notes = [440, 554.37, 659.25, 880];
        notes.forEach((freq, i) => {
            const osc = this.ctx.createOscillator();
            const filter = this.ctx.createBiquadFilter();
            const gain = this.ctx.createGain();
            osc.connect(filter);
            filter.connect(gain);
            gain.connect(this.sfxGain);
            osc.type = 'sine';
            osc.frequency.value = freq;
            filter.type = 'lowpass';
            filter.frequency.setValueAtTime(6000, now);
            const startTime = now + i * 0.08;
            gain.gain.setValueAtTime(0, startTime);
            gain.gain.linearRampToValueAtTime(0.15, startTime + 0.03);
            gain.gain.linearRampToValueAtTime(0.12, startTime + 0.08);
            gain.gain.exponentialRampToValueAtTime(0.01, startTime + 0.25);
            osc.start(startTime);
            osc.stop(startTime + 0.25);
        });
    }

    synthLevelUp() {
        const now = this.ctx.currentTime;
        const notes = [523.25, 659.25, 783.99, 1046.5, 1318.51];
        notes.forEach((freq, i) => {
            const osc = this.ctx.createOscillator();
            const filter = this.ctx.createBiquadFilter();
            const gain = this.ctx.createGain();
            osc.connect(filter);
            filter.connect(gain);
            gain.connect(this.sfxGain);
            osc.type = 'triangle';
            osc.frequency.value = freq;
            filter.type = 'lowpass';
            filter.frequency.setValueAtTime(5000, now);
            const startTime = now + i * 0.1;
            gain.gain.setValueAtTime(0, startTime);
            gain.gain.linearRampToValueAtTime(0.15, startTime + 0.02);
            gain.gain.linearRampToValueAtTime(0.12, startTime + 0.05);
            gain.gain.exponentialRampToValueAtTime(0.01, startTime + 0.2);
            osc.start(startTime);
            osc.stop(startTime + 0.2);
        });
    }

    synthClick() {
        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const filter = this.ctx.createBiquadFilter();
        const gain = this.ctx.createGain();
        osc.connect(filter);
        filter.connect(gain);
        gain.connect(this.sfxGain);
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(600, now);
        osc.frequency.setValueAtTime(800, now + 0.02);
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(3000, now);
        gain.gain.setValueAtTime(0, now);
        gain.gain.linearRampToValueAtTime(0.12, now + 0.01);
        gain.gain.linearRampToValueAtTime(0.1, now + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.08);
        osc.start(now);
        osc.stop(now + 0.08);
    }

    synthSwitch() {
        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const filter = this.ctx.createBiquadFilter();
        const gain = this.ctx.createGain();
        osc.connect(filter);
        filter.connect(gain);
        gain.connect(this.sfxGain);
        osc.type = 'sine';
        osc.frequency.setValueAtTime(400, now);
        osc.frequency.setValueAtTime(600, now + 0.05);
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(3000, now);
        gain.gain.setValueAtTime(0, now);
        gain.gain.linearRampToValueAtTime(0.15, now + 0.02);
        gain.gain.linearRampToValueAtTime(0.12, now + 0.04);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.1);
        osc.start(now);
        osc.stop(now + 0.1);
    }

    synthChest() {
        const now = this.ctx.currentTime;
        const osc1 = this.ctx.createOscillator();
        const filter1 = this.ctx.createBiquadFilter();
        const gain1 = this.ctx.createGain();
        osc1.connect(filter1);
        filter1.connect(gain1);
        gain1.connect(this.sfxGain);
        osc1.type = 'triangle';
        osc1.frequency.setValueAtTime(200, now);
        osc1.frequency.setValueAtTime(300, now + 0.1);
        filter1.type = 'lowpass';
        filter1.frequency.setValueAtTime(1500, now);
        gain1.gain.setValueAtTime(0, now);
        gain1.gain.linearRampToValueAtTime(0.15, now + 0.02);
        gain1.gain.linearRampToValueAtTime(0.12, now + 0.08);
        gain1.gain.exponentialRampToValueAtTime(0.01, now + 0.15);
        osc1.start(now);
        osc1.stop(now + 0.15);
        const osc2 = this.ctx.createOscillator();
        const filter2 = this.ctx.createBiquadFilter();
        const gain2 = this.ctx.createGain();
        osc2.connect(filter2);
        filter2.connect(gain2);
        gain2.connect(this.sfxGain);
        osc2.type = 'sine';
        osc2.frequency.setValueAtTime(600, now + 0.15);
        osc2.frequency.exponentialRampToValueAtTime(1200, now + 0.35);
        filter2.type = 'lowpass';
        filter2.frequency.setValueAtTime(4000, now);
        gain2.gain.setValueAtTime(0, now + 0.15);
        gain2.gain.linearRampToValueAtTime(0.2, now + 0.2);
        gain2.gain.linearRampToValueAtTime(0.18, now + 0.3);
        gain2.gain.exponentialRampToValueAtTime(0.01, now + 0.5);
        osc2.start(now + 0.15);
        osc2.stop(now + 0.5);
    }

    synthPortal() {
        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const filter = this.ctx.createBiquadFilter();
        const gain = this.ctx.createGain();
        osc.connect(filter);
        filter.connect(gain);
        gain.connect(this.sfxGain);
        osc.type = 'sine';
        osc.frequency.setValueAtTime(200, now);
        osc.frequency.linearRampToValueAtTime(400, now + 0.5);
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(2000, now);
        filter.frequency.linearRampToValueAtTime(3000, now + 0.5);
        gain.gain.setValueAtTime(0, now);
        gain.gain.linearRampToValueAtTime(0.18, now + 0.1);
        gain.gain.linearRampToValueAtTime(0.15, now + 0.3);
        gain.gain.linearRampToValueAtTime(0, now + 0.5);
        osc.start(now);
        osc.stop(now + 0.5);
    }

    synthBoss() {
        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const filter = this.ctx.createBiquadFilter();
        const gain = this.ctx.createGain();
        osc.connect(filter);
        filter.connect(gain);
        gain.connect(this.sfxGain);
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(80, now);
        osc.frequency.setValueAtTime(100, now + 0.3);
        osc.frequency.setValueAtTime(80, now + 0.6);
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(600, now);
        filter.frequency.exponentialRampToValueAtTime(200, now + 0.8);
        gain.gain.setValueAtTime(0, now);
        gain.gain.linearRampToValueAtTime(0.25, now + 0.05);
        gain.gain.linearRampToValueAtTime(0.2, now + 0.2);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.8);
        osc.start(now);
        osc.stop(now + 0.8);
        this.playNoise(0.1, 0.6);
    }

    synthFlame() {
        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const filter = this.ctx.createBiquadFilter();
        const gain = this.ctx.createGain();
        osc.connect(filter);
        filter.connect(gain);
        gain.connect(this.sfxGain);
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(150, now);
        osc.frequency.exponentialRampToValueAtTime(50, now + 0.3);
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(800, now);
        filter.frequency.exponentialRampToValueAtTime(300, now + 0.3);
        gain.gain.setValueAtTime(0, now);
        gain.gain.linearRampToValueAtTime(0.2, now + 0.02);
        gain.gain.linearRampToValueAtTime(0.18, now + 0.1);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.3);
        osc.start(now);
        osc.stop(now + 0.3);
        this.playNoise(0.15, 0.25);
    }

    synthHoming() {
        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const filter = this.ctx.createBiquadFilter();
        const gain = this.ctx.createGain();
        osc.connect(filter);
        filter.connect(gain);
        gain.connect(this.sfxGain);
        osc.type = 'sine';
        osc.frequency.setValueAtTime(400, now);
        osc.frequency.exponentialRampToValueAtTime(200, now + 0.4);
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(1500, now);
        filter.frequency.exponentialRampToValueAtTime(500, now + 0.4);
        gain.gain.setValueAtTime(0, now);
        gain.gain.linearRampToValueAtTime(0.18, now + 0.03);
        gain.gain.linearRampToValueAtTime(0.15, now + 0.15);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.4);
        osc.start(now);
        osc.stop(now + 0.4);
        this.playNoise(0.08, 0.3);
    }

    synthKill() {
        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const filter = this.ctx.createBiquadFilter();
        const gain = this.ctx.createGain();
        osc.connect(filter);
        filter.connect(gain);
        gain.connect(this.sfxGain);
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(200, now);
        osc.frequency.exponentialRampToValueAtTime(80, now + 0.15);
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(1000, now);
        filter.frequency.exponentialRampToValueAtTime(300, now + 0.15);
        gain.gain.setValueAtTime(0, now);
        gain.gain.linearRampToValueAtTime(0.22, now + 0.02);
        gain.gain.linearRampToValueAtTime(0.18, now + 0.05);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.15);
        osc.start(now);
        osc.stop(now + 0.15);
    }

    synthBossAttack() {
        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const filter = this.ctx.createBiquadFilter();
        const gain = this.ctx.createGain();
        osc.connect(filter);
        filter.connect(gain);
        gain.connect(this.sfxGain);
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(100, now);
        osc.frequency.exponentialRampToValueAtTime(40, now + 0.5);
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(600, now);
        filter.frequency.exponentialRampToValueAtTime(150, now + 0.5);
        gain.gain.setValueAtTime(0, now);
        gain.gain.linearRampToValueAtTime(0.25, now + 0.05);
        gain.gain.linearRampToValueAtTime(0.2, now + 0.15);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.5);
        osc.start(now);
        osc.stop(now + 0.5);
        this.playNoise(0.12, 0.4);
    }

    synthFreeze() {
        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const filter = this.ctx.createBiquadFilter();
        const gain = this.ctx.createGain();
        osc.connect(filter);
        filter.connect(gain);
        gain.connect(this.sfxGain);
        osc.type = 'sine';
        osc.frequency.setValueAtTime(800, now);
        osc.frequency.exponentialRampToValueAtTime(200, now + 0.3);
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(2500, now);
        filter.frequency.exponentialRampToValueAtTime(800, now + 0.3);
        gain.gain.setValueAtTime(0, now);
        gain.gain.linearRampToValueAtTime(0.18, now + 0.02);
        gain.gain.linearRampToValueAtTime(0.15, now + 0.1);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.3);
        osc.start(now);
        osc.stop(now + 0.3);
    }

    synthVictory() {
        const now = this.ctx.currentTime;
        const melody = [
            { note: 523.25, time: 0 },
            { note: 659.25, time: 0.15 },
            { note: 783.99, time: 0.3 },
            { note: 1046.5, time: 0.45 }
        ];
        melody.forEach(({ note, time }) => {
            const osc = this.ctx.createOscillator();
            const filter = this.ctx.createBiquadFilter();
            const gain = this.ctx.createGain();
            osc.connect(filter);
            filter.connect(gain);
            gain.connect(this.sfxGain);
            osc.type = 'sine';
            osc.frequency.value = note;
            filter.type = 'lowpass';
            filter.frequency.setValueAtTime(6000, now);
            const startTime = now + time;
            gain.gain.setValueAtTime(0, startTime);
            gain.gain.linearRampToValueAtTime(0.18, startTime + 0.05);
            gain.gain.linearRampToValueAtTime(0.15, startTime + 0.15);
            gain.gain.exponentialRampToValueAtTime(0.01, startTime + 0.5);
            osc.start(startTime);
            osc.stop(startTime + 0.5);
        });
    }

    synthDefeat() {
        const now = this.ctx.currentTime;
        const melody = [
            { note: 440, time: 0 },
            { note: 392, time: 0.2 },
            { note: 349.23, time: 0.4 },
            { note: 261.63, time: 0.6 }
        ];
        melody.forEach(({ note, time }) => {
            const osc = this.ctx.createOscillator();
            const filter = this.ctx.createBiquadFilter();
            const gain = this.ctx.createGain();
            osc.connect(filter);
            filter.connect(gain);
            gain.connect(this.sfxGain);
            osc.type = 'triangle';
            osc.frequency.value = note;
            filter.type = 'lowpass';
            filter.frequency.setValueAtTime(2000, now);
            const startTime = now + time;
            gain.gain.setValueAtTime(0, startTime);
            gain.gain.linearRampToValueAtTime(0.18, startTime + 0.03);
            gain.gain.linearRampToValueAtTime(0.15, startTime + 0.1);
            gain.gain.exponentialRampToValueAtTime(0.01, startTime + 0.4);
            osc.start(startTime);
            osc.stop(startTime + 0.4);
        });
    }

    // ==================== 辅助方法 ====================

    playNoise(volume, duration) {
        const bufferSize = this.ctx.sampleRate * duration;
        const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
            data[i] = (Math.random() * 2 - 1) * (1 - i / bufferSize);
        }
        const noise = this.ctx.createBufferSource();
        noise.buffer = buffer;
        const gain = this.ctx.createGain();
        gain.gain.value = volume;
        const filter = this.ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.value = 1000;
        noise.connect(filter);
        filter.connect(gain);
        gain.connect(this.sfxGain);
        noise.start();
    }

    // ==================== 背景音乐（多层合成，无限循环） ====================

    /**
     * 播放背景音乐
     * @param {string} musicType - 音乐类型
     */
    playMusic(musicType = 'dungeon') {
        this.stopMusic();

        const musicConfigs = {
            dungeon: { bpm: 100, layers: ['bass', 'melody', 'pad'] },
            boss: { bpm: 150, layers: ['bass', 'melody', 'percussion', 'pad'] },
            menu: { bpm: 80, layers: ['melody', 'pad'] },
            victory: { bpm: 120, layers: ['melody', 'percussion'] }
        };

        const config = musicConfigs[musicType] || musicConfigs.dungeon;
        this.startProceduralBGM(musicType, config);
        this.currentMusic = musicType;
    }

    /**
     * 启动程序化BGM
     */
    startProceduralBGM(musicType, config) {
        const beatDuration = 60 / config.bpm;
        const barDuration = beatDuration * 4;
        const musicData = this.getMusicData(musicType);

        config.layers.forEach((layerName) => {
            const layer = musicData[layerName];
            if (!layer) {
                return;
            }
            this.scheduleLayer(layerName, layer, beatDuration, barDuration);
        });
    }

    /**
     * 获取音乐数据
     */
    getMusicData(musicType) {
        const musicData = {
            dungeon: {
                bass: {
                    type: 'triangle',
                    volume: 0.04,
                    notes: [
                        { freq: 65.41, beats: [0, 2] },
                        { freq: 73.42, beats: [1, 3] },
                        { freq: 82.41, beats: [0, 2] },
                        { freq: 73.42, beats: [1, 3] }
                    ]
                },
                melody: {
                    type: 'triangle',
                    volume: 0.03,
                    notes: [
                        { freq: 261.63, beats: [0] },
                        { freq: 293.66, beats: [1] },
                        { freq: 329.63, beats: [2] },
                        { freq: 349.23, beats: [3] },
                        { freq: 392.0, beats: [0, 2] },
                        { freq: 349.23, beats: [1, 3] }
                    ]
                },
                pad: {
                    type: 'sine',
                    volume: 0.02,
                    notes: [
                        { freq: 130.81, beats: [0], duration: 4 },
                        { freq: 164.81, beats: [0], duration: 4 }
                    ]
                }
            },
            boss: {
                bass: {
                    type: 'triangle',
                    volume: 0.04,
                    notes: [
                        { freq: 55.0, beats: [0, 1, 2, 3] },
                        { freq: 61.74, beats: [0, 1, 2, 3] }
                    ]
                },
                melody: {
                    type: 'triangle',
                    volume: 0.03,
                    notes: [
                        { freq: 440.0, beats: [0] },
                        { freq: 493.88, beats: [0.5] },
                        { freq: 523.25, beats: [1] },
                        { freq: 493.88, beats: [1.5] },
                        { freq: 440.0, beats: [2] },
                        { freq: 392.0, beats: [2.5] },
                        { freq: 349.23, beats: [3] },
                        { freq: 392.0, beats: [3.5] }
                    ]
                },
                percussion: {
                    type: 'noise',
                    volume: 0.04,
                    notes: [
                        { freq: 0, beats: [0, 2] },
                        { freq: 0, beats: [1, 3], volume: 0.02 }
                    ]
                },
                pad: {
                    type: 'sine',
                    volume: 0.02,
                    notes: [
                        { freq: 220.0, beats: [0], duration: 4 },
                        { freq: 277.18, beats: [0], duration: 4 }
                    ]
                }
            },
            menu: {
                melody: {
                    type: 'sine',
                    volume: 0.06,
                    notes: [
                        { freq: 392.0, beats: [0] },
                        { freq: 440.0, beats: [1] },
                        { freq: 493.88, beats: [2] },
                        { freq: 523.25, beats: [3] },
                        { freq: 493.88, beats: [2] },
                        { freq: 440.0, beats: [1] },
                        { freq: 392.0, beats: [0] },
                        { freq: 349.23, beats: [3] }
                    ]
                },
                pad: {
                    type: 'sine',
                    volume: 0.025,
                    notes: [
                        { freq: 196.0, beats: [0], duration: 4 },
                        { freq: 261.63, beats: [0], duration: 4 }
                    ]
                }
            },
            victory: {
                melody: {
                    type: 'triangle',
                    volume: 0.03,
                    notes: [
                        { freq: 523.25, beats: [0] },
                        { freq: 659.25, beats: [1] },
                        { freq: 783.99, beats: [2] },
                        { freq: 1046.5, beats: [3] }
                    ]
                },
                percussion: {
                    type: 'noise',
                    volume: 0.02,
                    notes: [{ freq: 0, beats: [0, 1, 2, 3] }]
                }
            }
        };

        return musicData[musicType] || musicData.dungeon;
    }

    /**
     * 调度一个音乐层级的播放
     */
    scheduleLayer(layerName, layerData, beatDuration, barDuration) {
        const scheduleBar = () => {
            if (!this.currentMusic) {
                return;
            }

            const now = this.ctx.currentTime;

            layerData.notes.forEach((note) => {
                const noteTime = now + note.beats[0] * beatDuration;
                const duration = (note.duration || 0.5) * beatDuration;
                const volume = note.volume !== undefined ? note.volume : layerData.volume;

                if (layerData.type === 'noise') {
                    this.scheduleNoise(noteTime, duration, volume);
                } else {
                    this.scheduleNote(noteTime, duration, note.freq, layerData.type, volume);
                }
            });
        };

        scheduleBar();

        const loopInterval = barDuration * 1000;
        const intervalId = setInterval(() => {
            if (!this.currentMusic) {
                clearInterval(intervalId);
                return;
            }
            scheduleBar();
        }, loopInterval);

        this.musicOscillators.push({ stop: () => clearInterval(intervalId) });
    }

    /**
     * 调度单个音符
     */
    scheduleNote(time, duration, frequency, type, volume) {
        const osc = this.ctx.createOscillator();
        const filter = this.ctx.createBiquadFilter();
        const gain = this.ctx.createGain();
        osc.connect(filter);
        filter.connect(gain);
        gain.connect(this.musicGain);
        osc.type = type;
        osc.frequency.value = frequency;
        filter.type = 'lowpass';
        filter.frequency.value = type === 'triangle' ? 2000 : 4000;
        gain.gain.setValueAtTime(0, time);
        gain.gain.linearRampToValueAtTime(volume, time + 0.02);
        gain.gain.setValueAtTime(volume, time + duration - 0.05);
        gain.gain.exponentialRampToValueAtTime(0.001, time + duration);
        osc.start(time);
        osc.stop(time + duration + 0.01);
        this.musicOscillators.push(osc);
    }

    /**
     * 调度噪声打击乐
     */
    scheduleNoise(time, duration, volume) {
        const bufferSize = this.ctx.sampleRate * duration;
        const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
            data[i] = (Math.random() * 2 - 1) * (1 - i / bufferSize);
        }
        const noise = this.ctx.createBufferSource();
        noise.buffer = buffer;
        const filter = this.ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.value = 1000;
        const gain = this.ctx.createGain();
        gain.gain.setValueAtTime(0.02, time);
        gain.gain.exponentialRampToValueAtTime(0.001, time + duration);
        noise.connect(filter);
        filter.connect(gain);
        gain.connect(this.musicGain);
        noise.start(time);
        noise.stop(time + duration);
        this.musicOscillators.push(noise);
    }

    /**
     * 停止背景音乐
     */
    stopMusic() {
        this.musicOscillators.forEach((osc) => {
            try {
                osc.stop();
            } catch (e) {}
        });
        this.musicOscillators = [];
        this.currentMusic = null;
    }

    // ==================== 环境音 ====================

    playAmbientSound(type = 'torch') {
        if (!this.ambientSoundEnabled) {
            return;
        }
        this.stopAmbientSound();
        const now = this.ctx.currentTime;
        switch (type) {
            case 'torch':
                this.playTorchSound(now);
                break;
            case 'wind':
                this.playWindSound(now);
                break;
        }
    }

    playTorchSound(startTime) {
        const duration = 2;
        const bufferSize = this.ctx.sampleRate * duration;
        const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
            data[i] = (Math.random() * 2 - 1) * 0.3;
        }
        const noise = this.ctx.createBufferSource();
        noise.buffer = buffer;
        noise.loop = true;
        const filter = this.ctx.createBiquadFilter();
        filter.type = 'bandpass';
        filter.frequency.value = 800;
        filter.Q.value = 0.5;
        const gain = this.ctx.createGain();
        gain.gain.value = 0.05;
        noise.connect(filter);
        filter.connect(gain);
        gain.connect(this.ambientGain);
        noise.start(startTime);
        this.ambientSound = noise;
    }

    playWindSound(startTime) {
        const duration = 3;
        const bufferSize = this.ctx.sampleRate * duration;
        const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
            data[i] = Math.random() * 2 - 1;
        }
        const noise = this.ctx.createBufferSource();
        noise.buffer = buffer;
        noise.loop = true;
        const filter = this.ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.value = 500;
        const gain = this.ctx.createGain();
        gain.gain.value = 0.04;
        const lfo = this.ctx.createOscillator();
        const lfoGain = this.ctx.createGain();
        lfo.frequency.value = 0.2;
        lfoGain.gain.value = 100;
        lfo.connect(lfoGain);
        lfoGain.connect(filter.frequency);
        lfo.start();
        noise.connect(filter);
        filter.connect(gain);
        gain.connect(this.ambientGain);
        noise.start(startTime);
        this.ambientSound = noise;
    }

    stopAmbientSound() {
        if (this.ambientSound) {
            try {
                this.ambientSound.stop();
            } catch (e) {}
            this.ambientSound = null;
        }
    }

    // ==================== 音量控制 ====================

    setMasterVolume(volume) {
        this.masterVolume = Math.max(0, Math.min(1, volume));
        if (this.masterGain) {
            this.masterGain.gain.value = this.masterVolume;
        }
    }

    setSfxVolume(volume) {
        this.sfxVolume = Math.max(0, Math.min(1, volume));
        if (this.sfxGain) {
            this.sfxGain.gain.value = this.sfxVolume;
        }
    }

    setMusicVolume(volume) {
        this.musicVolume = Math.max(0, Math.min(1, volume));
        if (this.musicGain) {
            this.musicGain.gain.value = this.musicVolume;
        }
    }

    setAmbientVolume(volume) {
        this.ambientVolume = Math.max(0, Math.min(1, volume));
        if (this.ambientGain) {
            this.ambientGain.gain.value = this.ambientVolume;
        }
    }

    setUISoundEnabled(enabled) {
        this.uiSoundEnabled = enabled;
    }

    setAmbientSoundEnabled(enabled) {
        this.ambientSoundEnabled = enabled;
        if (!enabled) {
            this.stopAmbientSound();
        }
    }
}

const soundManager = new SoundManager();
