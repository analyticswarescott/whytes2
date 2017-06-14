import {lightBlueA400, lightGreenA400, deepOrangeA400} from 'material-ui/styles/colors'

const extractValue = (v, value) =>
    (value.group !== null && value.filter !== null)
        ? (v[value.group] === value.filter) ? +v[value.measure] || 0 : 0
        : +v[value.measure] || 0


const roundValue = (value) => Math.round(value * 100) / 100

/**
 * Crossfilter group reducer
 *
 * @param  {String} dimension
 * @param  {Object} value1
 * @param  {Object} value2
 * @return {Object}
 */
export const groupReducer = (dimension, value1, value2) => {
    return {
        add: (p, v) => {
            p.value1 = roundValue(p.value1 + extractValue(v, value1))
            p.value2 = roundValue(p.value2 + extractValue(v, value2))
            return p
        },
        remove: (p, v) => {
            p.value1 = roundValue(p.value1 - extractValue(v, value1))
            p.value2 = roundValue(p.value2 - extractValue(v, value2))
            return p
        },
        init: () => ({ value1: 0, value2: 0 }),
        toString: () => JSON.stringify({ dimension, value1, value2 })
    }
}



/**
 * Chart dataset reducer
 *
 * @param  {String} k1 first value in comparison
 * @param  {String} k2 second value in comparison
 * @return {Function}
 */
export const chartReducer = (k1, k2) => (d) => d.reduce((result, item) => {
    result.keys.push(item.key)

    const { value1, value2 } = item.value

    result.sets[0].push({
        key   : item.key,
        value : value1,
        label : addCommas(value1.toFixed(0)),
        fill  : lightBlueA400

    })
    result.sets[1].push({
        key   : item.key,
        value : value2,
        label : addCommas(value2.toFixed(0)),
        fill  : value1 < value2 ?  lightGreenA400 : (value1 > value2) ? deepOrangeA400 : lightBlueA400
    })

    return result
}, { keys: [], sets: [[], []]})


export function addCommas(nStr) {
    nStr += '';
    var x = nStr.split('.');
    var x1 = x[0];
    var x2 = x.length > 1 ? '.' + x[1] : '';
    var rgx = /(\d+)(\d{3})/;
    while (rgx.test(x1)) {
        x1 = x1.replace(rgx, '$1' + ',' + '$2');
    }
    return x1 + x2;
}

export function     getIndex (v1,v2, places)  {
    var ret;
    var index;
    //index = parseFloat(datasets2[1][d - 1].value) / parseFloat(datasets[1][d - 1].value) * 100;
    index = (parseFloat(v2) - parseFloat(v1))/parseFloat(v1) * 100;
    //parseFloat(datasets[1][d - 1]);

    var neg = 0;
    if (v2 < v1) {
       neg = 1;
    }

    if (index > 100) {
        ret = index.toPrecision(2+places+neg);
    }
    else if (index > 10) {
        ret = index.toPrecision(1+places+neg);
    }
    else {
        ret = index.toPrecision(0 + places+neg);
    }

    if (v2 > v1) {
        ret = "+" + ret;
    }
    return addCommas(ret);
}
