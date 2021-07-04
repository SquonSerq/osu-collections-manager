const fs = require('fs')


window.addEventListener('DOMContentLoaded', () => {
  const replaceText = (selector, text) => {
    const element = document.getElementById(selector)
    if (element) element.innerText = text
  }

  for (const type of ['chrome', 'node', 'electron']) {
    replaceText(`${type}-version`, process.versions[type])
  }

  osuSongs = JSON.parse(fs.readFileSync("./tmp/songsHashes.json"))

  for (const [mapName, v] of Object.entries(osuSongs)){
    divMap = document.createElement("div")
    divMap.innerHTML = "<p>"+mapName+"</p>"

    v.forEach(el => {
      diffName = Object.keys(el)[0]
      divDiff = document.createElement("div")
      divDiff.innerHTML = "<p class='diff'>"+diffName+"</p>"
      divMap.appendChild(divDiff)

    })


    document.getElementById("maps").appendChild(divMap)
  }


})
