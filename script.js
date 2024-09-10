const fs = require('fs')
const readline = require('readline')

var arr = [];
const { connectToDb, planstatistics, sequelize } = require("./dataBaseHandler");
async function ReadFromFile(file) {
  const src = fs.createReadStream(file, { encoding: "utf-8" });
  const rl = readline.createInterface({
      input: src,
      crlfDelay: Infinity
  });
  for await (const line of rl) 
      arr.push(line.split(';'));
  console.log("end");
}

async function AllDb(args) {
  var index = false;
  for (const file of args) {
    if (file.includes(".csv")) {
      index = true;
      try {
        await ReadFromFile(file);
        await FillDb(arr)
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

async function FillDb(arr){
  var data = [];
  var i = await FindLastLine(arr) + 1;
  while (i < arr.length - 1) {
    var j = 0; 
    while (j < 5) {
      tmp = {
        VarName: arr[i][j++],
        Time_string: arr[i][j++],
        VarValue: arr[i][j++],
        Validity: arr[i][j++],
        Time_ms: arr[i][j++]
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

async function FindLastLine(array) {

  const lastEntry = await planstatistics.findOne({
    order: [['id', 'DESC']],  
    attributes: ['VarName', 'Time_string', 'VarValue', 'Validity', 'Time_ms'], 
    raw: true
  });
  if(!lastEntry)
      return(-1)
  let lastEntryArray = [];

  if (lastEntry) {
    lastEntryArray = [
      lastEntry.VarName,
      lastEntry.Time_string,
      lastEntry.VarValue,
      lastEntry.Validity,
      lastEntry.Time_ms
    ];
  }
  const index = arr.findIndex(line => 
    line.length === lastEntryArray.length &&
    line.every((value, index) => value === lastEntryArray[index])
  );
  return(index)
}

async function firstFill() {
  try {
    await connectToDb();
    await AllDb(process.argv);
  } catch (error) {
    console.error("error:", error);
  }
};

async function main() {
  await firstFill();
}

main();