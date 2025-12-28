# 需求文档

## 介绍

本规格文档定义了 KNZN 硬件学习平台中 Wokwi 仿真器集成验证概念（PoC）的需求。该 PoC 旨在验证 Wokwi 仿真器在我们的 Nuxt 4 应用中的集成可行性，测试关键交互场景，并为后续的完整关卡系统开发提供技术基础。

## 术语表

- **Wokwi_Simulator**: Wokwi 在线硬件仿真器，通过 iframe 嵌入到我们的应用中
- **PoC_Page**: 概念验证页面，用于测试 Wokwi 集成的各种交互场景
- **Message_Bridge**: 基于 postMessage API 的通信桥梁，用于主应用与 Wokwi iframe 之间的数据交换
- **Circuit_State**: 电路状态信息，包括组件状态、连接状态等
- **Simulation_Control**: 仿真控制功能，包括启动、暂停、重置等操作
- **Custom_Chip**: Wokwi 自定义芯片，用于实现复杂的逻辑分析和判题功能
- **Code_Injection**: 动态代码注入功能，允许在不刷新页面的情况下更新仿真器中的代码

## 需求

### 需求 1: 基础 Wokwi 仿真器嵌入

**用户故事:** 作为开发者，我想要在 Nuxt 4 页面中成功嵌入 Wokwi 仿真器，以便验证基础集成可行性。

#### 验收标准

1. WHEN 用户访问 PoC 页面 THEN THE PoC_Page SHALL 显示嵌入的 Wokwi 仿真器
2. WHEN Wokwi 仿真器加载完成 THEN THE Wokwi_Simulator SHALL 显示默认的 Arduino 项目
3. WHEN 用户与仿真器交互 THEN THE Wokwi_Simulator SHALL 响应用户的点击和操作
4. WHILE 页面处于 SSR 模式 THEN THE PoC_Page SHALL 使用 ClientOnly 组件包装仿真器
5. IF Wokwi 仿真器加载失败 THEN THE PoC_Page SHALL 显示友好的错误提示信息
6. WHEN 部署到生产环境域名及 HTTPS 下 THEN THE Wokwi_Simulator SHALL 正常加载，且不被浏览器的 CSP 策略拦截

### 需求 2: 仿真器状态监控

**用户故事:** 作为开发者，我想要监控 Wokwi 仿真器的运行状态，以便了解仿真器的工作情况。

#### 验收标准

1. WHEN 仿真器开始运行 THEN THE Message_Bridge SHALL 接收到仿真开始事件
2. WHEN 仿真器暂停或停止 THEN THE Message_Bridge SHALL 接收到相应的状态变化事件
3. WHEN 电路状态发生变化 THEN THE PoC_Page SHALL 显示当前的 Circuit_State 信息
4. THE PoC_Page SHALL 实时显示仿真器的运行时间和状态
5. WHEN 仿真器出现错误 THEN THE PoC_Page SHALL 捕获并显示错误信息

### 需求 3: 双向通信验证

**用户故事:** 作为开发者，我想要验证主应用与 Wokwi 仿真器之间的双向通信，以便为后续的关卡系统做准备。

#### 验收标准

1. WHEN 用户点击主应用的控制按钮 THEN THE Message_Bridge SHALL 向 Wokwi 发送控制指令
2. WHEN Wokwi 接收到外部指令 THEN THE Wokwi_Simulator SHALL 执行相应的操作（如启动/暂停仿真）
3. WHEN Wokwi 状态改变 THEN THE Wokwi_Simulator SHALL 通过 postMessage 通知主应用
4. THE Message_Bridge SHALL 支持 JSON 格式的结构化数据传输
5. WHEN 通信出现异常 THEN THE PoC_Page SHALL 记录错误并提供重试机制
6. WHEN 仿真内部的自定义芯片检测到电平变化 THEN THE Message_Bridge SHALL 能够接收到自定义的 JSON 事件（非标准串口文本）

### 需求 4: 项目动态加载和代码注入

**用户故事:** 作为开发者，我想要动态加载不同的 Wokwi 项目并能够动态更新代码，以便验证关卡系统中代码重置和修正功能的可行性。

#### 验收标准

1. WHEN 用户选择不同的项目 THEN THE PoC_Page SHALL 动态切换 Wokwi 项目
2. THE PoC_Page SHALL 支持至少 3 个不同类型的示例项目（Arduino、ESP32、Raspberry Pi Pico）
3. WHEN 项目切换时 THEN THE Wokwi_Simulator SHALL 清除之前的状态并加载新项目
4. WHEN 项目加载完成 THEN THE PoC_Page SHALL 显示项目加载成功的确认信息
5. IF 项目加载失败 THEN THE PoC_Page SHALL 显示具体的错误原因并提供重试选项
6. WHEN 主应用发送新的代码片段 THEN THE Wokwi_Simulator SHALL 更新编辑器内容并准备好重新编译，且无需整页刷新

### 需求 5: 性能和稳定性验证

**用户故事:** 作为开发者，我想要验证 Wokwi 集成的性能和稳定性，以便确保在生产环境中的可靠性。

#### 验收标准

1. WHEN 页面加载时 THEN THE Wokwi_Simulator SHALL 在 5 秒内完成初始化
2. WHEN 仿真器运行时 THEN THE PoC_Page SHALL 监控内存使用情况并显示性能指标
3. WHEN 用户长时间使用仿真器 THEN THE PoC_Page SHALL 保持稳定运行不出现内存泄漏
4. THE Message_Bridge SHALL 处理高频率的消息传递（每秒至少 10 条消息）
5. WHEN 网络连接不稳定时 THEN THE PoC_Page SHALL 提供离线模式或缓存机制

### 需求 6: 移动端兼容性和响应式设计

**用户故事:** 作为开发者，我想要测试移动端的布局适配和用户引导，以便确保移动端用户获得合适的体验提示。

#### 验收标准

1. WHEN 用户在移动设备上访问 PoC 页面 THEN THE PoC_Page SHALL 检测设备类型并显示"请使用 PC 访问以获得最佳体验"的优雅提示
2. WHEN 在移动设备上显示 Wokwi THEN THE PoC_Page SHALL 提供只读模式，防止用户进行无效的触摸操作
3. THE PoC_Page SHALL 确保移动端布局不会出现内容重叠或显示异常
4. WHEN 移动端用户尝试交互时 THEN THE PoC_Page SHALL 引导用户切换到桌面端
5. THE PoC_Page SHALL 测试不同移动浏览器的基础兼容性（Safari、Chrome Mobile）

### 需求 7: 安全性验证

**用户故事:** 作为开发者，我想要验证 Wokwi 集成的安全性，以便确保不会引入安全风险。

#### 验收标准

1. WHEN 建立 iframe 通信时 THEN THE Message_Bridge SHALL 验证消息来源的合法性
2. THE PoC_Page SHALL 只接受来自 Wokwi 官方域名的消息
3. WHEN 处理用户输入时 THEN THE PoC_Page SHALL 对所有输入进行安全验证和清理
4. THE Message_Bridge SHALL 限制可传递的数据类型和大小
5. WHEN 检测到可疑活动时 THEN THE PoC_Page SHALL 记录安全事件并采取防护措施

### 需求 8: 开发者工具和调试

**用户故事:** 作为开发者，我想要有完善的调试工具，以便在开发过程中快速定位和解决问题。

#### 验收标准

1. THE PoC_Page SHALL 提供详细的日志记录功能，包括所有通信消息
2. WHEN 开发模式启用时 THEN THE PoC_Page SHALL 显示调试面板和实时状态信息
3. THE PoC_Page SHALL 支持手动触发各种测试场景
4. WHEN 出现错误时 THEN THE PoC_Page SHALL 提供详细的错误堆栈和上下文信息
5. THE PoC_Page SHALL 支持导出测试结果和性能数据用于分析