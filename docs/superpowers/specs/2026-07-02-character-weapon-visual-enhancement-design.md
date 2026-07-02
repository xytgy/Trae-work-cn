# 像素地牢：角色外观与武器弹道增强设计

**日期：** 2026-07-02
**状态：** 设计草案

---

## 一、目标

- 24 个角色不再是只有颜色不同，而是有独特的像素外观
- 8 种武器的弹道效果各有特色，视觉上能清晰区分
- 自动瞄准手感更好，玩家能感知到"瞄准辅助"的存在

---

## 二、角色外观 — 代码生成差异化

### 2.1 设计思路

不用手绘像素模板，而是通过 5 个数学参数驱动 Canvas 绘图，生成每个角色的独特外观。

### 2.2 外观参数（新增到角色配置）

```javascript
{
  id: 1,
  name: '勇者',
  // ... 现有属性 ...
  bodyShape: {
    build: 'medium',     // 'slim' | 'medium' | 'heavy'
    head: 'round',       // 'round' | 'sharp' | 'hood' | 'square'
    weapon: 'gun',       // 'sword' | 'staff' | 'gun' | 'dagger' | 'axe'
    decor: 'none',       // 'none' | 'crown' | 'mask' | 'wings' | 'aura'
    pattern: 'none'      // 'none' | 'stripe' | 'check' | 'glow'
  }
}
```

### 2.3 各参数视觉效果

| 参数 | 选项 | 效果 |
|------|------|------|
| build | slim | 身体窄高 (10×14px)，适合刺客 |
| build | medium | 身体方正 (12×12px)，适合战士 |
| build | heavy | 身体矮宽 (16×10px)，适合骑士 |
| head | round | 圆形头，普通 |
| head | sharp | 菱形/锥形头，看起来像刺客兜帽 |
| head | hood | 梯形头，法师兜帽 |
| head | square | 方形头，头盔感 |
| weapon | sword | 手持长条+横杠（L形） |
| weapon | staff | 手持长条+圆球 |
| weapon | gun | 手持矩形+管口 |
| weapon | dagger | 手持短斜线 |
| weapon | axe | 手持T形 |

### 2.4 渲染实现

在 `player.js` 的 `renderPlayer()` 中，新增一个渲染分支：

- 读取 `player.character.bodyShape`
- 根据 5 个参数调用不同的绘制子函数
- 如果角色没有 `bodyShape` 配置，回退到当前的颜色圆渲染

绘制函数数学公式示例：

```
// heavy + round + axe 的骑士：
身体：fillRect(-8, -6, 16, 12)     // 矮宽
头：arc(0, -10, 7)                  // 大圆头
斧：fillRect(10, -2, 8, 3)          // 斧柄
    + fillRect(14, -5, 4, 8)       // 斧刃

// slim + hood + staff 的法师：
身体：fillRect(-5, -6, 10, 14)     // 窄高
头：梯形路径 (-6,-12)→(6,-12)→(4,-6)→(-4,-6)  // 兜帽
杖：fillRect(8, -8, 2, 16)         // 杖身
    + arc(9, -10, 4)               // 杖顶宝珠
```

### 2.5 角色配置映射

| 角色 | build | head | weapon | decor | pattern |
|------|-------|------|--------|-------|---------|
| 勇者 | medium | round | gun | none | none |
| 圣骑士 | heavy | square | sword | crown | check |
| 狂战士 | heavy | sharp | axe | none | stripe |
| 忍者 | slim | sharp | dagger | mask | none |
| 杀手 | slim | hood | dagger | mask | none |
| 元素师 | slim | hood | staff | none | glow |
| 死灵法师 | slim | hood | staff | aura | none |
| 冰法师 | slim | hood | staff | none | check |
| 雷法师 | slim | round | staff | wings | none |
| 牧师 | medium | round | staff | crown | none |
| 猎人 | medium | sharp | gun | none | none |
| 狼人 | heavy | sharp | dagger | none | stripe |
| ... 以此类推，覆盖 24 个角色 |

---

## 三、武器弹道效果

### 3.1 各武器效果

所有效果在现有 `bullet.js` 的 `draw()` 方法中实现，无需架构改动。

**手枪**
- 子弹：黄色圆点 (不变)
- 新增：子弹飞行拖尾粒子（淡淡的小黄点，跟随子弹轨迹）

**闪电法杖**
- 子弹：锯齿形 Z 字闪电线条（现有 `LightningBullet.draw` 已有，加强锯齿幅度）
- 新增：命中时在目标和子弹间画小电弧分支
- 新增：命中粒子改为蓝色电光碎片

**榴弹发射器**
- 子弹：橙色圆球 (不变)
- 新增：子弹带抛物线尾迹（从玩家到目标画一条淡淡弧线）
- 爆炸效果增强：碎片从 12→25 个，新增冲击波白色光环

**火焰喷射器**
- 子弹：锥形火焰粒子束
- 新增：火焰粒子数量翻倍、颜色渐变（黄→橙→红→透明）
- 新增：地面燃烧痕迹更大且颜色更深

**回旋镖**
- 子弹：旋转的星形（现有已有，保持）
- 新增：旋转时带圆弧形拖尾（轨迹上的连续残影）

**冰冻枪**
- 子弹：六角冰晶形状（现有已有）
- 新增：命中时冰裂扩散效果（冰晶碎片向外飞散）
- 新增：被冰冻的敌人身上覆盖冰霜纹理（半透明蓝色叠加）

**散弹枪**
- 子弹：3 发弹丸扇形扩散（现有已有）
- 新增：每发弹丸有自己的拖尾粒子
- 新增：命中碎片从 3→8 个

**追踪导弹**
- 子弹：三角形导弹（现有已有）
- 新增：尾焰更大、更亮（橙色→红色渐变）
- 新增：追踪转弯时画转弯弧线轨迹
- 新增：爆炸时紫色+橙色混合碎片

### 3.2 实现策略

- 所有效果在 `bullet.draw(ctx)` 和 `game.js` 的粒子生成函数中修改
- 不新增子弹类，不改子弹逻辑
- 粒子效果走现有的 `this.particles.push(new Particle(...))` 模式

---

## 四、自动瞄准优化

### 4.1 瞄准强度调整

| 武器 | 吸附角度 | 吸附强度 | 说明 |
|------|---------|---------|------|
| 手枪 | 20° | 35% | 轻微辅助 |
| 闪电法杖 | 30° | 50% | 中等辅助 |
| 榴弹发射器 | 10° | 20% | 低辅助，爆炸补偿 |
| 火焰喷射器 | 35° | 60% | 高辅助，短射程 |
| 回旋镖 | 25° | 45% | 中等辅助 |
| 冰冻枪 | 20° | 35% | 同手枪 |
| 散弹枪 | 15° | 25% | 低辅助，范围攻击 |
| 追踪导弹 | 0° | 0% | 完全自动追踪 |

### 4.2 目标指示器

在锁定的敌人头顶画一个小红箭头 / 红色准星标记：
```
if (nearestEnemy && aimAssist.active) {
    renderer.drawTriangle(nearestEnemy.x, nearestEnemy.y - 20, 5, '#ff0000');
}
```

这帮助玩家感知"我的子弹正在被吸向这个敌人"。

### 4.3 代码改动范围

- `constants.js`：`AIM_ASSIST` 中新增武器级别瞄准配置
- `game.js`：`calculateAimAssist` 新增 `weaponType` 参数，按武器返回不同强度
- `game.js` `handleShooting` 中传入当前武器类型
- `game.js` 渲染部分：绘制目标指示器

---

## 五、新增/修改文件清单

| 文件 | 改动 |
|------|------|
| `characterSelect.js` | 24 个角色配置新增 `bodyShape` 参数 |
| `character.js` | `Character` 基类新增 `bodyShape` 属性，新增 `getBodyShape()` |
| `player.js` | `renderPlayer()` 中新增代码生成外观绘图分支 |
| `constants.js` | `AIM_ASSIST` 新增武器级别瞄准配置 |
| `bullet.js` | 每种子弹的 `draw()` 方法增加弹道特效 |
| `game.js` | `calculateAimAssist` 新增武器参数；渲染目标指示器；增强粒子效果 |
| `particle.js` | 新增几种特效粒子辅助函数 |

---

## 六、不做的范围

- ❌ 不加物理/魔法伤害区分
- ❌ 不新增武器数量
- ❌ 不新增角色数量
- ❌ 不改动敌人/ Boss
- ❌ 不引入外部资源（所有效果用 Canvas 2D API 实现）
