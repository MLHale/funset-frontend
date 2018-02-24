/**
 * @Author: Matthew Hale <mlhale>
 * @Date:   2018-02-14T23:03:42-06:00
 * @Email:  mlhale@unomaha.edu
 * @Filename: download-options.js
 * @Last modified by:   matthale
 * @Last modified time: 2018-02-24T01:30:49-06:00
 * @License: Funset is a web-based BIOI tool for visualizing genetic pathway information. This program is free software: you can redistribute it and/or modify it under the terms of the GNU General Public License as published by the Free Software Foundation, either version 3 of the License, or (at your option) any later version. This program is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU General Public License for more details. You should have received a copy of the GNU General Public License along with this program. If not, see http://www.gnu.org/licenses/.
 * @Copyright: Copyright (C) 2017 Matthew L. Hale, Dario Ghersi, Ishwor Thapa
 */



import Component from '@ember/component';
import d3 from 'npm:d3';
import config from '../config/environment';
import FileSaverMixin from 'ember-cli-file-saver/mixins/file-saver';
import Ember from 'ember';

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
    },
    downloadCSV(){
      var data = [
         ['Cluster', 'GO Term', 'GO Name', 'FDR', 'Enrichment Level', 'SSX', 'SSY', 'Genes...'],
      ];
      var json = this.get('navigation.clusterjson');
      json.forEach((cluster)=>{
        // Create a new line in the csv for each term node
        cluster.nodes.forEach((node)=>{
          var line = [
            cluster.id,
            node.term.get('termid'),
            node.term.get('name'),
            node.enrichment.get('pvalue'),
            node.enrichment.get('level'),
            node.enrichment.get('semanticdissimilarityx'),
            node.enrichment.get('semanticdissimilarityy'),
          ];
          // gather genes
          cluster.genes.forEach((gene)=>{
            line.push(gene.get('geneid'));
          });
          data.push(line);
        });
      });

      this.get('csv').export(data, {fileName: config.host+"-csv-download.csv"});
    }
  }
});
