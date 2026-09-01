import React, { Component } from 'react';
import { getOrCreate, pushOrCreate, scaleValue } from '../utils/utils';

//import statdata from "../data/statdata.json";

/* import data1 from "../data/crawledDataNew1.json";
import data2 from "../data/crawledDataNew2.json";
import data3 from "../data/crawledDataNew3.json"; */

/* import data1 from "../data/crawledDataNew4.json";
import data2 from "../data/crawledDataNew5.json";
import data3 from "../data/crawledDataNew6.json"; */

/* import data1 from "../data/crawledDataNew7.json";
import data2 from "../data/crawledDataNew8.json";
import data3 from "../data/crawledDataNew9.json"; */

/* import data1 from "../data/crawledDataNew10.json";
import data2 from "../data/crawledDataNew11.json";
import data3 from "../data/crawledDataNew12.json"; */

/* import data1 from "../data/crawledDataNew13.json";
import data2 from "../data/crawledDataNew14.json";
import data3 from "../data/crawledDataNew15.json"; */

/* import data1 from "../data/crawledDataNew16.json";
import data2 from "../data/crawledDataNew17.json";
import data3 from "../data/crawledDataNew18.json"; */

/* import data1 from "../data/crawledDataNew19.json";
import data2 from "../data/crawledDataNew20.json"; */


let statdata = {"statdata": {}, "statistics": {}};

class Statistics extends Component {
    constructor(props) {
        super(props);

        this.statdata = statdata.statdata;
        this.statistics = statdata.statistics;

        this.hasRendered = false;

        this.species = [];

        this.speciesKeys = statdata.speciesKeys;

        this.testdata = {
            /*  ...data1,
             ...data2, */
            /* ...data3 */
        };
    }

    countSpecies() {
        for (let species of Object.keys(this.testdata).values()) {
            let oldObj = this.testdata[species];

            let newSpecies = species.trim();
            if (!Object.keys(this.statdata).includes(newSpecies)) {
                this.species.push(newSpecies);
            }

            delete this.testdata[species];
            this.testdata[newSpecies] = oldObj;
        }
    }

    countSubspecies() {
        for (let species of this.species.values()) {
            if (this.testdata[species].species !== undefined) {
                getOrCreate(this.statdata, species, { subspecies: 0 }).subspecies = Object.keys(this.testdata[species].species).length;

                this.speciesKeys = [...new Set([...Object.values(this.testdata[species].species).map(e => e.speciesKey), ...this.speciesKeys])];
            }
        }
    }

    countThreats() {
        for (let species of this.species.values()) {
            if (this.testdata[species].threats) {
                getOrCreate(this.statdata, species, { threatCount: 0 }).threatCount = this.testdata[species].threats.length;
                this.statistics.threatCount = this.statistics.threatCount + this.testdata[species].threats.length;

                for (let threat of this.testdata[species].threats.values()) {
                    if (threat.consAssCategory != null) {
                        pushOrCreate(this.statistics.threatCats, threat.consAssCategory, {
                            threatened: threat.threatened,
                            consAssCategory: threat.consAssCategory,
                            bgciUrl: threat.bgciUrl,
                            reference: threat.reference,
                            taxonName: threat.taxonName,
                            threatId: threat.threatId
                        });
                    }
                }
            }
            else {
                getOrCreate(this.statdata, species, { threatCount: 0 }).threatCount = 0;
            }
        }

        if (this.species.length > 0) {
            for (let cat of Object.keys(this.statistics.threatCats).values()) {
                this.statistics.threatCatsCount[cat] = this.statistics.threatCatsCount[cat] !== undefined ? this.statistics.threatCatsCount[cat] + this.statistics.threatCats[cat].length : this.statistics.threatCats[cat].length;
            }

            this.statistics.threatCatsCountSorted = Object.keys(this.statistics.threatCatsCount).sort((a, b) => (this.statistics.threatCatsCount[b] - this.statistics.threatCatsCount[a]));
        }
        this.statistics.threatCountSorted = Object.keys(this.statdata).sort((a, b) => (this.statdata[b].threatCount - this.statdata[a].threatCount));
    }

    countTrades() {
        for (let species of this.species.values()) {
            if (this.testdata[species].trade && Object.keys(this.testdata[species].trade).length > 0) {
                for (let innerspecies of Object.keys(this.testdata[species].trade)) {
                    if (Array.isArray(this.testdata[species].trade[innerspecies])) {
                        getOrCreate(this.statdata, species, { tradeCount: 0 }).tradeCount = this.testdata[species].trade[innerspecies].length;
                        this.statistics.tradeCount = this.statistics.tradeCount + this.testdata[species].trade[innerspecies].length;

                        for (let trade of this.testdata[species].trade[innerspecies].values()) {
                            pushOrCreate(this.statistics.tradeUnits, trade.Unit, trade);
                            pushOrCreate(this.statistics.tradeQuants, trade.Unit, trade.Quantity);
                        }
                    }
                    else {
                        getOrCreate(this.statdata, species, { tradeCount: 0 }).tradeCount = 0;
                    }
                }
            }
            else {
                getOrCreate(this.statdata, species, { tradeCount: 0 }).tradeCount = 0;
            }
        }

        if (this.species.length > 0) {
            for (let cat of Object.keys(this.statistics.tradeUnits).values()) {
                this.statistics.tradeUnitsCount[cat] = this.statistics.tradeUnitsCount[cat] !== undefined ? this.statistics.tradeUnitsCount[cat] + this.statistics.tradeUnits[cat].length : this.statistics.tradeUnits[cat].length;
                this.statistics.tradeUnitsSum[cat] = this.statistics.tradeQuants[cat].reduce((accumulator, currentValue) => accumulator + currentValue);
            }

            this.statistics.tradeUnitsCountSorted = Object.keys(this.statistics.tradeUnitsCount).sort((a, b) => (parseInt(this.statistics.tradeUnitsCount[b]) - parseInt(this.statistics.tradeUnitsCount[a])));

            this.statistics.tradeSpeciesCountSorted = Object.keys(this.statdata).sort((a, b) => {
                return parseInt(this.statdata[b].tradeCount) - parseInt(this.statdata[a].tradeCount);
            });
        }
    }

    render() {
        if (this.hasRendered === false) {
            this.countSpecies();
            this.countSubspecies();
            this.countThreats();
            this.countTrades();
            this.hasRendered = true;
        }
        return (
            <div>
                <button onClick={() => {
                    for (let cat of Object.keys(this.statistics.tradeUnits).values()) {
                        this.statistics.tradeUnits[cat] = [this.statistics.tradeUnits[cat][0]];
                    }

                    for (let cat of Object.keys(this.statistics.threatCats).values()) {
                        this.statistics.threatCats[cat] = [this.statistics.threatCats[cat][0]];
                    }

                    let file = new Blob([JSON.stringify({ statdata: this.statdata, statistics: this.statistics, speciesKeys: this.speciesKeys }, null, 4)], { type: "application/json" });
                    let filename = "statdata.json";
                    if (window.navigator.msSaveOrOpenBlob) // IE10+
                        window.navigator.msSaveOrOpenBlob(file, filename);
                    else { // Others
                        let a = document.createElement("a"),
                            url = URL.createObjectURL(file);
                        a.href = url;
                        a.download = filename;
                        document.body.appendChild(a);
                        a.click();
                        setTimeout(function () {
                            document.body.removeChild(a);
                            window.URL.revokeObjectURL(url);
                        }, 0);
                    }
                }}>SAVE</button>
                <div>
                    <div className="column">
                        <h2>Species ({Object.keys(this.species).length}) ({Object.keys(this.statdata).length}) ({this.speciesKeys.length})</h2>
                        {
                            Object.keys(this.statdata).map(key => {
                                return (<div key={key + "species"}>
                                    <div key={key + "header"}>{key}</div>
                                </div>);
                            })
                        }
                    </div>
                </div>
                <div>
                    <h2>Threats</h2>
                    <div className="column">
                        <h3>Categories ({this.statistics.threatCount}):</h3>
                        {
                            this.statistics.threatCatsCountSorted.map(key => {
                                return (
                                    <div
                                        key={key + "threats"}
                                        className="statrow" >
                                        <div className="statleft">
                                            <div className="statbar"
                                                style={{
                                                    width:
                                                        scaleValue(
                                                            this.statistics.threatCatsCount[key],
                                                            [0, this.statistics.threatCatsCount[this.statistics.threatCatsCountSorted[0]]],
                                                            [0, 200]
                                                        )
                                                }}>
                                            </div>
                                        </div>
                                        {key}: {this.statistics.threatCatsCount[key]}
                                    </div>
                                );
                            })
                        }
                    </div>
                    <div className="column">
                        <h3>Threats ({this.statistics.threatCount}):</h3>
                        {
                            this.statistics.threatCountSorted.map(key => {
                                return (
                                    <div
                                        key={key + "threats"}
                                        className="statrow" >
                                        <div className="statleft">
                                            <div className="statbar"
                                                style={{
                                                    width:
                                                        scaleValue(
                                                            this.statdata[key].threatCount,
                                                            [0, this.statdata[this.statistics.threatCountSorted[0]].threatCount],
                                                            [0, 200]
                                                        )
                                                }}>
                                            </div>
                                        </div>
                                        {key}: {this.statdata[key].threatCount}
                                    </div>
                                );
                            })
                        }
                    </div>
                </div>
                <div>
                    <h2>Trades</h2>
                    <div className="column">
                        <h3>Units: ({this.statistics.tradeCount}):</h3>
                        {
                            this.statistics.tradeUnitsCountSorted.map(key => {
                                return (<div
                                    key={key + "trades"}
                                    className="statrow" >
                                    <div className="statleft" style={{ width: 500 }}>
                                        <div className="statbar"
                                            style={{
                                                width:
                                                    scaleValue(
                                                        this.statistics.tradeUnitsCount[key],
                                                        [0, this.statistics.tradeUnitsCount[this.statistics.tradeUnitsCountSorted[0]]],
                                                        [0, 500]
                                                    )
                                            }}>
                                        </div>
                                    </div>
                                    {key}: {this.statistics.tradeUnitsCount[key]}
                                </div>);
                            })
                        }
                    </div>
                    <div className="column">
                        <h3>Trade Species ({this.statistics.tradeCount}):</h3>
                        {
                            this.statistics.tradeSpeciesCountSorted.map(key => {
                                return (<div
                                    className="statrow"
                                    key={key + "tradeSpecies"}>
                                    <div className="statleft" style={{ width: 500 }}>
                                        <div className="statbar"
                                            style={{
                                                width:
                                                    scaleValue(
                                                        this.statdata[key].tradeCount,
                                                        [0, this.statdata[this.statistics.tradeSpeciesCountSorted[0]].tradeCount],
                                                        [0, 500]
                                                    )
                                            }}>
                                        </div>
                                    </div>
                                    {key}: {this.statdata[key].tradeCount}
                                </div>);
                            })
                        }
                    </div>
                </div>
            </div >
        );
    }
}

export default Statistics;