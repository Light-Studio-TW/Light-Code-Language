export { getLogContent }

//取得輸出內容
function getLogContent (complexType, layer) {
  if (complexType.type === 'keyword') return `[關鍵字: ${complexType.value}]`
  else if (complexType.type === 'array') {
    if (layer > 0) return `[陣列: ${complexType.value.length}]`
    else {
      let items = []
      complexType.value.map((item) => items.push(getLogContent(item, 0)))
      return `[${items.join(', ')}]`
    }
  } else if (complexType.type === 'object') {
    let keys = Object.keys(complexType.value)
    let items = []
    keys.map((item) => items.push(getLogContent(complexType.value[item], 0)))
    return `{${items.join(', ')}}`
  }
}

//輸出內容
function logContent (parameters) {

}