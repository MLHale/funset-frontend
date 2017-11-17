import DS from 'ember-data';

export default DS.Model.extend({
  term: DS.belongsTo('term'),
  pvalue: DS.attr('number'),
  level: DS.attr('number')
});
