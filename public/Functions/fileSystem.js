const fs = require("fs");
const path = require("path");

//exports.cache is deprecated, will be removed soon
exports.cache = { "name": "" };

exports.getFile = (file, parse = true) => {
  //reads the file using fs and if parse is true, parses it
  file = exports.getPath(file);
  let data = fs.readFileSync(file, "utf8");
  if (parse) return JSON.parse(data);
  return data;
}

exports.getPath = (file) => {
  //if it's the first time it's been called inside the renderer
  if (!exports.cache.path) {
      const { ipcRenderer } = require("electron");
      exports.cache.path = ipcRenderer.sendSync("synchronous-message");
  }
  //gets the path of a file and returns it
  console.log(exports.cache);
  //not sure if this is bad practice, but I don't really see why it would be
  const appPath = path.join(exports.cache.path, file);
  return appPath;
}

exports.setFileProperty = (file, key, value) => {
  file = exports.getPath(file);
  if (!fs.existsSync(file)) {
    fs.appendFileSync(file, "");
  }
  //reads the data with parse = true
  let data = JSON.parse(fs.readFileSync(file, "utf8"));
  //changes the value for the local object
  data[key] = value;
  //replaces the original object with the new one
  fs.writeFileSync(file, JSON.stringify(data));
}

exports.checkDuplicateObj = (file, input) => {
  file = exports.getPath(file);
  const data = exports.getFile(file);
  let obj;
  for (let i = 0; i < data.length; i++) {
    obj = data[i];
    if (Object.keys(input).length != Object.keys(obj).length) continue;
    for (let i = 0; i < Object.keys(obj).length; i++) {
      if (Object.keys(obj)[i] != Object.keys(input)[i]) {
        break;
      }
      if (i == Object.keys(obj).length - 1) return true;
    }
  }
  return false;
}

exports.exists = (file) => {
  file = exports.getPath(file);
  if (fs.existsSync(file)) {
    return true;
  }
  return false;
}



//Doesn't work for some reason
// exports.removeObjFromArray = (file, obj) => {
//   const data = exports.getFile(file);
//   const index = data.indexOf(obj);
//   if (index > -1) {
//     data.splice(index, 1);
//     fs.writeFileSync(file, JSON.stringify(data));
//     return;
//   }
//   console.warn("Object not found:");
//   console.log(obj);
//   console.log(data);
// }

//this is just stupid
// exports.removeObjBasedOnURL = (file, obj) => {
//   let data = exports.getFile(file);
//   for (let i = 0; i < data.length; i++) {
//     if (data[i].url == obj.url) {
//       console.log("found the url");
//       data.splice(i, 1);
//       fs.writeFileSync(file, JSON.stringify(data));
//       return;
//     }
//   }
// }

//this is smart
exports.removeObjBasedOnProperty = (file, property, value) => {
  file = exports.getPath(file);
  let data = exports.getFile(file);
  console.log(data);
  for (let i = 0; i < data.length; i++) {
    if (data[i][property] == value) {
      console.log(data);
      data.splice(i, 1);
      console.log(data);
      fs.writeFileSync(file, JSON.stringify(data));
      return;
    }
  }
}

//this is smart
exports.checkObjProperty = (file, property, value) => {
  file = exports.getPath(file);
  let data = exports.getFile(file);
  for (let i = 0; i < data.length; i++) {
    if (data[i][property] == value) {
      return true;
    }
  }
  return false;
}

exports.appendText = (file, text) => {
  file = exports.getPath(file);
  //just useless
  if (!fs.existsSync(file)) {
    fs.appendFileSync(file, "");
  }
  let data = fs.readFileSync(file, "utf8");
  data += text + "\n";
  fs.writeFileSync(file, data);
}

exports.initialize = (file, startingContent) => {
  file = exports.getPath(file);
  if (!fs.existsSync(file)) {
    fs.appendFileSync(file, startingContent);
  }
}

exports.initializeCache = (file, appData) => {
  console.log("here first");
  exports.cache.path = appData;
  console.log(exports.cache);
  if (!fs.existsSync(file)) {
    fs.appendFileSync(file, JSON.stringify(exports.cache));
  }
}

exports.test = () => {
  return exports.cache;
}

exports.appendObj = (file, obj) => {
  file = exports.getPath(file);
  let data = exports.getFile(file);
  console.log(data);
  data.push(obj);
  console.log(data);
  fs.writeFileSync(file, JSON.stringify(data));
}

//file defaults

//cache.json

//add other keys and values here

