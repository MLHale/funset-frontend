import Controller from '@ember/controller';
import Ember from 'ember';

export default Controller.extend({
  linkForce: false,
  showTermLabels: false,
  nodes: Ember.ArrayProxy.create({content: Ember.A([])}), //nodes maintained by d3 term-ontology component
  links: Ember.ArrayProxy.create({content: Ember.A([])}), //links maintained by d3 term-ontology component
  loadtermnodes: Ember.ArrayProxy.create({content: Ember.A([])}),//nodes to be loaded in the visualization
  processQueue: Ember.observer('route.loadingqueue.@each', function(){
    var queue = this.get('route.loadingqueue');
    if(queue.content.length > 0){
      let node = queue.popObject();
      var term = this.store.peekRecord('term',node.id);
      this.get('loadtermnodes').addObject(term);
    }
  }),
});
