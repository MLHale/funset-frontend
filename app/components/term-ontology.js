import Component from '@ember/component';

// Import the D3 packages we want to use

import Ember from 'ember'
import d3 from 'npm:d3'
import ResizeAware from 'ember-resize/mixins/resize-aware';

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

  nodes: Ember.ArrayProxy.create({content: Ember.A()}),
  _nodes: Ember.computed.alias('nodes.content'),
  links: Ember.ArrayProxy.create({content: Ember.A()}),
  _links: Ember.computed.alias('links.content'),

  renderEventQueue: Ember.ArrayProxy.create({content: Ember.A()}),
  currentScaleFactorX: 1,
  currentScaleFactorY: 1,

  updating: false,
  renderEventProcessor: Ember.observer('renderEventQueue','renderEventQueue.@each', function(){

    var renderEventQueue = this.get('renderEventQueue');
    var event = renderEventQueue.get('firstObject');
    // console.log('renderQueue invoked',event);
    if(event){
      if(renderEventQueue.get('length')>0&&event.type!==null){
        if (event.type === 'selectednode'){
          console.log('selectednode');
          var node_objects= this.get('nodelayer').selectAll("circle").data(this.get('_nodes'), function(d) { return d.id;});

          //update all selected items
          node_objects.filter(d=>{return d.selected})
            .attr("class", function(d){return d.group + ' selected'})
            .style("stroke", "red")
            .style("stroke-width", "6px");
        }
        else if (event.type === 'deselectednode'){
          var node_objects= this.get('nodelayer').selectAll("circle").data(this.get('_nodes'), function(d) { return d.id;});
          console.log('deselectednode');
          //update all deselected items
          node_objects.filter(d=>{return !d.selected})
            .attr("class", function(d){return d.group})
            .style("stroke", "black")
            .style("stroke-width", "3px");
        }
        else if (event.type === 'highlightcluster'){
          var node_objects= this.get('nodelayer').selectAll("circle").data(this.get('_nodes'), function(d) { return d.id;});
          console.log('highlightcluster');
          //update all deselected items
          node_objects.filter(d=>{return !d.clusterselected})
          .style("opacity", "0.1")
        }
        else if (event.type === 'dehighlightcluster'){
          var node_objects= this.get('nodelayer').selectAll("circle").data(this.get('_nodes'), function(d) { return d.id;});
          console.log('dehighlightcluster');
          //update all deselected items
          node_objects.filter(d=>{return !d.clusterselected})
            .style("opacity", "1")
        }
        else if (event.type === 'refreshClusters'){
          // Update the simulation to refresh its data
          var context = this;
          console.log('refreshing clusters');
          var transform = d3.zoomTransform(d3.select(".zoom-layer").node());
          var node_objects= this.get('nodelayer').selectAll("circle").data(this.get('_nodes'), function(d) { return d.id;});
          node_objects.style("fill", function(d){return context.get('clusterColorOptions')[d.enrichment.get('cluster')]});
          node_objects.exit().remove()

          this.updateClusterLabels();
          this.get('simulation').alpha(.01).restart();
        }
        else if (event.type === 'addlink'){
          this.get('links').addObject({
            source: event.source,
            target: event.target,
            type: event.linestyle,
            value: 1
          });
        }
        else if (event.type === 'addparent'){
          if(!this.get('nodes').findBy('id',event.node.id)){//prevent duplicate nodes

            var _this = this;
            this.get('nodes').addObject(event.node);

            // Update the simulation to refresh its data
            this.get('simulation').nodes(this.get('_nodes'));
            var transform = d3.zoomTransform(d3.select(".zoom-layer").node());
            var node_objects= this.get('nodelayer').selectAll("circle").data(this.get('_nodes'), function(d) { return d.id;});
            node_objects.enter().append("circle").attr("r", function(d){return d.enrichment ? d.enrichment.get('level') : _this.get('noderadius')})
                .attr("class", function(d){return d.selected ? d.group + ' selected' : d.group})
                .attr("transform", transform);

            //update text labels if enabled
            this.updateTextLabels()
          }

          // Setup edges and draw them on the graph - attaching a new svg line for each edge
          this.get('links').addObject({
            source: event.source.id,
            target: event.node.id,
            type: 'dotted',
            value: 1
          });
          var link_objects = this.get('linklayer').selectAll("line").data(this.get('_links'));
          link_objects.enter().append("line")
            .attr("class", function(d) { return "link " + d.type; })
            .attr("marker-end", function(d) { return "url(#" + d.type + ")"; })
            .attr("transform", transform);
          this.updateLinkForces()

          //ensure the graph is updated according to the current transform
          this.get('nodelayer').selectAll('circle').attr("transform", transform);
          this.get('linklayer').selectAll('line').attr("transform", transform);
          this.get('simulation').alpha(.01).restart();


        }
      }
    }
    renderEventQueue.popObject();
  }),
  toggleLabels: Ember.observer('showTermLabels', function(){
    if(!this.get('updating')) {
      this.updateTextLabels(this);
      // this.simulationticked(this);
    }
  }),
  toggleLinkforce: Ember.observer('linkForcesOn', function(){
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
      .text(function(d) { return "Cluster "+ d.enrichment.get('cluster') + " medoid - "+d.id+ ' ('+d.term.get('name')+')'; })
        .attr("style", "font-size:200%;");
    cluster_text_objects.exit().remove();
    cluster_text_objects.text(function(d) { return "Cluster "+ d.enrichment.get('cluster') + " medoid - "+d.id+ ' ('+d.term.get('name')+')'; })
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
  didResize(event){
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
      .attr("transform","translate(" + (((this.get('width')+62)/2)-132) + " ," + -2 + ")")
      .attr("width", 260)
      .attr("height", 20)
      .style("fill","#FFF")

    axislabellayer.append('text')
      .attr("transform","translate(" + ((this.get('width')+62)/2) + " ," + 14 + ")")
      .style("text-anchor", "middle")
      .text("Multi-dimensional Scaling (pixels)");

    //y-axis label
    axislabellayer.append("rect")
      .attr("transform","translate(" + 0 + " ," + ((this.get('height')/2)+132)+ ") rotate(-90) ")
      .attr("width", 260)
      .attr("height", 20)
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
    this.get('linklayer').selectAll('line').attr("x1", function(d) { return d.source.x; })
        .attr("y1", function(d) { return d.source.y; })
        .attr("x2", function(d) { return d.target.x; })
        .attr("y2", function(d) { return d.target.y; });

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
    svg.attr("height", this.get('width'));

    // setup zoom handler
    var zoom = d3.zoom().on("zoom", ()=>context.zoom(context));

    // setup simulation forces (how the graph moves)
    var simulation = d3.forceSimulation()
        .alphaMin(0.00001)
        // .force("link", d3.forceLink().id(function(d) { return d.id; }).distance(context.get('simulationdistance')).strength(context.get('simulationstrength')))
        .force("charge", d3.forceManyBody().strength(context.get('simulationrepulsiveforce')))
        // .force("center", d3.forceCenter(width / 2, height / 2))
        .velocityDecay(.45)
        .on("tick", ()=> Ember.run.scheduleOnce('render', context, context.simulationticked));

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
    var marker_objects = markerlayer.selectAll("marker").data(["dotted", "solid"]);
    marker_objects.enter().append("marker")
        .attr("id", String)
        .attr("viewBox", "0 -5 10 10")
        .attr("refX", 12)
        .attr("markerWidth", 10)
        .attr("markerHeight", 10)
        .attr("orient", "auto")
      .append("svg:path")
        .attr("d", "M0,-5L10,0L0,5");

    // Layer for edges in the graph
    this.set('linklayer', svg.append("g").attr("class", "link-layer"));

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

    // Setup and Draw Axis layers
    this.set('xaxislayer',svg.append("g")
        .attr("class", "axis xaxis-layer")
        .attr("transform", "translate(62," + 20+ ")")
        .call(xAxis));

    this.set('yaxislayer', svg.append("g")
        .attr("class", "axis yaxis-layer")
        .attr("transform", "translate(62," + 0+ ")")
        .call(yAxis));

    // Layer for zoom bounding box
    this.set('zoomlayer',svg.append("rect")
      .attr("class", "zoom-layer")
      .style("cursor", "move")
      .style("fill", "none")
      .style("pointer-events", "all")
      .attr("width", width)
      .attr("height", height)
      .call(zoom));

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

    // Schedule a call to render the graph
    Ember.run.scheduleOnce('render', this, this.renderGraph);
  },
  /*
    Render the graph by updating each layer to reflect changes in the underlying bound data
  */
  renderGraph() {
    var context = this;

    // Retrieve SVG Layers
    var linklayer = this.get('linklayer');
    var nodelayer = this.get('nodelayer');
    var clusterlayer = this.get('clusterlayer');
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
    var link_objects = linklayer.selectAll("line").data(graph.links);
    link_objects.enter().append("line")
      .attr("class", function(d) { return "link " + d.type; })
      .style("stroke-dasharray", 5)
      .style("stroke", "aaa")
      .style("stroke-width", "1.5px")
      .attr("marker-end", function(d) { return "url(#" + d.type + ")"; });

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
    this.get('linklayer').selectAll('line').attr("transform", d3.event.transform);
    this.get('textlayer').selectAll('text').attr("transform", d3.event.transform);
    this.get('clusterlayer').selectAll('text').attr("transform", d3.event.transform);
  },
  /*
    Handles 'click' events on nodes by toggling the selected flag on the data item and the css class. Should mirror the controller functionality.
  */
  clicked(d, i){
    // var _this = this;
    // var node = d;
    // node.term.get('parents').forEach(function(parent){
    //   _this.store.findRecord('term',parent.id).then(function(){
    //     var term = _this.store.peekRecord('term',parent.id);
    //     if(!_this.get('parentNodes').findBy('id',term.get('termid'))){//check for duplicates before adding
    //       var width = Ember.$('.term-ontology-card').width();
    //       var scalefactor = width;
    //       var center = scalefactor/2;
    //
    //       // Add parent node to be loaded
    //       var parentnode = {
    //         id: term.get('termid'),
    //         group: 'parent',
    //         term: term,
    //         enrichment: null,
    //         x: term.get('semanticdissimilarityx') ? term.get('semanticdissimilarityx')*scalefactor+center : center,
    //         y: term.get('semanticdissimilarityy') ? term.get('semanticdissimilarityy')*scalefactor+center : center,
    //       };
    //       _this.get('parentNodes').addObject(parentnode);
    //
    //       // Update graph using the render queue
    //       _this.get('renderEventQueue').addObject({type: 'addparent', node:parentnode, source:node});
    //     }
    //
    //   });
    // });
    //
    // // Update state to reflect that the node is currently selected
    // d.selected = d.selected ? false : true;
    // d.enrichment.set('selected',!d.enrichment.get('selected'))
    // this.get('nodelayer').selectAll("circle").attr("class", function(d){return d.selected ? d.group + ' selected' : d.group});
  },
  /*
    Handles drag `start` events on nodes by logging starting position of the node d being acted upon by a d3 event.
    see https://github.com/d3/d3-force#simulation_nodes and https://github.com/d3/d3-drag#drag_on
  */
  dragstarted (d, i) {
    if (!d3.event.active) this.get('simulation').alphaTarget(0.3).restart();
    d.fx = d.x;
    d.fy = d.y;
  },
  /*
    Handles `drag` events on nodes by updating the position of the node d being acted upon by a d3 event.
    see https://github.com/d3/d3-force#simulation_nodes and https://github.com/d3/d3-drag#drag_on
  */
  dragged (d, i) {
    d.fx = d3.event.x;
    d.fy = d3.event.y;
  },
  /*
    Handles drag `end` events on nodes by nullifying the temporary position of the node d being acted upon by a d3 event.
    see https://github.com/d3/d3-force#simulation_nodes and https://github.com/d3/d3-drag#drag_on
  */
  dragended (d, i) {
    //clear effect (fx) params when the event ends
    if (!d3.event.active) this.get('simulation').alphaTarget(0);
    d.fx = null;
    d.fy = null;
  },
});
