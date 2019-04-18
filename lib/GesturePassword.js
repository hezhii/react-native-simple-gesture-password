import React, { PureComponent } from 'react'
import { StyleSheet, View, PanResponder } from 'react-native'

import Point from './Point'
import Line from './Line'
import { isInPoint } from './utils';

export default class GesturePassword extends PureComponent {
  static defaultProps = {
    padding: 8,
    scale: 10, // 控制点大小度量，最小点越大
    inActiveColor: '#888', // 未激活时的颜色
    activeColor: '#1890ff', //  激活时的颜色
    lineWidth: 1, // 线宽
    clearDuration: 500, // 完成后延时多久清除
  }

  constructor(props) {
    super(props)
    this.state = {
      points: [],
      lines: []
    }
    this._containerRef = React.createRef()
    this._panResponder = PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => false,
      onPanResponderGrant: this._onStart,
      onPanResponderMove: this._onMove,
      onPanResponderRelease: this._onFinish,
      onPanResponderTerminationRequest: () => false,
    })
    this._path = []
  }

  componentWillUnmount() {
    this._clearTimer()
  }

  _onLayout = () => {
    const ref = this._containerRef.current
    if (ref) {
      ref.measure((x, y, width, height, pageX, pageY) => {
        const { padding, scale } = this.props
        if (width >= height) {
          this._contentSize = height - padding * 2 // 内容区的大小
          // 计算虚拟出的内容区相当于容器的偏移
          this._offset = {
            x: (width - height) / 2 + padding,
            y: padding
          }
        } else {
          this._contentSize = width - padding * 2
          this._offset = {
            x: padding,
            y: (height - width) / 2 + padding
          }
        }
        // 容器的坐标
        this._origin = {
          x: pageX,
          y: pageY
        }
        this._pointRadius = this._contentSize / scale
        this._initPoints()
      })
    }
  }

  _onStart = ({ nativeEvent }) => {
    this._clearTimer() // 移除清除定时
    this._reset() // 重置缓存数据

    const position = {
      x: nativeEvent.pageX,
      y: nativeEvent.pageY,
    }
    const point = this._getPoint(position)
    if (!point) {
      return
    }
    this._addPath(point.index)
    this._activePoint(point)
    this._currentPoint = point
  }

  _onMove = ({ nativeEvent }) => {
    const position = {
      x: nativeEvent.pageX,
      y: nativeEvent.pageY,
    }
    const point = this._getPoint(position)
    if (point) {
      // 经过了一个点，但是没有线，则添加线
      if (!this._currentLine) {
        const line = {
          start: point.origin,
          end: position,
        }
        this._addLine(line)
        this._currentLine = line

        // 如果是移动进入第一个点，则激活改点，并设为当前点
        if (!this._currentPoint) {
          this._activePoint(point)
          this._addPath(point.index)
          this._currentPoint = point
        }
      }
      /*
       * 经过的点不是当前点且改点不在路径中，则激活该点并设置当前线的终点为该点，添加该点到 path 中
       * 同时，添加一条新的线并更新当前点和线
       */
      if (point !== this._currentPoint && !this._path.includes(point.index)) {
        this._activePoint(point)
        this._addPath(point.index)
        this._updateLine(this._currentPoint.origin, point.origin)

        const line = {
          start: point.origin,
          end: position,
        }
        this._addLine(line)
        this._currentLine = line
        this._currentPoint = point
      }
    }
    if (this._currentLine) {
      this._updateLine(this._currentPoint.origin, position)
    }
  }

  _onFinish = () => {
    // 没有绘制过，直接返回
    if (!this._path.length) {
      return
    }
    // 移除最后的线
    this.setState(({ lines }) => {
      lines.pop()
      return {
        lines: [...lines]
      }
    })
    const { onChange, clearDuration } = this.props
    onChange && onChange(this._path.join(''))
    this._timer = setTimeout(this._reset, clearDuration)
  }

  /**
   * 初始化点
   */
  _initPoints() {
    const points = []
    const { x: offsetX, y: offsetY } = this._offset
    const { x: originX, y: originY } = this._origin
    const distance = (this._contentSize - this._pointRadius * 2) / 2 // 点之间的距离
    for (let i = 0; i < 9; i++) {
      const left = offsetX + (i % 3) * distance
      const top = offsetY + Math.floor(i / 3) * distance
      points.push({
        index: i,
        left,
        top,
        origin: { // 圆心
          x: originX + left + this._pointRadius,
          y: originY + top + this._pointRadius
        },
        active: false
      })
    }
    this.setState({
      points
    })
  }

  /**
   * 根据屏幕某处坐标获取点，没有则返回 null
   * @param {*} position
   */
  _getPoint(position) {
    return this.state.points.find(point => isInPoint(position, point.origin, this._pointRadius))
  }

  _activePoint(point) {
    point.active = true
    this.setState(({ points }) => ({
      points: [...points]
    }))
  }

  _addLine(line) {
    this.setState(({ lines }) => ({
      lines: [...lines, line]
    }))
  }

  _addPath(index) {
    if (this._path.includes(index)) {
      return
    }
    this._path.push(index)
  }

  _updateLine(start, end) {
    this._currentLine.start = start
    this._currentLine.end = end
    this.setState(({ lines }) => ({
      lines: [...lines]
    }))
  }

  _clearTimer() {
    if (this._timer) {
      clearTimeout(this._timer)
      this._timer = null
    }
  }

  /**
   * 重置。将点都设置为未激活，移除所有的线，清空当前点、线和路径
   */
  _reset = () => {
    let { points } = this.state
    points = points.map(point => {
      point.active = false
      return point
    })
    this.setState({
      points,
      lines: []
    })
    this._currentLine = null
    this._currentPoint = null
    this._path = []
  }

  _renderPoints() {
    const { points } = this.state
    const { inActiveColor, activeColor } = this.props
    return points.map((point, index) => (
      <Point
        key={'p' + index}
        radius={this._pointRadius}
        inActiveColor={inActiveColor}
        activeColor={activeColor}
        {...point}
      />
    ))
  }

  _renderLines() {
    if (!this._origin) {
      return
    }
    const { lines } = this.state
    const { activeColor, lineWidth } = this.props
    const { x: originX, y: originY } = this._origin
    return lines.map(({ start, end }, index) => {
      return (
        <Line
          key={'l' + index}
          color={activeColor}
          lineWidth={lineWidth}
          start={{
            x: start.x - originX,
            y: start.y - originY
          }}
          end={{
            x: end.x - originX,
            y: end.y - originY,
          }}
        />
      )
    })
  }

  render() {
    return (
      <View
        style={styles.container}
        onLayout={this._onLayout}
        ref={this._containerRef}
        {...this._panResponder.panHandlers}
      >
        {this._renderPoints()}
        {this._renderLines()}
      </View>
    )
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1
  }
})

