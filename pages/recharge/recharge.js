// pages/recharge/recharge.js
const app=getApp();
Page({

    /**
     * 页面的初始数据
     */
    data: {
        money:100,
        amount:null,
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
        this.USERINFO()
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
        
    },


    //切换充值金额
    switchMoney: function(e){
        this.setData({
            money: e.currentTarget.dataset.money
        })
    },
    //充值
    recharge:function(){
        wx.request({
          url: app.globalData.url + 'clientMiniProgram/userRechargeSubmite?userId=' + wx.getStorageSync("userId"),
            data:{money:this.data.money},
            method:'GET',
            success:res=>{
                console.log(res)
                console.log(

                    'prepay_id='+res.data.prepay_id
                )

                wx.requestPayment({
                    timeStamp: res.data.timeStamp,
                    nonceStr: res.data.nonce_str,
                    package: 'prepay_id='+res.data.prepay_id,
                    signType: 'MD5',
                    paySign: res.data.sign,
                    success:function(){
                        wx.showToast({
                            title: '充值成功',
                            icon:'success',
                            complete(){
                               wx.navigateBack({
                                   delta:1
                               })
                            }
                        })
                    },
                    fail(res){
                        console.log(res)
                        wx.showToast({
                            title: '支付失败',
                            icon: '/image/shibai.png'
                        })
                    },
                    complete(){
                       console.log('支付调用结束')
                    }
                })
            }
        }) 
    },
    //获取用户余额
    USERINFO() {
        var that = this;
        wx.request({
          url: app.globalData.url + 'clientMiniProgram/getUserInfo?userId=' + wx.getStorageSync("userId"),
            method: 'POST',
            success: function (res) {
                console.log(res)
                that.setData({
                    userInfo: res.data.money,
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