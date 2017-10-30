import Route from '@ember/routing/route';
import Ember from 'ember';

export default Route.extend({
  loadingqueue: Ember.ArrayProxy.create({ content: Ember.A() }),
  model(){
    var _this = this;
    Ember.$.getJSON('http://localhost/api/v1/terms/get_pages').then(function(result){
      _this.set('termcount',result.data.count);
      _this.set('pages',result.data.pages);
      if (result.data.pages >= 1){
        // for (var i = 1; i <= result.data.pages; i++) {
        for (var i = 1; i <= 1; i++) {//get 100 terms
            _this.store.query('term', {page: i}).then(function(pageresults){
              _this.get('loadingqueue').pushObjects(pageresults.content);
            });
        }
      }
    });
    return this.store.peekAll('term');
  },
  setupController(controller,model){
    this._super(controller, model);
    controller.set('model',model);
    controller.set('route',this);
  }
});
