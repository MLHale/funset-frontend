import DS from 'ember-data';

export default DS.Model.extend({
  termid: DS.attr('string'),
  name: DS.attr('string'),
  namespace: DS.attr('string'),
  description: DS.attr('string'),
  synonym: DS.attr('string'),
  parents: DS.hasMany('term'),
  semanticdissimilarityx: DS.attr('number'),
  semanticdissimilarityy: DS.attr('number'),
});
