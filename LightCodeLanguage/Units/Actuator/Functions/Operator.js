import checkSyntax from '../../Analyzer/SyntaxChecker.js'
import getNewLayerID from '../GetNewLayerID.js'
import { throwError } from '../ExecuteLoop.js'
import typeToNumber from '../TypeToNumber.js'
import { createChunk } from '../Main.js'

import typesName from '../../TypesName.json' assert { type: 'json' }

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
  } else if (complexType.value === '=') {
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
      
    }
  }
}