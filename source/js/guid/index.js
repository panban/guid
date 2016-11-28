const Field = require('./field');

class Guid {

  constructor(container) {
    this.container = container;

    const element = this.container.querySelector('input');
    this.field = new Field(this, element);
  }

  read(source = '', position = 0) {
    // todo: make angular check
    if (typeof source !== 'string') {
      return;
    }

    const guidString = source.replace(/[^a-f\d]/gi, '');
    if (!guidString.length) {
      return;
    }

    this.field.insert(guidString, position);
  }

  write() {
    const value = `{${this.field.value}}`;

    const el = document.querySelector('.guid-value');
    el.textContent = value;
  }
}

module.exports = Guid;
