

const dataset = {
    preprocessor: (data, dsname, order) =>

        data.map(d => {

            var yr = d.Year;
            var mo = d.Monthnumber
            if (dsname === 'fiscal') {

              /*   if (mo = 12) {
                 yr = yr;
                 }
                 else {
                 yr = yr + 1
                 }*/
            }


            const date = new Date(Date.parse(d.Monthnumber + ' ' + d.Day + ' ' + yr))
          /*  if (dsname === 'fiscal') {
                const month = order['Month'][d.Monthnumber - 2]
                d.Month = month;
            }*/




            return {...d, _date: date}
        })



}


export default dataset
