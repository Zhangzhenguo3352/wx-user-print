// pages/map/map.js
const app=getApp();
Page({

	/**
	 * 页面的初始数据
	 */
	data: {
		"longitude": 0,
		"latitude": 0,
    "scale": 18,
    polyline: [],
		"markers": [
			{
				iconPath: "/image/point.png",
				id: 0,
        latitude: 39.98933,
        longitude: 116.29845,
				width: 20,
				height: 20,
				callout:{
					content:'打印设备1'	,
					color:"#ff0000",
					fontSize:"14",
					bgColor:"#ffffff",
					padding:5,
					display:"ALWAYS",
					borderRadius:'30'
				}
			},

		],
	},

	/**
	 * 生命周期函数--监听页面加载
	 */
	onLoad: function (options) {
		var that = this;
    // 2.获取并设置当前位置经纬度
    wx.getLocation({
      type: "gcj02",
      success: (res) => {
        console.log(' res.longitude', res.longitude)
        console.log(' res.latitude', res.latitude)
        this.setData({
          longitude: res.longitude,
          latitude: res.latitude
        })
      }
    });

    //3.设置地图控件的位置及大小，通过设备宽高定位
    wx.getSystemInfo({
      success: (res) => {
        this.setData({
          controls: [{
            id: 1,
            iconPath: '/image/update.png',
            position: {
              left: 15,
              top: res.windowHeight - 150,
              width: 50,
              height: 50
            },
            clickable: true
          },{
            id: 2,
            iconPath: '/image/marker.png',
            position: {
              left: res.windowWidth / 2 - 12,
              top: res.windowHeight / 2 - 42,
              width: 22,
              height: 46
            },
            clickable: true
          }]
        })
      }
    });


    // 4.请求服务器，显示附近的打印机，用marker标记
    wx.request({
      url: 'https://www.easy-mock.com/mock/59098d007a878d73716e966f/ofodata/biyclePosition',
      data: {},
      method: 'GET', // OPTIONS, GET, HEAD, POST, PUT, DELETE, TRACE, CONNECT
      // header: {}, // 设置请求的 header
      success: (res) => {
        console.log('res.data', res.data.data)
        console.log('aaathis', this.data)
        that.setData({
          markers: res.data.data
        })
      },
      fail: function (res) {
        // fail
      },
      complete: function (res) {
        // complete
      }
    })

	},

	jumpMy: function () {
		wx.navigateTo({
			url: '../my/my',
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
        // this.lookupPrint();
        // 1.创建地图上下文，移动当前位置到地图中心
    this.mapCtx = wx.createMapContext("map");
    this.movetoPosition()
    
	},
  // 定位函数，移动位置到地图中心
  movetoPosition: function () {
    this.mapCtx.moveToLocation();
  },
  // 地图视野改变事件
  bindregionchange: function (e) {
    // 拖动地图，获取附件单车位置
    if (e.type == "begin") {
      wx.request({
        url: 'https://www.easy-mock.com/mock/59098d007a878d73716e966f/ofodata/biyclePosition',
        data: {},
        method: 'GET',
        success: (res) => {
          this.setData({
            _markers: res.data.data
          })
        }
      })
      // 停止拖动，显示单车位置
    } else if (e.type == "end") {
      this.setData({
        markers: this.data._markers
      })
    }
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

	/**切换tab* */
	swithcTab: function (e) {
		if (this.data.current == e.target.dataset.current) {
			return false
		} else {
			this.setData({
				current: e.target.dataset.current
			})
		}
	},



	//找打印机
	lookupPrint:function(){
		var that=this;
		wx.request({
			url: app.globalData.url+'clientMiniProgram/searchPrinters',
			data: { lat: that.latitude,lon: that.longitude,type:'0'},
			method:'GET',
			success: function(res) {
				console.log(res)
			},
		})	
	},
	//刷新
	refresh:function(e){
		var that=this;
		that.getLocation();
	},
	//获取经纬度
	getLocation: function () {
    this.movetoPosition();
	},
	//点击打印机
	clickPrint:function(e){
		console.log(e)
    this.setData({
      text: 222
    })
    let _markers = this.data.markers;
    let markerId = e.markerId;
    let currMaker = _markers[markerId];
    this.setData({
      polyline: [{
        points: [{
          longitude: this.data.longitude,
          latitude: this.data.latitude
        }, {
          longitude: currMaker.longitude,
          latitude: currMaker.latitude
        }],
        color: "#FF0000DD",
        width: 1,
        dottedLine: true
      }],
      scale: 18
    })
	}
})