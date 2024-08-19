const fs = require("fs");
const { connectToDb, PlanStatistics, sequelize} = require("./dataBaseHandler");
var buffer = "";

function ReadFromFile(file) {
  return new Promise((resolve, reject) => {
    const src = fs.createReadStream(file, { encoding: "utf-8" })
    src.on("data", (chunck) => {
      if (!buffer) {
        const index = chunck.indexOf("\n") + 1;
        buffer += chunck.slice(index);
      }
      else
        buffer += chunck;
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

async function AllDb(args) {
  var index = false;
  for (const file of args) {
    if (file.includes(".csv")) {
      index = true;
      try {
        await ReadFromFile(file);
      }
      catch (error) {
        console.error("error", error)
      }
    }
    else
      continue;
  }
  if(index === false){
    console.log("csv files not found");
    process.exit()
  }
}

async function FillDb() {
  let array2d = [];
  var i = 0;
  var data = [];
  let tmp;
  array2d = buffer.split('\n');

  while (i < array2d.length) {
    array2d[i] = array2d[i].split(';')
    
    var j = 0;
    while (j < array2d[i].length) {
      tmp = {
        VarName: array2d[i][j++],
        Time_string: array2d[i][j++],
        VarValue: array2d[i][j++],
        Validity: array2d[i][j++],
        Time_ms: array2d[i][j++]
      };
    }
    data.push(tmp);

    i++;
  }
    try {
      await PlanStatistics.bulkCreate(data);
      console.log("Data saved successfully");
    } catch (error) {
        console.error("Error while saving data:", error);
      }
  }




async function firstFill() {
  try {
    await connectToDb(); 
    await AllDb(process.argv);
    await FillDb();
  } catch (error) {
    console.error("error occured:", error);
  }
  // await fs.writeFile(process.argv[2], '', {encoding:"utf-8"}, (err)=>{
  //   console.log("file writed successfuly");
  // });
}

async function main(){
   await firstFill();
}

main();
