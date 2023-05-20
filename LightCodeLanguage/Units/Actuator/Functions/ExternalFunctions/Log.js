export { logContent, getLogContent }

import log from '../../Log.js'

//取得輸出內容
function getLogContent (complexType, layer) {
  if (complexType.type === 'keyword') return `[關鍵字: ${complexType.value}]`
  else if (complexType.type === 'array') {
    if (layer > 0) return `[陣列: ${complexType.value.length}]`
    else {
      let items = []
      complexType.value.map((item) => items.push(getLogContent(item, layer+1)))
      return `[${items.join(', ')}]`
    }
  } else if (complexType.type === 'object') {
    let keys = Object.keys(complexType.value)
    let items = []
    keys.map((item) => items.push(getLogContent(complexType.value[item], layer+1)))
    return `{${items.join(', ')}}`
  } else if (complexType.type === 'function') {
    return `[函數: (${complexType.parameters.join(', ')})]`
  } else {
    return complexType.value
  }
}

//輸出內容
function logContent (chunk, complexType, parameters) {
  let content = []
  parameters.forEach((item) => content.push(getLogContent(item, 0)))
  log('normal', content.join(', '), complexType.line)
}