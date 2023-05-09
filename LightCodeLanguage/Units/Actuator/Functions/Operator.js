import checkSyntax from '../../Analyzer/SyntaxChecker.js'
import { calculateExpression } from './Expression.js'
import { actuator, createChunk } from '../Main.js'
import getNewLayerID from '../GetNewLayerID.js'
import { throwError } from '../ExecuteLoop.js'
import typeToNumber from '../TypeToNumber.js'

import typesName from '../../TypesName.json' assert { type: 'json' }

//設定容器
function setContainer (container, value) {
  let chunk2 = actuator.chunks[container.container.address.split('.')[0]]
  if (container.container.path.length > 0) {
    let value2 = chunk2.containers[container.container.address.split('.')[1]].value
    container.container.path.map((item, row) => {
      if (row < container.container.path.length-1) value2 = value.value[item]
    })
    if (value2.value[container.container.path[container.container.path.length-1]].type === 'object') value2.value[container.container.path[container.container.path.length-1]].value = value
    else value2.value[container.container.path[container.container.path.length-1]] = value
  } else chunk2.containers[container.container.address.split('.')[1]].value = value
  return value
}

//執行運算符
export default (chunk, complexType) => {
  if (complexType.value === '+' || complexType.value === '-') {
    if (chunk.returnedData === undefined) {
      let chunk2 = []
      for (let i = chunk.executiveData.row+1; i < chunk.codeSegment.length; i++) {
        if (checkSyntax(chunk2.concat(chunk.codeSegment[i])) === undefined) chunk2.push(chunk.codeSegment[i])
        else break
      }
      chunk.executiveData.skip = chunk2.length
      createChunk(chunk, chunk.name, 'childChunk', getNewLayerID(chunk.layer), chunk.path, chunk2, complexType.line, true)
      return true
    } else {
      let data = typeToNumber(chunk.returnedData)
      if (complexType.value === '+') chunk.returnData = data
      else if (complexType.value === '-') {
        if (data.type === 'number') chunk.returnData = { type: 'number', value: `-${data.value}` }
        else chunk.returnData = data
      }
      chunk.executiveData.row+=chunk.executiveData.skip
      chunk.skip = 0
      chunk.returnedData = undefined
    }
  } else if (complexType.value === '++' || complexType.value === '--') {
    if (chunk.returnData.container === undefined) {
      throwError(chunk, { error: true, type: 'running', content: `無法設定 <${typesName[chunk.returnData.type]}>，因為他沒有被儲存在任何 <容器> 裡`, start: complexType.start, end: complexType.end, path: [{ filePath: chunk.path, function: chunk.name, line: complexType.line }] })
      return
    } else if (chunk.returnData.container.mode === 'readOnly') {
      throwError(chunk, { error: true, type: 'running', content: `無法設定 <容器> ${chunk.returnData.container.name}，因為它為 唯讀 <容器>`, start: complexType.start, end: complexType.end, path: [{ filePath: chunk.path, function: chunk.name, line: complexType.line }] })
      return
    }
    if (complexType.value === '++') chunk.returnData = setContainer(chunk.returnData, calculateExpression([chunk.returnData, '+', { type: 'number', value: '1' }]))
    else if (complexType.value === '--') chunk.returnData = setContainer(chunk.returnData, calculateExpression([chunk.returnData, '-', { type: 'number', value: '1' }]))
    else chunk.returnData = setContainer(chunk.returnData, { type: 'nan', value: '非數' })
  } else if (complexType.value === '+=' || complexType.value === '-=' || complexType.value === '*=' || complexType.value === '/=' || complexType.value === '=') {
    if (chunk.returnedData === undefined) {
      if (chunk.returnData.container === undefined) {
        throwError(chunk, { error: true, type: 'running', content: `無法設定 <${typesName[chunk.returnData.type]}>，因為他沒有被儲存在任何 <容器> 裡`, start: complexType.start, end: complexType.end, path: [{ filePath: chunk.path, function: chunk.name, line: complexType.line }] })
        return
      }
      let chunk2 = []
      for (let i = chunk.executiveData.row+1; i < chunk.codeSegment.length; i++) {
        if (checkSyntax(chunk2.concat(chunk.codeSegment[i])) === undefined) chunk2.push(chunk.codeSegment[i])
        else break
      }
      chunk.executiveData.skip = chunk2.length
      createChunk(chunk, chunk.name, 'childChunk', getNewLayerID(chunk.layer), chunk.path, chunk2, complexType.line, true)
      return true
    } else {
      if (complexType.value === '+=') chunk.returnData = setContainer(chunk.returnData, calculateExpression([chunk.returnData, '+', chunk.returnedData]))
      else if (complexType.value === '-=') chunk.returnData = setContainer(chunk.returnData, calculateExpression([chunk.returnData, '-', chunk.returnedData]))
      else if (complexType.value === '*=') chunk.returnData = setContainer(chunk.returnData, calculateExpression([chunk.returnData, '*', chunk.returnedData]))
      else if (complexType.value === '/=') chunk.returnData = setContainer(chunk.returnData, calculateExpression([chunk.returnData, '/', chunk.returnedData]))
      else if (complexType.value === '=') chunk.returnData = setContainer(chunk.returnData, chunk.returnedData)
      chunk.executiveData.row+=chunk.executiveData.skip
      chunk.returnedData = undefined
    }
  }
}