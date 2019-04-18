/**
 * 获取两点间的距离
 * @param {*} start 
 * @param {*} end 
 */
function getDistance(start, end) {
  return Math.sqrt(Math.pow(Math.abs(start.x - end.x), 2) + Math.pow(Math.abs(start.y - end.y), 2))
}

/**
 * 判断某个坐标是否在点内
 * @param {*} location 
 * @param {*} origin - 点的圆心
 * @param {*} radius - 半径
 */
export function isInPoint(location, origin, radius) {
  return radius > getDistance(location, origin)
}

/**
 * 获取连线的 transform 属性
 * @param {*} start 
 * @param {*} end 
 */
export function getLineTransform(start, end) {
  const distance = getDistance(start, end)
  const rotateRad = Math.acos((end.x - start.x) / distance)
  if (start.y > end.y) {
    rotateRad = Math.PI * 2 - rotateRad
  }

  const translateX = (end.x + start.x) / 2 - start.x - distance / 2
  const translateY = (end.y + start.y) / 2 - start.y

  return {
    distance,
    rotateRad,
    translateX,
    translateY,
  }
}