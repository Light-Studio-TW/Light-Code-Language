import checkSyntax from '../../Analyzer/SyntaxChecker.js'
import { createChunk } from '../Main.js'
import getNewLayerID from '../GetNewLayerID.js'
import typeToNumber from '../TypeToNumber.js'

//執行運算符
export default (chunk, complexType) => {
  if (complexType.value === '+' || complexType.value === '-') {
    if (chunk.returnedData === undefined) {
      let chunk2 = []
      for (let i = chunk.executiveData.row+1; i < chunk.codeSegment.length; i++) {
        if (checkSyntax(chunk2.concat(chunk.codeSegment[i])) === undefined) {
          chunk2.push(chunk.codeSegment[i])
          chunk.executiveData.skip = i-chunk.executiveData.row
        } else break
      }
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
  }
}