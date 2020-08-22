var lat_lon = document.getElementById('position')
// Disable Location Button
// document.querySelector('#detect-location').disabled = true
// Disable Search button prior to locating the user
document.querySelector('#search-people').disabled = true

document.querySelector('#detect-location').addEventListener('click', () => {
    document.querySelector('#detect-location').disabled = true
    if(!navigator.geolocation){
        document.querySelector('#detect-location').disabled = false
        return alert('Geolocation is not supported by your browser')
    }

    navigator.geolocation.getCurrentPosition((position) => {
        var objLocation = {
            lat: position.coords.latitude,
            lon: position.coords.longitude
        }

        // Sending to server Fetch API
        const url = 'http://localhost:3000/myLocation'
        var request = new Request(url, {
            method: "POST",
            body: (JSON.stringify(objLocation)),
            headers: new Headers({
                'Content-Type': 'application/json'
            })
        })
        const result = fetch(request).then(function(response){
            console.log(response)
            return true
        }).catch(function(error){
            console.log(error)
            return false 
        })

        if(result){
            lat_lon.innerHTML = "Latitude : " + position.coords.latitude + "<br>Longitude : " + position.coords.longitude
            document.getElementById('search-people').style.cursor = 'pointer'
        }
        else{
            lat_lon.innerHTML = "Something went wrong... try again"
        }
    })
    document.querySelector('#detect-location').disabled = false
    document.querySelector('#search-people').disabled = false
})