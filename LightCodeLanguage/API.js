import { createActuator, runActuator } from './Units/ActuatorManager/ActuatorManager.js'

//執行器
class Actuator {
  #id
  constructor (mainFilePath, settings) {
    this.#id = createActuator(mainFilePath, settings)
  }

  //運行執行器
  run () {
    runActuator(this.#id)
    return this
  }
}

export { Actuator }