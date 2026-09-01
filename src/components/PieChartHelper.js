import * as d3 from "d3";
import * as d3Collection from "d3-collection";

class PieChartD3 {
  constructor(param) {
    this.id = param.id;
    this.data = param.data;
    this.colorBlind = param.colorBlind;
    this.treeThreatType = param.treeThreatType;
    this.getTreeThreatLevel = param.getTreeThreatLevel;
    this.width = param.width;
    this.height = param.height;
    this.showThreatDonuts = param.showThreatDonuts;

    this.strokeWidth = 2;

    d3.selection.prototype.moveToFront = function () {
      this.each(function () {
        this.parentNode.appendChild(this);
      });
    };

    this.paint();
  }

  paint() {
    d3.selectAll("#" + this.id + " > *").remove();

    let svg = d3
      .select("#" + this.id)
      .append("svg")
      .attr("width", this.width)
      .attr("height", this.height)
      .attr("x", 0)
      .attr("y", 0);

    let threats = [];
    for (let species of Object.keys(this.data)) {
      let threat = this.getTreeThreatLevel(species, this.treeThreatType);
      if (threat) threats.push(threat);
    }

    this.appendPie(svg, threats);
  }

  bakeTheThreatPie(options) {
    /*data and valueFunc are required*/
    if (!options.data || !options.valueFunc) {
      return "";
    }

    var data = options.data,
      valueFunc = options.valueFunc,
      r = options.outerRadius, //Default outer radius = 28px
      rInner = options.innerRadius ? options.innerRadius : r - 10, //Default inner radius = r-10
      strokeWidth = options.strokeWidth ? options.strokeWidth : 1, //Default stroke is 1
      pathClassFunc = options.pathClassFunc
        ? options.pathClassFunc
        : function () {
            return "";
          }, //Class for each path
      pathTitleFunc = options.pathTitleFunc
        ? options.pathTitleFunc
        : function () {
            return "";
          }, //Title for each path
      pieClass = options.pieClass ? options.pieClass : "marker-cluster-pie", //Class for the whole pie
      pieLabel = options.pieLabel ? options.pieLabel : d3.sum(data, valueFunc), //Label for the whole pie
      pieLabelClass = options.pieLabelClass
        ? options.pieLabelClass
        : "marker-cluster-pie-label", //Class for the pie label
      color = options.color,
      origo = r + strokeWidth, //Center coordinate
      w = origo * 2, //width and height of the svg element
      h = w,
      donut = d3.pie(),
      arc = d3.arc().innerRadius(rInner).outerRadius(r);

    /* let div = document.createElementNS("http://www.w3.org/1999/xhtml", "div"); */
    let div = d3.create("svg:g");

    //Create an svg element
    /* var svg = document.createElementNS("http://www.w3.org/2000/svg", 'svg'); */
    /* let svg = d3.create("g"); */
    //Create the pie chart

    var vis = div
      .append("svg:g")
      .data([data])
      .attr("class", pieClass)
      .attr("width", w + 2)
      .attr("height", h + 2)
      .style("position", "absolute");

    let donutData = donut.value(valueFunc).sort((a, b) => {
      return b.hasOwnProperty("values") && a.hasOwnProperty("values")
        ? b.values[0].numvalue - a.values[0].numvalue
        : b.numvalue - a.numvalue;
    });

    var arcs = vis
      .selectAll("g.arc")
      .data(donutData)
      .enter()
      .append("svg:g")
      //.attr('class', 'arc')
      .attr("class", function (d) {
        return "arc";
      })
      .attr("transform", "translate(" + origo + "," + origo + ")");

    /* arcs
      .append("svg:path")
      .attr("class", pathClassFunc)
      .attr("stroke-width", strokeWidth)
      .attr("fill", color)
      .attr("stroke", color)
      .attr("background", color)
      .attr("border-color", color)
      .attr("d", arc)
      .append("svg:title")
      .text(pathTitleFunc); */

    arcs
      .append("svg:path")
      .attr("class", pathClassFunc)
      .attr("stroke-width", strokeWidth)
      .attr("fill", color)
      .attr("stroke", color)
      .each(function (d) {
        this._current = { startAngle: 0, endAngle: 0 }; // Set initial state for animation
      })
      .transition()
      .duration(1000) // Define the duration of the animation
      .attrTween("d", function (d) {
        const interpolate = d3.interpolate(this._current, d);
        this._current = interpolate(1); // Update the current state
        return function (t) {
          return arc(interpolate(t));
        };
      })
      .selection() // Return the selection after transition
      .append("svg:title")
      .text(pathTitleFunc);

    /* var svg2 = document.createElementNS("http://www.w3.org/2000/svg", 'svg'); */
    /* var svg2 = d3.create('g'); */

    //Create the pie chart
    var vis2 = div
      .append("svg:g")
      .attr("class", pieClass + " text")
      .attr("width", w + 2)
      .attr("height", h + 2)
      .style("position", "absolute");

    vis2
      .append("circle")
      .attr("cx", origo)
      .attr("cy", origo)
      .attr("r", rInner - 1)
      .attr("fill", "white")
      .attr("stroke", this.showThreatDonuts === "white" ? "gray" : "none")
      .style("fill-opacity", "50%");

    vis2
      .append("text")
      .attr("x", origo)
      .attr("y", origo)
      .attr("class", pieLabelClass + "text")
      .attr("text-anchor", "middle")
      .attr("dy", ".3em")
      .style(
        "font-size",
        this.width >= 70 ? "initial" : this.width >= 40 ? "9" : "5"
      )
      // .style("font-weight", "bold")
      .style("display", options.data.length === 0 ? "none" : "block")
      .text(pieLabel);

    /* div.appendChild(svg);
        div.appendChild(svg2);*/ /*  */

    //Return the svg-markup rather than the actual element
    /* return serializeXmlNode(div.node()); */
    return div;
  }

  appendPie(group, threats) {
    let data = d3Collection
      .nest()
      .key(function (d) {
        return d.abbreviation;
      })
      .entries(threats, d3.map);

    let colorBlind = this.colorBlind;
    let pie = this.bakeTheThreatPie({
      data: data,
      strokeWidth: this.strokeWidth,
      outerRadius: this.width / 2 - this.strokeWidth,
      innerRadius: this.width / 3,
      instrument: false,
      color: (d) => {
        if (this.showThreatDonuts === "white") {
          return "white";
        } else {
          return d.data.values[0].getColor(colorBlind);
        }
      },
      pieClass: "clusterPie",
      pieLabelClass: "marker-cluster-pie-label",
      valueFunc: function (d) {
        return d.values.length;
      }
    });

    let innerGroup = group
      .append("g")
      .attr("x", 0)
      .attr("y", 0)
      .attr("class", "pieChartTest");

    if (innerGroup.node() != null) {
      innerGroup.node().appendChild(pie.node());
    }
  }
}

const PieChartHelper = {
  draw: (input) => {
    new PieChartD3(input);
  },
  reset: (id) => {
    d3.selectAll("#" + id + " > *").remove();
  }
};

export default PieChartHelper;
