const nav = document.querySelector('nav');
for (const letter of 'ABCDEFGHIJKLMNOPQRSTUVWXYZ') {
  const button = document.createElement('button');
  button.textContent = letter;
  button.disabled = true;
  button.setAttribute('aria-label', `定位到 ${letter}`);
  button.addEventListener('click', () => window.desktop.selectLetter(letter));
  nav.append(button);
}
document.querySelector('#reload').addEventListener('click', () => window.desktop.reload());
window.desktop.onStatus(({ text, ready, letters }) => {
  document.querySelector('#status').textContent = text;
  for (const button of nav.children) button.disabled = !ready || !letters.includes(button.textContent);
});
