class Caret {

  constructor(field) {
    this.field = field;
  }

  get element() {
    return this.field.element;
  }

  set position(index) {
    this.element.setSelectionRange(index, index);
  }

  get start() {
    return this.element.selectionStart;
  }

  get end() {
    return this.element.selectionEnd;
  }

  get collapse() {
    return this.start === this.end;
  }

  isStart() {
    return this.start === 0;
  }

  isEnd() {
    const mask = this.field.mask;
    return this.start === mask.length;
  }

  normalize(position) {
    const mask = this.field.mask;

    if (position < 0 || position > mask.length) {
      return 0;
    }

    let result = 0;
    for (let i = 0; i < mask.length; i++) {
      if(position === i) {
        return result;
      }

      if(mask[i] === "X") {
        result += 1;
      }
    }

    return result;
  }

  denormalize(position) {
    const mask = this.field.mask;

    if (position < 0 || position > mask.length) {
      return 0;
    }

    let result = 0;
    for (let i = 0; i < mask.length; i++) {
      if (result === position) {
        return i;
      }

      if (mask[i] === "X") {
        result += 1;
      }
    }

    return mask.length;
  }
}

module.exports = Caret;
