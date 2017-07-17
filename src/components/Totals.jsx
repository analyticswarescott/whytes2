import React, { Component } from 'react'
import {addCommas, intToString, getIndex} from '../helpers/comparison'

class Totals extends Component {
	render() {
        const { value1, value2 } = this.props
        const sum        = value2 - value1
       // const percentage = Math.round((((value1 - value2) / value1) * 100) * -1)
        const percentage = getIndex(value1, value2, 1);

        const value = (v) => addCommas(v)

		return (
			<div className="row totals">
              	<div className="col-sm-2"> Totals </div>
                <div className="col-sm-2"> { value(value1) }</div>
                <div className="col-sm-3"> { value(value2) }</div>
                <div className="col-sm-2"> { value(sum) }</div>
                <div className="col-sm-2"> { percentage + ' %'} </div>
        </div>)
	}
}

export default Totals
