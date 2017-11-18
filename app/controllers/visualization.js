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
  percenttermsloaded: Ember.computed('route.termstoload', 'route.loadingqueue.@each', function(){
    var loaded = 1;
    if (this.get('route.loadingqueue.length')>=1 && this.get('route.termstoload')>=1){
      loaded = Math.floor(this.get('route.loadingqueue.length')/this.get('route.termstoload')*100);
    }
    return loaded;
  }),
  renderEventQueue: Ember.ArrayProxy.create({content: Ember.A()}),
  formNodes: Ember.observer('percenttermsloaded', function(){
    if (this.get('percenttermsloaded') === 100){
      //all terms have loaded
      var loadingqueue = this.get('route.loadingqueue');
      var width = Ember.$('.term-ontology-card').width();
      console.log('width',width);
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
  // processQueue: Ember.observer('route.loadingqueue.@each', function(){
  //   var queue = this.get('route.loadingqueue');
  //   if(queue.content.length > 0){
  //     let node = queue.popObject();
  //     this.get('loadtermnodes').addObject(node);
  //   }
  // }),
  // updateNodes: Ember.observer('termloadingqueue.@each', function(){
  //   var scalefactorx = this.get('width');
  //   var centerx = scalefactorx/2;
  //   var scalefactory = this.get('height');
  //   var centery = scalefactory/2;
  //   var _this = this;
  //   if(this.get('termloadingqueue.length')>0){
  //     this.get('termloadingqueue.content').forEach(function(enrichmentterm){
  //       var term = enrichmentterm.term;
  //       var enrichment = enrichmentterm.enrichment;
  //       this.get('nodes').addObject({
  //         id: term.get('termid'),
  //         group: 'enrichment',
  //         term: term,
  //         enrichment: enrichment,
  //         x: term.get('semanticdissimilarityx') ? term.get('semanticdissimilarityx')*scalefactorx+centerx : centerx,
  //         y: term.get('semanticdissimilarityy') ? term.get('semanticdissimilarityy')*scalefactory+centery : centery,
  //       });
  //       //add parent nodes and an edge to each one
  //
  //       // term.get('parents').forEach(function(parent){
  //       //
  //       //   _this.store.findRecord('term',parent.id).then(function(){
  //       //     var parentterm = _this.store.peekRecord('term',parent.id);
  //       //     // console.log(parentterm.get('id'));
  //       //     if(!_this.get('nodes').findBy('id',parentterm.get('termid'))){
  //       //       //check for duplicates before adding
  //       //       _this.get('nodes').addObject({
  //       //         id: parentterm.get('termid'),
  //       //         group: 'parent',
  //       //         x: parentterm.get('semanticdissimilarityx')*scalefactor+center,
  //       //         y: parentterm.get('semanticdissimilarityy')*scalefactor+center,
  //       //       });
  //       //     }
  //       //     _this.get('linkloadingqueue').addObject({
  //       //       source: term.get('termid'),
  //       //       target: parentterm.get('termid'),
  //       //       type: 'dotted',
  //       //       value: 1
  //       //     });
  //       //   });
  //       // });
  //
  //       this.get('termloadingqueue').removeObject(enrichmentterm);
  //     }, this);
  //     if(!this.get('updating')) {
  //       this.set('updating', true);
  //       Ember.run.scheduleOnce('render', this, this.update);
  //     }
  //   }
  //   // Ember.run.scheduleOnce('render', this, this.update);
  //   // this.addNode();
  // }),
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
