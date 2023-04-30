import { actuator } from "./Main.js"

//取得新的層的ID
export default (layerID) => {
  let allLayerID = []
  Object.keys(actuator.chunks).map((item) => allLayerID.push(item.layerID))
  let i = 0
  while (allLayerID.includes[`${layerID}.${i}`]) i++
  return `${layerID}.${i}`
}