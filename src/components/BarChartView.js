import React, { Component } from 'react';
import BarChart from './BarChart';
import { getThreatColor } from "../utils/utils";
import { getCitesColor, getIucnColor } from '../utils/timelineUtils';

class BarChartView extends Component {
    constructor(props) {
        super(props);
        this.state = {
            id: this.props.id,
            data: this.props.data,
            showIcons: this.props.showIcons
        };
    }

    componentDidMount() {
    }

    componentDidUpdate(prevProps) {
        if (JSON.stringify(this.props) !== JSON.stringify(prevProps)) {
            this.setState({ ...this.props });
        }
    }

    render() {
        let maxValue = 0;
        for (let cat of Object.values(this.state.data)) {
            maxValue = Math.max(maxValue, ...cat.map(e => e.hasOwnProperty("group") ? e.sum : e.value));
        }

        let showIcons = this.state.showIcons;

        return (
            <div id={this.state.id} style={{ display: "inline-block" }}>
                {/* { <BarChart id="citesBars" text={"Cites"} data={this.state.data["cites"]} colorFunction={getCitesColor} maxValue={maxValue}></BarChart>
                <BarChart id="iucnBars" text={"IUCN"} data={this.state.data["iucn"]} colorFunction={getIucnColor} maxValue={maxValue}></BarChart>
                <BarChart id="threatBars" text={"BGCI"} data={this.state.data["threat"]} colorFunction={getThreatColor} maxValue={maxValue}></BarChart>
                <BarChart id="citesGroupedBars" text={"Cites"} grouped={true} data={this.state.data["citesGrouped"]} colorFunction={getCitesColor} maxValue={maxValue}></BarChart>
                <BarChart id="iucnGroupedBars" text={"IUCN"} grouped={true} data={this.state.data["iucnGrouped"]} colorFunction={getIucnColor} maxValue={maxValue}></BarChart>
                <BarChart id="threatGroupedBars" text={"BGCI"} grouped={true} data={this.state.data["threatGrouped"]} colorFunction={getThreatColor} maxValue={maxValue}></BarChart>} */}
                <BarChart id="overallGroupedBars" text={"Overall"} grouped={true} data={this.state.data["overAllGrouped"]} colorFunction={{ "threat": getThreatColor, "cites": getCitesColor, "iucn": getIucnColor }} maxValue={maxValue} showIcons={showIcons}></BarChart>
            </div>
        );
    }
}

export default BarChartView;