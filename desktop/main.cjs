const { app, BrowserWindow, WebContentsView, ipcMain, session } = require('electron');
const path = require('node:path');
const scripts = require('./scripts.cjs');
const ORIGIN = 'https://www.oxfordlearnersdictionaries.com';
const INITIAL = `${ORIGIN}/definition/english/a_1`;
const smoke = process.argv.includes('--smoke-test');
const liveCheck = process.argv.includes('--live-check');
if (smoke || liveCheck) setTimeout(() => { console.error('Desktop check timed out'); app.exit(1); }, 60000).unref();

function isDictionaryPage(value) {
  try {
    const url = new URL(value);
    return url.origin === ORIGIN && (
      url.pathname.startsWith('/definition/english/') ||
      url.pathname.startsWith('/search/english/') || url.pathname === '/search/english'
    );
  } catch { return false; }
}

async function createWindow() {
  const win = new BrowserWindow({ width: 1280, height: 900, minWidth: 800, minHeight: 640,
    show: !smoke, title: 'Oxford Viewer',
    webPreferences: { preload: path.join(__dirname, 'shell-preload.cjs'),
      nodeIntegration: false, contextIsolation: true, sandbox: true },
  });
  win.setMenu(null);
  win.webContents.on('will-navigate', (event) => event.preventDefault());
  win.webContents.setWindowOpenHandler(() => ({ action: 'deny' }));
  // In-memory session: do not persist Oxford pages, cookies or audio to disk.
  const remoteSession = session.fromPartition('oxford-desktop', { cache: false });
  remoteSession.setPermissionRequestHandler((_contents, _permission, callback) => callback(false));
  remoteSession.setPermissionCheckHandler(() => false);
  if (smoke) require('./smoke.cjs').install(remoteSession);
  const makeView = () => new WebContentsView({ webPreferences: {
    session: remoteSession, preload: path.join(__dirname, 'preload.cjs'),
    nodeIntegration: false, contextIsolation: true, sandbox: true,
  } });
  const word = makeView();
  const definition = makeView();
  let ready = false;
  let letters = [];
  const states = { word: '', definition: '' };
  function report() {
    if (!win.isDestroyed()) win.webContents.send('status', {
      ready, letters, text: Object.values(states).filter(Boolean).join('；'),
    });
  }
  function layout() {
    const [width, height] = win.getContentSize();
    const left = Math.floor((width - 36) * .4);
    word.setBounds({ x: 0, y: 44, width: left, height: height - 44 });
    definition.setBounds({ x: left + 36, y: 44, width: width - left - 36, height: height - 44 });
  }
  for (const view of [word, definition]) win.contentView.addChildView(view);
  win.on('resize', layout);
  layout();
  const load = (contents, url) => contents.loadURL(url).catch(() => {}); // did-fail-load reports errors.
  const openDefinition = (url) => { if (isDictionaryPage(url)) load(definition.webContents, url); };

  for (const [name, view] of [['word', word], ['definition', definition]]) {
    const contents = view.webContents;
    const allowed = (url) => name === 'word' ? /^https?:/.test(url) : isDictionaryPage(url);
    for (const eventName of ['will-navigate', 'will-redirect']) {
      contents.on(eventName, (event, url) => {
        if (!allowed(url)) {
          event.preventDefault();
        }
      });
    }
    contents.setWindowOpenHandler(({ url }) => {
      if (name === 'word' && /^https?:/.test(url)) load(contents, url);
      else if (name === 'definition') openDefinition(url);
      return { action: 'deny' };
    });
    contents.on('did-start-navigation', (_event, _url, isInPlace, isMainFrame) => {
      // Background frames also emit did-start-loading, without a new main DOM.
      if (!isMainFrame || isInPlace) return;
      states[name] = '';
      if (name === 'word') ready = false;
      report();
    });
    contents.on('did-fail-load', (_event, code, _description, _url, isMainFrame) => {
      if (!isMainFrame || code === -3) return;
      states[name] = `${name === 'word' ? '词表' : '释义'}加载失败，请重新加载`;
      if (name === 'word') ready = false;
      report();
    });
    contents.on('dom-ready', async () => {
      if (!allowed(contents.getURL())) return;
      try {
        await contents.executeJavaScript(scripts.PRONUNCIATION_SCRIPT + (name === 'word'
          ? scripts.buildWordListBridgeScript()
          : scripts.SELECTION_LOOKUP_SCRIPT + scripts.EXPAND_SECTIONS_SCRIPT + scripts.buildDefinitionAutoScrollScript()));
        if (name === 'definition') states.definition = '';
      } catch {
        states[name] = '页面增强功能加载失败，请重新加载';
      }
      report();
    });
  }
  const onFilter = (event, data) => {
    if (event.sender !== word.webContents || event.senderFrame !== word.webContents.mainFrame ||
        typeof data !== 'string' || data.length > 1024) return;
    try {
      const result = JSON.parse(data);
      if (result.type === 'WORD_LIST_ENTRY') { openDefinition(result.url); return; }
      if (result.type !== 'WORD_LIST_STATE' || !Array.isArray(result.letters) ||
          !result.letters.every(letter => typeof letter === 'string' && /^[A-Z]$/.test(letter))) return;
      letters = result.letters;
      ready = letters.length > 0;
      states.word = '';
      report();
    } catch { /* Ignore malformed page messages. */ }
  };
  const fromShell = (event) => event.sender === win.webContents && event.senderFrame === win.webContents.mainFrame;
  const onLetter = (event, letter) => {
    if (fromShell(event) && ready && typeof letter === 'string' && letters.includes(letter)) {
      word.webContents.executeJavaScript(scripts.buildAlphabetScrollScript(letter, true)).catch(() => {});
    }
  };
  const onReload = (event) => {
    if (fromShell(event)) {
      load(word.webContents, scripts.OXFORD_WORD_LIST_URL);
      load(definition.webContents, isDictionaryPage(definition.webContents.getURL()) ? definition.webContents.getURL() : INITIAL);
    }
  };
  ipcMain.on('filter-result', onFilter);
  ipcMain.on('select-letter', onLetter);
  ipcMain.on('reload-pages', onReload);
  win.on('closed', () => {
    ipcMain.removeListener('filter-result', onFilter);
    ipcMain.removeListener('select-letter', onLetter);
    ipcMain.removeListener('reload-pages', onReload);
    for (const view of [word, definition]) view.webContents.close();
  });
  await win.loadFile(path.join(__dirname, 'index.html'));
  report();
  await Promise.all([load(word.webContents, scripts.OXFORD_WORD_LIST_URL), load(definition.webContents, INITIAL)]);
  return { win, word, definition };
}

app.whenReady().then(async () => {
  const views = await createWindow();
  if (smoke) {
    try { await require('./smoke.cjs').run(views); app.exit(0); }
    catch (error) { console.error(error); app.exit(1); }
  }
  if (liveCheck) {
    try { await require('./smoke.cjs').runLive(views); app.exit(0); }
    catch (error) { console.error(error); app.exit(1); }
  }
}).catch((error) => { console.error(error); app.exit(1); });
app.on('window-all-closed', () => app.quit());
