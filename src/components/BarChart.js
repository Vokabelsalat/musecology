import React, { Component } from 'react';
import BarChartHelper from './BarChartHelper';
import '../utils/utils';

class BarChart extends Component {
    constructor(props) {
        super(props);
        this.state = {
            id: this.props.id,
            data: this.props.data,
            colorFunction: this.props.colorFunction,
            maxValue: this.props.maxValue,
            grouped: this.props.grouped,
            text: this.props.text,
            showIcons: this.props.showIcons
        };
    }

    componentDidMount() {
        BarChartHelper.draw({
            id: this.state.id,
            data: this.state.data,
            colorFunction: this.state.colorFunction,
            maxValue: this.state.maxValue,
            grouped: this.state.grouped,
            text: this.state.text,
            showIcons: this.state.showIcons
        });
    }

    componentDidUpdate() {
        BarChartHelper.draw({
            id: this.state.id,
            data: this.props.data,
            colorFunction: this.state.colorFunction,
            maxValue: this.props.maxValue,
            grouped: this.props.grouped,
            text: this.props.text,
            showIcons: this.props.showIcons
        });
    }

    render() {
        return (
            <div id={this.state.id} style={{ display: "inline-block" }}></div>
        );
    }
}

export default BarChart;