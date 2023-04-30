import getNewLayerID from '../GetNewLayerID.js'
import { createChunk } from '../Main.js'

//取得物件
export default (chunk, complexType) => {
  if (chunk.returnedData === undefined) {
    chunk.executiveData.data = { count: 0, object: {}, keys: Object.keys(complexType.value) }
    createChunk(chunk, chunk.name, 'childChunk', getNewLayerID(chunk.layer), chunk.path, complexType.value[chunk.executiveData.data.keys[0]].value, complexType.line, true)
    return true
  } else {
    chunk.executiveData.data.object[chunk.executiveData.data.keys[chunk.executiveData.data.count]] = { mode: complexType.value[chunk.executiveData.data.keys[chunk.executiveData.data.count]].mode, value: chunk.returnedData }
    chunk.executiveData.data.count++
    if (chunk.executiveData.data.count < chunk.executiveData.data.keys.length) {
      createChunk(chunk, chunk.name, 'childChunk', getNewLayerID(chunk.layer), chunk.path, complexType.value[chunk.executiveData.data.keys[chunk.executiveData.data.count]].value, complexType.line, true)
      return true
    } else {
      chunk.returnedData = undefined
      chunk.returnData = { type: 'object', value: chunk.executiveData.data.object }
      chunk.executiveData.data = {}
    }
  }
}