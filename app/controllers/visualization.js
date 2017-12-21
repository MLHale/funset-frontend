import Controller from '@ember/controller';
import Ember from 'ember';

export default Controller.extend({
  //toggles for graph options
  linkForcesOn: false,
  showTermLabels: false,


  renderEventQueue: Ember.ArrayProxy.create({content: Ember.A()}), // Used to dispatch render events to the graph component
  /*
    Returns a sorted ArrayProxy based on the underlying model (nodes).
  */
  sortedNodes: Ember.computed('model.@each', 'model.@each.selected', function(){
    return this.get('model').filterBy('enrichment').sortBy('enrichment.level').reverse()
  }),

  sortedNodeClusters: Ember.computed('model.@each', 'model.@each.selected', 'route.clusters', function(){
    var clusters = Ember.ArrayProxy.create({content: Ember.A([])});
    for(var i=0; i<this.get("route.clusters"); i++){
      var genes = Ember.ArrayProxy.create({content: Ember.A([])});
      this.get('model').filterBy('enrichment.cluster', i).forEach(node =>{
        node.enrichment.get('genes').forEach(gene=>genes.addObject(gene));

      });
      clusters.addObject({name: i, nodes: this.get('model').filterBy('enrichment.cluster', i), genes: genes});
    }
    return clusters;
  }),

  sortedGeneClusters: Ember.computed('model.@each', 'model.@each.selected', 'route.clusters', function(){
    var genelists = Ember.ArrayProxy.create({content: Ember.A([])});

    return genelists;
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
          term: _this.store.peekRecord('term',term.get('id')),
          enrichment: _this.store.peekRecord('enrichment',enrichment.get('id')),
          x: enrichment.get('semanticdissimilarityx') ? enrichment.get('semanticdissimilarityx')*scalefactor+center : center,
          y: enrichment.get('semanticdissimilarityy') ? enrichment.get('semanticdissimilarityy')*scalefactor+center : center,
        });
      });
      this.get('model').forEach(node => {
        node.term.get('parents').forEach(parent =>{
          var target = _this.store.peekRecord('term',parent.id);
          if(_this.get('model').findBy('id',target.get('termid'))){
            _this.get('links').addObject({
              source: node.id,
              target: parent.get('termid'),
              type: 'dotted',
              value: 1
            });
          }
        });
      });
    }
  }),
  parentNodes: Ember.ArrayProxy.create({content: Ember.A()}),
  actions: {
    updateClusternum(clusters){
      var _this = this;
      this.set('route.clusters',clusters);
      var request_url = this.get('route.host')+'/api/v1/runs/'+this.get('route.run.id')+'/recluster?'
        + '&clusters='+  encodeURIComponent(clusters);
      Ember.$.getJSON(request_url).then(function(run){
        console.log(run);
        run.data.type = 'run';//ember data expects raw JSONAPI data to be typed singular for push
        var loadedrun = _this.store.push(run);

      });
    },
    toggleSelectedCluster(cluster){
      var _this = this;
      var event = {type: ''}
      if (node.selected){
        node.selected = false;
        node.enrichment.set('selected', false);
        event.type = 'deselectednode';
      }
      else {
        node.selected = true;
        node.enrichment.set('selected', true);
        event.type = 'selectednode';
        var width = Ember.$('.term-ontology-card').width();
        var scalefactor = width;
        var center = scalefactor/2;
        this.get('renderEventQueue').addObject(event);
        node.term.get('parents').forEach(function(parent){
          _this.store.findRecord('term',parent.id).then(function(){
            var term = _this.store.peekRecord('term',parent.id);
            if(!_this.get('parentNodes').findBy('id',term.get('termid'))){
              //check for duplicates before adding
              var parentnode = {
                id: term.get('termid'),
                group: 'parent',
                term: term,
                enrichment: null,
                x: term.get('semanticdissimilarityx') ? term.get('semanticdissimilarityx')*scalefactor+center : center,
                y: term.get('semanticdissimilarityy') ? term.get('semanticdissimilarityy')*scalefactor+center : center,
              };
              _this.get('parentNodes').addObject(parentnode);
              _this.get('renderEventQueue').addObject({type: 'addparent', node:parentnode, source:node});
            }

          });
        });
      }
    },
    /*
      Handle term selections by dispatching an event of a particular type to the underlying graph component
    */
    toggleSelectedTerm(node){
      var _this = this;
      var event = {type: ''}
      if (node.selected){
        node.selected = false;
        node.enrichment.set('selected', false);
        event.type = 'deselectednode';
      }
      else {
        node.selected = true;
        node.enrichment.set('selected', true);
        event.type = 'selectednode';
        var width = Ember.$('.term-ontology-card').width();
        var scalefactor = width;
        var center = scalefactor/2;
        this.get('renderEventQueue').addObject(event);
        node.term.get('parents').forEach(function(parent){
          _this.store.findRecord('term',parent.id).then(function(){
            var term = _this.store.peekRecord('term',parent.id);
            if(!_this.get('parentNodes').findBy('id',term.get('termid'))){
              //check for duplicates before adding
              var parentnode = {
                id: term.get('termid'),
                group: 'parent',
                term: term,
                enrichment: null,
                x: term.get('semanticdissimilarityx') ? term.get('semanticdissimilarityx')*scalefactor+center : center,
                y: term.get('semanticdissimilarityy') ? term.get('semanticdissimilarityy')*scalefactor+center : center,
              };
              _this.get('parentNodes').addObject(parentnode);
              _this.get('renderEventQueue').addObject({type: 'addparent', node:parentnode, source:node});
            }

          });
        });
      }
    }
  }
});
