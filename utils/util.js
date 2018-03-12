const formatTime = date => {
  const year = date.getFullYear()
  const month = date.getMonth() + 1
  const day = date.getDate()
  const hour = date.getHours()
  const minute = date.getMinutes()
  const second = date.getSeconds()

  return [year, month, day].map(formatNumber).join('/') + ' ' + [hour, minute, second].map(formatNumber).join(':')
}

const formatNumber = n => {
  n = n.toString()
  return n[1] ? n : '0' + n
}

// 公共的 ajax
function utilAjax (url, data, callback, queryType) {
  var queryType = queryType || 'GET';
  wx.request({
    url: url, //仅为示例，并非真实的接口地址
    data: data,
    method: queryType,
    header: {
      'content-type': 'application/json' // 默认值
    },
    success: function (res) {
      callback(res)
    },
    fail: function (res) {
      wx.showModal({
        title: '请求失败',
        content:  res.errMsg,
        showCancel: false
      })
    }
  })
}

module.exports = {
  formatTime: formatTime,
  utilAjax: utilAjax,
  getDefaultHours: getDefaultHours,
  fileNameCompare: fileNameCompare,
  wxUrl: wxUrl,
  YZMUrl: YZMUrl,
  timeCurrentMillFn: timeCurrentMillFn,
  cutString: cutString
}

// 是否为空对象
function isEmptyObject(e) {
  var t;
  for (t in e)
    return !1;
  return !0
}


function getDefaultHours(time, flag) {
  var now = new Date(parseInt(time) * 1000);
  var year = now.getFullYear();
  var month = now.getMonth() + 1;
  var date = now.getDate();
  var Hours = now.getHours();
  var Minutes = now.getMinutes();
  var Seconds = now.getSeconds();
  var am
  if (month < 10) {
    month = "0" + month
  }
  if (date < 10) {
    date = "0" + date
  }
  if (Hours < 10) {
    Hours = "0" + Hours
  }
  if (Minutes < 10) {
    Minutes = "0" + Minutes
  }
  if (Seconds < 10) {
    Seconds = "0" + Seconds
  }
  if (flag == 0) {
    return `${year}-${month}-${date}  ${Hours}:${Minutes}:${Seconds}`
  } else if (flag == 1) {
    return `${year}.${month}.${date}  ${Hours}.${Minutes}.${Seconds}`

  } else if (flag == 2) {
    return `${year}.${month}.${date}`
  } else if (flag == 3) {
    return `${year}-${month}-${date}  ${Hours}:${Minutes}`
  }
}


// 文件名比较
function fileNameCompare(suffix) {
  return /(gif|jpg|jpeg|GIF|JPG|JPEG|png)/.test(suffix)
}
// 是微信 还是 H5
function wxUrl(suffix) {
  return /(http:\/\/tmp)/.test(suffix)
}
// 印之梦链接
function YZMUrl(suffix) {
  return /(http:\/\/tmp)/.test(suffix)
}

// 取小数点 后两位
function timeCurrentMillFn(timeCurrent){
  if (String(timeCurrent).indexOf('.') != -1) {
    let timeString = String(timeCurrent).split('.')
    let timeString_1 = timeString[1].substr(0, 2)
    let time = timeString[0] + '.' + timeString_1
    return `${time}`;
  } else {
    return `${timeCurrent}`;
  }

}


/**参数说明： 
 
 * 根据长度截取先使用字符串，超长部分追加… 
 
 * str 对象字符串 
 
 * len 目标字节长度 
 
 * 返回值： 处理结果字符串 
 
 */
function cutString(str, len) {

  //length属性读出来的汉字长度为1

  if (str.length * 2 <= len) {

    return str;

  }

  var strlen = 0;

  var s = "";

  for (var i = 0; i < str.length; i++) {

    s = s + str.charAt(i);

    if (str.charCodeAt(i) > 128) {

      strlen = strlen + 2;

      if (strlen >= len) {

        return s.substring(0, s.length - 1) + "...";

      }

    } else {

      strlen = strlen + 1;

      if (strlen >= len) {

        return s.substring(0, s.length - 2) + "...";

      }

    }

  }

  return s;

}
