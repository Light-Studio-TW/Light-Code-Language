import getNewLayerID from '../../GetNewLayerID.js'
import { createChunk } from '../../Main.js'

//重複
export default (chunk, complexType) => {
  if (chunk.executiveData.data.state === undefined) {
    chunk.executiveData.data = { state: 'checkCondition', count: 0 }
    createChunk(chunk, chunk.name, 'childChunk', getNewLayerID(chunk.layer), chunk.path, chunk.codeSegment[chunk.executiveData.row+1].value[0], complexType.line, true)
    return true
  } else if (chunk.executiveData.data.state === 'checkCondition') {
    if (chunk.returnedData.type === 'number') {
      if (+chunk.executiveData.data.count < chunk.returnedData.value) {
        chunk.executiveData.data.state = 'runChunk'
        chunk.executiveData.data.count++
        createChunk(chunk, chunk.name, 'childChunk', getNewLayerID(chunk.layer), chunk.path, chunk.codeSegment[chunk.executiveData.row+2].value, complexType.line, true)
        return true
      }
    } else if (chunk.returnedData.type === 'boolean') {
      if (chunk.returnedData.value === '是') {
        chunk.executiveData.data.state = 'runChunk'
        chunk.executiveData.data.count = 0
        createChunk(chunk, chunk.name, 'childChunk', getNewLayerID(chunk.layer), chunk.path, chunk.codeSegment[chunk.executiveData.row+2].value, complexType.line, true)
        return true
      }
    }
  } else if (chunk.executiveData.data.state === 'runChunk') {
    chunk.executiveData.data.state = 'checkCondition'
    createChunk(chunk, chunk.name, 'childChunk', getNewLayerID(chunk.layer), chunk.path, chunk.codeSegment[chunk.executiveData.row+1].value[0], complexType.line, true)
    return true
  }
}