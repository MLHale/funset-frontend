import Route from '@ember/routing/route';
import Ember from 'ember';
import config from './../config/environment';

export default Route.extend({
  queryParams: {
    geneids: {
      refreshModel: true
    },
    pvalue: {
      refreshModel: true
    }
  },
  termstoload: 0,
  termcount: 0,
  loadingqueue: Ember.ArrayProxy.create({ content: Ember.A() }),
  beforeModel(){
    //reset loading variables that control the interface
    this.get('loadingqueue').clear();
    this.set('termstoload',0);
    this.set('termcount',0);
  },
  model(params){
    var _this = this;
    console.log(params);
    Ember.$.getJSON(config.host+'/api/v1/runs/invoke?genes='+encodeURIComponent(params.geneids)+"&pvalue="+encodeURIComponent(params.pvalue)).then(function(run){
      console.log(run);
      _this.set('termstoload', run.data.relationships.enrichments.data.length);
      run.data.type = 'run';

      var loadedrun = _this.store.push(run);
      run.data.relationships.enrichments.data.forEach(function(enrichment){
        _this.store.findRecord('enrichment',enrichment.id).then(function(enrichment){
          enrichment.get('term').then(function(term){
            _this.get('loadingqueue').pushObject({'enrichment': enrichment, 'term': term});
          })
        });
      })
      Ember.$.getJSON(config.host+'/api/v1/terms/get_pages').then(function(result){
        _this.set('termcount',result.data.count);
      })
      // loadedrun.get('enrichments').forEach(function(enrichment){
      //   console.log(enrichment);
      //   enrichment.get('term').then(function(term){
      //     console.log(term);
      //   });
      // });
    });
    return Ember.ArrayProxy.create({content: Ember.A([])})
    // this.store.query('run', {geneids:params.geneids});
    // Ember.$.getJSON(config.host+'/api/v1/terms/get_pages').then(function(result){
    //   _this.set('termcount',result.data.count);
    //   _this.set('pages',result.data.pages);
    //   if (result.data.pages >= 1){
    //     // for (var i = 1; i <= result.data.pages; i++) {
    //     for (var i = 1; i <= 1; i++) {//get 100 terms
    //         _this.store.query('term', {page: i}).then(function(pageresults){
    //           _this.get('loadingqueue').pushObjects(pageresults.content);
    //         });
    //     }
    //   }
    // });
    // return this.store.peekAll('term');
  },
  setupController(controller,model){
    this._super(controller, model);
    controller.set('model',model);
    controller.set('route',this);
  }
});
