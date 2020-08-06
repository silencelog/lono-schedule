'use strict'

/**
 * Module dependencies.
 */
import LonoRequire from '@lono/require'
// import {Schedule} from './decorator.js'
import Master from './master'
const debug = require('debug')('lono-schedule')
const { resolve } = require('path')
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
    const path = (opt.path && resolve(opt.path)) || `${cwd}/src/schedule`
    LonoRequire({
      path: path,
      filter: '/**/*.js',
      onAfter: (C, file) => {
        const M = C.default || C
        M.symbol = file.prefix
        this.scheduleMap[file.prefix] = M
      }
    })
    const m = new Master()
    m.install(app, this.scheduleMap, path)
  }
}

export default function (...agr) {
  return new LSchedule(...agr)
}

// export { Schedule }
