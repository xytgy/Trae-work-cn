/**
 * 24个角色定义
 * 包含所有角色的具体配置和技能组合
 */

// 角色ID常量
const CHARACTER_ID = {
    // 战士系
    KNIGHT: 1,           // 骑士
    BERSERKER: 2,        // 狂战士
    BLADEMASTER: 3,      // 剑圣
    
    // 刺客系
    ASSASSIN: 4,         // 刺客
    RANGER: 5,           // 游侠
    NIGHTMARE: 6,        // 夜魔
    
    // 法师系
    MAGE: 7,             // 法师
    FROST_MAGE: 8,       // 冰法师
    STORM_MAGE: 9,       // 雷法师
    
    // 辅助系
    PRIEST: 10,          // 牧师
    SEER: 11,            // 占卜师
    ANGEL: 12,           // 天使
    
    // 猎人系
    HUNTER: 13,          // 猎人
    WEREWOLF: 14,        // 狼人
    EAGLE_EYE: 15,       // 鹰眼
    
    // 机械系
    ENGINEER: 16,         // 工程师
    ROBOT: 17,           // 机器人
    DEMOLISHER: 18,      // 爆破专家
    
    // 召唤系
    NECROMANCER: 19,     // 死灵师
    DRAGON_TAMER: 20,    // 驯龙师
    NATURE_CALLER: 21,  // 自然使者
    
    // 特殊系
    ALCHEMIST: 22,       // 炼金师
    JOKER: 23,           // 小丑
    RAINBOW_MESSENGER: 24 // 彩虹使者
};

// 角色系别
const CHARACTER_CATEGORY = {
    WARRIOR: '战士',
    ASSASSIN: '刺客',
    MAGE: '法师',
    SUPPORT: '辅助',
    HUNTER: '猎人',
    MECH: '机械',
    SUMMONER: '召唤',
    SPECIAL: '特殊'
};

/**
 * 创建所有角色的工厂函数
 */
function createAllCharacters() {
    return {
        // ==================== 战士系角色 ====================
        
        // 1. 骑士
        [CHARACTER_ID.KNIGHT]: createKnight(),
        
        // 2. 狂战士
        [CHARACTER_ID.BERSERKER]: createBerserker(),
        
        // 3. 剑圣
        [CHARACTER_ID.BLADEMASTER]: createBlademaster(),
        
        // ==================== 刺客系角色 ====================
        
        // 4. 刺客
        [CHARACTER_ID.ASSASSIN]: createAssassin(),
        
        // 5. 游侠
        [CHARACTER_ID.RANGER]: createRanger(),
        
        // 6. 夜魔
        [CHARACTER_ID.NIGHTMARE]: createNightmare(),
        
        // ==================== 法师系角色 ====================
        
        // 7. 法师
        [CHARACTER_ID.MAGE]: createMage(),
        
        // 8. 冰法师
        [CHARACTER_ID.FROST_MAGE]: createFrostMage(),
        
        // 9. 雷法师
        [CHARACTER_ID.STORM_MAGE]: createStormMage(),
        
        // ==================== 辅助系角色 ====================
        
        // 10. 牧师
        [CHARACTER_ID.PRIEST]: createPriest(),
        
        // 11. 占卜师
        [CHARACTER_ID.SEER]: createSeer(),
        
        // 12. 天使
        [CHARACTER_ID.ANGEL]: createAngel(),
        
        // ==================== 猎人系角色 ====================
        
        // 13. 猎人
        [CHARACTER_ID.HUNTER]: createHunter(),
        
        // 14. 狼人
        [CHARACTER_ID.WEREWOLF]: createWerewolf(),
        
        // 15. 鹰眼
        [CHARACTER_ID.EAGLE_EYE]: createEagleEye(),
        
        // ==================== 机械系角色 ====================
        
        // 16. 工程师
        [CHARACTER_ID.ENGINEER]: createEngineer(),
        
        // 17. 机器人
        [CHARACTER_ID.ROBOT]: createRobot(),
        
        // 18. 爆破专家
        [CHARACTER_ID.DEMOLISHER]: createDemolisher(),
        
        // ==================== 召唤系角色 ====================
        
        // 19. 死灵师
        [CHARACTER_ID.NECROMANCER]: createNecromancer(),
        
        // 20. 驯龙师
        [CHARACTER_ID.DRAGON_TAMER]: createDragonTamer(),
        
        // 21. 自然使者
        [CHARACTER_ID.NATURE_CALLER]: createNatureCaller(),
        
        // ==================== 特殊系角色 ====================
        
        // 22. 炼金师
        [CHARACTER_ID.ALCHEMIST]: createAlchemist(),
        
        // 23. 小丑
        [CHARACTER_ID.JOKER]: createJoker(),
        
        // 24. 彩虹使者
        [CHARACTER_ID.RAINBOW_MESSENGER]: createRainbowMessenger()
    };
}

// ==================== 战士系角色创建函数 ====================

/**
 * 创建骑士角色
 */
function createKnight() {
    const character = new Character();
    character.id = CHARACTER_ID.KNIGHT;
    character.name = '骑士';
    character.title = '无畏守护者';
    character.description = '擅长防御的战士，可以用护盾保护自己';
    character.icon = '🛡️';
    character.category = CHARACTER_CATEGORY.WARRIOR;
    character.maxHealth = 4;      // 多一点血量
    character.speed = 3.5;         // 稍慢
    character.damage = 1;
    character.color = '#607d8b';
    character.accentColor = '#90a4ae';
    character.activeSkill = new ShieldSkill();
    character.passiveSkill = new DamageReductionPassive();
    return character;
}

/**
 * 创建狂战士角色
 */
function createBerserker() {
    const character = new Character();
    character.id = CHARACTER_ID.BERSERKER;
    character.name = '狂战士';
    character.title = '血之狂怒';
    character.description = '血量越低伤害越高，狂暴状态下无人能挡';
    character.icon = '⚔️';
    character.category = CHARACTER_CATEGORY.WARRIOR;
    character.maxHealth = 3;
    character.speed = 4.5;         // 稍快
    character.damage = 1.2;         // 基础伤害稍高
    character.color = '#d32f2f';
    character.accentColor = '#f44336';
    character.activeSkill = new BerserkSkill();
    character.passiveSkill = new LowHealthDamagePassive();
    return character;
}

/**
 * 创建剑圣角色
 */
function createBlademaster() {
    const character = new Character();
    character.id = CHARACTER_ID.BLADEMASTER;
    character.name = '剑圣';
    character.title = '剑刃风暴';
    character.description = '剑术大师，攻击速度极快';
    character.icon = '🗡️';
    character.category = CHARACTER_CATEGORY.WARRIOR;
    character.maxHealth = 3;
    character.speed = 4;
    character.damage = 1;
    character.color = '#795548';
    character.accentColor = '#a1887f';
    character.activeSkill = new BladeStormSkill();
    character.passiveSkill = new AttackSpeedPassive();
    return character;
}

// ==================== 刺客系角色创建函数 ====================

/**
 * 创建刺客角色
 */
function createAssassin() {
    const character = new Character();
    character.id = CHARACTER_ID.ASSASSIN;
    character.name = '刺客';
    character.title = '暗影杀手';
    character.description = '擅长背后偷袭，一击致命';
    character.icon = '🗡️';
    character.category = CHARACTER_CATEGORY.ASSASSIN;
    character.maxHealth = 2;       // 血量较低
    character.speed = 5;           // 速度很快
    character.damage = 1.5;        // 背后攻击伤害翻倍
    character.color = '#37474f';
    character.accentColor = '#546e7a';
    character.activeSkill = new BlinkSkill();
    character.passiveSkill = new BackstabPassive();
    return character;
}

/**
 * 创建游侠角色
 */
function createRanger() {
    const character = new Character();
    character.id = CHARACTER_ID.RANGER;
    character.name = '游侠';
    character.title = '幻影猎手';
    character.description = '创造幻影迷惑敌人，闪避率极高';
    character.icon = '🏹';
    character.category = CHARACTER_CATEGORY.ASSASSIN;
    character.maxHealth = 3;
    character.speed = 4.5;
    character.damage = 1;
    character.color = '#558b2f';
    character.accentColor = '#7cb342';
    character.activeSkill = new PhantomSkill();
    character.passiveSkill = new EvasionPassive();
    return character;
}

/**
 * 创建夜魔角色
 */
function createNightmare() {
    const character = new Character();
    character.id = CHARACTER_ID.NIGHTMARE;
    character.name = '夜魔';
    character.title = '暗影突袭者';
    character.description = '快速穿越敌人，击杀减少技能冷却';
    character.icon = '🌙';
    character.category = CHARACTER_CATEGORY.ASSASSIN;
    character.maxHealth = 2;
    character.speed = 5;
    character.damage = 1.3;
    character.color = '#4a148c';
    character.accentColor = '#7b1fa2';
    character.activeSkill = new ShadowStrikeSkill();
    character.passiveSkill = new KillCooldownReductionPassive();
    return character;
}

// ==================== 法师系角色创建函数 ====================

/**
 * 创建法师角色
 */
function createMage() {
    const character = new Character();
    character.id = CHARACTER_ID.MAGE;
    character.name = '法师';
    character.title = '火焰主宰';
    character.description = '召唤流星火雨，技能伤害极高';
    character.icon = '🔥';
    character.category = CHARACTER_CATEGORY.MAGE;
    character.maxHealth = 2;
    character.speed = 3.5;
    character.damage = 1;
    character.color = '#e65100';
    character.accentColor = '#ff9800';
    character.activeSkill = new MeteorStrikeSkill();
    character.passiveSkill = new SkillPowerPassive();
    return character;
}

/**
 * 创建冰法师角色
 */
function createFrostMage() {
    const character = new Character();
    character.id = CHARACTER_ID.FROST_MAGE;
    character.name = '冰法师';
    character.title = '寒冰领主';
    character.description = '冻结敌人，减速效果超强';
    character.icon = '❄️';
    character.category = CHARACTER_CATEGORY.MAGE;
    character.maxHealth = 2;
    character.speed = 3.5;
    character.damage = 1;
    character.color = '#00acc1';
    character.accentColor = '#00bcd4';
    character.activeSkill = new FreezeSkill();
    character.passiveSkill = new SlowEnhancementPassive();
    return character;
}

/**
 * 创建雷法师角色
 */
function createStormMage() {
    const character = new Character();
    character.id = CHARACTER_ID.STORM_MAGE;
    character.name = '雷法师';
    character.title = '雷霆使者';
    character.description = '闪电链攻击多个敌人';
    character.icon = '⚡';
    character.category = CHARACTER_CATEGORY.MAGE;
    character.maxHealth = 2;
    character.speed = 4;
    character.damage = 1.1;
    character.color = '#fdd835';
    character.accentColor = '#ffeb3b';
    character.activeSkill = new ThunderStrikeSkill();
    character.passiveSkill = new LightningChainPassive();
    return character;
}

// ==================== 辅助系角色创建函数 ====================

/**
 * 创建牧师角色
 */
function createPriest() {
    const character = new Character();
    character.id = CHARACTER_ID.PRIEST;
    character.name = '牧师';
    character.title = '神圣医者';
    character.description = '治疗盟友，击杀回血';
    character.icon = '💚';
    character.category = CHARACTER_CATEGORY.SUPPORT;
    character.maxHealth = 3;
    character.speed = 3.5;
    character.damage = 0.8;
    character.color = '#388e3c';
    character.accentColor = '#4caf50';
    character.activeSkill = new HealSkill();
    character.passiveSkill = new KillHealPassive();
    return character;
}

/**
 * 创建占卜师角色
 */
function createSeer() {
    const character = new Character();
    character.id = CHARACTER_ID.SEER;
    character.name = '占卜师';
    character.title = '命运观察者';
    character.description = '预知敌人轨迹，先发制人';
    character.icon = '🔮';
    character.category = CHARACTER_CATEGORY.SUPPORT;
    character.maxHealth = 3;
    character.speed = 4;
    character.damage = 1;
    character.color = '#7b1fa2';
    character.accentColor = '#9c27b0';
    character.activeSkill = new ForesightSkill();
    character.passiveSkill = new EnemyTrackingPassive();
    return character;
}

/**
 * 创建天使角色
 */
function createAngel() {
    const character = new Character();
    character.id = CHARACTER_ID.ANGEL;
    character.name = '天使';
    character.title = '神圣守护者';
    character.description = '死亡后复活一次，守护盟友';
    character.icon = '👼';
    character.category = CHARACTER_CATEGORY.SUPPORT;
    character.maxHealth = 3;
    character.speed = 4;
    character.damage = 1;
    character.color = '#fff59d';
    character.accentColor = '#ffee58';
    character.activeSkill = new ResurrectionSkill();
    character.passiveSkill = new ResurrectionPassive();
    return character;
}

// ==================== 猎人系角色创建函数 ====================

/**
 * 创建猎人角色
 */
function createHunter() {
    const character = new Character();
    character.id = CHARACTER_ID.HUNTER;
    character.name = '猎人';
    character.title = '陷阱大师';
    character.description = '放置地雷，移动速度快';
    character.icon = '🎯';
    character.category = CHARACTER_CATEGORY.HUNTER;
    character.maxHealth = 3;
    character.speed = 4.8;         // 速度很快
    character.damage = 1;
    character.color = '#795548';
    character.accentColor = '#8d6e63';
    character.activeSkill = new LandmineSkill();
    character.passiveSkill = new MovementSpeedPassive();
    return character;
}

/**
 * 创建狼人角色
 */
function createWerewolf() {
    const character = new Character();
    character.id = CHARACTER_ID.WEREWOLF;
    character.name = '狼人';
    character.title = '野兽之王';
    character.description = '召唤野兽助战，宠物自动攻击';
    character.icon = '🐺';
    character.category = CHARACTER_CATEGORY.HUNTER;
    character.maxHealth = 3;
    character.speed = 4.5;
    character.damage = 1.1;
    character.color = '#5d4037';
    character.accentColor = '#795548';
    character.activeSkill = new SummonPetSkill();
    character.passiveSkill = new PetCompanionPassive();
    return character;
}

/**
 * 创建鹰眼角色
 */
function createEagleEye() {
    const character = new Character();
    character.id = CHARACTER_ID.EAGLE_EYE;
    character.name = '鹰眼';
    character.title = '致命狙击手';
    character.description = '超远距离精准射击，暴击率极高';
    character.icon = '🦅';
    character.category = CHARACTER_CATEGORY.HUNTER;
    character.maxHealth = 2;
    character.speed = 4;
    character.damage = 1.8;         // 高伤害
    character.color = '#455a64';
    character.accentColor = '#607d8b';
    character.activeSkill = new PrecisionShotSkill();
    character.passiveSkill = new CriticalHitPassive();
    return character;
}

// ==================== 机械系角色创建函数 ====================

/**
 * 创建工程师角色
 */
function createEngineer() {
    const character = new Character();
    character.id = CHARACTER_ID.ENGINEER;
    character.name = '工程师';
    character.title = '机械大师';
    character.description = '放置自动炮台，弹药充足';
    character.icon = '🔧';
    character.category = CHARACTER_CATEGORY.MECH;
    character.maxHealth = 3;
    character.speed = 3;
    character.damage = 1;
    character.color = '#ff6f00';
    character.accentColor = '#ffa000';
    character.activeSkill = new TurretSkill();
    character.passiveSkill = new AmmoCapacityPassive();
    return character;
}

/**
 * 创建机器人角色
 */
function createRobot() {
    const character = new Character();
    character.id = CHARACTER_ID.ROBOT;
    character.name = '机器人';
    character.title = '机械生命体';
    character.description = '自我修复能力，持续回复生命';
    character.icon = '🤖';
    character.category = CHARACTER_CATEGORY.MECH;
    character.maxHealth = 4;         // 血量较高
    character.speed = 3;
    character.damage = 1;
    character.color = '#78909c';
    character.accentColor = '#90a4ae';
    character.activeSkill = new SelfRepairSkill();
    character.passiveSkill = new PassiveHealingPassive();
    return character;
}

/**
 * 创建爆破专家角色
 */
function createDemolisher() {
    const character = new Character();
    character.id = CHARACTER_ID.DEMOLISHER;
    character.name = '爆破专家';
    character.title = '爆炸艺术家';
    character.description = '定点爆破，爆炸范围翻倍';
    character.icon = '💣';
    character.category = CHARACTER_CATEGORY.MECH;
    character.maxHealth = 2;
    character.speed = 4;
    character.damage = 1.5;
    character.color = '#bf360c';
    character.accentColor = '#e64a19';
    character.activeSkill = new DemolitionSkill();
    character.passiveSkill = new ExplosionRangePassive();
    return character;
}

// ==================== 召唤系角色创建函数 ====================

/**
 * 创建死灵师角色
 */
function createNecromancer() {
    const character = new Character();
    character.id = CHARACTER_ID.NECROMANCER;
    character.name = '死灵师';
    character.title = '亡灵主宰';
    character.description = '召唤骷髅大军，击杀召唤骷髅';
    character.icon = '💀';
    character.category = CHARACTER_CATEGORY.SUMMONER;
    character.maxHealth = 2;
    character.speed = 3.5;
    character.damage = 1;
    character.color = '#37474f';
    character.accentColor = '#546e7a';
    character.activeSkill = new ArmyOfDeadSkill();
    character.passiveSkill = new SummonOnKillPassive();
    return character;
}

/**
 * 创建驯龙师角色
 */
function createDragonTamer() {
    const character = new Character();
    character.id = CHARACTER_ID.DRAGON_TAMER;
    character.name = '驯龙师';
    character.title = '飞龙骑士';
    character.description = '召唤飞龙空袭，空中支援';
    character.icon = '🐉';
    character.category = CHARACTER_CATEGORY.SUMMONER;
    character.maxHealth = 3;
    character.speed = 4;
    character.damage = 1;
    character.color = '#6a1b9a';
    character.accentColor = '#8e24aa';
    character.activeSkill = new SummonDragonSkill();
    character.passiveSkill = new AirSupportPassive();
    return character;
}

/**
 * 创建自然使者角色
 */
function createNatureCaller() {
    const character = new Character();
    character.id = CHARACTER_ID.NATURE_CALLER;
    character.name = '自然使者';
    character.title = '自然之魂';
    character.description = '放置荆棘陷阱，敌人持续受伤';
    character.icon = '🌿';
    character.category = CHARACTER_CATEGORY.SUMMONER;
    character.maxHealth = 3;
    character.speed = 4;
    character.damage = 1;
    character.color = '#2e7d32';
    character.accentColor = '#43a047';
    character.activeSkill = new ThornTrapSkill();
    character.passiveSkill = new DamageOverTimePassive();
    return character;
}

// ==================== 特殊系角色创建函数 ====================

/**
 * 创建炼金师角色
 */
function createAlchemist() {
    const character = new Character();
    character.id = CHARACTER_ID.ALCHEMIST;
    character.name = '炼金师';
    character.title = '药水大师';
    character.description = '投掷药水炸弹，使敌人中毒';
    character.icon = '🧪';
    character.category = CHARACTER_CATEGORY.SPECIAL;
    character.maxHealth = 2;
    character.speed = 4;
    character.damage = 1.2;
    character.color = '#00838f';
    character.accentColor = '#00acc1';
    character.activeSkill = new PotionBombSkill();
    character.passiveSkill = new PoisonAttackPassive();
    return character;
}

/**
 * 创建小丑角色
 */
function createJoker() {
    const character = new Character();
    character.id = CHARACTER_ID.JOKER;
    character.name = '小丑';
    character.title = '惊喜制造者';
    character.description = '随机获得各种增益效果';
    character.icon = '🎭';
    character.category = CHARACTER_CATEGORY.SPECIAL;
    character.maxHealth = 3;
    character.speed = 4;
    character.damage = 1;
    character.color = '#c2185b';
    character.accentColor = '#e91e63';
    character.activeSkill = new SurpriseBoxSkill();
    character.passiveSkill = new RandomBuffPassive();
    return character;
}

/**
 * 创建彩虹使者角色
 */
function createRainbowMessenger() {
    const character = new Character();
    character.id = CHARACTER_ID.RAINBOW_MESSENGER;
    character.name = '彩虹使者';
    character.title = '元素融合者';
    character.description = '融合多种元素，全属性提升';
    character.icon = '🌈';
    character.category = CHARACTER_CATEGORY.SPECIAL;
    character.maxHealth = 3;
    character.speed = 4;
    character.damage = 1;
    character.color = '#f06292';
    character.accentColor = '#ff4081';
    character.activeSkill = new ElementalFusionSkill();
    character.passiveSkill = new AllStatsBonusPassive();
    return character;
}

// 创建全局角色字典
const ALL_CHARACTERS = createAllCharacters();

/**
 * 根据ID获取角色
 * @param {number} id - 角色ID
 * @returns {Character} 角色实例
 */
function getCharacterById(id) {
    const template = ALL_CHARACTERS[id];
    if (!template) return null;
    
    // 返回深拷贝，避免共享技能实例
    const character = new Character();
    Object.assign(character, template);
    
    // 重新创建技能实例
    if (character.activeSkill) {
        character.activeSkill = createActiveSkillInstance(template.activeSkill);
    }
    if (character.passiveSkill) {
        character.passiveSkill = createPassiveSkillInstance(template.passiveSkill);
    }
    
    return character;
}

/**
 * 创建主动技能实例
 */
function createActiveSkillInstance(template) {
    const name = template.constructor.name;
    switch (name) {
        case 'ShieldSkill': return new ShieldSkill();
        case 'BerserkSkill': return new BerserkSkill();
        case 'BladeStormSkill': return new BladeStormSkill();
        case 'BlinkSkill': return new BlinkSkill();
        case 'PhantomSkill': return new PhantomSkill();
        case 'ShadowStrikeSkill': return new ShadowStrikeSkill();
        case 'MeteorStrikeSkill': return new MeteorStrikeSkill();
        case 'FreezeSkill': return new FreezeSkill();
        case 'ThunderStrikeSkill': return new ThunderStrikeSkill();
        case 'HealSkill': return new HealSkill();
        case 'ForesightSkill': return new ForesightSkill();
        case 'ResurrectionSkill': return new ResurrectionSkill();
        case 'LandmineSkill': return new LandmineSkill();
        case 'SummonPetSkill': return new SummonPetSkill();
        case 'PrecisionShotSkill': return new PrecisionShotSkill();
        case 'TurretSkill': return new TurretSkill();
        case 'SelfRepairSkill': return new SelfRepairSkill();
        case 'DemolitionSkill': return new DemolitionSkill();
        case 'ArmyOfDeadSkill': return new ArmyOfDeadSkill();
        case 'SummonDragonSkill': return new SummonDragonSkill();
        case 'ThornTrapSkill': return new ThornTrapSkill();
        case 'PotionBombSkill': return new PotionBombSkill();
        case 'SurpriseBoxSkill': return new SurpriseBoxSkill();
        case 'ElementalFusionSkill': return new ElementalFusionSkill();
        default: return null;
    }
}

/**
 * 创建被动技能实例
 */
function createPassiveSkillInstance(template) {
    const name = template.constructor.name;
    switch (name) {
        case 'DamageReductionPassive': return new DamageReductionPassive();
        case 'LowHealthDamagePassive': return new LowHealthDamagePassive();
        case 'AttackSpeedPassive': return new AttackSpeedPassive();
        case 'BackstabPassive': return new BackstabPassive();
        case 'EvasionPassive': return new EvasionPassive();
        case 'KillCooldownReductionPassive': return new KillCooldownReductionPassive();
        case 'SkillPowerPassive': return new SkillPowerPassive();
        case 'SlowEnhancementPassive': return new SlowEnhancementPassive();
        case 'LightningChainPassive': return new LightningChainPassive();
        case 'KillHealPassive': return new KillHealPassive();
        case 'EnemyTrackingPassive': return new EnemyTrackingPassive();
        case 'ResurrectionPassive': return new ResurrectionPassive();
        case 'MovementSpeedPassive': return new MovementSpeedPassive();
        case 'PetCompanionPassive': return new PetCompanionPassive();
        case 'CriticalHitPassive': return new CriticalHitPassive();
        case 'AmmoCapacityPassive': return new AmmoCapacityPassive();
        case 'PassiveHealingPassive': return new PassiveHealingPassive();
        case 'ExplosionRangePassive': return new ExplosionRangePassive();
        case 'SummonOnKillPassive': return new SummonOnKillPassive();
        case 'AirSupportPassive': return new AirSupportPassive();
        case 'DamageOverTimePassive': return new DamageOverTimePassive();
        case 'PoisonAttackPassive': return new PoisonAttackPassive();
        case 'RandomBuffPassive': return new RandomBuffPassive();
        case 'AllStatsBonusPassive': return new AllStatsBonusPassive();
        default: return null;
    }
}

/**
 * 获取所有角色列表
 * @returns {Array} 角色信息列表
 */
function getAllCharactersInfo() {
    const list = [];
    for (const id in ALL_CHARACTERS) {
        list.push(ALL_CHARACTERS[id].getInfo());
    }
    return list;
}

/**
 * 获取角色列表（按系别分组）
 * @returns {Object} 按系别分组的角色列表
 */
function getCharactersByCategory() {
    const categories = {};
    for (const id in ALL_CHARACTERS) {
        const character = ALL_CHARACTERS[id];
        const category = character.category;
        if (!categories[category]) {
            categories[category] = [];
        }
        categories[category].push(character.getInfo());
    }
    return categories;
}
