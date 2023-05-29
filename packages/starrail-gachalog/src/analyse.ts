import * as GachaLogType from './type'


// 参考自云崽
/** 统计计算记录 */
export function analyse(all: GachaLogType.Role[], role: GachaLogType.Role): GachaLogType.Analyse_Res {
  let fiveLog = []
  let fourLog = []
  let fiveNum = 0
  let fourNum = 0
  let fiveLogNum = 0
  let fourLogNum = 0
  let noFiveNum = 0
  let noFourNum = 0
  let wai = 0 // 歪
  let weaponNum = 0
  let weaponFourNum = 0
  let allNum = all.length
  let bigNum = 0
  for (let val of all) {

    role = val
    if (val.rank_type == '4') {
      fourNum++
      if (noFourNum == 0) {
        noFourNum = fourLogNum
      }
      fourLogNum = 0
      if (fourLog[val.name]) {
        fourLog[val.name]++
      } else {
        fourLog[val.name] = 1
      }
      if (val.item_type == '光锥') {
        weaponFourNum++
      }
    }
    fourLogNum++

    if (val.rank_type == '5') {
      fiveNum++
      if (fiveLog.length > 0) {
        fiveLog[fiveLog.length - 1].num = fiveLogNum
      } else {
        noFiveNum = fiveLogNum
      }
      fiveLogNum = 0
      let isUp = false
      // 歪了多少个
      if (val.item_type == '角色') {
        if (checkIsUp(role)) {
          isUp = true
        } else {
          wai++
        }
      } else {
        weaponNum++
      }

      fiveLog.push({
        name: val.name,
        abbrName: val.name,
        item_type: val.item_type,
        num: 0,
        isUp
      })
    }
    fiveLogNum++
  }
  if (fiveLog.length > 0) {
    fiveLog[fiveLog.length - 1].num = fiveLogNum

    // 删除未知五星
    for (let i in fiveLog) {
      if (fiveLog[i].name == '未知') {
        allNum = allNum - fiveLog[i].num
        fiveLog.splice(fiveLog[i], 1)
        fiveNum--
      } else {
        // 上一个五星是不是常驻
        let lastKey = Number(i) + 1
        if (fiveLog[lastKey] && !fiveLog[lastKey].isUp) {
          fiveLog[i].minimum = true
          bigNum++
        } else {
          fiveLog[i].minimum = false
        }
      }
    }
  } else {
    // 没有五星
    noFiveNum = allNum
  }

  // 四星最多
  let four = []
  for (let i in fourLog) {
    four.push({
      name: i,
      num: fourLog[i]
    })
  }
  four = four.sort((a, b) => { return b.num - a.num })

  if (four.length <= 0) {
    four.push({ name: '无', num: 0 })
  }

  let fiveAvg = 0
  let fourAvg = 0
  if (fiveNum > 0) {
    fiveAvg = Number(((allNum - noFiveNum) / fiveNum).toFixed(2))
  }
  if (fourNum > 0) {
    fourAvg = Number(((allNum - noFourNum) / fourNum).toFixed(2))
  }
  // 有效抽卡
  let isvalidNum = 0

  if (fiveNum > 0 && fiveNum > wai) {
    if (fiveLog.length > 0 && !fiveLog[0].isUp) {
      isvalidNum = (allNum - noFiveNum - fiveLog[0].num) / (fiveNum - wai)
    } else {
      isvalidNum = (allNum - noFiveNum) / (fiveNum - wai)
    }
    isvalidNum = Number(isvalidNum.toFixed(2))
  }

  let upYs: string | number = isvalidNum * 160
  if (upYs >= 10000) {
    upYs = (upYs / 10000).toFixed(2) + 'w'
  } else {
    upYs = upYs.toFixed(0)
  }

  // 小保底不歪概率
  let noWaiRate: string | number = 0
  if (fiveNum > 0) {
    noWaiRate = (fiveNum - bigNum - wai) / (fiveNum - bigNum)
    noWaiRate = (noWaiRate * 100).toFixed(1)
  }
  let firstTime = all[all.length - 1].time.substring(0, 16)
  let lastTime = all[0].time.substring(0, 16)
  return {
    allNum,
    noFiveNum,
    noFourNum,
    fiveNum,
    fourNum,
    fiveAvg,
    fourAvg,
    wai,
    isvalidNum,
    maxFour: four[0],
    weaponNum,
    weaponFourNum,
    firstTime,
    lastTime,
    fiveLog,
    upYs,
    noWaiRate
  }
}

function checkIsUp(role: GachaLogType.Role) {
  if (['克拉拉', '杰帕德', '瓦尔特', '布洛妮娅', '白露', '姬子'].includes(role.name)) {
    return false
  }
  // if (role.name == '刻晴') {
  //   let start = new Date('2021-02-17 18:00:00').getTime()
  //   let end = new Date('2021-03-02 15:59:59').getTime()
  //   let logTime = new Date(role.time).getTime()

  //   if (logTime < start || logTime > end) {
  //     return false
  //   } else {
  //     return true
  //   }
  // }

  return true
}
