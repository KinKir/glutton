import { map, isArray } from 'lodash'

export function call (server, name, params = []) {
  if (server.secret) params.unshift(`token:${server.secret}`)
  var uri = `http${server.ssl ? 's' : ''}://${server.host}:${server.port}/${server.extension}`
  return fetch(uri, {
    method: 'post',
    body: JSON.stringify({
      'jsonrpc': '2.0',
      'id': 'Glutton',
      'method': name,
      'params': params || []
    })
  })
  .catch(function () {
    throw new Error('Can not connect to the server.')
  })
  .then(res => res.json())
  .then(res => res.result)
  .then(function (result) {
    if (result.code) throw new Error(result.message)
    return result
  })
}

export function multicall (server, calls) {
  if (!isArray(calls)) calls = map(calls, (value, key) => ({ methodName: key, params: value || [] }))
  if (server.secret) {
    calls.forEach(function (call) {
      call.params.unshift(`token:${server.secret}`)
    })
  }
  var uri = `http${server.ssl ? 's' : ''}://${server.host}:${server.port}/${server.extension}`
  return fetch(uri, {
    method: 'post',
    body: JSON.stringify({
      'jsonrpc': '2.0',
      'id': 'Glutton',
      'method': 'system.multicall',
      'params': [calls]
    })
  })
  .catch(function () {
    throw new Error('Can not connect to the server.')
  })
  .then(res => res.json())
  .then(res => res.result.map(value => value[0]))
  .then(function (results) {
    results.forEach(result => {
      if (result.code) throw new Error(result.message)
    })
    return results
  })
}