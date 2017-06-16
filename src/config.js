
const weekday = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]
const current = new Date();

const dataset = {
    preprocessor: (data) => data.map(d => {
        const date = new Date(Date.parse(d.Month + ' ' + d.Day + ' ' + d.Year))
        return {...d, _date: date, Day: weekday[date.getDay()]}
    })

}


export default dataset
