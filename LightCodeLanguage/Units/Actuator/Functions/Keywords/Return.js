import checkSyntax from '../../../Analyzer/SyntaxChecker.js'
import getNewLayerID from '../../GetNewLayerID.js'
import { removeTesk } from '../../ExecuteLoop.js'
import { createChunk } from '../../Main.js'
import { actuator } from '../../Main.js'

//返回
export default (chunk, complexType) => {
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
    for (let i = chunk.callPath.length-1; i >= 0; i--) {
      if (actuator[chunk.callPath[i].id] !== undefined) {

      }
    }
    stopChunk(chunk, chunk.returnedData)
  }
}

//停止區塊
function stopChunk (chunk, returnData) {
  delete actuator.chunks[chunk.id]
  removeTesk(chunk.id)
  for (let i = chunk.callPath.length-1; i >= 0; i--) {
    if (actuator.chunks[chunk.callPath[i].id] !== undefined && ((i < chunk.callPath.length-1 && actuator.chunks[chunk.callPath[i].id].state === `wait.${chunk.callPath[i+1].id}`) || (i === chunk.callPath.length-1 && actuator.chunks[chunk.callPath[i].id].state === `wait.${chunk.id}`))) {
      if (actuator.chunks[chunk.callPath[i].id].type === 'chunk') {
        actuator.chunks[chunk.callPath[i].id].state = 'running'
        actuator.chunks[chunk.callPath[i].id].returnedData = returnData
        return
      } else {
        delete actuator.chunks[chunk.callPath[i].id]
        removeTesk(chunk.callPath[i].id)
      }
    }
  }
}