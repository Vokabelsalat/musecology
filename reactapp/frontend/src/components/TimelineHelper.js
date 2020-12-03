import * as d3 from "d3";
import { getOrCreate, dangerColorMap, sourceToDangerMap, iucnToDangerMap, pushOrCreate, dangerSorted, scaleValue } from '../utils/utils'
import { getIucnColor, getIucnColorForeground, iucnCategoriesSorted, citesAppendixSorted, citesScore, citesScoreReverse, iucnScore, iucnScoreReverse, iucnCategories, threatScore, threatScoreReverse, getCitesColor } from '../utils/timelineUtils'
import { stackOffsetNone } from "d3";

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

        this.pieStyle = param.pieStyle;
        this.groupSame = param.groupSame;
        this.sortGrouped = param.sortGrouped;

        this.heatStyle = param.heatStyle;

        this.initWidth = 900;
        this.initHeight = 100;

        this.citesSignThreat = "DD";
        this.iucnSignThreat = "DD";

        this.firstSVGAdded = false;

        this.rowHeight = 0;

        this.rightGroupWidth = 50;

        this.setSpeciesSignThreats = param.setSpeciesSignThreats;
        this.getSpeciesSignThreats = param.getSpeciesSignThreats;

        this.margin = {
            top: 10,
            right: 0,
            bottom: 20,
            left: 130,
        };

        this.paint();
    }

    getRowHeight(genusLine) {
        if (genusLine) {
            return this.rowHeight * 2 - 1;
        }
        else {
            return this.rowHeight
        }
    }

    calcYPos(rowNum, trendRows, genusLine = false, beginningHalfStep = false) {
        let addY = 0;
        if (this.groupSame && this.sortGrouped === "trend") {
            if (genusLine) {
                addY = 0;
            }
            else {
                addY = beginningHalfStep ? this.getRowHeight(genusLine) / 2 + trendRows[rowNum] * (this.getRowHeight(genusLine) / 2) : trendRows[rowNum] * (this.getRowHeight(genusLine) / 2);
            }
        }
        else {
            addY = 0;
        }
        return this.getRowHeight(genusLine) * rowNum + addY;
    }

    appendTrends(destination, trendData, trendRows, genusLine = false, beginningHalfStep = false) {
        if (this.groupSame && this.sortGrouped === "trend") {
            let trends = destination.selectAll("g myCircleText").data(trendData)
                .enter()
                .append("g")
                .attr("transform", (d) => {
                    let rowNum = d.rowNum;

                    let yPos = this.calcYPos(rowNum, trendRows, genusLine, beginningHalfStep);
                    return "translate(" + 3 + ", " + yPos + ")";
                });


            trends.append("rect")
                .attr("width", (d) => {
                    return 15 + "px";
                })
                .attr("height", (d) => {
                    return this.getRowHeight(genusLine) * (d.length);
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


            trends.append("text")
                .attr("x", 15 / 2 - 5)
                .attr("y", d => {
                    return (this.getRowHeight(genusLine) * (d.length)) / 2;
                })
                .attr("dy", ".25em")
                .style("font-size", d => {
                    if (d.type === "up" || d.type === "down") {
                        return "14px";
                    }
                    else {
                        return "11px"
                    }
                })
                .html(d => {
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

    yearCount(y, obj) {
        let count = getOrCreate(obj, y.toString(), -1);
        obj[y.toString()] = ++count;
        return count;
    }

    clearAndReset() {
        d3.selectAll("#" + this.id + " > *").remove();

        let content = d3.select("#" + this.id);

        let speciesNameDiv = content
            .append("div")
            .attr("class", "speciesNameDiv")
            .style("width", this.margin.left + "px")
            /* .style("border-top", "1px solid var(--black)") */
            .style("vertical-align", "middle")
        /* .style("display", "table-cell"); */

        this.wrapper = content
            .append("div")
            .attr("id", this.id + "wrapper");

        switch (this.zoomLevel) {
            //case 0:
            default:
                this.wrapper
                    .style("display", "table-cell")
                    .style("border-top", "1px solid var(--black)")

                break;
            /*  default:
                 this.wrapper.style("display", "block");
                 speciesNameDiv
                     .style("display", "block");
                 break; */
        }

        if (this.id.toLowerCase().includes("scale")) {
            if (this.speciesName === "scaleTop") {
                speciesNameDiv.style("border-top", "none");
                this.wrapper.style("border-bottom", "1px solid black").style("border-top", "none");
            }
        }
        else {
            let speciesNameSVG = speciesNameDiv
                .append("svg")
                .attr("width", 20)
                .attr("height", 20);

            let citesThreat = "DD";
            let iucnThreat = "DD";
            let iucnColor = getIucnColor("DD");
            if (typeof this.getSpeciesSignThreats == 'function') {

                citesThreat = this.getSpeciesSignThreats(this.speciesName)["cites"];
                iucnThreat = this.getSpeciesSignThreats(this.speciesName)["iucn"];
                let threatThreat = this.getSpeciesSignThreats(this.speciesName)["threat"];


                let iucnScoreVal = iucnScore(iucnThreat);
                let threatScoreVal = threatScore(threatThreat);

                if (iucnScoreVal > threatScoreVal) {
                    iucnColor = getIucnColor(iucnThreat);
                    iucnThreat = iucnThreat;
                }
                else if (threatScoreVal > iucnScoreVal) {
                    iucnColor = dangerColorMap[threatThreat]["bg"];
                    iucnThreat = threatThreat;
                }
                else {
                    iucnColor = getIucnColor(iucnThreat);
                    iucnThreat = iucnThreat;
                }

                /* iucnThreat = iucnScoreReverse(Math.max(iucnScore(iucnThreat), threatScore(threatThreat))); */
            }

            this.citesSign = speciesNameSVG.append("path")
                .attr("transform", "translate(10,10)")
                .attr("d", d3.arc()
                    .innerRadius(0)
                    .outerRadius(5)
                    .startAngle(3.14)     // It's in radian, so Pi = 3.14 = bottom.
                    .endAngle(6.28)       // 2*Pi = 6.28 = top
                )
                .attr('fill', getCitesColor(citesThreat));

            this.iucnSign = speciesNameSVG.append("path")
                .attr("transform", "translate(10,10)")
                .attr("d", d3.arc()
                    .innerRadius(0)
                    .outerRadius(5)
                    .startAngle(-3.14)     // It's in radian, so Pi = 3.14 = bottom.
                    .endAngle(-6.28)       // 2*Pi = 6.28 = top
                )
                .attr('fill', iucnColor);

            speciesNameDiv.append("text")
                .text(this.speciesName)
                .style("cursor", "pointer")
                .style("font-style", this.justGenus ? "" : "italic")
                .style("font-size", 10 + "px")
                /* .style("font-weight", this.justGenus ? "bold" : "") */
                .on("click", () => {
                    if (this.zoomLevel === 0) {
                        this.setZoomLevel(2);
                    }
                    else {
                        this.setZoomLevel(0);
                    }
                })
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

        let g = svgCITESTrade.append("g").attr("transform", "translate(" + this.margin.left + "," + 0 + ")");

        let sortedSources = Object.keys(groupedBySource).sort(
            (a, b) => groupedBySource[b].length - groupedBySource[a].length
        );

        let yearPlus = {};

        for (let source of sortedSources.values()) {

            let lineColor = dangerColorMap[sourceToDangerMap[source]] ? dangerColorMap[sourceToDangerMap[source]].bg : dangerColorMap["DD"].bg;

            let filteredData = {};

            for (let yearData of tradeData.values()) {
                getOrCreate(filteredData, yearData.year.toString(), {
                    trades: yearData.trades.filter((e) => e.Source === source),
                    year: yearData.year,
                    source: source,
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
                        .x((d) => { return this.x(d.year) + this.x.bandwidth() / 2; })
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

    appendCitesTrade(tradeData, groupedBySource) {

        let svgCITESTrade = this.wrapper
            .append("svg")
            .attr("id", this.id + "Trade")
            .attr("width", this.initWidth)
            .attr("height", this.height)
            .style("display", "block");

        svgCITESTrade.style("display", "block");

        let g = svgCITESTrade.append("g").attr("transform", "translate(" + this.margin.left + "," + 0 + ")");

        g.append("path")
            .datum(Object.values(tradeData))
            .attr("fill", "none")
            .attr("stroke", "steelblue")
            .attr("stroke-width", 1.5)
            .attr("d", d3.line()
                .x(function (d) {
                    return this.x(d.year) + this.x.bandwidth() / 2
                }.bind(this))
                .y(function (d) { return this.y(d.count) }.bind(this))
            );
    }

    appendCitesHeatMap(listingData) {
        let listingHeatMap = {};

        let speciesMap = {};

        let yearCount = {};
        for (let entry of listingData) {
            let year = entry.year.toString();
            let name = `${entry.genus} ${entry.species}`.trim();

            pushOrCreate(speciesMap, name, entry);
            pushOrCreate(yearCount, year, 1);
            pushOrCreate(getOrCreate(listingHeatMap, year, {}), entry.appendix, entry);
        }

        let years = Object.keys(yearCount).map(e => parseInt(e));
        let maxYear = Math.max(...years);
        let minYear = Math.min(...years);

        let newListingHeatMap = {};

        for (let species of Object.keys(speciesMap)) {
            let yearData = {};
            let lastState = null;
            for (let entry of speciesMap[species]) {
                pushOrCreate(yearData, entry.year, entry);
            }

            for (let year = minYear; year <= maxYear; year++) {
                if (yearData.hasOwnProperty(year.toString())) {
                    //get the highest assesments if there are multiple in the same year for the same species
                    let highest = yearData[year.toString()].reduce((a, b) => citesAppendixSorted[a.appendix] < citesAppendixSorted[b.appendix] ? a.appendix : b.appendix, []);

                    pushOrCreate(getOrCreate(newListingHeatMap, year, {}), highest, 1);
                    lastState = yearData[year.toString()][0].appendix;
                }
                else if (lastState) {
                    pushOrCreate(getOrCreate(newListingHeatMap, year, {}), lastState, 1);
                }
            }
        }

        let heatMapData = [];
        let maxKeyPrevious = null;
        let maxValuePrevious = null;

        let maxSpecies = Math.max(...Object.values(yearCount).map(e => e.length));

        let lastResult = 0;

        for (let year of Object.keys(newListingHeatMap).sort((a, b) => parseInt(a) - parseInt(b))) {
            let yearData = newListingHeatMap[year.toString()];
            let push = true;
            let countSum;

            let tmp = {};
            let maxKey, maxValue, opacity;

            switch (this.heatStyle) {
                case "dom":
                    maxKey = Object.keys(yearData).reduce((a, b) => yearData[a].length > yearData[b].length ? a : b);
                    countSum = Object.keys(yearData).reduce((accumulator, currentValue) => {
                        return accumulator + yearData[currentValue].length;
                    }, 0);
                    maxValue = yearData[maxKey];

                    if (maxKeyPrevious !== null) {
                        if (maxValue.length <= maxValuePrevious.length) {
                            maxKey = maxKeyPrevious;
                            maxValue = maxValuePrevious;
                            push = false;
                        }
                    }

                    maxKeyPrevious = maxKey;
                    maxValuePrevious = maxValue;

                    opacity = maxValue.length / maxSpecies;
                    break;
                case "avg":

                    let scoreSum = Object.keys(yearData).reduce(((a, b) => a + yearData[b].length * citesScore(b)), 0);
                    countSum = Object.values(yearData).reduce((accumulator, currentValue) => {
                        return accumulator + currentValue.length;
                    }, 0);

                    let avg = scoreSum / countSum;

                    if (maxValuePrevious !== null) {
                        if (maxValuePrevious === avg) {
                            avg = maxValuePrevious;
                            push = false;
                        }
                    }

                    let reverseScore = citesScoreReverse(avg);

                    maxValuePrevious = avg;

                    maxKey = reverseScore;

                    opacity = countSum / maxSpecies;
                    break;
                case "max":

                    maxKey = Object.keys(yearData).reduce((a, b) => citesScore(a) > citesScore(b) ? a : b);
                    countSum = Object.keys(yearData).reduce((accumulator, currentValue) => {
                        return accumulator + yearData[currentValue].length;
                    }, 0);
                    maxValue = yearData[maxKey];

                    if (maxKeyPrevious !== null) {
                        if (maxValue.length === maxValuePrevious.length && maxKey === maxKeyPrevious) {
                            maxKey = maxKeyPrevious;
                            maxValue = maxValuePrevious;
                            push = false;
                        }
                    }

                    maxKeyPrevious = maxKey;
                    maxValuePrevious = maxValue;

                    opacity = yearData[maxKey].length / maxSpecies;
                default:
                    break;
            }

            if (push) {

                tmp = {
                    appendix: maxKey,
                    year: year,
                    sciName: this.speciesName + " (" + countSum + ")",
                    rank: "ALL",
                    text: maxKey,
                    type: "listingHistory",
                    opacity: opacity
                };

                heatMapData.push(tmp);
            }
        }

        lastResult = heatMapData.sort((a, b) => parseInt(a.year) - parseInt(b.year));
        lastResult = lastResult[lastResult.length - 1].appendix;

        this.citesSignThreat = lastResult;

        this.setSpeciesSignThreats(this.speciesName, "cites", this.citesSignThreat);

        listingData = heatMapData;

        let circleYearCountIUCN = {};

        let rowHeight = 2 * this.radius + 1;

        let svgCITES = this.wrapper
            .append("svg")
            .attr("id", this.id + "Cites")
            .attr("width", this.initWidth)
            .attr("height", rowHeight)
            .style("display", "block");


        let maxCount = 0;

        svgCITES.style("display", "block");

        let g = svgCITES.append("g").attr("transform", "translate(" + this.margin.left + "," + 0 + ")");


        let rect = g
            .append("rect")
            .attr("width", this.width)
            .attr("height", (maxCount + 1) * rowHeight)
            .attr("fill", "none")
            .attr("stroke", "gray");
        //.style("fill", "url(#mainGradient)")
        /*.style("stroke", "black")*/
        //.style("fill", "url(#myGradient)");

        let elem = g.selectAll("g myCircleText").data(listingData);

        let elemEnter = elem
            .enter()
            .append("g")
            .attr("class", "noselect")
            .attr("transform", function (d) {
                let count = this.yearCount(d.year, circleYearCountIUCN);
                maxCount = Math.max(maxCount, count);
                rect.attr("height", (maxCount + 1) * rowHeight);
                svgCITES.attr("height", (maxCount + 1) * rowHeight);
                return "translate(" + (this.x(Number(d.year)) + this.x.bandwidth() / 2) + "," + (rowHeight * count) + ")";
            }.bind(this))
            .attr("x", function (d) {
                return this.x(Number(d.year) + this.x.bandwidth() / 2);
            }.bind(this))
            .on("mouseover", this.mouseover)
            .on("mousemove", this.mousemove)
            .on("mouseleave", this.mouseleave);

        g
            .append("text")
            .attr("transform", "translate(-5," + ((maxCount + 1) * rowHeight) / 2 + ")")
            .style("text-anchor", "end")
            .style("dominant-baseline", "central")
            .style("font-size", "9")
            .text(this.justGenus && this.zoomLevel > 0 ? this.speciesName : "CITES");

        //let radius = (height - y(1)) / 2;

        elemEnter
            .append("rect")
            .attr("class", "pinarea")
            .attr("height", rowHeight - 2)
            .attr("y", 1)
            /* .attr("width", function (d) {
              return width - x(Number(d.year));
            }) */
            .attr("width", function (d) {
                return this.width - this.x(Number(d.year));
            }.bind(this))
            .style("fill", "white");

        elemEnter
            .append("rect")
            .attr("class", "pinarea")
            .attr("height", rowHeight - 2)
            .attr("y", 1)
            /* .attr("width", function (d) {
              return width - x(Number(d.year));
            }) */
            .attr("width", function (d) {
                return this.width - this.x(Number(d.year));
            }.bind(this))
            /*.attr("r", radius)*/
            /*.attr("cx", function(d) {
                                return x.bandwidth() / 2;
                            })
                            .attr("cy", function(d) {
                                return radius;
                            })*/
            .style("stroke-width", 1)
            .style("stroke", function (d) {
                switch (d.type) {
                    case "listingHistory":
                        return getCitesColor(d.appendix);
                    default:
                        break;
                }
            })
            .style("fill-opacity", (d) => d.opacity)
            .style("fill", function (d) {
                switch (d.type) {
                    case "listingHistory":
                        return getCitesColor(d.appendix);
                    default:
                        break;
                }
            });
    }

    appendCites(listingData, genusLine = false, withGenusLineOnTop = false) {

        let speciesListing = {};

        let listingKeys = [];
        let newListingData = [];

        let characteristicsMap = {};
        let trendMap = {};

        let maxHeightScale = 5;

        let genusListing = null;
        for (let listing of listingData.sort((a, b) => parseInt(a.year) - parseInt(b.year))) {
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
            }
            else {
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
        }

        let newTrendMap = {};
        let sumMap = {};
        let characteristicsTrend = {};
        for (let key of Object.keys(characteristicsMap)) {
            let prevYear = 0;
            newTrendMap[key] = [];
            sumMap[key] = [];
            characteristicsMap[key] = Object.keys(characteristicsMap[key])
                .sort((a, b) => parseInt(b) - parseInt(a)).reverse()
                .map((year, index) => {

                    let curr = citesScore(trendMap[key][year]);
                    if (curr < 0) {
                        curr = 0.5;
                    }

                    sumMap[key].push(curr);
                    if (index > 0) {
                        let prev = citesScore(trendMap[key][prevYear]);
                        if (prev < 0) {
                            prev = 0.5;
                        }

                        let trend;
                        if (curr > prev) {
                            trend = 1;
                        }
                        else if (curr < prev) {
                            trend = -1;
                        }
                        else {
                            trend = 0;
                        }

                        newTrendMap[key].push(trend);
                    }
                    else {
                        newTrendMap[key].push(0);
                    }

                    prevYear = year;

                    characteristicsTrend[key] = newTrendMap[key];

                    return characteristicsMap[key][year];
                })
                .join("");
        }


        let charCounting = Object.values(characteristicsMap).reduce(function (countMap, word) { countMap[word] = ++countMap[word] || 1; return countMap }, {});

        if (genusListing) {
            let genusChar = characteristicsMap[genusListing];
            charCounting[genusChar] -= 1;
        }

        let uniqueCharacteristics = Object.keys(charCounting);

        let characteristicsToTrend = {};

        let newSumMap = {};
        Object.keys(characteristicsMap).forEach(species => {
            characteristicsToTrend[characteristicsMap[species]] = characteristicsTrend[species];
            newSumMap[characteristicsMap[species]] = sumMap[species].reduce((acc, cur) => acc + cur) / sumMap[species].length;
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
            }
            else {
                let len = characteristicsToTrend[char].length > 1 ? characteristicsToTrend[char].length - 1 : 1;
                let scale = indexA / len;
                characteristicsToTrendResult[char] = scale * characteristicsToTrend[char][indexA];
            }
        }

        uniqueCharacteristics.sort((a, b) => {
            if (this.sortGrouped === "trend") {

                let valA = characteristicsToTrendResult[a];
                let valB = characteristicsToTrendResult[b];

                if (valA > valB) {
                    return 1;
                }
                else if (valA < valB) {
                    return -1;
                }
            }

            if (this.sortGrouped === "avg") {
                let sumA = newSumMap[a];
                let sumB = newSumMap[b];

                if (sumB !== sumA) {
                    return sumA - sumB;
                }
                else {
                    return b.localeCompare(a);
                }
            }

            let countA = charCounting[a];
            let countB = charCounting[b];

            if (countB !== countA) {
                return countB - countA;
            }
            else {
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

                if (!charsAlready.includes(char) || filteredSpecies.includes(entry.sciName)) {
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

            this.heightScaleSum = Object.values(heightMap).reduce(function (prev, curr) { return prev + curr; }, 0);
        }

        let speciesNamesSorted = Object.keys(speciesListing)
            .filter(key => key !== genusListing || genusLine)
            .sort((a, b) => {
                return Math.min(...speciesListing[b].map(e => parseInt(e.year))) - Math.min(...speciesListing[a].map(e => parseInt(e.year)))
            });

        let classString = "timelineSVG";
        if (genusLine) {
            classString += " genusLine";
        }
        else {
            classString += this.firstSVGAdded ? "" : " topper";
        }

        let justUp = Object.keys(characteristicsToTrendResult).filter(e => characteristicsToTrendResult[e] > 0);
        let firstUpTrend = Math.min(...justUp.map(e => uniqueCharacteristics.indexOf(e)));

        let justDown = Object.keys(characteristicsToTrendResult).filter(e => characteristicsToTrendResult[e] < 0);
        let firstDownTrend = Math.min(...justDown.map(e => uniqueCharacteristics.indexOf(e)));

        if (!isFinite(firstDownTrend)) {
            firstDownTrend = 0;
        }

        if (!isFinite(firstUpTrend)) {
            firstUpTrend = uniqueCharacteristics.length;
        }

        let trendObject = {};

        let trendData = [];

        if (uniqueCharacteristics.length - justDown.length - justUp.length > 0) {
            trendData.push(
                { rowNum: firstDownTrend + justDown.length, type: "", length: uniqueCharacteristics.length - justDown.length - justUp.length }
            );
            trendObject[firstDownTrend + justDown.length] = { type: "", length: uniqueCharacteristics.length - justDown.length - justUp.length };
        }

        if (justDown.length > 0) {
            trendData.push({ rowNum: firstDownTrend, type: "down", length: justDown.length });
            trendObject[firstDownTrend] = { type: "down", length: justDown.length };
        }

        if (justUp.length > 0) {
            trendData.push({ rowNum: firstUpTrend, type: "up", length: justUp.length });
            trendObject[firstUpTrend] = { type: "up", length: justUp.length };
        }

        let rowCount = this.groupSame ? uniqueCharacteristics.length : speciesCount;

        let sortedTrendKeys = Object.keys(trendObject).sort((a, b) => parseInt(a) - parseInt(b));

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
            }
            else {
                if (this.sortGrouped === "trend") {

                    let add = withGenusLineOnTop ? 0.5 * trendData.length : 0;
                    svgHeight = (rowCount + add) * this.rowHeight;
                }
                else {
                    svgHeight = rowCount * this.rowHeight;
                }
            }
        }
        else {
            svgHeight = rowCount * this.getRowHeight(genusLine);
        }

        let svgCITES = this.wrapper
            .append("svg")
            .attr("class", classString)
            .attr("id", this.id + "Cites" + genusLine)
            .attr("width", this.initWidth + this.rightGroupWidth)
            .attr("height", svgHeight)
            .style("display", "block");

        svgCITES.style("display", "block");

        let defs = svgCITES.append("defs");

        let g = svgCITES.append("g")
            .attr("transform", "translate(" + this.margin.left + "," + 0 + ")")
            .attr("height", svgHeight);

        let trendGroup = svgCITES.append("g")
            .attr("transform", "translate(" + this.initWidth + ",0)")
            .attr("height", svgHeight);

        trendGroup
            .append("rect")
            .attr("width", this.rightGroupWidth)
            .attr("height", svgHeight)
            .style("fill", "white");

        if (!genusLine) {
            g
                .append("text")
                .attr("transform", "translate(-" + this.margin.left + "," + (svgHeight / 2) + ")")
                .style("dominant-baseline", "central")
                .style("font-size", "9")
                .text("CITES");
        }

        let rect = g
            .append("rect")
            .attr("width", this.width)
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
        }
        else {
            keyData = Object.values(speciesListing).map(e => e[0]);
        }

        if (this.groupSame && keyData.length > 1) {
            g.selectAll("g myCircleText").data(keyData)
                .enter()
                .append("rect")
                .attr("width", (d) => {
                    if (genusLine) {
                        return 0;
                    }
                    else {
                        return scaleValue(charCounting[characteristicsMap[d.sciName]], [0, speciesCount], [1, 100]);
                    }
                })
                .attr("height", (d) => {
                    return this.getRowHeight(genusLine);
                })
                .style("fill", "var(--main)")
                .attr("transform", (d) => {
                    let rowNum = 0;
                    if (this.groupSame) {
                        rowNum = uniqueCharacteristics.indexOf(characteristicsMap[d.sciName]);
                    }
                    else {
                        rowNum = speciesNamesSorted.indexOf(d.sciName);
                    }

                    let yPos = this.calcYPos(rowNum, trendRows, genusLine, withGenusLineOnTop);
                    return "translate(" + (- scaleValue(charCounting[characteristicsMap[d.sciName]], [0, speciesCount], [1, 100])) + ", " + yPos + ")";
                });
        }

        if (keyData.length > 1 || genusLine) {
            g.selectAll("g myCircleText").data(keyData)
                .enter()
                .append("text")
                .style("text-anchor", "end")
                .style("dominant-baseline", "central")
                .style("font-size", "9")
                .style("font-style", (d) => { return genusLine ? "" : "italic"; })
                .attr("transform", (d) => {
                    let rowNum = 0;
                    if (this.groupSame) {
                        rowNum = uniqueCharacteristics.indexOf(characteristicsMap[d.sciName]);
                    }
                    else {
                        rowNum = speciesNamesSorted.indexOf(d.sciName);
                    }

                    let yPos = this.calcYPos(rowNum, trendRows, genusLine, withGenusLineOnTop) + this.getRowHeight(genusLine) / 2;

                    if (genusLine) {
                        return "translate(" + (-3) + ", " + yPos + ")";
                    }
                    else if (this.groupSame) {
                        return "translate(" + (-3 - scaleValue(charCounting[characteristicsMap[d.sciName]], [0, speciesCount], [0, 100])) + ", " + yPos + ")";
                    }
                    else {
                        return "translate(" + (-3) + ", " + yPos + ")";
                    }
                })
                .text((d) => {
                    if (genusLine) {
                        return d.genus;
                    }
                    else {
                        if (this.groupSame) {
                            let counting = charCounting[characteristicsMap[d.sciName]];

                            if (counting === 1) {
                                return d.species;
                            }
                            else {
                                return counting;
                            }
                        }
                        else {
                            return d.species;
                        }
                    }
                });
        }

        this.appendTrends(trendGroup, trendData, trendRows, genusLine, withGenusLineOnTop);

        appendCitesRects.bind(this)(newListingData);

        function appendCitesRects(lData) {
            let elem = g.selectAll("g myCircleText").data(lData);

            let elemEnter = elem
                .enter()
                .append("g")
                .attr("class", "noselect")
                .attr("transform", function (d) {
                    let rowNum = 0;
                    if (this.groupSame) {
                        rowNum = uniqueCharacteristics.indexOf(characteristicsMap[d.sciName]);
                    }
                    else {
                        rowNum = speciesNamesSorted.indexOf(d.sciName);
                    }

                    let yPos = this.calcYPos(rowNum, trendRows, genusLine, withGenusLineOnTop);
                    return "translate(" + (this.x(Number(d.year)) + this.x.bandwidth() / 2) + "," + yPos + ")";
                }.bind(this))
                .attr("x", function (d) {
                    return this.x(Number(d.year) + this.x.bandwidth() / 2);
                }.bind(this))
                .on("mouseover", this.mouseover)
                .on("mousemove", this.mousemove)
                .on("mouseleave", this.mouseleave);

            elemEnter
                .append("rect")
                .attr("class", "pinarea")
                .attr("height", (d) => {
                    if (d.rank === "GENUS") {
                        return (speciesCount + 1) * this.getRowHeight(genusLine);
                    }
                    else {
                        return this.getRowHeight(genusLine);
                    }
                })
                .attr("width", function (d) {
                    return this.width - this.x(Number(d.year));
                }.bind(this))
                .style("fill", "white");

            elemEnter
                .append("rect")
                .attr("class", "pinarea")
                .attr("height", (d) => {
                    if (d.rank === "GENUS") {
                        return (speciesCount + 1) * this.getRowHeight(genusLine);
                    }
                    else {
                        return this.getRowHeight(genusLine);
                    }
                })
                .attr("width", function (d) {
                    return this.width - this.x(Number(d.year));
                }.bind(this))
                .style("fill", function (d) {
                    switch (d.type) {
                        case "listingHistory":
                            if (d.hasOwnProperty("countries")) {
                                let id = "diagonalHatch" + d.appendix + "6";

                                if (defs.select("#" + id).empty()) {
                                    defs
                                        .append('pattern')
                                        .attr('id', id)
                                        .attr('patternUnits', 'userSpaceOnUse')
                                        .attr('width', 6)
                                        .attr('height', 6)
                                        .attr("patternTransform", "rotate(45)")
                                        .append('line')
                                        .attr("x1", 0)
                                        .attr("y", 0)
                                        .attr("x2", 0)
                                        .attr("y2", 6)
                                        .attr("stroke", () => {
                                            return getCitesColor(d.appendix);
                                        })
                                        .attr('stroke-width', 6);
                                }

                                return "url(#" + id + ")";
                            }
                            else {
                                return getCitesColor(d.appendix);
                            }
                        default:
                            break;
                    }
                })
                .style("stroke", function (d) {
                    switch (d.type) {
                        case "listingHistory":
                            return "gray";
                        default:
                            break;
                    }
                }).style("stroke-width", function (d) {
                    switch (d.type) {
                        case "listingHistory":
                            return 1;
                        default:
                            break;
                    }
                });
        }
    }

    appendIUCNHeatMap(iucnData) {
        let iucnHeatMap = {};
        let speciesMap = {};

        let yearCount = {};
        for (let entry of iucnData) {
            let year = entry.year.toString();
            let name = entry.sciName;

            pushOrCreate(speciesMap, name, entry);
            pushOrCreate(getOrCreate(iucnHeatMap, year, {}), entry.code, entry);
            pushOrCreate(yearCount, year, 1);
        }

        let years = Object.keys(yearCount).map(e => parseInt(e));
        let maxYear = Math.max(...years);
        let minYear = Math.min(...years);

        let newIUCNHeatMap = {};

        for (let species of Object.keys(speciesMap)) {
            let yearData = {};
            let lastState = null;
            for (let entry of speciesMap[species]) {
                pushOrCreate(yearData, entry.year, entry);
            }

            for (let year = minYear; year <= maxYear; year++) {
                if (yearData.hasOwnProperty(year.toString())) {
                    let highestScore = Math.max(...yearData[year.toString()].map(e => iucnScore(e.code)));
                    let highest = iucnScoreReverse(highestScore);

                    //let highest = yearData[year.toString()].reduce((a, b) => iucnScore(a) > iucnScore(b.code) ? a : b.code, []);

                    pushOrCreate(getOrCreate(newIUCNHeatMap, year, {}), highest, 1);
                    lastState = yearData[year.toString()][0].code;
                }
                else if (lastState) {
                    pushOrCreate(getOrCreate(newIUCNHeatMap, year, {}), lastState, 1);
                }
            }
        }

        let heatMapData = [];
        let maxKeyPrevious = null;
        let maxValuePrevious = null;

        let maxSpecies = Math.max(...Object.values(yearCount).map(e => e.length));

        for (let year of Object.keys(newIUCNHeatMap).sort((a, b) => parseInt(a) - parseInt(b))) {
            let yearData = newIUCNHeatMap[year.toString()];
            let push = true;
            let countSum;

            let tmp, maxKey, maxValue;
            let opacity;

            switch (this.heatStyle) {
                case "dom":
                    maxKey = Object.keys(yearData).reduce((a, b) => yearData[a].length > yearData[b].length ? a : b);
                    countSum = Object.keys(yearData).reduce((accumulator, currentValue) => {
                        return accumulator + yearData[currentValue].length;
                    }, 0);
                    maxValue = yearData[maxKey];

                    if (maxKeyPrevious !== null) {
                        if (maxKey === maxKeyPrevious && maxValue.length <= maxValuePrevious.length) {
                            maxKey = maxKeyPrevious;
                            maxValue = maxValuePrevious;
                            push = false;
                        }
                    }

                    maxKeyPrevious = maxKey;
                    maxValuePrevious = maxValue;

                    opacity = maxValue.length / maxSpecies;
                    break;
                case "avg":

                    let scoreSum = Object.keys(yearData).reduce(((a, b) => a + yearData[b].length * iucnScore(b)), 0);
                    countSum = Object.values(yearData).reduce((accumulator, currentValue) => {
                        return accumulator + currentValue.length;
                    }, 0);

                    let avg = scoreSum / countSum;

                    if (maxValuePrevious !== null) {
                        if (maxValuePrevious === avg) {
                            avg = maxValuePrevious;
                            push = false;
                        }
                    }

                    maxKey = iucnScoreReverse(avg);

                    maxValuePrevious = avg;

                    opacity = countSum / maxSpecies;
                    break;
                case "max":

                    maxKey = Object.keys(yearData).reduce((a, b) => iucnScore(a) > iucnScore(b) ? a : b);
                    countSum = Object.keys(yearData).reduce((accumulator, currentValue) => {
                        return accumulator + yearData[currentValue].length;
                    }, 0);
                    maxValue = yearData[maxKey];

                    if (maxKeyPrevious !== null) {
                        if (maxValue.length === maxValuePrevious.length && maxKey === maxKeyPrevious) {
                            maxKey = maxKeyPrevious;
                            maxValue = maxValuePrevious;
                            push = false;
                        }
                    }

                    maxKeyPrevious = maxKey;
                    maxValuePrevious = maxValue;

                    opacity = yearData[maxKey].length / maxSpecies;
                default:
                    break;
            }

            if (push) {
                tmp = {
                    category: iucnCategories[maxKey],
                    code: maxKey,
                    year: year,
                    sciName: this.speciesName + " (" + countSum + ")",
                    rank: "ALL",
                    text: maxKey,
                    type: "iucn",
                    opacity: opacity
                };
                heatMapData.push(tmp);
            }
        }

        let lastResult = heatMapData.sort((a, b) => parseInt(a.year) - parseInt(b.year));
        lastResult = lastResult[lastResult.length - 1].code;

        this.setSpeciesSignThreats(this.speciesName, "iucn", lastResult);

        let listingData = heatMapData;

        let circleYearCountIUCN = {};

        let rowHeight = 2 * this.radius + 1;

        let svgCITES = this.wrapper
            .append("svg")
            .attr("id", this.id + "IUCN")
            .attr("width", this.initWidth)
            .attr("height", rowHeight)
            .style("display", "block");

        let maxCount = 0;

        svgCITES.style("display", "block");

        let g = svgCITES.append("g").attr("transform", "translate(" + this.margin.left + "," + 0 + ")");


        let rect = g
            .append("rect")
            .attr("width", this.width)
            .attr("height", (maxCount + 1) * rowHeight)
            .attr("fill", "none")
            .attr("stroke", "gray");
        //.style("fill", "url(#mainGradient)")
        /*.style("stroke", "black")*/
        //.style("fill", "url(#myGradient)");

        let elem = g.selectAll("g myCircleText").data(listingData);


        let elemEnter = elem
            .enter()
            .append("g")
            .attr("class", "noselect")
            .attr("transform", function (d) {
                let count = this.yearCount(d.year, circleYearCountIUCN);
                maxCount = Math.max(maxCount, count);
                rect.attr("height", (maxCount + 1) * rowHeight);
                svgCITES.attr("height", (maxCount + 1) * rowHeight);
                return "translate(" + (this.x(Number(d.year)) + this.x.bandwidth() / 2) + "," + (rowHeight * count) + ")";
            }.bind(this))
            .attr("x", function (d) {
                return this.x(Number(d.year) + this.x.bandwidth() / 2);
            }.bind(this))
            .on("mouseover", this.mouseover)
            .on("mousemove", this.mousemove)
            .on("mouseleave", this.mouseleave);

        g
            .append("text")
            .attr("transform", "translate(-5," + ((maxCount + 1) * rowHeight) / 2 + ")")
            .style("text-anchor", "end")
            .style("dominant-baseline", "central")
            .style("font-size", "9")
            .text("IUCN");

        //let radius = (height - y(1)) / 2;
        elemEnter
            .append("rect")
            .attr("class", "pinarea")
            .attr("height", rowHeight - 2)
            .attr("y", 1)
            /* .attr("width", function (d) {
              return width - x(Number(d.year));
            }) */
            .attr("width", function (d) {
                return this.width - this.x(Number(d.year));
            }.bind(this))
            .style("fill", "white");
        /*.attr("r", radius)*/
        /*.attr("cx", function(d) {
                            return x.bandwidth() / 2;
                        })
                        .attr("cy", function(d) {
                            return radius;
                        })*/


        elemEnter
            .append("rect")
            .attr("class", "pinarea")
            .attr("height", rowHeight - 2)
            .attr("y", 1)
            /* .attr("width", function (d) {
              return width - x(Number(d.year));
            }) */
            .attr("width", function (d) {
                return this.width - this.x(Number(d.year));
            }.bind(this))
            /*.attr("r", radius)*/
            /*.attr("cx", function(d) {
                                return x.bandwidth() / 2;
                            })
                            .attr("cy", function(d) {
                                return radius;
                            })*/
            .style("stroke-width", 1)
            .style("stroke", function (d) {
                switch (d.type) {
                    case "iucn":
                        return getIucnColor(d);
                    default:
                        break;
                }
            })
            .style("fill-opacity", (d) => d.opacity)
            .style("fill", function (d) {
                switch (d.type) {
                    case "iucn":
                        return getIucnColor(d);
                    default:
                        break;
                }
            });

        if (this.zoomLevel > 0) {
            elemEnter
                .append("text")
                .attr("class", "circleLabel noselect")
                .text(function (d) {
                    return d.text;
                })
                .attr("x", function (d) {
                    return this.x.bandwidth() / 2;
                }.bind(this))
                .attr("y", function (d) {
                    return this.radius;
                }.bind(this))
                .style("font-size", this.radius)
                .attr("width", function (d) {
                    return this.width - this.x(Number(d.year));
                }.bind(this))
                .style("fill", function (d) {
                    switch (d.type) {
                        case "listingHistory":
                            switch (d.appendix) {
                                case "I":
                                    return getIucnColorForeground({ text: "CR" });
                                case "II":
                                    return getIucnColorForeground({ text: "EN" });
                                case "III":
                                    return getIucnColorForeground({ text: "NT" });
                                default:
                                    break;
                            }
                            break;
                        default:
                            break;
                    }
                })
                .style("font-family", (d) => (d.type === "listingHistory" ? "serif" : "sans-serif"));
        }
    }

    appendIUCN(iucnData) {

        let speciesListing = {};

        let listingKeys = [];
        let newListingData = [];

        let characteristicsMap = {};
        let trendMap = {};

        let maxHeightScale = 5;

        for (let listing of iucnData.sort((a, b) => parseInt(a.year) - parseInt(b.year))) {
            let push = true;
            let name = listing.sciName;

            let listingKey = `${listing.year}${listing.code}${listing.sciName}`;
            let characteristic = `${listing.year}${iucnScore(listing.code)}`;
            if (speciesListing.hasOwnProperty(name)) {
                if (!listingKeys.includes(listingKey)) {
                    speciesListing[name].push(listing);
                    if (push) {
                        newListingData.push(listing);
                    }
                    characteristicsMap[name][listing.year] = characteristic;
                    trendMap[name][listing.year] = listing.code;
                }
            }
            else {
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
        }

        let newTrendMap = {};
        let sumMap = {};
        let characteristicsTrend = {};
        for (let key of Object.keys(characteristicsMap)) {
            /* characteristicsMap[key] = Object.values(characteristicsMap[key]).join(""); */

            let prevYear = 0;
            newTrendMap[key] = [];
            sumMap[key] = [];
            characteristicsMap[key] = Object.keys(characteristicsMap[key])
                .sort((a, b) => parseInt(b) - parseInt(a)).reverse()
                .map((year, index) => {

                    let curr = iucnScore(trendMap[key][year]);
                    if (curr < 0) {
                        curr = 0.5;
                    }
                    sumMap[key].push(curr);
                    if (index > 0) {
                        let prev = iucnScore(trendMap[key][prevYear]);
                        if (prev < 0) {
                            prev = 0.5;
                        }

                        let trend;
                        if (curr > prev) {
                            trend = 1;
                        }
                        else if (curr < prev) {
                            trend = -1;
                        }
                        else {
                            trend = 0;
                        }

                        newTrendMap[key].push(trend);
                    }
                    else {
                        newTrendMap[key].push(0);
                    }

                    prevYear = year;

                    characteristicsTrend[key] = newTrendMap[key];

                    return characteristicsMap[key][year];
                })
                .join("");
        }

        let charCounting = Object.values(characteristicsMap).reduce(function (countMap, word) { countMap[word] = ++countMap[word] || 1; return countMap }, {});

        let uniqueCharacteristics = Object.keys(charCounting);

        let characteristicsToTrend = {};

        let newSumMap = {};
        Object.keys(characteristicsMap).forEach(species => {
            characteristicsToTrend[characteristicsMap[species]] = characteristicsTrend[species];
            newSumMap[characteristicsMap[species]] = sumMap[species].reduce((acc, cur) => acc + cur) / sumMap[species].length;
        });

        let speciesCount = Object.keys(speciesListing).length;

        let heightMap = {};
        if (this.groupSame) {
            let charsAlready = [];
            let newData = [];
            let filteredSpecies = [];

            for (let entry of newListingData) {
                let char = characteristicsMap[entry.sciName];

                if (!charsAlready.includes(char) || filteredSpecies.includes(entry.sciName)) {
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

            this.heightScaleSum = Object.values(heightMap).reduce((prev, curr) => prev + curr);
        }

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
            }
            else {
                let len = characteristicsToTrend[char].length > 1 ? characteristicsToTrend[char].length - 1 : 1;
                let scale = indexA / len;
                characteristicsToTrendResult[char] = scale * characteristicsToTrend[char][indexA];
            }
        }

        uniqueCharacteristics.sort((a, b) => {
            if (this.sortGrouped === "trend") {

                let valA = characteristicsToTrendResult[a];
                let valB = characteristicsToTrendResult[b];

                if (valA > valB) {
                    return 1;
                }
                else if (valA < valB) {
                    return -1;
                }
            }

            if (this.sortGrouped === "avg") {
                let sumA = newSumMap[a];
                let sumB = newSumMap[b];

                if (sumB !== sumA) {
                    return sumA - sumB;
                }
                else {
                    return b.localeCompare(a);
                }
            }

            let countA = charCounting[a];
            let countB = charCounting[b];

            if (countB !== countA) {
                return countB - countA;
            }
            else {
                return b.localeCompare(a);
            }
        });

        let speciesNamesSorted = Object.keys(speciesListing)
            .sort((a, b) => {
                return Math.min(...speciesListing[b].map(e => parseInt(e.year))) - Math.min(...speciesListing[a].map(e => parseInt(e.year)))
            });


        let justUp = Object.keys(characteristicsToTrendResult).filter(e => characteristicsToTrendResult[e] > 0);
        let firstUpTrend = Math.min(...justUp.map(e => uniqueCharacteristics.indexOf(e)));

        let justDown = Object.keys(characteristicsToTrendResult).filter(e => characteristicsToTrendResult[e] < 0);
        let firstDownTrend = Math.min(...justDown.map(e => uniqueCharacteristics.indexOf(e)));

        if (!isFinite(firstDownTrend)) {
            firstDownTrend = 0;
        }

        if (!isFinite(firstUpTrend)) {
            firstUpTrend = uniqueCharacteristics.length;
        }

        let trendObject = {};

        let trendData = [];

        if (uniqueCharacteristics.length - justDown.length - justUp.length > 0) {
            trendData.push({ rowNum: firstDownTrend + justDown.length, type: "", length: uniqueCharacteristics.length - justDown.length - justUp.length });
            trendObject[firstDownTrend + justDown.length] = { type: "", length: uniqueCharacteristics.length - justDown.length - justUp.length };
        }

        if (justDown.length > 0) {
            trendData.push({ rowNum: firstDownTrend, type: "down", length: justDown.length });
            trendObject[firstDownTrend] = { type: "down", length: justDown.length };
        }

        if (justUp.length > 0) {
            trendData.push({ rowNum: firstUpTrend, type: "up", length: justUp.length });
            trendObject[firstUpTrend] = { type: "up", length: justUp.length };
        }

        let rowCount = this.groupSame ? uniqueCharacteristics.length : speciesCount;

        let sortedTrendKeys = Object.keys(trendObject).sort((a, b) => parseInt(a) - parseInt(b));

        let trendRows = [];
        let addIdx = 0;
        for (let key of sortedTrendKeys) {
            for (let tmp = 0; tmp < trendObject[key]["length"]; tmp++) {
                trendRows.push(addIdx);
            }
            addIdx++;
        }

        let svgHeight = 0;
        if (this.groupSame && this.sortGrouped === "trend") {
            svgHeight = (rowCount + 0.5 * (trendData.length - 1)) * this.rowHeight;
        }
        else {
            svgHeight = rowCount * this.rowHeight;
        }

        let svgIUCN = this.wrapper
            .append("svg")
            .attr("id", this.id + "IUCN")
            .attr("class", this.firstSVGAdded ? "timelineSVG" : "timelineSVG topper")
            .attr("width", this.initWidth + this.rightGroupWidth)
            .attr("height", svgHeight)
            .style("display", "inline-block");

        let maxCount = 0;

        svgIUCN.style("display", "block");

        let defs = svgIUCN.append("defs");

        let g = svgIUCN.append("g")
            .attr("transform", "translate(" + this.margin.left + "," + 0 + ")")
            .attr("height", svgHeight);

        let trendGroup = svgIUCN.append("g")
            .attr("transform", "translate(" + this.initWidth + ",0)")
            .attr("height", svgHeight);

        trendGroup
            .append("rect")
            .attr("width", this.rightGroupWidth)
            .attr("height", svgHeight)
            .style("fill", "white");

        g
            .append("text")
            .attr("transform", "translate(-" + this.margin.left + "," + (svgHeight / 2) + ")")
            .style("dominant-baseline", "central")
            .style("font-size", "9")
            .text("IUCN");

        let rect = g
            .append("rect")
            .attr("width", this.width)
            .attr("height", svgHeight)
            .attr("stroke", "gray")
            .style("fill", "none");/*  */
        //.style("fill", "url(#mainGradient)")
        /*.style("stroke", "black")*/
        //.style("fill", "url(#myGradient)");

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
        }
        else {
            keyData = Object.values(speciesListing).map(e => e[0]);
        }

        let calcYPos = function (rowNum) {
            let addY = 0;
            if (this.groupSame && this.sortGrouped === "trend") {
                addY = trendRows[rowNum] * (this.rowHeight / 2);
            }
            else {
                addY = 0;
            }
            return this.rowHeight * rowNum + addY;
        }.bind(this);

        if (this.groupSame && keyData.length > 1) {
            g.selectAll("g myCircleText").data(keyData)
                .enter()
                .append("rect")
                .attr("width", (d) => {
                    return scaleValue(charCounting[characteristicsMap[d.sciName]], [0, speciesCount], [1, 100]);
                })
                .attr("height", (d) => {
                    return this.rowHeight;
                })
                .style("fill", "var(--main)")
                .attr("transform", (d) => {
                    let rowNum = 0;
                    if (this.groupSame) {
                        rowNum = uniqueCharacteristics.indexOf(characteristicsMap[d.sciName]);
                    }
                    else {
                        rowNum = speciesNamesSorted.indexOf(d.sciName);
                    }

                    let yPos = this.calcYPos(rowNum, trendRows, false, false);
                    return "translate(" + (- scaleValue(charCounting[characteristicsMap[d.sciName]], [0, speciesCount], [1, 100])) + ", " + yPos + ")";
                });
        }

        if (keyData.length > 1)
            g.selectAll("g myCircleText").data(keyData)
                .enter()
                .append("text")
                .style("text-anchor", "end")
                .style("dominant-baseline", "central")
                .style("font-size", "9")
                .style("font-style", (d) => "italic")
                .attr("transform", (d) => {
                    let rowNum = 0;
                    if (this.groupSame) {
                        rowNum = uniqueCharacteristics.indexOf(characteristicsMap[d.sciName]);
                    }
                    else {
                        rowNum = speciesNamesSorted.indexOf(d.sciName);
                    }

                    let yPos = this.calcYPos(rowNum, trendRows, false, false) + this.rowHeight / 2;
                    if (this.groupSame) {
                        return "translate(" + (-3 - scaleValue(charCounting[characteristicsMap[d.sciName]], [0, speciesCount], [0, 100])) + ", " + yPos + ")";
                    }
                    else {
                        return "translate(" + (-3) + ", " + yPos + ")";
                    }
                })
                .text((d) => {
                    if (this.groupSame) {
                        let counting = charCounting[characteristicsMap[d.sciName]];

                        if (counting === 1) {
                            return d.sciName.replace(d.genus, "").trim();
                        }
                        else {
                            return counting;
                        }
                    }
                    else {
                        return d.sciName.replace(d.genus, "").trim();
                    }
                });


        this.appendTrends(trendGroup, trendData, trendRows);

        appendIUCNRects.bind(this)(newListingData);

        function appendIUCNRects(lData) {
            let elem = g.selectAll("g myCircleText").data(lData);

            let elemEnter = elem
                .enter()
                .append("g")
                .attr("class", "noselect")
                .attr("transform", function (d) {
                    let rowNum = 0;
                    if (this.groupSame) {
                        rowNum = uniqueCharacteristics.indexOf(characteristicsMap[d.sciName]);
                    }
                    else {
                        rowNum = speciesNamesSorted.indexOf(d.sciName);
                    }

                    /* let addY = 0;
                    for (let idx = 0; idx < rowNum; idx++) {
                        addY += heightMap[uniqueCharacteristics[idx]];
                    } */

                    let yPos = this.calcYPos(rowNum, trendRows, false, false);
                    return "translate(" + (this.x(Number(d.year)) + this.x.bandwidth() / 2) + "," + yPos + ")";
                }.bind(this))
                .attr("x", function (d) {
                    return this.x(Number(d.year) + this.x.bandwidth() / 2);
                }.bind(this))
                .on("mouseover", this.mouseover)
                .on("mousemove", this.mousemove)
                .on("mouseleave", this.mouseleave);

            elemEnter
                .append("rect")
                .attr("class", "pinarea")
                .attr("height", (d) => {
                    return this.rowHeight;
                })
                .attr("width", function (d) {
                    return this.width - this.x(Number(d.year));
                }.bind(this))
                .style("fill", "white");

            elemEnter
                .append("rect")
                .attr("class", "pinarea")
                .attr("height", (d) => {
                    return this.rowHeight;
                })
                .attr("width", function (d) {
                    return this.width - this.x(Number(d.year));
                }.bind(this))
                .style("fill", function (d) {
                    switch (d.type) {
                        case "iucn":
                            return getIucnColor(d);
                        default:
                            break;
                    }
                })
                .style("stroke", function (d) {
                    switch (d.type) {
                        case "iucn":
                            return "gray";
                            break;
                        default:
                            break;
                    }
                }).style("stroke-width", function (d) {
                    switch (d.type) {
                        case "iucn":
                            return 1;
                            break;
                        default:
                            break;
                    }
                });

        }
    }


    appendThreatHeatMap(threatData) {
        let threatHeatMap = {};
        let speciesMap = {};

        let yearCount = {};
        for (let entry of threatData) {
            let year = entry.year.toString();
            let name = entry.genusSpecies;

            pushOrCreate(speciesMap, name, entry);
            pushOrCreate(getOrCreate(threatHeatMap, year, {}), entry.danger, entry);
            pushOrCreate(yearCount, year, 1);
        }

        let years = Object.keys(yearCount).map(e => parseInt(e));
        let maxYear = Math.max(...years);
        let minYear = Math.min(...years);

        let newThreatHeatMap = {};

        for (let species of Object.keys(speciesMap)) {
            let yearData = {};
            let lastState = null;
            for (let entry of speciesMap[species]) {
                pushOrCreate(yearData, entry.year, entry);
            }

            for (let year = minYear; year <= maxYear; year++) {
                if (yearData.hasOwnProperty(year.toString())) {
                    let highestScore = Math.max(...yearData[year.toString()].map(e => threatScore(e.danger)));
                    let highest = threatScoreReverse(highestScore);
                    //let highest = yearData[year.toString()].reduce((a, b) => iucnScore(a) > iucnScore(b.code) ? a : b.code, []);

                    pushOrCreate(getOrCreate(newThreatHeatMap, year, {}), highest, 1);
                    lastState = yearData[year.toString()][0].danger;

                }
                else if (lastState) {
                    pushOrCreate(getOrCreate(newThreatHeatMap, year, {}), lastState, 1);
                }
            }
        }

        let heatMapData = [];
        let maxKeyPrevious = null;
        let maxValuePrevious = null;

        let maxSpecies = Math.max(...Object.values(yearCount).map(e => e.length));

        for (let year of Object.keys(newThreatHeatMap).sort((a, b) => parseInt(a) - parseInt(b))) {
            let yearData = newThreatHeatMap[year.toString()];

            let push = true;
            let countSum;

            let tmp, maxKey, maxValue;
            let opacity;

            switch (this.heatStyle) {
                case "dom":
                    maxKey = Object.keys(yearData).reduce((a, b) => yearData[a].length > yearData[b].length ? a : b);
                    countSum = Object.keys(yearData).reduce((accumulator, currentValue) => {
                        return accumulator + yearData[currentValue].length;
                    }, 0);
                    maxValue = yearData[maxKey];

                    if (maxKeyPrevious !== null) {
                        if (maxKey === maxKeyPrevious && maxValue.length <= maxValuePrevious.length) {
                            maxKey = maxKeyPrevious;
                            maxValue = maxValuePrevious;
                            push = false;
                        }
                    }

                    maxKeyPrevious = maxKey;
                    maxValuePrevious = maxValue;

                    opacity = maxValue.length / maxSpecies;
                    break;
                case "avg":

                    let scoreSum = Object.keys(yearData).reduce(((a, b) => a + yearData[b].length * threatScore(b)), 0);
                    countSum = Object.values(yearData).reduce((accumulator, currentValue) => {
                        return accumulator + currentValue.length;
                    }, 0);

                    let avg = scoreSum / countSum;

                    if (maxValuePrevious !== null) {
                        if (maxValuePrevious === avg) {
                            avg = maxValuePrevious;
                            push = false;
                        }
                    }

                    maxKey = threatScoreReverse(avg);

                    maxValuePrevious = avg;

                    opacity = countSum / maxSpecies;
                    break;
                case "max":

                    maxKey = Object.keys(yearData).reduce((a, b) => threatScore(a) > threatScore(b) ? a : b);
                    countSum = Object.keys(yearData).reduce((accumulator, currentValue) => {
                        return accumulator + yearData[currentValue].length;
                    }, 0);
                    maxValue = yearData[maxKey];

                    if (maxKeyPrevious !== null) {
                        if (maxValue.length === maxValuePrevious.length && maxKey === maxKeyPrevious) {
                            maxKey = maxKeyPrevious;
                            maxValue = maxValuePrevious;
                            push = false;
                        }
                    }

                    maxKeyPrevious = maxKey;
                    maxValuePrevious = maxValue;

                    opacity = yearData[maxKey].length / maxSpecies;
                default:
                    break;
            }


            if (push) {
                tmp = {
                    danger: maxKey,
                    year: year,
                    sciName: this.speciesName + " (" + countSum + ")",
                    rank: "ALL",
                    text: maxKey,
                    type: "threat",
                    opacity: opacity
                };
                heatMapData.push(tmp);
            }
        }

        let lastResult = heatMapData.sort((a, b) => parseInt(a.year) - parseInt(b.year));
        lastResult = lastResult[lastResult.length - 1].danger;

        this.setSpeciesSignThreats(this.speciesName, "threat", lastResult);

        let listingData = heatMapData;

        let circleYearCountIUCN = {};

        let rowHeight = 2 * this.radius + 1;

        let svgCITES = this.wrapper
            .append("svg")
            .attr("id", this.id + "THREATS")
            .attr("width", this.initWidth)
            .attr("height", rowHeight)
            .style("display", "block");

        let maxCount = 0;

        svgCITES.style("display", "block");

        let g = svgCITES.append("g").attr("transform", "translate(" + this.margin.left + "," + 0 + ")");

        let rect = g
            .append("rect")
            .attr("width", this.width)
            .attr("height", (maxCount + 1) * rowHeight)
            .attr("fill", "none")
            .attr("stroke", "gray");
        //.style("fill", "url(#mainGradient)")
        /*.style("stroke", "black")*/
        //.style("fill", "url(#myGradient)");

        let elem = g.selectAll("g myCircleText").data(listingData);


        let elemEnter = elem
            .enter()
            .append("g")
            .attr("class", "noselect")
            .attr("transform", function (d) {
                let count = this.yearCount(d.year, circleYearCountIUCN);
                maxCount = Math.max(maxCount, count);
                rect.attr("height", (maxCount + 1) * rowHeight);
                svgCITES.attr("height", (maxCount + 1) * rowHeight);
                return "translate(" + (this.x(Number(d.year)) + this.x.bandwidth() / 2) + "," + (rowHeight * count) + ")";
            }.bind(this))
            .attr("x", function (d) {
                return this.x(Number(d.year) + this.x.bandwidth() / 2);
            }.bind(this))
            .on("mouseover", this.mouseover)
            .on("mousemove", this.mousemove)
            .on("mouseleave", this.mouseleave);

        g
            .append("text")
            .attr("transform", "translate(-5," + ((maxCount + 1) * rowHeight) / 2 + ")")
            .style("text-anchor", "end")
            .style("dominant-baseline", "central")
            .style("font-size", "9")
            .text("BGCI");

        //let radius = (height - y(1)) / 2;
        elemEnter
            .append("rect")
            .attr("class", "pinarea")
            .attr("height", rowHeight - 2)
            .attr("y", 1)
            /* .attr("width", function (d) {
              return width - x(Number(d.year));
            }) */
            .attr("width", function (d) {
                return this.width - this.x(Number(d.year));
            }.bind(this))
            .style("fill", "white");
        /*.attr("r", radius)*/
        /*.attr("cx", function(d) {
                            return x.bandwidth() / 2;
                        })
                        .attr("cy", function(d) {
                            return radius;
                        })*/


        elemEnter
            .append("rect")
            .attr("class", "pinarea")
            .attr("height", rowHeight - 2)
            .attr("y", 1)
            /* .attr("width", function (d) {
              return width - x(Number(d.year));
            }) */
            .attr("width", function (d) {
                return this.width - this.x(Number(d.year));
            }.bind(this))
            /*.attr("r", radius)*/
            /*.attr("cx", function(d) {
                                return x.bandwidth() / 2;
                            })
                            .attr("cy", function(d) {
                                return radius;
                            })*/
            .style("stroke-width", 1)
            .style("stroke", function (d) {
                switch (d.type) {
                    case "threat":
                        return dangerColorMap[d.danger].bg;
                    default:
                        break;
                }
            })
            .style("fill-opacity", (d) => d.opacity)
            .style("fill", function (d) {
                switch (d.type) {
                    case "threat":
                        return dangerColorMap[d.danger].bg;
                    default:
                        break;
                }
            });

        /* if (this.zoomLevel > 0) {
            elemEnter
                .append("text")
                .attr("class", "circleLabel noselect")
                .text(function (d) {
                    return d.text;
                })
                .attr("x", function (d) {
                    return this.x.bandwidth() / 2;
                }.bind(this))
                .attr("y", function (d) {
                    return this.radius;
                }.bind(this))
                .style("font-size", this.radius)
                .attr("width", function (d) {
                    return this.width - this.x(Number(d.year));
                }.bind(this))
                .style("fill", function (d) {
                    switch (d.type) {
                        case "threat":
                            return dangerColorMap[d.danger].fg;
                        default:
                            break;
                    }
                })
                .style("font-family", (d) => (d.type === "listingHistory" ? "serif" : "sans-serif"));
    }*/
    }

    appendThreatsWithSubSpecies(threatData) {

        let speciesListing = {};

        let listingKeys = [];
        let newListingData = [];

        let characteristicsMap = {};
        let trendMap = {};

        for (let listing of threatData.sort((a, b) => parseInt(a.year) - parseInt(b.year))) {
            let push = true;
            let name = `${listing.genusSpecies}`.trim();

            listing.text += " " + name;

            if (listing.scope !== "Global") {
                push = false;
            }

            listing.sciName = name;

            let listingKey = `${listing.year}${listing.danger}${listing.sciName}`;
            let characteristic = `${listing.year}${listing.danger}`;

            if (push) {
                if (speciesListing.hasOwnProperty(name)) {
                    if (!listingKeys.includes(listingKey)) {
                        speciesListing[name].push(listing);
                        newListingData.push(listing);
                        characteristicsMap[name][listing.year] = characteristic;
                        trendMap[name][listing.year] = listing.danger;
                    }
                }
                else {
                    speciesListing[name] = [listing];
                    newListingData.push(listing);
                    characteristicsMap[name] = {};
                    characteristicsMap[name][listing.year] = characteristic;
                    trendMap[name] = {};
                    trendMap[name][listing.year] = listing.danger;
                }

                listingKeys.push(listingKey);
            }
        }

        let newTrendMap = {};
        let sumMap = {};
        let characteristicsTrend = {};
        for (let key of Object.keys(characteristicsMap)) {

            let prevYear = 0;
            newTrendMap[key] = [];
            sumMap[key] = [];
            characteristicsMap[key] = Object.keys(characteristicsMap[key])
                .sort((a, b) => parseInt(b) - parseInt(a)).reverse()
                .map((year, index) => {

                    let curr = threatScore(trendMap[key][year]);
                    if (curr < 0) {
                        curr = 0.5;
                    }
                    sumMap[key].push(curr);
                    if (index > 0) {
                        let prev = threatScore(trendMap[key][prevYear]);
                        if (prev < 0) {
                            prev = 0.5;
                        }

                        let trend;

                        if (curr > prev) {
                            trend = 1;
                        }
                        else if (curr < prev) {
                            trend = -1;
                        }
                        else {
                            trend = 0;
                        }

                        newTrendMap[key].push(trend);
                    }
                    else {
                        newTrendMap[key].push(0);
                    }

                    prevYear = year;

                    characteristicsTrend[key] = newTrendMap[key];

                    return characteristicsMap[key][year];
                })
                .join("");
        }


        let charCounting = Object.values(characteristicsMap).reduce(function (countMap, word) { countMap[word] = ++countMap[word] || 1; return countMap }, {});

        let uniqueCharacteristics = Object.keys(charCounting);

        let characteristicsToTrend = {};
        let newSumMap = {};
        Object.keys(characteristicsMap).forEach(species => {
            characteristicsToTrend[characteristicsMap[species]] = characteristicsTrend[species];
            newSumMap[characteristicsMap[species]] = sumMap[species].reduce((acc, cur) => acc + cur) / sumMap[species].length;
        });

        let speciesCount = Object.keys(speciesListing).length;

        let heightMap = {};
        if (this.groupSame) {
            let charsAlready = [];
            let newData = [];
            let filteredSpecies = [];

            for (let entry of newListingData) {
                let char = characteristicsMap[entry.sciName];

                if (!charsAlready.includes(char) || filteredSpecies.includes(entry.sciName)) {
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

            this.heightScaleSum = Object.values(heightMap).reduce((prev, curr) => prev + curr);
        }

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
            }
            else {
                let len = characteristicsToTrend[char].length > 1 ? characteristicsToTrend[char].length - 1 : 1;
                let scale = indexA / len;
                characteristicsToTrendResult[char] = scale * characteristicsToTrend[char][indexA];
            }
        }

        uniqueCharacteristics.sort((a, b) => {
            if (this.sortGrouped === "trend") {

                let valA = characteristicsToTrendResult[a];
                let valB = characteristicsToTrendResult[b];

                if (valA > valB) {
                    return 1;
                }
                else if (valA < valB) {
                    return -1;
                }
            }

            if (this.sortGrouped === "avg") {
                let sumA = newSumMap[a];
                let sumB = newSumMap[b];

                if (sumB !== sumA) {
                    return sumA - sumB;
                }
                else {
                    return b.localeCompare(a);
                }
            }

            let countA = charCounting[a];
            let countB = charCounting[b];

            if (countB !== countA) {
                return countB - countA;
            }
            else {
                return b.localeCompare(a);
            }
        });


        let speciesNamesSorted = Object.keys(speciesListing)
            .sort((a, b) => {
                if (Math.min(...speciesListing[b].map(e => parseInt(e.year))) > Math.min(...speciesListing[a].map(e => parseInt(e.year)))) {
                    return 1;
                }
                else if (Math.min(...speciesListing[b].map(e => parseInt(e.year))) < Math.min(...speciesListing[a].map(e => parseInt(e.year)))) {
                    return -1;
                }
                else {
                    if (dangerSorted.indexOf(speciesListing[b][0].danger) < 0) {
                    }
                    return dangerSorted.indexOf(speciesListing[b][0].danger) - dangerSorted.indexOf(speciesListing[a][0].danger);
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
        }
        else {
            keyData = Object.values(speciesListing).map(e => e[0]);
        }

        let justUp = Object.keys(characteristicsToTrendResult).filter(e => characteristicsToTrendResult[e] > 0);
        let firstUpTrend = Math.min(...justUp.map(e => uniqueCharacteristics.indexOf(e)));

        let justDown = Object.keys(characteristicsToTrendResult).filter(e => characteristicsToTrendResult[e] < 0);
        let firstDownTrend = Math.min(...justDown.map(e => uniqueCharacteristics.indexOf(e)));

        if (!isFinite(firstDownTrend)) {
            firstDownTrend = 0;
        }

        if (!isFinite(firstUpTrend)) {
            firstUpTrend = uniqueCharacteristics.length;
        }

        let trendObject = {};

        let trendData = [];

        if (uniqueCharacteristics.length - justDown.length - justUp.length > 0) {
            trendData.push({ rowNum: firstDownTrend + justDown.length, type: "", length: uniqueCharacteristics.length - justDown.length - justUp.length });
            trendObject[firstDownTrend + justDown.length] = { type: "", length: uniqueCharacteristics.length - justDown.length - justUp.length };
        }

        if (justDown.length > 0) {
            trendData.push({ rowNum: firstDownTrend, type: "down", length: justDown.length });
            trendObject[firstDownTrend] = { type: "down", length: justDown.length };
        }

        if (justUp.length > 0) {
            trendData.push({ rowNum: firstUpTrend, type: "up", length: justUp.length });
            trendObject[firstUpTrend] = { type: "up", length: justUp.length };
        }

        let rowCount = this.groupSame ? uniqueCharacteristics.length : speciesCount;

        let sortedTrendKeys = Object.keys(trendObject).sort((a, b) => parseInt(a) - parseInt(b));

        let trendRows = [];
        let addIdx = 0;
        for (let key of sortedTrendKeys) {
            for (let tmp = 0; tmp < trendObject[key]["length"]; tmp++) {
                trendRows.push(addIdx);
            }
            addIdx++;
        }

        // ############# THREATS #############

        let svgHeight = 0;
        if (this.groupSame && this.sortGrouped === "trend") {
            svgHeight = (rowCount + 0.5 * (trendData.length - 1)) * this.rowHeight;
        }
        else {
            svgHeight = rowCount * this.rowHeight;
        }

        threatData = newListingData;


        let svgThreat = this.wrapper
            .append("svg")
            .attr("id", this.id + "Threat")
            .attr("class", this.firstSVGAdded ? "timelineSVG" : "timelineSVG topper")
            .attr("width", this.initWidth + this.rightGroupWidth)
            .attr("height", svgHeight);

        let maxCount = 0;

        svgThreat.style("display", "block");

        let g = svgThreat.append("g")
            .attr("transform", "translate(" + this.margin.left + "," + 0 + ")")

        let trendGroup = svgThreat.append("g")
            .attr("transform", "translate(" + this.initWidth + ",0)")
            .attr("height", svgHeight);

        trendGroup
            .append("rect")
            .attr("width", this.rightGroupWidth)
            .attr("height", svgHeight)
            .style("fill", "white");

        g
            .append("text")
            .attr("transform", "translate(-" + this.margin.left + "," + (svgHeight / 2) + ")")
            .style("dominant-baseline", "central")
            .style("font-size", "9")
            .text("BGCI");

        if (this.groupSame && keyData.length > 1) {
            g.selectAll("g myCircleText").data(keyData)
                .enter()
                .append("rect")
                .attr("width", (d) => {
                    return scaleValue(charCounting[characteristicsMap[d.sciName]], [0, speciesCount], [1, 100]);
                })
                .attr("height", (d) => {
                    return this.rowHeight;
                })
                .style("fill", "var(--main)")
                .attr("transform", (d) => {
                    let rowNum = 0;
                    if (this.groupSame) {
                        rowNum = uniqueCharacteristics.indexOf(characteristicsMap[d.sciName]);
                    }
                    else {
                        rowNum = speciesNamesSorted.indexOf(d.sciName);
                    }

                    let yPos = this.calcYPos(rowNum, trendRows, false, false);
                    return "translate(" + (- scaleValue(charCounting[characteristicsMap[d.sciName]], [0, speciesCount], [1, 100])) + ", " + yPos + ")";
                });
        }

        if (keyData.length > 1) {
            g.selectAll("g myCircleText").data(keyData)
                .enter()
                .append("text")
                .style("text-anchor", "end")
                .style("dominant-baseline", "central")
                .style("font-size", "9")
                .style("font-style", (d) => "italic")
                .attr("transform", (d) => {
                    let rowNum = 0;
                    if (this.groupSame) {
                        rowNum = uniqueCharacteristics.indexOf(characteristicsMap[d.sciName]);
                    }
                    else {
                        rowNum = speciesNamesSorted.indexOf(d.sciName);
                    }

                    let yPos = this.calcYPos(rowNum, trendRows, false, false) + this.rowHeight / 2;
                    if (this.groupSame) {
                        return "translate(" + (-3 - scaleValue(charCounting[characteristicsMap[d.sciName]], [0, speciesCount], [0, 100])) + ", " + yPos + ")";
                    }
                    else {
                        return "translate(" + (-3) + ", " + yPos + ")";
                    }
                })
                .text((d) => {
                    if (this.groupSame) {
                        let counting = charCounting[characteristicsMap[d.sciName]];

                        if (counting === 1) {
                            return d.sciName.replace(d.genus, "").trim();
                        }
                        else {
                            return counting;
                        }
                    }
                    else {
                        return d.sciName.replace(d.genus, "").trim();
                    }
                });
        }

        this.appendTrends(trendGroup, trendData, trendRows, false, false);

        let rect = g
            .append("rect")
            .attr("width", this.width)
            .attr("height", svgHeight)
            .style("fill", "none")
            .style("stroke", "gray");

        let elem = g.selectAll("g myCircleText").data(threatData);

        let elemEnter = elem
            .enter()
            .append("g")
            .attr("class", "noselect")
            .attr("transform", function (d) {
                let rowNum = 0;
                if (this.groupSame) {
                    rowNum = uniqueCharacteristics.indexOf(characteristicsMap[d.sciName]);
                }
                else {
                    rowNum = speciesNamesSorted.indexOf(d.sciName);
                }

                /*         let addY = 0;
                        for (let idx = 0; idx < rowNum; idx++) {
                            addY += heightMap[uniqueCharacteristics[idx]];
                        } */

                let yPos = this.calcYPos(rowNum, trendRows, false, false);
                return "translate(" + (this.x(Number(d.year)) + this.x.bandwidth() / 2) + "," + yPos + ")";
            }.bind(this))
            .attr("x", function (d) {
                return this.x(Number(d.year)) + this.x.bandwidth() / 2;
            }.bind(this))
            .on("mouseover", this.mouseover)
            .on("mousemove", this.mousemove)
            .on("mouseleave", this.mouseleave);


        elemEnter
            .filter((d) => d.scope === "Global")
            .append("rect")
            .attr("class", "pinarea")
            .attr("height", this.rowHeight)
            .attr("width", function (d) {
                return this.width - this.x(Number(d.year));
            }.bind(this))
            .style("fill", (d) => {
                return dangerColorMap[d.danger].bg;
            })
            .style("stroke", "gray");
    }


    appendThreatPies(threatData) {

        // ############# THREATS #############
        let rowHeight = 2 * this.radius + 1;
        let strokeWidth = 0.5;

        // let circleYearCountThreats = {};

        let svgThreat = this.wrapper
            .append("svg")
            .attr("id", this.id + "Threat")
            .attr("width", this.initWidth)
            .attr("height", rowHeight);

        let maxCount = 0;

        svgThreat.style("display", "block");

        let g = svgThreat.append("g").attr("transform", "translate(" + this.margin.left + "," + 0 + ")");

        g.append("rect")
            .attr("width", this.width)
            .attr("height", rowHeight)
            .style("fill", "none")
            .style("stroke", "grey");

        g.append("text")
            .attr("transform", "translate(-5," + ((maxCount + 1) * rowHeight) / 2 + ")")
            .style("text-anchor", "end")
            .style("dominant-baseline", "central")
            .style("font-size", "9")
            .text("Threats");

        let piedData = {};
        for (let threat of threatData.values()) {
            if (threat.scope !== "Global") {
                pushOrCreate(
                    getOrCreate(piedData, threat.year.toString(), {
                        year: threat.year.toString(),
                        type: "threatpie",
                        data: {}
                    }).data,
                    threat.danger,
                    threat
                );
            }
        }

        // Compute the position of each group on the pie:
        var pie = d3.pie()
            .value(function (d) {
                return d.value.length;
            });

        piedData = Object.values(piedData);

        let elem = g.selectAll("wayne").data(threatData);

        let elemEnter = elem
            .enter()
            .append("g")
            .attr("class", "noselect")
            .attr("transform", function (d) {
                return "translate(" + (this.x(parseInt(d.year)) + this.x.bandwidth() / 2) + "," + (-strokeWidth) + ")";
            }.bind(this))
            .attr("x", function (d) {
                return this.x(parseInt(d.year)) + this.x.bandwidth() / 2;
            }.bind(this))
            .on("mouseover", this.mouseover)
            .on("mousemove", this.mousemove)
            .on("mouseleave", this.mouseleave);


        elemEnter
            .filter((d) => {
                return d.scope === "Global"
            })
            .append("rect")
            .attr("class", "pinarea")
            .attr("height", rowHeight + 2 * strokeWidth)
            .attr("width", function (d) {
                return this.width - this.x(Number(d.year));
            }.bind(this))
            .style("fill", (d) => {
                return dangerColorMap[d.danger].bg;
            })
            .style("stroke-width", strokeWidth + "px")
            .style("stroke", "gray");

        elem = g.selectAll("g myCircleText").data(piedData);

        strokeWidth = 0.5;

        elemEnter = elem
            .enter()
            .append("g")
            .attr("class", "noselect")
            .attr("transform", function (d) {
                return "translate(" + (this.x(parseInt(d.year)) + this.x.bandwidth() / 2) + "," + ((rowHeight) / 2) + ")";
            }.bind(this))
            .attr("x", function (d) {
                return this.x(parseInt(d.year)) + this.x.bandwidth() / 2;
            }.bind(this))
            .on("mouseover", this.mouseover)
            .on("mousemove", this.mousemove)
            .on("mouseleave", this.mouseleave);

        elemEnter
            .selectAll('whatever')
            .data(function (d) {
                return pie(d3.entries(d.data));
            })
            .enter()
            .append('path')
            .attr('d', d3.arc()
                .innerRadius(0)
                .outerRadius(rowHeight / 2 - 0.5 * strokeWidth)
            )
            .attr('fill', function (d) {
                return dangerColorMap[d.data.key].bg;
            })
            .attr("stroke", "var(--black)")
            .style("stroke-width", strokeWidth + "px");
    }

    appendThreatBars(threatData) {
        // ############# THREATS #############
        let rowHeight = 2 * this.radius + 1;
        let strokeWidth = 0.5;

        // let circleYearCountThreats = {};

        let svgThreat = this.wrapper
            .append("svg")
            .attr("id", this.id + "Threat")
            .attr("width", this.initWidth)
            .attr("height", rowHeight);

        let maxCount = 0;

        svgThreat.style("display", "block");

        let g = svgThreat.append("g").attr("transform", "translate(" + this.margin.left + "," + 0 + ")");

        g.append("rect")
            .attr("width", this.width)
            .attr("height", rowHeight)
            .style("fill", "none")
            .style("stroke", "grey");

        g.append("text")
            .attr("transform", "translate(-5," + ((maxCount + 1) * rowHeight) / 2 + ")")
            .style("text-anchor", "end")
            .style("dominant-baseline", "central")
            .style("font-size", "9")
            .text("Threats");

        let piedData = {};
        for (let threat of threatData.values()) {
            if (threat.scope !== "Global") {
                pushOrCreate(
                    getOrCreate(piedData, threat.year.toString(), {
                        year: threat.year.toString(),
                        type: "threatpie",
                        data: {}
                    }).data,
                    threat.danger,
                    threat
                );
            }
        }

        let barScale = d3.scaleLinear()
            .domain([0, this.maxPerYear])
            .range([this.x.bandwidth(), 0]);

        piedData = Object.values(piedData);

        let elem = g.selectAll("wayne").data(threatData);

        let elemEnter = elem
            .enter()
            .append("g")
            .attr("class", "noselect")
            .attr("transform", function (d) {
                return "translate(" + (this.x(parseInt(d.year)) + this.x.bandwidth() / 2) + "," + (-strokeWidth) + ")";
            }.bind(this))
            .attr("x", function (d) {
                return this.x(parseInt(d.year)) + this.x.bandwidth() / 2;
            }.bind(this))
            .on("mouseover", this.mouseover)
            .on("mousemove", this.mousemove)
            .on("mouseleave", this.mouseleave);


        elemEnter
            .filter((d) => {
                return d.scope === "Global"
            })
            .append("rect")
            .attr("class", "pinarea")
            .attr("height", rowHeight + 2 * strokeWidth)
            .attr("width", function (d) {
                return this.width - this.x(Number(d.year));
            }.bind(this))
            .style("fill", (d) => {
                return dangerColorMap[d.danger].bg;
            })
            .style("stroke-width", strokeWidth + "px")
            .style("stroke", "gray");

        elem = g.selectAll("g myCircleText").data(piedData);

        strokeWidth = 0.5;

        elemEnter = elem
            .enter()
            .append("g")
            .attr("class", "noselect")
            .attr("transform", function (d) {
                return "translate(" + (this.x(parseInt(d.year)) + this.x.bandwidth() / 2) + "," + 0 + ")";
            }.bind(this))
            .attr("x", function (d) {
                return this.x(parseInt(d.year)) + this.x.bandwidth() / 2;
            }.bind(this))
            .on("mouseover", this.mouseover)
            .on("mousemove", this.mousemove)
            .on("mouseleave", this.mouseleave);

        elemEnter
            .selectAll('whatever')
            .data(function (d) {
                let data = {};
                Object.keys(dangerColorMap).forEach((key, i) => {
                    data[key] = d.data.hasOwnProperty(key) ? d.data[key].length : 0;
                });
                var stackedData = d3.stack()
                    .keys(Object.keys(dangerColorMap))
                    ([data]);

                return stackedData;
            })
            .enter()
            .append("rect")
            .attr("width", (d) => {
                return barScale(d[0][0]) - barScale(d[0][1]);
            })
            .attr("height", rowHeight)
            .attr("x", function (d) {
                return this.x.bandwidth() + 4 * strokeWidth - barScale(d[0][0]);
            }.bind(this))
            .attr('fill', function (d) {
                return dangerColorMap[d.key].bg;
            })
            .attr("stroke", "none")

        elemEnter
            .append("rect")
            .attr("width", this.x.bandwidth() + 2 * strokeWidth)
            .attr("height", rowHeight - 2 * strokeWidth)
            .attr("transform", "translate(" + 3 * strokeWidth + "," + strokeWidth + ")")
            .style("fill", "none")
            .style("stroke", "grey");
    }

    appendThreatVerticalBars(threatData) {
        // ############# THREATS #############
        let localMaxPerYear = Math.max(...Object.values(threatData).map(e => e.maxPerYear));

        let rowHeight = localMaxPerYear * 2 * this.radius + 1;
        let strokeWidth = 0.5;

        // let circleYearCountThreats = {};

        let svgThreat = this.wrapper
            .append("svg")
            .attr("id", this.id + "Threat")
            .attr("width", this.initWidth)
            .attr("height", rowHeight);

        let maxCount = 0;

        svgThreat.style("display", "block");

        let g = svgThreat.append("g").attr("transform", "translate(" + this.margin.left + "," + 0 + ")");

        g.append("rect")
            .attr("width", this.width)
            .attr("height", rowHeight)
            .style("fill", "none")
            .style("stroke", "grey");

        g.append("text")
            .attr("transform", "translate(-5," + ((maxCount + 1) * rowHeight) / 2 + ")")
            .style("text-anchor", "end")
            .style("dominant-baseline", "central")
            .style("font-size", "9")
            .text("Threats");

        let piedData = {};
        for (let threat of threatData.values()) {
            if (threat.scope !== "Global") {
                pushOrCreate(
                    getOrCreate(piedData, threat.year.toString(), {
                        year: threat.year.toString(),
                        type: "threatpie",
                        data: {}
                    }).data,
                    threat.danger,
                    threat
                );
            }
        }

        let barScale = d3.scaleLinear()
            .domain([0, localMaxPerYear])
            .range([rowHeight, 0]);

        piedData = Object.values(piedData);

        let elem = g.selectAll("wayne").data(threatData);

        let elemEnter = elem
            .enter()
            .append("g")
            .attr("class", "noselect")
            .attr("transform", function (d) {
                return "translate(" + (this.x(parseInt(d.year)) + this.x.bandwidth() / 2) + "," + (-strokeWidth) + ")";
            }.bind(this))
            .attr("x", function (d) {
                return this.x(parseInt(d.year)) + this.x.bandwidth() / 2;
            }.bind(this))
            .on("mouseover", this.mouseover)
            .on("mousemove", this.mousemove)
            .on("mouseleave", this.mouseleave);


        elemEnter
            .filter((d) => {
                return d.scope === "Global"
            })
            .append("rect")
            .attr("class", "pinarea")
            .attr("height", rowHeight + 2 * strokeWidth)
            .attr("width", function (d) {
                return this.width - this.x(Number(d.year));
            }.bind(this))
            .style("fill", (d) => {
                return dangerColorMap[d.danger].bg;
            })
            .style("stroke-width", strokeWidth + "px")
            .style("stroke", "gray");

        elem = g.selectAll("g myCircleText").data(piedData);

        strokeWidth = 0.5;

        elemEnter = elem
            .enter()
            .append("g")
            .attr("class", "noselect")
            .attr("transform", function (d) {
                return "translate(" + (this.x(parseInt(d.year))) + "," + 0 + ")";
            }.bind(this))
            .attr("x", function (d) {
                return this.x(parseInt(d.year));
            }.bind(this))
            .on("mouseover", this.mouseover)
            .on("mousemove", this.mousemove)
            .on("mouseleave", this.mouseleave);

        elemEnter
            .selectAll('whatever')
            .data(function (d) {
                let data = {};
                Object.keys(dangerColorMap).forEach((key, i) => {
                    data[key] = d.data.hasOwnProperty(key) ? d.data[key].length : 0;
                });
                var stackedData = d3.stack()
                    .keys(Object.keys(dangerColorMap))
                    ([data]);

                let newStackedData = [];
                for (let entry of stackedData.values()) {
                    if (entry[0].data[entry.key] > 1) {
                        for (let i = entry[0][0]; i < entry[0][1]; i++) {
                            let newEntry = { 0: { 0: i, 1: i + 1, data: entry[0].data }, key: entry.key, index: entry.index };
                            newStackedData.push(newEntry);
                        }
                    }
                    else {
                        newStackedData.push(entry);
                    }
                }
                return newStackedData;
            })
            .enter()
            .append("rect")
            .attr("width", this.x.bandwidth() / 2)
            .attr("height", (d) => {
                return barScale(d[0][0]) - barScale(d[0][1]);
            })
            .attr("x", 2)
            .attr("y", function (d) {
                return barScale(d[0][1]);
            }.bind(this))
            .attr('fill', function (d) {
                return dangerColorMap[d.key].bg;
            })
            .attr("stroke", "grey")
            .attr("stroke-width", strokeWidth)

        /* elemEnter
            .append("rect")
            .attr("width", this.x.bandwidth() / 2 + 2 * strokeWidth)
            .attr("height", rowHeight - 2 * strokeWidth)
            .attr("transform", "translate(" + 3 * strokeWidth + "," + strokeWidth + ")")
            .style("fill", "none")
            .style("stroke", "grey"); */
    }

    mouseover(d) {
        d3.select(".tooltip").style("display", "block");
    }

    mousemove(d) {
        //var parentOffset = $(this).closest("svg").offset();
        var parentOffset = d3.select(d3.select(this).node().closest("svg")).node().getBoundingClientRect();

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
                htmlText = d.sciName + "<br>" + d.year + " : Appendix " + d.appendix;
                if (d.hasOwnProperty("annotation")) {
                    htmlText += "<br>" + d.annotation
                }
                leftAdd = parseInt(d3.select(this).attr("x"));
                break;
            case "iucn":
                htmlText = d.sciName + "<br>" + d.year + " : " + d.category;
                leftAdd = parseInt(d3.select(this).attr("x"));
                break;
            case "threat":
                htmlText =
                    d.year +
                    " " +
                    d.genusSpecies +
                    " : " +
                    d.consAssCategoryOrig +
                    " | " +
                    d.threatened +
                    " | " +
                    d.scope +
                    " | " +
                    d.reference +
                    (d.countries ? " | " + d.countries : "");
                leftAdd = parseInt(d3.select(this).attr("x"));
                break;
            case "threatpie":
                htmlText = d.year +
                    "<br>" +
                    Object.keys(d.data).map(key => d.data[key][0].threatened + " (" + d.data[key].length + ") " + d.data[key].filter(e => e.countries !== undefined).map(e => e.countries).join(", ")).join("<br>");
                leftAdd = parseInt(d3.select(this).attr("x"));
                break;
            default:
                // statements_def
                break;
        }
        /* } */

        d3.select(".tooltip").html(htmlText)
            /* .style("left", leftAdd + d3.mouse(this)[0] + 85 + "px")
            .style("top", parentOffset.top + d3.mouse(this)[1] + 10 + topAdd + "px"); */
            .style("left", (d3.event.pageX + 25) + "px")
            .style("top", (d3.event.pageY + topAdd) + "px");

    }

    mouseleave(d) {
        d3.select(this).style("fill", d3.select(this).attr("origFill"));
        d3.select(".tooltip").style("display", "none");
    }

    paint() {
        this.clearAndReset();

        this.width = this.initWidth - this.margin.left - this.margin.right;
        this.height = this.initHeight - this.margin.top - this.margin.bottom;

        if (this.zoomLevel === 0 && this.justTrade === true) {
            this.height = this.height / 2.5;
        }

        let yearDiff = this.domainYears.maxYear - this.domainYears.minYear;

        let xDomain = Array(yearDiff + 1)
            .fill()
            .map((_, i) => this.domainYears.minYear - 1 + i + 1);

        this.x = d3.scaleBand().rangeRound([0, this.width]).padding(0.1);

        this.x.domain(xDomain);

        this.y = d3.scaleLinear().rangeRound([this.height, 0]);

        // var circleYearCount = {};

        if (this.data) {
            let [data, groupedBySource] = this.data.timeTrade;

            this.y.domain([
                0,
                d3.max(data, function (d) {
                    return Number(d.count);
                }),
            ]);

            if (this.justTrade === true) {
                if (this.zoomLevel > 0) {
                    this.appendCitesTradeStacked(data, groupedBySource);
                }
                else {
                    this.appendCitesTrade(data, groupedBySource);
                }
            }
            else {

                if (this.zoomLevel > 0) {
                    this.radius = Math.ceil(Math.min(this.x.bandwidth() / 2 - 5, this.height / 2));
                    this.fontSize = this.radius;
                }
                else {
                    this.radius = Math.ceil(Math.min(this.x.bandwidth() / 6, this.height / 2));
                    this.fontSize = 9;
                }

                /* console.log(this.speciesName, this.data); */


                if (this.zoomLevel > 0) {
                    this.rowHeight = 2 * this.radius + 1;
                }
                else {
                    this.rowHeight = this.radius + 1;
                }

                if (this.data.timeListing.length) {
                    if (this.zoomLevel > 0) {
                        /* this.appendCitesHeatMap(this.data.timeListing, true); */
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
                    }
                    this.firstSVGAdded = true;
                }

                if (this.data.timeIUCN.length) {
                    if (this.zoomLevel > 0) {
                        this.appendIUCN(this.data.timeIUCN);
                    }
                    else {
                        this.appendIUCNHeatMap(this.data.timeIUCN);
                    }
                    this.firstSVGAdded = true;
                }

                if (this.data.timeThreat.length) {
                    if (this.zoomLevel === 0) {
                        switch (this.pieStyle) {
                            case "pie":
                                //this.appendThreatPies(this.data.timeThreat);
                                this.appendThreatHeatMap(this.data.timeThreat);
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
                    }
                    this.firstSVGAdded = true;
                }
            }
        }
        else if (this.id.includes("scale")) {
            let svgScale = this.wrapper
                .append("svg")
                .attr("id", this.id + "Scale")
                .attr("width", this.initWidth)
                .attr("height", "25px")
                .style("display", "block");

            let top = -1;
            let axis = d3.axisBottom(this.x);

            if (this.speciesName === "scaleTop") {
                top = 25;
                axis = d3.axisTop(this.x);
            }

            let g = svgScale.append("g").attr("transform", "translate(" + this.margin.left + "," + top + ")");

            g.append("g")
                .attr("transform", "translate(0," + 0 + ")")
                .call(axis);
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
}

export default TimelineHelper;