// pages/printPay/printPay.js
const app = getApp();

Page({

    /**
     * 页面的初始数据
     */
    data: {
        info: null,
        list: null,
        userInfo:null,
        printId:null,
        noShow:false
    },

    linkRecharge: function () {
        wx.navigateTo({
            url: '../recharge/recharge',
        })
    },
    linkPrintPayOk: function () {
        
        wx.request({
          url: app.globalData.url + 'clientMiniProgram/submiteOrderPay?userId=' + wx.getStorageSync("userId"),
            data: { print_id: this.data.printId, use_money:'1'},
            method:'GET',
            success:function(res){
                console.log(res)
                if(res.data.isOk){
                    wx.navigateTo({
                        url: '../printPayOk/printPayOk',
                    })
                }
            }

        })
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
        this.setData({
            printId:options.id
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
        var that = this;
        that.getPrintInfo()
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

    getPrintInfo: function () {
        var that = this;
        wx.request({
            url: app.globalData.url + 'clientMiniProgram/getUnpayOrderInfo',
            data: { print_id: that.data.printId },
            method: 'GET',
            success: function (res) {
                that.getUserMoney()
                that.setData({
                    info: res.data,
                    list: res.data.print_item
                })

            }
        })
    },
    getUserMoney(){
        var that=this;
        wx.request({
          url: app.globalData.url + 'clientMiniProgram/getUserInfo?userId=' + wx.getStorageSync("userId"),
            method: 'GET',
            success: function (res) {
                that.setData({
                    userInfo: res.data.money,
                })
                
                if (Number(that.data.info.total_money)>Number(res.data.money)){
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
    }
})