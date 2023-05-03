//將類型轉換成數字
export default (complexType) => {
  if (complexType.type === 'string') {
    if (isNaN(complexType.value)) return { type: 'nan', value: '非數' }
    else return { type: 'number', value: complexType.value }
  } else if (complexType.type === 'number') return { type: 'number', value: complexType.value }
  else if (complexType.type === 'nan') return { type: 'nan', value: '非數' }
  else if (complexType.type === 'boolean') {
    if (complexType.value === '是') return { type: 'number', value: '1' }
    else if (complexType.value === '否') return { type: 'number', value: '0' }
  } else if (complexType.type === 'keyword') return { type: 'nan', value: '非數' }
  else if (complexType.type === 'array') return { type: 'number', value: `${complexType.value.length}` }
  else if (complexType.type === 'object') return { type: 'number', value: `${Object.keys(complexType.value)}` }
  else if (complexType.type === 'function') return { type: 'nan', value: '非數' }
  else if (complexType.type === 'promise') return { type: 'nan', value: '非數' }
}