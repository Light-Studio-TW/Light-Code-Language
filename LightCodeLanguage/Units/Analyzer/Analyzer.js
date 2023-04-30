import { fileURLToPath } from 'url'
import { dirname } from 'path'

import complexTypesAnalyzer from "./ComplexTypesAnalyzer.js"
import simpleTypesAnalyzer from "./SimpleTypesAnalyzer.js"
import expressionAnalyzer from './ExpressionAnalyzer.js'
import checkSyntax from './SyntaxChecker.js'

const __dirname = `${dirname(fileURLToPath(import.meta.url))}.js`

//分析
export default (code, filePath) => {
  let simpleTypes = simpleTypesAnalyzer(code)
  if (!Array.isArray(simpleTypes)) {
    simpleTypes.path.push({ filePath: __dirname, function: '{分析器}' })
    return Object.assign(simpleTypes, { filePath })
  }
  let complexTypes = complexTypesAnalyzer(simpleTypes)
  if (!Array.isArray(complexTypes)) {
    complexTypes.path.push({ filePath: __dirname, function: '{分析器}' })
    return Object.assign(complexTypes, { filePath })
  }
  let complexType2 = expressionAnalyzer(complexTypes)
  if (!Array.isArray(complexTypes)) {
    complexType2.path.push({ filePath: __dirname, function: '{分析器}' })
    return Object.assign(complexType2, { filePath })
  }
  for (let i = 1; i <= complexType2[complexType2.length-1].line; i++) {
    let chunk = []
    complexType2.map((item) => {
      if (item.line === i) chunk.push(item)
    })
    let data = checkSyntax(chunk)
    if (data !== undefined) return data
  } 
  return complexType2
}