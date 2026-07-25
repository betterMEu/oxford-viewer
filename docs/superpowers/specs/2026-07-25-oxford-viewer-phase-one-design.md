# Oxford Viewer 第一阶段设计

## 目标

创建一个仅供个人 iPhone 使用的 Oxford 学习客户端基础框架。应用使用 Expo、React Native、TypeScript 和 `react-native-webview`，提供单词列表与 Oxford Learner's Dictionaries 网页的左右分栏浏览体验。

## 范围

第一阶段只实现：

- Expo TypeScript 工程；
- 5 个测试单词；
- 左侧单词列表与 UK、US 按钮；
- 右侧 Oxford 页面 WebView；
- 点击单词后切换当前 Oxford 页面；
- Windows、iPhone、Expo Go 运行文档；
- Oxford 音频 DOM 的空白记录文档。

第一阶段不实现：

- Oxford 真人发音；
- 音频选择器或 DOM 推测；
- 搜索、收藏、数据库；
- 系统 TTS；
- Oxford 释义、音频或网页内容的保存和抓取；
- 其他导航页面或附加功能。

## 技术方案

使用 Expo `blank-typescript` 模板建立单屏应用。`App.tsx` 持有当前选中单词状态，首个测试单词为初始值。根布局使用横向 Flexbox，左侧约 40%，右侧约 60%。

选择单词时，`WordList` 将对应 `Word` 传回 `App.tsx`，随后 `DictionaryWebView` 使用该对象的 `oxfordUrl` 导航。WebView 不注入 JavaScript、不读取 DOM、不拦截或保存网页内容。

UK 和 US 按钮保持可点击，并使用明确的空回调。按钮不会改变应用状态、触发音频、调用系统 TTS 或猜测 Oxford 页面结构。

## 文件职责

- `App.tsx`：组合左右分栏并管理当前选中单词。
- `src/types/word.ts`：定义仅含 `word` 与 `oxfordUrl` 的 `Word` 类型。
- `src/data/words.ts`：导出 5 个测试单词。
- `src/components/WordList.tsx`：渲染单词列表并上报选中项。
- `src/components/WordRow.tsx`：渲染单词和可点击的 UK、US 空操作按钮。
- `src/components/DictionaryWebView.tsx`：根据当前单词加载 Oxford 页面。
- `src/services/.gitkeep`：保留暂未使用的服务目录。
- `docs/oxford-audio-dom.md`：以后人工记录 Oxford 真人发音按钮 DOM，当前不写选择器。
- `README.md`：说明 Windows 与 iPhone 通过 Expo Go 运行项目的步骤。

## 数据约束

`Word` 的唯一字段为：

```ts
type Word = {
  word: string;
  oxfordUrl: string;
};
```

不得向单词数据添加释义、音频 URL、音标、收藏状态或其他元数据。

## 错误与边界

- 测试数据固定为 5 个有效 Oxford HTTPS URL，因此第一阶段不增加数据校验或错误恢复层。
- WebView 的网络加载结果由网页和设备网络决定；第一阶段不增加自定义错误页面。
- 列表由 `FlatList` 渲染，并为当前条目提供选中态。

## 验证

- 通过测试验证数据恰好有 5 项且每项只有允许字段。
- 通过组件测试验证点击单词会回调对应数据。
- 通过组件测试验证 UK、US 按钮可点击但不触发选词。
- 运行 TypeScript：`npx tsc --noEmit`。
- 运行 Expo 项目检查：`npx expo-doctor`。

