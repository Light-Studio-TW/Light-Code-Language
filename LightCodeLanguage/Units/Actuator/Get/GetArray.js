import getNewLayerID from '../GetNewLayerID.js'
import { createChunk } from '../Main.js'

//取得陣列
export default (chunk, complexType) => {
  if (chunk.returnedData === undefined) {
    chunk.executiveData.data = { count: 0, array: [] }
    createChunk(chunk, chunk.name, 'childChunk', getNewLayerID(chunk.layer), chunk.path, complexType.value[0], complexType.line, true)
    return true
  } else {
    chunk.executiveData.data.array.push(chunk.returnedData)
    chunk.executiveData.data.count++
    if (chunk.executiveData.data.count < complexType.value.length) {
      createChunk(chunk, chunk.name, 'childChunk', getNewLayerID(chunk.layer), chunk.path, complexType.value[chunk.executiveData.data.count], complexType.line, true)
      return true
    } else {
      chunk.returnedData = undefined
      chunk.returnData = { type: 'array', value: chunk.executiveData.data.array }
      chunk.executiveData.data = {}
    }
  }
}