import React, { Component } from 'react';
import Timeline from './Timeline.js';
import Legend from './Legend.js';
import { TimelineDatagenerator } from '../utils/TimelineDatagenerator'
import timelinedata from '../data/timelinedata.json'

class TimelineView extends Component {
    constructor(props) {
        super(props);
        let generator = new TimelineDatagenerator();
        generator.processData(timelinedata);

        let tmpdata = generator.getData();
        let maxPerYear = Math.max(...Object.values(tmpdata).map(e => e.timeThreat.length > 0 ? e.timeThreat[0].maxPerYear : 0));

        this.state = {
            zoomLevel: 0,
            maxZoomLevel: 2,
            sourceColorMap: generator.getSourceColorMap(),
            data: tmpdata,
            maxPerYear: maxPerYear,
            domainYears: generator.getDomainYears(),
            pieStyle: "bar"
        };

    }

    /*     callAPI() {
            fetch("http://localhost:9000/api")
                .then(res => res.text())
                .then(res => this.setState({ apiResponse: res }));
        }
    
        componentDidMount() {
            this.callAPI();
        } */

    setZoomLevel(setValue) {
        this.setState({ zoomLevel: setValue });
    }

    onZoom(add) {
        let zoomLevel = this.state.zoomLevel + add;
        zoomLevel = Math.min(zoomLevel, this.state.maxZoomLevel);
        zoomLevel = Math.max(zoomLevel, 0);

        this.setZoomLevel(zoomLevel);
    }

    setPieStyle(setValue) {
        this.setState({ pieStyle: setValue });
    }

    onPieStyle(style) {
        this.setPieStyle(style);
    }

    render() {
        return (
            <div>
                <Legend
                    onZoom={() => this.onZoom(1)}
                    onZoomOut={() => this.onZoom(-1)}
                    zoomLevel={this.state.zoomLevel}
                    maxZoomLevel={this.state.maxZoomLevel}
                    onPieStyle={this.onPieStyle.bind(this)}
                    pieStyle={this.state.pieStyle}
                />
                <br />
                <Timeline
                    key={"scaleToptimeline"}
                    data={null}
                    speciesName={"scaleTop"}
                    sourceColorMap={this.state.sourceColorMap}
                    domainYears={this.state.domainYears}
                    zoomLevel={this.state.zoomLevel}
                />
                <div> {
                    Object.keys(this.state.data).map(e => {
                        return (
                            <Timeline
                                key={e + "timeline"}
                                data={this.state.data[e]}
                                speciesName={e}
                                sourceColorMap={this.state.sourceColorMap}
                                domainYears={this.state.domainYears}
                                zoomLevel={this.state.zoomLevel}
                                maxPerYear={this.state.maxPerYear}
                                pieStyle={this.state.pieStyle}
                            />
                        )
                    })
                } </div>
                <Timeline
                    key={"scaleBottomtimeline"}
                    data={null}
                    speciesName={"scaleBottom"}
                    sourceColorMap={this.state.sourceColorMap}
                    domainYears={this.state.domainYears}
                    zoomLevel={this.state.zoomLevel}
                />
            </div>
        );
    }
}

export default TimelineView;