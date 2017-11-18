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
  simulationstrength: 0.5,
  simulationrepulsiveforce: -40,

  attributeBindings: ['width', 'height'],
  labels: false,
  linkforce: false,

  nodes: Ember.ArrayProxy.create({content: Ember.A()}),
  _nodes: Ember.computed.alias('nodes.content'),
  links: Ember.ArrayProxy.create({content: Ember.A()}),
  _links: Ember.computed.alias('links.content'),
  termloadingqueue: Ember.ArrayProxy.create({content: Ember.A()}),
  linkloadingqueue: Ember.ArrayProxy.create({content: Ember.A()}),
  renderEventQueue: Ember.ArrayProxy.create({content: Ember.A()}),
  currentScaleFactorX: 1,
  currentScaleFactorY: 1,

  updating: false,
  renderEventProcessor: Ember.observer('renderEventQueue.@each', function(){
    var renderEventQueue = this.get('renderEventQueue');
    var event = renderEventQueue.get('firstObject');
    if(renderEventQueue.get('length')>0&&event.type!==null){
      if (event.type === 'selectednode'){
        this.get('nodes').findBy('id', event.node.get('termid')).selected = true;
        var node_objects= this.get('nodelayer').selectAll("circle").data(this.get('_nodes'), function(d) { return d.id;});

        node_objects.attr("class", function(d){return d.selected ? d.group + ' selected' : d.group});
      }
      else if (event.type === 'deselectednode'){
        this.get('nodes').findBy('id', event.node.get('termid')).selected = false;
        var node_objects= this.get('nodelayer').selectAll("circle").data(this.get('_nodes'), function(d) { return d.id;});

        node_objects.attr("class", function(d){return d.selected ? d.group + ' selected' : d.group});
      }
    }
    renderEventQueue.popObject();
  }),
  updateLinks: Ember.observer('linkloadingqueue.@each', function(){
    var context = this;
    if(this.get('linkloadingqueue.length')>0){
      this.get('linkloadingqueue').forEach(function(link){
        context.get('links').addObject(link);
        context.get('linkloadingqueue').removeObject(link);
      });
      if(!context.get('updating')) {
        context.set('updating', true);
        Ember.run.scheduleOnce('render', this, this.renderGraph);
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
      this.updateLinkForces(this);
      this.get('simulation').alpha(.3).restart();
      this.simulationticked(this);
    }
  }),
  /*
   Turns text labels on or off and re-renders them depending on the toggle parameter `labels`
  */
  updateTextLabels(){
    var graph = {nodes: this.get('_nodes'), links: this.get('_links')};
    var textlayer = this.get('textlayer');
    var text_objects;
    if(this.get('labels')){
      text_objects = textlayer.selectAll("text").data(graph.nodes, function(d) { return d.id;});
      text_objects.enter().append("svg:text")
        .attr("x", function(d) { return d.x + d.enrichment.get('level')+5; })
        .attr("y", function(d) { return d.y + d.enrichment.get('level')/2; })
        .text(function(d) { return d.id; });

    } else{
        text_objects = textlayer.selectAll("text").data({}, function(d) { return d.id;});
        text_objects.exit().remove();
    }
  },
  /*
    Turns link forces on or off and re-renders them depending on the toggle parameter `linkforce`
  */
  updateLinkForces(){
    var context = this;
    var graph = {nodes: this.get('_nodes'), links: this.get('_links')};
    var simulation = this.get('simulation');
    if(this.get('linkforce')){
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
        .attr("x", function(d) { return d.x + d.enrichment.get('level')+5; })
        .attr("y", function(d) { return d.y + d.enrichment.get('level')/2; })

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
    this.set('markerlayer', svg.append("g").attr("class", "marker-layer"));

    // Layer for edges in the graph
    this.set('linklayer', svg.append("g").attr("class", "link-layer"));

    // Layer for node labels in the graph
    this.set('textlayer', svg.append("g").attr("class", "text-layer"));

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
    svg.append("rect")
      .attr("class", "zoom")
      .attr("width", width)
      .attr("height", height)
      .call(zoom);

    // Layer for nodes in the graph
    this.set('nodelayer', svg.append("g").attr("class", "node-layer"));

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
    var simulation = this.get('simulation');
    simulation.stop();
    var graph = {nodes: this.get('_nodes'), links: this.get('_links')};

    // Setup nodes in the graph, entering a new svg circle of radius enrichment.level for each node. Each node also has a handler for drag events
    var node_objects= nodelayer.selectAll("circle").data(graph.nodes, function(d) { return d.id;});
    node_objects.enter().append("circle").attr("r", function(d){return d.enrichment.get('level')})
        .call(d3.drag()
            .on("start", (d, i) => context.dragstarted(d, i, context))
            .on("drag", (d, i) => context.dragged(d, i, context))
            .on("end", (d, i) => context.dragended(d, i, context)))
        .attr("class", function(d){return d.selected ? d.group + ' selected' : d.group});

    // Setup edges and draw them on the graph - attaching a new svg line for each edge
    var link_objects = linklayer.selectAll("line").data(graph.links);
    link_objects.enter().append("line")
      .attr("class", function(d) { return "link " + d.type; })
      .attr("marker-end", function(d) { return "url(#" + d.type + ")"; });

    link_objects.exit().remove();

    // Setup text labels. If enabled each node should have a label corresponding to its id
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
