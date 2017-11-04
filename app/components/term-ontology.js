import Component from '@ember/component';

// Import the D3 packages we want to use

import Ember from 'ember'
import d3 from 'npm:d3'
import ResizeAware from 'ember-resize/mixins/resize-aware';

export default Component.extend(ResizeAware,{

  tagName: 'svg',
  classNames: ['term-ontology-graph'],

  width: 1000,
  height: 1000,
  noderadius: 8,
  simulationdistance: 100,
  simulationstrength: 1,
  simulationrepulsiveforce: -10,

  attributeBindings: ['width', 'height'],
  labels: false,
  linkforce: false,
  // Array of points to render as circles in a line, spaced by time.
  //  [ {value: Number, timestamp: Number } ];
  canvas: null,
  _nodes: Ember.ArrayProxy.create({content: Ember.A()}),
  nodes: Ember.computed.alias('_nodes.content'),
  _links: Ember.ArrayProxy.create({content: Ember.A()}),
  links: Ember.computed.alias('_links.content'),
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
  currentScaleFactorX: 1,
  currentScaleFactorY: 1,
  updating: false,
  updateNodes: Ember.observer('nodestobeadded.@each', function(){
    var context = this;
    if(this.get('nodestobeadded.length')>0){
      this.get('nodestobeadded').forEach(function(node){
        context.get('_nodes').addObject(node);
        context.get('nodestobeadded').removeObject(node);
      });
      if(!context.get('updating')) {
        context.set('updating', true);
        Ember.run.scheduleOnce('render', this, this.update);
      }
    }
    // Ember.run.scheduleOnce('render', this, this.update);
    // this.addNode();
  }),
  updateLinks: Ember.observer('linkstobeadded.@each', function(){
    var context = this;
    if(this.get('linkstobeadded.length')>0){
      this.get('linkstobeadded').forEach(function(link){
        context.get('_links').addObject(link);
        context.get('linkstobeadded').removeObject(link);
      });
      if(!context.get('updating')) {
        context.set('updating', true);
        Ember.run.scheduleOnce('afterRender', this, this.update);
      }
    }
  }),
  toggleLabels: Ember.observer('labels', function(){
    if(!this.get('updating')) {
      this.updateTextLabels(this);
      this.simulationticked(this);
    }
  }),
  toggleLinkforce: Ember.observer('linkforce', function(){
    if(!this.get('updating')) {
      // this.set('updating', true);
      this.updateLinkForces(this);
      this.simulationticked(this);
    }
  }),
  updateTextLabels(){
    var graph = {nodes: this.get('nodes'), links: this.get('links')};
    var textlayer = this.get('textlayer');
    var text_objects;
    if(this.get('labels')){
      text_objects = textlayer.selectAll("text").data(graph.nodes, function(d) { return d.id;});
      text_objects.enter().append("svg:text")
        .attr("x", 8)
        .attr("y", ".31em")
        .text(function(d) { return d.id; });

    } else{
        text_objects = textlayer.selectAll("text").data({}, function(d) { return d.id;});
        text_objects.exit().remove();
    }
  },
  updateLinkForces(){
    var context = this;
    var graph = {nodes: this.get('nodes'), links: this.get('links')};
    var simulation = this.get('simulation');
    if(this.get('linkforce')){
      simulation.alpha(.5);
      var links = simulation.force("link", d3.forceLink()
        .links(graph.links)
        .id(function(d) { return d.id; })
        .distance(context.get('simulationdistance'))
        .strength(function (d) {return context.get('simulationstrength')}));
    }
    else {
      var links = simulation.force("link", d3.forceLink()
        .links(graph.links)
        .id(function(d) { return d.id; })
        .distance(function(d) { return Math.pow(Math.pow(d.source.x-d.target.x,2) + Math.pow(d.source.y-d.target.y,2), 1/2) })
        .strength(function (d) {return context.get('simulationstrength')}));
    }
    this.get('simulation', simulation);
    simulation.alpha(.3).restart();
  },
  didResize(event){
    console.log(`Window resized: width: ${window.innerWidth}, height: ${window.innerHeight}`);
    var svg = d3.select("svg");
    var width = this.set('width',this.$().parents('md-card-content').width());
    var height = this.set('height',this.$().parents('md-card-content').height());
    console.log(`New SVG size: width: ${width}, height: ${height}`);
    svg.attr("width", width);
    svg.attr("height", height);
  },


  simulationticked(){
    var radius = this.get('noderadius');
    var width = this.get('width');
    var height = this.get('height');
    var context = this;
    this.get('linklayer').selectAll('line').attr("x1", function(d) { return d.source.x; })
        .attr("y1", function(d) { return d.source.y; })
        .attr("x2", function(d) { return d.target.x; })
        .attr("y2", function(d) { return d.target.y; });

    this.get('nodelayer').selectAll("circle")
        .attr("cx", function(d) { return d.x;  })
        .attr("cy", function(d) { return d.y; });

    this.get('textlayer').selectAll('text').attr("transform", function(d) {
      return "translate(" + d.x + "," + d.y + ")"+" scale("+context.get('currentScaleFactorX')+","+context.get('currentScaleFactorY')+")";
    });
  },
  zoom() {
    var context = this;
    console.log('zooming');
    // create new scale ojects based on event
    var new_xScale = d3.event.transform.rescaleX(this.get('xAxisScale'));
    var new_yScale = d3.event.transform.rescaleY(this.get('yAxisScale'));
    this.set('currentScaleFactorX',d3.event.transform.k)
    this.set('currentScaleFactorY',d3.event.transform.k);

    // update axes
    this.get('xaxislayer').call(this.get('xAxis').scale(new_xScale));
    this.get('yaxislayer').call(this.get('yAxis').scale(new_yScale));

    // update node zoom
    this.get('nodelayer').selectAll('circle').attr("transform", d3.event.transform);
    this.get('linklayer').selectAll('line').attr("transform", d3.event.transform);
    this.get('textlayer').selectAll('text').attr("transform", function(d) {
      return "translate(" + d.x + "," + d.y + ")"+" scale("+context.get('currentScaleFactorX')+","+context.get('currentScaleFactorY')+")";
    });
    var simulation = this.get('simulation');
    // simulation.alpha(.1).restart();
  },
  didInsertElement() {
    var context = this;
    this.get('resizeService').on('debouncedDidResize', event => context.didResize(event, context));//register component resize event handler
    var width = this.set('width',this.$().parents('md-card-content').width());
    var height = this.set('height',this.$().parents('md-card-content').height());

    var zoom = d3.zoom()
        .on("zoom", ()=>context.zoom(context));

    var svg = d3.select("svg");
    svg.attr("width", this.get('width'));
    svg.attr("height", this.get('width'));
    svg.call(zoom);

    //setup simulation forces (how the graph moves)
    var simulation = d3.forceSimulation()
        .alphaMin(0.0001)
        // .force("link", d3.forceLink().id(function(d) { return d.id; }).distance(context.get('simulationdistance')).strength(context.get('simulationstrength')))
        .force("charge", d3.forceManyBody().strength(function (d) {return context.get('simulationrepulsiveforce')}))
        // .force("center", d3.forceCenter(width / 2, height / 2))
        .velocityDecay(.6)
        .on("tick", ()=> Ember.run.scheduleOnce('render', context, context.simulationticked));
    this.set('simulation', simulation);

    // create scale objects
    var xAxisScale = this.set('xAxisScale', d3.scaleLinear()
      .domain([-width/2,width/2])
      .range([0,width]));

    var yAxisScale = this.set('yAxisScale', d3.scaleLinear()
      .domain([-height/2,height/2])
      .range([height,0]));

    // create axis objects
    var xAxis = this.set('xAxis', d3.axisBottom(xAxisScale));
    var yAxis = this.set('yAxis', d3.axisLeft(yAxisScale));
    // Draw Axis
    var xaxislayer = this.set('xaxislayer',svg.append("g")
        .attr("class", "axis xaxis-layer")
        .attr("transform", "translate(40," + 0+ ")")
        .call(xAxis));

    var yaxislayer = this.set('yaxislayer', svg.append("g")
        .attr("class", "axis yaxis-layer")
        .attr("transform", "translate(40," + 0+ ")")
        .call(yAxis));

    var zoomview = svg.append("rect")
      .attr("class", "zoom")
      .attr("width", width)
      .attr("height", height)
      .call(zoom);

    var markerlayer = svg.append("g").attr("class", "marker-layer")

    this.set('markerlayer', markerlayer);

    var linklayer = svg.append("g").attr("class", "link-layer");
    this.set('linklayer', linklayer);

    var nodelayer = svg.append("g").attr("class", "node-layer");
    this.set('nodelayer', nodelayer);

    var textlayer = svg.append("g").attr("class", "text-layer")
    this.set('textlayer', textlayer);
    // Schedule a call to our the render method
    Ember.run.scheduleOnce('render', this, this.update);
  },
  update() {
    var svg = this.get('svg');
    var simulation = this.get('simulation');
    var context = this;

    var markerlayer = this.get('markerlayer');
    var linklayer = this.get('linklayer');
    var nodelayer = this.get('nodelayer');
    var textlayer = this.get('textlayer');

    var graph = {nodes: this.get('nodes'), links: this.get('links')};

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

    marker_objects.exit().remove();
    //
    //Setup edges and draw them on the graph - attaching a new svg line for each edge
    var link_objects = linklayer.selectAll("line").data(graph.links);
    link_objects.enter().append("line")
      .attr("class", function(d) { return "link " + d.type; })
      .attr("marker-end", function(d) { return "url(#" + d.type + ")"; });

    link_objects.exit().remove();

    //update nodes in the graph, entering a new svg circle of radius r for each node. Each node also has a handler for drag events
    var node_objects= nodelayer.selectAll("circle").data(graph.nodes, function(d) { return d.id;});
    node_objects.exit().remove();
    node_objects.enter().append("circle").attr("r", this.get('noderadius'))
        .call(d3.drag()
            .on("start", (d, i) => context.dragstarted(d, i, context))
            .on("drag", (d, i) => context.dragged(d, i, context))
            .on("end", (d, i) => context.dragended(d, i, context)));

    //update text labels, each node should have a label corresponding to its id
    var text_objects;
    if(this.get('labels')){
      text_objects = textlayer.selectAll("text").data(graph.nodes, function(d) { return d.id;});
      text_objects.enter().append("svg:text")
        .attr("x", 8)
        .attr("y", ".31em")
        .text(function(d) { return d.id; });

    } else{
        text_objects = textlayer.selectAll("text").data({}, function(d) { return d.id;});
        text_objects.exit().remove();
    }


    // Restart the force layout.
    // simulation.alpha(1).restart();
    // this.set('simulation', simulation);

    //update nodes and link data in the simulation
    var nodes = simulation.nodes(graph.nodes);
    if(this.get('linkforce')){
      var links = simulation.force("link", d3.forceLink()
        .links(graph.links)
        .id(function(d) { return d.id; })
        .distance(context.get('simulationdistance'))
        .strength(function (d) {return context.get('simulationstrength')}));
    }
    else {
      var links = simulation.force("link", d3.forceLink()
        .links(graph.links)
        .id(function(d) { return d.id; })
        .distance(function(d) { return Math.pow(Math.pow(d.source.x-d.target.x,2) + Math.pow(d.source.y-d.target.y,2), 1/2) })
        .strength(function (d) {return context.get('simulationstrength')}));
    }
    // console.log('Update Finished');
    this.set('updating', false);
    // Ember.run.scheduleOnce('render', this, this.update);
  },
  dragstarted (d, i, context) {
    //log starting position on element d when acted upon by a d3 event
    //see https://github.com/d3/d3-force#simulation_nodes

    if (!d3.event.active) this.get('simulation').alphaTarget(0.3).restart();
    d.fx = d.x;
    d.fy = d.y;
  },
  dragged (d, i, context) {
    //handle a drag event by setting the element d's position to the new x,y position identified by the event
    d.fx = d3.event.x;
    d.fy = d3.event.y;
  },

  dragended (d, i, context) {
    //clear effect (fx) params when the event ends
    if (!d3.event.active) this.get('simulation').alphaTarget(0);
    d.fx = null;
    d.fy = null;
  },
  addLink (sourceId, targetId) {
    var links = this.get('links');
    var sourceNode = this.findNode(sourceId);
    var targetNode = this.findNode(targetId);

    if((sourceNode !== undefined) && (targetNode !== undefined)) {
        links.push({"source": sourceNode, "target": targetNode});
        this.update();
    }
  },
  // Add and remove elements on the graph object
  addNode (node) {
    // console.log('addnode');
    // console.log(id);

    this.get('nodes').push(node);
  },
  removeNode (id) {
    var nodes = this.get('nodes');
    var links = this.get('links');
    var i = 0;
    var n = this.findNode(id);
    while (i < links.length) {
        if ((links[i]['source'] === n)||(links[i]['target'] == n)) links.splice(i,1);
        else i++;
    }
    var index = this.findNodeIndex(id);
    if(index !== undefined) {
        nodes.splice(index, 1);
        this.update();
    }
  },
  findNode (id) {
    var nodes = this.get('nodes');
    for (var i=0; i < nodes.length; i++) {
        if (nodes[i].id === id)
            return nodes[i]
    }
  },
  findNodeIndex (id) {
    var nodes = this.get('nodes');
    for (var i=0; i < nodes.length; i++) {
        if (nodes[i].id === id)
            return i
    }
  },
});
