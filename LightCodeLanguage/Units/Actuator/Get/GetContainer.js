import { actuator } from '../Main.js'

//使用連結取得容器
function getContainerByLink (address) {
  if (actuator.chunks[address.split('.')[0]] === undefined || actuator.chunks[address.split('.')[0]].containers[address.split('.')[1]] === undefined) return { address, value: { type: 'none', value: '無' }}
  else return { address, mode: actuator.chunks[address.split('.')[0]].containers[address.split('.')[1]].mode, value: actuator.chunks[address.split('.')[0]].containers[address.split('.')[1]].value  }
}

//取得容器
export default (name, layer) => {
  let keys = Object.keys(actuator.chunks)
  for (let item of keys) {
    if (layer.substring(0, actuator.chunks[item].layer.length) === actuator.chunks[item].layer) {
      let chunk = actuator.chunks[item]
      let keys2 = Object.keys(chunk.containers)
      for (let item2 of keys2) {
        if (chunk.containers[item2].name === name) {
          if (chunk.containers[item2].value.type === 'link') return getContainerByLink(chunk.containers[item2].value.value)
          else return { address: `${chunk.id}.${item2}`, mode: chunk.containers[item2].mode, value: chunk.containers[item2].value }
        }
      }
    }
  }
}