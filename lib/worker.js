import LonoRequire from '@lono/require'
const cluster = require('cluster')

const path = process.argv.slice(2)[1]
const scheduleMap = {}
LonoRequire({
  path: path,
  filter: '/**/*.js',
  onAfter: (C, file) => {
    const M = C.default || C
    M.symbol = file.prefix
    scheduleMap[file.prefix] = M
  }
})

console.log(`[worker ${cluster.worker.id}] start ...` )

process.on('message', function(msg) {
  console.log('process.scheduleMap', process.scheduleMap)
  var st = Date.now();
  console.log(`[worker ${cluster.worker.id}] start to work`)
  const result = scheduleMap[msg.symbol].task.call(this)
  console.log(`[worker ${cluster.worker.id}] work finish work and using ${Date.now() - st} ms`)
  process.send(result)
})
