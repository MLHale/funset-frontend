/**
 * @Author: Matthew Hale <mlhale>
 * @Date:   2018-02-14T23:03:42-06:00
 * @Email:  mlhale@unomaha.edu
 * @Filename: term-ontology.js
 * @Last modified by:   matthale
 * @Last modified time: 2019-03-08T00:21:55-06:00
 * @License: Funset is a web-based BIOI tool for visualizing genetic pathway information. This program is free software: you can redistribute it and/or modify it under the terms of the GNU General Public License as published by the Free Software Foundation, either version 3 of the License, or (at your option) any later version. This program is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU General Public License for more details. You should have received a copy of the GNU General Public License along with this program. If not, see http://www.gnu.org/licenses/.
 * @Copyright: Copyright (C) 2017 Matthew L. Hale, Dario Ghersi, Ishwor Thapa
 */



import Component from '@ember/component';

// Import the D3 packages we want to use

import ArrayProxy from '@ember/array/proxy';
import { A } from '@ember/array';
import { alias } from '@ember/object/computed';
import { observer } from '@ember/object';
import { scheduleOnce, later } from '@ember/runloop';
import d3 from 'npm:d3'
import ResizeAware from 'ember-resize/mixins/resize-aware';
import $ from 'jquery'

export default Component.extend(ResizeAware,{

  tagName: 'svg',
  classNames: ['term-ontology-graph'],
  clusterColorOptions: ["#dfc27d", "#c7eae5", "#543005", "#003c30", "#80cdc1", "#35978f", "#01665e", "#f6e8c3", "#f5f5f5", "#bf812d", "#8c510a",'#67001f','#b2182b','#d6604d','#f4a582','#fddbc7','#f7f7f7','#d1e5f0','#92c5de','#4393c3','#2166ac','#053061',"AliceBlue","AntiqueWhite","Aqua","Aquamarine","Azure","Beige","Bisque","Black","BlanchedAlmond","Blue","BlueViolet","Brown","BurlyWood","CadetBlue","Chartreuse","Chocolate","Coral","CornflowerBlue","Cornsilk","Crimson","Cyan","DarkBlue","DarkCyan","DarkGoldenRod","DarkGray","DarkGrey","DarkGreen","DarkKhaki","DarkMagenta","DarkOliveGreen","Darkorange","DarkOrchid","DarkRed","DarkSalmon","DarkSeaGreen","DarkSlateBlue","DarkSlateGray","DarkSlateGrey","DarkTurquoise","DarkViolet","DeepPink","DeepSkyBlue","DimGray","DimGrey","DodgerBlue","FireBrick","FloralWhite","ForestGreen","Fuchsia","Gainsboro","GhostWhite","Gold","GoldenRod","Gray","Grey","Green","GreenYellow","HoneyDew","HotPink","IndianRed","Indigo","Ivory","Khaki","Lavender","LavenderBlush","LawnGreen","LemonChiffon","LightBlue","LightCoral","LightCyan","LightGoldenRodYellow","LightGray","LightGrey","LightGreen","LightPink","LightSalmon","LightSeaGreen","LightSkyBlue","LightSlateGray","LightSlateGrey","LightSteelBlue","LightYellow","Lime","LimeGreen","Linen","Magenta","Maroon","MediumAquaMarine","MediumBlue","MediumOrchid","MediumPurple","MediumSeaGreen","MediumSlateBlue","MediumSpringGreen","MediumTurquoise","MediumVioletRed","MidnightBlue","MintCream","MistyRose","Moccasin","NavajoWhite","Navy","OldLace","Olive","OliveDrab","Orange","OrangeRed","Orchid","PaleGoldenRod","PaleGreen","PaleTurquoise","PaleVioletRed","PapayaWhip","PeachPuff","Peru","Pink","Plum","PowderBlue","Purple","Red","RosyBrown","RoyalBlue","SaddleBrown","Salmon","SandyBrown","SeaGreen","SeaShell","Sienna","Silver","SkyBlue","SlateBlue","SlateGray","SlateGrey","Snow","SpringGreen","SteelBlue","Tan","Teal","Thistle","Tomato","Turquoise","Violet","Wheat","White","WhiteSmoke","Yellow","YellowGreen"],
  width: 1000,
  height: 1000,
  noderadius: 8,
  simulationdistance: 100,
  simulationstrength: 0.5,
  simulationrepulsiveforce: -40,

  attributeBindings: ['width', 'height'],
  showTermLabels: false,
  linkForcesOn: false,

  nodes: ArrayProxy.create({content: A()}),
  _nodes: alias('nodes.content'),
  links: ArrayProxy.create({content: A()}),
  _links: alias('links.content'),

  renderEventQueue: ArrayProxy.create({content: A()}),
  currentScaleFactorX: 1,
  currentScaleFactorY: 1,

  updating: false,
  renderEventProcessor: observer('renderEventQueue','renderEventQueue.@each', function(){

    var renderEventQueue = this.get('renderEventQueue');
    var event = renderEventQueue.get('firstObject');
    // console.log('renderQueue invoked',event);
    if(event){
      if(renderEventQueue.get('length')>0&&event.type!==null){
        var node_objects= this.get('nodelayer').selectAll("circle").data(this.get('_nodes'), function(d) { return d.id;});
        var link_objects = this.get('linklayer').selectAll("path")
        var text_objects = this.get('textlayer').selectAll("text")
        var cluster_text_objects = this.get('clusterlayer').selectAll("text")
        if (event.type === 'selectednode'){
          // console.log('selectednode');
          event.node.selected = true;
          event.node.enrichment.set('selected', true);
          
          if(event.origin!="menu"){
            //expand the cluster panel and term panel for this item and then scroll to the item on the right hand side menu
            let clusterpanelstate = this.get('expandedclusterpanels.content')[event.node.enrichment.get('cluster')];
            clusterpanelstate.set('expanded', true);
            clusterpanelstate.set('termsexpanded', true);
            scheduleOnce("afterRender", function(){
              $('.scrollabletermlist').stop().animate({ scrollTop: 0 }, 0, function(){
                const target = ".term-"+event.node.term.id;
                const menu_height = 383;
                const scroll_to_pos = $(target).offset().top - menu_height;
                const duration = 500; //ms
                $('.scrollabletermlist').animate({ scrollTop: scroll_to_pos }, duration)
              });
              
              

            });
          }
    
          //update all selected items
          node_objects.filter(d=>{return d.selected})
            .attr("class", function(d){return d.group + ' selected'})
            .style("stroke", "red")
            .style("stroke-width", "6px");

          //add text labels for selected, non-medioid nodes
          text_objects = text_objects.data(this.get('_nodes').filterBy('selected').filterBy('enrichment.medoid', false), function(d) { return d.id;});
          var transform = d3.zoomTransform(d3.select(".zoom-layer").node());
          text_objects.enter().append("svg:text")
            .attr("x", function(d) { return d.x + (d.enrichment!=null ? d.enrichment.get('level')+5 : 13); })
            .attr("y", function(d) { return d.y + (d.enrichment!=null ? d.enrichment.get('level')/2 : 4); })
            .attr("transform", transform)
            .text(function(d) { return d.id+ ' ('+d.term.get('shortname')+')'; });


        }
        else if (event.type === 'deselectednode'){
          //console.log('deselectednode');
          event.node.selected = false;
          event.node.enrichment.set('selected', false);
          
          // if(event.origin!="menu"){
          //   //expand the cluster panel and term panel for this item and then scroll to the item on the right hand side menu
          //   let clusterpanelstate = this.get('expandedclusterpanels.content')[event.node.enrichment.get('cluster')];
          //   clusterpanelstate.set('expanded', false);
          //   clusterpanelstate.set('termsexpanded', false);
          //   scheduleOnce("afterRender", function(){
          //     const target = ".term-"+event.node.term.id;
          //     const menu_height = 383;
          //     let menu_curr_pos = $('.scrollabletermlist').scrollTop();
          //     const scroll_to_pos = $(target).offset().top - menu_height;
          //     console.log($('.scrollabletermlist').offset().top)
          //     console.log(menu_curr_pos,$(target).offset().top,scroll_to_pos);
          //     const duration = 500; //ms
          //     $('.scrollabletermlist').stop().animate({ scrollTop: 0 }, 1).stop().animate({ scrollTop: scroll_to_pos }, duration);
          //   });
          // }
          //update all deselected items
          node_objects.filter(d=>{return !d.selected})
            .attr("class", function(d){return d.group})
            .style("stroke", "black")
            .style("stroke-width", "3px");

          text_objects = text_objects.data(this.get('_nodes').filterBy('selected'), function(d) { return d.id;});
          var transform = d3.zoomTransform(d3.select(".zoom-layer").node());
          text_objects.exit().remove();
        }
        else if (event.type === 'hidecluster'){
          //console.log('hidecluster');

          //dimish unselected items
          node_objects.filter(d=>{return !d.clusterselected})
            .style("opacity", "0.1")

          link_objects.filter(d=>{return !d.source.clusterselected})
            .style("opacity", "0.1")

          text_objects.filter(d=>{return !d.clusterselected})
              .style("opacity", "0.1")

          cluster_text_objects.filter(d=>{return !d.clusterselected})
            .style("opacity", "0.1")

        }
        else if (event.type === 'showcluster'){
          //console.log('showcluster');

          //emphasize all selected items
          node_objects.filter(d=>{return d.clusterselected})
            .style("opacity", "1")

          link_objects.filter(d=>{return d.source.clusterselected})
            .style("opacity", "1");

          text_objects.filter(d=>{return d.clusterselected})
              .style("opacity", "1")

          cluster_text_objects.filter(d=>{return d.clusterselected})
            .style("opacity", "1")
        }
        else if (event.type === 'showallclusters'){
          //console.log('showallclusters');
          node_objects.style("opacity", "1")
          link_objects.style("opacity", "1");
          text_objects.style("opacity", "1")
          cluster_text_objects.style("opacity", "1")
        }
        else if (event.type === 'resetGraph'){
          node_objects.filter(d=>{ return d.dragged; })
            .each(d=>{d.x = d.originx; d.y = d.originy});
          // // this.get('simulation').alpha(.01).restart();
          // // this.simulationticked(this);
        }
        else if (event.type === 'hideallclusters'){
          //console.log('hideallclusters');
          node_objects.style("opacity", "0.1")
          link_objects.style("opacity", "0.1");
          text_objects.style("opacity", "0.1")
          cluster_text_objects.style("opacity", "0.1")

        }
        else if (event.type === 'refreshClusters'){
          // Update the simulation to refresh its data
          var context = this;
          //console.log('refreshing clusters');
          var transform = d3.zoomTransform(d3.select(".zoom-layer").node());
          var node_objects= this.get('nodelayer').selectAll("circle").data(this.get('_nodes'), function(d) { return d.id;});
          node_objects.style("fill", function(d){return context.get('clusterColorOptions')[d.enrichment.get('cluster')]});
          node_objects.exit().remove()

          this.updateClusterLabels();
          this.get('simulation').alpha(.01).restart();
        }
      }
    }
    renderEventQueue.popObject();
  }),
  toggleLabels: observer('showTermLabels', function(){
    if(!this.get('updating')) {
      this.updateTextLabels(this);
      // this.simulationticked(this);
    }
  }),
  toggleLinkforce: observer('linkForcesOn', function(){
    if(!this.get('updating')) {
      this.updateLinkForces(this);
      this.get('simulation').alpha(.3).restart();
      this.simulationticked(this);
    }
  }),
  /*
   Turns text labels on or off and re-renders them depending on the toggle parameter `showTermLabels`
  */
  updateTextLabels(){
    var graph = {nodes: this.get('_nodes'), links: this.get('_links')};
    var textlayer = this.get('textlayer');
    var text_objects;
    if(this.get('showTermLabels')){
      text_objects = textlayer.selectAll("text").data(graph.nodes, function(d) { return d.id;});
      var transform = d3.zoomTransform(d3.select(".zoom-layer").node());
      text_objects.enter().append("svg:text")
        .attr("x", function(d) { return d.x + (d.enrichment!=null ? d.enrichment.get('level')+5 : 13); })
        .attr("y", function(d) { return d.y + (d.enrichment!=null ? d.enrichment.get('level')/2 : 4); })
        .attr("transform", transform)
        .text(function(d) { return d.id+ ' ('+d.term.get('name')+')'; });

    } else{
        text_objects = textlayer.selectAll("text").data({}, function(d) { return d.id;});
        text_objects.exit().remove();
    }
  },
  /*
   Renders Clusterlabels
  */
  updateClusterLabels(){
    var graph = {nodes: this.get('_nodes'), links: this.get('_links')};
    var clusterlayer = this.get('clusterlayer');
    var cluster_metoid_nodes = graph.nodes.filter(node => node.enrichment.get('medoid')===true);
    var cluster_text_objects = clusterlayer.selectAll("text").data(cluster_metoid_nodes);
    var transform = d3.zoomTransform(d3.select(".zoom-layer").node());
    cluster_text_objects.enter().append("svg:text")
      .attr("x", function(d) { return d.x + (d.enrichment!=null ? d.enrichment.get('level')+5 : 13); })
      .attr("y", function(d) { return d.y + (d.enrichment!=null ? d.enrichment.get('level')/2 : 4); })
      .attr("transform", transform)
      .text(function(d) { return "#"+ d.enrichment.get('cluster') + " - "+d.id+ ' ('+d.term.get('shortname')+')'; })
        .attr("style", "font-size:200%;");
    cluster_text_objects.exit().remove();
    cluster_text_objects.text(function(d) { return "#"+ d.enrichment.get('cluster') + " - "+d.id+ ' ('+d.term.get('shortname')+')'; })
      .attr("style", "font-size:200%;");
  },
  /*
    Turns link forces on or off and re-renders them depending on the toggle parameter `linkForcesOn`
  */
  updateLinkForces(){
    var context = this;
    var graph = {nodes: this.get('_nodes'), links: this.get('_links')};
    var simulation = this.get('simulation');
    if(this.get('linkForcesOn')){
      simulation.alpha(.5);
      simulation.force("link", d3.forceLink()
        .links(graph.links)
        .id(function(d) { return d.id; })
        .distance(context.get('simulationdistance'))
        .strength(context.get('simulationstrength')));
    }
    else {
      simulation.force("link", d3.forceLink()
        .links(graph.links)
        .id(function(d) { return d.id; })
        .distance(function(d) { return Math.pow(Math.pow(d.source.x-d.target.x,2) + Math.pow(d.source.y-d.target.y,2), 1/2) })
        .strength(context.get('simulationstrength')));
    }
  },
  /*
    Resizes the component (and svg) when the window size changes
  */
  didResize(/*event*/){
    var svg = d3.select("svg");
    var width = this.set('width',this.$().parents('md-card-content').width());
    var height = this.set('height',this.$().parents('md-card-content').height());

    // Update svg size
    svg.attr("width", width);
    svg.attr("height", height);

    // Update axis scale to reflect the changes
    var xAxisScale = this.set('xAxisScale', d3.scaleLinear()
      .domain([-width/2,width/2])
      .range([0,width]));

    var yAxisScale = this.set('yAxisScale', d3.scaleLinear()
      .domain([-height/2,height/2])
      .range([height,0]));

    this.get('xaxislayer').call(this.get('xAxis').scale(xAxisScale));
    this.get('yaxislayer').call(this.get('yAxis').scale(yAxisScale));

    // Re-center the axis labels
    this.updateAxisLabels()

  },
  /*
    Places centered axis labels with an occluding text box on each axis
  */
  updateAxisLabels(){
    var axislabellayer = this.get('axislabellayer');
    axislabellayer.selectAll('*').remove();
    //x-axis label
    axislabellayer.append("rect")
      .attr("width", this.$().parents('md-card-content').width())
      .attr("height", 20)
      .style("fill","#FFF")

    axislabellayer.append('text')
      .attr("transform","translate(" + ((this.get('width')+62)/2) + " ," + 14 + ")")
      .style("text-anchor", "middle")
      .text("Multi-dimensional Scaling (pixels)");

    //y-axis label
    axislabellayer.append("rect")
      .attr("width", 62)
      .attr("height", this.$().parents('md-card-content').height())
      .style("fill","#FFF")

    axislabellayer.append('text')
      .attr("transform","translate(" + 15 + " ," + (this.get('height')/2) + ") rotate(-90) ")
      .style("text-anchor", "middle")
      .text("Multi-dimensional Scaling (pixels)");
  },
  /*
    Updates the position of each object in each layer as the simulation runs.
  */
  simulationticked(){
    this.get('linklayer').selectAll('path').attr("d", function(d) {
          return [
            "M",d.source.x,d.source.y,
            "A",100000,100000,0,0,0,d.target.x,d.target.y,
            "A",100000,100000,0,0,0,d.target.x,d.target.y
          ].join(" ");
        });
    this.get('nodelayer').selectAll("circle")
        .attr("cx", function(d) { return d.x;  })
        .attr("cy", function(d) { return d.y; });

    this.get('textlayer').selectAll("text")
        .attr("x", function(d) { return d.x + (d.enrichment!=null ? d.enrichment.get('level')+5 : 13); })
        .attr("y", function(d) { return d.y + (d.enrichment!=null ? d.enrichment.get('level')/2 : 4); })

    this.get('clusterlayer').selectAll("text")
        .attr("x", function(d) { return d.x + (d.enrichment!=null ? d.enrichment.get('level')+5 : 13); })
        .attr("y", function(d) { return d.y + (d.enrichment!=null ? d.enrichment.get('level')/2 : 4); })

  },
  /*
    Setup the component by initializing graph layers and initially rendering. This method is called when the component is first inserted in the DOM.
  */
  didInsertElement() {
    var context = this;

    // register component resize event handler
    this.get('resizeService').on('debouncedDidResize', event => context.didResize(event, context));

    // prepare svg for setup
    var width = this.set('width',this.$().parents('md-card-content').width());
    var height = this.set('height',this.$().parents('md-card-content').height());
    var svg = d3.select("svg");
    svg.attr("width", this.get('width'));
    svg.attr("height", this.get('height'));

    // setup zoom handler
    var zoom = d3.zoom().on("zoom", ()=>context.zoom(context));

    // setup simulation forces (how the graph moves)
    var simulation = d3.forceSimulation()
        .alphaMin(0.00001)
        // .force("link", d3.forceLink().id(function(d) { return d.id; }).distance(context.get('simulationdistance')).strength(context.get('simulationstrength')))
        .force("charge", d3.forceManyBody().strength(context.get('simulationrepulsiveforce')))
        // .force("center", d3.forceCenter(width / 2, height / 2))
        .velocityDecay(.45)
        .on("tick", ()=> scheduleOnce('render', context, context.simulationticked));

    this.set('simulation', simulation);

    /*
      -----------------------------------------
      Prepare layers in SVG for later rendering.
      -> Layers are rendered in order.
      -----------------------------------------
    */

    // Layer for arrow heads on edges (markers)
    var markerlayer = this.set('markerlayer', svg.append("g").attr("class", "marker-layer"));
    //setup the marker layer (arrowheads)
    // var marker_objects = markerlayer.selectAll("marker").data(["dotted", "solid"]);
    // marker_objects.enter().append("marker")
    //     .attr("id", String)
    //     .attr("viewBox", "0 -5 10 10")
    //     .attr("refX", 12)
    //     .attr("markerWidth", 10)
    //     .attr("markerHeight", 10)
    //     .attr("orient", "auto")
    //   .append("svg:path")
    //     .attr("d", "M0,-5L10,0L0,5");
    // 
    
    svg.append("svg:defs").selectAll("marker").data(["dotted", "solid"])
      .enter().append("svg:marker")
        .attr("id", String)
        .attr("viewBox", "0 -5 10 10")
        .attr("refX", 5)
        .attr("markerWidth", 6)
        .attr("markerHeight", 6)
        .attr("orient", "auto")
      .append("svg:path")
        .attr("d", "M0,-5L10,0L0,5");


    // Axes setup
    var xAxisScale = this.set('xAxisScale', d3.scaleLinear()
      .domain([-width/2,width/2])
      .range([0,width]));

    var yAxisScale = this.set('yAxisScale', d3.scaleLinear()
      .domain([-height/2,height/2])
      .range([height,0]));

    // create axis objects
    var xAxis = this.set('xAxis', d3.axisBottom(xAxisScale));
    var yAxis = this.set('yAxis', d3.axisLeft(yAxisScale));

    // Layer for zoom bounding box
    this.set('zoomlayer',svg.append("rect")
      .attr("class", "zoom-layer")
      .style("cursor", "move")
      .style("fill", "none")
      .style("pointer-events", "all")
      .attr("width", width)
      .attr("height", height)
      .call(zoom));

    
    // Layer for edges in the graph
    this.set('linklayer', svg.append("g").attr("class", "link-layer"));
      
    // Layer for nodes in the graph
    this.set('nodelayer', svg.append("g").attr("class", "node-layer"));
    
    // Layer for nodes in the graph
    this.set('genenodelayer', svg.append("g").attr("class", "gene-node-layer"));

    // Layer for node labels in the graph
    this.set('textlayer', svg.append("g").attr("class", "text-layer"));
    this.set('clusterlayer', svg.append("g").attr("class", "cluster-layer"));

    // Layer for axis labels
    this.set('axislabellayer',svg.append("g").attr("class", "axislabel-layer"));
    this.updateAxisLabels()
    // Setup and Draw Axis layers
    this.set('xaxislayer',svg.append("g")
        .attr("class", "axis xaxis-layer")
        .attr("transform", "translate(62," + 20+ ")")
        .call(xAxis));

    this.set('yaxislayer', svg.append("g")
        .attr("class", "axis yaxis-layer")
        .attr("transform", "translate(62," + 0+ ")")
        .call(yAxis));

    this.didResize()

    // Schedule a call to render the graph
    scheduleOnce('render', this, this.renderGraph);
  },
  /*
    Render the graph by updating each layer to reflect changes in the underlying bound data
  */
  renderGraph() {
    var context = this;

    // Retrieve SVG Layers
    var linklayer = this.get('linklayer');
    var nodelayer = this.get('nodelayer');
    // var clusterlayer = this.get('clusterlayer');
    var simulation = this.get('simulation');
    simulation.stop();
    var graph = {nodes: this.get('_nodes'), links: this.get('_links')};

    // Setup nodes in the graph, entering a new svg circle of radius enrichment.level for each node. Each node also has a handler for drag events
    var node_objects= nodelayer.selectAll("circle").data(graph.nodes, function(d) { return d.id;});
    node_objects.enter().append("circle").attr("r", function(d){return d.enrichment ? d.enrichment.get('level') : context.get('noderadius')})
        .on('click', (d, i) => context.clicked(d, i, context))
        .call(d3.drag()
            .on("start", (d, i) => context.dragstarted(d, i, context))
            .on("drag", (d, i) => context.dragged(d, i, context))
            .on("end", (d, i) => context.dragended(d, i, context)))
        .attr("class", function(d){return d.selected ? d.group + ' selected' : d.group})
        .style("fill", function(d){return context.get('clusterColorOptions')[d.enrichment.get('cluster')]})
        .style("stroke", "black")
        .style("stroke-width", "3px");

    // Setup edges and draw them on the graph - attaching a new svg line for each edge
    var link_objects = linklayer.selectAll("path").data(graph.links);
    link_objects.enter().append("svg:path")
      .attr("class", function(d) { return "link " + d.type; })
      .style("stroke-dasharray", 5)
      .style("stroke", "aaa")
      .style("stroke-width", "1.5px")
      .attr("marker-mid", function(d) { return "url(#" + d.type + ")"; });

    
    link_objects.exit().remove();

    //setup cluster labels
    this.updateClusterLabels();

    // Setup text showTermLabels. If enabled each node should have a label corresponding to its id
    this.updateTextLabels();

    // Update the simulation to refresh its data
    simulation.nodes(graph.nodes);

    // Turn on link forces if link forces are enabled
    this.updateLinkForces()
    this.set('updating', false);

    // Force the graph to update using tick function
    simulation.alpha(1).restart();
    
    // Force the graph to stop updating and then stop circles from acting gravitationally after initial easing
    later(context, function() {
      simulation.velocityDecay(1)
    }, 2000);

    // Set initial zoom to be fairly zoomed out
    var transform = d3.zoomTransform(d3.select(".zoom-layer").node());
    transform.k=0.3 //transform.k is the magic zoom number!
    transform.x=this.get('width')/3 //transform.x is the magic translation in x space
    transform.y=this.get('height')/3
    var new_xScale = transform.rescaleX(this.get('xAxisScale'));
    var new_yScale = transform.rescaleY(this.get('yAxisScale'));
    this.set('currentScaleFactorX',transform.k)
    this.set('currentScaleFactorY',transform.k);
    
    // Update axes to reflect the new scale
    this.get('xaxislayer').call(this.get('xAxis').scale(new_xScale));
    this.get('yaxislayer').call(this.get('yAxis').scale(new_yScale));
    
    // Transform each object in each layer to be zoomed according to the new scale
    this.get('nodelayer').selectAll('circle').attr("transform", transform);
    this.get('linklayer').selectAll('path').attr("transform", transform);
    this.get('textlayer').selectAll('text').attr("transform", transform);
    this.get('clusterlayer').selectAll('text').attr("transform", transform);
    
  },
  /*
    Teardown component
  */
  willDestroyElement(){
    //clear bound node data before destroying
    this.get('nodes').clear();
    this.get('links').clear();
    this.get('renderEventQueue').clear();
    this._super(...arguments);
  },
  /*
    Handles Zoom events by resizing all content in all affected layers
  */
  zoom() {
    // create new scale ojects based on event
    var new_xScale = d3.event.transform.rescaleX(this.get('xAxisScale'));
    var new_yScale = d3.event.transform.rescaleY(this.get('yAxisScale'));
    
    this.set('currentScaleFactorX',d3.event.transform.k)
    this.set('currentScaleFactorY',d3.event.transform.k);

    // Update axes to reflect the new scale
    this.get('xaxislayer').call(this.get('xAxis').scale(new_xScale));
    this.get('yaxislayer').call(this.get('yAxis').scale(new_yScale));

    // Transform each object in each layer to be zoomed according to the new scale
    this.get('nodelayer').selectAll('circle').attr("transform", d3.event.transform);
    this.get('linklayer').selectAll('path').attr("transform", d3.event.transform);
    this.get('textlayer').selectAll('text').attr("transform", d3.event.transform);
    this.get('clusterlayer').selectAll('text').attr("transform", d3.event.transform);
  },
  /*
    Handles 'click' events on nodes by toggling the selected flag on the data item and the css class. Should mirror the controller functionality.
  */
  clicked(d, /*i*/){
    var event = {type: '', node: d};
    if(d.selected){
      event.type = 'deselectednode';
    }
    else {
      event.type = 'selectednode';
    }

    // Update state to reflect that the node is currently selected

    this.get('renderEventQueue').addObject(event);
  },
  /*
    Handles drag `start` events on nodes by logging starting position of the node d being acted upon by a d3 event.
    see https://github.com/d3/d3-force#simulation_nodes and https://github.com/d3/d3-drag#drag_on
  */
  dragstarted (d, /*i*/) {
    if (!d3.event.active) this.get('simulation').alphaTarget(0.3).restart();
    
    //setup dragged flag on first move
    if(!d.dragged){
      d.dragged=true;
      d.originx = d.x;
      d.originy = d.y;
    }
    // console.log(d);
    d.fx = d.x;
    d.fy = d.y;
  },
  /*
    Handles `drag` events on nodes by updating the position of the node d being acted upon by a d3 event.
    see https://github.com/d3/d3-force#simulation_nodes and https://github.com/d3/d3-drag#drag_on
  */
  dragged (d, /*i*/) {
    d.fx = d3.event.x;
    d.fy = d3.event.y;
  },
  /*
    Handles drag `end` events on nodes by nullifying the temporary position of the node d being acted upon by a d3 event.
    see https://github.com/d3/d3-force#simulation_nodes and https://github.com/d3/d3-drag#drag_on
  */
  dragended (d, /*i*/) {
    //clear effect (fx) params when the event ends
    if (!d3.event.active) this.get('simulation').alphaTarget(0);
    d.fx = null;
    d.fy = null;
  },
});
