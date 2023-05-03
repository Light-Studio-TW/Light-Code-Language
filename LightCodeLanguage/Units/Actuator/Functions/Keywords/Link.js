import { throwError } from '../../ExecuteLoop.js'
import getContainer from '../Container.js'

//連結
export default (chunk, complexType) => {
  let container = getContainer(chunk.codeSegment[chunk.executiveData.row+1].value, chunk.layer)
  if (container === undefined) {
    throwError(chunk, { error: true, type: 'running', content: `找不到名為 ${complexType.value} 的 <容器>`, start: complexType.start, end: complexType.end, path: [{ filePath: chunk.path, function: chunk.name, line: complexType.line }] })
    return
  }
  chunk.executiveData.row++
  chunk.returnData = { type: 'link', value: container.address }
}