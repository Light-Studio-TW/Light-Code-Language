import { fileURLToPath } from 'url'
import { dirname } from 'path'

import typesName from '../TypesName.json' assert { type: 'json' }

const __dirname = `${dirname(fileURLToPath(import.meta.url))}.js`

const relevance = {
  string: ['operator', 'parameters', 'index'],
  number: ['operator', 'index'],
  nan: ['operator'],
  boolean: ['operator'],
  none: ['operator'],
  operator: ['string', 'number', 'nan', 'boolean', 'none', 'keyword', 'container', 'array', 'parameters', 'object', 'key', 'index'], //Chunk不會出現在運算符後面
  expression: [],
  symbol: ['string', 'number', 'nan', 'boolean', 'none', 'symbol', 'keyword', 'container', 'array', 'parameters', 'object', 'key', 'index'], //Chunk不會出現在運算符後面
  keyword: ['string', 'number', 'nan', 'boolean', 'none', 'symbol', 'keyword', 'container', 'array', 'parameters', 'object', 'key', 'index', 'chunk'],
  container: ['operator', 'keyword', 'parameters', 'key', 'index'],
  array: ['operator', 'keyword', 'parameters', 'index'],
  parameters: ['operator'],
  object: ['operator', 'keyword'],
  key: ['operator', 'keyword', 'parameters', 'index'],
  index: ['operator', 'keyword', 'parameters', 'key', 'index'],
  chunk: []
}

//檢查語法
export default (complexTypes, addErrorContent) => {
  for (let i = 0; i < complexTypes.length; i++) {
    if (complexTypes[i+1] !== undefined && !relevance[complexTypes[i].type].includes(complexTypes[i+1].type)) {
      return { error: true, type: 'analysis', content: `多出了一個 <${typesName[complexTypes[i+1].type]}>${(addErrorContent === undefined) ? '' : addErrorContent}`, start: complexTypes[i+1].start, end: complexTypes[i+1].end, path: [{ filePath: __dirname, function: '{語法檢查器}', line: complexTypes[i+1].line }] }
    } else if (complexTypes[i].type === 'operator' && (complexTypes[i].value === '+' || complexTypes[i].value === '-') && complexTypes[i+1] === undefined) {
      return { error: true, type: 'analysis', content: `多出了一個 <運算符> "${complexTypes[i].value}"${(addErrorContent === undefined) ? '' : addErrorContent}`, start: complexTypes[i].start, end: complexTypes[i].end, path: [{ filePath: __dirname, function: '{語法檢查器}', line: complexTypes[i].line }] }
    } else if (complexTypes[i].type === 'operator' && complexTypes[i+1] === undefined) {
      return { error: true, type: 'analysis', content: `多出了一個 <運算符> "${complexTypes[i].value}"${(addErrorContent === undefined) ? '' : addErrorContent}`, start: complexTypes[i].start, end: complexTypes[i].end, path: [{ filePath: __dirname, function: '{語法檢查器}', line: complexTypes[i].line }] }
    } else if (complexTypes[i].type === 'operator' && (complexTypes[i].value !== '+' && complexTypes[i].value !== '-') && (complexTypes[i-1] === undefined || complexTypes[i+1] === undefined)) {
      return { error: true, type: 'analysis', content: `必須為一個 <運算式>${(addErrorContent === undefined) ? '' : addErrorContent}`, start: complexTypes[i].start, end: complexTypes[i].end, path: [{ filePath: __dirname, function: '{語法檢查器}', line: complexTypes[i].line }] }
    } else if (complexTypes[i].type === 'keyword' && complexTypes[i].value === '變數' && (complexTypes[i+1].type === undefined || (complexTypes[i+1].type !== 'container' && complexTypes[i+1].type !== 'object'))) {
      return { error: true, type: 'analysis', content: `多出了一個 <${typesName[complexTypes[i+1].type]}>${(addErrorContent === undefined) ? '' : addErrorContent}`, start: complexTypes[i+1].start, end: complexTypes[i+1].end, path: [{ filePath: __dirname, function: '{語法檢查器}', line: complexTypes[i+1].line }] }
    }
  }
}