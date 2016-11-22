const Field = require('./field');

class Guid {

  constructor(container) {
    this.container = container;

    let inputEls = container.querySelectorAll('input');
    inputEls = Array.from(inputEls);

    this.fields = inputEls.map(p => new Field(this, p));

    this.container.addEventListener('focus', this.onFocus.bind(this), true);
    this.container.addEventListener('blur', this.onBlur.bind(this), true);
  }

  get active() {
    return this.fields[this.activeIndex];
  }

  onFocus($event) {
    const element = $event.target;
    this.activeIndex = this.fields.findIndex(p => p.element === element);
  }

  onBlur() {
    this.activeIndex = null;
  }

  hasNextField() {
    const hasNext = !!this.fields[this.activeIndex + 1];
    return hasNext;
  }

  hasPrevField() {
    const hasPrev = !!this.fields[this.activeIndex - 1];
    return hasPrev;
  }

  nextField() {
    if (this.activeIndex === null) {
      return null;
    }

    const nextIndex = this.activeIndex + 1;
    const next = this.fields[nextIndex];
    if (!next) {
      return null;
    }

    this.activeIndex = nextIndex;
    next.focus();
    return next;
  }

  prevField() {
    if (this.activeIndex === null) {
      return null;
    }

    const prevIndex = this.activeIndex - 1;
    const prev = this.fields[prevIndex];
    if (!prev) {
      return null;
    }

    this.activeIndex = prevIndex;
    prev.focus();
    return prev;
  }

  read(source = '', startField, startIndex = 0) {
    // todo: make angular check
    if (typeof source !== 'string') {
      return;
    }

    const integer = source.replace(/[^a-f\d]/gi, '');
    if (!integer.length) {
      return;
    }

    let index = this.fields.indexOf(startField);
    index = index !== -1 ? index : 0;

    let field = this.fields[index];
    let max = field.max - startIndex;

    let value = integer.substr(0, max);
    field.insert(value, startIndex);

    let start = max;
    while(true) {
      index += 1;
      field = this.fields[index];
      if (!field) {
        break;
      }

      value = integer.substr(start, field.max);
      if (!value.length) {
        break;
      }

      field.insert(value, 0);
      start += field.max;
    }
  }

  write() {
    let value = this.fields.reduce((string, item) => {
      const separator = string ? '-' : '';
      return string + separator + item.value;
    }, '');
    value = `{${value}}`;

    const el = document.querySelector('.guid-value');
    el.textContent = value;
  }
}

module.exports = Guid;
