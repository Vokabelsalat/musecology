import React, { Component } from 'react';
import Orchestra from './Orchestra';

class DataTable extends Component {
    constructor(props) {
        super(props);
    }

    render() {
        return (
            <table id="datatableorchestra" style={{ width: "90%" }}>
                <thead>
                    <tr>
                        <td>Material</td>
                        <td>Species</td>
                        <td>Synonyms</td>
                        <td>IUCN</td>
                        <td>BGCI Threats</td>
                        <td>Cites Trade</td>
                        <td>GBIF Trees</td>
                    </tr>
                </thead>
                <tbody>
                    {
                        Object.keys(this.props.data).map(key => (
                            <tr key={key + "entry"}>
                                <td>
                                    <div className="tableCell">
                                        <div className="scroll">{
                                            (this.props.data[key].material !== undefined ? this.props.data[key].material.map((e, i) => (
                                                <span key={i}>
                                                    <div>
                                                        <b>{e["Trade_name"]}</b> <br />
                                                        {e["Main_part"] !== "" &&
                                                            <div>&#8226; {e["Main_part"]}</div>
                                                        }
                                                        {e["Subpart"] !== "" &&
                                                            <div>&#8226; {e["Subpart"]}</div>
                                                        }
                                                    </div>
                                                </span>
                                            )
                                            ) : "")
                                        }</div>
                                    </div>
                                </td>
                                <td>
                                    <div className="tableCell">
                                        <div className="scroll">{
                                            (this.props.data[key].species !== undefined ? Object.keys(this.props.data[key].species).map((e, i) => (
                                                <div key={i}>
                                                    {e}
                                                </div>
                                            )
                                            ) : "")
                                        }</div>
                                    </div>
                                </td>
                                <td>
                                    <div className="tableCell">
                                        <div className="scroll">{
                                            (this.props.data[key].synonyms !== undefined ? Object.keys(this.props.data[key].synonyms).map((e, i) => (
                                                <span key={i}>
                                                    <div>
                                                        <b>{e}</b>
                                                        {
                                                            [...new Set(this.props.data[key].synonyms[e].map(subelement => subelement["canonicalName"]))].map((subelement, subi) => (
                                                                <span key={subi}>
                                                                    <div>
                                                                        &#8226; {subelement}
                                                                    </div>
                                                                </span>
                                                            ))
                                                        }
                                                    </div>
                                                </span>
                                            )
                                            ) : "")
                                        }</div>
                                    </div>
                                </td>
                                <td>
                                    <div className="tableCell">
                                        <div className="scroll">{
                                            (this.props.data[key].iucn !== undefined ? Object.keys(this.props.data[key].iucn).map((e, i) => (
                                                <span key={i}>
                                                    <div>
                                                        <b>{e}</b>
                                                        {
                                                            this.props.data[key].iucn[e].map((subelement, subi) => (
                                                                <span key={subi}>
                                                                    <div>
                                                                        &#8226; {subelement["category"]} ({subelement["year"]})
                                                                        </div>
                                                                </span>
                                                            ))
                                                        }
                                                    </div>
                                                </span>
                                            )
                                            ) : "")
                                        }</div>
                                    </div>
                                </td>
                                <td>
                                    <div className="tableCell">
                                        <div className="scroll">{
                                            /*                                             (this.props.threatData[key] !== undefined ? this.props.threatData[key].map((e, i) => (
                                                                                            <span key={i}>
                                                                                                <div>
                                                                                                    &#8226; {e.consAssCategory} - {e.assessmentYear} - {e.threatened} - {e.reference} - {(e.countries ? " - " + e.countries : "")}
                                                                                                </div>
                                                                                            </span>
                                                                                        )
                                                                                        ) : "") */
                                            (this.props.data[key].threats !== undefined && Array.isArray(this.props.data[key].threats) ? this.props.data[key].threats.map((e, i) => (
                                                <span key={i}>
                                                    <div>
                                                        &#8226; {e.consAssCategory} - {e.assessmentYear} - {e.threatened} - {e.reference} - {(e.countries ? " - " + e.countries : "")}
                                                    </div>
                                                </span>
                                            )
                                            ) : "")
                                        }</div>
                                    </div>
                                </td>
                                <td>
                                    <div className="tableCell">
                                        <div className="scroll">{
                                            (this.props.data[key].trade !== undefined ? Object.keys(this.props.data[key].trade).map((subkey) => (
                                                <span key={subkey}>
                                                    {
                                                        this.props.data[key].trade[subkey].length
                                                    /*  {this.props.tradeData[key][subkey].map((e, i) => (
                                                         <span key={i}>
                                                             <div>
                                                                 &#8226; {e.Year} - {e.Term}
                                                             </div>
                                                         </span>
                                                     )
                                                     )} */}
                                                </span>
                                            )
                                            ) : "")
                                        }</div>
                                    </div>
                                </td>
                                <td>
                                    <div className="tableCell">
                                        <div className="scroll">{
                                            (this.props.data[key].trees !== undefined ? this.props.data[key].trees.map((e, i) => (
                                                <div key={i}>
                                                    <b>{e.taxon}</b>
                                                    {e.TSGeolinks.map((subelement, subi) => (
                                                        <div key={subi}>
                                                            {subelement.country ? (subelement.province ? subelement.province + "/" + subelement.country : subelement.country) : ""}
                                                        </div>
                                                    )
                                                    )}
                                                </div>
                                            )
                                            ) : "")
                                        }</div>
                                    </div>
                                </td>
                            </tr>
                        ))
                    }
                </tbody>
            </table>
        );
    }
}

export default DataTable;