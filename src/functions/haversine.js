// Haversine Formual to calculate distance over spherical surfaces
var h_d = (lat_from, lon_from, lat_to, lon_to) => {
    const pi = Math.PI

    // Convert from degrees to radians
    lat_from = lat_from*(pi/180)
    lon_from = lon_from*(pi/180)
    lat_to = lat_to*(pi/180)
    lon_to = lon_to*(pi/180)

    dlat = lat_to-lat_from
    dlon = lon_to-lon_from

    if(dlat!=0 && dlon!=0){

        var a = Math.sin(dlat/2)**2 + Math.cos(lat_from)*Math.cos(lat_to)*Math.sin(dlon/2)**2
        var c = 2*Math.asin(Math.sqrt(a))
        
        // Mean radius of Earth in KM
        const r = 6371
        
        var result = (c*r)

        // Toatal 5 digits
        result = result.toPrecision(5)

        if(!result){
            throw new Error("Error in haversine.js")
        }
        else{
            // Result is in KMs
            return(result)
        }
    }
}

module.exports = h_d