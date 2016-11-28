// const Field = require('./field');

function getChar($event) {
  if ($event.which === null) {
    return $event.keyCode < 32 ? null : String.fromCharCode($event.keyCode);
  }

  if (($event.which !== 0) && ($event.charCode !== 0)) {
    return $event.which < 32 ? null : String.fromCharCode($event.which);
  }

  return null;
}

class Guid {

  constructor(container) {
    this.container = container;
    this.element = this.container.querySelector('input');

    this.element.addEventListener('keydown', this.onKeydown.bind(this));
    this.element.addEventListener('keypress', this.onKeypress.bind(this));

    this.mask = 'XXX-XXX-XXX';
    this.value = this.formatStringByMask('', this.mask);
    // this.container.addEventListener('focus', this.onFocus.bind(this), true);
    // this.container.addEventListener('blur', this.onBlur.bind(this), true);
  }

  get value() {
    return this.element.value;
  }

  set value(newValue) {
    this.element.value = newValue;
  }

  onKeypress($event) {
    $event.preventDefault();

    const char = getChar($event);
    if (!(char && this.isValidChar(char))) {
      return;
    }

    const normalizedPosition = this.normalizePosition();
    this.insert(char, normalizedPosition);

    const position = Math.max(
      this.denormalizePosition(normalizedPosition + 1),
      this.denormalizePosition(normalizedPosition + 2) - 1
    );

    this.element.setSelectionRange(position, position);
  }

  onKeydown($event) {}

  insert(char, position) {
    const guidString = this.value.replace(/[^a-f\d]/gi, '');

    let value = guidString.slice(0, position);
    value += char.toLowerCase();
    value += guidString.slice(position + char.length);

    this.value = this.formatStringByMask(value, this.mask);
    return this;
  }

  normalizePosition() {
    const position = this.element.selectionStart;
    if (position < 0 || position > this.mask.length) {
      return 0;
    }

    let result = 0;
    for (let i = 0; i < this.mask.length; i++) {
      if(position === i) {
        return result;
      }

      if(this.mask[i] === "X") {
        result += 1;
      }
    }

    return result;
  }

  denormalizePosition(position) {
    let result = 0;

    if (position < 0 || position > this.mask.length) {
      return 0;
    }

    for (let i = 0; i < this.mask.length; i++) {
      if (result === position) {
        return i;
      }

      if (this.mask[i] === "X") {
        result += 1;
      }
    }

    return this.mask.length;
  }

  isValidChar(char = '') {
    return /^[a-f\d]/i.test(char);
  }

  formatStringByMask(string, mask) {
    let result = '';

    let stringIndex = 0;
    for (let i = 0; i < mask.length; i++) {
      const maskChar = mask.charAt(i);

      if (maskChar === 'X') {
        result += string.charAt(stringIndex) || '0';
        stringIndex += 1;
      } else {
        result += maskChar;
      }
    }

    return result;
  }

  onFocus($event) {
    const element = $event.target;
    this.activeIndex = this.fields.findIndex(p => p.element === element);
  }

  onBlur() {
    this.activeIndex = null;
  }

  read(source = '', startField, startIndex = 0) {
    return 'todo read';
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
    return 'todo write';
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
