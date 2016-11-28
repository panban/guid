class Caret {

  constructor(field) {
    this.field = field;
  }

  get element() {
    return this.field.element;
  }

  get position() {
    return this.element.selectionStart;
  }

  set position(index) {
    this.element.setSelectionRange(index, index);
  }

  isStart() {
    return this.position === 0;
  }

  isEnd() {
    return this.position === this.field.mask.length;
  }

  normalize() {
    const mask = this.field.mask;

    const position = this.position;
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
