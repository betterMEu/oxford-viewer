# Oxford Viewer

供个人使用的双栏词典工具：左侧浏览 Oxford 词表，右侧查看所选单词的释义。使用时需要联网访问 Oxford Learner’s Dictionaries。

## Windows 使用

安装 Node.js（本项目使用 Node.js 24 开发），在项目目录打开 PowerShell：

```powershell
npm install
npm run desktop
```

### 操作方式

- 在左侧选择词库和筛选条件。
- 点击单词，在右侧查看释义，左侧保留当前位置。
- 点击中间的 A–Z 字母，定位到当前词表中对应字母的单词；灰色字母表示没有对应词条。
- 点击 UK / US 发音按钮播放音频。
- 在右侧使用搜索框或双击选词查询，点击释义中的栏目标题展开或收起内容。
- 页面加载失败时，点击顶部“重新加载”。

### 生成本地应用

```powershell
npm run desktop:package
```

完成后运行 `dist/packages/OxfordViewer-win32-x64/OxfordViewer.exe`。移动应用时请保留整个 `OxfordViewer-win32-x64` 文件夹。

## iPhone 本地使用

1. 安装支持 Expo SDK 57 的 Expo Go。
2. 让 iPhone 与电脑连接同一局域网，并允许 Node.js 通过 Windows 防火墙访问专用网络。
3. 在项目目录运行：

```powershell
npm install
npm start
```

使用 iPhone 相机扫描终端中的二维码，在 Expo Go 中打开。支持横屏和竖屏，建议横屏使用。

局域网连接失败时可尝试：

```powershell
npx expo start --tunnel
```

首次使用隧道模式可能需要按终端提示安装依赖。iPhone 端仍需真机验证；官网页面变化也可能影响查询、定位和发音功能。
