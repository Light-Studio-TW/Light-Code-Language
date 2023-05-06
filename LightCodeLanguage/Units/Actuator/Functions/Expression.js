import { getLogContent } from './ExternalFunctions/Log.js'
import getNewLayerID from '../GetNewLayerID.js'
import typeToNumber from '../TypeToNumber.js'
import { createChunk } from '../Main.js'

export { calculateExpression, expression }

//計算運算式
function calculateExpression (values) {
  let type = 'number'
  for (let item of values) {
    if (typeof item === 'object' && item.type === 'string') {
      type = 'string'
      break
    }
  }
  let string = ''
  for (let item of values) {
    if (typeof item === 'object') {
      if (type === 'number') {
        let data = typeToNumber(item)
        if (data.type === 'number') string+=data.value
        else if (data.type === 'nan') string+='NaN'
      } else if (type === 'string') string+=`'${getLogContent(item, 0)}'`
    } else {
      if (item === '==') string+='==='
      else if (item === '或') string +='||'
      else if (item === '且') string +='&&'
      else string+=item
    }
  }
  let result = eval?.(string)
  if (typeof result === 'string') return { type: 'string', value: result }
  else if (typeof result === 'number') return { type: 'number', value: `${result}` }
  else if (isNaN(result)) return { type: 'nan', value: '非數' }
  else if (typeof result === 'boolean') {
    if (result) return { type: 'boolean', value: '是' }
    else return { type: 'boolean', value: '否' }
  }
}

//執行運算式
function expression (chunk, complexType) {
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
      chunk.returnedData = undefined
      chunk.returnData = calculateExpression(chunk.executiveData.data.values)
      chunk.executiveData.data = {}
    }
  }
}