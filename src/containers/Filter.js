import React, { Component, PropTypes } from 'react'
import { withRouter } from 'react-router'
import { applyFilters } from '../helpers/filter'


class Filter extends Component {
    componentWillMount() {

        this.updateHandler(null, this.props)
    }

    componentWillReceiveProps(props) {
        this.updateHandler(this.props, props)
    }


    updateHandler = (oldProps, newProps) => {

       // console.log(newProps)

        let oldFilters = (oldProps)
            ? oldProps.location.query.filters || null
            : null

        let newFilters = (newProps) ? newProps.location.query.filters || null : JSON.stringify(newProps.data.default_filters)

        if (!newFilters) {
            newFilters = JSON.stringify(newProps.data.default_filters)

        }

       // console.log(newFilters)

        if (oldFilters === newFilters) {
            return
        }

        oldFilters = JSON.parse(oldFilters || '{}')
        newFilters = JSON.parse(newFilters || '{}')

        if (newFilters._date && Array.isArray(newFilters._date)) {
            newFilters._date[0] = new Date(newFilters._date[0])
            newFilters._date[1] = new Date(newFilters._date[1])
        }



        var x =  applyFilters(newProps.data.dsname ,newProps.data.dimensions, oldFilters, newFilters)
        //console.log(" FILTERS APPLIED ")
        //console.log(x)


        const { pathname, query } = this.props.location

        this.props.router.push({
            pathname: pathname,
            query: {
                ...query,
                filters: JSON.stringify(newFilters)
            }
        })


    }

    clearHandler = () => {
        const { pathname, query } = this.props.location
        this.props.router.push({
            pathname: pathname,
            query: {
                ...query,
                filters: null,
            }
        })
    }

    filterHandler = (dimension, value) => {


        console.log(" FILTER HANDLER FIRED ========= >>> ");
        //console.log(dimension);
        console.log(value);

        const { pathname, query } = this.props.location

        const filters = JSON.parse(query.filters || '{}')

        if (value === null
            || (Array.isArray(value) && value.length === 0)
            || (Array.isArray(value[0]) && value[0].length === 0)
        ) {
            if (filters.hasOwnProperty(dimension)) {
                delete filters[dimension]
            }
        } else {
            filters[dimension] = value
        }

        this.props.router.push({
            pathname: pathname,
            query: {
                ...query,
                filters: JSON.stringify(filters)
            }
        })
    }

    render() {
        const filters = JSON.parse(this.props.location.query.filters || '{}')



        return (
            <div className="filter">
            {React.Children.map(
                this.props.children,
                child => React.cloneElement(child, {
                    ...this.props,
                    ...child.props,
                    filter: {
                        filters: filters,
                        filterHandler: this.filterHandler,
                        clearHandler: this.clearHandler
                    }
                })
            )}
            </div>
        )
    }
}

Filter.propTypes = {
    data: PropTypes.shape({
        dimensions: PropTypes.object.isRequired
    }).isRequired,
    location: PropTypes.shape({
        query: PropTypes.object.isRequired
    }).isRequired
}

export default withRouter(Filter)
