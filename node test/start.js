const microstats = require('microstats')
const cpuStat = require('cpu-stat');
const express = require('express')
const app = express()

var monitor = {
     percentageCPU : 0,
     percentageRAM : 0,
     percentageDISK : []
}


app.get('/monitor', (req, res) => {
  res.json(monitor)
})

app.listen(7777, () => {
  console.log('listening on port 7777!')
})



microstats.on('memory', value => {
    monitor.percentageRAM = value.usedpct
})

microstats.on('disk', value => {
    let disk = {
        name: value.filesystem,
        pct: value.usedpct
    }
    let inArray = {
        value: false,
        index: 0
    }
    monitor.percentageDISK.forEach((obj, index) => {
        if (obj.name == disk.name) {
            inArray.value = true
            inArray.index = index
        }
    })

    if (inArray.value)
        monitor.percentageDISK[inArray.index] = disk
    else
        monitor.percentageDISK.push(disk)
})

let options = {
    frequency: '5s'
}
microstats.start(options, (err) => {
    if (err) console.log(err);
})


setInterval(()=>{
    cpuStat.usagePercent((err, percent) => {
        if (err) console.log(err)
        monitor.percentageCPU = percent
    });
},5000)


setInterval(() => {
console.log("cpu " +monitor.percentageCPU)
console.log("ram " +monitor.percentageRAM)
console.log("disk ")
console.table(monitor.percentageDISK)
}, 5000)