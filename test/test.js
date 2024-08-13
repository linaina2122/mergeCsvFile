const { error } = require("console");
const fs = require("fs");
var buffer = "";
const arr = ["./Catalog_v2.csv", "./Shipment_v4.csv", "./SupplyPlan_v2.csv", "./Sample Data v3/Product_v6.csv"]

function ReadFromFile(file) {
  var isfirstline = true;
  return new Promise((resolve, reject) => {
    const src = fs.createReadStream(file, { encoding: "utf-8" });
    src.on("data", (chunck) => {
      if(file != arr[0] && isfirstline) {
        const index = chunck.indexOf("\n") + 1;
        buffer += chunck.slice(index);
        isfirstline = false;
      }
      else
        buffer = buffer + chunck;
    })
    src.on("end", () => {
      console.log("---------no more data to read---------")
      resolve(buffer);
    })
    src.on("close", () => {
      console.log("*********flux is closed")
    })
    src.on("error", (error) => {
      console.log("error while reading file", error);
      reject();
    })
  })
}

function WriteToFile() {

  return new Promise((resolve, reject) => {
    const dest = fs.createWriteStream("./file.csv", { encoding: "utf-8" });
    dest.write(buffer);
    dest.end(() => {
      console.log("-------------no more data to write -----------");
      resolve();
    })
    dest.on("error", (error) => {
      console.log('-----------error while writing on file --------------', error);
      reject(error);
    })
  })
}
async function Try() {
  for (const file of arr) {
    try {
      await ReadFromFile(file);
      await WriteToFile();
    }
    catch (error){
      console.error("error", error)
    }
  }
}
Try();
