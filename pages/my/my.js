// pages/my/my.js

const app = getApp()
Page({

	/**
	 * 页面的初始数据
     * @param {wxUserInfo} 微信用户信息
     * @param {userInfo} 后台获取用户信息
     * @param {wallet} 用户账户余额
	 */
	data: {
		wxUserInfo:null,
		userInfo:null,
	},

	/**
	 * 生命周期函数--监听页面加载
	 */
	onLoad: function (options) {
		var that=this
		that.setData({
			wxUserInfo: app.globalData.userInfo
		})

		
	},

	/**
	 * 生命周期函数--监听页面初次渲染完成
	 */
	onReady: function () {

	},

	/**
	 * 生命周期函数--监听页面显示
	 */
	onShow: function () {
        this.USERINFO()
	},

	/**
	 * 生命周期函数--监听页面隐藏
	 */
	onHide: function () {

	},

	/**
	 * 生命周期函数--监听页面卸载
	 */
	onUnload: function () {

	},

	/**
	 * 页面相关事件处理函数--监听用户下拉动作
	 */
	onPullDownRefresh: function () {

	},

	/**
	 * 页面上拉触底事件的处理函数
	 */
	onReachBottom: function () {

	},

	/**
	 * 用户点击右上角分享
	 */
	onShareAppMessage: function () {

	},
	//条转至绑定手机页面
	bindMobile:function(){
    wx.request({
      url: 'https://www.zhangzhenguo1.com', //仅为示例，并非真实的接口地址
      data: {
        x: '',
        y: ''
      },
      header: {
        'content-type': 'application/json' // 默认值
      },
      success: function (res) {
        console.log('res',res)
      }
    })
		// if (this.data.userInfo.mobile == '' || this.data.userInfo.mobile == null || this.data.userInfo.mobile==undefined){
		// 	wx.navigateTo({
		// 		url: '../bindPhone/bindPhone',
		// 	})
		// }
		
	},
    
    //获取用户信息
    USERINFO(){
        var that=this;
        wx.request({
          url: app.globalData.url + 'clientMiniProgram/getUserInfo?userId=' + wx.getStorageSync("userId"),
            method: 'POST',
            success: function (res) {
                console.log(res)
                that.setData({
                    userInfo: res.data,
                })
            },
            fail: function () {
                wx.showToast({
                    title: '信息获取失败',
                    image: '/image/shibai.png',
                    mask: 'true'
                })
            }
        })
    }
})