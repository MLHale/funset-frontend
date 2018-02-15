/**
 * @Author: Matthew Hale <mlhale>
 * @Date:   2018-02-14T23:03:42-06:00
 * @Email:  mlhale@unomaha.edu
 * @Filename: visualization.js
 * @Last modified by:   mlhale
 * @Last modified time: 2018-02-15T14:29:28-06:00
 * @License: Funset is a web-based BIOI tool for visualizing genetic pathway information. This program is free software: you can redistribute it and/or modify it under the terms of the GNU General Public License as published by the Free Software Foundation, either version 3 of the License, or (at your option) any later version. This program is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU General Public License for more details. You should have received a copy of the GNU General Public License along with this program. If not, see http://www.gnu.org/licenses/.
 * @Copyright: Copyright (C) 2017 Matthew L. Hale, Dario Ghersi, Ishwor Thapa
 */



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
  refreshClusters: false,

  sortedNodeClusters: Ember.ArrayProxy.create({content: Ember.A([])}),
  sortedNodeClustersUpdater: Ember.observer('refreshClusters', function(){
    if(this.get('refreshClusters')){
      var clusters = this.get('sortedNodeClusters');
      var clusterui = this.get('clusterui');
      clusters.clear();

      for(var i=0; i<this.get("route.clusters"); i++){
        var genes = Ember.ArrayProxy.create({content: Ember.A([])});
        this.get('model').filterBy('enrichment.cluster', i).forEach(node =>{
          node.enrichment.get('genes').forEach(gene=>genes.addObject(gene));

        });
        clusters.addObject(Ember.Object.create({id:i, name: i, selected: true, nodes: this.get('model').filterBy('enrichment.cluster', i).sortBy('enrichment.level').reverse(), genes: genes}));
      }
      this.set('navigation.clusterjson', clusters);
    }
    this.set('refreshClusters',false);
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
          clusterselected: true,
        });
      });
      this.set('refreshClusters', true);
      // this.get('renderEventQueue').addObject({type: 'starting'});
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
  clusterdragging: false,
  clusterslideractive: false,
  clusterslideractive: false,
  clusterfieldsubmitted: false,
  allclustersselected: true,
  actions: {
    updateClusters(){
      // console.log('updating clusters observer');
        var num_clusters = this.get('route.clusters');
        var _this = this;
        //reset all de-selected nodes
        var clusters = this.get('sortedNodeClusters');
        clusters.forEach(cluster=>{
          cluster.set('selected',true);
          cluster.nodes.forEach(node=>{
            node.clusterselected = true;
          });
        });
        var event = {type: 'showallclusters'};
        this.get('renderEventQueue').addObject(event);

        //retrieve new clusters
        var request_url = _this.get('route.host')+'/api/v1/runs/'+_this.get('route.run.id')+'/recluster?'
          + 'clusters='+  encodeURIComponent(num_clusters);

        Ember.$.getJSON(request_url).then(function(run){
          // console.log(run);
          run.data.type = 'run';//ember data expects raw JSONAPI data to be typed singular for push
          // console.log('updating clusters ');
          var loadedrun = _this.store.pushPayload(run);
          // console.log('updated clusters ');
          _this.get('renderEventQueue').addObject({type: 'refreshClusters'});
          _this.set('refreshClusters',true);
        });

    },
    clusterFieldSubmitted(){
      this.set('clusterfieldsubmitted', !this.get('clusterfieldsubmitted'));
    },
    toggleAllClustersSelected(){
      var clusters = this.get('sortedNodeClusters');
      if(this.get('allclustersselected')){
        this.set('allclustersselected',false);
        clusters.forEach(cluster=>{
          cluster.set('selected',false);
          cluster.nodes.forEach(node=>{
            node.clusterselected = false;
          });
        });
        var event = {type: 'hideallclusters'};
        this.get('renderEventQueue').addObject(event);
      }
      else {
        this.set('allclustersselected',true);
        clusters.forEach(cluster=>{
          cluster.set('selected',true);
          cluster.nodes.forEach(node=>{
            node.clusterselected = true;
          });
        });
        var event = {type: 'showallclusters'};
        this.get('renderEventQueue').addObject(event);
      }
    },
    toggleSelectedCluster(cluster){
      var _this = this;
      var event = {type: ''}
      if (cluster.selected){
        cluster.set('selected', false);
        cluster.nodes.forEach(node=>{
          node.clusterselected= false;
        });
        event.type = 'hidecluster';
        event.nodes = cluster.nodes
        this.get('renderEventQueue').addObject(event);
      }
      else {
        console.log(cluster);
        cluster.set('selected', true);
        cluster.nodes.forEach(node=>{
          node.clusterselected = true;
        });
        event.type = 'showcluster';
        this.get('renderEventQueue').addObject(event);
      }
      //check to see if allclustersselected should be true
      this.set('allclustersselected',this.get('sortedNodeClusters').filter(cluster=>{return !cluster.get('selected')}).length===0)

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
        event.node = node;
        this.get('renderEventQueue').addObject(event);
      }
      else {
        node.selected = true;
        node.enrichment.set('selected', true);
        event.type = 'selectednode';
        event.node = node;
        this.get('renderEventQueue').addObject(event);
      }
    }
  }
});
