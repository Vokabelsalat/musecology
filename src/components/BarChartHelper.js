import * as d3 from "d3";
import { getRandomInt, getGroupFileAndRotationFromID, pushOrCreate, pushOrCreateWithoutDuplicates, dangerSorted } from '../utils/utils'
import { getIucnColor, citesAppendixSorted, iucnCategoriesSorted, citesAssessment, bgciAssessment, iucnAssessment } from '../utils/timelineUtils'

class D3BarChart {
    constructor(param) {
        this.id = param.id;
        this.data = param.data;
        this.colorFunction = param.colorFunction;
        this.maxValue = param.maxValue;
        this.grouped = param.grouped;
        this.text = param.text;
        this.showIcons = param.showIcons;

        this.margin = {
            top: 10,
            right: 40,
            bottom: 10,
            left: 10,
        };

        this.initWidth = window.innerWidth / 2;
        this.initHeight = window.innerHeight / 2;

        this.padding = {
            top: 40,
            right: 40,
            bottom: 90,
            left: 45,
        };

        d3.selection.prototype.moveToFront = function () {
            this.each(function () {
                this.parentNode.appendChild(this);
            });
        };

        this.paint();
    }

    clearAndReset() {
        d3.selectAll("#" + this.id + " > *").remove();

        this.width = this.initWidth - this.margin.left - this.margin.right;
        this.height = this.initHeight - this.margin.top - this.margin.bottom;

        let content = d3.select("#" + this.id);

        let svg = content
            .append("svg")
            .attr("id", "chartArea")
            .attr("width", this.width)
            .attr("height", this.height)
            .style("border", "solid 1px gray");

        this.svg = svg
            .append("g")
            .attr("transform",
                "translate(" + this.padding.left + "," + this.padding.top + ")");

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


    paint() {
        this.clearAndReset();

        let svg = this.svg;
        let data = this.data;
        let width = this.width - this.padding.left - this.padding.right;
        let height = this.height - this.padding.top - this.padding.bottom;
        let colorFunction = this.colorFunction;

        let defs = svg.append("defs");

        if (data !== undefined) {
            if (this.id === "overallGroupedBars") {

                let subgroups = {};
                for (let group of this.data) {
                    for (let value of Object.keys(group)) {
                        if (value !== "group" && value !== "sum" && value !== "type" && value !== "DD") {
                            pushOrCreateWithoutDuplicates(subgroups, group.type, value);
                        }
                    }
                }

                let newSubgroups = [];
                for (let type of Object.keys(subgroups)) {
                    let values = subgroups[type];
                    values = values.sort((a, b) => {
                        switch (type) {
                            case "iucn":
                                return iucnAssessment.get(a).sort - iucnAssessment.get(b).sort;
                            case "cites":
                                return citesAssessment.get(a).sort - citesAssessment.get(b).sort;
                            case "threat":
                                return bgciAssessment.get(a).sort - bgciAssessment.get(b).sort;
                            default:
                                break;
                        }
                    });

                    newSubgroups.push(...values);
                }
                /* newSubgroups.push("DD"); */

                subgroups = newSubgroups;

                // List of groups = species here = value of the first column called group -> I show them on the X axis
                var groups = d3.map(this.data, function (d) { return (d.group) }).keys();
                var types = d3.map(this.data, function (d) { return (d.type) }).keys();

                // Add X axis
                var x = d3.scaleBand()
                    .domain(groups)
                    .range([0, width])
                    .padding([0.1]);

                // Add Y axis
                var y = d3.scaleLinear()
                    .domain([0, this.maxValue])
                    .range([height, 0]);
                svg.append("g")
                    .call(d3.axisLeft(y));

                var xSubgroup = d3.scaleBand()
                    .domain(types)
                    .range([0, x.bandwidth()])
                    .padding([0.2])

                svg.append("g")
                    .attr("transform", "translate(0," + height + ")")
                    .classed("xticks", true)
                    .call(d3.axisBottom(x).tickSizeOuter(0));

                let xticks = svg.select(".xticks").selectAll(".tick");

                if (this.showIcons) {
                    svg.select(".xticks").selectAll(".tick").selectAll("text").remove();

                    xticks.data(this.data)
                        .append("svg:image")
                        .attr("xlink:href", function (d) {
                            let returnPath = "/" + getGroupFileAndRotationFromID(d.group).filename;
                            return returnPath;
                        })
                        .attr("width", 20)
                        .attr("height", 20)
                        .attr("x", -10)
                        .attr("y", 45);
                }
                else {
                    svg.select(".xticks")
                        .selectAll(".tick")
                        .selectAll("text")
                        .style("font-size", "larger")
                        .attr("y", 45);

                    svg.select(".xticks").selectAll(".tick").selectAll("text").remove();

                    xticks.data(this.data)
                        /*   .append("rect")
                          .attr("width", 20)
                          .attr("height", 20)
                          .attr("x", -10)
                          .style("fill", "lime")
                          .attr("y", 50); */
                        .append("foreignObject")
                        .attr("class", "nodeDiv")
                        .attr("width", x.bandwidth())
                        .attr("height", 50)
                        .attr("x", -x.bandwidth() / 2)
                        .attr("y", 45)
                        .append('xhtml:div')
                        .html(d => '<div class="barCharAxisTickText">' + d.group + "</div>")
                    /* .html(d => d.group); */


                }

                let dataByGroup = d3.nest()
                    .key(function (d) {
                        return d.group
                    })
                    .entries(this.data);

                let newData = [];
                for (let group of dataByGroup) {
                    let dataByType = d3.nest()
                        .key(function (d) {
                            return d.type;
                        })
                        .entries(group.values);

                    let stacked = [];
                    for (let e of dataByType) {
                        let tmp = d3.stack()
                            .keys(subgroups)
                            (e.values);
                        stacked.push({ key: e.key, values: tmp })
                    }

                    newData.push({ values: stacked, key: group.key });
                }


                let groupGroup = svg.selectAll(".groupGroup")
                    .append("g")
                    // Enter in data = loop group per group
                    .data(newData)
                    .enter()
                    .append("g")
                    .attr("class", "groupGroup")
                    .attr("transform", function (d) { return "translate(" + x(d.key) + ",0)"; });

                let citesGroup = groupGroup.selectAll(".citesGroup")
                    .data(function (d) { return d.values })
                    .enter()
                    .append("g")
                    .attr("class", "citesGroup")
                    .attr("transform", function (d) { return "translate(" + xSubgroup(d.key) + ",0)"; });

                let bars = citesGroup.selectAll("rect")
                    .data(function (d) { return d.values.map(e => { e.type = d.key; return e }) })
                    .enter()
                    .append("rect")
                    .attr("x", function (d) { return 0; })
                    .attr("y", function (d) { return y(d[0][1]); })
                    .attr("height", function (d) { return y(d[0][0]) - y(d[0][1]); })
                    .attr("width", xSubgroup.bandwidth())
                    .style("fill", function (d) {
                        if (d.type === "cites" && d.key === "DD") {
                            let id = "barDiagonalHatch" + d.key;

                            let width = xSubgroup.bandwidth();
                            let height = y(d[0][0]) - y(d[0][1]);

                            if (defs.select("#" + id).empty()) {
                                let pattern = defs
                                    .append('pattern')
                                    .attr('id', id)
                                    .attr('patternUnits', 'userSpaceOnUse')
                                    .attr('width', 6)
                                    .attr('height', 6)
                                    .attr("patternTransform", "rotate(45)");

                                pattern
                                    .append('rect')
                                    .attr('width', width)
                                    .attr('height', height)
                                    .attr('x', 0)
                                    .attr('x', 0)
                                    .attr('fill', colorFunction[d.type](d.key));

                                pattern
                                    .append('line')
                                    .attr("x1", 0)
                                    .attr("y", 0)
                                    .attr("x2", 0)
                                    .attr("y2", 6)
                                    .attr("stroke", () => {
                                        return getIucnColor("LC");
                                    })
                                    .attr('stroke-width', 6);
                            }

                            return "url(#" + id + ")";
                        }
                        else {
                            return colorFunction[d.type](d.key);
                        }
                    });


                let typeDict = { iucn: "IUCN", threat: "BGCI", cites: "CITES" };

                citesGroup
                    .append("text")
                    .attr("class", "typeTick")
                    .attr("x", -(height + 35))
                    .attr("y", (xSubgroup.bandwidth() / 2) + 5)
                    .style("font-size", "10px")
                    .style("transform", "rotate(-90deg)")
                    .text(d => { return typeDict[d.key] })



                // Animation
                /* svg.selectAll("rect")
                    .transition()
                    .duration(800)
                    .attr("y", function (d) { return y(d[1]); })
                    .attr("height", function (d) { return y(d[0]) - y(d[1]); })
                    .delay(function (d, i) { return (i * 10) }); */

            }
            else {
                if (this.grouped) {
                    let subgroups = [];
                    for (let group of this.data) {
                        for (let value of Object.keys(group)) {
                            if (!subgroups.includes(value) && value !== "group" && value !== "sum") {
                                subgroups.push(value);
                            }
                        }
                    }

                    subgroups = subgroups.sort((a, b) => iucnCategoriesSorted.indexOf(b) - iucnCategoriesSorted.indexOf(a));

                    // List of groups = species here = value of the first column called group -> show them on the X axis
                    var groups = d3.map(this.data, function (d) { return (d.group) }).keys();

                    // Add X axis
                    var x = d3.scaleBand()
                        .domain(groups)
                        .range([0, width])
                        .padding([this.padding])
                    svg.append("g")
                        .attr("transform", "translate(0," + height + ")")
                        .call(d3.axisBottom(x).tickSizeOuter(0));

                    svg.selectAll(".tick").selectAll("text").remove();

                    svg.selectAll(".tick")
                        .data(this.data)
                        .append("svg:image")
                        .attr("xlink:href", function (d) {
                            let returnPath = "/" + getGroupFileAndRotationFromID(d.group).filename;
                            return returnPath;
                        })
                        .attr("width", 20)
                        .attr("height", 20)
                        .attr("x", -10)
                        .attr("y", 10);

                    // Add Y axis
                    var y = d3.scaleLinear()
                        .domain([0, this.maxValue])
                        .range([height, 0]);
                    svg.append("g")
                        .call(d3.axisLeft(y));

                    /* // color palette = one color per subgroup
                    var color = d3.scaleOrdinal()
                        .domain(subgroups)
                        .range(['#e41a1c', '#377eb8', '#4daf4a']) */

                    //stack the data? --> stack per subgroup
                    var stackedData = d3.stack()
                        .keys(subgroups)
                        (this.data)

                    // Show the bars
                    svg.append("g")
                        .selectAll("g")
                        // Enter in the stack data = loop key per key = group per group
                        .data(stackedData)
                        .enter().append("g")
                        .attr("fill", function (d) { return colorFunction(d.key); })
                        .selectAll("rect")
                        // enter a second time = loop subgroup per subgroup to add all rectangles
                        .data(function (d) { return d; })
                        .enter().append("rect")
                        .attr("x", function (d) { return x(d.data.group); })
                        .attr("y", function (d) { return y(0); })
                        .attr("height", function (d) { return height - y(0); })
                        .attr("width", x.bandwidth());


                    // Animation
                    svg.selectAll("rect")
                        .transition()
                        .duration(800)
                        .attr("y", function (d) { return y(d[1]); })
                        .attr("height", function (d) { return y(d[0]) - y(d[1]); })
                        .delay(function (d, i) { return (i * 10) });

                }
                else {
                    // X axis
                    var x = d3.scaleBand()
                        .range([0, this.width])
                        .domain(data.map(function (d) { return d.category; }))
                        .padding(0.2);
                    svg.append("g")
                        .attr("transform", "translate(0," + height + ")")
                        .call(d3.axisBottom(x))
                        .selectAll("text")
                        .attr("transform", "translate(-10,0)rotate(-45)")
                        .style("text-anchor", "end");

                    // Add Y axis
                    var y = d3.scaleLinear()
                        .domain([0, this.maxValue])
                        .range([height, 0]);
                    svg.append("g")
                        .call(d3.axisLeft(y));

                    // Bars
                    svg.selectAll("mybar")
                        .data(data)
                        .enter()
                        .append("rect")
                        .attr("x", function (d) { return x(d.category); })
                        .attr("width", x.bandwidth())
                        .attr("fill", function (d) {
                            return colorFunction(d.category);
                        })
                        // no bar at the beginning thus:
                        .attr("height", function (d) { return height - y(0); }) // always equal to 0
                        .attr("y", function (d) { return y(0); })

                    // Animation
                    svg.selectAll("rect")
                        .transition()
                        .duration(800)
                        .attr("y", function (d) { return y(d.value); })
                        .attr("height", function (d) { return height - y(d.value); })
                        .delay(function (d, i) { return (i * 100) })
                }
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
}

export default BarChartHelper;