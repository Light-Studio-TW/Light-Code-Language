import { createTimer } from '../../Tools/Timer.js'

import executeExpression from './Execute/ExecuteExpression.js'
import executeParameters from './Execute/ExecuteParameters.js'
import executeOperator from './Execute/ExecuteOperator.js'
import executeKeyword from './Execute/ExecuteKeyword.js'
import { actuator, stopActuator } from './Main.js'
import getContainer from './Get/GetContainer.js'
import getObject from './Get/GetObject.js'
import getArray from './Get/GetArray.js'
import log from './Log.js'

export { executeLoop, arrangeTasks, addTask, removeTesk, throwError }

//安排任務
function arrangeTasks () {
  actuator.executiveData.tasks = [[]]
  let allKey = Object.keys(actuator.chunks)
  allKey.map((item) => {
    if (actuator.executiveData.tasks[actuator.executiveData.tasks.length-1].length >= actuator.settings.cps) actuator.executiveData.tasks.push([])
    actuator.executiveData.tasks[actuator.executiveData.tasks.length-1].push(item)
  })
}

//添加任務
function addTask (chunkId) {
  for (let run = 0; run < actuator.executiveData.tasks.length; run++) {
    if (actuator.executiveData.tasks[run].length < actuator.settings.cpe) {
      actuator.executiveData.tasks[run].push(chunkId)
      return
    }
  }
  actuator.executiveData.tasks.push([chunkId])
}

//移除任務
function removeTesk (chunkId) {
  for (let run = 0; run < actuator.executiveData.tasks.length; run++) {
    if (actuator.executiveData.tasks[run].includes(chunkId)) {
      actuator.executiveData.tasks[run].splice(actuator.executiveData.tasks[run].indexOf(chunkId), 1)
      actuator.executiveData.tasks[run].push(actuator.executiveData.tasks[actuator.executiveData.tasks.length-1])
      actuator.executiveData.tasks[actuator.executiveData.tasks.length-1].splice(actuator.executiveData.tasks[actuator.executiveData.tasks.length-1].length-1, 1)
      if (actuator.executiveData.tasks[actuator.executiveData.tasks.length-1].length < 1 && actuator.executiveData.tasks.length-1 !== 0) actuator.executiveData.tasks.splice(actuator.executiveData.tasks.length-1, 1)
      return
    }
  }
}

//執行循環
function executeLoop () {
  log('actuatorLog', '開始執行')
  arrangeTasks()

  createTimer(Infinity, actuator.settings.interval, () => {
    //檢查是否還有任務要執行，如果沒有了，就停止執行器
    if (actuator.executiveData.tasks.length <= 1 && actuator.executiveData.tasks[0].length < 1) {
      log('actuatorLog', '執行完成')
      stopActuator(actuator.returnData)
    }

    if (actuator.executiveData.nowTask >= actuator.executiveData.tasks.length) actuator.executiveData.nowTask = 0
    actuator.executiveData.tasks[actuator.executiveData.nowTask].map((item) => {
      if (actuator.chunks[item].state === 'running') executeChunk(actuator.chunks[item])
    })
    actuator.executiveData.nowTask++
  })
}

//執行區塊
function executeChunk (chunk) {
  if (chunk.executiveData.row >= chunk.codeSegment.length) {
    if (chunk.callPath[chunk.callPath.length-1] !== undefined && actuator.chunks[chunk.callPath[chunk.callPath.length-1].id] !== undefined && actuator.chunks[chunk.callPath[chunk.callPath.length-1].id].state === `wait.${chunk.id}`) {
      actuator.chunks[chunk.callPath[chunk.callPath.length-1].id].returnedData = chunk.returnData
      actuator.chunks[chunk.callPath[chunk.callPath.length-1].id].state = 'running'
    } else if (chunk.id === 'main') actuator.returnData = chunk.returnData
    removeTesk(chunk.id)
    delete actuator.chunks[chunk.id]
  } else {
    let complexType = chunk.codeSegment[chunk.executiveData.row]
  
    if (complexType.type === 'string') chunk.returnData = { type: 'string', value: complexType.value }
    else if (complexType.type === 'number') chunk.returnData = { type: 'number', value: complexType.value }
    else if (complexType.type === 'nan') chunk.returnData = { type: 'nan', value: complexType.value }
    else if (complexType.type === 'none') chunk.returnData = { type: 'none', value: complexType.value }
    else if (complexType.type === 'boolean') chunk.returnData = { type: 'boolean', value: complexType.value }
    else if (complexType.type === 'operator') {
      if (executeOperator(chunk, complexType)) return
    } else if (complexType.type === 'expression') {
      if (executeExpression(chunk, complexType)) return
    } else if (complexType.type === 'keyword') {
      if (executeKeyword(chunk, complexType)) return
    } else if (complexType.type === 'container') {
      let container = getContainer(complexType.value, chunk.layer)
      if (container === undefined) {
        throwError(chunk, { error: true, type: 'running', content: `找不到名為 ${complexType.value} 的 <容器>`, start: complexType.start, end: complexType.end, path: [{ filePath: chunk.path, function: chunk.name, line: complexType.line }] })
        return
      }
      chunk.returnData = Object.assign(container.value, { container: { address: container.address, mode: container.mode }})
    } else if (complexType.type === 'array') {
      if (getArray(chunk, complexType)) return
    } else if (complexType.type === 'parameters') {
      if (executeParameters(chunk, complexType)) return
    } else if (complexType.type === 'object') {
      if (getObject(chunk, complexType)) return
    }
  
    chunk.executiveData.row++
  }
}

//拋出錯誤
function throwError (chunk, errorData) {
  for (let i = chunk.callPath.length-1; i >= 0; i--) {
    if (actuator.chunks[chunk.callPath[i].id] !== undefined && actuator.chunks[chunk.callPath[i].id].catchError !== undefined) {
      //Catch功能
      return
    }
    errorData.path.push({ filePath: chunk.callPath[i].path, function: chunk.callPath[i].name, line: chunk.callPath[i].line })
  }
  stopActuator(errorData)
}