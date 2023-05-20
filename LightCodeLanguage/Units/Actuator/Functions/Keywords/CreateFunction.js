import generateID from '../../../../Tools/GenerateID.js'

import { throwError } from '../../ExecuteLoop.js'
import getContainer from '../Container.js'

//創建函數
export default (chunk, complexType) => {
  if (chunk.codeSegment[chunk.executiveData.row+1].type === 'container') {
    if (getContainer(chunk.codeSegment[chunk.executiveData.row+1].value, chunk.layer)) {
      throwError(chunk, { error: true, type: 'running', content: `已有名為 ${chunk.codeSegment[chunk.executiveData.row+1].value} 的 <容器> 存在`, start: complexType.start, end: complexType.end, path: [{ filePath: chunk.path, function: chunk.name, line: chunk.codeSegment[chunk.executiveData.row+1].line }] })
      return
    }
    let parameters = []
    if (chunk.codeSegment[chunk.executiveData.row+2].value[0].length > 0) {
      for (let item of chunk.codeSegment[chunk.executiveData.row+2].value) {
        if (item[0].type !== 'container' || item.length > 1) {
          throwError(chunk, { error: true, type: 'running', content: `提供給 <關鍵字> "函數" 的 <參數列> 每個項目中只能為一個 <容器>`, start: complexType.start, end: complexType.end, path: [{ filePath: chunk.path, function: chunk.name, line: chunk.codeSegment[chunk.executiveData.row+1].line }] })
          return
        }
        parameters.push(item[0].value)
      }
    }
    let id = generateID(5, Object.keys(chunk.containers))
    chunk.containers[id] = { name: chunk.codeSegment[chunk.executiveData.row+1].value, mode: 'readOnly', value: { type: 'function', layer: chunk.layer, parameters, value: chunk.codeSegment[chunk.executiveData.row+3].value, async: chunk.executiveData.mode === 'async' }}
    chunk.returnData = { type: 'function', parameters, value: chunk.codeSegment[chunk.executiveData.row+3].value, mode: chunk.executiveData.mode === 'async' }
    chunk.executiveData.row+=3
  } else if (chunk.codeSegment[chunk.executiveData.row].type === 'parameters') {
    let parameters = []
    if (chunk.codeSegment[chunk.executiveData.row+1].value[0].length > 0) {
      for (let item of chunk.codeSegment[chunk.executiveData.row+2].value) {
        if (item[0].type !== 'container' || item.length > 1) {
          throwError(chunk, { error: true, type: 'running', content: `提供給 <關鍵字> "函數" 的 <參數列> 每個項目中只能為一個 <容器>`, start: complexType.start, end: complexType.end, path: [{ filePath: chunk.path, function: chunk.name, line: chunk.codeSegment[chunk.executiveData.row+1].line }] })
          return
        }
        parameters.push(item[0].value)
      }
    }
    chunk.returnData = { type: 'function', layer: chunk.layer, parameters, value: chunk.codeSegment[chunk.executiveData.row+2].value, mode: chunk.executiveData.mode === 'async' }
    chunk.executiveData.row+=2
  }
  chunk.executiveData.mode = undefined
}