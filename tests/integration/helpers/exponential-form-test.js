
import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';

moduleForComponent('exponential-form', 'helper:exponential-form', {
  integration: true
});

// Replace this with your real tests.
test('it renders', function(assert) {
  this.set('inputValue', '1234');

  this.render(hbs`{{exponential-form inputValue}}`);

  assert.equal(this.$().text().trim(), '1234');
});

