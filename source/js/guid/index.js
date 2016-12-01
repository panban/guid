const Field = require('./field');

class Guid {

  constructor(container) {
    this.container = container;

    const element = this.container.querySelector('input');
    this.field = new Field(this, element);
  }

  parseGuid(source = '') {
    return source.replace(/[^a-f\d]/gi, '');
  }

  read(source = '', start = 0, end = 0) {
    // todo: make angular check
    if (typeof source !== 'string') {
      return;
    }

    const guid = this.parseGuid(source);
    if (!guid.length) {
      return;
    }

    this.field.insert(guid, start, end);
    this.write();
  }

  write() {
    const value = this.field.value;
    const el = document.querySelector('.guid-value');
    el.textContent = `{${value}}`;

    if (this.isValid(value)) {
      el.style.color = 'green';
    } else {
      el.style.color = 'red';
    }
  }

  isValid(guid) {
    const regexp = /^[\da-f]{8}-[\da-f]{4}-[\da-f]{4}-[\da-f]{4}-[\da-f]{12}$/;
    return regexp.test(guid);
  }
}

module.exports = Guid;
