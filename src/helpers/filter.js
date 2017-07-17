const DATE_DIMENSION = '_date'

/**
 * Create terms filter
 *
 * @param  {Array}    terms
 * @return {Function}
 */
export const createTermsFilter = (terms) => {
    return (d) => terms.indexOf(d) !== -1
}

/**
 * Create date filter
 *
 * @param  {Date}     toDate
 * @return {Function}
 */

export const createDateFilter = (dsname, fromDate, toDate, isYtd) => {

    //console.log(" creating date filter for ds " + dsname)
    if (isYtd) {
        var d = new Date()

        var year = d.getFullYear();
        var month = d.getMonth();
        var day = d.getDate();

        if (dsname === 'fiscal') {
            //console.log('fiscal for curr month ' + month)


            month = month -1
            year = year + 1
         }

        var c = new Date(year, month, 2)

        //console.log(c)
        toDate = c;

    }



    var i =0;
    var j =0;
    return (!isYtd) ?
        [ fromDate, toDate ]
        : (d) => {

            const toMonth = toDate.getMonth()
            var ret

            if (d.getFullYear() > toDate.getFullYear()) {
                return false
            }


            var month = d.getMonth()

            if (month <= toMonth) {

                ret =  (month < toMonth
                    || d.getDate() <= toDate.getDate()
                )
            }
            else {
                ret = false
            }


            return ret
        }
}

export const applyFilters = (dsname, dimensions, oldFilters, newFilters) => {

   // console.log(" applyFilters applying: ====")
   // console.log(oldFilters)
    //console.log(newFilters)

    Object.keys(dimensions).forEach(d => {
        const oldFilter = JSON.stringify(oldFilters[d] || {})
        const newFilter = JSON.stringify(newFilters[d] || {})

        if (oldFilter === newFilter) {
            return
        }

        const dimension = (d === DATE_DIMENSION) ? dimensions[d].object : dimensions[d]
        dimension.filterAll()

        if (oldFilters.hasOwnProperty(d) && !newFilters.hasOwnProperty(d)) {

            return
        }

        let filter = newFilters[d]

        if (Array.isArray(filter)) {
            if (d === DATE_DIMENSION) {

                filter = createDateFilter(dsname, ...filter)

               // console.log("DATE FILTER CREATED")
              //  console.log(filter)

            } else if (Array.isArray(filter[0])) {
                filter = createTermsFilter(filter[0])
            }


        }

        dimension.filter(filter)
    })

    return newFilters
}
