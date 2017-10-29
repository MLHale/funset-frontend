import Route from '@ember/routing/route';
import Ember from 'ember';

export default Route.extend({
  model(){
    var data = Ember.A();
    var _this = this;
    Ember.$.getJSON('http://localhost/api/v1/terms/get_pages').then(function(result){
      if (result.data.pages >= 1){
        for (var i = 1; i <= result.data.pages; i++) {
            _this.store.query('term', {page: i});
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
