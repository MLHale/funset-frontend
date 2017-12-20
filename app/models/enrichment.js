import DS from 'ember-data';

export default DS.Model.extend({
  term: DS.belongsTo('term'),
  pvalue: DS.attr('number'),
  level: DS.attr('number'),
  semanticdissimilarityx: DS.attr('number'),
  semanticdissimilarityy: DS.attr('number'),
  cluster: DS.attr('number'),
  medoid: DS.attr('bool'),
  genes: DS.hasMany('gene')
});
