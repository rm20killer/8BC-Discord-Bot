const fs = require("fs");

//read blocks.txt
const blocksFile = fs.readFileSync("blocks.txt", "utf8");

//split blocks.txt into an array
const blocksArray = blocksFile.split("\r")

let blocks = {}
//for each split
blocksArray.forEach(block => {
    
    //split each block into an array
    let array = block.split(" ")
    let x = array[1]
    let y = array[2]
    let z = array[3]
    //let block = array4 but remove "minecraft:"
    let blockName = array[4].replace("minecraft:", "")

    //create a varible with the name block containing xyz
    blocks[blockName] = {x, y, z}
})

//write blocks.json
fs.writeFileSync("basement.json", JSON.stringify(blocks, null, 4))