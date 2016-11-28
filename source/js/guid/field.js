const Caret = require('./caret');

const KEYS = {
  "0" : 48,
  "9" : 57,
  "NUMPAD_0" : 96,
  "NUMPAD_9" : 105,
  "DELETE" : 46,
  "BACKSPACE" : 8,
  "ARROW_LEFT" : 37,
  "ARROW_RIGHT" : 39,
  "TAB" : 9
};

function getChar($event) {
  if ($event.which === null) {
    return $event.keyCode < 32 ? null : String.fromCharCode($event.keyCode);
  }

  if (($event.which !== 0) && ($event.charCode !== 0)) {
    return $event.which < 32 ? null : String.fromCharCode($event.which);
  }

  return null;
}

function keyIsCommand($event) {
  return $event.ctrlKey || $event.metaKey;
}

class Field {

  constructor(guid, element) {
    this.guid = guid;
    this.element = element;
    this.caret = new Caret(this);

    this.max = element.maxLength;
    this.zero = '0';
    this.mask = 'XXXXXXXX-XXXX-XXXX-XXXX-XXXXXXXXXXXX';

    this.element.addEventListener('keypress', this.onKeypress.bind(this));
    this.element.addEventListener('keydown', this.onKeydown.bind(this));
    this.element.addEventListener('cut', $event => $event.preventDefault());
    this.element.addEventListener('drop', $event => $event.preventDefault());
    this.element.addEventListener('dragstart', $event => $event.preventDefault());

    this.value = this.format('', this.mask);
  }

  get value() {
    return this.element.value;
  }

  set value(newValue) {
    this.element.value = newValue;
  }

  format(string) {
    let result = '';

    let stringIndex = 0;
    for (let i = 0; i < this.mask.length; i++) {
      const maskChar = this.mask.charAt(i);

      if (maskChar === 'X') {
        result += string.charAt(stringIndex) || this.zero;
        stringIndex += 1;
      } else {
        result += maskChar;
      }
    }

    return result;
  }

  removeChars(position) {
    const guidString = this.value.replace(/[^a-f\d]/gi, '');
    let value = '';

    if (position > 0) {
      value += this.zero.repeat(position);
      value += guidString.slice(position);
    } else {
      value += guidString.slice(0, -position);
      value += this.zero.repeat(this.mask.length + position);
    }

    this.value = this.format(value);
    return this;
  }

  insert(char, position) {
    const guidString = this.value.replace(/[^a-f\d]/gi, '');

    let value = guidString.slice(0, position);
    value += char.toLowerCase();
    value += guidString.slice(position + char.length);

    this.value = this.format(value, this.mask);
    return this;
  }

  onKeydown($event) {
    switch ($event.keyCode) {
      case KEYS['BACKSPACE']: {
        this.backspaceHandler($event);
        break;
      }
      case KEYS['DELETE']: {
        this.deleteHandler($event);
        break;
      }
      default: { break; }
    }
  }

  onKeypress($event) {
    $event.preventDefault();

    const char = getChar($event);
    if (!(char && this.isValidChar(char))) {
      return;
    }

    const normalizedPosition = this.caret.normalize();
    this.insert(char, normalizedPosition);
    this.guid.write();

    this.caret.position = Math.max(
      this.caret.denormalize(normalizedPosition + 1),
      this.caret.denormalize(normalizedPosition + 2) - 1
    );
  }

  isValidChar(char = '') {
    return /^[a-f\d]/i.test(char);
  }

  backspaceHandler($event) {
    $event.preventDefault();

    if (this.caret.isStart()) {
      return;
    }

    const normalizedPosition = this.caret.normalize();
    const denormalizedPosition = this.caret.denormalize(normalizedPosition);
    if (keyIsCommand($event)) {
      this.removeChars(normalizedPosition);
      this.guid.write();
      this.caret.position = 0;
      return;
    }

    this.insert(this.zero, normalizedPosition - 1);
    this.guid.write();
    this.caret.position = denormalizedPosition - 1;
  }

  deleteHandler($event) {
    $event.preventDefault();

    if (this.caret.isEnd()) {
      return;
    }

    const normalizedPosition = this.caret.normalize();
    const denormalizedPosition = this.caret.denormalize(normalizedPosition);
    if (keyIsCommand($event)) {
      this.removeChars(-normalizedPosition);
      this.guid.write();
      this.caret.position = this.mask.length;
      return;
    }

    this.insert(this.zero, normalizedPosition);
    this.guid.write();
    this.caret.position = denormalizedPosition + 1;
  }
}

module.exports = Field;
