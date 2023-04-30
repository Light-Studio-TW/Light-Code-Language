import { getFileName } from '../../Tools/Path.js'

//取得輸出錯誤的內容
export default (errorData) => {
  let string = `[${getErrorTypeName(errorData.type)}]: ${errorData.content}\n｜檔案路徑: ${errorData.path[0].filePath}\n｜位置: `
  errorData.path.map((item, row) => {
    if (row < 1) string+=`${getPathContent(item.filePath, item.function, item.line)}\n`
    else string+=`｜｜${getPathContent(item.filePath, item.function, item.line)}\n`
  })
  return string
}

//取得錯誤的名稱
function getErrorTypeName (type) {
  if (type === 'analysis') return '分析錯誤'
  else if (type === 'running') return '執行錯誤'
}

//取得路徑的內容
function getPathContent (filePath, func, line) {
  if (func === '全局') {
    return `${getFileName(filePath)} 的第 ${line} 行`
  } else {
    if (func.includes('{') && func.includes('}')) {
      if (line === undefined) return `${getFileName(filePath)} 的 ${func}`
      else return `${getFileName(filePath)} 的第 ${line} 行 ${func}`
    }
    return `${getFileName(filePath)} 的第 ${line} 行 (${func})`
  }
}