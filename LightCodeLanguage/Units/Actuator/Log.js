import { parentPort } from 'node:worker_threads'

import generateID from '../../Tools/GenerateID.js'

let messages = {}

parentPort.addListener('message', (msg) => {
  if (msg.type === 'return') {
    if (messages[msg.id] !== undefined) {
      messages[msg.id](msg.data)
      delete messages[msg.id]
    }
  }
})

//輸出東西
export default (type, content, line) => {
  return new Promise((resolve, reject) => {
    let id = generateID(5, Object.keys(messages))
    messages[id] = () => resolve()
    parentPort.postMessage({ id, type: 'log', data: { type, content, line }})
  })
}