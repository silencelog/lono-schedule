'use strict'

/**
 * Module dependencies.
 */
import LonoRequire from '@lono/require'
import {Schedule} from './decorator.js'
const debug = require('debug')('lono-schedule')
const { resolve } = require('path')
// const cluster = require('cluster')
const NodeSchedule = require('node-schedule')
const cwd = process.cwd()


class LSchedule {
  constructor (opt) {
    opt = Object.assign(Object.create(null), opt)
    debug('schedule "%s" %j', opt)
    this.isLono = true
    this.opt = opt
    this.scheduleMap = {}
  }
  install (app) {
    const opt = (app.$config && app.$config.schedule) || this.opt
    LonoRequire({
      path: (opt.path && resolve(opt.path)) || `${cwd}/src/schedule`,
      filter: '/**/*.js',
      onAfter: (C, file) => {
        if (!C.default) return
        const c = new (C.default)()
        this.scheduleJob(c.schedule, app)
      }
    })
  }
  scheduleJob (schedule, app) {
    schedule.schedules.forEach((item) => {
      var scheduleJob = NodeSchedule.scheduleJob(item.corn, function () {
        if (!item.env || item.env && item.env.length && item.env.includes(process.env.LONO_ENV)) {
          // process.messenger.send({
          //   action: 'lono-schedule',
          //   type: schedule.type === 'all' ? 'broadcast' : 'sendRandom',
          //   data: { path }
          // })
          item.callback.call(app.context, app.context)
        }
      })
    })
  }
}

export default function (...agr) {
  return new LSchedule(...agr)
}

export { Schedule }
