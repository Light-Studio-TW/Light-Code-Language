import createVariable from './Keywords/CreateVariable.js'
import createFunction from './Keywords/CreateFunction.js'
import Return from './Keywords/Return.js'
import link from './Keywords/Link.js'

//執行關鍵字
export default (chunk, complexType) => {
  if (complexType.value === '連結') link(chunk, complexType)
  else if (complexType.value === '變數') {
    if (createVariable(chunk, complexType)) return true
  }
  else if (complexType.value === '唯讀') chunk.executiveData.mode = 'readOnly'
  else if (complexType.value === '函數') {
    if (createFunction(chunk, complexType)) return true
  } else if (complexType.value === '返回') {
    if (Return(chunk, complexType)) return true
  } else if (complexType.value === '等待') chunk.executiveData.mode = 'wait'
  else if (complexType.value === '異同步') chunk.executiveData.mode = 'async'
}