import Controller from '@ember/controller';
import Ember from 'ember';

export default Controller.extend({
  linkForce: false,
  showTermLabels: false,
  // nodes: Ember.ArrayProxy.create({content: Ember.A([])}), //nodes maintained by d3 term-ontology component

  sortedNodes: Ember.computed('model.@each', function(){
    return this.get('model').sortBy('enrichment.pvalue')
  }),
  links: Ember.ArrayProxy.create({content: Ember.A([])}), //links maintained by d3 term-ontology component
  loadtermnodes: Ember.ArrayProxy.create({content: Ember.A([])}),//nodes to be loaded in the visualization
  termsloaded: Ember.computed('route.termstoload', 'model.length', function(){
    return this.get('model.length')===this.get('route.termstoload');
  }),
  renderEventQueue: Ember.ArrayProxy.create({content: Ember.A()}),
  processQueue: Ember.observer('route.loadingqueue.@each', function(){
    var queue = this.get('route.loadingqueue');
    if(queue.content.length > 0){
      let node = queue.popObject();
      this.get('loadtermnodes').addObject(node);
    }
  }),
  init(){
    this._super();
    console.log('controller init')
  },
  willDestroy(){
    this._super();
    console.log('controller destroy')
  },
  actions: {
    toggleSelectedTerm(term){
      var event = {type: '', node: term}
      if (term.get('selected')){
        term.set('selected', false);
        event.type = 'deselectednode';
      } else{
        term.set('selected', true);
        event.type = 'selectednode';
      }
      this.get('renderEventQueue').addObject(event);
    }
  }
});
