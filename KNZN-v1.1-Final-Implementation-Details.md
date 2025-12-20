# 🗺️ KNZN 技能地图 v1.1 Final - 2 个关键实施细节

## ⚠️ 重要声明

本文档是对 **v1.1 增强版本** 的补充规范，包含 **2 个在开发时必须重点关注的极其细微但关键的实施细节**。这两个细节不影响整体文档结构，但直接关系到 **生产环境的用户体验** 和 **跨设备兼容性**。

---

## 📱 实施细节 #1: 移动端安全区避让 (Safe Area Inset)

### 背景问题

在现代智能手机上（特别是全屏幕设备），屏幕的四条边界存在不可交互的异形区域：

- **iPhone**: Home Indicator (底部) 或 Dynamic Island/Notch (顶部)
- **Android**: 水滴屏、挖孔屏、广告栏等异形屏幕
- **iPad Pro**: 灵动岛 (Dynamic Island)

如果 HUD 的底部元素（搜索栏、按钮）没有考虑这些安全区域，会被系统 UI 遮挡，导致：
- ❌ 用户无法点击底部按钮
- ❌ 搜索栏被 Home Indicator 覆盖
- ❌ 误触发系统返回/截图手势
- ❌ 应用评分下降

### CSS 解决方案

#### 关键 CSS 属性

```css
/* 方案 1: 最简洁 - 使用 max() 函数自动适配所有设备 */

.hud-bottom-center {
  position: fixed;
  bottom: 0;
  padding-bottom: max(16px, env(safe-area-inset-bottom));
  /* 
    • 在普通设备上 = 16px (常规内边距)
    • 在 iPhone (Home Indicator) = ~34px (自动检测)
    • 在 Android 水滴屏 = ~12-20px (自动检测)
    • 在 iPad = ~20px (自动检测)
  */
}

.hud-bottom-right {
  position: fixed;
  bottom: 0;
  right: 0;
  padding-bottom: max(20px, env(safe-area-inset-bottom));
  padding-right: max(16px, env(safe-area-inset-right));
  /* 同时处理右侧 (如果有竖屏边条) */
}

.hud-bottom-left {
  position: fixed;
  bottom: 0;
  left: 0;
  padding-bottom: max(20px, env(safe-area-inset-bottom));
  padding-left: max(16px, env(safe-area-inset-left));
  /* 同时处理左侧 (如果有竖屏边条) */
}

/* 方案 2: 更精细的位置控制 - 使用 inset 属性 */

.hud-bottom-center {
  position: fixed;
  left: 50%;
  transform: translateX(-50%);
  
  /* 不用 bottom + padding，而是直接用 inset */
  inset-bottom: max(16px, env(safe-area-inset-bottom));
}
```

#### 必需的 HTML Meta 标签

```html
<!-- 在 <head> 中添加以下 meta 标签，让 env() 起效 -->
<meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover">
                                                              ↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑
                                        这个属性很关键，让浏览器能够访问 safe-area-inset-*
```

### 兼容性表

| 环境 | 支持情况 | 说明 |
|------|--------|------|
| **Safari (iOS 11.2+)** | ✅ 完全支持 | Home Indicator、Dynamic Island 自动检测 |
| **Chrome (Android 9+)** | ✅ 完全支持 | 水滴屏、挖孔屏自动检测 |
| **Firefox (所有版本)** | ✅ 完全支持 | 同 Chrome |
| **Samsung Internet** | ✅ 完全支持 | Samsung 自有设备自动检测 |
| **微信 WebView** | ⚠️ 部分支持 | 微信内浏览器可能不支持，需 fallback |
| **IE 11** | ❌ 不支持 | 降级到固定值 (16px) |

### 降级方案

对于不支持 `env()` 的旧浏览器：

```css
/* Fallback for older browsers */
.hud-bottom-center {
  position: fixed;
  bottom: 0;
  
  /* Fallback: 16px (普通设备的标准值) */
  padding-bottom: 16px;
  
  /* 现代浏览器覆盖为 max() 值 */
  padding-bottom: max(16px, env(safe-area-inset-bottom));
}

/* @supports 检查 (可选) */
@supports not (padding: max(1px, env(safe-area-inset-bottom))) {
  .hud-bottom-center {
    padding-bottom: 16px; /* Fallback */
  }
}
```

### 测试清单

```yaml
测试环节:
  iPhone 测试:
    - iPhone 12 (notch)
    - iPhone 13/14 (notch)
    - iPhone 15/16 (Dynamic Island)
    - 横屏/竖屏两种方向
    
  Android 测试:
    - Samsung Galaxy S21+ (通孔屏)
    - OnePlus (水滴屏)
    - Xiaomi (挖孔屏)
    - 横屏/竖屏两种方向
    
  iPad 测试:
    - iPad Pro (灵动岛)
    - iPad Air (标准屏)
    
  验证项:
    ✓ 按钮距离屏幕底部 > 44px (最小可点击目标)
    ✓ 搜索栏完全可见，不被系统 UI 遮挡
    ✓ 所有互动元素都能正常点击
    ✓ 横竖屏切换时无布局抖动
```

### 响应式视图调整

```javascript
// 根据不同屏幕尺寸动态调整 HUD 布局

const HUD_RESPONSIVE = {
  mobilePortrait: {
    // 屏幕宽度 < 480px，竖屏
    searchBarWidth: 'min(90vw, 350px)',
    buttonSize: '40px',
    buttonSpacing: '8px',
    bottomPadding: 'max(20px, env(safe-area-inset-bottom))'
  },
  
  mobileLandscape: {
    // 屏幕宽度 480-767px，横屏
    searchBarWidth: 'min(85vw, 500px)',
    buttonSize: '44px',
    buttonSpacing: '10px',
    bottomPadding: 'max(16px, env(safe-area-inset-bottom))'
  },
  
  tablet: {
    // 屏幕宽度 768-1023px
    searchBarWidth: '450px',
    buttonSize: '44px',
    buttonSpacing: '12px',
    bottomPadding: 'max(20px, env(safe-area-inset-bottom))'
  },
  
  desktop: {
    // 屏幕宽度 >= 1024px
    searchBarWidth: '400px',
    buttonSize: '44px',
    buttonSpacing: '12px',
    bottomPadding: 'max(16px, env(safe-area-inset-bottom))'
    // 桌面端不会有 safe-area-inset，所以就是 16px
  }
}
```

---

## 🎵 实施细节 #2: Sector 04 解锁时的音乐情绪转换

### 设计理念

**用户的心理旅程**：

```
学习初期        学习进行中       学习后期         Sector 04 解锁
"我是新手"  →   "我在积累"   →   "我掌握了"   →   "我成为造物主"
```

**音乐应该反映这种心理变化**。当用户完成所有前置 Sector 并解锁终极的 Sector 04 时，背景音乐应该从**神秘、压抑的赛博朋克风格** 升华为**宏大、充满希望的交响合成器风格**。

这是**从视觉反馈升级为多感官反馈**的关键时刻。

### 音乐参数对比

| 指标 | 初期 BGM | Sector 04 BGM |
|------|---------|--------------|
| **文件名** | `ambient_cyber.wav` | `orchestral_synth_awakening.wav` |
| **BPM** | 110 | 120 |
| **节奏** | 缓慢、沉闷 | 逐步加快、高潮迭起 |
| **主要乐器** | 合成器、电子音效 | 小提琴、大提琴、法国号 + 电子鼓 |
| **情绪** | 神秘、压抑、冷漠 | 宏大、升华、希望 |
| **音量** | 0.35 | 0.4 |
| **是否循环** | Yes | Yes |
| **时长** | 建议 3-5 分钟 | 建议 3-5 分钟 |

### 音乐转换时间轴

```
0ms         ┌─ 用户完成最后一个 Sector 的最后一个节点
            │
500ms       ├─ FR-001 中的 core-lock-break 声效 (core_unlock.wav)
            │  触发 Sector 04 破壳动画开始
            │
1000ms      ├─ 【BGM 转换开始】
            │  当前 BGM (ambient_cyber) 开始淡出 (1.5s)
            │
2000ms      ├─ Sector 04 动画达到高潮
            │  核心完全点亮，能量流达到最大
            │
2500ms      ├─ 当前 BGM 完全消失
            │  【新 BGM 淡入开始】(延迟 1s 后触发)
            │  orchestral_synth_awakening 开始播放 (音量从 0 → 0.4，耗时 2s)
            │
4500ms      ├─ 新 BGM 完全建立 (音量 = 0.4)
            │  地图背景色调也完成了变化 (紫黑 → 深蓝)
            │  用户完全沉浸在新的音乐-视觉-气氛中
            │
持续播放    └─ orchestral_synth_awakening 循环播放，直到用户离开地图
```

### 音乐结构建议

给音乐编制师/AI 作曲工具的提示词：

```
【基本信息】
- 风格: Orchestral Electronic Fusion (交响电子融合)
- BPM: 120
- 时长: 3-5 分钟 (可循环)
- 音量动态: 中等 (避免太响导致疲劳)

【结构要求】
Intro (0-10s):
  • 从空灵的弦乐独奏开始
  • 逐步加入合成器底鼓
  • 营造"破晓前的寂静"氛围

Build (10-30s):
  • 加入低音大提琴、大鼓
  • 节奏逐步加快
  • 加入法国号、铜管轮廓
  • 营造"能量积蓄"感

Climax (30-60s):
  • 全乐队合奏 (弦乐 + 铜管 + 打击乐 + 电子鼓)
  • 达到动态的顶峰
  • 类似于 "冲破桎梏的一刻"

Sustain (60+s):
  • 回到相对温和的弦乐背景
  • 但融入持久的电子音效
  • 给人"已经升华，正在享受胜利"的感觉

【参考音乐】
1. Interstellar - Hans Zimmer (曲: "No Time For Caution")
   理由: 恢宏、升华感

2. Tron Legacy - Daft Punk (曲: "The Grid")
   理由: 电子与交响的融合

3. Mass Effect 3 - Liam Kiela (曲: "Catalyst")
   理由: 命运/转折感

4. Minecraft - C418 (曲: "Aria Math")
   理由: 简洁而宏大，给人希望感

5. Final Fantasy VII Remake - Masashi Hamauzu (曲: "Hollow")
   理由: 情感流转与升华

【禁忌项】
❌ 不要使用 Heavy Metal 或 Aggressive 风格
❌ 不要加入語音旁白或人声
❌ 不要过于复杂导致注意力分散
❌ 不要加入不协和音 (主题是"升华"，而非"冲突")
```

### 实现代码示例

```typescript
// composables/useBGMTransition.ts

import { ref, watch, computed } from 'vue';
import type { UserSkillProgress } from '@/types/skills';

const bgmAudio = ref<HTMLAudioElement | null>(null);
const currentTrackName = ref('ambient_cyber');
const bgmVolume = ref(0.35);
const isTransitioning = ref(false);

/**
 * 监听用户进度
 * 当完成所有 Sector 时，触发 BGM 转换
 */
export function useBGMTransition(userProgress: Ref<UserSkillProgress>) {
  watch(
    () => {
      // 检查是否完成了所有 Sector
      const allSectorsComplete = 
        userProgress.value.byProfession.hardware.completed === 
          userProgress.value.byProfession.hardware.total &&
        userProgress.value.byProfession.firmware.completed === 
          userProgress.value.byProfession.firmware.total &&
        userProgress.value.byProfession.application.completed === 
          userProgress.value.byProfession.application.total;
      
      return allSectorsComplete;
    },
    async (allComplete) => {
      if (allComplete && currentTrackName.value === 'ambient_cyber') {
        // 触发转换
        await transitionToSector04BGM();
      }
    }
  );
  
  return { bgmVolume, currentTrackName, isTransitioning };
}

/**
 * 核心转换逻辑
 */
async function transitionToSector04BGM(): Promise<void> {
  if (isTransitioning.value) return; // 防止重复触发
  isTransitioning.value = true;
  
  try {
    // Step 1: 淡出当前 BGM (1500ms)
    console.log('[BGM] 开始淡出 ambient_cyber.wav');
    await fadeOutBGM(1500, bgmAudio.value!);
    
    // Step 2: 停止当前音频，准备新音频
    if (bgmAudio.value) {
      bgmAudio.value.pause();
      bgmAudio.value.currentTime = 0;
    }
    
    // Step 3: 创建新音频对象并预加载
    const newAudio = new Audio('/audio/orchestral_synth_awakening.wav');
    newAudio.loop = true;
    newAudio.volume = 0;
    
    // Step 4: 延迟 1000ms 后开始播放和淡入
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    console.log('[BGM] 开始淡入 orchestral_synth_awakening.wav');
    newAudio.play();
    
    // Step 5: 淡入新 BGM (2000ms)
    await fadeInBGM(newAudio, 2000, 0.4);
    
    // Step 6: 更新状态
    bgmAudio.value = newAudio;
    currentTrackName.value = 'orchestral_synth';
    bgmVolume.value = 0.4;
    
    console.log('[BGM] ✅ 转换完成');
  } finally {
    isTransitioning.value = false;
  }
}

/**
 * 淡出动画
 */
function fadeOutBGM(
  duration: number,
  audio: HTMLAudioElement,
  targetVolume: number = 0
): Promise<void> {
  return new Promise((resolve) => {
    const startVolume = audio.volume;
    const startTime = Date.now();
    const frameInterval = 50; // 20fps
    
    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      // 使用缓动函数 (ease-in)
      const easeProgress = progress * progress; // 二次函数
      
      audio.volume = startVolume + (targetVolume - startVolume) * easeProgress;
      
      if (progress < 1) {
        setTimeout(animate, frameInterval);
      } else {
        audio.volume = targetVolume;
        resolve();
      }
    };
    
    animate();
  });
}

/**
 * 淡入动画
 */
function fadeInBGM(
  audio: HTMLAudioElement,
  duration: number,
  targetVolume: number
): Promise<void> {
  return new Promise((resolve) => {
    const startVolume = audio.volume;
    const startTime = Date.now();
    const frameInterval = 50;
    
    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      // 使用缓动函数 (ease-out)
      const easeProgress = 1 - (1 - progress) * (1 - progress);
      
      audio.volume = startVolume + (targetVolume - startVolume) * easeProgress;
      
      if (progress < 1) {
        setTimeout(animate, frameInterval);
      } else {
        audio.volume = targetVolume;
        resolve();
      }
    };
    
    animate();
  });
}

/**
 * 用户可控制 BGM 音量
 */
export function setUserBGMVolume(volume: number) {
  bgmVolume.value = Math.max(0, Math.min(1, volume)); // 范围 [0, 1]
  if (bgmAudio.value) {
    bgmAudio.value.volume = bgmVolume.value;
  }
}

/**
 * 在用户设置中暴露 BGM 控制
 */
export const userBGMSettings = computed(() => ({
  volume: bgmVolume.value,
  currentTrack: currentTrackName.value,
  isMuted: bgmVolume.value === 0,
  isTransitioning: isTransitioning.value
}));
```

### 音乐获取方案对比

#### 方案 A: AI 生成音乐 (推荐，最快)

```yaml
工具: OpenAI Jukebox / AIVA / Amper Music / Runway Gen-3

成本: $0-100
时间: 1-3 天
质量: 中等 (可作为占位符或最终使用)

提示词 (Prompt):
  "Orchestral electronic fusion theme for video game victory sequence.
   Triumphant awakening, 120 BPM, 5 minutes loop. 
   Imagine: Interstellar soundtrack + Tron Legacy + Final Fantasy.
   Start: 10s ambient intro with solo strings.
   Build: 20s gradual crescendo with drums and horns.
   Climax: 30s full orchestra + electronic beats.
   Sustain: Rest of loop with soft strings + electronic pads.
   Instruments: Violins, cellos, French horns, timpani, synthesizers, electronic drums.
   Mood: Hopeful, epic, transcendent, NOT aggressive."

推荐使用:
  1. AIVA (aiva.ai) - 游戏音乐专家
  2. Amper Music (ampermusic.com) - 快速迭代
  3. Runway Gen-3 (runwayml.com) - 最新 AI 质量
```

#### 方案 B: 商业音乐库 (稳定，高质)

```yaml
库: Epidemic Sound / Artlist / Envato Elements

成本: $10-50/月 (订阅制)
时间: 几小时 (查找合适曲目)
质量: 高 (专业制作)

搜索关键词:
  "orchestral electronic"
  "triumphant awakening"
  "epic synth"
  "victory theme"
  "transcendent"

推荐平台:
  1. Epidemic Sound - 质量稳定，更新频繁
  2. Artlist - 游戏音乐库丰富
  3. Envato Elements - 价格最优

使用许可:
  ✓ 绝大多数支持商业游戏使用
  ✓ 需要在音乐播放时注明出处 (如果要求)
  ✓ 通常不允许再分发或修改
```

#### 方案 C: 专业音乐编制 (最优，定制)

```yaml
找专业作曲家

成本: $300-1000
时间: 2-4 周
质量: 极高 (完全定制化)

平台:
  1. Fiverr (fiverr.com) - 范围广，速度快
     预算: $200-500，评级 4.8+ stars 专注游戏音乐作曲家
  
  2. Upwork (upwork.com) - 专业性强
     预算: $400-800，找有游戏/影视配乐经验的作曲师
  
  3. Soundly (soundly.com) - 专业音乐工作室
     预算: $500-1500，交付质量最高

项目描述模板:
  "
  [游戏背景]
  我们是一个硬件学习平台 KNZN，设计了一个赛博朋克风格的技能地图。
  
  [音乐需求]
  我们需要一首原创配乐来庆祝用户的最终成就 (解锁终极内容)。
  
  [技术规格]
  - 风格: Orchestral Electronic Fusion (交响电子融合)
  - BPM: 120
  - 时长: 5 分钟 (可循环)
  - 音量: 中等 (不要太响)
  
  [音乐结构]
  Intro (10s): Solo strings
  Build (20s): Gradual orchestration
  Climax (30s): Full orchestra
  Sustain (rest): Loopable background
  
  [参考]
  Interstellar - Hans Zimmer
  Tron Legacy - Daft Punk
  
  [交付物]
  - WAV 格式, 44.1kHz, Stereo
  - 完整的商业使用版权
  "
```

#### 推荐选择流程

```
急需上线? (1周内)
  ↓
  Y → 使用方案 A (AI 生成) 或 方案 B (库)
  
有适当预算? ($300+)
  ↓
  Y → 使用方案 C (专业作曲)
  N → 使用方案 B (库)
  
要求最高质量?
  ↓
  Y → 使用方案 C (专业作曲)
```

---

## ✅ 最终实施清单

### 移动端安全区

- [ ] CSS 中所有底部 HUD 元素都包含 `padding-bottom: max(X, env(safe-area-inset-bottom))`
- [ ] HTML `<meta>` 包含 `viewport-fit=cover`
- [ ] 在 iPhone 12-15 Pro、iPhone 16、Android 水滴屏上测试
- [ ] 横屏/竖屏两种模式下都无错位
- [ ] 所有按钮最小可点击面积 ≥ 44×44px

### 音乐转换

- [ ] 获取或生成 `orchestral_synth_awakening.wav` 音乐文件
- [ ] 实现 BGM 转换逻辑 (淡出 1.5s → 延迟 1s → 淡入 2s)
- [ ] 转换时长总计 3s，与 Sector 04 破壳动画同步
- [ ] 地图背景色调也随之变化 (紫黑 → 深蓝)
- [ ] 用户可在设置中调节 BGM 音量和开关

---

**文档完成度**: v1.1 Final ✅  
**是否可交付**: 是 — 可直接给高级工程师开发  
**预计开发时长**: 3-4 周 (含两个实施细节)

