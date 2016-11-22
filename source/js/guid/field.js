const Carriage = require('./carriage');

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
    this.carriage = new Carriage(this);

    this.max = element.maxLength;
    this.zero = '0';

    this.element.addEventListener('keypress', this.onKeypress.bind(this));
    this.element.addEventListener('keydown', this.onKeydown.bind(this));
    this.element.addEventListener('cut', $event => $event.preventDefault());
    this.element.addEventListener('drop', $event => $event.preventDefault());
    this.element.addEventListener('dragstart', $event => $event.preventDefault());

    this.value = this.zero.repeat(this.max);
  }

  get value() {
    return this.element.value;
  }

  set value(newValue) {
    this.element.value = newValue;
  }

  removeChars(index) {
    let value = '';

    if (index > 0) {
      value += this.zero.repeat(index);
      value += this.value.slice(index);
    } else {
      value += this.value.slice(0, -index);
      value += this.zero.repeat(this.max + index);
    }

    this.value = value;
    this.guid.write();
    return this;
  }

  insert(char, index) {
    const oldValue = this.value;
    let value = oldValue.slice(0, index);
    value += char.toLowerCase();
    value += oldValue.slice(index + char.length);

    this.value = value;
    this.guid.write();
    return this;
  }

  focus() {
    this.element.focus();
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
      case KEYS['TAB']: {
        this.tabHandler($event);
        break;
      }
      case KEYS['ARROW_LEFT']: {
        this.arrowLeftHandler($event);
        break;
      }
      case KEYS['ARROW_RIGHT']: {
        this.arrowRightHandler($event);
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

    const isEnd = this.carriage.isEnd();
    const hasNextField = this.guid.hasNextField();
    if (isEnd && !hasNextField) {
      return;
    }

    if (isEnd && hasNextField) {
      this.guid.nextField()
        .insert(char, 0)
        .carriage.set(1);
      return;
    }

    const index = this.carriage.get();
    this.insert(char, index)
      .carriage.set(index + 1);

    if (this.carriage.isEnd() && hasNextField) {
      this.guid.nextField()
        .carriage.set(0);
    }
  }

  isValidChar(char = '') {
    return /^[a-f\d]/i.test(char);
  }

  backspaceHandler($event) {
    $event.preventDefault();

    const isStart = this.carriage.isStart();
    const hasPrevField = this.guid.hasPrevField();
    if (isStart && !hasPrevField) {
      return;
    }

    if (isStart && hasPrevField) {
      this.guid.prevField()
        .insert(this.zero, this.guid.active.max - 1)
        .carriage.end(-1);
      return;
    }

    const index = this.carriage.get();
    if (keyIsCommand($event)) {
      this.removeChars(index)
        .carriage.set();
      return;
    }

    this.insert(this.zero, index - 1)
      .carriage.set(index - 1);

    if (this.carriage.isStart() && hasPrevField) {
      this.guid.prevField()
        .carriage.end();
    }
  }

  deleteHandler($event) {
    $event.preventDefault();

    const isEnd = this.carriage.isEnd();
    const hasNextField = this.guid.hasNextField();
    if (isEnd && !hasNextField) {
      return;
    }

    if (isEnd && hasNextField) {
      this.guid.nextField()
        .insert(this.zero, 0)
        .carriage.set(1);
      return;
    }

    const index = this.carriage.get();
    if (keyIsCommand($event)) {
      this.removeChars(-index)
        .carriage.end();
      return;
    }

    this.insert(this.zero, index)
      .carriage.set(index + 1);

    if (this.carriage.isEnd() && hasNextField) {
      this.guid.nextField()
        .carriage.set(0);
    }
  }

  tabHandler($event) {
    $event.preventDefault();

    const field = $event.shiftKey ? this.guid.prevField() : this.guid.nextField();
    if (field) {
      field.carriage.set(0);
    }
  }

  arrowLeftHandler($event) {
    const index = this.carriage.get();
    const hasPrevField = this.guid.hasPrevField();

    const isNextStart = this.carriage.isStart(index - 1);
    if (isNextStart && hasPrevField) {
      $event.preventDefault();
      this.guid.prevField()
        .carriage.end();
      return;
    }

    const isStart = this.carriage.isStart();
    if (isStart && hasPrevField) {
      $event.preventDefault();
      this.guid.prevField()
        .carriage.end(1);
    }
  }

  arrowRightHandler($event) {
    const index = this.carriage.get();
    const hasNextField = this.guid.hasNextField();

    const isNextEnd = this.carriage.isEnd(index + 1);
    if (isNextEnd && hasNextField) {
      $event.preventDefault();
      this.guid.nextField()
        .carriage.set(0);
      return;
    }

    const isEnd = this.carriage.isEnd(index);
    if (isEnd && hasNextField) {
      $event.preventDefault();
      this.guid.nextField()
        .carriage.set(1);
    }
  }
}

module.exports = Field;
