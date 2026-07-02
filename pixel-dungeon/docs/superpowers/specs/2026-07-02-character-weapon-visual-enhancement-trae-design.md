# 像素地牢：角色外观与武器弹道增强 — 设计文档

## 一、概述

本设计文档详细描述像素地牢游戏的视觉增强功能，包括：
1. **角色外观差异化** — 24个角色拥有独特的bodyShape配置，通过数学绘制实现多样化外观
2. **武器弹道效果增强** — 优化8种子弹的draw()方法，添加拖尾、粒子、特效等视觉效果
3. **自动瞄准优化** — 根据武器类型调整辅助瞄准参数

---

## 二、角色外观设计

### 2.1 bodyShape配置结构

每个角色的bodyShape包含以下字段：
```javascript
bodyShape: {
    build: 'slim' | 'normal' | 'muscular' | 'bulky' | 'tiny', // 体型
    head: 'round' | 'oval' | 'square' | 'pointed' | 'helmet', // 头型
    weapon: 'sword' | 'shield' | 'bow' | 'staff' | 'dagger' | 'fist' | 'gun', // 手持武器
    decor: 'none' | 'horns' | 'wings' | 'ears' | 'crown' | 'mask', // 装饰物
    pattern: 'solid' | 'stripes' | 'dots' | 'gradient' | 'glow' // 身体纹理
}
```

### 2.2 24个角色bodyShape配置

#### 战士系
| ID | 名称 | bodyShape配置 |
|---|---|---|
| 1 | 勇者 | `{ build: 'normal', head: 'round', weapon: 'sword', decor: 'none', pattern: 'solid' }` |
| 2 | 圣骑士 | `{ build: 'muscular', head: 'helmet', weapon: 'shield', decor: 'none', pattern: 'gradient' }` |
| 3 | 狂战士 | `{ build: 'bulky', head: 'helmet', weapon: 'sword', decor: 'horns', pattern: 'glow' }` |
| 19 | 龙裔 | `{ build: 'muscular', head: 'helmet', weapon: 'sword', decor: 'horns', pattern: 'glow' }` |
| 24 | 武僧 | `{ build: 'slim', head: 'oval', weapon: 'fist', decor: 'none', pattern: 'solid' }` |

#### 刺客系
| ID | 名称 | bodyShape配置 |
|---|---|---|
| 4 | 忍者 | `{ build: 'slim', head: 'mask', weapon: 'dagger', decor: 'none', pattern: 'stripes' }` |
| 5 | 杀手 | `{ build: 'slim', head: 'helmet', weapon: 'dagger', decor: 'none', pattern: 'solid' }` |
| 21 | 暗影刺客 | `{ build: 'slim', head: 'mask', weapon: 'dagger', decor: 'none', pattern: 'gradient' }` |

#### 法师系
| ID | 名称 | bodyShape配置 |
|---|---|---|
| 6 | 元素师 | `{ build: 'slim', head: 'pointed', weapon: 'staff', decor: 'none', pattern: 'glow' }` |
| 7 | 死灵法师 | `{ build: 'slim', head: 'helmet', weapon: 'staff', decor: 'none', pattern: 'gradient' }` |
| 22 | 冰霜法师 | `{ build: 'slim', head: 'pointed', weapon: 'staff', decor: 'none', pattern: 'glow' }` |

#### 辅助系
| ID | 名称 | bodyShape配置 |
|---|---|---|
| 8 | 圣职者 | `{ build: 'normal', head: 'helmet', weapon: 'staff', decor: 'none', pattern: 'glow' }` |
| 9 | 诗人 | `{ build: 'slim', head: 'round', weapon: 'staff', decor: 'none', pattern: 'gradient' }` |
| 23 | 炼金师 | `{ build: 'normal', head: 'round', weapon: 'staff', decor: 'none', pattern: 'dots' }` |

#### 猎人系
| ID | 名称 | bodyShape配置 |
|---|---|---|
| 10 | 弓箭手 | `{ build: 'slim', head: 'round', weapon: 'bow', decor: 'ears', pattern: 'solid' }` |
| 11 | 狙击手 | `{ build: 'slim', head: 'helmet', weapon: 'bow', decor: 'none', pattern: 'solid' }` |
| 20 | 精灵弓手 | `{ build: 'slim', head: 'pointed', weapon: 'bow', decor: 'ears', pattern: 'gradient' }` |

#### 机械系
| ID | 名称 | bodyShape配置 |
|---|---|---|
| 12 | 工程师 | `{ build: 'normal', head: 'helmet', weapon: 'gun', decor: 'none', pattern: 'stripes' }` |
| 13 | 机械师 | `{ build: 'bulky', head: 'helmet', weapon: 'gun', decor: 'none', pattern: 'dots' }` |

#### 召唤系
| ID | 名称 | bodyShape配置 |
|---|---|---|
| 14 | 召唤师 | `{ build: 'slim', head: 'pointed', weapon: 'staff', decor: 'none', pattern: 'glow' }` |
| 15 | 德鲁伊 | `{ build: 'normal', head: 'round', weapon: 'staff', decor: 'ears', pattern: 'gradient' }` |

#### 特殊系
| ID | 名称 | bodyShape配置 |
|---|---|---|
| 16 | 赌博师 | `{ build: 'normal', head: 'round', weapon: 'none', decor: 'none', pattern: 'dots' }` |
| 17 | 时空旅行者 | `{ build: 'slim', head: 'helmet', weapon: 'staff', decor: 'none', pattern: 'glow' }` |
| 18 | 梦魇 | `{ build: 'slim', head: 'mask', weapon: 'staff', decor: 'wings', pattern: 'gradient' }` |

### 2.3 角色渲染函数设计

在 `player.js` 中新增以下绘制函数：

#### drawCharacterBody(ctx, build)
根据build参数绘制不同体型：
- **slim**: 细长矩形 + 小椭圆头部
- **normal**: 标准圆形（当前默认）
- **muscular**: 宽肩矩形 + 粗手臂
- **bulky**: 大圆形 + 粗壮四肢
- **tiny**: 缩小版圆形

#### drawCharacterHead(ctx, head)
根据head参数绘制不同头型：
- **round**: 圆形
- **oval**: 椭圆形
- **square**: 方形
- **pointed**: 尖顶（法师帽）
- **helmet**: 头盔（带面罩）
- **mask**: 面具

#### drawCharacterWeapon(ctx, weapon)
根据weapon参数绘制手持武器：
- **sword**: 剑
- **shield**: 盾牌
- **bow**: 弓箭
- **staff**: 法杖
- **dagger**: 匕首
- **fist**: 拳套
- **gun**: 枪
- **none**: 不绘制武器

#### drawCharacterDecor(ctx, decor)
根据decor参数绘制装饰物：
- **none**: 无
- **horns**: 角
- **wings**: 翅膀
- **ears**: 精灵耳
- **crown**: 皇冠
- **mask**: 面具

#### drawCharacterPattern(ctx, pattern, color)
根据pattern参数绘制身体纹理：
- **solid**: 纯色填充
- **stripes**: 条纹
- **dots**: 圆点
- **gradient**: 渐变色
- **glow**: 发光效果

### 2.4 角色选择界面卡片渲染

在 `characterSelect.js` 的 `renderCharacterIcon()` 和 `renderCharacterPreview()` 方法中，使用相同的bodyShape绘制逻辑，确保角色卡片预览与游戏中渲染一致。

---

## 三、武器弹道效果设计

### 3.1 子弹draw()方法改动

#### Bullet.draw(ctx) — 普通子弹（手枪）
**改动**: 添加拖尾粒子效果
- 在子弹后方生成3-5个渐隐的圆形粒子
- 粒子大小随距离递减
- 颜色与子弹一致

#### LightningBullet.draw(ctx) — 闪电子弹
**改动**: 增强电弧锯齿，添加分支
- 增加轨迹点数量，使电弧更密集
- 添加2-3个分支电弧，从主轨迹分叉
- 分支长度为主体的30%-50%
- 添加随机偏移增强视觉效果

#### GrenadeBullet.draw(ctx) — 榴弹子弹
**改动**: 添加抛物线尾迹
- 在子弹下方绘制烟雾粒子
- 粒子数量随高度变化（越高越多）
- 添加旋转动画增强投掷感

#### FlameBullet.draw(ctx) — 火焰子弹
**改动**: 粒子翻倍，颜色渐变
- 粒子数量翻倍至5-8个/帧
- 添加从橙到红的颜色渐变
- 增加随机大小和角度变化

#### BoomerangBullet.draw(ctx) — 回旋镖子弹
**改动**: 添加弧线拖尾
- 在回旋镖飞行路径上绘制弧形轨迹
- 轨迹由多个连接的线段组成
- 添加闪烁效果

#### FreezeBullet.draw(ctx) — 冰冻子弹
**改动**: 添加命中冰裂效果
- 子弹周围绘制冰晶环绕效果
- 命中时生成冰裂粒子向外扩散
- 冰裂粒子带有角度偏移

#### ShotgunBullet.draw(ctx) — 散弹子弹
**改动**: 添加独立拖尾
- 每发子弹有独立的短拖尾
- 拖尾长度随距离递减
- 添加轻微扩散效果

#### HomingBullet.draw(ctx) — 追踪导弹
**改动**: 尾焰增强，添加转弯轨迹
- 尾焰粒子数量增加到5-8个
- 尾焰长度随速度变化
- 添加转弯时的轨迹弧线

### 3.2 爆炸粒子效果增强

在 `game.js` 中增强爆炸和击中效果：
- 增加爆炸碎片数量（15-20个）
- 添加爆炸烟雾效果
- 击中碎片增加颜色渐变

---

## 四、自动瞄准优化设计

### 4.1 武器级别瞄准配置

在 `constants.js` 的 `AIM_ASSIST` 中新增武器级别配置：

```javascript
const AIM_ASSIST = {
    // ... 现有配置 ...
    
    // 武器级别瞄准参数
    WEAPON_SETTINGS: {
        PISTOL: {
            assistRange: 120,
            assistAngle: Math.PI / 6,  // 30度
            snapStrength: 0.3,
            bulletCurveStrength: 0.15
        },
        LIGHTNING: {
            assistRange: 180,
            assistAngle: Math.PI / 4,  // 45度
            snapStrength: 0.25,
            bulletCurveStrength: 0.1
        },
        GRENADE: {
            assistRange: 200,
            assistAngle: Math.PI / 3,  // 60度
            snapStrength: 0.4,
            bulletCurveStrength: 0.2
        },
        FLAME: {
            assistRange: 80,
            assistAngle: Math.PI / 3,  // 60度
            snapStrength: 0.5,
            bulletCurveStrength: 0.25
        },
        BOOMERANG: {
            assistRange: 150,
            assistAngle: Math.PI / 5,  // 36度
            snapStrength: 0.35,
            bulletCurveStrength: 0.15
        },
        FREEZE: {
            assistRange: 130,
            assistAngle: Math.PI / 6,  // 30度
            snapStrength: 0.25,
            bulletCurveStrength: 0.1
        },
        SHOTGUN: {
            assistRange: 100,
            assistAngle: Math.PI / 4,  // 45度
            snapStrength: 0.3,
            bulletCurveStrength: 0.15
        },
        HOMING: {
            assistRange: 250,
            assistAngle: Math.PI / 2,  // 90度
            snapStrength: 0.1,
            bulletCurveStrength: 0.05
        }
    }
};
```

### 4.2 calculateAimAssist() 方法改动

修改 `game.js` 的 `calculateAimAssist()` 方法，接受 `weaponType` 参数：

```javascript
calculateAimAssist(playerX, playerY, targetX, targetY, strength, weaponType = 'PISTOL') {
    // 获取武器特定的瞄准参数
    const weaponConfig = AIM_ASSIST.WEAPON_SETTINGS[weaponType] || AIM_ASSIST.WEAPON_SETTINGS.PISTOL;
    
    // 使用武器特定参数进行瞄准计算
    // assistRange, assistAngle, snapStrength, bulletCurveStrength
}
```

### 4.3 目标指示器渲染

在游戏中渲染目标指示器：
- 在锁定敌人头上绘制红色三角/准星
- 准星大小随距离变化
- 添加脉冲动画效果
- 仅在辅助瞄准激活时显示

---

## 五、不做的范围

1. **不修改子弹逻辑** — 只修改draw()方法，不修改update()或碰撞检测逻辑
2. **不修改角色技能系统** — 只添加视觉外观，不改变技能效果
3. **不添加新武器** — 仅增强现有8种武器的视觉效果
4. **不修改游戏核心循环** — 保持现有游戏逻辑不变
5. **不引入新依赖** — 保持原生JavaScript实现

---

## 六、实现约束

1. **角色外观只在玩家渲染上生效** — 在 `player.js` 的渲染方法中修改
2. **角色选择界面卡片也显示差异外观** — 在 `characterSelect.js` 中使用相同绘制逻辑
3. **武器弹道效果只改 `bullet.js` 的 `draw()` 方法**
4. **粒子效果走现有 `this.particles.push(new Particle(...))` 模式**
5. **所有角色 `bodyShape` 配置加在 `characterSelect.js` 的角色数组里**
6. **自动瞄准改 `game.js` 的 `calculateAimAssist()`**，新增 weapon 参数
7. **保持像素风格** — 所有绘制使用数学图形，不使用图片资源
8. **不破坏已有的16个已修复问题**
