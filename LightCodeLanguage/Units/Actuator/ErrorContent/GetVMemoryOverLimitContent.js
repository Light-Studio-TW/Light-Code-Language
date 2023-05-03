import getVariableSize from "../../../Tools/GetVariableSize.js"

import { actuator } from "../Main.js"

//將數字轉換成帶有單位的數字
function getNumberWithUnit (number) {
  if (number >= 1000000000) {
    return `${Math.round((number/1000000000)*100)/100} GB`
  } else if (number >= 1000000) {
    return `${Math.round((number/1000000)*100)/100} MB`
  } else if (number >= 1000) {
    return `${Math.round((number/1000)*100)/100} KB`
  } else {
    return `${number} Bytes`
  }
}

//取得虛擬記憶體超出上限的錯誤內容
export default () => {
  let size = {
    settings: getVariableSize(actuator.id)+getVariableSize('id')+getVariableSize(actuator.settings)+getVariableSize('settings')+getVariableSize(actuator.mainFilePath)+(getVariableSize('mainFilePath')),
    execute: getVariableSize(actuator.state)+getVariableSize('state')+getVariableSize(actuator.code)+getVariableSize('code')+getVariableSize(actuator.executiveData)+getVariableSize('executiveData')+getVariableSize(actuator.caches)+getVariableSize('caches')+getVariableSize(actuator.returnData)+getVariableSize('returnData')+getVariableSize('chunks'),
    chunks: getVariableSize(actuator.chunks)
  }

  let string = `[錯誤]: 使用的虛擬憶體超出上限 (${getNumberWithUnit(actuator.state.vMem)} / ${getNumberWithUnit(actuator.settings.vMemCanUse)})

擬記憶體使用狀態:
｜執行器: ${getNumberWithUnit(actuator.state.vMem)}
｜｜設定資料: ${getNumberWithUnit(size.settings)} (${Math.round((100/actuator.state.vMem)*size.settings)}%)
｜｜執行資料: ${getNumberWithUnit(size.execute)} (${Math.round((100/actuator.state.vMem)*size.execute)}%)
｜｜區塊資料: ${getNumberWithUnit(size.chunks)} (${Math.round((100/actuator.state.vMem)*size.chunks)}%)
｜｜｜`

  let chunks = Object.keys(actuator.chunks).sort((a, b) => {
    return (getVariableSize(actuator.chunks[a])+getVariableSize(a))-(getVariableSize(actuator.chunks[b])+getVariableSize(b))
  })
  
  //顯示虛擬記憶體用最多的前五個區塊的資料
  for (let i = 0; i < 5 && i < chunks.length; i++) {
    let chunk = actuator.chunks[chunks[i]]
    let size2 = {
      total: undefined,
      execute: getVariableSize(chunks[i])+getVariableSize(chunk.id)+getVariableSize('id')+getVariableSize(chunk.name)+getVariableSize('name')+getVariableSize(chunk.type)+getVariableSize('type')+getVariableSize(chunk.layerID)+getVariableSize('layerID')+getVariableSize(chunk.path)+getVariableSize('path')+getVariableSize(chunk.callPath)+getVariableSize('callPath')+getVariableSize(chunk.state)+getVariableSize('state')+getVariableSize(chunk.executiveData)+getVariableSize('executiveData')+getVariableSize('containers')+getVariableSize(chunk.returnedData)+getVariableSize('returnedData')+getVariableSize(chunk.returnData)+getVariableSize('returnData'),
      codeSegment: getVariableSize(chunk.codeSegment)+getVariableSize('codeSegment'),
      containers: getVariableSize(chunk.containers)
    }
    size2.total = size2.execute+size2.codeSegment+size2.containers

    let containers = Object.keys(chunk.containers).sort((a, b) => {
      return (getVariableSize(chunk.containers[a])+getVariableSize(a))-(getVariableSize(chunk.containers[b])+getVariableSize(b))
    })
    let containersText = ''
    containers.map((item) => {
      containersText+=`｜｜｜｜｜${chunk.containers[item].name} ${getNumberWithUnit(getVariableSize(chunk.containers[item])+getVariableSize(item))}\n`
    })

    string+=`\n｜｜｜${chunk.name}(${chunk.id}): ${getNumberWithUnit(size2.total)} (${Math.round((100/size.chunks)*size2.total)}%)
｜｜｜｜由 ${(chunk.callPath.length < 1) ? '執行器' : `區塊 ${actuator.chunks[chunk.callPath[chunk.callPath.length-1]].name}(${chunk.callPath[chunk.callPath.length-1]})`} 創建
｜｜｜｜執行資料: ${getNumberWithUnit(size2.execute)} (${Math.round((100/size2.total)*size2.execute)}%)
｜｜｜｜代碼片段: ${getNumberWithUnit(size2.codeSegment)} (${Math.round((100/size2.total)*size2.codeSegment)}%)
｜｜｜｜容器: ${getNumberWithUnit(size2.containers)} (${Math.round((100/size2.total)*size2.containers)}%)
${(containersText === '') ? '｜｜｜｜' : containersText}
`
  }

  return string
}