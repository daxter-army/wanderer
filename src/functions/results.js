const haversine_distance = require('../functions/haversine')
const chalk = require('chalk')

var final_results = (lat_from, lon_from, coords) => {
    var distance = []
    var within_boundary = []
    var position = []

    for(var i=0; i<coords.lat.length; i++){
        
        // Calculating Haversine Distance
        var h_d = haversine_distance(lat_from, lon_from, coords.lat[i], coords.lon[i])
        if( h_d == null)
            continue
        
        console.log(chalk.blue("(lat_from_seach, lon_from_search) = " + "(" + lat_from + ", " + lon_from + ")"))
        console.log(chalk.green("(lat_from_db, lon_from_db) = " + "(" + coords.lat[i] + ", " + coords.lon[i] + ")"))
        console.log(chalk.yellow("Haversine Distance = " + h_d + "\n"))

        if( h_d > 0 && h_d <= 100){
            within_boundary.push("true")
            distance.push(h_d)
            position.push("(" + coords.lat[i] + "," + coords.lon[i] + ")")
        }
        else{
            throw new Error('Error in results.js')
        }
    }
    if(distance && within_boundary && position)
        return({ distance, within_boundary, position })
    else
        return console.error("Error in results.js")
}

module.exports = final_results