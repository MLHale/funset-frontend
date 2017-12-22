import Component from '@ember/component';
import d3 from 'npm:d3'
import config from '../config/environment';
import FileSaverMixin from 'ember-cli-file-saver/mixins/file-saver';
export default Component.extend(FileSaverMixin,{
  actions:{
    downloadSvg(){

      var svg = d3.select("svg")
        .attr("title", config.host+"-svg")
        .attr("version", 1.1)
        .attr("xmlns", "http://www.w3.org/2000/svg");

      var html = svg.node().parentNode.innerHTML;

      var domhtml = Ember.$.parseHTML(html);

      //remove zoom layer so it doesn't block the graph
      $('.zoom-layer',domhtml).remove();

      //save to file
      this.saveFileAs(config.host+"-svg-download.svg", domhtml[1].outerHTML, "image/svg+xml");
    },
    downloadJSON(){
      this.saveFileAs(config.host+"-json-download.json", JSON.stringify(this.get('navigation.clusterjson.content')), "application/json");
    }
  }
});