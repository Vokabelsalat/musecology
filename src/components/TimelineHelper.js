import * as d3 from "d3";
import {
  getOrCreate,
  dangerColorMap,
  sourceToDangerMap,
  iucnToDangerMap,
  pushOrCreate,
  pushOrCreateWithoutDuplicates,
  dangerSorted,
  scaleValue
} from "../utils/utils";
import {
  getIucnColor,
  getIucnColorForeground,
  iucnCategoriesSorted,
  citesAppendixSorted,
  iucnCategories,
  threatScore,
  threatScoreReverse,
  getCitesColor,
  citesAssessment,
  iucnAssessment,
  bgciAssessment
} from "../utils/timelineUtils";
import { scaleLinear, stackOffsetNone } from "d3";
import { sliderBottom, sliderTop } from "d3-simple-slider";

class D3Timeline {
  constructor(param) {
    this.id = this.justTrade === true ? param.id + "JustTrade" : param.id;
    this.data = param.data;
    this.sourceColorMap = param.sourceColorMap;
    this.domainYears = param.domainYears;
    this.zoomLevel = param.zoomLevel;
    this.setZoomLevel = param.setZoomLevel;
    this.speciesName = param.speciesName;
    this.maxPerYear = param.maxPerYear;
    this.justTrade = param.justTrade;
    this.justGenus = param.justGenus;
    this.colorBlind = param.colorBlind;
    this.setFilter = param.setFilter;
    this.getPlantIcon = param.getPlantIcon;
    this.getAnimalIcon = param.getAnimalIcon;
    this.lastSpeciesSigns = param.lastSpeciesSigns;
    this.lastSpeciesThreats = param.lastSpeciesThreats;

    this.pieStyle = param.pieStyle;
    this.groupSame = param.groupSame;
    this.sortGrouped = param.sortGrouped;

    this.addSpeciesToMap = param.addSpeciesToMap;
    this.removeSpeciesFromMap = param.removeSpeciesFromMap;

    this.setHover = param.setHover;
    this.setTimeFrame = param.setTimeFrame;

    this.timeFrame = param.timeFrame;
    this.species = param.species;

    //this.heatStyle = param.heatStyle;
    this.heatStyle = "max";

    this.initWidth = param.initWidth;
    this.initHeight = 100;

    this.citesSignThreat = "DD";
    this.iucnSignThreat = "DD";

    this.firstSVGAdded = false;

    this.rowHeight = 20;

    this.rightGroupWidth = 15;

    this.setSpeciesSignThreats = param.setSpeciesSignThreats;
    this.getSpeciesSignThreats = param.getSpeciesSignThreats;

    this.getTreeThreatLevel = param.getTreeThreatLevel;

    this.speciesImageLinks = param.treeImageLinks;
    this.dummyImageLinks = param.dummyImageLinks;

    this.muted = param.muted;

    this.margin = {
      top: 10,
      right: 0,
      bottom: 20,
      left: 130
    };

    this.paint();
  }

  getRowHeight(genusLine) {
    if (genusLine) {
      return this.rowHeight * 2 - 1;
    } else {
      return this.rowHeight;
    }
  }

  calcYPos(rowNum, trendRows, genusLine = false, beginningHalfStep = false) {
    let addY = 0;
    if (this.groupSame && this.sortGrouped === "trend") {
      if (genusLine) {
        addY = 0;
      } else {
        addY = beginningHalfStep
          ? this.getRowHeight(genusLine) / 2 +
            trendRows[rowNum] * (this.getRowHeight(genusLine) / 2)
          : trendRows[rowNum] * (this.getRowHeight(genusLine) / 2);
      }
    } else {
      addY = 0;
    }
    return this.getRowHeight(genusLine) * rowNum + addY;
  }

  appendGrayBox(timeFrameMax) {
    let timelineWidth = Math.round(
      this.x(this.domainYears.maxYear) + this.x.bandwidth() / 2
    );

    let content = d3.select("#" + this.id);
    content
      .append("div")
      .style("position", "absolute")
      .style("display", "inline-block")
      .style(
        "width",
        timelineWidth - this.x(timeFrameMax) - this.x.bandwidth() / 2 - 1 + "px"
      )
      .style("min-height", "10px")
      .style("top", "0")
      .style(
        "left",
        this.margin.left +
          this.x(timeFrameMax) +
          this.x.bandwidth() / 2 -
          1 +
          "px"
      )
      .style("height", "-webkit-fill-available")
      .style("background-color", "rgba(255,255,255,0.8)")
      .style("border-left", "solid var(--highlightpurple) 3px");
  }

  appendTrends(
    destination,
    trendData,
    trendRows,
    genusLine = false,
    beginningHalfStep = false
  ) {
    if (this.groupSame && this.sortGrouped === "trend") {
      let trends = destination
        .selectAll("g myCircleText")
        .data(trendData)
        .enter()
        .append("g")
        .attr("transform", (d) => {
          let rowNum = d.rowNum;

          let yPos = this.calcYPos(
            rowNum,
            trendRows,
            genusLine,
            beginningHalfStep
          );
          return "translate(" + 3 + ", " + yPos + ")";
        });

      trends
        .append("rect")
        .attr("width", (d) => {
          return 15 + "px";
        })
        .attr("height", (d) => {
          return this.getRowHeight(genusLine) * d.length;
        })
        .style("fill", (d) => {
          switch (d.type) {
            case "up":
              return "#d6000391";
            case "down":
              return "#61c65970";
            default:
              return "#d1d1c69e";
          }
        });

      trends
        .append("text")
        .attr("x", 15 / 2 - 5)
        .attr("y", (d) => {
          return (this.getRowHeight(genusLine) * d.length) / 2;
        })
        .attr("dy", ".25em")
        .style("font-size", (d) => {
          if (d.type === "up" || d.type === "down") {
            return "14px";
          } else {
            return "11px";
          }
        })
        .html((d) => {
          switch (d.type) {
            case "up":
              return "&#8664";
            case "down":
              return "&#8663;";
            default:
              return "&#8658;";
          }
        });
    }
  }

  appendTrend(
    destination,
    populationTrend,
    genusLine = false,
    beginningHalfStep = false
  ) {
    let trendData = [
      {
        rowNum: 0,
        type: populationTrend,
        length: 1
      }
    ];

    let colorBlind = this.colorBlind;

    if (this.groupSame && this.sortGrouped === "trend") {
      let trends = destination
        .selectAll("g myCircleText")
        .data(trendData)
        .enter()
        .append("g")
        .attr("transform", (d) => {
          return "translate(" + 0 + ", " + 0 + ")";
        });

      trends
        .append("rect")
        .attr("width", (d) => {
          return 14 + "px";
        })
        .attr("height", (d) => {
          return this.getRowHeight(genusLine) * d.length;
        })
        .style("fill", (d) => {
          switch (d.type) {
            case "Decreasing":
              return iucnAssessment.get("EX").getColor(colorBlind);
            case "Increasing":
              return iucnAssessment.get("LC").getColor(colorBlind);
            case "Stable":
              return iucnAssessment.get("NT").getColor(colorBlind);
            case null:
              return "transparent";
            case "Unknown":
              return "transparent";
            default:
              /*  console.log("populationTrend not in scope", d.type); */
              break;
          }
        });

      trends
        .append("text")
        .attr("x", 12 / 2 - 5)
        .attr("y", (d) => {
          return (this.getRowHeight(genusLine) * d.length) / 2;
        })
        .attr("dy", ".25em")
        .style("font-size", (d) => {
          if (d.type === "Stable") {
            return "14px";
          } else {
            return "18px";
          }
        })
        .html((d) => {
          switch (d.type) {
            case "Decreasing":
              return "&#8664";
            case "Increasing":
              return "&#8663;";
            case "Stable":
              return "&#8658;";
            case null:
              return "";
            case "Unknown":
              return "";
            default:
              return "&#8658;";
          }
        });

      destination
        .style("cursor", "default")
        .on("mouseenter", (e) =>
          this.tooltipTrend(
            { speciesName: this.speciesName, type: populationTrend },
            e,
            true
          )
        )
        .on("mouseleave", (e) =>
          this.tooltipTrend(
            { speciesName: this.speciesName, type: populationTrend },
            e,
            false
          )
        )
        .on("mousemove", (e) => this.tooltipMove(e));
    }
  }

  yearCount(y, obj) {
    let count = getOrCreate(obj, y.toString(), -1);
    obj[y.toString()] = ++count;
    return count;
  }

  clearAndReset() {
    d3.selectAll("#" + this.id + " > *").remove();
    let content = d3
      .select("#" + this.id)
      .style(
        "border-top",
        this.species === this.speciesName
          ? "2px solid var(--highlightpurple)"
          : "none"
      );

    if (this.muted) {
      content.style("opacity", 0.5);
      /* .append("div")
            .attr("class", "muteRectDiv")
            .style("width", (this.initWidth) + "px"); */
    } else {
      content.style("opacity", 1.0);
    }

    let speciesNameDiv = content
      .append("div")
      .attr("class", "speciesNameDiv")
      .style("width", "fit-content")

      .style("vertical-align", "middle")
      .on("click", () => {
        this.setFilter({
          kingdom: [this.data.Kingdom],
          familia: [this.data.Family],
          genus: [this.data.Genus.trim()],
          species: [this.speciesName]
        });
      })
      .on("mouseenter", (e) => this.tooltip(this.speciesName, e, true))
      .on("mouseleave", (e) => this.tooltip(this.speciesName, e, false))
      .on("mousemove", (e) => this.tooltipMove(e));
    /* .style("display", "table-cell"); */

    this.wrapper = content.append("div").attr("id", this.id + "wrapper");

    this.wrapper.style("display", "table-cell").style("position", "relative");
    //.style("border", "1px solid var(--black)");

    if (this.id.toLowerCase().includes("scale")) {
      /* if (this.speciesName === "scaleTop") {
        speciesNameDiv.style("border-top", "none");
        this.wrapper
          .style("border-bottom", "1px solid black")
          .style("border-top", "none");
      } */
      speciesNameDiv.remove();
      if (this.speciesName === "scaleTop") {
        this.wrapper.style("border", "none");
      }
      if (this.speciesName === "scaleBottom") {
        this.wrapper.style("border-top", "1px solid gray");
      }
    } else {
      let speciesNameSVG = speciesNameDiv
        .append("svg")
        .attr("width", 24)
        .attr("height", 24);

      let citesThreat = "DD";
      let iucnThreat = "DD";
      let iucnColor = getIucnColor("DD");
      if (typeof this.getSpeciesSignThreats == "function") {
        let getTreeThreatLevel = this.getTreeThreatLevel.bind(this);
        let speciesName = this.speciesName;
        let colorBlind = this.colorBlind;

        if (this.data.Kingdom === "Animalia") {
          let xml = this.getAnimalIcon();
          speciesNameSVG
            .html(xml)
            .select("svg")
            .attr("width", 24)
            .attr("height", 18)
            .attr("y", 2.5)
            .attr("class", "iconSVG");

          let iucnThreat = this.lastSpeciesSigns[speciesName]["ecologically"];
          let citesThreat = this.lastSpeciesSigns[speciesName]["economically"];

          let icon = speciesNameSVG.select(".iconSVG");

          icon
            .select(".left")
            .select("path")
            .attr("class", "leftPath")
            .style("fill", citesThreat.getColor(colorBlind));
          icon
            .select(".right")
            .select("path")
            .attr("class", "rightPath")
            .style("fill", iucnThreat.getColor(colorBlind));
        } else {
          let xml = this.getPlantIcon();
          //let icon = speciesNameSVG.node().appendChild(xml.documentElement);
          speciesNameSVG
            .html(xml)
            .select("svg")
            .attr("width", 24)
            .attr("height", 18)
            .attr("y", 2.5)
            .attr("class", "iconSVG");

          let iucnThreat = this.lastSpeciesSigns[speciesName]["ecologically"];
          let citesThreat = this.lastSpeciesSigns[speciesName]["economically"];

          let icon = speciesNameSVG.select(".iconSVG");

          icon
            .select(".left")
            .select("path")
            .attr("class", "leftPath")
            .style("fill", citesThreat.getColor(colorBlind));
          icon
            .select(".right")
            .select("path")
            .attr("class", "rightPath")
            .style("fill", iucnThreat.getColor(colorBlind));
        }

        speciesNameDiv
          .append("text")
          .text(this.speciesName)
          .style("cursor", "pointer")
          .style("font-style", this.justGenus ? "" : "italic")
          .style("font-size", 15 + "px")
          .style("line-height", 24 + "px");
        /* .style("font-weight", this.justGenus ? "bold" : "") */
        /* .on("click", () => {
            if (this.zoomLevel === 0) {
              this.addSpeciesToMap(this.speciesName);
              this.setZoomLevel(2);
            } else {
              this.removeSpeciesFromMap(this.speciesName);
              this.setZoomLevel(0);
            }
          }); */

        /* speciesNameDiv
          .on("mouseover", () => {
            this.setHover([this.speciesName]);
          })
          .on("mouseout", () => {
            this.setHover([]);
          }); */

        let imageLink = this.speciesImageLinks[this.speciesName];
        let dummyLink = this.dummyImageLinks[this.speciesName];

        if (imageLink) {
          //let imageWidth = this.zoomLevel > 0 ? this.margin.left / 3 : 2 * this.margin.left / 3;
          let imageWidth = (2 * this.margin.left) / 3;
          this.wrapper
            .append("div")
            .attr("class", "speciesImageWrapper")
            .style("width", imageWidth + "px")
            .style("height", "-webkit-fill-available")
            .style("position", "absolute")
            .style("left", 0)
            .style("top", 0)
            .style("cursor", "pointer")
            .style("background-image", "url(" + imageLink + ")")
            .on("click", () => {
              this.setFilter({
                kingdom: [this.data.Kingdom],
                familia: [this.data.Family],
                genus: [this.data.Genus.trim()],
                species: [this.speciesName]
              });
            })
            .on("mouseenter", (e) => this.tooltip(this.speciesName, e, true))
            .on("mouseleave", (e) => this.tooltip(this.speciesName, e, false))
            .on("mousemove", (e) => this.tooltipMove(e));
        } else if (dummyLink) {
          let imageWidth = (2 * this.margin.left) / 3;
          this.wrapper
            .append("div")
            .attr("class", "speciesImageWrapper")
            .style("width", imageWidth + "px")
            .style("height", "-webkit-fill-available")
            .style("position", "absolute")
            .style("left", 0)
            .style("top", 0)
            .style("cursor", "pointer")
            .style("background-image", "url(" + dummyLink + ")")
            .on("click", () => {
              this.setFilter({
                kingdom: [this.data.Kingdom],
                familia: [this.data.Family],
                genus: [this.data.Genus.trim()],
                species: [this.speciesName]
              });
            })
            .on("mouseenter", (e) => this.tooltip(this.speciesName, e, true))
            .on("mouseleave", (e) => this.tooltip(this.speciesName, e, false))
            .on("mousemove", (e) => this.tooltipMove(e))
            .append("div")
            .attr("class", "dummyDiv")
            .style("height", "100%")
            .style("writing-mode", "unset")
            .style("text-orientation", "unset")
            .style("background-color", "rgba(128,128,128,0.26)")
            .html("PROXY");
        }
      }
    }
  }

  appendCitesTradeStacked(tradeData, groupedBySource) {
    let svgCITESTrade = this.wrapper
      .append("svg")
      .attr("id", this.id + "Trade")
      .attr("width", this.initWidth)
      .attr("height", this.height)
      .style("display", "block");

    svgCITESTrade.style("display", "block");

    let g = svgCITESTrade
      .append("g")
      .attr("transform", "translate(" + this.margin.left + "," + 0 + ")");

    let sortedSources = Object.keys(groupedBySource).sort(
      (a, b) => groupedBySource[b].length - groupedBySource[a].length
    );

    let yearPlus = {};

    for (let source of sortedSources.values()) {
      let lineColor = dangerColorMap[sourceToDangerMap[source]]
        ? dangerColorMap[sourceToDangerMap[source]].bg
        : dangerColorMap["DD"].bg;

      let filteredData = {};

      for (let yearData of tradeData.values()) {
        getOrCreate(filteredData, yearData.year.toString(), {
          trades: yearData.trades.filter((e) => e.Source === source),
          year: yearData.year,
          source: source
        });
      }

      /* c
            onsole.log("filtered", filteredData); */

      g.append("path")
        .datum(Object.values(filteredData))
        .attr("fill", lineColor)
        .attr("origFill", lineColor)
        .attr("stroke", "grey")
        /* .attr("stroke-width", 1) */
        .attr(
          "d",
          d3
            .area()
            .x((d) => {
              return this.x(d.year) + this.x.bandwidth() / 2;
            })
            .y0((d) => {
              return this.y(getOrCreate(yearPlus, d.year.toString(), 0));
            })
            .y1((d) => {
              let oldValue = getOrCreate(yearPlus, d.year.toString(), 0);
              let count = d.trades.length;
              yearPlus[d.year.toString()] = count + oldValue;
              let yValue = this.y(count + oldValue);
              d.yValue = yValue;
              return yValue;
            })
        )
        .on("mouseover", this.mouseover)
        .on("mousemove", this.mousemove)
        .on("mouseleave", this.mouseleave);
    }
  }

  appendCitesWithoutGenus(
    listingData,
    genusLine = false,
    withGenusLineOnTop = false
  ) {
    let speciesListing = {};

    let listingKeys = [];
    let newListingData = [];

    let characteristicsMap = {};
    let trendMap = {};

    let maxHeightScale = 5;
    let lastListing = null;

    let genusListing = null;
    for (let listing of listingData.sort(
      (a, b) => parseInt(a.year) - parseInt(b.year)
    )) {
      let push = true;
      let name = listing.sciName;

      if (listing.rank === "GENUS") {
        genusListing = name;
        push = false;
      }

      if (listing.rank === "SPECIESfromGENUS") {
        /* push = false;
                SPECIESfromGENUSfiltered.push(listing); */
      }

      let listingKey = `${listing.year}${listing.appendix}${listing.genus}${listing.species}${listing.countries}${listing.rank}`;
      let characteristic = `${listing.year}${listing.appendix}${listing.countries}`;

      if (speciesListing.hasOwnProperty(name)) {
        if (!listingKeys.includes(listingKey)) {
          speciesListing[name].push(listing);
          if (push) {
            newListingData.push(listing);
          }
          characteristicsMap[name][listing.year] = characteristic;

          trendMap[name][listing.year] = listing.appendix;
        }
      } else {
        speciesListing[name] = [listing];
        if (push) {
          newListingData.push(listing);
        }
        characteristicsMap[name] = {};
        characteristicsMap[name][listing.year] = characteristic;
        trendMap[name] = {};
        trendMap[name][listing.year] = listing.appendix;
      }

      listingKeys.push(listingKey);

      if (this.timeFrame[1] !== undefined) {
        if (parseInt(listing.year) < this.timeFrame[1]) {
          lastListing = listing;
        }
      } else {
        lastListing = listing;
      }
    }

    this.citesSignThreat = lastListing ? lastListing.appendix : null;

    let newTrendMap = {};
    let sumMap = {};
    let characteristicsTrend = {};
    for (let key of Object.keys(characteristicsMap)) {
      let prevYear = 0;
      newTrendMap[key] = [];
      sumMap[key] = [];
      characteristicsMap[key] = Object.keys(characteristicsMap[key])
        .sort((a, b) => parseInt(b) - parseInt(a))
        .reverse()
        .map((year, index) => {
          let curr = citesAssessment.get(trendMap[key][year]).numvalue;

          /* let curr = citesScore(trendMap[key][year]);
                    if (curr < 0) {
                        curr = 0.5;
                    } */

          sumMap[key].push(curr);
          if (index > 0) {
            let prev = citesAssessment.get(trendMap[key][prevYear]).numvalue;

            let trend;
            if (curr < prev) {
              trend = 1;
            } else if (curr > prev) {
              trend = -1;
            } else {
              trend = 0;
            }

            newTrendMap[key].push(trend);
          } else {
            newTrendMap[key].push(0);
          }

          prevYear = year;

          characteristicsTrend[key] = newTrendMap[key];

          return characteristicsMap[key][year];
        })
        .join("");
    }

    let charCounting = Object.values(characteristicsMap).reduce(function (
      countMap,
      word
    ) {
      countMap[word] = ++countMap[word] || 1;
      return countMap;
    },
    {});

    if (genusListing) {
      let genusChar = characteristicsMap[genusListing];
      charCounting[genusChar] -= 1;
    }

    let uniqueCharacteristics = Object.keys(charCounting);

    let characteristicsToTrend = {};

    let newSumMap = {};
    Object.keys(characteristicsMap).forEach((species) => {
      characteristicsToTrend[characteristicsMap[species]] =
        characteristicsTrend[species];
      newSumMap[characteristicsMap[species]] =
        sumMap[species].reduce((acc, cur) => acc + cur) /
        sumMap[species].length;
    });

    let characteristicsToTrendResult = {};

    for (let char of Object.keys(characteristicsToTrend)) {
      let indexA = null;
      for (let idx = characteristicsToTrend[char].length - 1; idx > 0; idx--) {
        if (indexA === null && characteristicsToTrend[char][idx] !== 0) {
          indexA = idx;
          break;
        }
      }

      if (indexA === null) {
        characteristicsToTrendResult[char] = 0;
      } else {
        let len =
          characteristicsToTrend[char].length > 1
            ? characteristicsToTrend[char].length - 1
            : 1;
        let scale = indexA / len;
        characteristicsToTrendResult[char] =
          scale * characteristicsToTrend[char][indexA];
      }
    }

    uniqueCharacteristics.sort((a, b) => {
      if (this.sortGrouped === "trend") {
        let valA = characteristicsToTrendResult[a];
        let valB = characteristicsToTrendResult[b];

        if (valA > valB) {
          return 1;
        } else if (valA < valB) {
          return -1;
        }
      }

      if (this.sortGrouped === "avg") {
        let sumA = newSumMap[a];
        let sumB = newSumMap[b];

        if (sumB !== sumA) {
          return sumA - sumB;
        } else {
          return b.localeCompare(a);
        }
      }

      let countA = charCounting[a];
      let countB = charCounting[b];

      if (countB !== countA) {
        return countB - countA;
      } else {
        return b.localeCompare(a);
      }
    });

    let speciesCount = Object.keys(speciesListing).length;

    if (genusListing) {
      speciesCount -= 1;
    }

    if (genusLine) {
      speciesCount = 1;
      speciesListing = {};

      speciesListing[genusListing] = listingData;

      newListingData = listingData;
    }

    let heightMap = {};
    if (this.groupSame) {
      let charsAlready = [];
      let newData = [];
      let filteredSpecies = [];

      for (let entry of newListingData) {
        let char = characteristicsMap[entry.sciName];

        if (
          !charsAlready.includes(char) ||
          filteredSpecies.includes(entry.sciName)
        ) {
          let charCount = charCounting[characteristicsMap[entry.sciName]];
          let heightScale = (charCount > 1 ? charCount : 0) / speciesCount;

          entry.heightScale = heightScale;

          newData.push(entry);
          filteredSpecies.push(entry.sciName);
          charsAlready.push(char);

          if (!Object.keys(heightMap).includes(char)) {
            heightMap[char] = heightScale;
          }
        }
      }

      newListingData = newData;

      this.heightScaleSum = Object.values(heightMap).reduce(function (
        prev,
        curr
      ) {
        return prev + curr;
      },
      0);
    }

    let speciesNamesSorted = Object.keys(speciesListing)
      .filter((key) => key !== genusListing || genusLine)
      .sort((a, b) => {
        return (
          Math.min(...speciesListing[b].map((e) => parseInt(e.year))) -
          Math.min(...speciesListing[a].map((e) => parseInt(e.year)))
        );
      });

    let classString = "timelineSVG";
    if (genusLine) {
      classString += " genusLine";
    } else {
      classString += this.firstSVGAdded ? "" : " topper";
    }

    let justUp = Object.keys(characteristicsToTrendResult).filter(
      (e) => characteristicsToTrendResult[e] > 0
    );
    let firstUpTrend = Math.min(
      ...justUp.map((e) => uniqueCharacteristics.indexOf(e))
    );

    let justDown = Object.keys(characteristicsToTrendResult).filter(
      (e) => characteristicsToTrendResult[e] < 0
    );
    let firstDownTrend = Math.min(
      ...justDown.map((e) => uniqueCharacteristics.indexOf(e))
    );

    if (!isFinite(firstDownTrend)) {
      firstDownTrend = 0;
    }

    if (!isFinite(firstUpTrend)) {
      firstUpTrend = uniqueCharacteristics.length;
    }

    let trendObject = {};

    let trendData = [];

    if (uniqueCharacteristics.length - justDown.length - justUp.length > 0) {
      trendData.push({
        rowNum: firstDownTrend + justDown.length,
        type: "",
        length: uniqueCharacteristics.length - justDown.length - justUp.length
      });
      trendObject[firstDownTrend + justDown.length] = {
        type: "",
        length: uniqueCharacteristics.length - justDown.length - justUp.length
      };
    }

    if (justDown.length > 0) {
      trendData.push({
        rowNum: firstDownTrend,
        type: "down",
        length: justDown.length
      });
      trendObject[firstDownTrend] = { type: "down", length: justDown.length };
    }

    if (justUp.length > 0) {
      trendData.push({
        rowNum: firstUpTrend,
        type: "up",
        length: justUp.length
      });
      trendObject[firstUpTrend] = { type: "up", length: justUp.length };
    }

    let rowCount = this.groupSame ? uniqueCharacteristics.length : speciesCount;

    let sortedTrendKeys = Object.keys(trendObject).sort(
      (a, b) => parseInt(a) - parseInt(b)
    );

    let trendRows = [];

    let addIdx = 0;
    for (let key of sortedTrendKeys) {
      for (let tmp = 0; tmp < trendObject[key]["length"]; tmp++) {
        trendRows.push(addIdx);
      }
      addIdx++;
    }

    let svgHeight = 0;

    if (this.groupSame) {
      if (genusLine) {
        svgHeight = this.getRowHeight(genusLine);
      } else {
        if (this.sortGrouped === "trend") {
          let add = withGenusLineOnTop ? 0.5 * trendData.length : 0;
          svgHeight = (rowCount + add) * this.rowHeight;
        } else {
          svgHeight = rowCount * this.rowHeight;
        }
      }
    } else {
      svgHeight = rowCount * this.getRowHeight(genusLine);
    }

    let timelineWidth = Math.round(
      this.x(this.domainYears.maxYear) + this.x.bandwidth() / 2
    );

    let svgCITES = this.wrapper
      .append("svg")
      .attr("class", classString)
      .attr("id", this.id + "Cites" + genusLine)
      .attr("width", this.width + 130)
      .attr("height", svgHeight)
      .style("display", "block");

    svgCITES.style("display", "block");

    let defs = svgCITES.append("defs");

    let g = svgCITES
      .append("g")
      .attr("transform", "translate(" + this.margin.left + "," + 0 + ")")
      .attr("height", svgHeight);

    g.append("text")
      .attr("transform", "translate(-" + 5 + "," + svgHeight / 2 + ")")
      .style("dominant-baseline", "central")
      .style("font-size", "12px")
      .style("text-anchor", "end")
      .text("CITES");

    let rect = g
      .append("rect")
      .attr("width", timelineWidth)
      .attr("height", svgHeight)
      .attr("stroke", "gray")
      .style("fill", "none");

    let keyData = [];
    if (this.groupSame) {
      let already = [];
      let newData = [];
      for (let entry of newListingData) {
        if (!already.includes(entry.sciName)) {
          newData.push(entry);
          already.push(entry.sciName);
        }
      }
      keyData = newData;
    } else {
      keyData = Object.values(speciesListing).map((e) => e[0]);
    }

    if (this.groupSame && keyData.length > 1) {
      g.selectAll("g myCircleText")
        .data(keyData)
        .enter()
        .append("rect")
        .attr("width", (d) => {
          if (genusLine) {
            return 0;
          } else {
            return scaleValue(
              charCounting[characteristicsMap[d.sciName]],
              [0, speciesCount],
              [1, 100]
            );
          }
        })
        .attr("height", (d) => {
          return this.getRowHeight(genusLine);
        })
        .style("fill", "var(--main)")
        .attr("transform", (d) => {
          let rowNum = 0;
          if (this.groupSame) {
            rowNum = uniqueCharacteristics.indexOf(
              characteristicsMap[d.sciName]
            );
          } else {
            rowNum = speciesNamesSorted.indexOf(d.sciName);
          }

          let yPos = this.calcYPos(
            rowNum,
            trendRows,
            genusLine,
            withGenusLineOnTop
          );
          return (
            "translate(" +
            -scaleValue(
              charCounting[characteristicsMap[d.sciName]],
              [0, speciesCount],
              [1, 100]
            ) +
            ", " +
            yPos +
            ")"
          );
        });
    }

    if (keyData.length > 1 || genusLine) {
      g.selectAll("g myCircleText")
        .data(keyData)
        .enter()
        .append("text")
        .style("text-anchor", "end")
        .style("dominant-baseline", "central")
        .style("font-size", "9")
        .style("font-style", (d) => {
          return genusLine ? "" : "italic";
        })
        .attr("transform", (d) => {
          let rowNum = 0;
          if (this.groupSame) {
            rowNum = uniqueCharacteristics.indexOf(
              characteristicsMap[d.sciName]
            );
          } else {
            rowNum = speciesNamesSorted.indexOf(d.sciName);
          }

          let yPos =
            this.calcYPos(rowNum, trendRows, genusLine, withGenusLineOnTop) +
            this.getRowHeight(genusLine) / 2;

          if (genusLine) {
            return "translate(" + -3 + ", " + yPos + ")";
          } else if (this.groupSame) {
            return (
              "translate(" +
              (-3 -
                scaleValue(
                  charCounting[characteristicsMap[d.sciName]],
                  [0, speciesCount],
                  [0, 100]
                )) +
              ", " +
              yPos +
              ")"
            );
          } else {
            return "translate(" + -3 + ", " + yPos + ")";
          }
        })
        .text((d) => {
          if (this.groupSame) {
            let counting = charCounting[characteristicsMap[d.sciName]];

            if (counting === 1) {
              return d.species;
            } else {
              return counting;
            }
          } else {
            return d.species;
          }
        });
    }

    appendCitesRects.bind(this)(newListingData);

    function appendCitesRects(lData) {
      let elem = g.selectAll("g myCircleText").data(lData);

      let colorBlind = this.colorBlind;

      let elemEnter = elem
        .enter()
        .append("g")
        .attr("class", "noselect")
        .attr(
          "transform",
          function (d) {
            let rowNum = 0;
            if (this.groupSame) {
              rowNum = uniqueCharacteristics.indexOf(
                characteristicsMap[d.sciName]
              );
            } else {
              rowNum = speciesNamesSorted.indexOf(d.sciName);
            }

            return (
              "translate(" +
              (this.x(Number(d.year)) + this.x.bandwidth() / 2) +
              "," +
              0 +
              ")"
            );
          }.bind(this)
        )
        .attr(
          "x",
          function (d) {
            return this.x(Number(d.year) + this.x.bandwidth() / 2);
          }.bind(this)
        )
        .on("mouseover", this.mouseover)
        .on("mousemove", this.mousemove)
        .on("mouseleave", this.mouseleave);

      elemEnter
        .append("rect")
        .attr("class", "pinarea")
        .attr("height", (d) => {
          return this.rowHeight - 2;
        })
        .attr(
          "width",
          function (d) {
            return (
              timelineWidth -
              this.x(Number(d.year)) -
              this.x.bandwidth() / 2 -
              1
            );
          }.bind(this)
        )
        .style("fill", "white")
        .style("transform", "translateY(1px)");

      elemEnter
        .append("rect")
        .attr("class", "pinarea")
        .attr("y", (d) => {
          return this.rowHeight / 2 - 1.5 + "px";
        })
        .attr("height", (d) => {
          return "3px";
          //return this.rowHeight;
        })
        /* .attr("height", (d) => {
                    if (d.rank === "GENUS") {
                        return (speciesCount + 1) * this.getRowHeight(genusLine);
                    }
                    else {
                        return this.getRowHeight(genusLine);
                    }
                }) */
        .attr(
          "width",
          function (d) {
            return (
              timelineWidth - this.x(Number(d.year)) - this.x.bandwidth() / 2
            );
          }.bind(this)
        )
        .style("fill", function (d) {
          switch (d.type) {
            case "listingHistory":
              if (d.hasOwnProperty("countries")) {
                let id = "diagonalHatch" + d.appendix + "6";

                if (defs.select("#" + id).empty()) {
                  defs
                    .append("pattern")
                    .attr("id", id)
                    .attr("patternUnits", "userSpaceOnUse")
                    .attr("width", 6)
                    .attr("height", 6)
                    .attr("patternTransform", "rotate(45)")
                    .append("line")
                    .attr("x1", 0)
                    .attr("y", 0)
                    .attr("x2", 0)
                    .attr("y2", 6)
                    .attr("stroke", () => {
                      return citesAssessment
                        .get(d.appendix)
                        .getColor(colorBlind);
                    })
                    .attr("stroke-width", 6);
                }

                return "url(#" + id + ")";
              } else {
                return citesAssessment.get(d.appendix).getColor(colorBlind);
              }
            default:
              break;
          }
        });

      //Add arrows / triangles
      elemEnter
        .append("path")
        .attr(
          "d",
          "M 0 " +
            0 +
            " L " +
            Math.min(this.rowHeight, this.x.bandwidth()) +
            " " +
            this.rowHeight / 2 +
            " L 0 " +
            this.rowHeight +
            " z"
        )
        .attr("fill", function (d) {
          return citesAssessment.get(d.appendix).getColor(colorBlind);
        });
    }
  }

  appendIUCNWithoutGenus(iucnData) {
    let speciesListing = {};

    let listingKeys = [];
    let newListingData = [];

    let characteristicsMap = {};
    let trendMap = {};

    let lastListing = null;

    let maxHeightScale = 5;

    for (let listing of iucnData.sort((a, b) => {
      if (parseInt(a.year) === parseInt(b.year)) {
        return (
          iucnAssessment.get(b.code).sort - iucnAssessment.get(a.code).sort
        );
      } else {
        return parseInt(a.year) - parseInt(b.year);
      }
    })) {
      let push = true;
      let name = listing.sciName;

      let listingKey = `${listing.year}${listing.code}${listing.sciName}`;
      let characteristic = `${listing.year}${
        iucnAssessment.get(listing.code).sort
      }`;
      if (speciesListing.hasOwnProperty(name)) {
        if (!listingKeys.includes(listingKey)) {
          speciesListing[name].push(listing);
          if (push) {
            newListingData.push(listing);
          }
          characteristicsMap[name][listing.year] = characteristic;
          trendMap[name][listing.year] = listing.code;
        }
      } else {
        speciesListing[name] = [listing];
        if (push) {
          newListingData.push(listing);
        }
        characteristicsMap[name] = {};
        characteristicsMap[name][listing.year] = characteristic;
        trendMap[name] = {};
        trendMap[name][listing.year] = listing.code;
      }

      listingKeys.push(listingKey);

      if (this.timeFrame[1] !== undefined) {
        if (parseInt(listing.year) < this.timeFrame[1]) {
          lastListing = listing;
        }
      } else {
        lastListing = listing;
      }
    }

    this.iucnSignThreat = lastListing ? lastListing.code : null;

    this.setSpeciesSignThreats(this.speciesName, "iucn", this.iucnSignThreat);

    let timelineWidth = Math.round(
      this.x(this.domainYears.maxYear) + this.x.bandwidth() / 2
    );

    let svgHeight = this.rowHeight;

    let svgIUCN = this.wrapper
      .append("svg")
      .attr("id", this.id + "IUCN")
      /* .attr("class", this.firstSVGAdded ? "timelineSVG" : "timelineSVG topper") */
      .attr("class", "timelineSVG topper")
      .attr("width", this.width + 130 + this.rightGroupWidth)
      .attr("height", svgHeight)
      .style("display", "inline-block");

    svgIUCN.style("display", "block");

    let defs = svgIUCN.append("defs");

    let g = svgIUCN
      .append("g")
      .attr("transform", "translate(" + this.margin.left + "," + 0 + ")")
      .attr("height", svgHeight + 1);

    let trendGroup = svgIUCN
      .append("g")
      .attr("class", "trendGroud")
      .attr("transform", "translate(" + (timelineWidth + 130) + ",0)")
      .attr("height", svgHeight);

    trendGroup
      .append("rect")
      .attr("width", this.rightGroupWidth)
      .attr("height", svgHeight)
      .style("fill", "white");

    this.appendTrend(trendGroup, this.data.populationTrend);

    g.append("text")
      .attr("transform", "translate(-" + 5 + "," + svgHeight / 2 + ")")
      .style("text-anchor", "end")
      .style("dominant-baseline", "central")
      .style("font-size", "12px")
      .text("IUCN");

    let rect = g
      .append("rect")
      .attr("width", timelineWidth - 1)
      .attr("height", svgHeight)
      .style("stroke", "gray")
      .style("fill", "none");

    let keyData = [];
    if (this.groupSame) {
      let already = [];
      let newData = [];
      for (let entry of newListingData) {
        if (!already.includes(entry.sciName)) {
          newData.push(entry);
          already.push(entry.sciName);
        }
      }
      keyData = newData;
    } else {
      keyData = Object.values(speciesListing).map((e) => e[0]);
    }

    if (keyData.length > 1)
      g.selectAll("g myCircleText")
        .data(keyData)
        .enter()
        .append("text")
        .style("text-anchor", "end")
        .style("dominant-baseline", "central")
        .style("font-size", "9")
        .style("font-style", (d) => "italic")
        .attr("transform", (d) => {
          return "translate(" + -3 + ", " + 0 + ")";
        })
        .text((d) => {
          return d.sciName.replace(d.genus, "").trim();
        });

    appendIUCNRects.bind(this)(newListingData);

    function appendIUCNRects(lData) {
      let elem = g.selectAll("g myCircleText").data(lData);
      let colorBlind = this.colorBlind;

      let elemEnter = elem
        .enter()
        .append("g")
        .attr("class", "noselect")
        .attr(
          "transform",
          function (d) {
            let rowNum = 0;

            return (
              "translate(" +
              (this.x(Number(d.year)) + this.x.bandwidth() / 2) +
              "," +
              0 +
              ")"
            );
          }.bind(this)
        )
        .attr(
          "x",
          function (d) {
            return this.x(Number(d.year) + this.x.bandwidth() / 2);
          }.bind(this)
        )
        .on("mouseover", this.mouseover)
        .on("mousemove", this.mousemove)
        .on("mouseleave", this.mouseleave);

      elemEnter
        .append("rect")
        .attr("class", "pinarea")
        .attr("height", (d) => {
          return this.rowHeight - 2;
        })
        .attr(
          "width",
          function (d) {
            return (
              timelineWidth -
              this.x(Number(d.year)) -
              this.x.bandwidth() / 2 -
              1
            );
          }.bind(this)
        )
        .style("fill", "white")
        .style("transform", "translateY(1px)");

      elemEnter
        .append("rect")
        .attr("class", "pinarea")
        .attr("y", (d) => {
          return this.rowHeight / 2 - 1.5 + "px";
        })
        .attr("height", (d) => {
          return "3px";
          //return this.rowHeight;
        })
        .attr(
          "width",
          function (d) {
            return (
              timelineWidth - this.x(Number(d.year)) - this.x.bandwidth() / 2
            );
          }.bind(this)
        )
        .style("fill", function (d) {
          return iucnAssessment.get(d.code).getColor(colorBlind);
        });
      /* .style("stroke", "gray")
            .style("stroke-width", 1); */

      //Add arrows / triangles
      elemEnter
        .append("path")
        .attr(
          "d",
          "M 0 " +
            0 +
            " L " +
            Math.min(this.rowHeight, this.x.bandwidth()) +
            " " +
            this.rowHeight / 2 +
            " L 0 " +
            this.rowHeight +
            " z"
        )
        .attr("fill", function (d) {
          return iucnAssessment.get(d.code).getColor(colorBlind);
        });
    }
  }

  appendThreatsWithoutGenus(threatData) {
    let speciesListing = {};

    let listingKeys = [];
    let newListingData = [];

    let characteristicsMap = {};

    let lastListing = null;

    /* threatData = threatData.filter(e => e.year === 2014); */

    threatData = threatData.sort((a, b) => {
      let diff = parseInt(a.year) - parseInt(b.year);

      if (diff === 0) {
        return (
          bgciAssessment.get(b.danger).sort - bgciAssessment.get(a.danger).sort
        );
      } else {
        return diff;
      }
    });

    for (let listing of threatData) {
      let push = true;
      let name = `${listing.genusSpecies}`.trim();

      if (listing.scope !== "Global") {
        push = false;
      }

      listing.text = listing.danger;

      listing.sciName = name;

      let listingKey = `${listing.year}${listing.danger}${listing.sciName}`;
      let characteristic = `${listing.year}${listing.danger}`;

      if (push) {
        if (speciesListing.hasOwnProperty(name)) {
          if (!listingKeys.includes(listingKey)) {
            speciesListing[name].push(listing);
            newListingData.push(listing);
            characteristicsMap[name][listing.year] = characteristic;
          }
        } else {
          speciesListing[name] = [listing];
          newListingData.push(listing);
          characteristicsMap[name] = {};
          characteristicsMap[name][listing.year] = characteristic;
        }

        listingKeys.push(listingKey);
        if (this.timeFrame[1] !== undefined) {
          if (parseInt(listing.year) < this.timeFrame[1]) {
            lastListing = listing;
          }
        } else {
          lastListing = listing;
        }
      }
    }

    this.setSpeciesSignThreats(
      this.speciesName,
      "threat",
      lastListing ? lastListing.danger : null
    );

    let sumMap = {};

    let charCounting = Object.values(characteristicsMap).reduce(function (
      countMap,
      word
    ) {
      countMap[word] = ++countMap[word] || 1;
      return countMap;
    },
    {});

    let uniqueCharacteristics = Object.keys(charCounting);

    let newSumMap = {};

    let speciesCount = Object.keys(speciesListing).length;

    let heightMap = {};
    if (this.groupSame) {
      let charsAlready = [];
      let newData = [];
      let filteredSpecies = [];

      for (let entry of newListingData) {
        let char = characteristicsMap[entry.sciName];

        if (
          !charsAlready.includes(char) ||
          filteredSpecies.includes(entry.sciName)
        ) {
          let charCount = charCounting[characteristicsMap[entry.sciName]];
          let heightScale = (charCount > 1 ? charCount : 0) / speciesCount;

          entry.heightScale = heightScale;

          newData.push(entry);
          filteredSpecies.push(entry.sciName);
          charsAlready.push(char);

          if (!Object.keys(heightMap).includes(char)) {
            heightMap[char] = heightScale;
          }
        }
      }

      newListingData = newData;

      this.heightScaleSum = Object.values(heightMap).reduce(
        (prev, curr) => prev + curr
      );
    }

    let speciesNamesSorted = Object.keys(speciesListing).sort((a, b) => {
      if (
        Math.min(...speciesListing[b].map((e) => parseInt(e.year))) >
        Math.min(...speciesListing[a].map((e) => parseInt(e.year)))
      ) {
        return 1;
      } else if (
        Math.min(...speciesListing[b].map((e) => parseInt(e.year))) <
        Math.min(...speciesListing[a].map((e) => parseInt(e.year)))
      ) {
        return -1;
      } else {
        return (
          bgciAssessment.get(speciesListing[b][0].danger).sort -
          bgciAssessment.get(speciesListing[a][0].danger).sort
        );
      }
    });

    let keyData = [];
    if (this.groupSame) {
      let already = [];
      let newData = [];
      for (let entry of newListingData) {
        if (!already.includes(entry.sciName)) {
          newData.push(entry);
          already.push(entry.sciName);
        }
      }
      keyData = newData;
    } else {
      keyData = Object.values(speciesListing).map((e) => e[0]);
    }

    let rowCount = 1;

    // ############# THREATS #############

    let svgHeight = this.rowHeight;

    let timelineWidth = Math.round(
      this.x(this.domainYears.maxYear) + this.x.bandwidth() / 2
    );

    threatData = newListingData;

    let svgThreat = this.wrapper
      .append("svg")
      .attr("id", this.id + "Threat")
      /* .attr("class", this.firstSVGAdded ? "timelineSVG" : "timelineSVG topper") */
      .attr("class", "timelineSVG topper")
      .attr("width", this.width + 130)
      .attr("height", svgHeight);

    let maxCount = 0;

    svgThreat.style("display", "block");

    let g = svgThreat
      .append("g")
      .attr("transform", "translate(" + this.margin.left + "," + 0 + ")");

    g.append("text")
      .attr("transform", "translate(-" + 5 + "," + svgHeight / 2 + ")")
      .style("text-anchor", "end")
      .style("dominant-baseline", "central")
      .style("font-size", "12px")
      .text("BGCI");

    /* if (this.groupSame && keyData.length > 1) {
      g.selectAll("g myCircleText")
        .data(keyData)
        .enter()
        .append("rect")
        .attr("width", (d) => {
          return scaleValue(
            charCounting[characteristicsMap[d.sciName]],
            [0, speciesCount],
            [1, 100]
          );
        })
        .attr("height", (d) => {
          return this.rowHeight;
        })
        .style("fill", "var(--main)")
        .attr("transform", (d) => {
          let rowNum = 0;
          if (this.groupSame) {
            rowNum = uniqueCharacteristics.indexOf(
              characteristicsMap[d.sciName]
            );
          } else {
            rowNum = speciesNamesSorted.indexOf(d.sciName);
          }

          return (
            "translate(" +
            -scaleValue(
              charCounting[characteristicsMap[d.sciName]],
              [0, speciesCount],
              [1, 100]
            ) +
            ", " +
            0 +
            ")"
          );
        });
    } */

    /* if (keyData.length > 1) {
      g.selectAll("g myCircleText")
        .data(keyData)
        .enter()
        .append("text")
        .style("text-anchor", "end")
        .style("dominant-baseline", "central")
        .style("font-size", "9")
        .style("font-style", (d) => "italic")
        .attr("transform", (d) => {
          let rowNum = 0;
          if (this.groupSame) {
            rowNum = uniqueCharacteristics.indexOf(
              characteristicsMap[d.sciName]
            );
          } else {
            rowNum = speciesNamesSorted.indexOf(d.sciName);
          }

          return "translate(" + -3 + ", " + 0 + ")";
        })
        .text((d) => {
          if (this.groupSame) {
            let counting = charCounting[characteristicsMap[d.sciName]];

            if (counting === 1) {
              return d.sciName.replace(d.genus, "").trim();
            } else {
              return counting;
            }
          } else {
            return d.sciName.replace(d.genus, "").trim();
          }
        });
    } */

    let rect = g
      .append("rect")
      .attr("width", timelineWidth)
      .attr("height", svgHeight)
      .style("fill", "none")
      .style("stroke", "gray");

    let elem = g.selectAll("g myCircleText").data(threatData);
    let colorBlind = this.colorBlind;

    let elemEnter = elem
      .enter()
      .append("g")
      .attr("class", "noselect")
      .attr(
        "transform",
        function (d) {
          let rowNum = 0;
          if (this.groupSame) {
            rowNum = uniqueCharacteristics.indexOf(
              characteristicsMap[d.sciName]
            );
          } else {
            rowNum = speciesNamesSorted.indexOf(d.sciName);
          }

          /*         let addY = 0;
                        for (let idx = 0; idx < rowNum; idx++) {
                            addY += heightMap[uniqueCharacteristics[idx]];
                        } */

          return (
            "translate(" +
            (this.x(Number(d.year)) + this.x.bandwidth() / 2) +
            "," +
            0 +
            ")"
          );
        }.bind(this)
      )
      .attr(
        "x",
        function (d) {
          return this.x(Number(d.year)) + this.x.bandwidth() / 2;
        }.bind(this)
      )
      .on("mouseover", this.mouseover)
      .on("mousemove", this.mousemove)
      .on("mouseleave", this.mouseleave);

    elemEnter
      .filter((d) => d.scope === "Global")
      .append("rect")
      .attr("class", "pinarea")
      .attr("y", (d) => {
        return this.rowHeight / 2 - 1.5 + "px";
      })
      .attr("height", (d) => {
        return "3px";
        //return this.rowHeight;
      })
      /* .attr("height", this.rowHeight) */
      .attr(
        "width",
        function (d) {
          //return this.x.bandwidth() + 2;
          return (
            timelineWidth -
            this.x(Number(d.year)) -
            Math.floor(this.x.bandwidth() / 2) -
            1
          );
        }.bind(this)
      )
      .style("fill", (d) => {
        return bgciAssessment.get(d.danger).getColor(colorBlind);
      });

    //Add arrows / triangles
    elemEnter
      .append("path")
      .attr(
        "d",
        "M 0 " +
          0 +
          " L " +
          Math.min(this.rowHeight, this.x.bandwidth()) +
          " " +
          this.rowHeight / 2 +
          " L 0 " +
          this.rowHeight +
          " z"
      )
      .attr("fill", function (d) {
        return bgciAssessment.get(d.danger).getColor(colorBlind);
      });
  }

  mouseover(d) {
    d3.select(".tooltip").style("display", "block");
  }

  tooltipMove(event) {
    let windowHeight = window.innerHeight;
    let add = 25;

    let tooltip = d3.select(".tooltip");
    let height = tooltip.node().getBoundingClientRect().height;
    tooltip
      .style("left", event.pageX + 25 + "px")
      .style("top", Math.min(windowHeight - height, event.pageY + 25) + "px");
  }

  getTooltip(d) {
    let text = "<b><i>" + d.data.name + "</i></b><br>";
    text += d.value + " Species";

    return text;
  }

  tooltip(d, event, highlight) {
    let colorBlind = this.colorBlind;
    function createThreatLegend(threat, type) {
      let ret = d3.create("div").style("text-align", "center");

      if (threat === null) {
        ret
          .style(
            "background-color",
            citesAssessment.dataDeficient.getColor(colorBlind)
          )
          .style(
            "color",
            citesAssessment.dataDeficient.getForegroundColor(colorBlind)
          )
          .text("n/a");
      } else {
        ret
          .style("background-color", threat.getColor(colorBlind))
          .style("color", threat.getForegroundColor(colorBlind))
          .text(threat.abbreviation);
      }

      return ret;
    }

    let tooltip = d3.select(".tooltip");
    let lastSpeciesSigns = this.lastSpeciesSigns;

    let content = d3.select("#" + this.id);
    let copyImage = content
      .select(".speciesImageWrapper")
      .clone(true)
      .remove()
      .style("position", "relative")
      .style("width", "250px")
      .style("height", "150px")
      .style("grid-column-start", 1)
      .style("grid-column-end", 1)
      .style("grid-row-start", 2)
      .style("grid-row-end", 2)
      .style("align-self", "center")
      .style("justify-self", "center");

    let scale = 4;

    let copyIcon = content.select(".iconSVG").clone(true).remove();

    let width = copyIcon.attr("width");

    copyIcon
      .attr("width", width * scale - 10)
      .style("transform", "scale(" + scale + ")");

    if (highlight) {
      let wrapper = tooltip
        .html("")
        .style("display", "block")
        .style("padding", "10px")
        .style("left", event.pageX + 25 + "px")
        .style("top", event.pageY + 25 + "px")
        .append("div")
        /*  .style("max-width", this.width + "px")
        .style("min-width", "250px") */
        /* .style("height", "150px") */
        .style("display", "grid")
        .style("grid-template-columns", "auto auto auto auto auto auto auto")
        .style("grid-template-rows", "auto auto auto auto")
        .style("row-gap", "8px")
        .style("column-gap", "8px");

      wrapper
        .append("div")
        .style("grid-column-start", 1)
        .style("grid-column-end", 1)
        .style("grid-row-start", 1)
        .style("grid-row-end", 1)
        .style("align-self", "center")
        .style("justify-self", "center")
        .append("text")
        .style("font-weight", "bold")
        .style("font-style", "italic")
        .text(d);

      wrapper
        .append("div")
        .style("grid-column-start", 1)
        .style("grid-column-end", "span 6")
        .style("grid-row-start", 4)
        .style("grid-row-end", 4)
        .html("<i>Click to filter!</i>");

      if (copyImage.node()) {
        wrapper
          .append("div")
          .style("grid-column-start", 1)
          .style("grid-column-end", "span 6")
          .style("grid-row-start", 3)
          .style("grid-row-end", 3)
          .html("&copy; " + this.data["Foto source"]);

        wrapper.append(() => copyImage.node());
      }

      let tradeWrapper = wrapper
        .append("div")
        .style("grid-column-start", 2)
        .style("grid-column-end", 2)
        .style("grid-row-start", 1)
        .style("grid-row-end", "span 2")
        .style("align-self", "center")
        .style("justify-self", "center");

      tradeWrapper
        .append("div")
        .style("white-space", "nowrap")
        .style("font-weight", "normal")
        .style("margin-bottom", "5px")
        .html(this.getTreeThreatLevel(d, "economically").getName());

      let tradeTable = tradeWrapper
        .append("div")
        .style("white-space", "nowrap")
        .style("font-weight", "normal")
        .style("display", "grid")
        .style("grid-template-columns", "auto auto")
        .style("grid-template-rows", "auto auto");

      tradeTable
        .append("div")
        .style("grid-column-start", 1)
        .style("grid-column-end", 1)
        .style("grid-row-start", 1)
        .style("grid-row-end", 1)
        .style("align-self", "start")
        .text("Cites:");

      tradeTable
        .append("div")
        .style("grid-column-start", 2)
        .style("grid-column-end", 2)
        .style("grid-row-start", 1)
        .style("grid-row-end", 1)
        .style("align-self", "end")
        .append(() =>
          createThreatLegend(
            this.lastSpeciesThreats[d]["cites"],
            "CITES"
          ).node()
        );

      wrapper
        .append("div")
        .style("grid-column-start", 3)
        .style("grid-column-end", 3)
        .style("grid-row-start", 1)
        .style("grid-row-end", "span 2")
        .style("align-self", "center")
        .style("justify-self", "center")
        .style("margin-left", "10px")
        .style("margin-right", "-10px")
        .append("text")
        .text("Trade");

      let threatWrapper = wrapper
        .append("div")
        .style("grid-column-start", 6)
        .style("grid-column-end", 6)
        .style("grid-row-start", 1)
        .style("grid-row-end", "span 2")
        .style("align-self", "center")
        .style("justify-self", "center");

      threatWrapper
        .append("div")
        .style("white-space", "nowrap")
        .style("font-weight", "normal")
        .style("margin-bottom", "5px")
        .html(this.getTreeThreatLevel(d, "ecologically").getName());

      let threatTable = threatWrapper
        .append("div")
        .style("display", "grid")
        .style("font-weight", "normal")
        .style("grid-template-columns", "auto auto")
        .style("grid-template-rows", "auto auto");
      /* .style("row-gap", "5px")
        .style("column-gap", "5px"); */

      threatTable
        .append("div")
        .style("grid-column-start", 1)
        .style("grid-column-end", 1)
        .style("grid-row-start", 1)
        .style("grid-row-end", 1)
        .style("align-self", "start")
        .text("IUCN:");

      threatTable
        .append("div")
        .style("grid-column-start", 2)
        .style("grid-column-end", 2)
        .style("grid-row-start", 1)
        .style("grid-row-end", 1)
        .style("align-self", "end")
        .append(() =>
          createThreatLegend(this.lastSpeciesThreats[d]["iucn"], "IUCN").node()
        );

      threatTable
        .append("div")
        .style("grid-column-start", 1)
        .style("grid-column-end", 1)
        .style("grid-row-start", 2)
        .style("grid-row-end", 2)
        .style("align-self", "start")
        .text("BGCI:");

      threatTable
        .append("div")
        .style("grid-column-start", 2)
        .style("grid-column-end", 2)
        .style("grid-row-start", 2)
        .style("grid-row-end", 2)
        .style("align-self", "end")
        .append(() =>
          createThreatLegend(this.lastSpeciesThreats[d]["bgci"], "BGCI").node()
        );

      wrapper
        .append("div")
        .style("grid-column-start", 5)
        .style("grid-column-end", 5)
        .style("grid-row-start", 1)
        .style("grid-row-end", "span 2")
        .style("align-self", "center")
        .style("justify-self", "center")
        .style("margin-left", "-10px")
        .style("margin-right", "10px")
        .append("text")
        .text("Threat");

      let iconWrapper = wrapper
        .append("div")
        .style("width", width * scale - 10 + "px")
        .style("grid-column-start", 4)
        .style("grid-column-end", 4)
        .style("grid-row-start", 1)
        .style("grid-row-end", "span 2")
        .style("align-self", "center")
        .style("justify-self", "center");
      iconWrapper.append(() => copyIcon.node());

      d3.select("#" + this.id).style(
        "border",
        "2px solid var(--highlightpurple)"
      );
    } else {
      tooltip.html("").style("display", "none");
      d3.select("#" + this.id).style("border", "none");
    }
  }

  tooltipTrend(d, event, highlight) {
    let tooltip = d3.select(".tooltip");

    if (highlight) {
      tooltip.html("").style("display", "block");

      let content = d3.select("#" + this.id);

      tooltip.append("div").html("<b><i>" + d.speciesName + "</i></b>");

      tooltip.append("div").html("IUCN Red List<br>Population Trend:");

      let svg = tooltip
        .append("div")
        .style("display", "inline-block")
        .append("svg")
        .attr("width", 15)
        .attr("height", 25);

      tooltip.append("div").style("display", "inline-block").html(d.type);

      this.appendTrend(svg, d.type);
    } else {
      tooltip.html("").style("display", "none");
    }
  }

  mousemove(d) {
    //var parentOffset = $(this).closest("svg").offset();
    var parentOffset = d3
      .select(d3.select(this).node().closest("svg"))
      .node()
      .getBoundingClientRect();

    /* console.log(d3.event.pageX, d3.event); */

    let htmlText = "";
    let leftAdd = 0;
    let topAdd = 0;

    /*         if (Array.isArray(d)) {
                    d3.select(this).style("fill", "rgba(9, 94, 142, 1)");
        
                    let x0 = d3.mouse(this)[0];
        
                    let bandwidth = x.bandwidth();
                    let year = null;
                    for (let s of x.domain().values()) {
                        if (x(s) + bandwidth >= x0) {
                            year = s;
                            break;
                        }
                    }
        
                    d = d.filter((e) => e.year === year)[0];
        
                    htmlText = "Amount of trades from " + d.source + ": " + d.trades.length + " in " + year;
                    topAdd = 25;
                } else { */

    switch (d.type) {
      case "trade":
        htmlText = "Amount of trades: " + d.count + " in " + d.year;
        topAdd = 25;
        break;
      case "listingHistory":
        htmlText =
          "<i><b>" +
          d.sciName +
          "</i></b><br>" +
          d.year +
          " : Appendix " +
          d.appendix;
        if (d.hasOwnProperty("annotation")) {
          htmlText += "<br>" + d.annotation;
        }
        leftAdd = parseInt(d3.select(this).attr("x"));
        break;
      case "iucn":
        htmlText =
          "<i><b>" +
          d.sciName +
          "</i></b><br>" +
          d.year +
          " : " +
          d.category +
          " | " +
          d.code;
        leftAdd = parseInt(d3.select(this).attr("x"));
        break;
      case "threat":
        htmlText =
          "<i><b>" +
          d.sciName +
          "</i></b><br>" +
          d.year +
          " : " +
          bgciAssessment.get(d.text).name +
          " | " +
          d.scope +
          (d.countries ? " | " + d.countries : "") +
          " <br> " +
          d.reference;
        leftAdd = parseInt(d3.select(this).attr("x"));
        break;
      case "threatpie":
        htmlText =
          d.year +
          "<br>" +
          Object.keys(d.data)
            .map(
              (key) =>
                d.data[key][0].threatened +
                " (" +
                d.data[key].length +
                ") " +
                d.data[key]
                  .filter((e) => e.countries !== undefined)
                  .map((e) => e.countries)
                  .join(", ")
            )
            .join("<br>");
        leftAdd = parseInt(d3.select(this).attr("x"));
        break;
      default:
        // statements_def
        break;
    }
    /* } */

    d3.select(".tooltip")
      .html(htmlText)
      /* .style("left", leftAdd + d3.mouse(this)[0] + 85 + "px")
            .style("top", parentOffset.top + d3.mouse(this)[1] + 10 + topAdd + "px"); */
      .style("left", d.pageX + 25 + "px")
      .style("top", d.pageY + topAdd + "px");
  }

  mouseleave(d) {
    d3.select(this).style("fill", d3.select(this).attr("origFill"));
    d3.select(".tooltip").style("display", "none");
  }

  paint() {
    this.width =
      this.initWidth -
      this.margin.left -
      this.margin.right -
      this.rightGroupWidth;
    this.height = this.initHeight - this.margin.top - this.margin.bottom;

    this.clearAndReset();

    if (this.zoomLevel === 0 && this.justTrade === true) {
      this.height = this.height / 2.5;
    }

    let yearDiff = this.domainYears.maxYear - this.domainYears.minYear;

    /* let ticks = 20;
        let tickSize = Math.ceil(yearDiff / ticks);
     
        let tmpMinYear = Math.floor(this.domainYears.minYear / 10) * 10; */

    this.xDomain = Array(yearDiff + 1)
      .fill()
      .map((_, i) => this.domainYears.minYear - 1 + i + 1);

    this.x = d3.scaleBand().domain(this.xDomain).rangeRound([0, this.width]);

    this.y = d3.scaleLinear().rangeRound([this.height, 0]);

    // var circleYearCount = {};

    if (this.data) {
      let [data, groupedBySource] = [[], []];

      if (this.data.hasOwnProperty("timeTrade")) {
        [data, groupedBySource] = this.data.timeTrade;
      }

      this.y.domain([
        0,
        d3.max(data, function (d) {
          return Number(d.count);
        })
      ]);

      if (this.justTrade === true) {
        if (this.zoomLevel > 0) {
          this.appendCitesTradeStacked(data, groupedBySource);
        } else {
          this.appendCitesTrade(data, groupedBySource);
        }
      } else {
        if (this.zoomLevel > 0) {
          this.radius = Math.ceil(
            Math.min(this.x.bandwidth() / 2 - 5, this.height / 2)
          );
          this.fontSize = this.radius;
        } else {
          this.radius = Math.ceil(
            Math.min(this.x.bandwidth() / 6, this.height / 2)
          );
          this.fontSize = 9;
        }

        /* console.log(this.speciesName, this.data); */

        if (this.zoomLevel > 0) {
          this.rowHeight = this.rowHeight + 1;
        } else {
          this.rowHeight = this.rowHeight + 1;
        }

        if (
          this.data.hasOwnProperty("timeListing") &&
          this.data.timeListing.length
        ) {
          /* if (this.zoomLevel > 0) {
                        if (this.justGenus) {
                            this.appendCites(this.data.timeListing.filter(e => e.rank === "GENUS"), true);
                            this.appendCites(this.data.timeListing, false, true);
                        }
                        else {
                            this.appendCites(this.data.timeListing);
                        }
                    }
                    else {
                        this.appendCitesHeatMap(this.data.timeListing);
                    } */

          this.appendCitesWithoutGenus(this.data.timeListing);
          this.firstSVGAdded = true;
        }

        if (this.data.hasOwnProperty("timeIUCN") && this.data.timeIUCN.length) {
          /* if (this.zoomLevel > 0) {
                        this.appendIUCN(this.data.timeIUCN);
                    }
                    else {
                        this.appendIUCNHeatMap(this.data.timeIUCN);
                    } */
          this.appendIUCNWithoutGenus(this.data.timeIUCN);

          this.firstSVGAdded = true;
        }

        if (
          this.data.hasOwnProperty("timeThreat") &&
          this.data.timeThreat.length
        ) {
          /* if (this.zoomLevel === 0) {
                        switch (this.pieStyle) {
                            case "pie":
                                this.appendThreatHeatMap(this.data.timeThreat, this.data.speciesNamesAndSyns);
                                break;
                            case "bar":
                                this.appendThreatBars(this.data.timeThreat);
                                break;
                            case "ver":
                                this.appendThreatVerticalBars(this.data.timeThreat);
                                break;
                            default:
                                break;
                        }
                    }
                    else {
                        this.appendThreatsWithSubSpecies(this.data.timeThreat);
                    } */
          this.appendThreatsWithoutGenus(this.data.timeThreat);
          this.firstSVGAdded = true;
        }
      }

      if (
        this.timeFrame[1] !== undefined &&
        this.timeFrame[1] !== this.domainYears.maxYear
      ) {
        this.appendGrayBox(this.timeFrame[1]);
      }
    } else if (this.id.includes("scale")) {
      /* let svgScale = this.wrapper
        .append("svg")
        .attr("id", this.id + "Scale")
        .attr("width", this.initWidth)
        .attr("height", "40px")
        .style("display", "block");

      let top = 10;

      this.ticks = this.domainYears.maxYear - this.domainYears.minYear;

      let axis = d3.axisBottom(this.x);

      if (this.speciesName === "scaleTop") {
        top = 25;
        axis = d3.axisTop(this.x);
      }

      let g = svgScale
        .append("g")
        .attr("transform", "translate(" + this.margin.left + "," + top + ")");

      g.append("g")
        .attr("transform", "translate(0," + 0 + ")")
        .call(axis);

      g.append("circle")
        .attr("class", "timeframeHandle")
        .attr("r", "8")
        .attr(
          "cx",
          this.x.bandwidth() / 2 +
            this.x(
              this.timeFrame[1] ? this.timeFrame[1] : this.domainYears.maxYear
            )
        )
        //.attr("cy", "5")
        .style("fill", "var(--highlightpurple)");

      svgScale
        .selectAll(".tick")
        .append("rect")
        .attr("width", this.x.bandwidth())
        .attr("x", -this.x.bandwidth() / 2)
        .attr("height", 25)
        .attr("y", this.speciesName === "scaleTop" ? -25 : 0)
        .style("opacity", "0.0")
        .style("fill", "white")
        .style("stroke", "gray");

      svgScale
        .selectAll(".tick")
        .style("cursor", "pointer")
        .select("text")
        .attr("y", this.speciesName === "scaleTop" ? -15 : 15)
        .classed("axisTicks", true);

      svgScale
        .selectAll(".tick")
        .selectAll("line")
        .attr("y2", this.speciesName === "scaleTop" ? -12 : 12);

      svgScale.selectAll(".tick").on("click", (e) => {
        this.setTimeFrame([this.domainYears.minYear, e]);
      }); */

      // Delete every second tick text
      /*  let contentWidth = this.width;
      while (contentWidth < this.ticks * 25) {
        svgScale
          .selectAll(".axisTicks")
          .select(function (e, i) {
            return i % 2 !== 0 ? this : null;
          })
          .remove();
        this.ticks = this.ticks / 2;
      } */

      /*  svgScale
        .append("foreignObject")
        .attr("width", this.width)
        .attr("height", 50) */
      /* this.wrapper
        .append("div")
        .style("width", this.width + "px")
        .style("height", "50px")
        .style(
          "transform",
          "translate(" + (130 + this.x.bandwidth()) + "px , 0)"
        )
        .append("input")
        .attr("type", "range")
        .attr("min", this.domainYears.minYear)
        .attr("max", this.domainYears.maxYear)
        .attr("step", 1)
        .attr(
          "value",
          this.timeFrame[1] ? this.timeFrame[1] : this.domainYears.maxYear
        )
        .style("width", this.width - 2 * this.x.bandwidth() + "px"); */

      var dataTime = d3.range(
        this.domainYears.minYear,
        this.domainYears.maxYear + 1
      );

      let year2year = d3
        .scaleLinear()
        .domain([this.domainYears.minYear, this.domainYears.maxYear])
        .range([
          0,
          this.x(this.domainYears.maxYear) - this.x(this.domainYears.minYear)
        ]);

      var sliderTime;

      let top = -7;

      this.ticks = this.domainYears.maxYear - this.domainYears.minYear;

      if (this.speciesName === "scaleTop") {
        top = 40;
        sliderTime = sliderTop(year2year)
          .step(1)
          .tickFormat((x) => x.toString())
          .tickValues(dataTime)
          .default(
            this.timeFrame[1] ? this.timeFrame[1] : this.domainYears.maxYear
          )
          .on("onchange", (val) => {
            this.setTimeFrame([this.domainYears.minYear, val]);
          });
      } else {
        sliderTime = sliderBottom(year2year)
          .step(1)
          .tickFormat((x) => x.toString())
          .tickValues(dataTime)
          .default(
            this.timeFrame[1] ? this.timeFrame[1] : this.domainYears.maxYear
          );
      }

      const sliderGroup = this.wrapper
        .append("svg")
        .attr(
          "width",
          this.speciesName === "scaleBottom"
            ? this.initWidth - 10
            : this.initWidth
        )
        .attr("height", 50)
        .append("g")
        .attr(
          "transform",
          "translate(" +
            (this.margin.left +
              this.x(this.domainYears.minYear) +
              this.x.bandwidth() / 2) +
            "," +
            top +
            ")"
        );

      sliderGroup.call(sliderTime);

      if (this.speciesName === "scaleBottom") {
        sliderGroup.select(".slider").remove();
      }

      sliderGroup.select(".slider > .parameter-value > text").remove();

      sliderGroup
        .select(".slider > .parameter-value > path")
        .attr("transform", "rotate(180) translate(-1, 0) scale(1.8)")
        .style("opacity", 0.0);

      sliderGroup
        .select(".slider > .parameter-value > path")
        .clone()
        .attr("transform", "rotate(180) translate(-1, 0) scale(1.1)")
        .style("opacity", 1.0);

      sliderGroup
        .select(".slider > .parameter-value")
        .on("mouseover", () =>
          sliderGroup.select(".handle").style("opacity", 0.05)
        )
        .on("mouseout", () =>
          sliderGroup.select(".handle").style("opacity", 0.0)
        );

      // Delete every second tick text
      let contentWidth = this.width;
      while (contentWidth < this.ticks * 25) {
        sliderGroup
          .selectAll(".tick > text")
          .select(function (e, i) {
            return i % 2 !== 0 ? this : null;
          })
          .remove();
        this.ticks = this.ticks / 2;
      }

      /* sliderGroup
        .select(".slider > .parameter-value")
        .append("foreignObject")
        .attr("width", 20)
        .attr("height", 20)
        .append("xhtml:div")
        .style("width", "20px")
        .style("height", "20px")
        .style("background-color", "lime"); */

      /* let g = svgScale
        .append("g")
        .attr("transform", "translate(" + this.margin.left + "," + top + ")");

      g.append("g")
        .attr("transform", "translate(0," + 0 + ")")
        .call(axis);

      g.append("circle")
        .attr("class", "timeframeHandle")
        .attr("r", "8")
        .attr(
          "cx",
          this.x.bandwidth() / 2 +
            this.x(
              this.timeFrame[1] ? this.timeFrame[1] : this.domainYears.maxYear
            )
        )
        //.attr("cy", "5")
        .style("fill", "var(--highlightpurple)");

      svgScale
        .selectAll(".tick")
        .append("rect")
        .attr("width", this.x.bandwidth())
        .attr("x", -this.x.bandwidth() / 2)
        .attr("height", 25)
        .attr("y", this.speciesName === "scaleTop" ? -25 : 0)
        .style("fill", "white")
        .style("opacity", 0);

      svgScale
        .selectAll(".tick")
        .style("cursor", "pointer")
        .select("text")
        .attr("y", this.speciesName === "scaleTop" ? -15 : 15)
        .classed("axisTicks", true);

      svgScale
        .selectAll(".tick")
        .selectAll("line")
        .attr("y2", this.speciesName === "scaleTop" ? -12 : 12);

      svgScale.selectAll(".tick").on("click", (e) => {
        this.setTimeFrame([this.domainYears.minYear, e]);
      });
     

      // Delete every second tick text
      let contentWidth = this.width;
      while (contentWidth < this.ticks * 25) {
        this.wrapper
          .selectAll(".tick > text")
          .select(function (e, i) {
            return i % 2 !== 0 ? this : null;
          })
          .remove();
        this.ticks = this.ticks / 2;
      } */
    }
  }
}

const TimelineHelper = {
  draw: (input) => {
    new D3Timeline(input);
  },
  reset: (id) => {
    d3.selectAll("#" + id + " > *").remove();
  }
};

export default TimelineHelper;
