# Oxford Viewer

Oxford Viewer 是一个供个人使用的 Oxford 学习客户端，包含 Expo 手机端和 Electron Windows 桌面端。应用使用左右双网页布局：左侧直接显示 Oxford 官方核心词表页面，保留官网原生词库和筛选功能，右侧显示当前选中词条的 Oxford Learner's Dictionaries 释义页面。

应用支持横屏和竖屏，横屏是主要学习布局。

## 当前功能

- 左侧词库由官网原生选项控制，应用不强制默认词库。
- 官网负责筛选词条；应用观察当前可见词条，更新字母目录。
- 左侧词条保留 Oxford 网页原生样式以及原生 UK/US 真人发音按钮。
- 两个 WebView 中间提供原生 A–Z 竖向字母索引；点击字母会将左侧词表定位到该字母的第一个可见单词；没有可见词条的字母自动禁用。
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

### Windows 桌面端（Electron）

安装依赖后，在 PowerShell 中运行：

```powershell
npm install
npm run desktop
```

桌面端使用两个 `WebContentsView`，复用 `src/` 中的词表过滤、字母定位、释义自动滚动、发音、划词和展开脚本。左侧词条链接交给右侧打开，A–Z 索引在词表就绪后启用（无对应词条的字母禁用），后台子页面加载不会禁用索引。窗口支持缩放；顶部提供错误提示和重新加载按钮，正常加载不显示状态文字。

右栏允许 Oxford 官方英语释义和 `/search/english/` 搜索页面，支持原生搜索框及选词查询经搜索入口跳转到释义；这些页面请求打开新窗口时仍在右栏显示。

```powershell
npm run desktop:test     # 隐藏窗口，使用本地页面夹具检查实际 Electron 交互
npm run desktop:check-live # 联网检查官网 DOM 和字母定位，短暂打开窗口并保存截图
npm run desktop:package  # 生成 Windows x64 便携应用目录
```

输出入口为 `dist/packages/OxfordViewer-win32-x64/OxfordViewer.exe`。分发时需要包含整个目录，可将其压缩为 ZIP；此阶段未配置安装向导、代码签名或自动更新。首次启动或打包可能需要下载 Electron 运行时。

`desktop/` 保存桌面外壳、通信和构建代码，`dist/desktop/` 为可重建产物。手机端仍使用原有 Expo 入口，不依赖 Electron。远程页面禁用 Node.js，启用上下文隔离和沙箱，仅暴露词表状态和词条点击消息；页面会话存于内存，禁用磁盘 HTTP 缓存。

`desktop:test` 不访问 Oxford 官网；`desktop:check-live` 会联网检查并将截图写到 `dist/desktop-qa/`，仅供本地验收，不纳入 Git 或应用包。UK/US 音频的实际听感和划词查询仍需人工验收，网站 DOM 变化可能影响共享脚本。

```text
src/
├── components/
│   ├── OxfordWordListWebView.tsx
│   └── DictionaryWebView.tsx
├── word-lists/
│   ├── coreWordLists.ts
│   └── buildWordListBridgeScript.ts
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
- 仅单词列表内的释义链接交给右侧 WebView，其他区域的链接保留左侧原生导航。
- 左侧音频和其他非顶层资源请求继续放行。
- 左侧离开词表时禁用字母目录，返回或重新加载词表后自动恢复。
- 切换词库和 CEFR 筛选后，根据实际可见词条更新字母目录。
- 字母定位只读取可见 `#wordlistsContentPanel li[data-hw]` 的 `data-hw`，不向 React Native 返回词表内容。
- 释义自动定位使用 `#entryContent` 的实时文档坐标，不使用固定像素距离。

## 限制与风险

- 不提供搜索、收藏、数据库、登录、学习进度或系统 TTS。
- 不下载、缓存或提取 Oxford 音频。
- 词表过滤、字母定位、释义定位和导航依赖 Oxford 当前的 URL、`data-*` 属性与 DOM；Oxford 官网结构变化可能导致这些功能失效。
- iPhone 上的 Expo Go、Oxford 原生发音和横竖屏交互仍需真机验收。
