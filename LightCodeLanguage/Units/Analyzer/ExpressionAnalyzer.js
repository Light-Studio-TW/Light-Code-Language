import checkSyntax from "./SyntaxChecker.js"

//運算式分析器
export default (complexTypes, filePath) => {
  let complexTypes2 = []
  let state = {}
  for (let i = 0; i < complexTypes.length; i++) {
    if (state.nowType === undefined) {
      if (complexTypes[i].type === 'operator' && (complexTypes[i].value !== '++' && complexTypes[i].value !== '+=' && complexTypes[i].value !== '--' && complexTypes[i].value !== '-=' && complexTypes[i].value !== '*=' && complexTypes[i].value !== '/=' && complexTypes[i].value !== '=') && complexTypes2[complexTypes2.length-1] !== undefined && complexTypes[i+1] !== undefined) {
        let chunk = [complexTypes2[complexTypes2.length-1]]
        let i2 = complexTypes2.length-2
        complexTypes2.splice(complexTypes2.length-1, 1)
        while (checkSyntax(chunk, filePath) === undefined && i2 >= 0) {
          if (complexTypes2[i2].type === 'operator' && (complexTypes2[i2].value === '=' || complexTypes2[i2].value === '+=' || complexTypes2[i2].value === '-=' || complexTypes2[i2].value === '*=' || complexTypes2[i2].value === '/=')) break
          chunk.splice(0, 0, complexTypes[i2])
          complexTypes2.splice(i2, 1)
          i2--
        }
        state = { nowType: 'expression', value: [chunk, complexTypes[i].value, []], startLine: complexTypes.startLine, layer: complexTypes.layer }
      } else complexTypes2.push(complexTypes[i])
    } else {
      if (state.nowType === 'expression') {
        if (complexTypes[i].type === 'operator' && (complexTypes[i].value !== '=' && complexTypes[i].value !== '+=' && complexTypes[i].value !== '-=' && complexTypes[i].value !== '*=' && complexTypes[i].value !== '/=') && complexTypes[i-1] !== undefined && complexTypes[i+1] !== undefined) {
          state.value.push(complexTypes[i].value)
          state.value.push([])
        } else {
          let data = checkSyntax(state.value[state.value.length-1].concat([complexTypes[i]]), filePath)
          if (data !== undefined) {
            complexTypes2.push({ type: 'expression', value: state.value, start: state.value[0][0].start, end: state.value[state.value.length-1][state.value[state.value.length-1].length-1].end, line: state.startLine, layer: state.layer })
            state = {}
          } else {
            state.value[state.value.length-1].push(complexTypes[i])
          }
        }
      }
    }
  }
  if (state.nowType !== undefined) complexTypes2.push({ type: 'expression', value: state.value, start: state.value[0][0].start, end: state.value[state.value.length-1][state.value[state.value.length-1].length-1].end, line: state.startLine, layer: state.layer })
  return complexTypes2
}