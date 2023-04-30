import { parentPort, workerData } from 'node:worker_threads'

import getVariableSize from '../../Tools/GetVariableSize.js'
import generateID from '../../Tools/GenerateID.js'

import getCallPathOverLimitContent from './GetCallPathOverLimitContent.js'
import getVMemoryOverLimitContent from './GetVMemoryOverLimitContent.js'
import analysis from '../Analyzer/Analyzer.js'
import { executeLoop, addTask } from './ExecuteLoop.js'
import log from './Log.js'

let actuator = {
  id: workerData.id,
  state: {
    cpe: 0,
    vMem: 0
  },

  settings: workerData.settings,
  code: workerData.code,
  mainFilePath: workerData.mainFilePath,

  chunks: {},
  executiveData: {
    tasks: [],
    nowTask: 0
  },
  caches: {},

  returnData: undefined
}

export { actuator, createChunk, stopActuator }

//啟動執行器
async function boot () {
  log('actuatorLog', '正在啟動執行器')

  //分析程式碼
  log('actuatorLog', `開始分析 (長度: ${actuator.code.length})`)
  const time = performance.now()
  let codeSegment = analysis(actuator.code, actuator.mainFilePath)
  if (!Array.isArray(codeSegment)) {
    log('actuatorLog', `分析時發生錯誤`)
    stopActuator(codeSegment)
  }
  log('actuatorLog', `分析完成 (花費 ${Math.round((performance.now()-time)*1000)/1000} ms)`)

  //添加主Chunk
  actuator.chunks.main = {
    id: 'main',
    name: '全局',
    state: 'running', //wait
    type: 'chunk', //chunk, childChunk
    catchError: undefined,
    layer: '0', //層, 編號
    path: actuator.mainFilePath,

    codeSegment,
    executiveData: {
      row: 0,
      skip: undefined,
      mode: undefined,
      data: {}
    },
    containers: {
      輸出: { name: '輸出', mode: 'readOnly', value: { type: 'externalFunction', value: '[外部函數: 輸出]', async: false }}
    },
    callPath: [],
    returnedData: undefined,
    returnData: { type: 'none', value: '無' },
  }

  //檢查記憶體
  actuator.state.vMem = getVariableSize(actuator)
  if (actuator.state.vMem > actuator.settings.vMemCanUse) stopActuator({ error: true, content: 'vMemOverLimit', detail: getVMemoryOverLimitContent() })

  log('actuatorLog', '啟動完成')

  //開始執行
  console.log(codeSegment)
  executeLoop()
}

boot()

//創建區塊
function createChunk (upperChunk, name, type, layer, path, codeSegment, line, wait) {
  let id = generateID(5, Object.keys(actuator.chunks))
  if (wait) upperChunk.state = `wait.${id}`
  actuator.chunks[id] = {
    id,
    name,
    state: 'running',
    type,
    catchError: undefined,
    layer,
    path,

    codeSegment,
    executiveData: {
      row: 0,
      skip: undefined,
      mode: undefined,
      data: {}
    },
    containers: {},
    callPath: upperChunk.callPath.concat([{ id: upperChunk.id, path: upperChunk.path, name: upperChunk.name, line }]),
    returnedData: undefined,
    returnData: { type: 'none', value: '無' },
  }
  if (actuator.chunks[id].callPath.length > actuator.settings.maxCallLength) stopActuator({ error: true, content: 'callLengthOverLimit', detail: getCallPathOverLimitContent(actuator.chunks[id]) })
  addTask(id)
  return id
}

//停止執行器
function stopActuator (data) {
  parentPort.postMessage({ type: 'stop', data })
}