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
  nodes:[],
  links:[],
  processQueue: Ember.observer('route.loadingqueue.@each', function(){
    var queue = this.get('route.loadingqueue');
    if(queue.content.length > 0){
      let node = queue.popObject();
      console.log(node);
      this.get('nodes').addObject({id: node._data.termid, group: 1});
      if(node.get('parents')){
        node.get('parents').forEach(function(parent){
          this.get('links').addObject({source: node.termid,target:parent.get('termid')})
        });
      }
    }
  }),
  actions:{
    addItem(){
      this.get('nodes').addObject({id: "GO:000002", group: 1});
    }
  }
});
