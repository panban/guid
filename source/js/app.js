require('./polyfill');
const Guid = require('./guid');

const container = document.querySelector('.guid');
const guid = new Guid(container);

const textareaEl = document.querySelector('.guid-input');
const applyBtn = document.querySelector('.apply-guid');

applyBtn.addEventListener('click', () => {
  const value = textareaEl.value;
  guid.read(value);
});