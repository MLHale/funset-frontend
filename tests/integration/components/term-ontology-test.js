import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';

moduleForComponent('term-ontology', 'Integration | Component | term ontology', {
  integration: true
});

test('it renders', function(assert) {
  // Set any properties with this.set('myProperty', 'value');
  // Handle any actions with this.on('myAction', function(val) { ... });

  this.render(hbs`{{term-ontology}}`);

  assert.equal(this.$().text().trim(), '');

  // Template block usage:
  this.render(hbs`
    {{#term-ontology}}
      template block text
    {{/term-ontology}}
  `);

  assert.equal(this.$().text().trim(), 'template block text');
});
