import * as d3 from "d3";
import * as d3Collection from "d3-collection";
import {
  polarToCartesian,
  describeArc,
  getStartAndEnd,
  getAngle
} from "../utils/orchestraUtils";
import {
  getRandomInt,
  getGroupFileAndRotationFromID,
  replaceSpecialCharacters,
  serializeXmlNode
} from "../utils/utils";

class D3Orchestra {
  constructor(param) {
    this.id = param.id;
    this.instrumentGroup = param.instrumentGroup;
    this.instrument = param.instrument;
    this.mainPart = param.mainPart;
    this.getTreeThreatLevel = param.getTreeThreatLevel;
    this.treeThreatType = param.treeThreatType
      ? "economically"
      : "ecologically";

    this.instrumentGroups = {};
    this.instrumentGroupsToSpecies = {};
    this.instrumentsToSpecies = {};

    this.speciesData = param.speciesData;
    this.setFilter = param.setFilter;
    this.colorBlind = param.colorBlind;
    this.setMainPartOptions = param.setMainPartOptions;
    this.lastSpeciesSigns = param.lastSpeciesSigns;

    this.pies = {};

    this.initWidth =
      param.width !== undefined ? param.width : window.innerWidth / 2 - 35;
    this.initHeight =
      param.height !== undefined ? param.height : window.innerHeight / 2 - 94;

    this.positionX = this.initWidth / 2;
    this.positionY = this.initHeight / 2 + 100;

    this.padding = 20;

    this.animationTime = 600;

    this.margin = {
      top: 3,
      right: 0,
      bottom: 30,
      left: 0
    };

    d3.selection.prototype.moveToFront = function () {
      this.each(function () {
        this.parentNode.appendChild(this);
      });
    };

    this.paint();
  }

  clickSubArc(d, group, classStr) {
    let thisWidth = this.width;
    let thisHeight = this.height;
    let thisPadding = this.padding;
    let setInstrumentAndMainPart = this.setInstrumentAndMainPart;
    let setInstrument = this.setInstrument;
    let setInstrumentGroup = this.setInstrumentGroup;
    let setFilter = this.setFilter;
    let speciesData = this.speciesData;
    let setMainPartOptions = this.setMainPartOptions;

    let value = d;

    //func1($("#instrumentsSelect"), d3.select(this).attr("name"));
    /* $("#instrumentsSelect").val(value).change(); */

    //setInstrument(value.trim());
    //d3.event.stopPropagation();

    d3.select("#selectChartSVG")
      .selectAll(".subarc")
      .classed("selected", false);
    group.classed("selected", true);

    d3.select("#selectChartSVG").select(".selectMainWrapper").remove();
    d3.select("#mainPartSelectorDiv").style("display", "block");

    if (value.trim() === "String instrument bow") {
      fetch("/stringinstrumentbow.svg")
        .then((response) => response.text())
        .then((str) => new window.DOMParser().parseFromString(str, "text/xml"))
        .then((data) => {
          /* let svg = d3
            .select("#selectChartSVG")
            .append("g")
            .attr("class", "selectInstrumentPart"); */

          var svgNode = d3.select(data.documentElement).select("g");

          d3.select("#mainPartSelectSVGWrapper > *").remove();

          let w = thisWidth - 100 - 2 * thisPadding;
          let svg = d3
            .select("#mainPartSelectSVGWrapper")
            .style("display", "block")
            .append("svg")
            .attr("width", w + "px");

          svg.append(() => svgNode.node());

          //scale it to the height of svg window
          let bbox = svgNode.node().getBBox();

          let largest = Math.max(bbox.width, bbox.height);
          let smallest = Math.min(bbox.width, bbox.height);

          let scale = (w - 2 * thisPadding) / largest;

          let h = (smallest + 2 * thisPadding) * scale;

          svgNode.attr(
            "transform",
            "translate(" +
              thisPadding +
              " " +
              thisPadding +
              ") rotate(90) scale(" +
              scale +
              ", " +
              -scale +
              ")"
          );

          svg.attr("height", h);

          setMainPartOptions([]);

          svgNode
            .selectAll("path")
            .style("cursor", "pointer")
            .attr("origFill", function (d) {
              return d3.select(this).style("fill");
            })
            .on("click", function () {
              let sel = d3.select(this);
              let text = sel.select("title").text();

              if (!sel.classed("selected")) {
                svgNode
                  .selectAll("path")
                  .style("opacity", 0.2)
                  .classed("selected", false)
                  .style("fill", function (d) {
                    return d3.select(this).attr("origFill");
                  });

                sel
                  .style("opacity", 1.0)
                  .style("fill", "var(--highlightpurple)")
                  .classed("selected", true);

                setFilter({ mainPart: [text.trim()] });
              } else {
                svgNode
                  .selectAll("path")
                  .style("opacity", 1.0)
                  .classed("selected", false)
                  .style("fill", function (d) {
                    return d3.select(this).attr("origFill");
                  });

                setFilter({ mainPart: null });
              }
              //setInstrumentAndMainPart(value.trim(), text);
            })
            .on("mouseover", function () {
              let sel = d3.select(this);
              svgNode.selectAll("path:not(.selected)").style("opacity", 0.2);
              sel.style("opacity", 1.0);
            })
            .on("mouseout", function () {
              d3.select(this);
              if (d3.selectAll("path.selected").size() === 0) {
                svgNode.selectAll("path:not(.selected)").style("opacity", 1.0);
              } else {
                svgNode.selectAll("path:not(.selected)").style("opacity", 0.2);
              }
            });

          d3.select("#mainPartSelectSVGWrapper").style("display", "none");
        });
    } else {
      d3.selectAll("g.selectInstrumentPart").remove();

      d3.select("#mainPartSelectSVGWrapper > *").remove();

      /*  d3.select("#selectChartSVG")
        .select("#wrapper")
        .style("transform", "translate(0, " + -75 + "px)"); */

      let bbox = d3
        .select("#mainPartSelectorDiv")
        .style("display", "block")
        .node()
        .getBoundingClientRect();

      /*  let smallest = Math.min(bbox.width, bbox.height);

      let scale = thisHeight / smallest;

      let h = smallest * scale; */

      let wrapperBBox = d3
        .select("#selectChartSVG")
        .select("#wrapper")
        .node()
        .getBBox();

      let diff = thisHeight - (wrapperBBox.y + wrapperBBox.height);

      /*  d3.select("#selectChartSVG")
        .select("#wrapper")
        .style("transform", "translate(0px, " + (-bbox.height + diff) + "px)"); */

      let options = [];
      for (let spec of Object.values(speciesData)) {
        for (let mat of spec.origMat) {
          if (
            value.trim() !== "" &&
            mat.Main_part !== "" &&
            mat.Instruments.includes(value.trim()) &&
            !options.includes(mat.Main_part)
          ) {
            options.push(mat.Main_part);
          }
        }
      }

      /* options = options.map((e) => "<option>" + e + "</option>"); */

      setMainPartOptions(options);
    }

    //setInstrument(value.trim());
    /* .style("fill", "rgb(115,1,136)"); */
    d3.selectAll(".arc.subarc").style("stroke", "none");
    group.select("path").style("stroke", "var(--highlightpurple)");

    if (classStr.includes("heading")) {
      d3.select("#mainPartSelectorDiv").style("display", "none");
      setFilter({
        instrumentGroup: [value.trim()],
        instrument: null,
        mainPart: null
      });
    } else {
      setFilter({ instrument: [value.trim()], mainPart: null });
    }
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

    arcs
      .append("svg:path")
      .attr("class", pathClassFunc)
      .attr("stroke-width", strokeWidth)
      .attr("fill", color)
      .attr("stroke", color)
      .attr("background", color)
      .attr("border-color", color)
      .attr("d", arc)
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
      .style("fill-opacity", "50%");

    vis2
      .append("text")
      .attr("x", origo)
      .attr("y", origo)
      .attr("class", pieLabelClass + "text")
      .attr("text-anchor", "middle")
      .attr("dy", ".3em")
      .style("font-size", options.instrument ? "5" : "initital")
      .style("display", options.data.length === 0 ? "none" : "block")
      .text(pieLabel);

    /* div.appendChild(svg);
        div.appendChild(svg2);*/ /*  */

    //Return the svg-markup rather than the actual element
    /* return serializeXmlNode(div.node()); */
    return div;
  }

  appendPie(
    innerGroup,
    threats,
    textPathForPie,
    start,
    end,
    width = null,
    parentGroup = null
  ) {
    let data = d3Collection
      .nest()
      .key(function (d) {
        return d.abbreviation;
      })
      .entries(threats, d3.map);

    let colorBlind = this.colorBlind;
    let pie = this.bakeTheThreatPie({
      data: data,
      strokeWidth: 2,
      outerRadius: width ? width : 28,
      innerRadius: width ? width - 2 : 16,
      instrument: width ? true : false,
      color: function (d) {
        return d.data.values[0].getColor(colorBlind);
      },
      pieClass: "clusterPie",
      pieLabelClass: "marker-cluster-pie-label",
      valueFunc: function (d) {
        return d.values.length;
      }
    });

    innerGroup.node().appendChild(pie.node());

    let textBox = textPathForPie.node().getBBox();
    let svgNode = innerGroup;
    let iconBox = svgNode.node().getBBox();

    let scale = (width ? 7 : 30) / iconBox.height;

    let angle = (start + (end - start) / 2 - 360) % 180;

    let yShift = 0;
    switch (parentGroup) {
      case "Strings":
        yShift = 20;
        break;
      default:
        break;
    }

    let cx = iconBox.x + iconBox.width / 2;
    let cy = iconBox.y + iconBox.height / 2;

    //svgNode.classed("icon", true);

    svgNode.attr(
      "transform",
      "translate(" +
        textBox.x +
        " " +
        textBox.y +
        ") rotate(" +
        angle +
        ") scale(" +
        scale +
        ") translate(" +
        -cx +
        " " +
        (-cy + yShift) +
        ")"
    );
  }

  clickMainArc(id, group, dst) {
    let path = group.select("#" + id + "path");
    let icon = group.select(".icon");
    let pie = group.select(".pieChartTest");

    d3.selectAll(".arc.subarc")
      .style("stroke", "none")
      .style("paint-order", "fill");
    d3.selectAll(".arcgroup.subarc").classed("selected", false);
    d3.selectAll(".arcgroup").classed("selectedMain", false);

    d3.selectAll(".arcgroup:not(.subarc)")
      .select("path")
      .style("stroke-width", "1px")
      .style("stroke", "rgb(95, 77, 73)");

    group
      .select(".arcgroup.subarc")
      .classed("selected", true)
      .select(".arc.subarc.heading")
      .style("stroke", "var(--highlightpurple)");

    group.classed("selectedMain", true);
    //d3.selectAll(".subarc.text").style("fill", "black");
    //group.select(".subarc.heading.text").style("fill", "white");

    d3.select("#selectChartSVG")
      .style("border", "solid 1px gray")
      .select(".backButton")
      .style("display", "block");

    /* bindMouseOver(d3.selectAll('g.arcgroup:not(.subarc)'), mouseover); */

    /* clickedgroup.on("mouseover", null); */

    dst
      .selectAll(".subarc")
      .style(
        "display",
        "none"
      ) /* .transition().duration(this.animationTime / 5) */
      .style("opacity", 0.0);
    dst.selectAll(".text").style("opacity", 1.0); //.transition().duration(animationTime/2)
    dst.selectAll(".icon").style("opacity", 1.0);
    dst.selectAll(".pieChartTest").style("opacity", 1.0); /*  */

    icon.style("opacity", 0);
    pie.style("opacity", 0);
    d3.select("#" + id + "text")
      .style("display", "initial")
      .style("opacity", 0.0);
    group
      .selectAll(".subarc")
      .style(
        "display",
        "initial"
      ) /* .transition().duration(this.animationTime / 5) */
      .style("opacity", 1.0);

    group.selectAll(".pieChartTest").style("display", "block");

    /* setTimeout(() => this.zoomAndRotate(path), this.animationTime / 1.5); */
    this.zoomAndRotate(path);

    if (this.instrumentGroup !== id)
      this.setFilter({
        instrumentGroup: [id],
        instrument: null,
        mainPart: null
      });

    return;
  }

  describeArc(
    x,
    y,
    radius,
    startAngle,
    endAngle,
    direction = 0,
    withoutM = false
  ) {
    var start = polarToCartesian(x, y, radius, endAngle);
    var end = polarToCartesian(x, y, radius, startAngle);

    if (direction === 0) {
      let tmp = start;
      start = end;
      end = tmp;
    }

    var largeArcFlag = endAngle - startAngle <= 180 ? "0" : "1";
    let d;

    if (withoutM) {
      d = [
        "L",
        start.x,
        start.y,
        "A",
        radius,
        radius,
        0,
        largeArcFlag,
        direction,
        end.x,
        end.y
      ].join(" ");
    } else {
      d = [
        "M",
        start.x,
        start.y,
        "A",
        radius,
        radius,
        0,
        largeArcFlag,
        direction,
        end.x,
        end.y
      ].join(" ");
    }

    return d;
  }

  describeLine(x, y, endX, endY, withoutM) {
    if (withoutM) return ["L", endX, endY].join(" ");
    else return ["M", x, y, "L", endX, endY].join(" ");
  }

  makePie(text, innerGroup, textPathForPie, start, end, parentGroup, main) {
    let speciesList = Object.values(this.speciesData)
      .filter((e) => {
        if (parentGroup === text.trim()) {
          return e.Species.trim() !== "" && e.groups.includes(parentGroup);
        } else {
          return (
            e.Species.trim() !== "" &&
            e.groups.includes(parentGroup) &&
            e.instruments.includes(text.trim())
          );
        }
      })
      .map((e) => {
        let genusSpecies = (e.Genus.trim() + " " + e.Species.trim()).trim();
        return genusSpecies;
      });

    speciesList = [...new Set(speciesList)];

    let heatMap = {};

    let speciesToThreat = {};
    let threats = [];
    for (let species of speciesList) {
      let threat = this.lastSpeciesSigns[species]
        ? this.lastSpeciesSigns[species][this.treeThreatType]
        : null;
      if (threat) threats.push(threat);
    }

    if (main) this.instrumentGroupsToSpecies[parentGroup] = speciesList;
    else this.instrumentsToSpecies[text] = speciesList;

    this.appendPie(
      innerGroup,
      threats,
      textPathForPie,
      start,
      end,
      main ? null : 5,
      main ? null : parentGroup
    );
  }

  appendSelectArc(
    dst,
    id,
    text,
    color,
    strokewidth,
    x,
    y,
    width,
    start,
    end,
    direction,
    fontSize,
    classStr = "",
    parentGroup = null
  ) {
    let group = dst
      .append("g")
      .style("cursor", "pointer")
      .attr("id", id + "arcgroup")
      .attr("name", text === "" ? "General" : text)
      .attr("class", "arcgroup");

    let upper = describeArc(
      x,
      y,
      width + strokewidth / 2,
      start,
      end,
      direction
    );
    let lower = describeArc(x, y, width - strokewidth / 2, start, end, 0, true);

    let pathstr = [upper, lower, "Z"].join(" ");

    let path = group
      .append("path")
      .style("fill", color)
      .style("stroke", "rgb(95, 77, 73)")
      .attr("origStroke", "rgb(95, 77, 73)")
      .style("stroke-width", "1")
      .attr("origStrokeWidth", "1")
      .attr("id", id + "path")
      .attr("class", "arc")
      .attr("start", start)
      .attr("end", end)
      .attr("radius", width)
      .attr("name", text)
      .attr("arcwidth", strokewidth)
      .attr("d", pathstr);

    path.classed(classStr, true);

    let groupAndFile;

    if (!classStr.includes("subarc")) {
      groupAndFile = getGroupFileAndRotationFromID(id);
      let instrumentGroup = groupAndFile.group;

      width = width + 10;
      fetch("/api/getInstrumentsFromGroup/" + instrumentGroup)
        .then((res) => res.json())
        .then((data) => {
          let lowerAmount = false;
          let newstroke;
          if (data.length <= 4) {
            lowerAmount = true;
            newstroke = strokewidth / (data.length + 1);
          } else {
            newstroke = strokewidth / (data.length + 2);
          }

          this.instrumentGroups[instrumentGroup] = data;

          data = data
            .map((e) => e.Instruments)
            .sort((a, b) => {
              return b.length - a.length;
            });

          let startRadius = width - 10 + strokewidth / 2 - newstroke / 2;

          let newId = replaceSpecialCharacters(text + instrumentGroup);
          this.appendSelectArc(
            group,
            newId,
            text,
            color,
            lowerAmount ? newstroke : newstroke * 2,
            this.positionX,
            this.positionY,
            lowerAmount ? startRadius : startRadius - newstroke / 2,
            start,
            end,
            1,
            10,
            "subarc heading",
            instrumentGroup
          );

          d3.select("#" + newId + "text").style("text-decoration", "underline");

          /*                    d3.select("#"+newId).transition().duration(animationTime * 1.5).style("opacity", 1.0);
                                    d3.select("#"+newId+"textPath").transition().duration(animationTime * 1.5).style("opacity", 1.0).style("text-decoration", "underline");
                    */
          if (data.length === 0) {
            group.on("click", null);
          }

          if (lowerAmount) {
            startRadius += newstroke;
          }

          for (let i = 0; i < data.length; i++) {
            let name = data[i];
            if (name.trim() === "") {
              name = "General";
            }

            newId = replaceSpecialCharacters(name + instrumentGroup);
            this.appendSelectArc(
              group,
              newId,
              name,
              color,
              newstroke - 1,
              this.positionX,
              this.positionY,
              startRadius - newstroke * (i + 2),
              start,
              end,
              1,
              Math.min(newstroke - 1, 5),
              "subarc",
              instrumentGroup
            );

            /* d3.select("#"+newId).transition().duration(animationTime * 1.5).style("opacity", 1.0);
                         d3.select("#"+newId+"textPath").transition().duration(animationTime * 1.5).style("opacity", 1.0);*/
          }
        });
    }

    dst
      .append("path")
      .style("fill", "none")
      .style("stroke", "none")
      .attr("id", id + "pathfortext")
      .attr("class", "arcTextPath")
      .attr("start", start)
      .attr("end", end)
      .attr("radius", width)
      .attr("name", text)
      .attr(
        "d",
        describeArc(
          x,
          y,
          classStr.includes("subarc") ? width : width + 28,
          start,
          end,
          direction
        )
      );

    let textElement = group
      .append("text")
      .attr("id", id + "text")
      .attr("class", classStr ? classStr + " text" : "text");

    if (classStr.includes("subarc")) {
      if (text === "Horn, trumpet, trombone, bass tuba") {
        let textPath = textElement
          .append("textPath")
          .style("dominant-baseline", "central")
          .attr("class", "textonpath noselect")
          .attr("xlink:href", "#" + id + "pathfortext")
          .attr("font-size", fontSize)
          .attr("text-anchor", "start")
          .attr("startOffset", "30%")
          .attr("id", id + "textPath");

        textPath.append("tspan").attr("dy", "-0.5em").text("Horn, trumpet,");

        textPath
          .append("tspan")
          .attr("x", 0)
          .attr("dy", "1.5em")
          .text("trombone, bass tuba");
      } else {
        textElement
          .append("textPath")
          .style("dominant-baseline", "central")
          .attr("class", "textonpath noselect")
          .attr("xlink:href", "#" + id + "pathfortext")
          .attr("font-size", fontSize)
          .attr("text-anchor", () => {
            switch (parentGroup) {
              case "Strings":
                return "middle";
              default:
                return "start";
            }
          })
          .attr("startOffset", () => {
            switch (parentGroup) {
              case "Strings":
                return "50%";
              case "Woodwinds":
                return "23%";
              case "Percussion":
                return "40%";
              case "Brasses":
                return "35%";
              case "Plucked":
                return "35%";
              default:
                return "30%";
            }
          })
          .attr("id", id + "textPath")
          .text(text);
      }

      textElement.classed(classStr, true);

      textElement.style("opacity", "0.0").style("display", "none");
      path
        .style("opacity", "0.0")
        .style("stroke", "none")
        .attr("origStroke", "none")
        .style("display", "none");
      group.classed("subarc", true);

      group.on("mouseenter", (e) => {
        let sel = d3.select(e.target);
        if (!sel.classed("selected")) {
          sel
            .select("path")
            .style("stroke", "var(--highlightpurple)")
            .style("stroke-width", "1px");
        }
        this.tooltip(text, e, true);
        e.stopPropagation();
      });
      group.on("mouseleave", (e) => {
        let sel = d3.select(e.target);
        if (!sel.classed("selected")) {
          sel
            .select("path")
            .style("stroke", "initial")
            .style("stroke-width", "initial");
        }
        this.tooltip(text, e, false);
        e.stopPropagation();
      });

      group.on("click", (d) => this.clickSubArc(text, group, classStr));

      let textElementForIcon = group
        .append("text")
        .attr("id", id + "textIcon")
        .attr("class", classStr ? classStr + " text" : "text");

      let textPathForPie = textElementForIcon
        .append("textPath")
        .style("dominant-baseline", "central")
        .style("opacity", "0.0")
        .style("fill-opacity", "0.0")
        .attr("class", "textonpath noselect")
        .attr("xlink:href", "#" + id + "pathfortext")
        .attr("font-size", 1)
        .attr("text-anchor", "middle")
        .attr("startOffset", () => {
          switch (parentGroup) {
            case "Strings":
              return "50%";
            case "Woodwinds":
              return "17%";
            case "Brasses":
              return "25%";
            case "Percussion":
              return "35%";
            case "Plucked":
              return "25%";
            default:
              return "20%";
          }
        })
        .attr("id", id + "textPathPie")
        .text("m");

      let innerGroup = group
        .append("g")
        .attr("x", 0)
        .attr("y", 0)
        .attr("width", "10px")
        .attr("height", "10px")
        .attr("class", "pieChartTest")
        .style("display", "none");

      this.pies[text] = {
        text,
        innerGroup,
        textPathForPie,
        start,
        end,
        parentGroup,
        main: false
      };
      this.makePie(
        text,
        innerGroup,
        textPathForPie,
        start,
        end,
        parentGroup,
        false
      );
    } else {
      textElement
        .append("textPath")
        .style("dominant-baseline", "central")
        .attr("class", "textonpath noselect")
        .attr("xlink:href", "#" + id + "pathfortext")
        .attr("font-size", fontSize)
        .attr("text-anchor", "middle")
        .attr("startOffset", "50%")
        .attr("id", id + "textPath")
        .text(text);

      textElement.classed(classStr, true);

      dst
        .append("path")
        .style("fill", "none")
        .style("stroke", "none")
        .attr("id", id + "textpathIcon")
        .attr("d", describeArc(x, y, width - 44, start, end, direction));

      dst
        .append("path")
        .style("fill", "none")
        .style("stroke", "none")
        .attr("id", id + "textpathPie")
        .attr("d", describeArc(x, y, width - 6, start, end, direction));

      let textElementForIcon = group
        .append("text")
        .attr("id", id + "textIcon")
        .attr("class", classStr ? classStr + " text" : "text");

      let textPathForIcon = textElementForIcon
        .append("textPath")
        .style("dominant-baseline", "central")
        .style("opacity", "0.0")
        .style("fill-opacity", "0.0")
        .attr("class", "textonpath noselect")
        .attr("xlink:href", "#" + id + "textpathIcon")
        .attr("font-size", 1)
        .attr("text-anchor", "middle")
        .attr("startOffset", "50%")
        .attr("id", id + "textPathIcon")
        .text("m");

      let textPathForPie = textElementForIcon
        .append("textPath")
        .style("dominant-baseline", "central")
        .style("opacity", "0.0")
        .style("fill-opacity", "0.0")
        .attr("class", "textonpath noselect")
        .attr("xlink:href", "#" + id + "textpathPie")
        .attr("font-size", 1)
        .attr("text-anchor", "middle")
        .attr("startOffset", "50%")
        .attr("id", id + "textPathPie")
        .text("m");

      /* fetch("http://localhost:9000/api/getMaterial/" + id)
                .then(res => res.json())
                .then(data => { */

      /*  let speciesList = Object.values(this.speciesData)
        .filter((e) => {
          return e.Species.trim() !== "" && e.groups.includes(id);
        })
        .map((e) => {
          let genusSpecies = (e.Genus.trim() + " " + e.Species.trim()).trim();
          return genusSpecies;
        });

      speciesList = [...new Set(speciesList)];

      let heatMap = {};

      let speciesToThreat = {};
      let threats = [];
      for (let species of speciesList) {
        let threat = this.getTreeThreatLevel(species, this.treeThreatType);
        threats.push(threat);
      } */

      //console.log(threats.map(e => e.abbreviation));
      //this.appendPie(group, threats, textPathForPie, start, end);
      /* }); */

      let innerGroup = group
        .append("g")
        .attr("x", 0)
        .attr("y", 0)
        .attr("width", "40px")
        .attr("height", "40px")
        .attr("class", "pieChartTest")
        .style("display", "block");

      this.pies[id + "MAIN"] = {
        text: id,
        innerGroup,
        textPathForPie,
        start,
        end,
        parentGroup: id,
        main: true
      };
      this.makePie(id, innerGroup, textPathForPie, start, end, id, true);

      let filename = groupAndFile.filename;
      let rot = groupAndFile.rotation;

      if (filename !== "") {
        fetch("/" + filename)
          .then((response) => response.text())
          .then((str) =>
            new window.DOMParser().parseFromString(str, "text/xml")
          )
          .then((data) => {
            let textBox = textPathForIcon.node().getBBox();
            var svgNode = d3.select(data.documentElement).select("g");
            group.append(() => svgNode.node());
            let iconBox = svgNode.node().getBBox();

            let scale = 20 / iconBox.height;

            //let transX = (textBox.x - ((iconBox.width * scale) / 2) + textBox.width / 2);
            //let transY = (textBox.y + textBox.height);

            let angle = (start + (end - start) / 2 - 360) % 180;

            if (rot != 0) {
              angle += rot;
            }

            let cx = iconBox.x + iconBox.width / 2;
            let cy = iconBox.y + iconBox.height / 2;

            //var saclestr = scale + ',' + scale;
            //var tx = -cx * (scale - 1);
            //var ty = -cy * (scale - 1);
            //var translatestr = tx + ',' + ty;

            svgNode.classed("icon", true);

            svgNode.attr(
              "transform",
              "translate(" +
                textBox.x +
                " " +
                textBox.y +
                ") rotate(" +
                angle +
                ") scale(" +
                scale +
                ") translate(" +
                -cx +
                " " +
                -cy +
                ")"
            );
          });
      }

      group.on(
        "click",
        function () {
          this.clickMainArc(id, group, dst);
        }.bind(this)
      );

      group.on("mouseenter", (e) => {
        let sel = d3.select(e.target);
        if (!sel.classed("selectedMain")) {
          sel
            .select("path")
            .style("stroke", "var(--highlightpurple)")
            .style("stroke-width", "3px");
        }
        this.tooltip(id, e, true);
      });
      group.on("mouseleave", (e) => {
        let sel = d3.select(e.target);
        if (!sel.classed("selectedMain")) {
          sel
            .select("path")
            .style("stroke", "rgb(95, 77, 73)")
            .style("stroke-width", "1px");
        }
        this.tooltip(id, e, false);
      });
      group.on("mousemove", (e) => this.tooltipMove(e));

      group.moveToFront();
    }

    /*  if (classStr.includes("heading")) {
      group.on("mouseover", null);
      group.on("mouseout", null);
      group.on("click", null);
    } */
  }

  tooltipMove(event) {
    let tooltip = d3.select(".tooltip");
    tooltip
      .style("left", event.pageX + 25 + "px")
      .style("top", event.pageY + 25 + "px");
  }

  getTooltip(d) {
    let text = "<b>" + d + "</b><br>";
    if (this.instrumentGroups.hasOwnProperty(d)) {
      text += this.instrumentGroups[d].length + " Instruments<br>";
    }

    if (
      !this.instrumentGroup &&
      this.instrumentGroupsToSpecies.hasOwnProperty(d)
    ) {
      text += this.instrumentGroupsToSpecies[d].length + " Species";
    }

    if (this.instrumentGroup && this.instrumentsToSpecies.hasOwnProperty(d)) {
      text += this.instrumentsToSpecies[d].length + " Species";
    }

    text += "<br><i>Click to filter!</i>";
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
    this.height = this.initHeight + 10 - this.margin.top - this.margin.bottom;

    let content = d3.select("#" + this.id);
    let svg = content
      .append("svg")
      .attr("id", "selectChartSVG")
      .attr("height", this.height)
      .attr("width", this.width)
      .style(
        "transform",
        "translate(" + this.margin.left + "px , " + this.margin.top + "px)"
      );

    this.container = svg.append("g").attr("id", "wrapper");

    this.container.append("g").attr("id", "selectChart");
  }

  zoomAndRotate(path, center = false) {
    var bbox = path.node().getBBox();

    let startEnd = getStartAndEnd(path.attr("d"));

    let strokewidth = parseInt(path.attr("arcwidth"));

    /*  d3.select("#selectChart")
      .style("transform-origin", "50% 50%")
      .style("transform", "scale(2) translate(0, 20px)");
 */
    let wrapperHeight = d3
      .select("#orchestraVis")
      .select("svg")
      .node()
      .getBoundingClientRect().height;

    let wrapperWidth = d3
      .select("#orchestraVis")
      .select("svg")
      .node()
      .getBoundingClientRect().width;

    /* let angle = 0.0, distance = 0, toBeScaled = 0; */
    let distance;
    let toBeScaled;

    if (center) {
      distance = bbox.height;
      toBeScaled = wrapperHeight / (distance + this.padding);
    } else {
      distance = bbox.height;
      toBeScaled = wrapperHeight / (distance + this.padding);
    }

    var cx = bbox.x + bbox.width / 2,
      cy = bbox.y + bbox.height / 2; // finding center of element

    let my = wrapperHeight / 2 - cy;
    let mx = wrapperWidth / 2 - cx;

    var saclestr = toBeScaled + "," + toBeScaled;

    d3.select("#selectChart").attr(
      "transform",
      "translate(" +
        (cx - mx) +
        "," +
        (cy - my) +
        ") scale(" +
        saclestr +
        ") translate(" +
        (-cx + mx / 2) +
        "," +
        (-cy + my / 2 + (center ? 10 : 0)) +
        ")"
    );
  }

  reset() {
    let selectchart = d3.select("#selectChart");
    d3.select("#selectChartSVG").select(".backButton").style("display", "none");
    d3.select("#selectChartSVG").style("border", "none");
    d3.select("#mainPartSelectorDiv").style("display", "none");

    d3.select("g.selectInstrumentPart").remove();
    d3.select("#selectChartSVG")
      .select("#wrapper")
      .style("transform", "translate(0px, 0px)");

    /* bindMouseOver(d3.selectAll('g.arcgroup:not(.subarc)'), mouseover); */

    selectchart
      .selectAll(".subarc")
      .style("display", "none")
      .transition()
      .duration(this.animationTime / 5)
      .style("opacity", 0.0);
    selectchart.selectAll(".text").style("opacity", 1.0);
    selectchart.selectAll(".icon").style("opacity", 1.0);
    selectchart.selectAll(".pieChartTest").style("opacity", 1.0);

    this.zoomAndRotate(selectchart, true);

    this.setFilter({ instrumentGroup: null, instrument: null, mainPart: null });

    /*  this.setInstrumentGroup(undefined);
    this.setInstrument(undefined);
    this.setInstrumentAndMainPart(undefined, undefined); */
  }

  paint() {
    this.clearAndReset();

    let backButton = d3
      .select("#selectChartSVG")
      .append("g")
      .attr("class", "backButton")
      .attr("transform", "translate(" + 20 + " " + 15 + ")")
      .style("cursor", "pointer")
      .style("display", "none")
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
      .on("click", this.reset.bind(this));

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
      .text("Reset");

    /*   dst,
    id,
    text,
    color,
    strokewidth,
    x,
    y,
    width,
    start,
    end,
    direction,
    fontSize,
    classStr = "",
    parentGroup = null */

    let selectchart = d3.select("#selectChart");
    this.appendSelectArc(
      selectchart,
      "Keyboard",
      "Keyboard",
      "white",
      130,
      this.positionX,
      this.positionY,
      190,
      305 - 1,
      270,
      1,
      10
    );
    this.appendSelectArc(
      selectchart,
      "Plucked",
      "Plucked",
      "white",
      130,
      this.positionX,
      this.positionY,
      190,
      340 - 1,
      305,
      1,
      10
    );
    this.appendSelectArc(
      selectchart,
      "Percussion",
      "Percussion",
      "white",
      130,
      this.positionX,
      this.positionY,
      190,
      380,
      340,
      1,
      10
    );
    this.appendSelectArc(
      selectchart,
      "Woodwinds",
      "Woodwinds",
      "white",
      130,
      this.positionX,
      this.positionY,
      190,
      415,
      380 + 1,
      1,
      10
    );
    this.appendSelectArc(
      selectchart,
      "Brasses",
      "Brasses",
      "white",
      130,
      this.positionX,
      this.positionY,
      190,
      450,
      415 + 1,
      1,
      10
    );
    this.appendSelectArc(
      selectchart,
      "Strings",
      "Strings",
      "white",
      114,
      this.positionX,
      this.positionY,
      65,
      90,
      270,
      1,
      10
    );

    this.zoomAndRotate(selectchart, true);

    if (this.instrumentGroup) {
      // wat for finishing appending the elements
      setTimeout(() => {
        d3.select(`#${this.instrumentGroup}arcgroup`).dispatch("click");
      }, 500);

      if (this.instrument) {
        setTimeout(() => {
          d3.select(
            `#${replaceSpecialCharacters(this.instrument)}${
              this.instrumentGroup
            }arcgroup`
          ).dispatch("click");
        }, 500);

        if (this.mainPart) {
          setTimeout(() => {
            d3.select(`#${this.mainPart}`).dispatch("click");
          }, 700);
        }
      }
    }
  }

  setTreeThreatType(val) {
    this.treeThreatType = val ? "economically" : "ecologically";
  }

  updateThreatPies(
    newSpeciesData,
    colorBlind = false,
    lastSpeciesSigns = null
  ) {
    this.speciesData = newSpeciesData;
    this.colorBlind = colorBlind;
    this.lastSpeciesSigns = lastSpeciesSigns;
    /* d3.select("#selectChartSVG").selectAll(".pieChartTest").remove(); */
    for (let pie of Object.keys(this.pies)) {
      let pieObj = this.pies[pie];
      /* if(pie.includes("MAIN") && this.instrumentGroup === pieObj.text) {
        continue;
      } */

      pieObj.innerGroup.selectAll("*").remove();

      this.makePie(
        pieObj.text,
        pieObj.innerGroup,
        pieObj.textPathForPie,
        pieObj.start,
        pieObj.end,
        pieObj.parentGroup,
        pieObj.main
      );
    }
  }

  setInstrument(instrument) {
    this.instrument = instrument;
  }

  setInstrumentGroup(instrumentGroup) {
    this.instrumentGroup = instrumentGroup;
  }

  setMainPart(mainPart) {
    this.mainPart = mainPart;
  }
}

const OrchestraHelper = {
  draw: (input) => {
    return new D3Orchestra(input);
  },
  reset: (id) => {
    d3.selectAll("#" + id + " > *").remove();
  }
};

export default OrchestraHelper;
