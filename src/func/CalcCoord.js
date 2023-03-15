const fs = require('fs');
const coords = require(`../../data/coords.json`);

module.exports = (number,letter,block,level) => {

    //get coord from coords.json
    let rawCord
    if(level==0)
    {
        rawCord = coords['basement 01'].Blocks[block]
    }
    else if(level==1)
    {
        rawCord = coords['ground'].Blocks[block]
    }
    else if(level==2)
    {
        rawCord = coords['first floor'].Blocks[block]
    }

    let x = rawCord.x
    let y = rawCord.y
    let z = rawCord.z

    //replace letter to number a = 1
    let letterNumber = letter.charCodeAt(0) - 96

    let newz = z-letterNumber
    let newy = y-parseInt(number)

    console.log(x,newy,newz)
    const coord = {
        x:x,
        y:newy,
        z:newz
    }
    return coord
};