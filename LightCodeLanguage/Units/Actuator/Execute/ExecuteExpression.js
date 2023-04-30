import getNewLayerID from "../GetNewLayerID.js"
import { createChunk } from "../Main.js"

//執行運算式
export default (chunk, complexType) => {
  if (chunk.returnedData === undefined) {
    chunk.executiveData.data = { count: 0, values: [] }
    createChunk(chunk, chunk.name, 'childChunk', getNewLayerID(chunk.layer), chunk.path, complexType.value[0], complexType.line, true)
    return true
  } else {
    chunk.executiveData.data.values.push(chunk.returnedData)
    chunk.executiveData.data.count++
    if (chunk.executiveData.data.count < complexType.value.length) {
      if (typeof complexType.value[chunk.executiveData.data.count] !== 'object') chunk.returnedData = complexType.value[chunk.executiveData.data.count]
      else createChunk(chunk, chunk.name, 'childChunk', getNewLayerID(chunk.layer), chunk.path, complexType.value[chunk.executiveData.data.count], complexType.line, true)
      return true
    } else {
      //還沒做完
      chunk.returnedData = undefined
      chunk.executiveData.data = {}
    }
  }
}