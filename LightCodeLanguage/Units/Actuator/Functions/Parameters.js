import generateID from '../../../Tools/GenerateID.js'

import { actuator, createChunk } from '../Main.js'
import analysis from '../../Analyzer/Analyzer.js'
import getNewLayerID from '../GetNewLayerID.js'
import { throwError } from '../ExecuteLoop.js'
import getContainer from './Container.js'

import externalFunction from './ExternalFunction.js'

//執行參數列
export default (chunk, complexType) => {
  if (chunk.executiveData.data.state === undefined) {
    chunk.executiveData.data = { state: 'getParameters', count: 0, parameters: [] }
    createChunk(chunk, chunk.name, 'childChunk', getNewLayerID(chunk.layer), chunk.path, complexType.value[0], complexType.line, true)
    return true
  } else if (chunk.executiveData.data.state === 'getParameters') {
    chunk.executiveData.data.parameters.push(chunk.returnedData)
    chunk.executiveData.data.count++
    if (chunk.executiveData.data.count < complexType.value.length) {
      createChunk(chunk, chunk.name, 'childChunk', getNewLayerID(chunk.layer), chunk.path, complexType.value[chunk.executiveData.data.count], complexType.line, true)
      return true
    } else {
      if (chunk.returnData.type === 'string') {
        chunk.executiveData.data.state = 'executeChunk'
        chunk.returnedData = undefined
        let codeSegment = analysis(chunk.returnData.value, chunk.path)
        if (!Array.isArray(codeSegment)) {
          throwError(chunk, codeSegment)
          return
        }
        if (chunk.executiveData.mode === undefined) {
          createChunk(chunk, '字串函數', 'chunk', getNewLayerID(chunk.layer), chunk.path, codeSegment, complexType.line, true)
          return true
        } else if (chunk.executiveData.mode === 'async') {
          createChunk(chunk, '字串函數', 'chunk', getNewLayerID(chunk.layer), chunk.path, codeSegment, complexType.line, false)
          chunk.returnData = { type: 'promise', value: '字串函數' }
        }
      } else if (chunk.returnData.type === 'function') {
        chunk.executiveData.data.state = 'executeChunk'
        chunk.returnedData = undefined
        let chunk2
        if (chunk.returnData.async) {
          if (chunk.executiveData.mode === 'wait') chunk2 = createChunk(chunk, chunk.name, 'chunk', getNewLayerID(chunk.returnData.layer), chunk.path, chunk.returnData.value, complexType.line, true)
          else chunk2 = createChunk(chunk, chunk.name, 'chunk', getNewLayerID(chunk.returnData.layer), chunk.path, chunk.returnData.value, complexType.line, false)
        } else {
          if (chunk.executiveData.mode === 'async') chunk2 = createChunk(chunk, chunk.name, 'chunk', getNewLayerID(chunk.returnData.layer), chunk.path, chunk.returnData.value, complexType.line, false)
          else chunk2 = createChunk(chunk, chunk.name, 'chunk', getNewLayerID(chunk.returnData.layer), chunk.path, chunk.returnData.value, complexType.line, true)
        }
        for (let i = 0; i < chunk.returnData.parameters.length; i++) {
          if (getContainer(chunk.returnData.parameters[i], chunk.layer)) {
            throwError(chunk, { error: true, type: 'running', content: `已有名為 ${chunk.returnData.parameters[i]} 的 <容器> 存在`, start: complexType.start, end: complexType.end, path: [{ filePath: chunk.path, function: chunk.name, line: complexType.line }] })
            return
          }
          actuator.chunks[chunk2].containers[generateID(5, Object.keys(actuator.chunks[chunk2].containers))] = { name: chunk.returnData.parameters[i], mode: 'normal', value: (chunk.executiveData.data.parameters[i] === undefined) ? { type: 'none', value: '無' } : chunk.executiveData.data.parameters[i] } 
        }
        if (chunk.state.split('.')[0] === 'wait') return true
      } else if (chunk.returnData.type === 'externalFunction') {
        if (externalFunction(chunk, complexType, chunk.returnData.container, chunk.executiveData.data.parameters)) return true
      } else {
        chunk.returnData = chunk.executiveData.data.parameters[0]
        chunk.executiveData.data = {}
      }
    } 
  } else if (chunk.executiveData.data.state === 'executeChunk') {
    chunk.returnData = (chunk.returnedData === undefined) ? { type: 'none', value: '無' } : chunk.returnedData
    chunk.returnedData = undefined
    chunk.executiveData.data = {}
  }
}