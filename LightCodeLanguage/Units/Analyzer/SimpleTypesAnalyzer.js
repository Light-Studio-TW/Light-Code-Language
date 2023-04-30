import keywords from '../Keywords.json' assert { type: 'json' }

const operators = ['+', '+=', '-', '-=', '*', '*=', '/', '/=', '>', '>=', '<', '<=', '=', '==', '或', '且']

//簡易類型分析器
export default (code) => {
  let simpleTypes = []
  let state = {}
  let layer = 0
  let line = 1
  for (let i = 0; i < code.length; i++) {
    if (code[i] === '\n') {
      if (state.nowType === 'string') state.value+='\n'
      else if (state.nowType !== undefined) {
        simpleTypes.push({ type: state.nowType, value: state.value, start: state.start, end: i-1, line, layer })
        state = {}
      }
      line++
    } else if (code[i] === ' ') {
      if (state.nowType === 'string') state.value+=' '
      else if (state.nowType !== undefined) {
        simpleTypes.push({ type: state.nowType, value: state.value, start: state.start, end: i-1, line, layer })
        state = {}
      }
    } else if (state.nowType !== 'string' && (code[i] === '{' || code[i] === '(' || code[i] === '[')) {
      if (state.nowType !== undefined) {
        simpleTypes.push({ type: state.nowType, value: state.value, start: state.start, end: i-1, line, layer })
        state = {}
      }
      simpleTypes.push({ type: 'symbol', value: code[i], start: i, end: i, line, layer })
      layer++
    } else if (state.nowType !== 'string' && (code[i] === '}' || code[i] === ')' || code[i] === ']')) {
      if (state.nowType !== undefined) {
        simpleTypes.push({ type: state.nowType, value: state.value, start: state.start, end: i-1, line, layer })
        state = {}
      }
      layer--
      simpleTypes.push({ type: 'symbol', value: code[i], start: i, end: i, line, layer })
    } else if (state.nowType !== 'string' && (code[i] === ':' || code[i] === ',')) {
      if (state.nowType !== undefined) {
        simpleTypes.push({ type: state.nowType, value: state.value, start: state.start, end: i-1, line, layer })
        state = {}
      }
      simpleTypes.push({ type: 'symbol', value: code[i], start: i, end: i, line, layer })
    } else if (state.nowType === undefined) {

      if (code[i] === "'" || code[i] === '"') state = { nowType: 'string', value: '', symbol: code[i], start: i, startLine: line, layer }
      else if (!isNaN(+code[i]) && code[i] !== '') state = { nowType: 'number', value: code[i], start: i, startLine: line, layer }
      else if (code[i].substring(i, i+2) === '非數') {
        simpleTypes.push({ type: 'nan', value: '非數', start: i, end: i+1, line, layer })
        i++
      } else if (code[i] === '無') simpleTypes.push({ type: 'none', value: '無', start: i, end: i, line, layer })
      else if (code[i] === '是' || code[i] === '否') simpleTypes.push({ type: 'boolean', value: code[i], start: i, end: i, line, layer })
      else if (operators.includes(code.substring(i, i+2))) {
        simpleTypes.push({ type: 'operator', value: code.substring(i, i+2), start: i, end: i+1, line, layer })
        i++
      } else if (operators.includes(code[i])) simpleTypes.push({ type: 'operator', value: code[i], start: i, end: i, line, layer })
      else if (keywords.includes(code.substring(i, i+4))) {
        simpleTypes.push({ type: 'keyword', value: code.substring(i, i+4), start: i, end: i+3, line, layer })
        i+=4
      } else if (keywords.includes(code.substring(i, i+3))) {
        simpleTypes.push({ type: 'keyword', value: code.substring(i, i+3), start: i, end: i+2, line, layer })
        i+=3
      } else if (keywords.includes(code.substring(i, i+2))) {
        simpleTypes.push({ type: 'keyword', value: code.substring(i, i+2), start: i, end: i+1, line, layer })
        i+=2
      } else if (keywords.includes(code[i])) {
        simpleTypes.push({ type: 'keyword', value: code[i], start: i, end: i, line, layer })
        i++
      } else if (code[i] === '.') {
        state = { nowType: 'key', value: '', start: i, startLine: line, layer }
      } else state = { nowType: 'container', value: code[i], start: i, startLine: line, layer }
    } else {
      if (state.nowType === 'string') {
        if (state.symbol === code[i] && state.layer === layer) {
          simpleTypes.push({ type: 'string', value: state.value, start: state.start, end: i, line: state.startLine, layer })
          state = {}
        } else state.value+=code[i]
      } else if (state.nowType === 'number') {
        if (isNaN(+code[i])) {
          simpleTypes.push({ type: 'number', value: state.value, start: state.start, end: i-1, line, layer })
          state = {}
          i--
        } else state.value+=code[i]
      } else if (state.nowType === 'key') {
        if (code[i] === "'" || code[i] === '"' || operators.includes(code[i])) {
          if (state.value.length > 0) simpleTypes.push({ type: 'key', value: state.value, start: state.start, end: i-1, line, layer })
          state = {}
          i--
        } else state.value+=code[i]
      } else if (state.nowType === 'container') {
        if (code[i] === "'" || code[i] === '"' || operators.includes(code[i]) || code[i] === '.') {
          simpleTypes.push({ type: 'container', value: state.value, start: state.start, end: i-1, line, layer })
          state = {}
          i--
        } else state.value+=code[i]
      }
    }
  }
  if (state.nowType === 'string') return { error: true, type: 'analysis', content: `<字串> 的尾端缺少 ${state.symbol}`, start: state.start, end: code.length-1, path: [{ function: '{簡易類型分析器}', line: state.startLine }] }
  else if (state.nowType !== undefined) simpleTypes.push({ type: state.nowType, value: state.value, start: state.start, end: code.length-1, line, layer })
  return simpleTypes
}