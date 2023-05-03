import { actuator } from "../Main.js"

//取得呼叫長度超出上限的錯誤
export default (chunk) => {
  let string = `[錯誤]: 呼叫長度超過上限 (${chunk.callPath.length} / ${actuator.settings.maxCallLength})
｜區塊: ${chunk.name} (${chunk.id})
｜呼叫路徑: `

  for (let i = 0; i < chunk.callPath.length && i <= 25; i++) {
    if (i === 0) string+=`${chunk.callPath[i].name} (第 ${chunk.callPath[i].line} 行)\n`
    else string+=`｜｜${chunk.callPath[i].name} (第 ${chunk.callPath[i].line} 行)\n`
  }

  if (chunk.callPath.length > 25) string+='...'
 
  return string
}