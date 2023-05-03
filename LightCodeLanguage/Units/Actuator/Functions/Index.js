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
        //讀取字串和數字
        if (chunk.executiveData.data.index[0].type !== 'number') {
          throwError(chunk, { error: true, type: 'running', content: `<索引> 的第 0 項必須為一個 <數字>，因為你正在讀取一個 <${typesName[chunk.returnData.type]}>`, start: complexType.start, end: complexType.end, path: [{ filePath: chunk.path, function: chunk.name, line: complexType.line }] })
          return
        }
        if (chunk.executiveData.data.index.length === 1) {
          let value = chunk.returnData.value[chunk.executiveData.data.index[0].value]
          chunk.returnData = { type: chunk.returnData.type, value: (value === undefined) ? '' : value  }
        } else {
          if (chunk.executiveData.data.index[1].type !== 'number') {
            throwError(chunk, { error: true, type: 'running', content: `<索引> 的第 1 項必須為一個 <數字>，因為你正在讀取一個 <${typesName[chunk.returnData.type]}>`, start: complexType.start, end: complexType.end, path: [{ filePath: chunk.path, function: chunk.name, line: complexType.line }] })
            return
          }
          chunk.returnData = { type: chunk.returnData.type, value: chunk.returnData.value.substring(chunk.executiveData.data.index[0].value, (+chunk.executiveData.data.index[1].value)+1) }
        }
      } else if (chunk.returnData.type === 'array') {
        //讀取陣列
        if (chunk.executiveData.data.index[0].type !== 'number') {
          throwError(chunk, { error: true, type: 'running', content: `<索引> 的第 0 項必須為一個 <數字>，因為你正在讀取一個 <陣列>`, start: complexType.start, end: complexType.end, path: [{ filePath: chunk.path, function: chunk.name, line: complexType.line }] })
          return
        }
        let value = chunk.returnData.value[chunk.executiveData.data.index[0].value]
        if (value === undefined) chunk.returnData = { type: 'none', value: '無' }
        else {
          if (chunk.returnData.container === undefined) chunk.returnData = value
          else chunk.returnData = Object.assign(value, { container: { address: chunk.returnData.container.address, path: chunk.returnData.container.path.concat([chunk.executiveData.data.index[0].value]), mode: chunk.returnData.container.mode }})
        }
      } else if (chunk.returnData.type === 'object') {
        //讀取陣列
        if (chunk.executiveData.data.index[0].type !== 'string') {
          throwError(chunk, { error: true, type: 'running', content: `<索引> 的第 0 項必須為一個 <字串>，因為你正在讀取一個 <物件>`, start: complexType.start, end: complexType.end, path: [{ filePath: chunk.path, function: chunk.name, line: complexType.line }] })
          return
        }
        let value = chunk.returnData.value[chunk.executiveData.data.index[0].value]
        if (value === undefined) value = { type: 'none', value: '無' }
        if (chunk.returnData.container === undefined) chunk.returnData = value
        else chunk.returnData = Object.assign(value, { container: { address: chunk.returnData.container.address, path: chunk.returnData.container.path.concat([chunk.executiveData.data.index[0].value]), mode: chunk.returnData.container.mode }})
      }
      chunk.returnedData = undefined
      chunk.executiveData.data = {}
    }
  }
}