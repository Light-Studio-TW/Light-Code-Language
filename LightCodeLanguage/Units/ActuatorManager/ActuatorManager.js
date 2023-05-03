import { Worker } from 'node:worker_threads'
import { fileURLToPath } from 'node:url'
import { dirname } from 'node:path'
import path from 'node:path'
import fs from 'node:fs'

let actuators = {}

export { actuators, createActuator, runActuator }

const __dirname = dirname(fileURLToPath(import.meta.url))

import defaultValue from '../../Tools/DefaultValue.js'
import generateID from '../../Tools/GenerateID.js'
import { getPath } from '../../Tools/Path.js'

import { defaultSettings, checkSettings } from './ActuatorSettings.js'
import getErrorLogContent from './GetErrorLogContent.js'
import log from './Log.js'

//創建執行器
function createActuator (mainFilePath, settings) {
  if (!fs.existsSync(mainFilePath)) throw new Error(`[LCL]: 路徑 ${mainFilePath} 不存在`)
  else if (fs.statSync(mainFilePath).isDirectory()) throw new Error(`[LCL]: 路徑 ${mainFilePath} 是一個資料夾`)
  else if (path.extname(mainFilePath) !== '.lcl') throw new Error(`[LCL]: LCL 只能執行擴展名為 .lcl 的文件`)
  let id = generateID(5, Object.keys(actuators))
  actuators[id] = {
    state: 'idle', //idle, analyzing, running
    vMem: undefined,
    executeTaskLength: undefined,

    mainFilePath,
    settings: checkSettings(defaultValue(defaultSettings, settings)),
    log: [],

    code: fs.readFileSync(mainFilePath, 'utf8'),
    worker: undefined,
    eventListeners: {}
  }
  return id
}

//運行執行器
function runActuator (id) {
  if (actuators[id].state !== 'idle') throw new Error(`[LCL]: 無法運行執行器 ${id}，因為它的狀態不為 'idle' (狀態: ${actuators[id].state})`)
  if (!fs.existsSync(getPath(__dirname, ['<', 'Actuator']))) throw new Error(`[LCL]: 找不到 Actuator 單元 (${getPath(__dirname, ['<', 'Actuator'])})`)
  if (!fs.existsSync(getPath(__dirname, ['<', 'Analyzer']))) throw new Error(`[LCL]: 找不到 Analyzer 單元 (${getPath(__dirname, ['<', 'Analyzer'])})`)
  actuators[id].worker = new Worker(getPath(__dirname, ['<', 'Actuator', 'Main.js']), { workerData: { id, settings: actuators[id].settings, code: actuators[id].code, mainFilePath: actuators[id].mainFilePath } }) 
  actuators[id].worker.on('message', handleActuatorMessage)

  //接收執行器的訊息
  function handleActuatorMessage (msg) {
    if (msg.type === 'stop') {
      actuators[id].worker.off('message', handleActuatorMessage)
      actuators[id].worker.terminate()
      actuators[id].worker = undefined
      if (msg.data.error) {
        if (msg.data.content === 'vMemOverLimit' || msg.data.content === 'callLengthOverLimit') log(id, { type: 'normal', content: msg.data.detail })
        else log(id, { type: 'normal', content: getErrorLogContent(msg.data) })
      } else {
        log(id, { type: 'normal', content: msg.data })
      }
    } else if (msg.type === 'log') {
      log(id, msg.data)
      actuators[id].worker.postMessage({ id: msg.id, type: 'return' })
    }
  }
}