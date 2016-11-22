class Carriage {

  constructor(field) {
    this.field = field;
  }

  get element() {
    return this.field.element;
  }

  set(index) {
    this.element.setSelectionRange(index, index);
  }

  end(left = 0) {
    const index = this.field.max - Math.abs(left);
    this.set(index);
  }

  get() {
    return this.element.selectionStart;
  }

  isStart(index = this.get()) {
    return index === 0;
  }

  isEnd(index = this.get()) {
    return index === this.field.max;
  }
}

module.exports = Carriage;
