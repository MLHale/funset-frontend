import Controller from '@ember/controller';
import Ember from 'ember';

export default Controller.extend({
  //toggles for graph options
  linkForce: false,
  showTermLabels: false,


  renderEventQueue: Ember.ArrayProxy.create({content: Ember.A()}), // Used to dispatch render events to the graph component
  /*
    Returns a sorted ArrayProxy based on the underlying model (nodes).
  */
  sortedNodes: Ember.computed('model.@each', function(){
    return this.get('model').sortBy('enrichment.pvalue')
  }),

  links: Ember.ArrayProxy.create({content: Ember.A([])}), //links maintained by d3 term-ontology component

  /*
    Returns the percentage of terms that have been loaded. Used to determine when loading is done
  */
  percenttermsloaded: Ember.computed('route.termstoload', 'route.loadingqueue.@each', function(){
    var loaded = 1;
    if (this.get('route.loadingqueue.length')>=1 && this.get('route.termstoload')>=1){
      loaded = Math.floor(this.get('route.loadingqueue.length')/this.get('route.termstoload')*100);
    }
    return loaded;
  }),
  /*
    Coalesces term and enrichment data to form nodes. Adds the nodes to the model to be used by the graph.
  */
  prepareNodes: Ember.observer('percenttermsloaded', function(){
    if (this.get('percenttermsloaded') === 100){
      //all terms have loaded
      var loadingqueue = this.get('route.loadingqueue');
      var width = Ember.$('.term-ontology-card').width();
      var scalefactor = width;
      var center = scalefactor/2;
      var _this = this;
      loadingqueue.forEach(function(enrichmentterm){
        var term = enrichmentterm.term;
        var enrichment = enrichmentterm.enrichment;
        _this.get('model').addObject({
          id: term.get('termid'),
          group: 'enrichment',
          term: term,
          enrichment: enrichment,
          x: term.get('semanticdissimilarityx') ? term.get('semanticdissimilarityx')*scalefactor+center : center,
          y: term.get('semanticdissimilarityy') ? term.get('semanticdissimilarityy')*scalefactor+center : center,
        });
      });
      //add parent nodes and an edge to each one

      // term.get('parents').forEach(function(parent){
      //
      //   _this.store.findRecord('term',parent.id).then(function(){
      //     var parentterm = _this.store.peekRecord('term',parent.id);
      //     // console.log(parentterm.get('id'));
      //     if(!_this.get('nodes').findBy('id',parentterm.get('termid'))){
      //       //check for duplicates before adding
      //       _this.get('nodes').addObject({
      //         id: parentterm.get('termid'),
      //         group: 'parent',
      //         x: parentterm.get('semanticdissimilarityx')*scalefactor+center,
      //         y: parentterm.get('semanticdissimilarityy')*scalefactor+center,
      //       });
      //     }
      //     _this.get('linkloadingqueue').addObject({
      //       source: term.get('termid'),
      //       target: parentterm.get('termid'),
      //       type: 'dotted',
      //       value: 1
      //     });
      //   });
      // });
    }
  }),
  actions: {
    /*
      Handle term selections by dispatching an event of a particular type to the underlying graph component
    */
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
