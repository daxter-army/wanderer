var getCoords = (data) => {
    var result = []
    var lat_array = []
    var lon_array = []

    for(var i in data){
        result.push(data[i])
    }

    for(var i = 0; i < data.length; i++){
        lat_array.push(result[i].lat)
        lon_array.push(result[i].lon)
    }

    if(!(lat_array || lon_array))
        throw new Error("Error in values.js")
        
    var object = {
        "lat" : lat_array,
        "lon" : lon_array
    }

return(object)
}

module.exports = getCoords