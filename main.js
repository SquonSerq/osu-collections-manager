// Modules to control application life and create native browser window
const {app, BrowserWindow} = require('electron')
const path = require('path')
const fs = require('fs')
const osuDb = require('osudb')
const md5File = require('md5-file')

function createWindow () {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js')
    }
  })

  // and load the index.html of the app.
  mainWindow.loadFile('index.html')

  // Open the DevTools.
  mainWindow.webContents.openDevTools()
}

function readCollection(path, configName){
  osuDb.readCollectionDB(path+"/collection.db", (data)=>{
    fs.writeFileSync('./'+configName+'.json', JSON.stringify(data))
  })
}

function getKeyByValue(object, value) {
  return Object.keys(object).find(key => object[key] === value);
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
  createWindow()
  
  app.on('activate', function () {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', function () {
  if (!fs.existsSync(tmpFilesDir)){
    fs.rmdirSync(tmpFilesDir, { recursive: true })
  }
  if (process.platform !== 'darwin') app.quit()
})

tmpFilesDir = "./tmp"
if (!fs.existsSync(tmpFilesDir)){
  fs.mkdirSync(tmpFilesDir)
}
configLoad = JSON.parse(fs.readFileSync("./config.json", 'utf-8'))
osuPath = configLoad["osu-path"]
collectionFileName = configLoad["collections-file-name"]

readCollection(osuPath, tmpFilesDir+"/"+collectionFileName)

osuRegExp = /.*\.osu/
osuSongsDir = fs.readdirSync(osuPath+"/Songs")
songsHashes = new Object()
diffsHashes = new Object()

for(const [key, songDirectory] of Object.entries(osuSongsDir)){
  if (fs.lstatSync(osuPath+"\\Songs\\"+songDirectory).isDirectory()){
    songDirPath = fs.readdirSync(osuPath+"\\Songs\\"+songDirectory)
    diffsArray = []
    for(const [k, fileName] of Object.entries(songDirPath)){
      if (osuRegExp.test(fileName)){
        tmpHash = new Object()
        tmpHash[fileName.substring(0, fileName.length-4)] = md5File.sync(osuPath+"\\Songs\\"+songDirectory+"\\"+fileName) 
        diffsArray.push(tmpHash)
        diffsHashes[fileName.substring(0, fileName.length-4)] = md5File.sync(osuPath+"\\Songs\\"+songDirectory+"\\"+fileName) 
        console.log(fileName)
      }
    }
    songsHashes[songDirectory] = diffsArray
  }
}

collectionWithNames = new Object()
collectionData = JSON.parse(fs.readFileSync(tmpFilesDir+"/"+collectionFileName+".json"))

for (const [categoryName, categoryHashes] of Object.entries(collectionData)){
  songNamesArray = []
  categoryHashes.forEach(element => {
    songNamesArray.push(getKeyByValue(diffsHashes, element))
  });
  collectionWithNames[categoryName] = songNamesArray
}

console.log(collectionWithNames)


fs.writeFileSync(tmpFilesDir+"/"+"songsHashes.json", JSON.stringify(songsHashes))
fs.writeFileSync(tmpFilesDir+"/"+"diffsHashes.json", JSON.stringify(diffsHashes))


