# Oxford Viewer

Oxford Viewer 是一个仅供个人 iPhone 使用的 Oxford 学习客户端。本项目当前处于第一阶段：左侧显示测试单词，右侧通过 WebView 打开对应的 Oxford Learner's Dictionaries 页面。

应用支持横屏和竖屏，横屏是主要学习布局。

## 技术栈

- Expo
- React Native
- TypeScript
- `react-native-webview`

## Windows + iPhone + Expo Go 运行

### 准备工作

1. 在 Windows 安装 Node.js 和 npm。
2. 在 iPhone 从 App Store 安装 Expo Go。
3. 让 Windows 电脑与 iPhone 连接同一个局域网。
4. 确保 Windows 防火墙允许 Node.js/Expo 使用专用网络。

### 安装与启动

在 PowerShell 中进入项目目录：

```powershell
cd C:\path\to\oxford-viewer
npm install
npx expo start
```

终端和浏览器中的 Expo 开发工具会显示二维码。用 iPhone 相机或 Expo Go 扫描二维码，然后在 Expo Go 中打开项目。

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
│   ├── WordList.tsx
│   ├── WordRow.tsx
│   └── DictionaryWebView.tsx
├── data/
│   └── words.ts
├── types/
│   └── word.ts
└── services/
```

## 第一阶段行为

- 应用默认显示第一个测试单词的 Oxford 页面。
- 应用支持横屏和竖屏，横屏提供主要的左右分栏学习布局。
- 点击单词会切换右侧 WebView 页面。
- UK 和 US 按钮在第一阶段保持可见，但处于禁用状态。
- WebView 加载时显示简短提示，加载失败时显示简短错误提示。
- 单词数据只保存 `word` 和 `oxfordUrl`。
- Oxford 页面由设备直接加载；应用不抓取、不解析、不保存网页内容。

## 当前未实现

- Oxford 真人发音
- Oxford 音频按钮 DOM 识别
- 搜索
- 收藏
- 数据库
- 系统 TTS
