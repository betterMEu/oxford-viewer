const assert = require('node:assert/strict');
const { setTimeout: delay } = require('node:timers/promises');
const ORIGIN = 'https://www.oxfordlearnersdictionaries.com';

exports.install = (session) => {
  session.protocol.handle('https', (request) => {
    const url = new URL(request.url);
    if (url.pathname === '/search/english/') {
      return new Response(null, { status: 302,
        headers: { location: `${ORIGIN}/search/english/direct/${url.search}` } });
    }
    if (url.pathname === '/search/english/direct/') {
      return new Response(null, { status: 302,
        headers: { location: `${ORIGIN}/definition/english/${url.searchParams.get('q')}` } });
    }
    const isList = url.pathname.startsWith('/wordlists/');
    const body = isList
      ? `<a id="outside" href="${ORIGIN}/definition/english/outside">Outside</a><select id="filterList"><option value="ox3000">Oxford 3000</option><option value="ox5000">Oxford 5000</option></select><div id="wordlistsContentPanel"><ul style="height:400px;overflow:auto"><li data-hw="apple" data-ox3000 data-ox5000><a href="${ORIGIN}/definition/english/apple">apple</a></li>
          <li data-hw="extra" style="display:none">extra</li><li style="margin-top:1600px" data-hw="banana" data-ox5000>banana</li></ul></div>`
      : '<form action="/search/english/"><input name="q"><button>Search</button></form><div style="height:1000px">Header</div><main id="entryContent">Definition</main>';
    return new Response(`<!doctype html><html><head><title>Fixture</title></head><body>${body}<div style="height:1600px"></div></body></html>`,
      { headers: { 'content-type': 'text/html; charset=utf-8' } });
  });
};

exports.run = async ({ win, word, definition }) => {
  async function until(check) {
    for (let attempt = 0; attempt < 100; attempt++) {
      if (await check()) return;
      await delay(50);
    }
    throw new Error('Timed out waiting for desktop behavior');
  }
  const query = (view, code) => view.webContents.executeJavaScript(code);
  await until(() => win.webContents.executeJavaScript("!document.querySelector('nav button').disabled"));
  // Oxford starts background frame loads after the main document is ready.
  // Those loads must not disable an already usable alphabet index.
  const backgroundLoad = new Promise((resolve) => word.webContents.once('did-start-loading', resolve));
  await query(word, `(() => {
    const frame = document.createElement('iframe');
    frame.src = '${ORIGIN}/background-frame';
    document.body.append(frame);
  })()`);
  await backgroundLoad;
  await delay(100);
  assert.equal(await win.webContents.executeJavaScript("document.querySelector('nav button').disabled"), false,
    'Background frame loading must leave the alphabet enabled');
  assert.equal(await win.webContents.executeJavaScript("document.querySelector('#status').textContent"), '',
    'Normal background activity must not show a loading status');
  assert.equal(await query(word, "getComputedStyle(document.querySelector('[data-hw=extra]')).display"), 'none');
  assert.notEqual(await query(word, "getComputedStyle(document.querySelector('[data-hw=banana]')).display"), 'none');
  assert.equal(await query(word, "typeof require"), 'undefined');
  assert.equal(await query(word, "typeof window.desktop"), 'undefined');
  await win.webContents.executeJavaScript("document.querySelectorAll('nav button')[1].click()");
  await until(async () => (await query(word, "document.querySelector('ul').scrollTop")) > 1000);
  const before = await query(word, "document.querySelector('ul').scrollTop");
  await query(word, "document.querySelector('#wordlistsContentPanel a').click()");
  await until(() => definition.webContents.getURL().endsWith('/apple'));
  await until(async () => (await query(definition, 'scrollY')) >= 1000);
  assert.equal(await query(word, "document.querySelector('ul').scrollTop"), before);
  assert.ok(word.webContents.getURL().includes('/wordlists/'));
  await query(definition, "location.href='https://example.com/'");
  await delay(150);
  assert.equal(definition.webContents.getURL(), `${ORIGIN}/definition/english/apple`);
  await query(definition, "document.querySelector('[name=q]').value='orange'; document.querySelector('form').requestSubmit()");
  await until(() => definition.webContents.getURL().endsWith('/orange'));
  await until(async () => (await query(definition, 'scrollY')) >= 1000);
  await query(definition, `window.open('${ORIGIN}/search/english/?q=banana', '_blank'); true;`);
  await until(() => definition.webContents.getURL().endsWith('/banana'));
  win.setContentSize(1000, 720);
  await delay(100);
  assert.equal(word.getBounds().width + definition.getBounds().width + 36, 1000);
  assert.equal(await win.webContents.executeJavaScript("document.querySelectorAll('nav button')[23].disabled"), true);
  await query(word, `document.querySelector('[data-hw=banana]').style.display = 'none';`);
  await until(() => win.webContents.executeJavaScript("document.querySelectorAll('nav button')[1].disabled"));
  await query(word, `document.querySelector('[data-hw=banana]').style.display = ''; document.querySelector('#filterList').value = 'ox5000'; document.querySelector('#filterList').dispatchEvent(new Event('change', { bubbles: true }));`);
  await until(() => win.webContents.executeJavaScript("!document.querySelectorAll('nav button')[1].disabled"));
  assert.equal(await query(word, "document.querySelector('#filterList').value"), 'ox5000');
  const rightBefore = definition.webContents.getURL();
  await query(word, "document.querySelector('#outside').click()");
  await until(() => word.webContents.getURL().endsWith('/outside'));
  assert.equal(definition.webContents.getURL(), rightBefore);
  await until(() => win.webContents.executeJavaScript("document.querySelectorAll('nav button')[1].disabled"));
  await word.webContents.loadURL(`${ORIGIN}/wordlists/oxford3000-5000`);
  await until(() => win.webContents.executeJavaScript("!document.querySelectorAll('nav button')[1].disabled"));
  console.log('Desktop smoke passed: filtering, IPC, alphabet, navigation, scroll, isolation, resize.');
};

// Opt-in network check; the deterministic smoke test above stays offline.
exports.runLive = async ({ win, word, definition }) => {
  const { mkdirSync, writeFileSync } = require('node:fs');
  const path = require('node:path');
  await delay(3000);
  const list = await word.webContents.executeJavaScript(`({
    title: document.title,
    filtered: document.documentElement.dataset.oxfordViewerList,
    words: document.querySelectorAll('li[data-hw][data-ox5000]').length,
    audioButtons: document.querySelectorAll('.audio_play_button').length
  })`);
  const entry = await definition.webContents.executeJavaScript(`({
    title: document.title, entry: !!document.querySelector('#entryContent'),
    audioButtons: document.querySelectorAll('.audio_play_button').length,
    scrollY: scrollY
  })`);
  console.log(JSON.stringify({ list, entry }, null, 2));
  const output = path.join(__dirname, '../desktop-qa');
  mkdirSync(output, { recursive: true });
  for (const [name, view] of [['word-list', word], ['definition', definition]]) {
    try {
      writeFileSync(path.join(output, `${name}.png`), (await view.webContents.capturePage()).toPNG());
    } catch {
      console.log(`Screenshot unavailable for ${name}; DOM checks continue.`);
    }
  }
  assert.ok(list.words > 0);
  assert.equal(entry.entry, true);
  await win.webContents.executeJavaScript("document.querySelectorAll('nav button')[1].click()");
  await delay(500);
  const target = await word.webContents.executeJavaScript(`(() => {
    const item = [...document.querySelectorAll('li[data-hw][data-ox5000]')]
      .find(item => item.dataset.hw.toUpperCase().startsWith('B') && getComputedStyle(item).display !== 'none');
    const rect = item.getBoundingClientRect();
    return { top: rect.top, bottom: rect.bottom, height: innerHeight };
  })()`);
  assert.ok(target.top >= -1 && target.bottom <= target.height, JSON.stringify(target));
  await delay(10000);
  assert.equal(await win.webContents.executeJavaScript("document.querySelector('nav button').disabled"), false,
    'The alphabet must remain enabled after delayed page activity');
  assert.equal(await win.webContents.executeJavaScript("document.querySelector('#status').textContent"), '');
  async function waitForEntry(wordText) {
    for (let attempt = 0; attempt < 200; attempt++) {
      if (definition.webContents.getURL().includes(`/definition/english/${wordText}`) &&
          !definition.webContents.isLoadingMainFrame()) {
        const heading = await definition.webContents.executeJavaScript("document.querySelector('#entryContent h1')?.textContent || ''");
        if (heading.trim().toLowerCase() === wordText) return;
      }
      await delay(50);
    }
    throw new Error(`Oxford lookup did not reach ${wordText}: ${JSON.stringify(await definition.webContents.executeJavaScript("({path: location.pathname, heading: document.querySelector('#entryContent h1')?.textContent, title: document.title, state: document.readyState})"))}`);
  }
  await definition.webContents.executeJavaScript(`(() => {
    const form = [...document.forms].find(form => form.action.includes('/search/english'));
    form.querySelector('[name=q]').value = 'orange';
    form.requestSubmit();
  })()`);
  await waitForEntry('orange');
  // Exercise Oxford's selection handler and its generated search form.
  await definition.webContents.executeJavaScript(`(() => {
    const text = document.createElement('span');
    text.textContent = 'banana';
    document.querySelector('#main-container').append(text);
    const range = document.createRange();
    range.selectNodeContents(text);
    getSelection().removeAllRanges();
    getSelection().addRange(range);
    text.dispatchEvent(new MouseEvent('dblclick', { bubbles: true, button: 0 }));
  })()`);
  await waitForEntry('banana');
  console.log('Live search and selection lookup passed.');
  console.log('Live Oxford check passed, including nested alphabet scrolling.');
};
