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
    },
    clusters: {
      refreshModel: true
    },
    organism: {
      refreshModel: true
    },
    background: {
      refreshModel: true
    }
  },
  termstoload: 0,
  termcount: 0,
  clusters: 0,
  loadingqueue: Ember.ArrayProxy.create({ content: Ember.A() }),
  host: config.host,
  activate() {
    var buttons = this.get('navigation').get('dynamicbuttons')
    buttons.clear();
    buttons.addObject('download-options');
  },
  deactivate() {
    var buttons = this.get('navigation').get('dynamicbuttons')
    buttons.clear();
  },
  beforeModel(){
    //reset loading variables that control the interface
    this.get('loadingqueue').clear();
    this.set('termstoload',0);
    this.set('termcount',0);
    this.set('clusters',0);
  },
  model(params){
    var _this = this;

    // Invoke the GOUtil function and wait to receive a 'run' model with the enrichment data
    this.set('clusters',params.clusters);
    var request_url = config.host+'/api/v1/runs/invoke?'
      + 'genes='    +  encodeURIComponent(params.geneids)
      + '&pvalue='  +  encodeURIComponent(params.pvalue)
      + '&clusters='+  encodeURIComponent(params.clusters)
      + '&organism='+  encodeURIComponent(params.organism)
      + '&background='+  encodeURIComponent(params.background);

    Ember.$.getJSON(request_url).then(function(run){
      // console.log(run);
      // Total terms that will need to be loaded
      _this.set('termstoload', run.data.relationships.enrichments.data.length);

      run.data.type = 'run';//ember data expects raw JSONAPI data to be typed singular for push
      var loadedrun = _this.store.push(run);
      _this.set('run',_this.store.peekRecord('run',run.data.id));

      // Load related enrichment and term records connected to the run
      run.data.relationships.enrichments.data.forEach(function(enrichment){
        _this.store.findRecord('enrichment',enrichment.id, {include: 'term,term.parents,genes'}).then(function(enrichment){
          // Enrichment model loaded, now load the term
          var term = enrichment.get('term');
          // Term model loaded, hash both together and send to the loading queue
          _this.get('loadingqueue').pushObject({'enrichment': enrichment, 'term': term});
        });
      });
      // Load meta data about the full Gene Ontology
      Ember.$.getJSON(config.host+'/api/v1/terms/get_pages').then(function(result){
        _this.set('termcount',result.data.count);
      })
    });

    // Prepare an empty array for the controller to use
    return Ember.ArrayProxy.create({content: Ember.A([])})
  },
  setupController(controller,model){
    this._super(controller, model);
    controller.set('model',model);
    controller.set('route',this);
  }
});
