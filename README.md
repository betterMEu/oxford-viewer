# Oxford Viewer

Oxford Viewer 是一个仅供个人 iPhone 使用的 Oxford 学习客户端。应用使用左右双 WebView 布局：左侧直接显示 Oxford 官方核心词表页面并固定为 Oxford 3000，右侧显示当前选中词条的 Oxford Learner's Dictionaries 释义页面。

应用支持横屏和竖屏，横屏是主要学习布局。

## 当前功能

- 左侧固定显示 `Oxford 3000`，不提供词库切换按钮。
- 应用通过页面已有的 `data-ox3000` 属性控制词条可见性。
- 左侧词条保留 Oxford 网页原生样式以及原生 UK/US 真人发音按钮。
- 点击左侧词条时，左侧词表和滚动位置保持不变，仅由右侧 WebView 打开对应释义页面。
- 右侧释义页加载时不显示额外动效或遮罩，加载失败时显示简短错误提示。
- 应用不保存 Oxford 词表、释义、网页内容、音频或音频 URL。

## 技术栈

- Expo SDK 54
- React Native
- TypeScript
- `react-native-webview`

## Windows + iPhone + Expo Go 运行

### 准备工作

1. 在 Windows 安装 Node.js 和 npm。
2. 在 iPhone 上从 App Store 安装最新版 Expo Go。
3. 让 Windows 电脑与 iPhone 连接同一局域网。
4. 确保 Windows 防火墙允许 Node.js/Expo 使用专用网络。

### 安装与启动

在 PowerShell 中进入项目目录：

```powershell
cd C:\path\to\oxford-viewer
npm install
npx expo start
```

终端和 Expo 开发工具会显示二维码。用 iPhone 相机或 Expo Go 扫描二维码，然后在 Expo Go 中打开项目。

如果同一局域网内无法连接，可以尝试隧道模式：

```powershell
npx expo start --tunnel
```

首次使用隧道模式时，Expo 可能提示安装隧道依赖。

### 常用命令

```powershell
npm start
npm test
npm run typecheck
npm run doctor
```

## 项目结构

```text
src/
├── components/
│   ├── OxfordWordListWebView.tsx
│   └── DictionaryWebView.tsx
├── word-lists/
│   ├── coreWordLists.ts
│   └── buildWordListFilterScript.ts
└── services/
```

## 导航与过滤规则

- 左侧只允许 Oxford 官方词表 URL 保留在顶层 WebView。
- Oxford `/definition/english/` 顶层链接会被拦截并交给右侧 WebView。
- 左侧音频和其他非顶层资源请求继续放行。
- 其他顶层导航会被阻止，避免左侧离开词表页面。
- Oxford 3000：显示带 `data-ox3000` 的词条。

## 限制与风险

- 不提供搜索、收藏、数据库、登录、学习进度或系统 TTS。
- 不下载、缓存或提取 Oxford 音频。
- 词表过滤和导航依赖 Oxford 当前的 URL 与数据属性；Oxford 官网结构变化可能导致这些功能失效。
- iPhone 上的 Expo Go、Oxford 原生发音和横竖屏交互仍需真机验收。
