var search_friends = (found_nearby) => {

    const w_b = found_nearby.within_boundary;
    const pos = found_nearby.position;
    const final_friends = []

    for(var i=0 ; i < w_b.length; i++){
        if(w_b[i]=false){
            continue
        }
        else{
            try {
                const one = pos[i].replace('(', '')
                const two = one.replace(')', '')
                const final = two.split(',')
                // console.log(final)
                final_friends.push(final)
            }
            catch {
                throw new Error("Error")
            }
        }
    }
    return(final_friends)
}

module.exports = search_friends