import React from 'react'
import { View } from 'react-native'

import { getLineTransform } from './utils'

export default ({ color, lineWidth, start, end }) => {
  const transform = getLineTransform(start, end)
  const style = {
    position: 'absolute',
    backgroundColor: color,
    width: transform.distance,
    height: lineWidth,
    left: start.x,
    top: start.y,
    transform: [
      { translateX: transform.translateX },
      { translateY: transform.translateY },
      { rotateZ: transform.rotateRad + 'rad' }
    ]
  }
  return (
    <View style={style} />
  )
}
