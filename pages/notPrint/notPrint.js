// pages/notPrint/notPrint.js
const app=getApp();
Page({

	/**
	 * 页面的初始数据
	 */
	data: {
		array: [],
		delBtnWidth: 124,
		latitude: 39.9088600000,
		longitude: 116.3973900000,
		print:null,
    winWidth:null,
    noShow:false,
	},

	linkPrintSet: function (e) {
		wx.navigateTo({
			url: '../printSet/printSet?isall=0&sbId=' + e.currentTarget.dataset.sbid+'&mxId='+e.currentTarget.dataset.item.pi_id+'&wdId='+e.currentTarget.dataset.item.uf_id
		})
	},
	linkPrintSetting: function (e) {
		wx.navigateTo({
			url: '../printSet/printSet?isall=1&sbId=' + e.currentTarget.dataset.sbid
		})
	},
	linkGetPrinter: function () {
		wx.navigateTo({
			url: '../getPrinter/getPrinter',
		})
	},
	linkRecharge: function () {
		wx.navigateTo({
			url: '../recharge/recharge',
		})
	},

	/**
	 * 生命周期函数--监听页面加载
	 */
	onLoad: function (options) {
        let res = wx.getSystemInfoSync()
        console.log(res)
        this.setData({
            winWidth:res.windowWidth
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
		this.getList();
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

	//获取打印设置列表
	getList:function(){
		var that=this;
		wx.request({
      url: app.globalData.url + 'clientMiniProgram/waitPrintingList?userId=' + wx.getStorageSync("userId"),
			data: { lat: wx.getStorageSync('latitude'), lon: wx.getStorageSync('longitude')},
			method:'GET',
			success:function(res){
				console.log(res)
				that.setData({
					array:res.data.list,
					print:res.data,
				})
                that.getUserMoney()
                
			}
		})
	},

	//打印提交、
	upPrint:function(){
		wx.request({
      url: app.globalData.url + 'clientMiniProgram/printSubmite?userId=' + wx.getStorageSync("userId"),
            data: { money: this.data.print.total_money},
			method:'GET',
			success:function(res){
				console.log(res)
                if(res.data.isOk){
                    wx.showToast({
                        title: '提交成功',
                        icon:'success'
                    })
                }else{
                    wx.showToast({
                        title: res.data.msg,
                        image:'/image/shibai.png'
                    })
                }
			}

		})
	},

	//删除打印列表
	delFile:function(e){
		var that=this;
		wx.request({
			url: app.globalData.url+'clientMiniProgram/delWaitingPrint',
			data: { pi_id: e.currentTarget.dataset.id},
			method:'GET',
			success:function(res){
				if(res.data.isOk){
					that.getList();
					wx.showToast({
						title: '删除成功',
						icon:'success'
					})
				}else{
					wx.showToast({
						title: res.data.msg,
						image:'/image/shibai.png'
					})
				}
				console.log(res)
			},
			fail:function(){
				wx.showToast({
					title:'系统出错',
					image:'/image/shibai.png'
				})
			}
		})
	},
	//
	reduceNum:function(e){
		var that = this;
        console.log(e.currentTarget)
		if (e.currentTarget.dataset.item.num>1){
			wx.request({
				url: app.globalData.url+'clientMiniProgram/setWaitingPrintNum',
				data: { pi_id: e.currentTarget.dataset.item.pi_id, num: Number(e.currentTarget.dataset.item.num)-1},
				success:function(res){
					if (res.data.isOk) {
						that.getList()
					}
				}
			})
		}
	},
	//
	reduce:function(e){
		var that=this;
        console.log(e)
		wx.request({
      url: app.globalData.url + 'clientMiniProgram/setWaitingPrintNum?userId=' + wx.getStorageSync("userId"),
			data: { pi_id: e.currentTarget.dataset.item.pi_id, num: Number(e.currentTarget.dataset.item.num) +1 },
			success: function (res) {
				if(res.data.isOk){
					that.getList()
				}
			}
		})
	},

    //返回首页
    backHome(){
        wx.switchTab({
            url: '../index/index',
        })
    },
    //获取用户余额
    getUserMoney() {
        var that = this;
        wx.request({
          url: app.globalData.url + 'clientMiniProgram/getUserInfo?userId=' + wx.getStorageSync("userId"),
            method: 'GET',
            success: function (res) {
                if (Number(that.data.print.total_money)>Number(res.data.money)){
                    that.setData({
                        noShow:true
                    })

                }
                
            },
            fail: function () {
                wx.showToast({
                    title: '信息获取失败',
                    image: '/image/shibai.png',
                    mask: 'true'
                })
            }
        })
    },

	/*================================
	  滑动删除
	 ================================ */
	 //触摸开始
	 touchS:function(e){
		 var that = this
		 if (e.touches.length === 1) {
			 that.setData({
				 startX: e.touches[0].clientX
			 })
		 }
	 },
	 //触摸移动
	 touchM:function(e){
		 var that = this;
		 if (e.touches.length === 1) {
			 var moveX = e.touches[0].clientX  //触摸点X轴坐标
			 var disX = that.data.startX - moveX 	//触摸点起点X轴坐标与当前触摸点X轴差值
			 var delBtnWidth = that.data.delBtnWidth
			 var txtStyle = ''
			 if (disX === 0 || disX < 0) {	//如果移动距离小于等于0，位置不变
				 txtStyle = 'left:0rpx'
			 } else if (disX > 0) {
				 txtStyle = 'left:-' + disX + 'rpx'
				//  if (disX >= delBtnWidth) {
				// 	 txtStyle = 'left:-' + delBtnWidth + 'rpx'
				//  }
			 }

			 var index = e.currentTarget.dataset.index
			 var list = that.data.array
			 list[index].txtStyle = txtStyle
			 that.setData({
				 array: list
			 })
		 }
	 },
	 //触摸结束
	 touchE: function (e) {
		 console.log(e)
		 var that = this
		 if (e.changedTouches.length === 1) {
			 var endX = e.changedTouches[0].clientX
			 var disX = that.data.startX - endX;
			 var delBtnWidth = that.data.delBtnWidth;
			 var txtStyle = disX > delBtnWidth / 2 ? "left:-" + delBtnWidth + "rpx" : "left:0rpx";
			 var index = e.currentTarget.dataset.index;
			 var list = that.data.array;
			 list[index].txtStyle = txtStyle;
			 that.setData({
				 array: list
			 });
		 }
	 }
})