// pages/printSet/printSet.js
const app=getApp();

Page({

	/**
	 * 页面的初始数据
	 */
	data: {
		isall:0,
		paper:'A4',
		side:'单面',
		color:'黑白',
		sbId:null,
		mxId:null,
		wdId:null,
		start_page:1,
		end_page:15,
		num:1
	},

	linkNotPrint: function () {
		wx.navigateTo({
			url: '../notPrint/notPrint',
		})
	},

	/**
	 * 生命周期函数--监听页面加载
	 */
	onLoad: function (options) {
		var that=this;
		that.setData({
			isall:options.isall,
			sbId:options.sbId,
			mxId:options.mxId,
			wdId:options.wdId
		});
		console.log(that.data)
		
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
		this.getSetting()
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

	//获取打印设置
	getSetting: function () {
		var that=this;
		wx.request({
      url: app.globalData.url + 'clientMiniProgram/getPrinterAttribute?userId=' + wx.getStorageSync("userId"),
			data: { printer_id: that.data.settingId },
			method: 'GET',
			success: function (res) {
				console.log(res)
			},
			fail:function(){
				wx.showToast({
					title: '系统错误',
					image:'/image/shibai.png'
				})
			}
		})
	},

	//打印设置变更提交
	modifySetting:function(){
		var that=this;
		wx.request({
      url: app.globalData.url + 'clientMiniProgram/printSetChangeSubmite?userId=' + wx.getStorageSync("userId"),
			data:{
				is_all:that.data.isall,
				lat: wx.getStorageSync('latitude'), 
				lon: wx.getStorageSync('longitude'),
				printer_id: that.data.sbId,
				prints:{
					attr: '{"side":"' + that.data.side + '","color":"' + that.data.color + '","paper":"'+that.data.paper+'"}',
					attr_str:that.data.paper+'/'+that.data.color+'/'+that.data.side,
					end_page: that.data.end_page,
					num:that.data.num,
					pi_id: that.data.mxId,
					start_page: that.data.start_page,
					uf_id: that.data.wdId
				}
			},
			method:'GET',
			success:function(res){
				console.log(res)
				if(res.data.isOk){
					wx.showToast({
						title: res.data.msg,
						icon:'success',
                        complete:function(){
                            wx.navigateBack({
                                delta: 1
                            })
                        }
					})
                    
				}
			}
		})
	},
	//减少打印份数
	reduceNum:function(){
		var that=this;
		var num = that.data.num
		num--
		if(num<=0){
			that.setData({
				num: 1
			})
		}else{
			that.setData({
				num: num
			})
			console.log(num)
		}
		
	},
	//添加打印份数
	addNum:function(){
		console.log('123')
		var that = this;
		var num = that.data.num
		num++
		that.setData({
			num: num
		})
	},
	//获取起始页码
	starPage:function(e){
		this.setData({
			start_page: e.detail.value
		})
	},
	//获取结束页码
	endPage:function(e){
		this.setData({
			end_page: e.detail.value
		})
	},




	/*===========================
	目前业务逻辑在前台进行判断，后期可能会更改
	============================*/

	//选择纸张类型
	selectType:function(e){
		var that=this;
		let paper = e.currentTarget.dataset.paper
		this.setData({
			paper: paper
		})	
	},
	//选择单双面
	selectDS:function(e){
		var that=this;
		let side = e.currentTarget.dataset.side
		that.setData({
			side: side
		})
		
	},
	//选择颜色
	selectColor:function(e){
		var that=this;
		var color = e.currentTarget.dataset.color
		that.setData({
			color: color
		})
	}


})