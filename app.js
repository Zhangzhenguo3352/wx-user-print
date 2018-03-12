// 是否为空对象
function isEmptyObject(e) {
  var t;
  for (t in e)
    return !1;
  return !0
}

//app.js
App({
  data:{
    fileList: [], // 上传文件的数据 路径 
    currentType: 0,
    fileInfo: [], // 文件信息
    location_longitude:'',
    location_latitude: '',
    num: 0,
    userAuth: 22
  },
  /**
	 * 生命周期函数--监听页面显示
	 */
  onShow: function () {
  },




	onLaunch: function () {
    var openId = wx.getStorageSync('openid')
    var that = this
    console.log('thats', that)
    var location_longitude = ''
    var location_latitude= ''
    // 2.获取并设置当前位置经纬度
    wx.getLocation({
      type: "gcj02",
      success: (res) => {
        location_longitude = res.longitude,
        location_latitude = res.latitude
        console.log('获取成功', that.data)
        that.data.userAuth = 33
        // that.setData({
        //   userAuth: 33
        // })
      },
      fail: function(res) {
        console.log('获取地理位置失败', res)
      }
    });

      // 登录
      wx.login({
        success: res => {
          that.globalData.code = res.code
          //发送 res.code 到后台换取 openId, sessionKey, unionId
          if (res.code) {
            wx.request({
              url: that.globalData.url + '/wechat/getSessionKey',
              data: {
                code: res.code
              },
              success: function (ress) {

                if (ress.data.code == 1) {
                  // 获取系统权限设置

                  wx.getUserInfo({
                    success: ress_userInfo => {
                      // 可以将 res 发送给后台解码出 unionId
                      that.globalData.userInfo = ress_userInfo.userInfo
                      that.upUserInfo(ress_userInfo.userInfo, location_longitude, location_latitude, ress, ress_userInfo)

                      wx.setStorageSync('openid', JSON.parse(ress.data.data.jsonStr).openid)
                    },
                    fail: function () {
                      wx.showModal({
                        title: '警告通知',
                        content: '您点击了拒绝授权,将无法正常显示个人信息,点击确定重新获取授权。',
                        success: function (res) {
                          if (res.confirm) {
                            wx.openSetting({
                              success: (res) => {
                                if (res.authSetting["scope.userInfo"]) {////如果用户重新同意了授权登录
                                  wx.login({
                                    success: function (res_login) {
                                      console.log('res_login', res_login)
                                      if (res_login.code) {
                                        wx.getUserInfo({
                                          withCredentials: true,
                                          success: function (res_user) {


                                            wx.request({
                                              url: that.globalData.url + '/wechat/getSessionKey',
                                              data: {
                                                city: res_user.userInfo.city,
                                                name: res_user.userInfo.nickName,
                                                encryptedData: res_user.encryptedData,
                                                province: res_user.userInfo.province,
                                                wechat_avatar_url: res_user.userInfo.avatarUrl,
                                                wechat_open_id: JSON.parse(ress.data.data.jsonStr).openid,
                                                location_longitude: location_longitude,
                                                location_latitude: location_latitude
                                              },
                                              method: 'GET',
                                              header: {
                                                'content-type': 'application/json'
                                              },
                                              success: function (res_end) {
                                                wx.setStorageSync('login', res_end.data.isOk)
                                                wx.setStorageSync("userId", res_end.data.userId);
                                                wx.setStorageSync('openid', JSON.parse(ress.data.data.jsonStr).openid)
                                                // wx.setStorageSync('openId', res.data.openId);
                                              }
                                            })
                                          }
                                        })
                                      }
                                    }
                                  });
                                }
                              }, fail: function (res) {

                              }
                            })

                          }
                        }
                      })
                    },
                  })
                } else {
                  wx.showToast({
                    title: ress.data.message,
                    image: '/image/shibai.png',
                  })
                }
              }
            })






          } else {
            wx.showModal({
              title: '',
              content: '获取用户登录态失败！' + res.errMsg,
              showCancel: false
            })
          }
        }
      })
   
		

   
    


  },

	globalData: {
		userInfo: null,
    url: 'http://192.168.100.7:7770',
		code:null,
    userId:null
	},

    //发送用户数据
  upUserInfo: function (res, location_longitude, location_latitude , c, all) {
      var that = this;
        wx.request({
          url: this.globalData.url + '/wechat/user/saveOrupdateUserByOpenId',
            method: 'GET',
            data: {
                city: res.city,
                name: res.nickName,
                encryptedData: all.encryptedData,
                province: res.province,
                wechat_avatar_url: res.avatarUrl,
                wechat_open_id: JSON.parse(c.data.data.jsonStr).openid,
                location_longitude: location_longitude,
                location_latitude: location_latitude,
                sessionId: c.data.data.sessionId
            },
            success: function (res) {
                //如果用户是第一次登录，就获取手机号
              console.log('appres', res)
              wx.setStorageSync('login',res.data.isOk)
              wx.setStorageSync("userId", res.data.userId);
              wx.setStorageSync('openid', JSON.parse(c.data.data.jsonStr).openid)

            }
        })
    },
})