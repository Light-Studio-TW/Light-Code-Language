import generateID from '../../../Tools/GenerateID.js'

import getContainer from '../Get/GetContainer.js'
import getNewLayerID from '../GetNewLayerID.js'
import { throwError } from '../ExecuteLoop.js'
import { createChunk } from '../Main.js'

//執行關鍵字
export default (chunk, complexType) => {
  if (complexType.value === '異同步') chunk.executiveData.mode = 'async'
  else if (complexType.value === '唯讀') chunk.executiveData.mode = 'readOnly'
  else if (complexType.value === '變數') {
    if (chunk.codeSegment[chunk.executiveData.row+2] !== undefined && chunk.codeSegment[chunk.executiveData.row+2].type === 'operator' && chunk.codeSegment[chunk.executiveData.row+2].value === '=') {
      
    } else {
      if (chunk.codeSegment[chunk.executiveData.row+1].type === 'container') {
        if (getContainer(chunk.codeSegment[chunk.executiveData.row+1].value, chunk.layer)) {
          throwError(chunk, { error: true, type: 'running', content: `已有名為 ${chunk.codeSegment[chunk.executiveData.row+1].value} 的 <容器> 存在`, start: complexType.start, end: complexType.end, path: [{ filePath: chunk.path, function: chunk.name, line: chunk.codeSegment[chunk.executiveData.row+1].line }] })
          return
        }
        chunk.containers[generateID(5, Object.keys(chunk.containers))] = { name: chunk.codeSegment[chunk.executiveData.row+1].value, mode: (chunk.executiveData.mode === 'readOnly') ? 'readOnly' : 'normal', value: { type: 'none', value: '無' }}
        chunk.executiveData.row+=1
        return { type: 'none', value: '無' }
      } else if (chunk.codeSegment[chunk.executiveData.row+1].type === 'object') {
        if (chunk.returnedData === undefined) {
          chunk.executiveData.data = { count: 0, object: {}, keys: Object.keys(chunk.codeSegment[chunk.executiveData.row+1].value) }
          createChunk(chunk, chunk.name, 'childChunk', getNewLayerID(chunk.layer), chunk.path, chunk.codeSegment[chunk.executiveData.row+1].value[chunk.executiveData.data.keys[0]].value, complexType.line, true)
          return true
        } else {
          chunk.executiveData.data.object[chunk.executiveData.data.keys[chunk.executiveData.data.count]] = { mode: chunk.codeSegment[chunk.executiveData.row+1].value[chunk.executiveData.data.keys[chunk.executiveData.data.count]].mode, value: chunk.returnedData }
          chunk.executiveData.data.count++
          if (chunk.executiveData.data.count < chunk.executiveData.data.keys.length) {
            createChunk(chunk, chunk.name, 'childChunk', getNewLayerID(chunk.layer), chunk.path, chunk.codeSegment[chunk.executiveData.row+1].value[chunk.executiveData.data.keys[chunk.executiveData.data.count]].value, complexType.line, true)
            return true
          } else {
            for (let item of chunk.executiveData.data.keys) {
              if (getContainer(item, chunk.layer)) {
                throwError(chunk, { error: true, type: 'running', content: `已有名為 ${item} 的 <容器> 存在`, start: complexType.start, end: complexType.end, path: [{ filePath: chunk.path, function: chunk.name, line: chunk.codeSegment[chunk.executiveData.row+1].line }] })
                return
              }
              chunk.containers[generateID(5, Object.keys(chunk.containers))] = { name: item, mode: chunk.executiveData.data.object[item].mode, value: chunk.executiveData.data.object[item].value }
            }
            chunk.returnedData = undefined
            chunk.returnData = { type: 'object', value: chunk.executiveData.data.object }
            chunk.executiveData.data = {}
            chunk.executiveData.row+=1
          }
        }
      }
    }
    chunk.executiveData.mode = undefined
  }
}