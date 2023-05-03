import getNewLayerID from '../GetNewLayerID.js'
import { throwError } from '../ExecuteLoop.js'
import { createChunk } from '../Main.js'

import typesName from '../../TypesName.json' assert { type: 'json' }

//鑰
export default (chunk, complexType) => {
  if (chunk.returnedData === undefined) {
    if (chunk.returnData.type !== 'string' && chunk.returnData.type !== 'number' && chunk.returnData.type !== 'array' && chunk.returnData.type !== 'object') {
      throwError(chunk, { error: true, type: 'running', content: `無法用 <索引> 來讀取 <${typesName[chunk.returnData.type]}> 的值`, start: complexType.start, end: complexType.end, path: [{ filePath: chunk.path, function: chunk.name, line: complexType.line }] })
      return
    }
    chunk.executiveData.data = { count: 0, index: [] }
    createChunk(chunk, chunk.name, 'childChunk', getNewLayerID(chunk.layer), chunk.path, complexType.value[0], complexType.line, true)
    return true
  } else {
    chunk.executiveData.data.index.push(chunk.returnedData)
    chunk.executiveData.data.count++
    if (chunk.executiveData.data.count < complexType.value.length) {
      createChunk(chunk, chunk.name, 'childChunk', getNewLayerID(chunk.layer), chunk.path, complexType.value[chunk.executiveData.data.count], complexType.line, true)
      return true
    } else {
      if (chunk.returnData.type === 'string' || chunk.returnData.type === 'number') {
        if (chunk.executiveData.data.index[0].type !== 'number') {
          throwError(chunk, { error: true, type: 'running', content: `<索引> 的第 0 項必須為一個 <數字>，因為你正在讀取一個 <${typesName[chunk.returnData.type]}>`, start: complexType.start, end: complexType.end, path: [{ filePath: chunk.path, function: chunk.name, line: complexType.line }] })
          return
        }
        if (chunk.executiveData.data.index.length === 1) chunk.returnData = { type: chunk.returnData.type, value: chunk.returnData.value[chunk.executiveData.data.index[0].value] }
        else {
          if (chunk.executiveData.data.index[1].type !== 'number') {
            throwError(chunk, { error: true, type: 'running', content: `<索引> 的第 1 項必須為一個 <數字>，因為你正在讀取一個 <${typesName[chunk.returnData.type]}>`, start: complexType.start, end: complexType.end, path: [{ filePath: chunk.path, function: chunk.name, line: complexType.line }] })
            return
          }
          chunk.returnData = { type: chunk.returnData.type, value: chunk.returnData.value.substring(chunk.executiveData.data.index[0].value, (+chunk.executiveData.data.index[1].value)+1) }
        }
      } else if (chunk.returnData.type === 'array') {
        if (chunk.executiveData.data.index[0].type !== 'number') {
          throwError(chunk, { error: true, type: 'running', content: `<索引> 的第 0 項必須為一個 <數字>，因為你正在讀取一個 <${typesName[chunk.returnData.type]}>`, start: complexType.start, end: complexType.end, path: [{ filePath: chunk.path, function: chunk.name, line: complexType.line }] })
          return
        }
      }
      chunk.returnedData = undefined
      chunk.executiveData.data = {}
    }
  }
}