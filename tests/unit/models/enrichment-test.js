import { moduleForModel, test } from 'ember-qunit';

moduleForModel('enrichment', 'Unit | Model | enrichment', {
  // Specify the other units that are required for this test.
  needs: []
});

test('it exists', function(assert) {
  let model = this.subject();
  // let store = this.store();
  assert.ok(!!model);
});
