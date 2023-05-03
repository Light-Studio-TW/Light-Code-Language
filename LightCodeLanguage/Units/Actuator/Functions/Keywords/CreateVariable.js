import generateID from '../../../../Tools/GenerateID.js'

import checkSyntax from '../../../Analyzer/SyntaxChecker.js'
import getNewLayerID from '../../GetNewLayerID.js'
import { throwError } from '../../ExecuteLoop.js'
import { createChunk } from '../../Main.js'
import getContainer from '../Container.js'

import typesName from '../../../TypesName.json' assert { type: 'json' }

//創建變數
export default (chunk, complexType) => {
  //是否有要設定值
  if (chunk.codeSegment[chunk.executiveData.row+2] !== undefined && chunk.codeSegment[chunk.executiveData.row+2].type === 'operator' && chunk.codeSegment[chunk.executiveData.row+2].value === '=') {
    if (chunk.returnedData === undefined) {
      let chunk2 = [chunk.codeSegment[chunk.executiveData.row+3]]
      for (let i = chunk.executiveData.row+4; i < chunk.codeSegment.length; i++){
        if (checkSyntax(chunk2.concat([chunk.codeSegment[i]])) === undefined) chunk2.push(chunk.codeSegment[i])
        else break
      }
      chunk.executiveData.skip = 1+chunk2.length
      createChunk(chunk, chunk.name, 'childChunk', getNewLayerID(chunk.layer), chunk.path, chunk2, complexType.line, true)
      return true
    } else {
      if (chunk.codeSegment[chunk.executiveData.row+1].type === 'container') {
        if (getContainer(chunk.codeSegment[chunk.executiveData.row+1].value, chunk.layer)) {
          throwError(chunk, { error: true, type: 'running', content: `已有名為 ${chunk.codeSegment[chunk.executiveData.row+1].value} 的 <容器> 存在`, start: complexType.start, end: complexType.end, path: [{ filePath: chunk.path, function: chunk.name, line: chunk.codeSegment[chunk.executiveData.row+1].line }] })
          return
        }
        chunk.containers[generateID(5, Object.keys(chunk.containers))] = { name: chunk.codeSegment[chunk.executiveData.row+1].value, mode: (chunk.executiveData.mode === 'readOnly') ? 'readOnly' : 'normal', value: JSON.parse(JSON.stringify(chunk.returnedData)) }
        chunk.returnedData = undefined
        chunk.returnData = chunk.returnedData
      } else if (chunk.codeSegment[chunk.executiveData.row+1].type === 'object') {
        if (chunk.executiveData.data.object === undefined) {
          if (chunk.returnedData.type !== 'object') {
            throwError(chunk, { error: true, type: 'running', content: `無法分配 <${typesName[chunk.returnedData.type]}> 的值`, start: complexType.start, end: complexType.end, path: [{ filePath: chunk.path, function: chunk.name, line: chunk.codeSegment[chunk.executiveData.row+1].line }] })
            return
          }
          chunk.executiveData.data = { count: 0, object: {}, keys: Object.keys(chunk.codeSegment[chunk.executiveData.row+1].value), setTo: chunk.returnedData }
          createChunk(chunk, chunk.name, 'childChunk', getNewLayerID(chunk.layer), chunk.path, chunk.codeSegment[chunk.executiveData.row+1].value[chunk.executiveData.data.keys[0]].value, complexType.line, true)
          return true
        } else {
          chunk.executiveData.data.object[chunk.executiveData.data.keys[chunk.executiveData.data.count]] = { mode: chunk.codeSegment[chunk.executiveData.row+1].value[chunk.executiveData.data.keys[chunk.executiveData.data.count]].mode, value: chunk.returnedData }
          chunk.executiveData.data.count++
          if (chunk.executiveData.data.count < chunk.executiveData.data.keys.length) {
            createChunk(chunk, chunk.name, 'childChunk', getNewLayerID(chunk.layer), chunk.path, chunk.codeSegment[chunk.executiveData.row+1].value[chunk.executiveData.data.keys[chunk.executiveData.data.count]].value, complexType.line, true)
            return true
          } else {
            for (let item of chunk.executiveData.data.keys) {
              if (getContainer(item, chunk.layer)) {
                throwError(chunk, { error: true, type: 'running', content: `已有名為 ${item} 的 <容器> 存在`, start: complexType.start, end: complexType.end, path: [{ filePath: chunk.path, function: chunk.name, line: chunk.codeSegment[chunk.executiveData.row+1].line }] })
                return
              }
              if (chunk.executiveData.data.setTo.value[item] === undefined) chunk.containers[generateID(5, Object.keys(chunk.containers))] = { name: item, mode: (chunk.executiveData.data.object[item].mode === 'readOnly' || chunk.executiveData.mode === 'readOnly') ? 'readOnly' : 'normal', value: chunk.executiveData.data.object[item].value }
              else chunk.containers[generateID(5, Object.keys(chunk.containers))] = { name: item, mode: (chunk.executiveData.data.object[item].mode === 'readOnly' || chunk.executiveData.mode === 'readOnly') ? 'readOnly' : 'normal', value: JSON.parse(JSON.stringify(chunk.executiveData.data.setTo.value[item])) }
            }
            chunk.returnData = { type: 'object', value: chunk.executiveData.data.object }
            chunk.executiveData.data = {}
            chunk.executiveData.row+=1
            chunk.returnedData = undefined
          }
        }
      }
      chunk.executiveData.row+=chunk.executiveData.skip
    }
  } else {
    if (chunk.codeSegment[chunk.executiveData.row+1].type === 'container') {
      if (getContainer(chunk.codeSegment[chunk.executiveData.row+1].value, chunk.layer)) {
        throwError(chunk, { error: true, type: 'running', content: `已有名為 ${chunk.codeSegment[chunk.executiveData.row+1].value} 的 <容器> 存在`, start: complexType.start, end: complexType.end, path: [{ filePath: chunk.path, function: chunk.name, line: chunk.codeSegment[chunk.executiveData.row+1].line }] })
        return
      }
      chunk.containers[generateID(5, Object.keys(chunk.containers))] = { name: chunk.codeSegment[chunk.executiveData.row+1].value, mode: (chunk.executiveData.mode === 'readOnly') ? 'readOnly' : 'normal', value: { type: 'none', value: '無' }}
      chunk.executiveData.row+=1
      chunk.returnedData = undefined
      chunk.returnData = { type: 'none', value: '無' }
    } else if (chunk.codeSegment[chunk.executiveData.row+1].type === 'object') {
      if (chunk.returnedData === undefined) {
        chunk.executiveData.data = { count: 0, object: {}, keys: Object.keys(chunk.codeSegment[chunk.executiveData.row+1].value) }
        createChunk(chunk, chunk.name, 'childChunk', getNewLayerID(chunk.layer), chunk.path, chunk.codeSegment[chunk.executiveData.row+1].value[chunk.executiveData.data.keys[0]].value, complexType.line, true)
        return true
      } else {
        chunk.executiveData.data.object[chunk.executiveData.data.keys[chunk.executiveData.data.count]] = { mode: chunk.codeSegment[chunk.executiveData.row+1].value[chunk.executiveData.data.keys[chunk.executiveData.data.count]].mode, value: chunk.returnedData }
        chunk.executiveData.data.count++
        if (chunk.executiveData.data.count < chunk.executiveData.data.keys.length) {
          createChunk(chunk, chunk.name, 'childChunk', getNewLayerID(chunk.layer), chunk.path, chunk.codeSegment[chunk.executiveData.row+1].value[chunk.executiveData.data.keys[chunk.executiveData.data.count]].value, complexType.line, true)
          return true
        } else {
          for (let item of chunk.executiveData.data.keys) {
            if (getContainer(item, chunk.layer)) {
              throwError(chunk, { error: true, type: 'running', content: `已有名為 ${item} 的 <容器> 存在`, start: complexType.start, end: complexType.end, path: [{ filePath: chunk.path, function: chunk.name, line: chunk.codeSegment[chunk.executiveData.row+1].line }] })
              return
            }
            chunk.containers[generateID(5, Object.keys(chunk.containers))] = { name: item, mode: (chunk.executiveData.data.object[item].mode === 'readOnly' || chunk.executiveData.mode === 'readOnly') ? 'readOnly' : 'normal', value: chunk.executiveData.data.object[item].value }
          }
          chunk.returnedData = undefined
          chunk.returnData = { type: 'object', value: chunk.executiveData.data.object }
          chunk.executiveData.data = {}
          chunk.executiveData.row+=1
        }
      }
    }
  }
  chunk.executiveData.mode = undefined
}