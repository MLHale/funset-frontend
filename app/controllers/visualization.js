import Controller from '@ember/controller';
import Ember from 'ember';

export default Controller.extend({
  // nodes: [
  //   {id: "GO:000001", group: 1},
  //   {id: "GO:000002", group: 1},
  //   {id: "GO:000003", group: 1},
  //   {id: "GO:000004", group: 1},
  //   {id: "GO:000005", group: 1},
  // ],
  // links: [
  //   {source: "GO:000001", target: "GO:000002", type:"dotted", value: 1},
  //   {source: "GO:000001", target: "GO:000003", type:"dotted", value: 1},
  //   {source: "GO:000001", target: "GO:000004", type:"dotted", value: 1},
  //   {source: "GO:000001", target: "GO:000005", type:"dotted", value: 1},
  //   {source: "GO:000002", target: "GO:000003", type:"solid", value: 1},
  // ],
  nodes: Ember.ArrayProxy.create({content: Ember.A([])}),
  links: Ember.ArrayProxy.create({content: Ember.A([])}),
  processQueue: Ember.observer('route.loadingqueue.@each', function(){
    var queue = this.get('route.loadingqueue');
    if(queue.content.length > 0){
      let node = queue.popObject();
      // console.log(node);
      var term = this.store.peekRecord('term',node.id);
      // console.log('Adding Term')
      // console.log(term);
      this.get('nodes').addObject({id: term.get('termid'), group: 'terms'});
      if(term.get('parents.length')>0){
        //if the object has parents, retrieve them and add them to the graph
        // console.log('Adding Parents')
        term.get('parents').forEach(function(parent){
          // console.log('Adding Parents - for')
          // console.log(parent.id);
          var _this = this;
          this.store.findRecord('term',parent.id).then(function(result){
            var parentterm = _this.store.peekRecord('term',parent.id);
            // console.log('Adding Parent')
            // console.log(parentterm.get('termid'));
            _this.get('nodes').addObject({id: parentterm.get('termid'), group: 'terms'});//add parent node to graph
            _this.get('links').addObject({source: term.get('termid'), target:parentterm.get('termid'), type: 'dotted', value: 1});//add edge between term and its parent
          });

        }, this);
      }
    }
  }),
  actions: {
    addNode(id){
      this.set('test','test');
    }
  }
});
