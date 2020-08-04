
const assert = require('assert')

class Scheduler {
  constructor (opt = {}) {
    this.schedules = []
  }
}

function setSchedule (target, key, descriptor, params) {
  const C = target.prototype ? target.prototype : target
  if (!C.schedule) {
    C.schedule = new Scheduler()
  }
  C.schedule.schedules.push({
    corn: params.corn,
    type: params.type,
    env: params.env,
    callback: descriptor.value
  })
}

/**
 * 定时任务修饰器
 * type [all: 都执行，worker: 单个worker执行]
 */
export function Schedule (corn, type = 'worker', env) {
  assert(corn, 'corn is required')
  const params = typeof corn === 'object' ? {...corn} : {
    corn,
    type,
    env
  }
  return function (target, key, descriptor) {
    setSchedule.call(this, target, key, descriptor, params)
  }
}
