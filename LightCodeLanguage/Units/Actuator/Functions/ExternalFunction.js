import { logContent } from './ExternalFunctions/Log.js'

//外部函數
export default (chunk, complexType, container, parameters) => {
  if (container.name === '輸出') logContent(chunk, complexType, parameters)
}