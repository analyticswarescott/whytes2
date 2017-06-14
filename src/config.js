
const weekday = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]
const current = new Date();

const dataset = {
    url : '/blissbi_day_Q_A_M.csv?' + current.getFullYear() + current.getMonth() + current.getDate(),
    dimensions: ['Year', 'Month', 'Day', 'Manager', 'Brand', 'Region', 'Category', 'Customer', 'Article', 'Division'],
    measures: ['Gross_Sales', 'Gross_Margin', 'Netto_Sales', 'Quantity','Budget_Gross_Sales','Budget_Gross_Margin'],
    order: {
        Month: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
        Day: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
    },
    preprocessor: (data) => data.map(d => {
        const date = new Date(Date.parse(d.Month + ' ' + d.Day + ' ' + d.Year))
        return { ...d, _date: date, Day: weekday[date.getDay()] }
    })
}


export default dataset
