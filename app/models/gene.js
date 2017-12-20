import DS from 'ember-data';

export default DS.Model.extend({
  geneid: DS.attr('string'),
  name: DS.attr('string')
});
