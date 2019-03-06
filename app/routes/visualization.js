/**
 * @Author: Matthew Hale <mlhale>
 * @Date:   2018-02-14T23:03:42-06:00
 * @Email:  mlhale@unomaha.edu
 * @Filename: visualization.js
 * @Last modified by:   matthale
 * @Last modified time: 2019-03-05T23:39:42-06:00
 * @License: Funset is a web-based BIOI tool for visualizing genetic pathway information. This program is free software: you can redistribute it and/or modify it under the terms of the GNU General Public License as published by the Free Software Foundation, either version 3 of the License, or (at your option) any later version. This program is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU General Public License for more details. You should have received a copy of the GNU General Public License along with this program. If not, see http://www.gnu.org/licenses/.
 * @Copyright: Copyright (C) 2017 Matthew L. Hale, Dario Ghersi, Ishwor Thapa
 */



import Route from '@ember/routing/route';
import ArrayProxy from '@ember/array/proxy';
import { A } from '@ember/array';
import $ from 'jquery';
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
    },
    namespace: {
      refreshModel: true
    },
    goontology: {
      refreshModel: true
    }
  },
  termstoload: 0,
  termcount: 0,
  clusters: 0,
  error: '',
  loadingqueue: ArrayProxy.create({ content: A() }),
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
    this.set('clusters',-1);
    this.set('error','');
  },
  model(params){
    var _this = this;

    // Invoke the GOUtil function and wait to receive a 'run' model with the enrichment data
    this.set('clusters',params.clusters);
    var request_url = config.host+'/api/v1/runs/invoke'
    // var request_url = config.host+'/api/v1/runs/invoke?'
    //   + 'genes='    +  encodeURIComponent(params.geneids)
    //   + '&pvalue='  +  encodeURIComponent(params.pvalue)
    //   + '&clusters='+  encodeURIComponent(params.clusters)
    //   + '&organism='+  encodeURIComponent(params.organism)
    var data = {background: params.background, genes: params.geneids, pvalue: params.pvalue, clusters:params.clusters, organism: params.organism, namespace: params.namespace, goontology: params.goontology};
    $.post(request_url, data).then(
      //success, received run
      function(response){
        // console.log(response);
        // Total terms that will need to be loaded
        _this.set('termstoload', response.data.relationships.enrichments.data.length);

        response.data.type = 'run';//ember data expects raw JSONAPI data to be typed singular for push
        _this.store.push(response); //loaded run
        _this.set('run',_this.store.peekRecord('run',response.data.id));

        // Load related enrichment and term records connected to the run
        response.data.relationships.enrichments.data.forEach(function(enrichment){
          _this.store.findRecord('enrichment',enrichment.id, {include: 'term,term.parents,genes'}).then(function(enrichment){
            // Enrichment model loaded, now load the term
            var term = enrichment.get('term');
            if(enrichment.get('cluster')+1>_this.get('clusters')){
              _this.set('clusters', enrichment.get('cluster')+1);
            }
            // Term model loaded, hash both together and send to the loading queue
            _this.get('loadingqueue').pushObject({'enrichment': enrichment, 'term': term});
          });
        });
        // Load meta data about the full Gene Ontology
        $.getJSON(config.host+'/api/v1/terms/get_pages', {namespace: params.namespace, goontology: params.goontology}).then(function(result){
          _this.set('termcount',result.data.count);
        })
      },
      //error handling
      function(response){
        _this.set('error',response.responseJSON.errors.error); 
        // console.log(_this.get('error'));
      }
    );

    // Prepare an empty array for the controller to use
    return ArrayProxy.create({content: A([])})
  },
  setupController(controller,model){
    this._super(controller, model);
    controller.set('model',model);
    controller.set('route',this);
  }
});
