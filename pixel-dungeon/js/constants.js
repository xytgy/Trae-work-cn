/**
 * 游戏常量定义
 * 包含所有游戏相关的配置数值和常量
 */

// ==================== 游戏画布尺寸 ====================
const GAME_WIDTH = 800;      // 游戏画布宽度
const GAME_HEIGHT = 600;     // 游戏画布高度

// ==================== 游戏循环 ====================
const TARGET_FPS = 60;                    // 目标帧率
const FRAME_TIME = 1000 / TARGET_FPS;     // 每帧时间（毫秒）
const DELTA_TIME_MAX = 100;               // 最大delta time，防止卡顿

// ==================== 调色板 - 地牢背景 ====================
const COLORS = {
    // 地牢背景
    DUNGEON: {
        BACKGROUND: '#1a1a2e',     // 主背景
        FLOOR: '#16213e',          // 地砖
        WALL: '#0f3460',           // 墙壁
        DOOR: '#e94560'            // 门
    },
    // 玩家
    PLAYER: {
        BODY: '#4fc3f7',           // 身体
        EYES: '#ffffff',          // 眼睛
        WEAPON: '#ffd54f'         // 武器
    },
    // 敌人
    ENEMY: {
        SLIME: '#4caf50',         // 史莱姆（小怪A）
        BAT: '#f44336',           // 蝙蝠（小怪B）
        GHOST: '#9c27b0',         // 幽灵（小怪C）
        BOSS: '#7b1fa2'           // Boss
    },
    // 武器
    WEAPON: {
        PISTOL: '#ffd54f',        // 手枪
        LIGHTNING: '#ffeb3b',     // 闪电法杖
        GRENADE: '#ff9800',       // 榴弹发射器
        FLAME: '#f44336',         // 火焰喷射器
        BOOMERANG: '#e91e63',     // 回旋镖
        FREEZE: '#00bcd4',        // 冰冻枪
        SHOTGUN: '#ff9800',       // 散弹枪
        HOMING: '#9c27b0'         // 追踪导弹
    },
    // 子弹
    BULLET: {
        NORMAL: '#ffd54f',        // 普通子弹
        ENEMY: '#ff1744',         // 敌人子弹
        LIGHTNING: '#ffeb3b',     // 闪电子弹
        GRENADE: '#ff9800',       // 榴弹
        FLAME: '#ff5722',         // 火焰
        LASER: '#ffff00',         // 激光
        FREEZE: '#00bcd4',        // 冰冻子弹
        SHOTGUN: '#ff9800',       // 散弹
        HOMING: '#9c27b0'         // 追踪导弹
    },
    // UI
    UI: {
        HEALTH_FULL: '#e91e63',   // 满血心形
        HEALTH_EMPTY: '#424242',  // 空血心形
        TEXT: '#ffffff',          // 主文字
        TEXT_PRIMARY: '#ffffff',   // 主文字（别名）
        TEXT_SECONDARY: '#aaaaaa', // 副文字
        TEXT_SHADOW: '#000000',   // 文字阴影
        OVERLAY: 'rgba(0, 0, 0, 0.7)', // 遮罩
        
        // 按钮颜色
        BUTTON_BG: '#ff6600',
        BUTTON_BG_HOVER: '#ff8833',
        BUTTON_BORDER: '#ff9900',
        BUTTON_BORDER_HOVER: '#ffcc00',
        
        // 标题颜色
        TITLE_FILL: '#ffcc00',
        TITLE_STROKE: '#ff6600',
        TITLE_GLOW: '#ff6600',
        
        // 菜单背景
        MENU_BG_TOP: '#1a1030',
        MENU_BG_BOTTOM: '#0a0520',
        
        // 怒气条
        RAGE_FULL: '#ffcc00',
        RAGE_EMPTY: '#333333',
        
        // 技能
        SKILL_READY: '#00ff00',
        SKILL_COOLDOWN: '#666666',
        
        // 伤害类型
        DAMAGE_CRIT: '#ffff00',
        DAMAGE_FIRE: '#ff6600',
        DAMAGE_FROST: '#00ccff',
        DAMAGE_POISON: '#33ff33',
        DAMAGE_LIGHTNING: '#ffff33',
        
        // Buff效果
        BUFF_SPEED: '#00ff00',
        BUFF_DAMAGE: '#ff0000',
        BUFF_DEFENSE: '#0000ff',
        BUFF_DEFAULT: '#ffff00'
    },
    // 粒子
    PARTICLE: {
        EXPLOSION: '#ff5722',     // 爆炸
        SPARK: '#ffeb3b',         // 火花
        HEAL: '#4caf50',          // 治疗
        PORTAL: '#9c27b0'         // 传送门
    }
};

// ==================== 像素尺寸规格 ====================
const PIXEL_SIZE = {
    PLAYER: 16,         // 玩家角色
    ENEMY: 16,          // 普通敌人
    BOSS: 32,           // Boss
    BULLET: 8,          // 子弹
    WEAPON_ICON: 16,    // 武器图标
    PORTAL: 32,         // 传送门
    TILE: 40            // 墙壁厚度
};

// ==================== 玩家属性 ====================
const PLAYER = {
    SIZE: 16,                   // 角色尺寸
    SPEED: 4,                   // 基础移动速度（像素/帧）
    MAX_HEALTH: 3,              // 最大生命值（心数）
    INVINCIBLE_TIME: 1000,      // 无敌时间（毫秒）
    FLASH_INTERVAL: 80,         // 闪烁间隔（毫秒）- 调快让无敌帧更明显
    MAX_WEAPONS: 2,             // 最大携带武器数
    WEAPON_SWITCH_COOLDOWN: 150, // 武器切换冷却时间（毫秒）- 缩短提升手感
    
    // 移动系统参数（优化后）
    MAX_SPEED: 5.2,             // 最大速度（像素/帧）- 略微提升最高速度
    ACCELERATION: 2.2,          // 加速度（像素/帧²）- 提升后响应更快更灵敏
    DECELERATION: 2.8,          // 减速度（像素/帧²，松开按键时）- 更快停止
    FRICTION: 0.82,             // 摩擦系数（无输入时每帧乘以摩擦系数）- 更快减速
    AIR_RESISTANCE: 0.99,       // 空气阻力（移动时的微小阻力）
    
    // 插值参数
    INTERPOLATION_FACTOR: 0.3,  // 位置插值系数（每帧向目标靠近的比例）- 跟随更紧更流畅
    
    // 新增移动参数
    TURN_SENSITIVITY: 0.9,      // 转向灵敏度（0-1，越高转向越快）- 提升转向响应
    DIAGONAL_CORRECTION: 0.97,  // 对角线移动修正系数 - 略微提升对角线速度
    BURST_SPEED: 1.6,           // 起步爆发速度倍率 - 更强的起步爆发力
    BURST_DURATION: 200,        // 起步爆发持续时间（毫秒）- 延长爆发时间
    WALL_SLIDE_FACTOR: 0.75,    // 靠墙滑行速度衰减系数 - 优化靠墙移动
    
    // 走路动画参数
    WALK_BOB_AMOUNT: 2,         // 走路摆动幅度（像素）
    WALK_BOB_SPEED: 0.1,        // 走路摆动速度系数
    MAX_TILT: 0.1,              // 最大倾斜角度（弧度）
    TILT_SPEED: 0.1,            // 倾斜过渡速度
    
    // 阴影参数
    SHADOW_COLOR: 'rgba(0, 0, 0, 0.3)',  // 阴影颜色
    SHADOW_WIDTH: 12,           // 阴影宽度
    SHADOW_HEIGHT: 4,           // 阴影高度
    SHADOW_OFFSET_Y: 12         // 阴影Y轴偏移
};

// ==================== 武器属性 ====================
const WEAPONS = {
    PISTOL: {
        ID: 1, NAME: '手枪', DAMAGE: 1, FIRE_RATE: 270,
        AMMO: Infinity, MAX_AMMO: Infinity, BULLET_SPEED: 8,
        RECOIL: 3, COLOR: '#ffd54f', ICON: '🔫'
    },
    LIGHTNING: {
        ID: 2, NAME: '闪电法杖', DAMAGE: 1.5, FIRE_RATE: 200,
        AMMO: 30, MAX_AMMO: 30, BULLET_SPEED: 12, PENETRATE: 1,
        RECOIL: 2, COLOR: '#ffeb3b', ICON: '⚡'
    },
    GRENADE: {
        ID: 3, NAME: '榴弹发射器', DAMAGE: 3, FIRE_RATE: 800,
        AMMO: 15, MAX_AMMO: 15, BULLET_SPEED: 6, EXPLOSION_RADIUS: 60,
        RECOIL: 8, COLOR: '#ff9800', ICON: '💣'
    },
    FLAME: {
        ID: 4, NAME: '火焰喷射器', DAMAGE: 1, FIRE_RATE: 50,
        AMMO: 50, MAX_AMMO: 50, BULLET_SPEED: 5, RANGE: 120,
        BURN_DAMAGE: 1, RECOIL: 1, COLOR: '#f44336', ICON: '🔥'
    },
    BOOMERANG: {
        ID: 5, NAME: '星星回旋镖', DAMAGE: 2, FIRE_RATE: 400,
        AMMO: 20, MAX_AMMO: 20, BULLET_SPEED: 7, BOOMERANG: true,
        MULTI_HIT: true, PENETRATE: 2, RECOIL: 4, COLOR: '#e91e63', ICON: '⭐'
    },
    FREEZE: {
        ID: 6, NAME: '冰冻枪', DAMAGE: 1, FIRE_RATE: 400,
        AMMO: 25, MAX_AMMO: 25, BULLET_SPEED: 9, SLOW_FACTOR: 0.45,
        SLOW_DURATION: 2000, RECOIL: 3, COLOR: '#00bcd4', ICON: '❄️'
    },
    SHOTGUN: {
        ID: 7, NAME: '散弹枪', DAMAGE: 1, FIRE_RATE: 700,
        AMMO: 20, MAX_AMMO: 20, BULLET_SPEED: 8, BULLET_COUNT: 3,
        SPREAD_ANGLE: 27, RECOIL: 7, COLOR: '#ff9800', ICON: '🎯'
    },
    HOMING: {
        ID: 8, NAME: '追踪导弹', DAMAGE: 2, FIRE_RATE: 900,
        AMMO: 12, MAX_AMMO: 12, BULLET_SPEED: 5, MAX_SPEED: 12,
        ACCELERATION: 0.1, TURN_SPEED: 2.4, EXPLOSION_RADIUS: 20,
        RECOIL: 6, COLOR: '#9c27b0', ICON: '🚀'
    }
};

// ==================== 敌人属性 ====================
const ENEMIES = {
    SLIME: { TYPE: 'slime', NAME: '绿色史莱姆', SIZE: 16, HEALTH: 2, SPEED: 1.5, DAMAGE: 1, DROP_RATE: 0.3, ATTACK_RANGE: 30, ATTACK_COOLDOWN: 1000, COLOR: '#4caf50', AI: 'chase' },
    BAT: { TYPE: 'bat', NAME: '红色蝙蝠', SIZE: 16, HEALTH: 1, SPEED: 3, DAMAGE: 1, DROP_RATE: 0.25, ATTACK_RANGE: 30, ATTACK_COOLDOWN: 500, COLOR: '#f44336', AI: 'flanker' },
    GHOST: { TYPE: 'ghost', NAME: '紫色幽灵', SIZE: 16, HEALTH: 2, SPEED: 2, DAMAGE: 1, DROP_RATE: 0.35, ATTACK_RANGE: 30, ATTACK_COOLDOWN: 2000, SHOOT_INTERVAL: 2000, BULLET_SPEED: 4, COLOR: '#9c27b0', AI: 'shooter' }
};

// ==================== Boss属性 ====================
const BOSS = {
    SIZE: 32, HEALTH: 20, SPEED: 1, DAMAGE: 2,
    PHASE1: { NAME: '正常状态', HEALTH_THRESHOLD: 0.5, ATTACK: 'spreadshot', ATTACK_COOLDOWN: 3000, BULLET_COUNT: 5, BULLET_SPEED: 5 },
    PHASE2: { NAME: '狂暴状态', HEALTH_THRESHOLD: 0.25, SPEED_MULTIPLIER: 1.5, SUMMON_INTERVAL: 5000, SUMMON_COUNT: 2, COLOR: '#ff1744', CHARGE_COOLDOWN: 8000, CHARGE_WARNING: 800, CHARGE_DURATION: 500, CHARGE_SPEED_MULTIPLIER: 3, CHARGE_DAMAGE_MULTIPLIER: 2, CHARGE_STUN_DURATION: 1000 },
    PHASE3: { NAME: '最终状态', LASER_WIDTH: 40, LASER_DURATION: 2000, LASER_INTERVAL: 8000, LASER_WARNING: 500, DAMAGE_PER_TICK: 1, COLOR: '#ffff00', HEAL_THRESHOLD: 3, HEAL_AMOUNT: 2, HEAL_CHARGE_TIME: 3000, HEAL_COOLDOWN: 15000, HEAL_DAMAGE_THRESHOLD: 3, SPREADSHOT_COOLDOWN: 4000, SUMMON_INTERVAL: 7000 },
    DODGE: { PROBABILITY: 0.4, SPEED_MULTIPLIER: 2, DURATION: 300, COOLDOWN: 2000, TILT_ANGLE: 0.3 },
    SUMMON_POSITION: { BEHIND_PLAYER: 0.5, SIDE_PLAYER: 0.3, NEAR_BOSS: 0.2, EFFECT_DURATION: 500, FADE_IN_DURATION: 300 }
};

// ==================== 关卡配置 ====================
const LEVELS = {
    COUNT: 7, ROOM_WIDTH: GAME_WIDTH, ROOM_HEIGHT: GAME_HEIGHT, WALL_THICKNESS: 40, DOOR_SIZE: 60,
    ENEMIES: [
        { slime: 2, bat: 0, ghost: 0 },
        { slime: 2, bat: 1, ghost: 0 },
        { slime: 1, bat: 2, ghost: 1 },
        { slime: 2, bat: 2, ghost: 2 },
        { boss: true }
    ]
};

// ==================== 传送门配置 ====================
const PORTAL = {
    SIZE: 32,
    SPAWN_DELAY: 3000,          // 击杀后3秒出现
    COLOR: '#9c27b0',
    PARTICLE_COLOR: '#e91e63'
};

// ==================== 粒子系统配置 ====================
const PARTICLES = {
    MAX_COUNT: 200,             // 同时最大粒子数（增加以支持环境粒子）
    LIFETIME_MIN: 300,          // 最短寿命（毫秒）
    LIFETIME_MAX: 1000,         // 最长寿命（毫秒）
    SPEED_MIN: 1,
    SPEED_MAX: 5,
    SIZE_MIN: 2,
    SIZE_MAX: 8,
    
    // 粒子形状类型
    KIND: {
        CIRCLE: 'circle',
        SQUARE: 'square',
        RING: 'ring',
        STAR: 'star',
        BURN_MARK: 'burn_mark',
        DUST: 'dust'            // 灰尘粒子
    },
    
    // 各种粒子效果配置
    TYPES: {
        BULLET_TRAIL: { size: 4, lifetime: 200, color: '#ffd54f' },
        WEAPON_PICKUP: { size: 8, lifetime: 500, color: '#ffd54f' },
        DAMAGE_FLASH: { size: 16, lifetime: 300, color: '#ff0000' },
        ENEMY_DEATH: { size: 6, lifetime: 400, color: '#9c27b0' },
        BOSS_EXPLOSION: { size: 10, lifetime: 1000, color: '#ff5722' },
        PORTAL: { size: 8, lifetime: 600, color: '#9c27b0' },
        FLAME: { size: 6, lifetime: 300, color: '#ff5722' },
        AMBIENT_DUST: { sizeMin: 1, sizeMax: 2, lifetime: 10000, color: 'rgba(255, 255, 200, 0.3)' },

        // 击中碎片
        HIT_FRAGMENT: { countMin: 3, countMax: 6, speedMin: 2, speedMax: 5, sizeMin: 2, sizeMax: 4, lifetimeMin: 200, lifetimeMax: 400, gravity: 0.15 },

        // 爆炸碎片
        EXPLOSION_FRAGMENT: { countMin: 8, countMax: 15, speedMin: 2, speedMax: 6, sizeMin: 2, sizeMax: 5, lifetimeMin: 300, lifetimeMax: 600, gravity: 0.1, colors: ['#ff5722', '#ff9800', '#ffeb3b', '#ffffff'] },

        // 爆炸烟雾
        EXPLOSION_SMOKE: { countMin: 5, countMax: 10, speedMin: 1, speedMax: 3, sizeMin: 8, sizeMax: 16, lifetimeMin: 500, lifetimeMax: 1000, gravity: -0.03, color: '#666666' },

        // 燃烧痕迹
        BURN_MARK: { sizeMin: 8, sizeMax: 16, lifetime: 3000, color: 'rgba(80, 30, 10, 0.5)', flickerSpeed: 0.02 },

        // 升级光环
        UPGRADE_RING: { ringCount: 3, expandSpeedMin: 0.5, expandSpeedMax: 1.0, lifetime: 500, colors: ['#ffd700', '#ffcc00', '#ffaa00'] },
        UPGRADE_STAR: { countMin: 5, countMax: 10, speedMin: 1, speedMax: 3, sizeMin: 3, sizeMax: 6, lifetimeMin: 400, lifetimeMax: 800, color: '#ffd700', gravity: -0.05 },

        // 激光预警粒子
        LASER_WARNING: { countMin: 5, countMax: 10, sizeMin: 2, sizeMax: 4, lifetimeMin: 200, lifetimeMax: 500, flickerSpeed: 0.1, colors: ['#ff0000', '#ff4444'] },

        // 枪口闪光
        MUZZLE_FLASH: {
            MAIN: { size: 12, lifetime: 100 },
            SPARK: { count: 5, sizeMin: 2, sizeMax: 4, lifetimeMin: 100, lifetimeMax: 300 }
        },

        // 蓄力光环
        CAST_RING: { size: 20, lifetime: 400, color: '#ffff00' }
    }
};

// ==================== 地砖配置 ====================
const FLOOR_TILE = {
    SIZE: 32,                   // 地砖尺寸
    TYPES: {
        NORMAL: 0,              // 普通地砖
        PATTERN: 1,             // 花纹地砖
        WORN: 2                 // 磨损地砖
    },
    COLORS: {
        BASE: ['#2a2040', '#251c38', '#2f2448'],  // 地砖基础颜色（深紫色系）
        DETAIL: '#1a1530',                         // 花纹细节颜色
        GAP: 'rgba(0, 0, 0, 0.3)'                  // 地砖缝隙颜色
    },
    PATTERN_CHANCE: 0.2,        // 花纹地砖出现概率
    WORN_CHANCE: 0.15           // 磨损地砖出现概率
};

// ==================== 墙壁配置 ====================
const WALL_BRICK = {
    BRICK_WIDTH: 32,            // 砖块宽度
    BRICK_HEIGHT: 16,           // 砖块高度
    COLORS: {
        BASE: '#4a4060',        // 砖块主体颜色
        HIGHLIGHT: '#5a5070',   // 顶部/左侧高光
        SHADOW: '#3a3050'       // 底部/右侧阴影
    }
};

// ==================== 光影系统配置 ====================
const LIGHTING = {
    AMBIENT_COLOR: 'rgba(10, 5, 20, 0.4)',  // 环境暗度
    VIGNETTE_STRENGTH: 0.3,                 // 暗角强度
    PLAYER_LIGHT: {
        RADIUS: 150,                        // 玩家光圈半径
        INTENSITY: 0.8,                     // 玩家光圈强度
        COLOR: 'rgba(255, 200, 100, 1)'     // 玩家光圈颜色（暖黄色）
    },
    TORCH_LIGHT: {
        RADIUS: 100,                        // 火把光圈半径
        INTENSITY: 0.6,                     // 火把光圈强度
        COLOR: 'rgba(255, 150, 50, 1)'      // 火把光圈颜色（橙黄色）
    }
};

// ==================== 环境装饰配置 ====================
const DECORATIONS = {
    TYPES: {
        TORCH: 'torch',       // 火把
        SKULL: 'skull',       // 骷髅
        CHEST: 'chest',       // 箱子
        PILLAR: 'pillar'      // 石柱
    },
    TORCH_COUNT: 4,           // 每房间火把数量
    SKULL_COUNT: 3,           // 每房间骷髅数量
    CHEST_COUNT: 1,           // 每房间箱子数量
    PILLAR_COUNT: 2           // 每房间石柱数量
};

// ==================== 动画配置 ====================
const ANIMATION = {
    STAND: { fps: 4, loop: true },
    MOVE: { fps: 8, loop: true },
    HURT: { fps: 10, loop: false },
    DEATH: { fps: 6, loop: false }
};

// ==================== 音效配置（占位符） ====================
const AUDIO = {
    // 射击音效
    SHOOT: {
        PISTOL: 'shoot_pistol',
        LIGHTNING: 'shoot_lightning',
        GRENADE: 'shoot_grenade',
        FLAME: 'shoot_flame',
        BOOMERANG: 'shoot_boomerang',
        FREEZE: 'shoot_freeze',
        SHOTGUN: 'shoot_shotgun',
        HOMING: 'shoot_homing'
    },
    // 其他音效
    KILL: 'enemy_kill',
    PICKUP: 'weapon_pickup',
    HURT: 'player_hurt',
    BOSS_APPEAR: 'boss_appear',
    BOSS_ATTACK: 'boss_attack',
    VICTORY: 'victory',
    GAME_OVER: 'game_over'
};

// ==================== 游戏状态 ====================
const GAME_STATE = {
    MENU: 'menu',
    CHARACTER_SELECT: 'character_select',
    DIFFICULTY_SELECT: 'difficulty_select',
    PLAYING: 'playing',
    PAUSED: 'paused',
    ROUTE_SELECT: 'route_select',
    GAME_OVER: 'game_over',
    VICTORY: 'victory',
    SAVE_SELECT: 'save_select',
    SETTINGS: 'settings',
    LEADERBOARD: 'leaderboard',
    TUTORIAL: 'tutorial',
    ACHIEVEMENTS: 'achievements',
    HELP: 'help'
};

// ==================== Buff类型配置 ====================
const BUFF_TYPE = {
    HEALTH: 'health',
    RAGE: 'rage',
    SHIELD: 'shield',
    SPEED: 'speed',
    DAMAGE: 'damage',
    CRIT: 'crit',
    INVINCIBLE: 'invincible',
    POISON: 'poison',
    INVISIBLE: 'invisible'
};

// ==================== 难度系统配置 ====================
const DIFFICULTY = {
    // 难度等级定义
    LEVELS: {
        EASY: {
            id: 'easy',
            name: '简单',
            icon: '🌱',
            description: '适合新手',
            color: '#4caf50',
            
            // 敌人属性缩放
            enemy: {
                healthMultiplier: 0.7,
                damageMultiplier: 0.7,
                speedMultiplier: 0.9,
                aiLevel: 1
            },
            
            // 玩家属性影响
            player: {
                initialHealth: 4,
                goldMultiplier: 1.5,
                shopPriceMultiplier: 0.8,
                dropRateMultiplier: 1.3
            },
            
            // 房间配置
            room: {
                normalRoomCount: 3,
                eliteRoomChance: 0.05,
                bossCount: 1
            }
        },
        
        NORMAL: {
            id: 'normal',
            name: '普通',
            icon: '⚔️',
            description: '平衡的挑战',
            color: '#2196f3',
            
            // 敌人属性缩放
            enemy: {
                healthMultiplier: 1.0,
                damageMultiplier: 1.0,
                speedMultiplier: 1.0,
                aiLevel: 1
            },
            
            // 玩家属性影响
            player: {
                initialHealth: 3,
                goldMultiplier: 1.0,
                shopPriceMultiplier: 1.0,
                dropRateMultiplier: 1.0
            },
            
            // 房间配置
            room: {
                normalRoomCount: 4,
                eliteRoomChance: 0.15,
                bossCount: 1
            }
        },
        
        HARD: {
            id: 'hard',
            name: '困难',
            icon: '💀',
            description: '真正的挑战',
            color: '#ff9800',
            
            // 敌人属性缩放
            enemy: {
                healthMultiplier: 1.5,
                damageMultiplier: 1.3,
                speedMultiplier: 1.1,
                aiLevel: 2
            },
            
            // 玩家属性影响
            player: {
                initialHealth: 3,
                goldMultiplier: 0.8,
                shopPriceMultiplier: 1.2,
                dropRateMultiplier: 0.8
            },
            
            // 房间配置
            room: {
                normalRoomCount: 5,
                eliteRoomChance: 0.25,
                bossCount: 1
            }
        },
        
        NIGHTMARE: {
            id: 'nightmare',
            name: '噩梦',
            icon: '🔥',
            description: '只有勇者才能生还',
            color: '#f44336',
            
            // 敌人属性缩放
            enemy: {
                healthMultiplier: 2.0,
                damageMultiplier: 1.5,
                speedMultiplier: 1.2,
                aiLevel: 3
            },
            
            // 玩家属性影响
            player: {
                initialHealth: 2,
                goldMultiplier: 0.5,
                shopPriceMultiplier: 1.5,
                dropRateMultiplier: 0.6
            },
            
            // 房间配置
            room: {
                normalRoomCount: 6,
                eliteRoomChance: 0.35,
                bossCount: 2
            }
        }
    },
    
    // 默认难度
    DEFAULT: 'normal',
    
    // 房间难度递增配置
    ROOM_PROGRESSION: {
        // 每个房间的敌人强度倍率（相对于基础难度）
        enemyStrengthByRoom: [
            0.8,    // 第1房间
            0.9,    // 第2房间
            1.0,    // 第3房间
            1.1,    // 第4房间
            1.2,    // 第5房间
            1.3     // Boss房
        ],
        
        // 敌人组合配置
        enemyComposition: {
            EARLY: ['slime'],                    // 前期：只有史莱姆
            MID: ['slime', 'bat'],               // 中期：史莱姆+蝙蝠
            LATE: ['slime', 'bat', 'ghost'],     // 后期：全部敌人
            ELITE: ['slime', 'bat', 'ghost', 'elite'], // 精英房
            BOSS: ['boss']                       // Boss房
        }
    },
    
    // AI等级配置
    AI_LEVELS: {
        1: {
            name: '简单',
            chaseAccuracy: 0.7,      // 追踪精确度
            attackCooldownMultiplier: 1.5, // 攻击冷却倍率（越大越慢）
            dodgeChance: 0,          // 闪避概率
            predictiveMovement: false, // 是否预测玩家移动
            keepDistance: false      // 是否保持攻击距离
        },
        2: {
            name: '普通',
            chaseAccuracy: 1.0,
            attackCooldownMultiplier: 1.0,
            dodgeChance: 0.2,
            predictiveMovement: false,
            keepDistance: true
        },
        3: {
            name: '困难',
            chaseAccuracy: 1.2,
            attackCooldownMultiplier: 0.7,
            dodgeChance: 0.4,
            predictiveMovement: true,
            keepDistance: true
        }
    }
};

// ==================== 碰撞检测配置 ====================
const COLLISION = {
    // 碰撞检测类型
    TYPE: {
        PLAYER: 'player',
        ENEMY: 'enemy',
        BULLET: 'bullet',
        ENEMY_BULLET: 'enemy_bullet',
        WALL: 'wall',
        PORTAL: 'portal'
    }
};

// ==================== 怒气系统配置 ====================
const RAGE = {
    MAX_RAGE: 100,                // 最大怒气值
    KILL_RAGE_GAIN: 15,           // 击杀敌人获得的怒气
    HURT_RAGE_GAIN: 8,            // 受伤时获得的怒气
    DECAY_RATE: 2,                // 怒气自然衰减速度（每秒）
    DECAY_DELAY: 3000,            // 怒气衰减延迟（毫秒，最后一次获取怒气后多久开始衰减）
    FULL_THRESHOLD: 100            // 满怒气阈值
};

// ==================== UI布局配置 ====================
const UI = {
    // 顶部信息栏
    TOP_BAR_HEIGHT: 60,
    TOP_BAR_Y: 0,
    
    // 底部技能栏
    BOTTOM_BAR_HEIGHT: 50,
    
    // 怒气条
    RAGE_BAR_X: 10,
    RAGE_BAR_Y: 70,
    RAGE_BAR_WIDTH: 150,
    RAGE_BAR_HEIGHT: 12,
    
    // 角色信息框
    CHARACTER_INFO_WIDTH: 100,
    CHARACTER_INFO_HEIGHT: 80,
    CHARACTER_INFO_X_OFFSET: 10,
    CHARACTER_INFO_Y_OFFSET: 10,
    
    // 伤害数字
    DAMAGE_NUMBER_DURATION: 1000,
    DAMAGE_NUMBER_SPEED: 2,
    
    // 技能栏
    SKILL_BAR_HEIGHT: 50,
    SKILL_NAME_OFFSET_Y: 20,
    SKILL_CD_BAR_WIDTH: 200,
    SKILL_CD_BAR_HEIGHT: 8,
    SKILL_CD_OFFSET_Y: 28
};

// ==================== 击中反馈系统配置 ====================
const FEEDBACK = {
    // 击中闪白
    HIT_FLASH: {
        ENEMY_DURATION: 100,      // 敌人闪白持续时间（毫秒）
        PLAYER_DURATION: 150,     // 玩家闪白持续时间（毫秒）
        INTENSITY: 1.0            // 闪白最大强度
    },
    
    // 屏幕震动
    SCREEN_SHAKE: {
        PLAYER_HURT: { intensity: 3, duration: 200 },    // 玩家受伤
        ENEMY_KILLED: { intensity: 2, duration: 100 },   // 击杀敌人
        EXPLOSION: { intensity: 5, duration: 300 },      // 爆炸
        BOSS_ATTACK: { intensity: 8, duration: 500 },    // Boss攻击
        WEAPON_PICKUP: { intensity: 4, duration: 200 },  // 拾取强力武器
        BOSS_DEATH: { intensity: 10, duration: 800 }     // Boss死亡
    },
    
    // 击退效果
    KNOCKBACK: {
        ENEMY_BASE_FORCE: 8,       // 敌人基础击退力
        ENEMY_DAMAGE_MULT: 2,      // 敌人击退伤害倍率
        PLAYER_FORCE: 5,           // 玩家击退力
        RECOVERY_TIME: 200,        // 击退恢复时间（毫秒）
        FRICTION: 0.85             // 击退摩擦系数
    },
    
    // 慢动作效果
    SLOW_MOTION: {
        BOSS_DEATH: { duration: 500, targetScale: 0.1 },     // Boss死亡
        PERFECT_DODGE: { duration: 200, targetScale: 0.5 },  // 极限闪避
        LEGENDARY_WEAPON: { duration: 300, targetScale: 0.2 } // 传说武器
    },
    
    // 时间停止效果
    TIME_STOP: {
        POWER_WEAPON: 300,      // 强力武器拾取（毫秒）
        VICTORY: 500            // 通关瞬间（毫秒）
    }
};

// ==================== 敌人血条配置 ====================
const ENEMY_HEALTH_BAR = {
    WIDTH: 30,           // 血条宽度
    HEIGHT: 4,           // 血条高度
    Y_OFFSET: 20,        // 头顶偏移量
    BG_COLOR: '#333333', // 背景色
    BORDER_COLOR: '#000000', // 边框色
    LOW_THRESHOLD: 0.3,  // 低血量阈值
    MID_THRESHOLD: 0.6,  // 中血量阈值
    COLOR_LOW: '#ff0000',    // 低血量颜色
    COLOR_MID: '#ffff00',    // 中血量颜色
    COLOR_HIGH: '#00ff00',   // 高血量颜色
    BOSS_WIDTH: 200,     // Boss血条宽度
    BOSS_HEIGHT: 12,     // Boss血条高度
    BOSS_Y: 30           // Boss血条Y位置
};

// ==================== UI颜色配置 ====================
// 与COLORS.UI保持一致，提供完整的UI颜色定义
const UI_COLORS = {
    // 基础文字颜色（与COLORS.UI一致）
    TEXT: COLORS.UI.TEXT,
    TEXT_PRIMARY: COLORS.UI.TEXT_PRIMARY,
    TEXT_SECONDARY: COLORS.UI.TEXT_SECONDARY,
    TEXT_SHADOW: COLORS.UI.TEXT_SHADOW,
    
    // 怒气条
    RAGE_EMPTY: COLORS.UI.RAGE_EMPTY,
    RAGE_FULL: COLORS.UI.RAGE_FULL,
    RAGE_FULL_EFFECT: '#ffffff',
    RAGE_GRADIENT_START: '#ff0000',
    RAGE_GRADIENT_MID: '#ff6600',
    RAGE_GRADIENT_END: COLORS.UI.RAGE_FULL,
    
    // 技能栏
    SKILL_READY: COLORS.UI.SKILL_READY,
    SKILL_COOLDOWN: COLORS.UI.SKILL_COOLDOWN,
    SKILL_BAR_BG: 'rgba(0, 0, 0, 0.7)',
    SKILL_TEXT: '#ffffff',
    SKILL_CD_TEXT: '#ff6666',
    
    // 伤害数字
    DAMAGE_NORMAL: '#ffffff',
    DAMAGE_CRIT: COLORS.UI.DAMAGE_CRIT,
    
    // 伤害类型颜色（与COLORS.UI一致）
    DAMAGE_FIRE: COLORS.UI.DAMAGE_FIRE,
    DAMAGE_FROST: COLORS.UI.DAMAGE_FROST,
    DAMAGE_POISON: COLORS.UI.DAMAGE_POISON,
    DAMAGE_LIGHTNING: COLORS.UI.DAMAGE_LIGHTNING,
    DAMAGE_DARK: '#9933ff',
    DAMAGE_HEAL: '#00ff00',
    HEALTH_GREEN: '#00ff00',
    DAMAGE_SKILL: '#00ccff',
    
    // 被动技能buff颜色（与COLORS.UI一致）
    BUFF_SPEED: COLORS.UI.BUFF_SPEED,
    BUFF_DAMAGE: COLORS.UI.BUFF_DAMAGE,
    BUFF_DEFENSE: COLORS.UI.BUFF_DEFENSE,
    BUFF_DEFAULT: COLORS.UI.BUFF_DEFAULT,
    
    // 角色信息框
    INFO_BG: 'rgba(0, 0, 0, 0.7)',
    INFO_BORDER: '#ffffff',
    INFO_NAME: '#ffffff',
    INFO_TITLE: '#aaaaaa',
    INFO_PASSIVE: '#ffcc00',
    
    // 主菜单UI颜色（与COLORS.UI一致）
    MENU_TITLE_GLOW: COLORS.UI.TITLE_GLOW,
    MENU_TITLE_FILL: COLORS.UI.TITLE_FILL,
    MENU_TITLE_STROKE: COLORS.UI.TITLE_STROKE,
    MENU_BUTTON_GRADIENT_START: COLORS.UI.BUTTON_BG,
    MENU_BUTTON_GRADIENT_END: '#cc3300',
    MENU_BUTTON_HOVER_START: COLORS.UI.BUTTON_BG_HOVER,
    MENU_BUTTON_HOVER_END: COLORS.UI.BUTTON_BG,
    MENU_BUTTON_BORDER: COLORS.UI.BUTTON_BORDER,
    MENU_BUTTON_HOVER_BORDER: COLORS.UI.BUTTON_BORDER_HOVER,
    MENU_BG_GRADIENT_TOP: COLORS.UI.MENU_BG_TOP,
    MENU_BG_GRADIENT_BOTTOM: COLORS.UI.MENU_BG_BOTTOM,
    
    // 技能图标UI
    SKILL_ICON_BG: 'rgba(0, 0, 0, 0.7)',
    SKILL_ICON_RING_BG: 'rgba(0, 0, 0, 0.5)',
    SKILL_ICON_RING_FG: 'rgba(255, 255, 255, 0.8)',
    SKILL_ICON_READY_GLOW: 'rgba(0, 255, 100, 0.7)',
    
    // 遮罩
    OVERLAY: COLORS.UI.OVERLAY,
    
    // 生命值
    HEALTH_FULL: COLORS.UI.HEALTH_FULL,
    HEALTH_EMPTY: COLORS.UI.HEALTH_EMPTY
};

// ==================== 主菜单动画配置 ====================
const MENU_ANIMATION = {
    // 背景粒子
    PARTICLES: {
        COUNT_MIN: 25,
        COUNT_MAX: 35,
        SIZE_MIN: 2,
        SIZE_MAX: 5,
        SPEED_MIN: 0.3,
        SPEED_MAX: 0.8,
        COLORS: ['#ff6600', '#ffcc00'],
        SWAY_SPEED: 0.02,
        SWAY_AMOUNT: 0.5
    },
    
    // 浮动武器图标
    FLOATING_WEAPONS: {
        COUNT: 8,
        SIZE_MIN: 20,
        SIZE_MAX: 36,
        WEAPON_ICONS: ['🔫', '⚡', '💣', '🔥', '⭐', '❄️', '🎯', '🚀'],
        FLOAT_SPEED: 0.015,
        FLOAT_AMOUNT: 15,
        ROTATE_SPEED: 0.01,
        ALPHA: 0.6
    },
    
    // 打字机效果
    TYPEWRITER: {
        TEXT: '像素地牢',
        CHAR_INTERVAL: 150,
        CURSOR_BLINK_SPEED: 500,
        CURSOR_CHAR: '_'
    },
    
    // 地牢滚动背景
    DUNGEON_SCROLL: {
        TILE_SIZE: 40,
        SPEED: 0.3,
        ALPHA: 0.15
    },
    
    // 按钮悬停效果
    BUTTON_HOVER: {
        SCALE: 1.05,
        TRANSITION_TIME: 200,
        GLOW_SIZE: 15,
        GLOW_COLOR: '#ff6600'
    }
};

// ==================== 技能图标映射 ====================
const SKILL_ICONS = {
    '冲刺': '💨',
    '闪电链': '⚡',
    '地雷': '💣',
    '护盾': '🛡️',
    '治疗': '💚',
    '炮台': '🔫',
    '瞬移': '✨',
    '狂暴': '💢',
    '剑刃风暴': '🌀',
    '幻影': '👻',
    '暗影突袭': '🗡️',
    '流星火雨': '☄️',
    '冰封': '❄️',
    '雷霆': '⚡',
    '预知': '👁️',
    '复活': '💫',
    '野性呼唤': '🐺',
    '精准射击': '🎯',
    '自我修复': '🔧',
    '定点爆破': '💥',
    '骷髅大军': '💀',
    '召唤飞龙': '🐉',
    '荆棘陷阱': '🌵',
    '药水炸弹': '🧪',
    '惊喜礼盒': '🎁',
    '元素融合': '🔮'
};

// ==================== 技能前摇配置 ====================
const SKILL_CAST = {
    DEFAULT_CAST_TIME: 200,      // 默认前摇时间（毫秒）
    DEFAULT_CAN_INTERRUPT: true, // 默认是否可打断
    EFFECT_INTERVAL: 50          // 前摇特效间隔
};

// ==================== 主动技能冷却时间（毫秒） ====================
const SKILL_COOLDOWN = {
    SHIELD: 8000, BERSERK: 10000, BLADE_STORM: 12000,
    BLINK: 5000, PHANTOM: 15000, SHADOW_STRIKE: 8000,
    METEOR: 15000, FREEZE_SKILL: 10000, THUNDER: 12000,
    HEAL: 5000, FORESIGHT: 20000, RESURRECTION: 60000,
    LANDMINE: 8000, SUMMON_PET: 20000, PRECISION_SHOT: 10000,
    TURRET: 15000, SELF_REPAIR: 30000, DEMOLITION: 12000,
    ARMY_OF_DEAD: 30000, SUMMON_DRAGON: 25000, THORN_TRAP: 3000,
    POTION_BOMB: 8000, SURPRISE_BOX: 15000, ELEMENTAL_FUSION: 20000
};

// ==================== 主动技能怒气消耗 ====================
const SKILL_RAGE_COST = {
    SHIELD: 30, BERSERK: 50, BLADE_STORM: 60,
    BLINK: 20, PHANTOM: 40, SHADOW_STRIKE: 35,
    METEOR: 70, FREEZE_SKILL: 40, THUNDER: 50,
    HEAL: 25, FORESIGHT: 45, RESURRECTION: 80,
    LANDMINE: 30, SUMMON_PET: 60, PRECISION_SHOT: 45,
    TURRET: 50, SELF_REPAIR: 35, DEMOLITION: 55,
    ARMY_OF_DEAD: 80, SUMMON_DRAGON: 75, THORN_TRAP: 20,
    POTION_BOMB: 35, SURPRISE_BOX: 40, ELEMENTAL_FUSION: 85
};

// ==================== 主动技能效果参数 ====================
const SKILL_EFFECT = {
    SHIELD_DURATION: 5000, SHIELD_HEALTH: 2,
    BERSERK_DURATION: 5000, BERSERK_DAMAGE_MULT: 1.8, BERSERK_SPEED_MULT: 1.4,
    BLADE_STORM_DURATION: 2000, BLADE_STORM_DAMAGE: 1, BLADE_STORM_HIT_INTERVAL: 200, BLADE_STORM_RADIUS: 60,
    BLINK_DISTANCE: 150,
    PHANTOM_DURATION: 4000, PHANTOM_COUNT: 3,
    SHADOW_STRIKE_DISTANCE: 100, SHADOW_STRIKE_DAMAGE: 3, SHADOW_STRIKE_SPEED: 3,
    METEOR_COUNT: 5, METEOR_DAMAGE: 2, METEOR_RADIUS: 40, METEOR_DELAY: 100,
    FREEZE_RADIUS: 80, FREEZE_DURATION: 2000, FREEZE_SLOW_FACTOR: 0.4,
    THUNDER_CHAIN_COUNT: 4, THUNDER_DAMAGE: 2, THUNDER_CHAIN_RADIUS: 150,
    HEAL_AMOUNT: 1,
    FORESIGHT_DURATION: 5000,
    LANDMINE_DAMAGE: 3, LANDMINE_RADIUS: 60,
    PET_DURATION: 10000, PET_DAMAGE: 1,
    PRECISION_SHOT_DAMAGE: 5, PRECISION_SHOT_RANGE: 500, PRECISION_SHOT_CRIT_MULT: 3,
    TURRET_DURATION: 15000, TURRET_DAMAGE: 1, TURRET_RANGE: 120,
    SELF_REPAIR_RATE: 0.2, SELF_REPAIR_DURATION: 10000,
    DEMOLITION_DELAY: 2000, DEMOLITION_DAMAGE: 4, DEMOLITION_RADIUS: 80,
    SKELETON_COUNT: 4, SKELETON_DAMAGE: 1, SKELETON_DURATION: 15000,
    DRAGON_DURATION: 15000, DRAGON_DAMAGE: 2,
    THORN_DAMAGE: 1, THORN_COOLDOWN: 2000,
    POTION_BOMB_DAMAGE: 3, POTION_BOMB_RADIUS: 50, POTION_POISON_DURATION: 3000, POTION_POISON_DAMAGE: 0.5,
    ELEMENTAL_FUSION_DAMAGE: 5, ELEMENTAL_FUSION_RADIUS: 150
};

// ==================== 房间类型配置 ====================
const ROOM_TYPES = {
    BATTLE: 'battle',           // 普通战斗房
    CHEST: 'chest',             // 宝箱房
    SHOP: 'shop',               // 商店房
    TRAP: 'trap',               // 陷阱房
    ELITE: 'elite',             // 精英房
    REST: 'rest',               // 休息房
    BOSS: 'boss'                // Boss房
};

// 房间出现概率配置
const ROOM_SPAWN_CONFIG = {
    BATTLE: 0.50,
    CHEST: 0.10,
    SHOP: 0.10,
    TRAP: 0.10,
    ELITE: 0.10,
    REST: 0.10,
    BOSS: 0.10
};

// 路线选择配置（分支房间，每局每种出现一次）
const ROUTE_SELECT_CONFIG = {
    OPTIONS: ['elite', 'shop', 'rest'],
    OPTION_COUNT: 3,
    PORTAL_DELAY: 2000
};

// 关卡房间布局配置
const LEVEL_LAYOUT = {
    TOTAL_ROOMS: 6,             // 总房间数（不含Boss）
    BRANCH_ROOMS: [1, 3]        // 有分支的房间索引
};

// ==================== 陷阱系统配置 ====================
const TRAP_TYPES = {
    SPIKE: 'spike',             // 地刺
    FIRE: 'fire',               // 火焰
    POISON: 'poison',           // 毒雾
    ICE: 'ice',                 // 冰冻
    ROCK: 'rock',               // 落石
    TELEPORT: 'teleport'        // 传送
};

const TRAPS = {
    SPIKE: { TYPE: TRAP_TYPES.SPIKE, NAME: '地刺', DAMAGE: 1, COOLDOWN: 2000, ACTIVE_DURATION: 500, SIZE: 32, COLOR: '#808080', SPIKE_COLOR: '#c0c0c0', VISIBLE: true },
    FIRE: { TYPE: TRAP_TYPES.FIRE, NAME: '火焰', DAMAGE: 1, COOLDOWN: 3000, ACTIVE_DURATION: 1000, SIZE: 32, COLOR: '#8b4513', FIRE_COLOR: '#ff4500', VISIBLE: true },
    POISON: { TYPE: TRAP_TYPES.POISON, NAME: '毒雾', DAMAGE: 0.5, COOLDOWN: 500, ACTIVE_DURATION: 4000, SIZE: 48, COLOR: '#228b22', POISON_COLOR: 'rgba(50, 205, 50, 0.4)', VISIBLE: true },
    ICE: { TYPE: TRAP_TYPES.ICE, NAME: '冰冻', DAMAGE: 0, COOLDOWN: 5000, ACTIVE_DURATION: 2000, SLOW_FACTOR: 0.5, SLOW_DURATION: 3000, SIZE: 40, COLOR: '#4169e1', ICE_COLOR: '#87ceeb', VISIBLE: true },
    ROCK: { TYPE: TRAP_TYPES.ROCK, NAME: '落石', DAMAGE: 2, COOLDOWN: 4000, WARNING_DURATION: 1000, ACTIVE_DURATION: 300, SIZE: 36, COLOR: '#696969', WARNING_COLOR: 'rgba(255, 0, 0, 0.3)', VISIBLE: false },
    TELEPORT: { TYPE: TRAP_TYPES.TELEPORT, NAME: '传送', DAMAGE: 0, COOLDOWN: 8000, ACTIVE_DURATION: 500, SIZE: 36, COLOR: '#9932cc', TELEPORT_COLOR: '#da70d6', VISIBLE: true }
};

// 陷阱房配置
const TRAP_ROOM_CONFIG = {
    TRAP_COUNT_MIN: 5,
    TRAP_COUNT_MAX: 10,
    REWARD_CHESTS: 1            // 通过后的奖励宝箱数
};

// ==================== 宝箱系统配置 ====================
const CHEST_TYPES = {
    NORMAL: 'normal',           // 普通宝箱
    GOLDEN: 'golden',           // 金宝箱
    GEM: 'gem',                 // 宝石宝箱
    LEGENDARY: 'legendary',     // 传说宝箱
    MIMIC: 'mimic'              // mimic宝箱
};

const CHESTS = {
    NORMAL: {
        TYPE: CHEST_TYPES.NORMAL,
        NAME: '普通宝箱',
        RARITY: '普通',
        GOLD_MIN: 5,
        GOLD_MAX: 15,
        ITEM_COUNT: 1,
        COLOR: '#8b4513',
        LID_COLOR: '#a0522d',
        METAL_COLOR: '#daa520',
        GLOW_COLOR: 'rgba(255, 215, 0, 0.3)',
        SIZE: 32
    },
    GOLDEN: {
        TYPE: CHEST_TYPES.GOLDEN,
        NAME: '金宝箱',
        RARITY: '稀有',
        GOLD_MIN: 20,
        GOLD_MAX: 40,
        ITEM_COUNT: 2,
        HAS_WEAPON: true,
        COLOR: '#ffd700',
        LID_COLOR: '#ffec8b',
        METAL_COLOR: '#ff8c00',
        GLOW_COLOR: 'rgba(255, 215, 0, 0.5)',
        SIZE: 36
    },
    GEM: {
        TYPE: CHEST_TYPES.GEM,
        NAME: '宝石宝箱',
        RARITY: '史诗',
        GEM_COUNT: 1,
        ITEM_COUNT: 2,
        COLOR: '#9932cc',
        LID_COLOR: '#ba55d3',
        METAL_COLOR: '#da70d6',
        GLOW_COLOR: 'rgba(153, 50, 204, 0.5)',
        SIZE: 36
    },
    LEGENDARY: {
        TYPE: CHEST_TYPES.LEGENDARY,
        NAME: '传说宝箱',
        RARITY: '传说',
        HAS_LEGENDARY_WEAPON: true,
        HAS_RELIC: true,
        ITEM_COUNT: 3,
        COLOR: '#ff6347',
        LID_COLOR: '#ff7f50',
        METAL_COLOR: '#ffd700',
        GLOW_COLOR: 'rgba(255, 99, 71, 0.6)',
        RAINBOW_GLOW: true,
        SIZE: 40
    },
    MIMIC: {
        TYPE: CHEST_TYPES.MIMIC,
        NAME: 'Mimic宝箱',
        RARITY: '陷阱',
        HEALTH: 6,
        DAMAGE: 2,
        SPEED: 2,
        COLOR: '#8b4513',
        LID_COLOR: '#a0522d',
        EYE_COLOR: '#ff0000',
        SIZE: 34
    }
};

// 宝箱房配置
const CHEST_ROOM_CONFIG = {
    CHEST_COUNT_MIN: 1,
    CHEST_COUNT_MAX: 2,
    MIMIC_CHANCE: 0.2           // mimic出现概率
};

// ==================== 新敌人配置 ====================
const NEW_ENEMIES = {
    SKELETON: { TYPE: 'skeleton', NAME: '骷髅兵', SIZE: 18, HEALTH: 3, SPEED: 1.8, DAMAGE: 1, DROP_RATE: 0.35, ATTACK_RANGE: 35, ATTACK_COOLDOWN: 1200, COLOR: '#d3d3d3', BONE_COLOR: '#f5f5dc', SHIELD_COLOR: '#8b4513', AI: 'tank', SHIELD_DAMAGE_REDUCTION: 0.5 },
    ARCHER: { TYPE: 'archer', NAME: '弓箭手', SIZE: 16, HEALTH: 2, SPEED: 2.2, DAMAGE: 1, DROP_RATE: 0.3, ATTACK_RANGE: 200, ATTACK_COOLDOWN: 1500, BULLET_SPEED: 6, COLOR: '#228b22', BOW_COLOR: '#8b4513', ARROW_COLOR: '#8b4513', AI: 'ranger', KEEP_DISTANCE: 150 },
    MAGE: { TYPE: 'mage', NAME: '法师', SIZE: 18, HEALTH: 3, SPEED: 1.5, DAMAGE: 2, DROP_RATE: 0.4, ATTACK_RANGE: 250, ATTACK_COOLDOWN: 2000, BULLET_SPEED: 5, COLOR: '#4b0082', ROBE_COLOR: '#6a5acd', MAGIC_COLOR: '#9400d3', AI: 'caster', KEEP_DISTANCE: 180 },
    BOMBER: { TYPE: 'bomber', NAME: '炸弹怪', SIZE: 18, HEALTH: 2, SPEED: 2.5, DAMAGE: 3, DROP_RATE: 0.35, ATTACK_RANGE: 40, ATTACK_COOLDOWN: 0, EXPLOSION_RADIUS: 50, COLOR: '#ff4500', BOMB_COLOR: '#333333', FUSE_COLOR: '#ffff00', AI: 'suicide' },
    ELITE: { TYPE: 'elite', NAME: '精英怪', SIZE: 28, HEALTH: 8, SPEED: 1.5, DAMAGE: 2, DROP_RATE: 1.0, ATTACK_RANGE: 40, ATTACK_COOLDOWN: 1000, COLOR: '#ff0000', ARMOR_COLOR: '#8b0000', EYE_COLOR: '#ffff00', AI: 'berserker', DROP_QUALITY_BOOST: true }
};

// 精英房配置
const ELITE_ROOM_CONFIG = {
    ELITE_COUNT: 1,
    MINION_COUNT: 2,
    REWARD_CHEST_TYPE: CHEST_TYPES.GOLDEN,
    
    ELITE_STATS_MULTIPLIER: {
        health: 1.5,
        damage: 1.2,
        speed: 1.1
    },
    
    MINION_TYPES: ['slime', 'bat', 'skeleton'],
    
    REWARD_CONFIG: {
        guaranteedDrop: true,
        dropQuality: 'elite',
        goldMultiplier: 2.0,
        relicDropChance: 0.5
    }
};

// ==================== 新Boss配置 - 骷髅王 ====================
const SKELETON_KING = {
    NAME: '骷髅王', SIZE: 48, HEALTH: 30, SPEED: 1.2, DAMAGE: 2,
    COLOR: '#f5f5dc', ARMOR_COLOR: '#8b0000', CROWN_COLOR: '#ffd700', EYE_COLOR: '#00ff00',
    PHASE1: { NAME: '第一阶段', HEALTH_THRESHOLD: 0.66, ATTACK_COOLDOWN: 2000, SUMMON_INTERVAL: 8000, SUMMON_COUNT: 2, ATTACK_RANGE: 60, SWING_DAMAGE: 2 },
    PHASE2: { NAME: '第二阶段', HEALTH_THRESHOLD: 0.33, ATTACK_COOLDOWN: 1500, BONE_SPEAR_SPEED: 6, BONE_SPEAR_DAMAGE: 2, SUMMON_INTERVAL: 6000, SUMMON_COUNT: 3, SPEED_MULTIPLIER: 1.2 },
    PHASE3: { NAME: '第三阶段', HEALTH_THRESHOLD: 0, ATTACK_COOLDOWN: 1000, DEATH_RAIN_INTERVAL: 5000, DEATH_RAIN_COUNT: 8, DEATH_RAIN_DAMAGE: 1, DEATH_RAIN_WARNING: 800, SPEED_MULTIPLIER: 1.5, DAMAGE_MULTIPLIER: 1.5, SUMMON_INTERVAL: 5000, SUMMON_COUNT: 4 }
};

// 可选Boss配置
const OPTIONAL_BOSS_CONFIG = {
    UNLOCKED_AFTER_BOSS: true,   // 击败普通Boss后解锁
    REWARD_CHEST_TYPE: CHEST_TYPES.LEGENDARY
};

// ==================== 休息房配置 ====================
const REST_ROOM_CONFIG = {
    FOUNTAIN_HEAL_AMOUNT: 2,     // 回血喷泉恢复量
    FOUNTAIN_COLOR: '#00bfff',
    FOUNTAIN_SIZE: 40
};

// ==================== 商店房配置 ====================
const SHOP_ROOM_CONFIG = {
    ITEM_COUNT: 3,
    PRICE_MULTIPLIER: 1.0
};

// ==================== 金币系统配置 ====================
const GOLD = {
    DROP_CHANCE: 0.5,
    DROP_MIN: 1,
    DROP_MAX: 5,
    SIZE: 12,
    COLOR: '#ffd700'
};

// ==================== 辅助瞄准系统配置 ====================
const AIM_ASSIST = {
    // 辅助瞄准总开关
    ENABLED: true,
    
    // 辅助强度档位：low(低), medium(中), high(高)
    STRENGTH_LEVELS: {
        OFF: 0,
        LOW: 0.2,
        MEDIUM: 0.4,
        HIGH: 0.6
    },
    DEFAULT_STRENGTH: 'low',
    
    // 吸附范围（像素）
    ASSIST_RANGE: 150,
    
    // 吸附角度范围（弧度）
    ASSIST_ANGLE: Math.PI / 12,  // 15度
    
    // 轻度吸附（准星靠近敌人时轻微吸附）
    SNAP_STRENGTH: 0.15,
    
    // 弹道修正（子弹略微向最近敌人弯曲）
    BULLET_CURVE_STRENGTH: 0.15,
    
    // 自动瞄准选项
    AUTO_AIM: false,
    
    // 各武器独立瞄准参数配置
    WEAPON_SETTINGS: {
        PISTOL: {
            assistRange: 150,
            assistAngle: Math.PI / 6,
            snapStrength: 0.4,
            bulletCurveStrength: 0.1
        },
        LIGHTNING: {
            assistRange: 250,
            assistAngle: Math.PI / 4,
            snapStrength: 0.2,
            bulletCurveStrength: 0
        },
        GRENADE: {
            assistRange: 100,
            assistAngle: Math.PI / 4,
            snapStrength: 0.2,
            bulletCurveStrength: 0.6
        },
        FLAME: {
            assistRange: 100,
            assistAngle: Math.PI / 4,
            snapStrength: 0.6,
            bulletCurveStrength: 0.3
        },
        BOOMERANG: {
            assistRange: 150,
            assistAngle: Math.PI / 6,
            snapStrength: 0.4,
            bulletCurveStrength: 0.1
        },
        FREEZE: {
            assistRange: 150,
            assistAngle: Math.PI / 4,
            snapStrength: 0.6,
            bulletCurveStrength: 0.3
        },
        SHOTGUN: {
            assistRange: 80,
            assistAngle: Math.PI / 3,
            snapStrength: 0.15,
            bulletCurveStrength: 0
        },
        HOMING: {
            assistRange: 300,
            assistAngle: Math.PI / 3,
            snapStrength: 0.7,
            bulletCurveStrength: 0.8
        }
    }
};

// ==================== 输入缓冲配置 ====================
const INPUT_BUFFER = {
    // 输入缓冲是否启用
    ENABLED: true,
    
    // 各操作缓冲时间（毫秒）
    DASH: 100,           // 冲刺/技能
    SHOOT: 80,           // 射击
    SKILL: 100,          // 技能
    WEAPON_SWITCH: 50,   // 武器切换
    INTERACT: 100        // 互动
};

// ==================== 手柄控制器配置 ====================
const GAMEPAD = {
    // 是否启用手柄支持
    ENABLED: true,
    
    // 摇杆死区（0-1）
    DEAD_ZONE_LEFT: 0.15,
    DEAD_ZONE_RIGHT: 0.15,
    
    // 摇杆灵敏度
    SENSITIVITY_LEFT: 1.0,
    SENSITIVITY_RIGHT: 1.0,
    
    // 扳机阈值（0-1）
    TRIGGER_THRESHOLD: 0.5,
    
    // 震动强度
    VIBRATION_INTENSITY: 0.5,
    
    // 按键映射（标准游戏手柄）
    BUTTONS: {
        A: 0,           // A键 - 冲刺技能
        B: 1,           // B键 - 技能2
        X: 2,           // X键 - 技能3
        Y: 3,           // Y键 - 互动/拾取
        LB: 4,          // LB键 - 切换武器（上一个）
        RB: 5,          // RB键 - 切换武器（下一个）
        LT: 6,          // LT键 - 瞄准（辅助瞄准加强）
        RT: 7,          // RT键 - 射击
        BACK: 8,        // 选择键 - 地图/背包
        START: 9,       // 开始键 - 暂停
        LEFT_STICK: 10, // 左摇杆按下
        RIGHT_STICK: 11 // 右摇杆按下
    },
    
    // 轴映射
    AXES: {
        LEFT_X: 0,      // 左摇杆X轴
        LEFT_Y: 1,      // 左摇杆Y轴
        RIGHT_X: 2,     // 右摇杆X轴
        RIGHT_Y: 3      // 右摇杆Y轴
    },
    
    // 震动类型
    VIBRATION: {
        SHOOT: { duration: 50, intensity: 0.2 },
        HURT: { duration: 200, intensity: 0.5 },
        PICKUP: { duration: 100, intensity: 0.3 },
        EXPLOSION: { duration: 300, intensity: 0.6 }
    }
};

// ==================== 鼠标配置 ====================
const MOUSE = {
    // 鼠标灵敏度（百分比）
    SENSITIVITY: 1.0,
    
    // 鼠标平滑
    SMOOTHING: false,
    SMOOTHING_FACTOR: 0.5,
    
    // 准星样式
    CROSSHAIR_STYLE: 'default',  // default, dot, cross, circle
    
    // 准星大小
    CROSSHAIR_SIZE: 16,
    
    // 准星颜色
    CROSSHAIR_COLOR: '#ffffff'
};

// ==================== 设置系统默认值 ====================
const DEFAULT_SETTINGS = {
    // 画面设置
    graphics: {
        fullscreen: false,
        quality: 'high',           // high, medium, low
        screenShake: true,
        particleCount: 'high'      // high, medium, low
    },
    
    // 音效设置
    audio: {
        masterVolume: 0.8,
        sfxVolume: 1.0,
        musicVolume: 0.7
    },
    
    // 操作设置
    controls: {
        aimAssist: 'medium',       // off, low, medium, high
        mouseSensitivity: 1.0,
        gamepadSensitivity: 1.0,
        gamepadDeadZone: 0.15,
        keyBindings: 'default'
    },
    
    // 游戏设置
    gameplay: {
        difficulty: 'normal',      // easy, normal, hard
        autoPickup: true,
        damageFlash: true
    }
};

// ==================== 射击反馈配置 ====================
const SHOOT_FEEDBACK = {
    // 射击屏幕震动
    SCREEN_SHAKE: {
        PISTOL: { intensity: 1, duration: 50 },
        LIGHTNING: { intensity: 1.5, duration: 80 },
        GRENADE: { intensity: 3, duration: 150 },
        FLAME: { intensity: 0.5, duration: 30 },
        BOOMERANG: { intensity: 1.5, duration: 80 },
        FREEZE: { intensity: 1, duration: 60 },
        SHOTGUN: { intensity: 2.5, duration: 120 },
        HOMING: { intensity: 2, duration: 100 }
    },
    
    // 子弹发射延迟（与后坐力匹配，毫秒）
    FIRE_DELAY: {
        PISTOL: 0,
        LIGHTNING: 10,
        GRENADE: 30,
        FLAME: 0,
        BOOMERANG: 20,
        FREEZE: 10,
        SHOTGUN: 40,
        HOMING: 50
    },
    
    // 连发稳定性（0-1，越高越稳）
    RECOIL_STABILITY: 0.7
};

// ==================== 画质设置 ====================
const QUALITY_SETTINGS = {
    DEFAULT: 'high',
    LOW: 'low',
    MEDIUM: 'medium',
    HIGH: 'high'
};

const GRAPHICS_QUALITY = {
    // 画质等级
    LEVEL: {
        LOW: 'low',
        MEDIUM: 'medium',
        HIGH: 'high'
    },
    current: 'high',
    PARTICLE_LIMITS: {
        low: 50,
        medium: 100,
        high: 200
    },
    AMBIENT_PARTICLE_COUNTS: {
        low: 10,
        medium: 20,
        high: 35
    },
    SCREEN_EFFECTS: {
        low: false,
        medium: true,
        high: true
    },
    DYNAMIC_LIGHTING: {
        low: false,
        medium: true,
        high: true
    }
};

// ==================== 新增粒子效果配置 ====================
const PARTICLE_EFFECTS = {
    HEAL_AURA: {
        ringCount: 3,
        ringColors: ['#4caf50', '#8bc34a', '#cddc39'],
        expandSpeed: 0.8,
        ringLifetime: 800,
        particleCount: 15,
        particleColor: '#4caf50',
        particleSizeMin: 2,
        particleSizeMax: 4,
        particleLifetime: 600
    },
    SHIELD_BREAK: {
        fragmentCount: 20,
        colors: ['#2196f3', '#03a9f4', '#00bcd4'],
        sizeMin: 3,
        sizeMax: 6,
        speedMin: 2,
        speedMax: 5,
        lifetime: 600,
        gravity: 0.1
    },
    CRIT_BURST: {
        starCount: 8,
        starColor: '#ffd700',
        starSize: 6,
        particleCount: 15,
        particleColors: ['#ffff00', '#ffd700', '#ffffff'],
        speedMin: 3,
        speedMax: 6,
        lifetime: 500,
        ringColor: 'rgba(255, 215, 0, 0.6)',
        ringExpandSpeed: 2
    },
    KILL_ABSORB: {
        particleCount: 8,
        color: '#9c27b0',
        sizeMin: 2,
        sizeMax: 4,
        speed: 3,
        lifetime: 400,
        attractSpeed: 0.2
    },
    RAGE_BURST: {
        flameCount: 20,
        colors: ['#f44336', '#ff5722', '#ff9800', '#ffeb3b'],
        sizeMin: 3,
        sizeMax: 6,
        speedMin: 2,
        speedMax: 5,
        lifetime: 800,
        ringCount: 3,
        ringColor: '#ff5722',
        ringExpandSpeed: 1.5
    },
    PORTAL_VORTEX: {
        particleCount: 12,
        color: '#9c27b0',
        sizeMin: 3,
        sizeMax: 5,
        rotationSpeed: 0.05,
        orbitRadius: 20,
        lifetime: 1000
    },
    CHEST_GLOW: {
        beamCount: 8,
        beamColor: 'rgba(255, 215, 0, 0.6)',
        particleCount: 20,
        particleColor: '#ffd700',
        sizeMin: 2,
        sizeMax: 4,
        speedMin: 1,
        speedMax: 3,
        lifetime: 1000
    },
    GROUND_CRACK: {
        crackCount: 6,
        crackLength: 30,
        crackWidth: 3,
        color: '#3e2723',
        particleCount: 15,
        particleColor: '#795548',
        lifetime: 1500,
        shakeIntensity: 5
    },
    ELEMENTAL_ATTACH: {
        FIRE: {
            particleCount: 5,
            color: '#ff5722',
            sizeMin: 2,
            sizeMax: 3,
            emitInterval: 100,
            gravity: -0.05
        },
        ICE: {
            particleCount: 4,
            color: '#00bcd4',
            sizeMin: 2,
            sizeMax: 3,
            emitInterval: 150,
            gravity: 0.02
        },
        POISON: {
            particleCount: 4,
            color: '#8bc34a',
            sizeMin: 2,
            sizeMax: 3,
            emitInterval: 120,
            gravity: -0.02
        }
    },
    AFTERIMAGE: {
        trailCount: 5,
        alphaStart: 0.6,
        alphaEnd: 0,
        interval: 50,
        sizeScale: 0.95
    },
    WEAPON_SWITCH: {
        particleCount: 12,
        colors: ['#ffd54f', '#ffffff', '#ff9800', '#ffeb3b'],
        sizeMin: 3,
        sizeMax: 6,
        speedMin: 2,
        speedMax: 5,
        lifetime: 400,
        spreadAngle: Math.PI,
        ringCount: 2,
        ringColor: 'rgba(255, 215, 0, 0.5)',
        ringExpandSpeed: 1.2,
        ringLifetime: 300
    }
};

// ==================== 屏幕效果配置 ====================
const SCREEN_EFFECTS = {
    HURT_VIGNETTE: {
        color: 'rgba(255, 0, 0, 0.3)',
        duration: 300,
        intensity: 0.5
    },
    LOW_HEALTH_BLUR: {
        threshold: 0.3,
        blurAmount: 3
    },
    RAGE_PULSE: {
        color: 'rgba(255, 100, 0, 0.15)',
        pulseSpeed: 0.003,
        maxIntensity: 0.3
    },
    SHIELD_EDGE: {
        color: 'rgba(0, 150, 255, 0.2)',
        thickness: 20
    },
    CRIT_FLASH: {
        color: 'rgba(255, 255, 255, 0.3)',
        duration: 100
    },
    SLOW_MOTION_TINT: {
        color: 'rgba(100, 150, 255, 0.15)'
    }
};

// ==================== 镜头效果配置 ====================
const CAMERA_EFFECTS = {
    KILL_SHAKE: {
        intensity: 2,
        duration: 100
    },
    BOSS_ATTACK_SHAKE: {
        intensity: 8,
        duration: 500
    },
    EXPLOSION_ZOOM: {
        zoomAmount: 1.1,
        duration: 200
    },
    LEGENDARY_ZOOM: {
        zoomAmount: 1.2,
        duration: 500
    }
};

// ==================== 场景动态元素配置 ====================
const SCENE_DYNAMICS = {
    TORCH: {
        flickerIntensity: 0.2,
        flickerSpeed: 0.1,
        particleEmitRate: 200,
        particleCount: 2
    },
    SHADOW: {
        swayAmount: 2,
        swaySpeed: 0.02
    },
    DUST: {
        count: 30,
        speedMin: 0.1,
        speedMax: 0.3,
        sizeMin: 1,
        sizeMax: 2,
        alpha: 0.3
    },
    COBWEB: {
        swayAmount: 3,
        swaySpeed: 0.015
    },
    CHAIN: {
        swingAmount: 5,
        swingSpeed: 0.02
    },
    FLAG: {
        waveAmount: 4,
        waveSpeed: 0.03
    },
    WATER_DROP: {
        interval: 2000,
        speed: 2,
        size: 2,
        color: '#64b5f6'
    },
    GROUND_FOG: {
        density: 0.15,
        color: 'rgba(100, 100, 150, 0.1)',
        scrollSpeed: 0.1
    }
};

// ==================== 房间灯光变化配置 ====================
const ROOM_LIGHTING = {
    ENTRY_FADE: {
        duration: 1000,
        startOpacity: 0.8,
        endOpacity: 0
    },
    CLEARED_BRIGHTNESS: {
        increase: 0.1,
        transitionDuration: 500
    },
    BOSS_ROOM: {
        ambientColor: 'rgba(50, 0, 0, 0.5)',
        flickerIntensity: 0.1
    },
    REST_ROOM: {
        ambientColor: 'rgba(255, 200, 100, 0.1)'
    }
};

// ==================== UI动效配置 ====================
const UI_ANIMATIONS = {
    BUTTON_HOVER: {
        scale: 1.05,
        glowSize: 15,
        transitionTime: 200
    },
    BUTTON_CLICK: {
        scale: 0.95,
        duration: 100
    },
    PAGE_TRANSITION: {
        duration: 300,
        fadeIn: true,
        slideOffset: 20
    },
    POPUP_APPEAR: {
        scaleStart: 0.8,
        scaleEnd: 1,
        duration: 300,
        bounce: true
    },
    ITEM_PICKUP_TEXT: {
        riseAmount: 30,
        duration: 1000,
        scale: 1.2
    },
    DAMAGE_NUMBER: {
        bounceHeight: 20,
        duration: 800,
        critScale: 1.5
    },
    ACHIEVEMENT_BANNER: {
        slideInDuration: 500,
        stayDuration: 2000,
        slideOutDuration: 500
    },
    COIN_FLOAT: {
        riseAmount: 40,
        duration: 1000,
        rotation: 10
    },
    ROOM_TRANSITION: {
        fadeOutDuration: 300,
        fadeInDuration: 300,
        color: '#000000'
    },
    DEATH_FADE: {
        duration: 1000,
        targetAlpha: 0.8
    },
    VICTORY_GLOW: {
        color: 'rgba(255, 215, 0, 0.3)',
        pulseSpeed: 0.002,
        maxIntensity: 0.5
    },
    PAUSE_BLUR: {
        blurAmount: 5,
        fadeDuration: 300
    }
};

// ==================== 角色动画增强配置 ====================
const CHARACTER_ANIMATIONS = {
    IDLE_BREATH: {
        amount: 0.5,
        speed: 0.003
    },
    WALK_LEG_SWING: {
        angle: 0.3,
        speed: 0.15
    },
    FLOAT: {
        amount: 2,
        speed: 0.002
    },
    HURT_TILT: {
        angle: 0.2,
        duration: 200,
        recoveryTime: 300
    },
    ATTACK_HAND: {
        recoilDistance: 3,
        recoveryTime: 100
    },
    SKILL_CAST: {
        leanBack: 5,
        duration: 300
    }
};

// ==================== 武器动画配置 ====================
const WEAPON_ANIMATIONS = {
    RECOIL: {
        distance: 4,
        rotation: 0.1,
        recoveryTime: 80
    },
    SWITCH: {
        duration: 200,
        rotateAngle: Math.PI / 2
    },
    SPIN: {
        speed: 0.05
    },
    GLOW: {
        color: '#ffd700',
        intensity: 0.3,
        pulseSpeed: 0.005
    }
};

// ==================== 敌人动画增强配置 ====================
const ENEMY_ANIMATIONS = {
    SLIME: {
        jumpStretch: 0.2,
        landSquash: 0.2,
        angryRed: '#ff5252',
        deathMeltDuration: 500
    },
    BAT: {
        wingSpeedFast: 0.03,
        wingSpeedSlow: 0.015,
        diveSpeedMultiplier: 2,
        hurtRotationSpeed: 0.2,
        deathFallSpeed: 3
    },
    GHOST: {
        alphaVariation: 0.2,
        alphaSpeed: 0.002,
        bottomWaveAmount: 4,
        bottomWaveSpeed: 0.005,
        attackExtend: 10,
        deathFadeDuration: 800
    }
};

// ==================== Boss特效增强配置 ====================
const BOSS_EFFECTS = {
    PHASE_TRANSITION: {
        screenShakeIntensity: 10,
        screenShakeDuration: 1000,
        roarDuration: 1000,
        energyBurstCount: 30,
        colorGradientDuration: 500
    },
    ATTACK_WARNING: {
        CIRCLE: {
            color: 'rgba(255, 0, 0, 0.5)',
            pulseSpeed: 0.01,
            lineWidth: 3
        },
        DASHED_LINE: {
            color: '#ff0000',
            dashLength: 10,
            gapLength: 5,
            blinkSpeed: 0.005
        },
        FLASH: {
            color: 'rgba(255, 0, 0, 0.2)',
            interval: 200
        }
    },
    DEATH: {
        slowMotionDuration: 500,
        slowMotionScale: 0.1,
        fragmentCount: 50,
        screenFlashColor: 'rgba(255, 255, 255, 0.8)',
        screenFlashDuration: 300,
        energyReleaseRingCount: 5
    }
};

// ==================== 粒子形状扩展 ====================
PARTICLES.KIND.HEART = 'heart';
PARTICLES.KIND.DIAMOND = 'diamond';
PARTICLES.KIND.LIGHTNING = 'lightning';

// ==================== 存档系统配置 ====================
const SAVE = {
    STORAGE_KEY: 'pixel_dungeon_save',
    SLOT_COUNT: 3,
    VERSION: '1.0.0',
    AUTO_SAVE_KEY: 'pixel_dungeon_auto_save'
};

// ==================== 设置系统配置 ====================
const SETTINGS = {
    STORAGE_KEY: 'pixel_dungeon_settings',
    DEFAULT: {
        graphics: {
            fullscreen: false,
            quality: 'medium',
            screenShake: true,
            particleCount: 'medium',
            screenFlash: true,
            bloodEffect: true
        },
        audio: {
            masterVolume: 70,
            sfxVolume: 80,
            musicVolume: 50,
            uiSound: true,
            ambientSound: true
        },
        controls: {
            aimAssist: 'off',
            mouseSensitivity: 100,
            gamepadSensitivity: 100,
            joystickDeadzone: 10,
            autoShoot: false,
            keyBindings: {}
        },
        game: {
            difficulty: 'normal',
            autoPickup: true,
            hurtRedBorder: true,
            tutorialEnabled: true,
            language: 'zh'
        }
    }
};

// ==================== 排行榜配置 ====================
const LEADERBOARD = {
    STORAGE_KEY: 'pixel_dungeon_leaderboard',
    MAX_ENTRIES: 10,
    TYPES: {
        SPEED: 'speed',
        KILLS: 'kills',
        COINS: 'coins',
        ENDLESS: 'endless',
        CHARACTERS: 'characters'
    }
};

// ==================== 音效系统扩展配置 ====================
const SOUND_EFFECTS = {
    PISTOL: 'pistol',
    SHOTGUN: 'shotgun',
    LASER: 'laser',
    EXPLOSION: 'explosion',
    HIT: 'hit',
    COIN: 'coin',
    PICKUP: 'pickup',
    HURT: 'hurt',
    DEATH: 'death',
    DASH: 'dash',
    SHIELD: 'shield',
    HEAL: 'heal',
    LEVELUP: 'levelup',
    CLICK: 'click',
    SWITCH: 'switch',
    CHEST: 'chest',
    PORTAL: 'portal',
    BOSS: 'boss',
    VICTORY: 'victory',
    DEFEAT: 'defeat'
};

// ==================== 成就系统配置 ====================
const ACHIEVEMENTS = {
    STORAGE_KEY: 'pixel_dungeon_achievements',
    CATEGORIES: {
        COMBAT: 'combat',
        COLLECTION: 'collection',
        EXPLORATION: 'exploration',
        SPECIAL: 'special'
    },
    LIST: [
        { id: 'first_blood', name: '初次击杀', description: '击杀第一个敌人', icon: '⚔️', category: 'combat', condition: { kills: 1 } },
        { id: 'kill_10', name: '小试牛刀', description: '累计击杀10个敌人', icon: '🗡️', category: 'combat', condition: { kills: 10 } },
        { id: 'kill_50', name: '杀戮者', description: '累计击杀50个敌人', icon: '💀', category: 'combat', condition: { kills: 50 } },
        { id: 'kill_100', name: '百人斩', description: '累计击杀100个敌人', icon: '☠️', category: 'combat', condition: { kills: 100 } },
        { id: 'first_victory', name: '初战告捷', description: '首次通关游戏', icon: '🏆', category: 'combat', condition: { victories: 1 } },
        { id: 'collect_weapon', name: '武器收藏家', description: '收集所有武器', icon: '🔫', category: 'collection', condition: { weaponsCollected: 8 } },
        { id: 'full_health', name: '满血通关', description: '满血状态下通关', icon: '❤️', category: 'special', condition: { fullHealthVictory: true } },
        { id: 'speed_run', name: '速通达人', description: '5分钟内通关', icon: '⚡', category: 'special', condition: { speedRun: 300 } },
        { id: 'all_characters', name: '角色大师', description: '使用所有角色通关', icon: '👥', category: 'collection', condition: { allCharactersVictory: true } },
        { id: 'no_damage', name: '无伤通关', description: '不受任何伤害通关', icon: '🛡️', category: 'special', condition: { noDamageVictory: true } }
    ]
};

// ==================== 新手引导配置 ====================
const TUTORIAL = {
    STORAGE_KEY: 'pixel_dungeon_tutorial_complete',
    STEPS: [
        {
            id: 'movement',
            title: '移动',
            description: '使用 WASD 或方向键移动角色',
            highlight: 'keys',
            completeCondition: 'moved'
        },
        {
            id: 'shooting',
            title: '射击',
            description: '移动鼠标瞄准，点击左键射击敌人',
            highlight: 'mouse',
            completeCondition: 'killedEnemy'
        },
        {
            id: 'skill',
            title: '技能',
            description: '按空格键使用冲刺技能',
            highlight: 'skill',
            completeCondition: 'usedSkill'
        },
        {
            id: 'pickup',
            title: '拾取',
            description: '走过掉落的道具即可自动拾取',
            highlight: 'item',
            completeCondition: 'pickedUp'
        },
        {
            id: 'portal',
            title: '传送门',
            description: '击杀所有敌人后，进入传送门前往下一关',
            highlight: 'portal',
            completeCondition: 'enteredPortal'
        }
    ]
};

// ==================== 道具类型 ====================
const ITEM_TYPE = {
    CONSUMABLE: 'consumable',
    MATERIAL: 'material',
    WEAPON: 'weapon',
    ACCESSORY: 'accessory',
    POTION: 'potion',
    RELIC: 'relic',
    KEY: 'key',
    SCROLL: 'scroll'
};

// ==================== 道具稀有度 ====================
const ITEM_RARITY = {
    COMMON: 'common',
    UNCOMMON: 'uncommon',
    RARE: 'rare',
    EPIC: 'epic',
    LEGENDARY: 'legendary'
};

// ==================== 稀有度颜色 ====================
const RARITY_COLORS = {
    common: '#ffffff',
    uncommon: '#1eff00',
    rare: '#0070dd',
    epic: '#a335ee',
    legendary: '#ff8000'
};

// ==================== 背包配置 ====================
const INVENTORY_CONFIG = {
    MAX_SLOTS: 8,
    DROP_ANIM_DURATION: 500,
    PICKUP_ANIM_DURATION: 300,
    PICKUP_RANGE: 40
};

// ==================== 商店配置 ====================
const SHOP_CONFIG = {
    SPAWN_CHANCE: 0.3,
    MIN_ITEMS: 3,
    MAX_ITEMS: 5,
    DISCOUNT_CHANCE: 0.2,
    DISCOUNT_RATE: 0.5,
    INTERACT_RANGE: 60
};

// ==================== 药水效果类型 ====================
const POTION_EFFECT = {
    HEAL: 'heal',
    FULL_HEAL: 'full_heal',
    RAGE: 'rage',
    SHIELD: 'shield',
    SPEED: 'speed',
    CRIT: 'crit',
    DAMAGE: 'damage',
    INVISIBLE: 'invisible',
    POISON: 'poison',
    REGEN: 'regen',
    RANDOM: 'random'
};

// ==================== 药水配置 ====================
const POTIONS = {
    HEALTH: {
        id: 'health_potion',
        name: '生命药水',
        icon: '❤️',
        rarity: 'common',
        description: '恢复1点生命值',
        effect: 'heal',
        value: 1,
        duration: 0,
        price: 30,
        gemPrice: 0
    },
    FULL_HEALTH: {
        id: 'full_health_potion',
        name: '大生命药水',
        icon: '💙',
        rarity: 'uncommon',
        description: '恢复全部生命值',
        effect: 'full_heal',
        value: 0,
        duration: 0,
        price: 80,
        gemPrice: 0
    },
    RAGE: {
        id: 'rage_potion',
        name: '能量药水',
        icon: '⚡',
        rarity: 'common',
        description: '怒气值+50',
        effect: 'rage',
        value: 50,
        duration: 0,
        price: 50,
        gemPrice: 0
    },
    SHIELD: {
        id: 'shield_potion',
        name: '护盾药水',
        icon: '🛡️',
        rarity: 'rare',
        description: '5秒无敌护盾',
        effect: 'shield',
        value: 0,
        duration: 5000,
        price: 0,
        gemPrice: 1
    },
    SPEED: {
        id: 'speed_potion',
        name: '加速药水',
        icon: '👟',
        rarity: 'uncommon',
        description: '10秒内移动速度+30%',
        effect: 'speed',
        value: 0.3,
        duration: 10000,
        price: 60,
        gemPrice: 0
    },
    CRIT: {
        id: 'crit_potion',
        name: '精准药水',
        icon: '🎯',
        rarity: 'uncommon',
        description: '10秒内暴击率+50%',
        effect: 'crit',
        value: 0.5,
        duration: 10000,
        price: 70,
        gemPrice: 0
    },
    DAMAGE: {
        id: 'damage_potion',
        name: '狂暴药水',
        icon: '💢',
        rarity: 'rare',
        description: '10秒内伤害+50%',
        effect: 'damage',
        value: 0.5,
        duration: 10000,
        price: 100,
        gemPrice: 1
    },
    INVISIBLE: {
        id: 'invisible_potion',
        name: '隐身药水',
        icon: '👻',
        rarity: 'epic',
        description: '8秒内敌人看不见你',
        effect: 'invisible',
        value: 0,
        duration: 8000,
        price: 0,
        gemPrice: 2
    },
    POISON: {
        id: 'poison_potion',
        name: '毒药水',
        icon: '🧪',
        rarity: 'uncommon',
        description: '武器附带毒伤（15秒）',
        effect: 'poison',
        value: 1,
        duration: 15000,
        price: 80,
        gemPrice: 0
    },
    REGEN: {
        id: 'regen_potion',
        name: '治疗药水',
        icon: '💚',
        rarity: 'rare',
        description: '10秒内持续回血',
        effect: 'regen',
        value: 0.5,
        duration: 10000,
        price: 90,
        gemPrice: 0
    },
    MYSTERY: {
        id: 'mystery_potion',
        name: '神秘药水',
        icon: '🔮',
        rarity: 'legendary',
        description: '随机效果，可能惊喜也可能惊吓',
        effect: 'random',
        value: 0,
        duration: 0,
        price: 0,
        gemPrice: 2
    }
};

// ==================== 遗物配置 ====================
const RELICS = {
    HEART: {
        id: 'heart_relic',
        name: '生命之心',
        icon: '❤️',
        rarity: 'rare',
        description: '最大生命值+1',
        effect: 'max_health',
        value: 1
    },
    ENERGY_CORE: {
        id: 'energy_core',
        name: '能量核心',
        icon: '⚡',
        rarity: 'uncommon',
        description: '怒气获取+30%',
        effect: 'rage_gain',
        value: 0.3
    },
    STEEL_AMULET: {
        id: 'steel_amulet',
        name: '钢铁护符',
        icon: '🛡️',
        rarity: 'rare',
        description: '受伤-1（最少1点）',
        effect: 'damage_reduction',
        value: 1
    },
    WIND_BOOTS: {
        id: 'wind_boots',
        name: '疾风之靴',
        icon: '👟',
        rarity: 'uncommon',
        description: '移动速度+15%',
        effect: 'move_speed',
        value: 0.15
    },
    SCOPE: {
        id: 'scope',
        name: '瞄准镜',
        icon: '🎯',
        rarity: 'uncommon',
        description: '暴击率+20%',
        effect: 'crit_rate',
        value: 0.2
    },
    GOLD_POT: {
        id: 'gold_pot',
        name: '聚宝盆',
        icon: '💎',
        rarity: 'rare',
        description: '金币获取+25%',
        effect: 'gold_gain',
        value: 0.25
    },
    FIRE_HEART: {
        id: 'fire_heart',
        name: '火焰之心',
        icon: '🔥',
        rarity: 'epic',
        description: '攻击附带灼烧效果',
        effect: 'burn',
        value: 1
    },
    ICE_HEART: {
        id: 'ice_heart',
        name: '冰霜之心',
        icon: '🧊',
        rarity: 'epic',
        description: '攻击附带减速效果',
        effect: 'slow',
        value: 0.3
    },
    THUNDER_HEART: {
        id: 'thunder_heart',
        name: '雷电之心',
        icon: '⚡',
        rarity: 'legendary',
        description: '攻击有30%几率连锁闪电',
        effect: 'chain_lightning',
        value: 0.3
    },
    LUCKY_STAR: {
        id: 'lucky_star',
        name: '幸运星',
        icon: '🌟',
        rarity: 'rare',
        description: '道具掉落率+30%',
        effect: 'drop_rate',
        value: 0.3
    }
};

// ==================== 基础道具配置 ====================
const BASE_ITEMS = {
    GOLD: {
        id: 'gold',
        name: '金币',
        icon: '💰',
        type: 'material',
        rarity: 'common',
        description: '通用货币',
        stackable: true,
        maxStack: 999,
        value: 1
    },
    GEM: {
        id: 'gem',
        name: '宝石',
        icon: '💎',
        type: 'material',
        rarity: 'rare',
        description: '稀有货币',
        stackable: true,
        maxStack: 99,
        value: 10
    },
    BOMB: {
        id: 'bomb',
        name: '炸弹',
        icon: '💣',
        type: 'consumable',
        rarity: 'uncommon',
        description: '对范围内敌人造成3点伤害',
        stackable: true,
        maxStack: 10,
        value: 20
    },
    KEY: {
        id: 'key',
        name: '钥匙',
        icon: '🗝️',
        type: 'key',
        rarity: 'uncommon',
        description: '打开宝箱',
        stackable: true,
        maxStack: 10,
        value: 30
    },
    XP_BOOK: {
        id: 'xp_book',
        name: '经验书',
        icon: '⭐',
        type: 'consumable',
        rarity: 'rare',
        description: '永久提升1点攻击力',
        stackable: false,
        maxStack: 1,
        value: 100
    },
    FOOD: {
        id: 'food',
        name: '食物',
        icon: '🍖',
        type: 'consumable',
        rarity: 'common',
        description: '在10秒内缓慢恢复2点生命',
        stackable: true,
        maxStack: 5,
        value: 25
    },
    SCROLL: {
        id: 'scroll',
        name: '神秘卷轴',
        icon: '📜',
        type: 'scroll',
        rarity: 'epic',
        description: '使用后获得随机增益',
        stackable: true,
        maxStack: 3,
        value: 80
    }
};

// ==================== 掉落物动画配置 ====================
const DROP_ITEM = {
    BOUNCE_HEIGHT: 10,
    BOUNCE_SPEED: 0.005,
    PICKUP_SPEED: 0.1,
    SIZE: 16
};

// ==================== 导出常量 ====================
// 使用CommonJS模块导出（供Node.js环境使用）
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        GAME_WIDTH,
        GAME_HEIGHT,
        TARGET_FPS,
        FRAME_TIME,
        DELTA_TIME_MAX,
        COLORS,
        PIXEL_SIZE,
        PLAYER,
        WEAPONS,
        ENEMIES,
        BOSS,
        LEVELS,
        PORTAL,
        PARTICLES,
        ANIMATION,
        AUDIO,
        GAME_STATE,
        COLLISION,
        RAGE,
        UI,
        UI_COLORS,
        SKILL_COOLDOWN,
        SKILL_RAGE_COST,
        SKILL_EFFECT,
        ROOM_TYPES,
        TRAP_TYPES,
        TRAPS,
        CHEST_TYPES,
        CHESTS,
        NEW_ENEMIES,
        SKELETON_KING,
        GOLD,
        GRAPHICS_QUALITY,
        PARTICLE_EFFECTS,
        SCREEN_EFFECTS,
        CAMERA_EFFECTS,
        SCENE_DYNAMICS,
        ROOM_LIGHTING,
        UI_ANIMATIONS,
        CHARACTER_ANIMATIONS,
        WEAPON_ANIMATIONS,
        ENEMY_ANIMATIONS,
        BOSS_EFFECTS,
        DIFFICULTY
    };
}