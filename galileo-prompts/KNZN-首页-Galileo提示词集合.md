# KNZN 首页 - Galileo AI 提示词集合

基于 `docs/KNZN-首页设计文档-v1.3.1.md` 和 `UI/1-首页.md` 生成的 usegalileo.ai 提示词集合。

## 🎯 核心设计理念

**项目背景**: KNZN 硬件学习网站 - 赛博朋克风格游戏化平台  
**设计哲学**: 沉浸式互动装置，通过仪式化的"通电"过程完成用户身份转换  
**核心交互**: 闸刀开关拖拽机制，从"游客"→"KNZN 云端硬件实验室接入者"

## 🎨 通用视觉规范

**色彩系统**:
- 背景: #050505 (深邃黑)
- 强调: #00FFC2 (荧光青)
- 辅助: #33FF00 (终端绿)
- 警告: #FF0055 (霓虹红)

**字体系统**:
- 状态文本: JetBrains Mono / Fira Code (等宽字体)
- 标题/Logo: Orbitron / Russo One (科幻显示字体)

---

## 📱 场景一：断电状态 (初始页面)

### 桌面端 - 断电状态

```
Create a cyberpunk-style immersive landing page for "KNZN" hardware learning platform. 

**Layout & Style:**
- Background: Pure deep black (#050505) with no distractions
- Extremely minimalist design focusing on single central interaction
- No navigation bar, no footer, no buttons visible
- Atmosphere: Silent, dark, mysterious "system offline" feeling

**Central Elements:**
1. **Main Interaction**: Vintage electrical knife switch (NOT a button)
   - **Physical Description**: Old-school electrical disconnect switch with a long metal blade/lever that pivots vertically
   - **Current Position**: Blade pointing UP (open/off position), like a real electrical breaker
   - **Materials**: Heavy brushed steel or brass construction with visible bolts and mounting hardware
   - **Details**: Thick metal blade (the "knife"), ceramic or bakelite insulators, industrial mounting base
   - **Reference**: Think 1920s-1940s industrial electrical equipment, like those found in old factories or power stations
   - **NOT**: Modern toggle switch, button, or UI element - this should look like actual electrical hardware

2. **Logo**: Above the switch
   - Text: "KNZN" in outlined/stroke style
   - Color: Dark gray (#333333), barely visible in the darkness
   - Font: Sci-fi display font (Orbitron style)

3. **Status Text**: Below the switch
   - Text: "> CLOUD_LAB_OFFLINE. DRAG TO INITIALIZE."
   - Font: Monospace terminal font
   - Color: Bright terminal green (#33FF00)
   - Effect: Subtle blinking/pulsing animation
   - Style: Retro computer terminal aesthetic

**Visual Hierarchy**: Switch → Status Text → Dim Logo
**Mood**: Anticipation, waiting for user activation
```

### 移动端 - 断电状态

```
Design a mobile-first cyberpunk interface for "KNZN" hardware platform in "offline" state.

**Mobile Layout (Portrait):**
- Screen: Vertical layout optimized for thumb interaction
- Background: Deep void black (#050505)
- Focus: Single central interaction element

**Key Elements:**
1. **Header Area**: Minimal space with barely visible "KNZN" logo outline in dark gray
2. **Hero Section**: Authentic electrical knife switch mechanism
   - **Physical Form**: Vintage industrial electrical disconnect switch (NOT a button or toggle)
   - **Description**: Metal blade/lever in "UP" open position, mounted on ceramic insulators
   - **Style**: 1930s-1940s electrical equipment aesthetic - heavy steel construction
   - **Size**: 160x240px proportion, but maintain realistic industrial hardware appearance
   - **Details**: Visible mounting bolts, thick metal blade, industrial base plate
3. **Status Area**: Terminal-style text below switch
   - Text: "> SYSTEM_OFFLINE. TAP TO INITIALIZE."
   - Font: Monospace, bright green (#33FF00)
   - Animation: Gentle blinking effect

**Mobile-Specific Considerations:**
- Touch-friendly sizing for the switch element
- Clear visual hierarchy for small screens
- No unnecessary UI elements that could distract from main interaction
```

---

## ⚡ 场景二：通电状态 (激活后页面)

### 桌面端 - 通电状态

```
Create the "System Online" state for KNZN cyberpunk hardware lab interface.

**Overall Transformation:**
- Background: Deep black (#050505) with subtle glowing grid effect at bottom
- Atmosphere: Energetic, futuristic "power on" feeling with neon lighting
- Multiple UI elements now visible and glowing

**Central Elements:**
1. **Activated Switch**: Vintage electrical knife switch now in "DOWN" closed position
   - **Physical State**: Heavy metal blade now pointing DOWN (closed/on position)
   - **Visual Effect**: Glowing with intense Neon Cyan (#00FFC2) light emanating from the connection points
   - **Details**: Electrical arcing effects, sparks, or energy discharge around the blade contact points
   - **Material Glow**: The metal blade itself appears energized with cyan electrical current
   - **Industrial Realism**: Still maintains the authentic 1940s electrical equipment appearance

2. **Illuminated Logo**: "KNZN" logo above switch
   - Now fully lit in bright Neon Cyan (#00FFC2)
   - Strong glow effect with subtle text shadow
   - Font: Orbitron/Russo One sci-fi display font

3. **Updated Status**: Below switch
   - Text: "> CLOUD_LAB_ONLINE. WELCOME TO THE FUTURE."
   - Color: Neon Cyan (#00FFC2) matching the activated theme
   - Font: Monospace terminal style

**New UI Elements:**
4. **Navigation Bar**: Top of screen
   - Semi-transparent overlay with subtle opacity
   - Menu items in cyan accent color
   - Clean, minimal cyberpunk styling

5. **CTA Button**: Below status text
   - Text: "[ 启动云端实验室 ]" or "[ LAUNCH CLOUD LAB ]"
   - Style: Sharp rectangular button with bracket styling
   - Colors: Background #00FFC2, text black (#050505)
   - Size: 280px × 48px with 8px border radius
   - Font: Russo One display font

6. **Ambient Effects**:
   - Subtle background glow/grid pattern
   - Atmospheric lighting effects around activated elements
   - Overall "system powered up" visual feedback
```

### 移动端 - 通电状态

```
Design the mobile "System Active" interface for KNZN cyberpunk platform.

**Mobile Layout Transformation:**
- Background: Deep black with subtle energy effects
- All elements now illuminated and interactive

**Layout Structure:**
1. **Header**: Compact navigation with glowing KNZN logo in cyan
2. **Hero Section**: Activated electrical knife switch
   - **Physical State**: Vintage electrical disconnect switch with blade in "DOWN" closed position
   - **Energy Effects**: Glowing Neon Cyan (#00FFC2) electrical current flowing through the metal blade
   - **Visual Details**: Sparks, electrical arcing, or energy discharge effects at connection points
   - **Size**: 160x240px optimized for mobile, but maintaining industrial hardware realism

3. **Status Display**: 
   - Text: "> CLOUD_LAB_ONLINE. SYSTEM READY."
   - Color: Bright cyan (#00FFC2)
   - Font: Monospace terminal style

4. **Action Area**: Full-width sticky bottom section
   - Large CTA button: "[ 启动云端实验室 ]"
   - Button style: Full-width, Neon Cyan background
   - Height: 56px for easy thumb access
   - Sharp, cyberpunk aesthetic with bracket styling

**Mobile-Specific Features:**
- Touch-optimized button sizing
- Clear visual hierarchy for activated state
- Sticky bottom CTA for easy access
- Responsive glow effects that work on mobile screens
```

---

## 🎮 场景三：交互过渡状态

### 拖拽进行中状态

```
Create an intermediate state showing the knife switch being dragged down in a cyberpunk interface.

**Transition Visualization:**
- Background: Deep black (#050505) starting to show subtle energy buildup
- Switch: Partially pulled down (approximately 50% of full travel)
- Visual feedback showing user interaction in progress

**Key Elements:**
1. **Switch Position**: Halfway between UP and DOWN positions
   - Subtle glow beginning to appear around switch mechanism
   - Visual indication of movement/progress

2. **Logo State**: "KNZN" logo beginning to illuminate
   - Transitioning from dark gray (#333333) to cyan (#00FFC2)
   - Partial glow effect showing system awakening

3. **Status Text**: 
   - Text: "> INITIALIZING... DRAG TO COMPLETE."
   - Color: Transitioning from green (#33FF00) to cyan (#00FFC2)
   - Subtle pulsing effect indicating system response

4. **Environmental Effects**:
   - Faint energy particles or grid lines beginning to appear
   - Subtle background glow starting to build up
   - Visual anticipation of full system activation

**Animation Implications**: This represents a mid-frame of the activation sequence
```

---

## 🔧 技术实现提示

### 闸刀开关视觉参考

**真实闸刀开关的关键特征**:
- **不是按钮**: 这是一个真实的电气设备，不是UI按钮或开关控件
- **物理结构**: 
  - 厚重的金属刀片/刀刃 (通常是铜或钢制)
  - 陶瓷或胶木绝缘子支撑
  - 金属底座和安装螺栓
  - 可见的电气接触点
- **动作方式**: 刀片垂直旋转，从上方(断开)到下方(闭合)
- **年代感**: 1920-1940年代工业电气设备的外观
- **参考搜索词**: "vintage electrical knife switch", "industrial disconnect switch", "antique electrical breaker"

**Galileo AI 关键词优化**:
```
Instead of: "switch", "toggle", "button"
Use: "electrical knife switch", "vintage disconnect switch", "industrial electrical breaker with metal blade"

Add descriptive terms: "heavy metal blade", "ceramic insulators", "mounting bolts", "electrical contact points", "industrial hardware"
```

### Galileo AI 使用建议

1. **生成顺序建议**:
   - 先生成"通电状态"（元素最全）
   - 再删减元素生成"断电状态"
   - 最后调整为移动端布局

2. **关键词优化**:
   - **避免使用**: "switch", "toggle", "button", "lever" (这些会生成现代UI元素)
   - **推荐使用**: "electrical knife switch", "vintage disconnect switch", "industrial electrical breaker"
   - **增强描述**: "heavy metal blade", "ceramic insulators", "1940s electrical equipment"
   - 强调"cyberpunk"、"neon glow"、"terminal interface"等关键视觉元素

3. **字体控制**:
   - 在Galileo编辑模式中手动指定字体为Monospace或JetBrains Mono
   - 标题使用Orbitron或类似的科幻显示字体

4. **颜色精确度**:
   - 确保使用精确的十六进制颜色值
   - 重点强调#050505背景和#00FFC2荧光青的对比

### 开发实现注意事项

- Galileo生成的是静态UI图，实际开发中switch需要替换为序列帧动画
- 音效和交互逻辑需要按照设计文档单独实现
- 响应式断点需要根据设计规范进行调整

---

**文档版本**: v1.0  
**生成时间**: 2024-12-22  
**基于文档**: KNZN-首页设计文档-v1.3.1.md + UI/1-首页.md  
**适用工具**: usegalileo.ai 及其他GenUI工具

---

## 🔥 增强版提示词 (专门针对真实闸刀开关)

### 超详细断电状态提示词

```
Create a cyberpunk landing page featuring an authentic vintage electrical knife switch as the centerpiece.

**CRITICAL: This is NOT a button or modern UI element. This is actual electrical hardware from the 1940s.**

**Central Element - Electrical Knife Switch:**
- **Physical Description**: A genuine vintage electrical disconnect switch, exactly like those used in old power stations and factories
- **Construction**: Heavy-duty metal construction with these specific components:
  * Thick copper or steel blade (the "knife") currently in UP/OPEN position
  * Two ceramic or bakelite insulators supporting the blade mechanism
  * Metal mounting base with visible bolts and screws
  * Electrical contact points where the blade would connect when closed
  * Industrial-grade hardware with weathered metal finish

**Visual Details:**
- **Blade Position**: The metal knife/blade is pointing upward (open circuit position)
- **Materials**: Brushed steel or brass with patina, ceramic white insulators
- **Mounting**: Bolted to what appears to be an electrical panel or mounting surface
- **Scale**: Large enough to be the focal point, but realistic to actual electrical equipment proportions
- **Lighting**: Dramatic lighting showing the metal surfaces and ceramic details

**Environment:**
- Background: Deep void black (#050505)
- Lighting: Single dramatic light source illuminating the switch hardware
- Atmosphere: Industrial, serious, like entering a power station control room

**Supporting Elements:**
- Above: Barely visible "KNZN" logo outline in dark gray
- Below: Terminal text "> CLOUD_LAB_OFFLINE. DRAG TO INITIALIZE." in green (#33FF00)

**Reference Style**: Think of electrical equipment from the movie "Frankenstein" (1931) or old power plant control rooms - real, heavy, industrial electrical hardware, not modern UI elements.
```

### 超详细通电状态提示词

```
Show the same vintage electrical knife switch now in the CLOSED/ON position with dramatic electrical effects.

**Activated Knife Switch:**
- **Blade Position**: The heavy metal blade has rotated DOWN to the closed position, making electrical contact
- **Electrical Effects**: 
  * Bright Neon Cyan (#00FFC2) electrical current visibly flowing through the metal blade
  * Small electrical arcs or sparks at the contact points where blade meets terminals
  * Intense glow emanating from the connection points
  * The entire metal blade appears energized with cyan electrical energy

**Physical Details Still Visible:**
- Same heavy industrial construction (ceramic insulators, mounting bolts, metal base)
- The switch maintains its authentic 1940s electrical equipment appearance
- Metal surfaces now reflecting the cyan electrical glow
- Ceramic insulators may show slight electrical corona effects

**Environmental Transformation:**
- Background: Still deep black but now with subtle electrical energy in the air
- Atmospheric glow: Cyan light casting shadows and reflections
- The entire scene feels "electrically alive" and energized

**Additional UI Elements Now Visible:**
- "KNZN" logo fully illuminated in matching cyan
- Status text: "> CLOUD_LAB_ONLINE. WELCOME TO THE FUTURE."
- CTA button: "[ 启动云端实验室 ]"

**Critical**: The switch should still look like authentic electrical hardware, just now energized with sci-fi electrical effects.
```
