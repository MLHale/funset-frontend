import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';

moduleForComponent('usage-instructions', 'Integration | Component | usage instructions', {
  integration: true
});

test('it renders', function(assert) {
  // Set any properties with this.set('myProperty', 'value');
  // Handle any actions with this.on('myAction', function(val) { ... });

  this.render(hbs`{{usage-instructions}}`);

  assert.equal(this.$().text().trim(), '');

  // Template block usage:
  this.render(hbs`
    {{#usage-instructions}}
      template block text
    {{/usage-instructions}}
  `);

  assert.equal(this.$().text().trim(), 'template block text');
});
