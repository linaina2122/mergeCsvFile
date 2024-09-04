const fs = require('fs')

const { connectToDb, planstatistics, sequelize } = require("./dataBaseHandler");
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
  if (index === false) {
    console.log("csv files not found");
    process.exit()
  }
}

async function FillArr() {
  let array2d = [];
  var i = 0;
  array2d = buffer.split('\n');
  while (i < array2d.length) {
    array2d[i] = array2d[i].split(';')
    i++;
  }
  return (array2d)
}

async function FillDb() {
  var data = [];
  let tmp;
  var array2d = await FillArr();
  var i = await FindLastLine() + 1;
  while (i < array2d.length) {
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
    await planstatistics.bulkCreate(data);
    console.log("Data saved successfully");
  } catch (error) {
    console.error("Error while saving data:", error);
  }
}

async function FindLastLine() {
  var array2d = await FillArr();
  var count = await planstatistics.count();
  var tmp = [];
  if (count > 0) {
    const allEntries = await planstatistics.findAll();
    const lastLine = allEntries[allEntries.length - 1];
    tmp = [
      lastLine.VarName,
      lastLine.Time_string,
      lastLine.VarValue,
      lastLine.Validity,
      lastLine.Time_ms
    ];
    for (var i = 0; i < array2d.length; i++) {
      {
        var flag = false;
        for (var s = 0; s < (array2d[i].length); s++) {
          if (tmp[s] === array2d[i][s].trim())
              flag =true;
          else{
            flag = false;
            break;
           }
          }
          if(flag)
            return(i);
      }
    }
  }
  return(-1)
}

async function firstFill() {
  try {
    await connectToDb();
    await AllDb(process.argv);
    await FillDb();
  } catch (error) {
    console.error("error:", error);
  }
};

async function main() {
  await firstFill();
}

main();
