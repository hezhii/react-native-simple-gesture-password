import React, { PureComponent } from 'react'
import { StyleSheet, View } from 'react-native'

export default class Point extends PureComponent {
  render() {
    const {
      left,
      top,
      radius,
      active,
      inActiveColor,
      activeColor
    } = this.props
    const containerStyle = [
      styles.container,
      {
        left,
        top,
        width: radius * 2,
        height: radius * 2,
        borderRadius: radius,
        borderWidth: 1,
        borderColor: active ? activeColor : inActiveColor
      }
    ]
    const innerRadius = radius / 3
    const innerStyle = {
      backgroundColor: activeColor,
      width: innerRadius * 2,
      height: innerRadius * 2,
      borderRadius: innerRadius
    }
    return (
      <View style={containerStyle}>
        {active && (<View style={innerStyle} />)}
      </View>
    )
  }
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center'
  }
})

