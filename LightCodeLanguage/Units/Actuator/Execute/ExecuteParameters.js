import analysis from '../../Analyzer/Analyzer.js'
import getNewLayerID from '../GetNewLayerID.js'
import { throwError } from '../ExecuteLoop.js'
import { createChunk } from '../Main.js'

//執行參數列
export default (chunk, complexType) => {
  if (chunk.returnedData === undefined) {
    chunk.executiveData.data = { state: 'getParameters', count: 0, parameters: [] }
    createChunk(chunk, chunk.name, 'childChunk', getNewLayerID(chunk.layer), chunk.path, complexType.value[0], complexType.line, true)
    return true
  } else {
    chunk.executiveData.data.parameters.push(chunk.returnedData)
    chunk.executiveData.data.count++
    if (chunk.executiveData.data.count < complexType.value.length) {
      createChunk(chunk, chunk.name, 'childChunk', getNewLayerID(chunk.layer), chunk.path, complexType.value[chunk.executiveData.data.count], complexType.line, true)
      return true
    } else {
      if (chunk.executiveData.data.state === 'getParameters') {
        if (chunk.returnData.type === 'string') {
          if (chunk.executiveData.mode === undefined) {
            chunk.executiveData.data.state = 'executeChunk'
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
          }
        } else {
          chunk.returnedData = undefined
          chunk.returnData = chunk.executiveData.data.parameters[0]
          chunk.executiveData.data = {}
        }
      } else if (chunk.executiveData.data.state === 'executeChunk') {
        chunk.returnData = chunk.returnedData
        chunk.returnedData = undefined
        chunk.executiveData.data = {}
      }
    }
  }
}; (1, 2, 3)