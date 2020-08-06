const NodeSchedule = require('node-schedule')

export default class Master {
  constructor (opt = {}) {
    this.workers = []
    this.workerIDs = []
    this.opt = opt
    // 是否使用工作进程
    this.useWorker = false
  }
  install (app, scheduleMap, path) {
    const opt = (app.$config && app.$config.schedule) || {}
    this.useWorker = !!opt.useWorker
    if (this.useWorker) {
      const cluster = require('cluster')
      const numCPUs = require('os').cpus().length
      cluster.setupMaster({
        exec: 'worker.js',
        args: ['--path', path],
        cwd: __dirname,
        slient: true
      })
      for (let i = 0; i < Math.min(numCPUs, opt.instances || 1); i++) {
        const wk = cluster.fork()
        this.workers.push(wk)
        this.workerIDs.push(wk.id)
      }
      cluster.on('fork', (worker) => {
        if (this.workerIDs.indexOf(worker.id) !== -1) {
          console.log(`[master ${process.pid}] : fork worker ${worker.id}`)
        }
      })
      cluster.on('exit', (worker, code, signal) => {
        if (this.workerIDs.indexOf(worker.id) !== -1) {
          console.log(`[master] : worker ${worker.id} died`)
        }
      })
      this.workerIDs.forEach((id) => {
        cluster.workers[id].on('message', (msg) => {
          console.log(`[master] receive message from [worker${id}]: ${msg}`)
        })
      })
    }
    Object.values(scheduleMap).forEach((item) => {
      this.scheduleJob(item, app.context)
    })
  }
  scheduleJob (item, ctx) {
    const self = this
    const scheduleJob = NodeSchedule.scheduleJob(item.corn, function () {
      if (!item.env || item.env && item.env.length && item.env.includes(process.env.LONO_ENV)) {
        // pm2运行
        if (process.env.NODE_APP_INSTANCE !== undefined) {
          if (process.env.NODE_APP_INSTANCE === '0') {
            self.runTask(item, ctx)
          }
        // node运行
        } else {
          self.runTask(item, ctx)
        }
      }
    })
  }
  runTask (item, ctx) {
    this.useWorker ? this.workers[0].send(item) : item.task.call(ctx, ctx)
  }
}
