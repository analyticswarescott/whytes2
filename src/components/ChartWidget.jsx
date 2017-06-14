import React, { Component, PropTypes } from 'react'
import { Toolbar, ToolbarGroup } from 'material-ui/Toolbar';
import Select from '../components/Select'
import {groupReducer, chartReducer} from '../helpers/comparison'
import Table from '../components/Table';
import Totals from '../components/Totals';
import { withRouter } from 'react-router'

import {getIndex} from '../helpers/comparison'
import {addCommas} from '../helpers/comparison'

import {lightBlueA400, lightGreenA400, deepOrangeA400} from 'material-ui/styles/colors'
import {
    VictoryBar,
    VictoryChart,
    VictoryAxis,
    VictoryTheme,
    VictoryGroup,
    VictoryContainer,
    VictoryLabel,
    VictoryTooltip
} from 'victory'

const groupAll = 'All'
const defaultDimension = 'Month'
const defaultValue1 = { measure: 'Gross_Sales', group : 'Year', options: [], filter: '2016' }
const defaultValue2 = { measure: 'Gross_Sales', group : 'Year', options: [], filter: '2017' }

const getOptions = (dimension) => {
    const group = dimension.group()
    const value = group.all().map(r => r.key)

    group.dispose()

    return value
}

const hasValues =() => {
    return true
}

const axisStyle = {
    axis: {stroke: "#242632"},
    axisLabel: {fontSize: 16, padding: 20, fill: 'red'},
    grid: {stroke: "#242632"},
    ticks: {stroke: "grey"},
    tickLabels: {fontSize: 10, padding: 5, color: '#fff', zIndex: 999}
}
class ChartWidget extends Component {
    constructor(props) {
        super(props)

        this.dimGroup = null
        this.allGroup = null

        this.state = {
            value1    : { measure: null, group: null, options: [], filter: null },
            value2    : { measure: null, group: null, options: [], filter: null },
        }
    }

    componentWillMount() {
        this.allGroup = this.props.data.dimensions._all.group()
        this.componentWillReceiveProps(this.props)
    }

    componentWillUnmount() {
        this.allGroup.dispose()
    }

    componentWillReceiveProps(props) {
        const { data, params, location, dimension, filter } = props

       // console.log("===== Widget PROPS ==========")
       // console.log(props);


     /*   if (dimension !== this.state.dimension) {
            if (this.dimGroup) {
                this.dimGroup.dispose()
            }

        }*/

        if (this.dimGroup) {
            this.dimGroup.dispose()
        }
        this.dimGroup = data.dimensions[this.props.dimension].group()

        let { value1, value2 } = location.query

        value1 = (value1) ? JSON.parse(value1) : defaultValue1
        value2 = (value2) ? JSON.parse(value2) : defaultValue2

        if (value1.group && value1.group === groupAll) {
            value1.group = null
            value1.filter = null
        }

        if (value2.group && value2.group === groupAll) {
            value2.group = null
            value2.filter = null
        }
        value1.options = (value1.group)
            ? (value1.group !== this.state.value1.group)
                ? getOptions(data.dimensions[value1.group])
                : this.state.value1.options
            : []


        value2.options = (value2.group)
            ? (value2.group !== this.state.value2.group)
                ? getOptions(data.dimensions[value2.group])
                : this.state.value2.options
            : []

        this.setState({
            ...this.state,
            value1,
            value2
        })
    }

    onDimensionChange     = (e, i, v) => this.update({ ...this.state, dimension: v })
    onValue1MeasureChange = (e, i, v) => this.update({ ...this.state, value1: { ...this.state.value1, measure: v } })
    onValue1GroupChange   = (e, i, v) => this.update({ ...this.state, value1: { ...this.state.value1, group:   v } })
    onValue1FilterChange  = (e, i, v) => this.update({ ...this.state, value1: { ...this.state.value1, filter:  v } })
    onValue2MeasureChange = (e, i, v) => this.update({ ...this.state, value2: { ...this.state.value2, measure: v } })
    onValue2GroupChange   = (e, i, v) => this.update({ ...this.state, value2: { ...this.state.value2, group:   v } })
    onValue2FilterChange  = (e, i, v) => this.update({ ...this.state, value2: { ...this.state.value2, filter:  v } })

    update = (items) => {
        const { location, router } = this.props
        const { dimension, value1, value2 } = items

        if (dimension) {
            router.push({
                pathname: '/comparison/' + dimension,
                query: {
                    ...location.query,
                    value1: JSON.stringify({
                        measure: value1.measure,
                        group  : value1.group,
                        filter : value1.filter
                    }),
                    value2: JSON.stringify({
                        measure: value2.measure,
                        group  : value2.group,
                        filter : value2.filter
                    })

                }
            })
        }
    }

    onClickHandler = (e, i, v) => {

        console.log(" ========== ChartWidget handling click");


        const filter = i.data[v].key
        const { filters, filterHandler } = this.props.filter
        const { dimension }  = this.props

        if (!Array.isArray(filters[dimension] || null)) {
            filters[dimension] = []
        }

        if (!Array.isArray(filters[dimension][0] || null)) {
            filters[dimension][0] = []
        }

        const index = filters[dimension][0].indexOf(filter)

        if (index > -1) {
            filters[dimension][0].splice(index, 1)
        } else {
            filters[dimension][0].push(filter)
        }

        filterHandler(dimension, filters[dimension])
    }

    render() {
        const { data, params, filter, dimension, top, horizontal, h, w } = this.props

        console.log(dimension);

        const {  value1, value2 } = this.state;

        const value = (v) => v.toFixed(2).replace(/(\d)(?=(\d{3})+\.)/g, '$1,')
        let chartSet1 = []
        let chartSet2 = []
        let tableSet = []
        let totalSet = []

        let dimGroup1 = {}
        let dimGroup2 = {}
        let dimOrder  = data.order.hasOwnProperty(dimension) ? data.order[dimension] : null

        if (dimension && value1.measure && value2.measure) {
            const g1Reducer = groupReducer(dimension, value1, value2)
            const g2Reducer = groupReducer(null, value1, value2)


            dimGroup1 = this.dimGroup.reduce(g1Reducer.add, g1Reducer.remove, g1Reducer.init).order(d => d.value1)
            dimGroup2 = this.allGroup.reduce(g2Reducer.add, g2Reducer.remove, g2Reducer.init).order(d => d.value1)

            const cReducer = chartReducer(value1.filter, value2.filter)

            var takeTop;
            if (top) {takeTop = top} else {takeTop = 15;}

            chartSet1 = cReducer(dimGroup1.top(takeTop))
            chartSet2 = dimGroup2.all().reduce((k, v) => {
                k[0].value += +v.value.value1 || 0
                k[1].value += +v.value.value2 || 0
                return k
            }, [
                {key: (value1.filter && value1.filter !== value2.filter ? value1.filter : value1.measure), value: 0},
                {key: (value2.filter && value2.filter !== value1.filter ? value2.filter : value2.measure), value: 0}
            ])

            chartSet2[0]['label'] = value(chartSet2[0].value)
            chartSet2[0]['fill']  =  lightBlueA400
            chartSet2[1]['label'] = value(chartSet2[1].value)
            chartSet2[1]['fill']  = chartSet2[0].value < chartSet2[1].value ? lightGreenA400 : (chartSet2[0].value > chartSet2[1].value) ? deepOrangeA400 : lightBlueA400
            chartSet1.sets = chartSet1.sets.map(s => s.map(d => {
                if (filter.filters.hasOwnProperty(dimension)) {
                    const filters = filter.filters[dimension][0] || []

                    if (filters.length && filters.indexOf(d.key) < 0) {
                        d.fill = '#2a2c3a'
                    }}

                return d
            }))


            tableSet = dimGroup1.top(Infinity).map(i => ({
                key: i.key,
                value: {
                    ...i.value,
                    sum: i.value.value2 - i.value.value1,
                    percentage:  Math.round((((i.value.value1 - i.value.value2) / i.value.value1) * 100) * -1)
                }
            }))

            if (filter.filters.hasOwnProperty(dimension)
                && Array.isArray(filter.filters[dimension])
                && Array.isArray(filter.filters[dimension][0])
            ) {
                tableSet = tableSet.filter((row) => filter.filters[dimension][0].indexOf(row.key) > -1)
            }


            totalSet = tableSet.reduce((k, v) => {
                return {
                    value1: k.value1 + +v.value.value1 || 0,
                    value2: k.value2 + +v.value.value2 || 0,
                    sum: k.sum + (v.value.value2 - v.value.value1)
                }
            }, { value1: 0, value2: 0, sum: 0})

            const order = data.order.hasOwnProperty(dimension)
                ? data.order[dimension]
                : null

            if (order) {
                chartSet1.keys = order
                chartSet1.sets = chartSet1.sets.map(s => s.sort((a, b) => {
                    return order.indexOf(a.key) - order.indexOf(b.key)
                }))
            }


        }

        const groupOptions = [
            groupAll,
            ...Object.keys(data.dimensions).filter(k => k.substring(0, 1) !== '_')
        ]
        if (horizontal) {

            /*chartSet1.sets = chartSet1.sets.map(s => s.sort((a, b) => {
                return b.value < a.value
            }))*/
            return (

                <div className="chart comparison" style={{width: w}}>
                    <VictoryChart
                        padding={{left:240, top:40}}
                        height={h}
                        width={w}
                        containerComponent={<VictoryContainer responsive={false}/>}
                        theme={VictoryTheme.material}>
                        {/*<VictoryAxis
                            style={axisStyle}
                            tickLabelComponent={<VictoryLabel className='axis' angle={20}/>}
                            tickValues={chartSet1.keys}/>
                        <VictoryAxis
                            tickLabelComponent={<VictoryLabel className='axis'/>}
                            style={axisStyle}
                            offsetX={30}
                            dependentAxis
                            tickFormat={(x) => (x >= 1000000) ? (`${x / 1000000}m`) : (`${x / 1000}k`)}/>*/}

                        <VictoryAxis
                            style={axisStyle}
                            offsetX={240}

                            dependentAxis
                          //  tickValues={chartSet1.sets[0].keys}
                            tickCount={takeTop}
                            tickLabelComponent={<VictoryLabel style={{fontSize: 10, padding: 5, color: '#fff', zIndex: 999}} text={
                                function(d) {
                                    return chartSet1.sets[0][d - 1].key;
                                }
                            } angle={0} /> }
                        />
                        <VictoryAxis
                            style={axisStyle}
                            offsetY={40}
                            tickFormat={(y) => (y >= 1000000) ? (`${y / 1000000}m`): (`${y / 1000}k`)}
                            orientation={"top"}
                        />


                        <VictoryGroup
                            horizontal
                            offsetY={120}
                            animate={{duration: 500, delay:0}}
                            colorScale={"warm"} offset={14}
                            style={{data: {width: 14}}}>
                            <VictoryBar
                                name={'value-1'}
                                x={(d) => d.key}
                                y={(d) => d.value}
                                labelComponent={<VictoryTooltip x={240}  style={{color: '#fff'}}
                                                                flyoutStyle={{fill: '#1c1f28'}}
                                text={
                                    function(d) {
                                        return d.y.toFixed(0);
                                    }
                                }
                                />}
                                data={chartSet1.sets[0]}
                                events={[{
                                    target: "data",
                                    eventHandlers: {
                                        onClick: this.onClickHandler
                                    }
                                }]}/>
                            <VictoryBar
                                name={'value-2'}
                                x={(d) => d.key}
                                y={(d) => d.value}
                                labelComponent={<VictoryTooltip x={240}  style={{color: '#fff'}}
                                                                flyoutStyle={{fill: '#1c1f28'}}

                                text={
                                    function(d) {
                                        return addCommas(d.y.toFixed(0)) + "  " + getIndex(chartSet1.sets[0][d.eventKey].value, chartSet1.sets[1][d.eventKey].value, 1) + '%';
                                    }
                                }

                                />}
                                data={chartSet1.sets[1]}
                                events={[{
                                    target: "data",
                                    eventHandlers: {
                                        onClick: this.onClickHandler
                                    }
                                }]}/>
                        </VictoryGroup>
                    </VictoryChart>
                </div>
            )
        } else {
            return (

                <div className="chart comparison">
                    <VictoryChart
                        padding={{top:8, bottom:27, left:24, right: 10}}
                        height={h}
                         width={w}
                        containerComponent={<VictoryContainer responsive={false}/>}
                        theme={VictoryTheme.material}>
                        <VictoryAxis
                            style={axisStyle}
                            tickLabelComponent={<VictoryLabel className='axis' angle={20}/>}
                            tickValues={chartSet1.keys}/>
                        <VictoryAxis
                            tickLabelComponent={<VictoryLabel className='axis'/>}
                            style={axisStyle}
                            offsetX={30}
                            dependentAxis
                            tickFormat={(x) => (x >= 1000000) ? (`${x / 1000000}m`) : (`${x / 1000}k`)}/>
                        <VictoryGroup
                            animate={{ delay:0}}
                            colorScale={"warm"} offset={15}
                            style={{data: {width: 15}}}>
                            <VictoryBar
                                name={'value-1'}
                                x={(d) => d.key}
                                y={(d) => d.value}
                                labelComponent={<VictoryTooltip dy={-30} style={{color: '#fff'}}
                                                                flyoutStyle={{fill: '#1c1f28'}}/>}
                                data={chartSet1.sets[0]}
                                events={[{
                                    target: "data",
                                    eventHandlers: {
                                        onClick: this.onClickHandler
                                    }
                                }]}/>
                            <VictoryBar
                                name={'value-2'}
                                x={(d) => d.key}
                                y={(d) => d.value}
                                labelComponent={<VictoryTooltip dy={-30} style={{color: '#fff'}}
                                                                flyoutStyle={{fill: '#1c1f28'}}
                                text={
                                    function(d) {
                                        return  addCommas(d.y.toFixed(0)) + "  " + getIndex(chartSet1.sets[0][d.eventKey].value, chartSet1.sets[1][d.eventKey].value, 1) + '%';
                                    }
                                }

                                />}
                                data={chartSet1.sets[1]}
                                events={[{
                                    target: "data",
                                    eventHandlers: {
                                        onClick: this.onClickHandler
                                    }
                                }]}/>
                        </VictoryGroup>
                    </VictoryChart>
                </div>
            )
        }

    }
}

ChartWidget.propTypes = {
    dimension : PropTypes.string.isRequired,
    top : PropTypes.number,
    h : PropTypes.number,
    w: PropTypes.number,
    horizontal: PropTypes.bool,
    data : PropTypes.shape({
        dimensions: PropTypes.object.isRequired,
        measures  : PropTypes.array.isRequired
    })/*.isRequired (breaks because of react-router)*/,
    filter: PropTypes.shape({
        filters: PropTypes.object.isRequired,
        filterHandler: PropTypes.func.isRequired
    })/*.isRequired*/,
    params: PropTypes.object.isRequired,
    location: PropTypes.shape({
        query: PropTypes.object.isRequired
    }).isRequired,
    router: PropTypes.object.isRequired
}

export default  withRouter( ChartWidget)
