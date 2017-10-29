import Component from '@ember/component';

// Import the D3 packages we want to use

import Ember from 'ember'
import d3 from 'npm:d3'

export default Component.extend({

  tagName: 'svg',
  classNames: ['awesome-d3-widget'],

  width: 1000,
  height: 1000,

  attributeBindings: ['width', 'height'],

  // Array of points to render as circles in a line, spaced by time.
  //  [ {value: Number, timestamp: Number } ];
  canvas: null,



  didReceiveAttrs() {
    // Schedule a call to our the render method
    Ember.run.scheduleOnce('render', this, this.initgraph);
  },
  initgraph(){

    //initialize svg element for later use
    var svg = d3.select("svg"),
        width = +svg.attr("width"),
        height = +svg.attr("height");

    //simulation is an evolving movement-oriented directed force graph, see d3.force
    var simulation = d3.forceSimulation()
        .force("link", d3.forceLink().id(function(d) { return d.id; }).distance(100).strength(1))
        .force("charge", d3.forceManyBody())
        .force("center", d3.forceCenter(width / 2, height / 2));

    var graph = {nodes: this.get('nodes'), links: this.get('links')};

    //Setup edges and draw them on the graph - attaching a new svg line for each edge
    // var link = svg.append("g").attr("class", "links").selectAll("polyline").data(graph.links).enter().append("polyline")
    var marker = svg.append("g").attr("class", "markers").selectAll("marker")
        .data(["dotted", "solid"])
      .enter().append("svg:marker")
        .attr("id", String)
        .attr("viewBox", "0 -5 10 10")
        .attr("refX", 12)
        .attr("markerWidth", 10)
        .attr("markerHeight", 10)
        .attr("orient", "auto")
      .append("svg:path")
        .attr("d", "M0,-5L10,0L0,5");


    //Setup nodes in the graph, entering a new svg line for each node. r is the radius of the node. Each node also has a handler for drag events

    var link = svg.append("g").attr("class", "links").selectAll("line")
        .data(graph.links)
        .enter().append("line")
        .attr("class", function(d) { return "link " + d.type; })
        .attr("marker-end", function(d) { return "url(#" + d.type + ")"; });

    var node = svg.append("g").attr("class", "nodes").selectAll("circle").data(graph.nodes).enter().append("circle")
        .attr("r", 5)
        .call(d3.drag()
            .on("start", dragstarted)
            .on("drag", dragged)
            .on("end", dragended));
    var text = svg.append("g").attr("class", "text").selectAll("g")
        .data(graph.nodes)
      .enter().append("svg:g");

    text.append("svg:text")
      .attr("x", 8)
      .attr("y", ".31em")
      .attr("class", "shadow")
      .text(function(d) { return d.id; });

    text.append("svg:text")
      .attr("x", 8)
      .attr("y", ".31em")
      .text(function(d) { return d.id; });

    //enable labels for each node
    node.append("title").text(function(d) { return d.id; });

    //keep graph moving, invoking the ticked handler each time it changes
    simulation.nodes(graph.nodes).on("tick", ticked);

    simulation.force("link")
        .links(graph.links);


    function ticked() {
      //update the position of the edge x,y pairs
      link
          .attr("x1", function(d) { return d.source.x; })
          .attr("y1", function(d) { return d.source.y; })
          .attr("x2", function(d) { return d.target.x; })
          .attr("y2", function(d) { return d.target.y; });

      //update the position of the node x,y pairs
      node
          .attr("cx", function(d) { return d.x; })
          .attr("cy", function(d) { return d.y; });

      text.attr("transform", function(d) {
        return "translate(" + d.x + "," + d.y + ")";
      });
    }

    function dragstarted(d) {
      //log starting position on element d when acted upon by a d3 event
      //see https://github.com/d3/d3-force#simulation_nodes
      if (!d3.event.active) simulation.alphaTarget(0.3).restart();
      d.fx = d.x;
      d.fy = d.y;
    }

    function dragged(d) {
      //handle a drag event by setting the element d's position to the new x,y position identified by the event
      d.fx = d3.event.x;
      d.fy = d3.event.y;
    }

    function dragended(d) {
      //clear effect (fx) params when the event ends
      if (!d3.event.active) simulation.alphaTarget(0);
      d.fx = null;
      d.fy = null;
    }

  },
  nodes: [
    {id: "GO:000001", group: 1},
    {id: "GO:000002", group: 1},
    {id: "GO:000003", group: 1},
    {id: "GO:000004", group: 1},
    {id: "GO:000005", group: 1},
  ],
  links: [
    {source: "GO:000001", target: "GO:000002", type:"dotted", value: 1},
    {source: "GO:000001", target: "GO:000003", type:"dotted", value: 1},
    {source: "GO:000001", target: "GO:000004", type:"dotted", value: 1},
    {source: "GO:000001", target: "GO:000005", type:"dotted", value: 1},
    {source: "GO:000002", target: "GO:000003", type:"solid", value: 1},
  ],
});
