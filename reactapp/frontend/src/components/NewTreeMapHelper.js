import * as d3 from "d3";
import {
  getRandomInt,
  getGroupFileAndRotationFromID,
  pushOrCreate,
  pushOrCreateWithoutDuplicates,
  dangerSorted,
  colorBrewerScheme14Qualitative
} from "../utils/utils";
import {
  getIucnColor,
  citesAppendixSorted,
  iucnCategoriesSorted,
  citesAssessment,
  iucnAssessment,
  bgciAssessment
} from "../utils/timelineUtils";
import { json, linkHorizontal } from "d3";

class D3BarChart {
  constructor(param) {
    this.id = param.id;
    this.data = param.data;

    this.setSelected = param.setSelected;
    this.selected = param.selected;

    this.kingdom = param.kingdom;
    this.genus = param.genus;
    this.species = param.species;
    this.familia = param.familia;

    this.filter = param.filter;
    this.setFilter = param.setFilter;

    this.zoomArray = [];

    this.node = null;
    this.initial = true;

    this.margin = {
      top: 10,
      right: 10,
      bottom: 10,
      left: 10
    };

    this.initWidth = window.innerWidth / 2 - 10;
    this.initHeight = window.innerHeight / 2 - 50;

    this.currentTransform = [
      this.initWidth / 2,
      this.initHeight / 2,
      this.initHeight
    ];

    this.padding = {
      top: 0,
      right: 0,
      bottom: 0,
      left: 0
    };

    d3.selection.prototype.moveToFront = function () {
      this.each(function () {
        this.parentNode.appendChild(this);
      });
    };

    //this.paint();
    this.clearAndReset();
  }

  setNodeAsFilter(node) {
    let filter = {};
    switch (node.depth) {
      case 0:
        filter = {
          kingdom: null,
          familia: null,
          genus: null,
          species: null
        };
        break;
      case 1:
        filter["kingdom"] = [node.data.name];
        filter["familia"] = null;
        filter["genus"] = null;
        filter["species"] = null;
        break;
      case 2:
        filter["familia"] = [node.data.name];
        filter["genus"] = null;
        filter["species"] = null;
        break;
      case 3:
        filter["genus"] = [node.data.name];
        filter["species"] = null;
        break;
      case 4:
        filter["species"] = [node.data.name];
        break;
      default:
        break;
    }
    this.setFilter(filter);
  }

  tooltipMove(event) {
    let tooltip = d3.select(".tooltip");
    tooltip
      .style("left", event.pageX + 25 + "px")
      .style("top", event.pageY + 25 + "px");
  }

  getTooltip(d) {
    let text = "<b><i>" + d.data.name + "</i></b><br>";
    text += d.value + " Species";

    return text;
  }

  tooltip(d, event, highlight) {
    let tooltip = d3.select(".tooltip");

    if (highlight) {
      tooltip
        .html(this.getTooltip(d))
        .style("display", "block")
        .style("left", event.pageX + 25 + "px")
        .style("top", event.pageY + 25 + "px");
    } else {
      tooltip.style("display", "none");
    }
  }

  clearAndReset() {
    d3.selectAll("#" + this.id + " > *").remove();

    this.width = this.initWidth - this.margin.left - this.margin.right;
    this.height = this.initHeight - this.margin.top - this.margin.bottom - 47;

    this.x = d3.scaleLinear().rangeRound([0, this.width]);
    this.y = d3.scaleLinear().rangeRound([0, this.height]);

    let content = d3.select("#" + this.id);

    this.svg = content
      .append("svg")
      .attr("id", "chartArea")
      .attr("viewBox", [0, 0, this.width, this.height])
      .style("font", "10px sans-serif")
      .attr("width", this.width)
      .attr("height", this.height)
      .style("box-sizing", "border-box");

    if (this.data) {
      let data = this.treemap(this.data);

      if (data.children) {
        //filter treemap for selected entry
        data = this.searchForFilter(data);
      }

      let boundFunc = this.newPaint.bind(this);

      this.svgGroup = this.svg
        .append("g")
        .attr(
          "transform",
          "translate(" + this.padding.left + "," + this.padding.top + ")"
        )
        .call(boundFunc, data);

      /* if (this.kingdom) {
      } else {
        this.newPaint(data);
      } */

      /*       setTimeout(function () {
        if (this.node) {
          this.node.filter((d) =>
            d.data.name === "Plantae" ? boundZoomIn(d) : false
          );
        }
      }, 50); */
    }
    /*  this.svg.append("text")
             .text(this.text)
             .attr("transform",
                 "translate(" + this.margin.left + "," + this.margin.top + ")");
  */

    /*   this.container = svg.append("g")
              .attr("id", "wrapper");
  
          this.container.append("g")
              .attr("id", "selectChart");
  
          d3.select("#selectmainpartWrapper").append("svg")
              .attr("id", "selectmainpartSVG")
              .style("display", "none"); */
  }

  zoom(d) {
    this.zoomArray.push(d.data.name);
    this.transition(d);
  }

  transition(d) {
    if (d) {
      const i = d3.interpolateZoom(this.currentTransform, [
        d.x0,
        d.y0,
        Math.max(d.y1 - d.y0, d.x1 - d.x0)
      ]);

      this.svg
        .transition()
        .delay(250)
        .duration(i.duration)
        .attrTween(
          "transform",
          () => (t) => this.transform((this.currentTransform = i(t)))
        )
        .on("end", this.transition);
    }
  }

  transform([x, y, w]) {
    return `
        translate(${this.initWidth / 2}, ${this.initHeight / 2})
        scale(${this.initHeight / w})
        translate(${-x}, ${-y})
        `;
  }

  tile(node, x0, y0, x1, y1) {
    d3.treemapBinary(node, 0, 0, this.width, this.height);
    for (const child of node.children) {
      child.x0 = x0 + (child.x0 / this.width) * (x1 - x0);
      child.x1 = x0 + (child.x1 / this.width) * (x1 - x0);
      child.y0 = y0 + (child.y0 / this.height) * (y1 - y0);
      child.y1 = y0 + (child.y1 / this.height) * (y1 - y0);
    }
  }

  treemap = (data) =>
    d3.treemap().tile(this.tile.bind(this))(
      d3
        .hierarchy(data)
        .sum((d) => d.value)
        .sort((a, b) => b.value - a.value)
    );

  getName = (d) =>
    d
      .ancestors()
      .reverse()
      .map((d) => d.data.name)
      .slice(1)
      .join(" / ");

  newPaint(group, root) {
    /* this.selected = root.data.name;
    this.setSelected(root.data.name); */
    if (!this.data) {
      return;
    }

    /*     console.log("root", root.children);
    if (root.children) {
      let kingdom = this.kingdom;
      console.log("Kingdom", kingdom);
      let filteredData = root.children.filter((d) =>
        kingdom ? d.data.name === kingdom : true
      );
      console.log(filteredData);
    } */

    let data = null;
    if (root.children) {
      data = root.children.concat(root).filter((d) => d.value > 0);
    } else {
      let copyRoot = { ...root, wurzel: 1 };
      data = [copyRoot, root];
    }
    let format = d3.format(",d");

    this.node = group
      .selectAll("g.treeGroup")
      .data(data)
      .join("g")
      .attr("class", "treeGroup")
      .on("mouseenter", (e) => this.tooltip(e, d3.event, true))
      .on("mouseleave", (e) => this.tooltip(e, d3.event, false))
      .on("mousemove", (e) => this.tooltipMove(d3.event));

    let boundZoomOut = this.zoomout.bind(this);
    let boundZoomIn = this.zoomin.bind(this);

    this.node
      //.filter((d) => (d === root ? d.parent : d.children))
      .attr("cursor", (d) => {
        return d === root ? "" : "pointer";
      })
      .on("click", (d) => (d === root ? () => {} : boundZoomIn(d)));

    let boundSet = this.setNodeAsFilter.bind(this);

    /*   this.node
      .filter((d) => !d.children)
      .attr("cursor", (d) => {
        return d === root ? "" : "pointer";
      })
      .on("click", (d, e, i) => {
        boundSet(d);
      }); */
    //this.setNodeAsFilter.bind(this)
    /* this.node
        .append("title")
        .text((d) => `${getName(d)}\n${format(d.value)}`); */

    let boundSearch = this.searchForImage.bind(this);

    let nodeContainers = this.node
      .filter((d) => (root.depth === 4 ? true : d.depth > root.depth))
      .selectAll("foreignObject")
      .data((d, i) => {
        if (d.children) {
          return d.children.flat().map((e) => {
            e["parentX"] = d.x0;
            e["parentY"] = d.y0;
            e.i = i;
            return e;
          });
        } else {
          d["parentX"] = d.x0;
          d["parentY"] = d.y0;

          d.i = i;
          return [d];
        }
      })
      .enter()
      .append("foreignObject")
      .attr("class", "nodeImgContainer")
      .attr("x", function (d) {
        return 0;
      })
      .attr("y", function (d) {
        return d.y0;
      })
      .append("xhtml:div")
      .attr("class", "nodeImgContainerDiv")
      .html((d) => {
        let link = boundSearch(d);
        if (link) {
          return (
            '<div class="nodeText">' +
            "" +
            '</div><img class="nodeImage" style="vertical-align:text-top" src="' +
            link +
            '"/>'
          );
        } else {
          /* console.log(d);
            let color = colorBrewerScheme14Qualitative[d.i % colorBrewerScheme14Qualitative.length]; */
          return (
            '<div class="nodeText">' +
            "" +
            '</div><div class="nodeImage" style="width=100%;height=100%;background-color:rgba(41,49,51,0.2);border:solid gray 1px !important;"></div>'
          );
        }
      });

    let nodeIconContaines = nodeContainers
      .filter((d) => {
        return d.depth === 4;
      })
      .append("xhtml:div")
      .attr("class", "nodeIconContainerDiv")
      .style("width", "20px")
      .style("height", "20px")
      .style("left", "5px")
      .style("bottom", "5px")
      .style("background-color", "rgba(41,49,51,0.7)")
      .style("border-radius", "50%")
      .style("position", "absolute");

    nodeIconContaines.each(function (d, i) {
      let node = d3.select(this);
      let color =
        d.data.economically !== undefined
          ? d.data.economically.getColor()
          : "gray";
      let secondColor =
        d.data.ecologically !== undefined
          ? d.data.ecologically.getColor()
          : "gray";

      if (d.data.kingdom === "Animalia") {
        d3.svg("/animalIcon.svg").then(function (xml) {
          let icon = node.node().appendChild(xml.documentElement);
          d3.select(icon)
            .attr("width", 18)
            .attr("height", 17)
            .style("margin-top", "1.5px")
            .style("margin-left", "1.5px");

          d3.select(icon).select(".left").select("path").style("fill", color);
          d3.select(icon)
            .select(".right")
            .select("path")
            .style("fill", secondColor);
        });
      } else {
        d3.svg("/plantIcon2.svg").then(function (xml) {
          let icon = node.node().appendChild(xml.documentElement);
          d3.select(icon)
            .attr("width", 18)
            .attr("height", 17)
            .style("margin-top", "1.5px")
            .style("margin-left", "1.5px");

          d3.select(icon).select(".left").select("path").style("fill", color);
          d3.select(icon)
            .select(".right")
            .select("path")
            .style("fill", secondColor);
        });
      }
    });

    this.node
      .append("rect")
      .attr("id", (d) => {
        d.leafUid = d.data.name + "rect";
        return d.data.name + "rect";
      })
      .attr("fill", (d) =>
        d === root ? "#fff" : d.depth === 0 ? "#fff" : "none"
      )
      .style("stroke", "#fff")
      .style("stroke-width", 8);

    this.node
      .append("clipPath")
      .attr("id", (d) => {
        d.clipUid = d.data.name + "clip";
        return d.data.name + "clip";
      })
      .append("use")
      .attr("xlink:href", (d) => d.leafUid.href);

    let rootTitle = (this.getName(root) + " " + format(root.value)).trim();

    this.node
      .append("text")
      .attr("clip-path", (d) => d.clipUid)
      .attr("font-weight", (d) => (d === root ? "bold" : null))
      .selectAll("tspan")
      .data((d) => {
        if (d === root) {
          return [rootTitle];
        } else {
          if (d.depth === 4) {
            return [d.data.name.split(" ").slice(1).join(" "), format(d.value)];
          } else {
            return [d.data.name, format(d.value)];
          }
        }
      })
      .join("tspan")
      .attr("x", (d) => (d === rootTitle && rootTitle.includes(" ") ? 60 : 5))
      .attr(
        "y",
        (d, i, nodes) => `${(i === nodes.length - 1) * 0.3 + 1.2 + i * 0.9}em`
      )
      .attr("fill-opacity", (d, i, nodes) =>
        i === nodes.length - 1 ? 0.7 : null
      )
      .attr("font-weight", (d, i, nodes) =>
        i === nodes.length - 1 ? "normal" : null
      )
      .style("fill", (d) => {
        return rootTitle === d ? "black" : "white";
        /* return "black"; */
      })
      .style("stroke", "none")
      /* .style("stroke", (d, i, nodes) => {
          return rootTitle === d ? "black" : "white";
        }) */
      .style("text-shadow", (d) => {
        return rootTitle === d ? "none" : "1px 1px 2px #656565";
      })
      .style("font-size", (d) => "initial")
      .style("font-weight", "bold")
      .style("font-style", "italic")
      .text((d) => d);

    nodeContainers
      .filter((e) => e.data.dummylink)
      .append("div")
      .style("width", "100%")
      .style("height", "100%")
      .style("position", "absolute")
      .style("top", "0")
      .style("left", "0")
      .style("background-color", "rgba(128,128,128,0.26)");

    d3.select("#treeMapBackButtonWrapper > svg > *").remove();

    let backButton = d3
      .select("#treeMapBackButtonWrapper > svg")
      .append("g")
      .attr("class", "backButton")
      .attr("transform", "translate(" + 10 + " " + 0 + ")")
      .style("cursor", "pointer")
      .style("display", () => (root.depth > 0 ? "block" : "none"))
      .on("mouseover", function (e) {
        d3.select(this)
          .select("path")
          .style("stroke", "rgb(95, 77, 73)")
          .style("stroke-opacity", 0.7)
          .style("stroke-width", 2)
          .style("stroke-linejoin", "round")
          .style("fill", "var(--highlight)");
      })
      .on("mouseout", function (e) {
        d3.select(this)
          .select("path")
          .style("stroke", "var(--black)")
          .style("stroke-opacity", 1)
          .style("stroke-width", 0.5)
          .style("stroke-linejoin", "miter")
          .style("fill", "var(--main)");
      })
      .on("click", () => boundZoomOut(root));

    let backPath = backButton
      .append("path")
      .attr("d", "m 5 0 l 40 0 l 0 25 l -40 0 l -15 -12.5 z")
      .style("fill", "var(--main)")
      .style("stroke", "black")
      .style("stroke-width", 0.5);

    let pathForText = backButton
      .append("path")
      .attr("d", "m 5 12.5 l 40 0")
      .attr("id", "backPathForText");

    let backText = backButton
      .append("text")
      .append("textPath")
      .attr("xlink:href", "#backPathForText")
      .style("line-height", "1em")
      .style("stroke", "var(--black)")
      .style("fill", "var(--black)")
      .style("font-size", "small")
      .style("dominant-baseline", "central")
      .attr("class", "textonpath noselect")
      .text("Back");

    group.call(this.position.bind(this), root);
  }

  position(group, root) {
    group
      .selectAll("g.treeGroup")
      .attr("transform", (d) => {
        return d === root
          ? `translate(0,-30)`
          : `translate(${this.x(d.x0)},${this.y(d.y0)})`;
      })
      .select("rect")
      .attr("width", (d) =>
        d === root ? this.width : this.x(d.x1) - this.x(d.x0)
      )
      .attr("height", (d) => (d === root ? 30 : this.y(d.y1) - this.y(d.y0)));

    group
      .selectAll("foreignObject")
      .attr("transform", (d) => {
        return d === root
          ? `translate(0,-30)`
          : `translate(${this.x(d.x0) - this.x(d["parentX"])},${
              this.y(d.y0) - this.y(d["parentY"])
            })`;
      })
      .attr("width", (d) =>
        d === root ? this.width : this.x(d.x1) - this.x(d.x0)
      )
      .attr("height", (d) => (d === root ? 30 : this.y(d.y1) - this.y(d.y0)));

    /* let boundZoomIn = this.searchAndZoom.bind(this);
    if (this.initial) {
      this.initial = false;
      setTimeout(
        function () {
          this.node.filter((d) => {
            boundZoomIn(d);
            return true;
          });
        }.bind(this),
        10
      );
    } */

    //this.setNodeAsFilter(root);
  }

  searchForImage(elements) {
    if (elements.data.link) {
      return elements.data.link;
    } else if (elements.data.dummylink) {
      return elements.data.dummylink;
    } else if (elements.children) {
      return this.searchForImage(
        elements.children.sort((a, b) => {
          if (a.data.link) return -50;
          if (b.data.link) return 50;
          return b.value - a.value;
        })[0]
      );
    }
  }

  searchAndZoom(elements) {
    /* console.log(elements, this.selected); */
    /* if (this.selected && elements.data.name === this.selected) {
      this.zoomin(elements);
    } else if (elements.children) {
      for (let child of elements.children) {
        this.searchAndZoom(child);
      }
    } */
  }

  flatten(root) {
    /* if()
    return; */
    /* return i_arr.reduce(
      (acc, cur) =>
        acc.concat(
          Array.isArray(cur.children)
            ? this.flatten(cur.children.concat(i_arr))
            : cur
        ),
      []
    ); */
  }

  searchForFilter(root) {
    let filterNames = [
      this.kingdom,
      this.familia,
      this.genus,
      this.species
    ].filter((e) => (e ? true : false));

    let filterName = filterNames.join(" / ");

    let found = null;

    if (filterName !== "") {
      root.each((e) => {
        if (this.getName(e) === filterName) {
          found = e;
        }
      });
    }

    return found ? found : root;
  }

  search(root, sel) {
    let found = null;
    root.each((e) => {
      if (e.data.name === sel) {
        found = e;
      }
    });

    return found;
  }

  // When zooming in, draw the new nodes on top, and fade them in.
  zoomin(d) {
    this.setNodeAsFilter(d);

    /* let boundPaint = this.newPaint.bind(this);

    const group0 = this.svgGroup.attr("pointer-events", "none");
    const group1 = (this.svgGroup = this.svg.append("g").call(boundPaint, d));

    this.x.domain([d.x0, d.x1]);
    this.y.domain([d.y0, d.y1]);

    let boundPosition = this.position.bind(this);

    group0.remove().call(boundPosition, d.parent);

    group1.call(boundPosition, d); */

    /* let boundPosition = this.position.bind(this);
    this.svg
      .transition()
      .duration(750)
      .call((t) => group0.transition(t).remove().call(boundPosition, d.parent))
      .call((t) =>
        group1
          .transition(t)
          .attrTween("opacity", () => d3.interpolate(0, 1))
          .call(boundPosition, d)
      ); */
  }

  // When zooming out, draw the old nodes on top, and fade them out.
  zoomout(d) {
    this.setNodeAsFilter(d.parent);
    /*  const group0 = this.svgGroup.attr("pointer-events", "none");
    const group1 = (this.svgGroup = this.svg
      .insert("g", "*")
      .call(this.newPaint.bind(this), d.parent));

    this.x.domain([d.parent.x0, d.parent.x1]);
    this.y.domain([d.parent.y0, d.parent.y1]);

    group0.remove().call(this.position.bind(this), d);
    group1.call(this.position.bind(this), d.parent); */

    /* this.svg
      .transition()
      .duration(750)
      .call((t) =>
        group0
          .transition(t)
          .remove()
          .attrTween("opacity", () => d3.interpolate(1, 0))
          .call(this.position.bind(this), d)
      )
      .call((t) =>
        group1.transition(t).call(this.position.bind(this), d.parent)
      ); */
  }

  paint() {
    this.clearAndReset();

    let svg = this.svg;
    let data = this.data;
    let width = this.width - this.padding.left - this.padding.right;
    let height = this.height - this.padding.top - this.padding.bottom;
    let colorFunction = this.colorFunction;

    let defs = svg.append("defs");

    if (data !== undefined && Object.keys(data).length > 0) {
      /* svg.select(".xticks").selectAll(".tick").selectAll("text").remove();

            xticks.data(this.data)
                .append("svg:image")
                .attr("xlink:href", function (d) {
                    let returnPath = "/" + getGroupFileAndRotationFromID(d.group).filename;
                    return returnPath;
                })
                .attr("width", 20)
                .attr("height", 20)
                .attr("x", -10)
                .attr("y", 45); */

      var root = d3.hierarchy(data).sum(function (d) {
        return d.value;
      }); // Here the size of each leave is given in the 'value' field in input data

      // Then d3.treemap computes the position of each element of the hierarchy
      d3
        .treemap()
        .round(true)
        .size([width, height])
        .paddingInner(-2)
        .paddingOuter(6)
        .paddingTop(20)
        .paddingRight(10)(root);

      let kingdomWrappers = svg
        .selectAll(".kingdomWrapper")
        .data(
          root.descendants().filter((d) => {
            return d.depth == 1 && d.children && d.children.length > 0;
          })
        )
        .enter()
        .append("rect")
        .attr("class", "kingdomWrapper")
        .attr("x", (d) => d.x0)
        .attr("y", (d) => d.y0)
        .attr("width", (d) => d.x1 - d.x0)
        .attr("height", (d) => d.y1 - d.y0)
        .style("stroke", "black")
        .style("fill", "white")
        .on("click", this.zoom.bind(this));

      let familyWrappers = svg
        .selectAll(".familyWrapper")
        .data(
          root.descendants().filter((d) => {
            return d.depth == 2 && d.children && d.children.length > 0;
          })
        )
        .enter()
        .append("rect")
        .attr("class", "familyWrapper")
        .attr("x", (d) => d.x0)
        .attr("y", (d) => d.y0)
        .attr("width", (d) => d.x1 - d.x0)
        .attr("height", (d) => d.y1 - d.y0)
        .style("stroke", "black")
        .style("fill", "none");

      let genusWrappers = svg
        .selectAll(".genusWrappers")
        .data(
          root.descendants().filter((d) => {
            return d.depth == 3 && d.children && d.children.length > 0;
          })
        )
        .enter()
        .append("rect")
        .attr("class", "familyWrapper")
        .attr("x", (d) => d.x0)
        .attr("y", (d) => d.y0)
        .attr("width", (d) => d.x1 - d.x0)
        .attr("height", (d) => d.y1 - d.y0)
        .style("stroke", "black")
        .style("fill", "none");

      if (this.zoomArray.length === 0) {
        let nodeContaines = svg
          .selectAll(".nodeImgContainer")
          .data(
            root.descendants().filter((d) => {
              return d.depth == 3 && d.children && d.children.length > 0;
            })
          )
          .enter()
          .append("foreignObject")
          .attr("class", "nodeImgContainer")
          .attr("x", function (d) {
            return d.x0;
          })
          .attr("y", function (d) {
            return d.y0;
          })
          .attr("width", function (d) {
            return d.x1 - d.x0;
          })
          .attr("height", function (d) {
            return d.y1 - d.y0;
          })
          .append("xhtml:div")
          .attr("class", "nodeImgContainerDiv")
          .html((d) => {
            let link = d.data.children.sort((a, b) => {
              if (a.data.link) return -50;
              if (b.data.link) return 50;
              return b.value - a.value;
            })[0].link;
            return (
              '<div class="nodeText">' +
              "" +
              '</div><img class="nodeImage" style="vertical-align:text-top" src="' +
              link +
              '"/>'
            );
          });
        /* .on('click', d => {console.log("CLICK", d);}) */
      }

      /* let nodeContaines = svg
                .selectAll(".nodeImgContainer")
                .data(root.leaves().filter((d) => { return d.value > 0; }))
                .enter()
                .append("foreignObject")
                .attr("class", "nodeImgContainer")
                .attr('x', function (d) { return d.x0; })
                .attr('y', function (d) { return d.y0; })
                .attr('width', function (d) { return d.x1 - d.x0; })
                .attr('height', function (d) { return d.y1 - d.y0; })
                .append('xhtml:div')
                .attr("class", "nodeImgContainerDiv")
                .html(d => '<div class="nodeText">' + d.data.name + '</div>') //<a target="_blank" href="' + d.data.link + '"><img class="nodeImage" style="vertical-align:text-top" src="' + d.data.link + '"/></a>
            //<div class="nodeValue">'+d.data.value+'</div> */

      /*             let nodeIconContaines = nodeContaines
                .append('xhtml:div')
                .attr("class", "nodeIconContainerDiv")
                .style("width", "20px")
                .style("height", "20px")
                .style("left", "5px")
                .style("top", "5px")
                .style("position", "absolute"); */

      /*             nodeIconContaines.each(function(d, i) {
                let node = d3.select(this);

                let color = d.data.economically !== undefined ? d.data.economically.getColor() : "gray";
                let secondColor = d.data.ecologically !== undefined ? d.data.ecologically.getColor() : "gray";

                 if (d.data.Kingdom === "Animalia") {
                    d3.svg("/animalIcon.svg").then(function (xml) {
                        let icon = node.node().appendChild(xml.documentElement);
                        d3.select(icon).attr("width", 20).attr("height", 15).attr("y", 2.5);

                        d3.select(icon).select(".left").select("path").style("fill", color)
                        d3.select(icon).select(".right").select("path").style("fill", secondColor)
                    });
                }
                else {
                    d3.svg("/plantIcon2.svg").then(function (xml) {
                        let icon = node.node().appendChild(xml.documentElement);
                        d3.select(icon).attr("width", 20).attr("height", 15).attr("y", 2.5);

                        d3.select(icon).select(".left").select("path").style("fill", color)
                        d3.select(icon).select(".right").select("path").style("fill", secondColor) 
                    });
                } 
            }); */

      /*       svg
        .selectAll("titles")
        .data(
          root.descendants().filter(function (d) {
            return d.depth == 1 && d.children && d.children.length > 0;
          })
        )
        .enter()
        .append("text")
        .attr("x", function (d) {
          return d.x0 + 6;
        })
        .attr("y", function (d) {
          return d.y0 + 15;
        })
        .text(function (d) {
          return d.data.name;
        })
        .style("font-family", "sans-serif")
        .attr("fill", "black"); */

      /*       svg
        .selectAll("titles")
        .data(
          root.descendants().filter(function (d) {
            return d.depth == 2 && d.children && d.children.length > 0;
          })
        )
        .enter()
        .append("text")
        .attr("x", function (d) {
          return d.x0 + 6;
        })
        .attr("y", function (d) {
          return d.y0 + 15;
        })
        .text(function (d) {
          return d.data.name;
        })
        .style("font-size", "smaller")
        .style("font-family", "sans-serif")
        .attr("fill", "black"); */

      if (this.zoomArray.length > 0) {
        /*        svg
          .selectAll("titles")
          .data(
            root.descendants().filter(function (d) {
              return d.depth == 3 && d.children && d.children.length > 0;
            })
          )
          .enter()
          .append("text")
          .attr("x", function (d) {
            return d.x0 + 6;
          })
          .attr("y", function (d) {
            return d.y0 + 15;
          })
          .text(function (d) {
            return d.data.name;
          })
          .style("font-size", "smaller")
          .style("font-family", "sans-serif")
          .attr("fill", "black"); */
      }
    }
  }
}

const BarChartHelper = {
  draw: (input) => {
    new D3BarChart(input);
  },
  reset: (id) => {
    d3.selectAll("#" + id + " > *").remove();
  }
};

export default BarChartHelper;
