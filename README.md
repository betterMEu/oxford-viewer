# Oxford Viewer

Oxford Viewer 是一个仅供个人 iPhone 使用的 Oxford 学习客户端。应用使用左右双 WebView 布局：左侧直接显示 Oxford 官方核心词表页面并固定为 Oxford 3000，右侧显示当前选中词条的 Oxford Learner's Dictionaries 释义页面。

应用支持横屏和竖屏，横屏是主要学习布局。

## 当前功能

- 左侧固定显示 `Oxford 3000`，不提供词库切换按钮。
- 应用通过页面已有的 `data-ox3000` 属性控制词条可见性。
- 左侧词条保留 Oxford 网页原生样式以及原生 UK/US 真人发音按钮。
- 两个 WebView 中间提供原生 A–Z 竖向字母索引；点击字母会将左侧词表定位到该字母的第一个 Oxford 3000 单词。当前 Oxford 3000 没有 X 词条，因此 X 可见但禁用。
- 点击左侧词条时，左侧词表和滚动位置保持不变，仅由右侧 WebView 打开对应释义页面。
- 右侧释义页加载成功后，会按当前 DOM 位置自动滚动到 `#entryContent`，跳过 Oxford 页头并保留词条标题、音标和原生发音。
- 右侧释义页加载时不显示额外动效或遮罩，加载失败时显示简短错误提示。
- 应用不保存 Oxford 词表、释义、网页内容、音频或音频 URL。

## 开发环境与版本

以下开发工具版本是升级至 SDK 57 时在 Windows 上安装和检查使用的版本，不代表项目声明的最低版本。iPhone 真机运行仍需验收：

| 工具 | 已验证版本 |
| --- | --- |
| Node.js | 24.16.0 |
| npm | 11.13.0 |
| Expo CLI | 57.0.22（通过 `npx expo` 使用） |
| Expo Go | 需支持 Expo SDK 57（尚未真机验证） |

项目的核心运行依赖：

| 工具库 | `package.json` 版本 | 本次安装版本 |
| --- | --- | --- |
| Expo | `~57.0.20` | 57.0.20 |
| React | `19.2.3` | 19.2.3 |
| React Native | `0.86.3` | 0.86.3 |
| React Native WebView | `13.16.1` | 13.16.1 |
| React Native Safe Area Context | `~5.7.0` | 5.7.0 |
| Expo Status Bar | `~57.0.1` | 57.0.1 |

主要开发与测试依赖：

| 工具库 | `package.json` 版本 | 本次安装版本 |
| --- | --- | --- |
| TypeScript | `~6.0.3` | 6.0.3 |
| Jest | `^29.7.0` | 29.7.0 |
| Jest Expo | `~57.0.5` | 57.0.5 |
| Testing Library for React Native | `13.3.3` | 13.3.3 |
| React Test Renderer | `19.2.3` | 19.2.3 |

## Windows + iPhone + Expo Go 运行

### 准备工作

1. 在 Windows 安装 Node.js 和 npm。
2. 在 iOS 16.4 或更高版本的 iPhone 上安装支持 Expo SDK 57 的 Expo Go；版本对应关系见 [Expo Go 下载页面](https://expo.dev/go)。
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
├── plugins/
│   ├── alphabet-index/
│   │   ├── AlphabetIndexPlugin.tsx
│   │   └── buildAlphabetScrollScript.ts
│   └── definition-auto-scroll/
│       └── buildDefinitionAutoScrollScript.ts
└── services/
```

## 导航与过滤规则

- 左侧只允许 Oxford 官方词表 URL 保留在顶层 WebView。
- Oxford `/definition/english/` 顶层链接会被拦截并交给右侧 WebView。
- 左侧音频和其他非顶层资源请求继续放行。
- 其他顶层导航会被阻止，避免左侧离开词表页面。
- Oxford 3000：显示带 `data-ox3000` 的词条。
- 字母定位只读取可见 `li[data-hw][data-ox3000]` 的 `data-hw`，不向 React Native 返回词表内容。
- 释义自动定位使用 `#entryContent` 的实时文档坐标，不使用固定像素距离。

## 限制与风险

- 不提供搜索、收藏、数据库、登录、学习进度或系统 TTS。
- 不下载、缓存或提取 Oxford 音频。
- 词表过滤、字母定位、释义定位和导航依赖 Oxford 当前的 URL、`data-*` 属性与 DOM；Oxford 官网结构变化可能导致这些功能失效。
- iPhone 上的 Expo Go、Oxford 原生发音和横竖屏交互仍需真机验收。
