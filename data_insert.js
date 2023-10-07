var thinky = require('thinky')();
const { uuid } = require('uuidv4');
var type   = thinky.type;

var DataItem = thinky.createModel("DataItem", {
    id: String,
    temperature: Number,
    vibration: Number,
    moisture: Number,
    createdAt: String,
    updatedAt: String
});

function insertData() {
    var item = new DataItem({
        id: uuid(),
        temperature: Math.random() * 100,
        vibration: Math.random() * 20,
        moisture: Math.random() * 100,
        createdAt: new Date(Date.now()).toISOString(),
        updatedAt: new Date(Date.now()).toISOString()
        });

        item.saveAll().then(function(result) {
        console.log(typeof result);
        console.log(JSON.stringify(result));
        });
}


      setInterval(insertData, 10000);


// var item = new DataItem({
//     id: uuid(),
//     temperature: Math.random() * 100,
//     vibration: Math.random() * 20,
//     moisture: Math.random() * 100,
//     createdAt: new Date(Date.now()).toISOString(),
//     updatedAt: new Date(Date.now()).toISOString()
//   });

//   item.saveAll().then(function(result) {
//     console.log(typeof result);
//     console.log(JSON.stringify(result));
//   });
  