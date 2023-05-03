import { throwError } from '../ExecuteLoop.js'

import typesName from '../../TypesName.json' assert { type: 'json' }

//鑰
export default (chunk, complexType) => {
  if (chunk.returnData.type !== 'object') {
    throwError(chunk, { error: true, type: 'running', content: `無法用 <鑰> 來讀取 <${typesName[chunk.returnData.type]}> 的值`, start: complexType.start, end: complexType.end, path: [{ filePath: chunk.path, function: chunk.name, line: complexType.line }] })
    return
  }
  if (chunk.returnData.container === undefined) {
    chunk.returnData.value = chunk.returnData.value[complexType.value]
  } else {
    chunk.returnData.container.mode = chunk.returnData.value[complexType.value].mode
    chunk.returnData.value = chunk.returnData.value[complexType.value].value.value
    chunk.returnData.container.path.push(complexType.value)
  }
}