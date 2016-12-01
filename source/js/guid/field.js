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

function isCommandKey($event) {
  return $event.ctrlKey || $event.metaKey;
}

function isGuidChar(char = '') {
  return /^[a-f\d]/i.test(char);
}

class Field {

  constructor(guid, element) {
    this.guid = guid;
    this.element = element;
    this.caret = new Caret(this);

    this.mask = 'XXXXXXXX-XXXX-XXXX-XXXX-XXXXXXXXXXXX';
    this.element.maxLength = this.mask.length;

    this.element.addEventListener('keypress', this.onKeypress.bind(this));
    this.element.addEventListener('keydown', this.onKeydown.bind(this));
    this.element.addEventListener('cut', $event => $event.preventDefault());
    this.element.addEventListener('drop', $event => $event.preventDefault());
    this.element.addEventListener('dragstart', $event => $event.preventDefault());
  }

  get value() {
    return this.element.value;
  }

  set value(newValue) {
    this.element.value = newValue;
  }

  insert(char, start, end) {
    const guid = this.guid.parseGuid(this.value);

    let value = guid.slice(0, start);
    value += char.toLowerCase();
    value += guid.slice(end);

    this.value = this.format(value);
  }

  remove(start, end) {
    const guid = this.guid.parseGuid(this.value);

    let value = guid.slice(0, start);
    value += guid.slice(end);

    this.value = this.format(value);
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
    const char = getChar($event);
    if (!(char && isGuidChar(char))) {
      $event.preventDefault();
      return;
    }

    const isFull = (this.value.length + 1) > this.mask.length;
    if (isFull && this.caret.collapse) {
      $event.preventDefault();
      return;
    }

    const normalizedStart = this.caret.normalize(this.caret.start);
    const normalizedEnd = this.caret.normalize(this.caret.end);
    this.insert(char, normalizedStart, normalizedEnd);
    this.guid.write();

    this.caret.position = Math.max(
      this.caret.denormalize(normalizedStart + 1),
      this.caret.denormalize(normalizedStart + 2) - 1
    );

    $event.preventDefault();
  }

  backspaceHandler($event) {
    $event.preventDefault();

    const isCollapse = this.caret.collapse;
    if (this.caret.isStart() && isCollapse) {
      return;
    }

    let start = this.caret.normalize(this.caret.start);
    let end = this.caret.normalize(this.caret.end);

    if (isCommandKey($event)) {
      end = Math.max(start, end);
      start = 0;
    } else if (isCollapse) {
      start -= 1;
    }

    this.remove(start, end);
    this.guid.write();
    this.caret.position = this.caret.denormalize(start);
  }

  deleteHandler($event) {
    $event.preventDefault();

    const isCollapse = this.caret.collapse;
    if (this.caret.isEnd()) {
      return;
    }

    let start = this.caret.normalize(this.caret.start);
    let end = this.caret.normalize(this.caret.end);

    if (isCommandKey($event)) {
      start = Math.min(start, end);
      end = this.mask.length;
    } else if (isCollapse) {
      end += 1;
    }

    this.remove(start, end);
    this.guid.write();
    this.caret.position = this.caret.denormalize(start);
  }

  format(string) {
    let result = '';

    let stringIndex = 0;
    for (let i = 0; i < this.mask.length; i++) {
      const maskChar = this.mask.charAt(i);

      if (maskChar !== 'X') {
        result += maskChar;
        continue;
      }

      const stringChar = string.charAt(stringIndex);
      if (!stringChar) {
        return result;
      }

      result += stringChar;
      stringIndex += 1;
    }

    return result;
  }
}

module.exports = Field;
