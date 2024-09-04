const { Sequelize, Model, DataTypes } = require('sequelize');
const sequelize = new Sequelize('statistics',
    'hcharef',
    'Linaina@1998',
    {
        host: 'localhost',
        dialect: 'mysql',
    }
);

class planstatistics  extends Model{}
planstatistics .init(
    {
        VarName : {
            type:DataTypes.TEXT,
            allowNull:true
        },
        Time_string : {
            type:DataTypes.TEXT,
            allowNull:true
        },
        VarValue : {
            type:DataTypes.TEXT,
            allowNull:true
        },
        Validity : {
            type:DataTypes.TEXT,
            allowNull:true
        },
        Time_ms : {
            type:DataTypes.TEXT,
            allowNull:true
        }
    }, {
    sequelize, 
    modelName: 'planstatistics ',
    timestamps:false,
});
async function connectToDb( ) {
    try {
        await sequelize.authenticate();
        console.log("database connected syccessfuly")
    }
    catch (error) {
        console.log("couldn't connect")
    }
    try{
        await sequelize.sync({alter:true})
        console.log("The table for the planstatistics  model was just (re)created")
    }
    catch(error){
        console.log("couldn't create")
    }
}

module.exports = {connectToDb, planstatistics , sequelize};
