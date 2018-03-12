// pages/bindPhone/bindPhone.js
const app=getApp();
Page({
	getPhoneNumber: function (e) {
		console.log(e.detail.errMsg)
		console.log(e.detail.iv)
		console.log(e.detail.encryptedData)

        wx.request({
            url: app.globalData.url +'clientMiniProgram/wxBindingMobile',
            data: { iv: e.detail.iv, encryptedData: e.detail.encryptedData},
            method:'GET',
            success:function(res){
                if(res.data.isOk){
                    wx.navigateTo({
                        url: '../my/my',
                    })   
                }
        
            }
        })
	} ,


    /**
     * @param {isShow} 判断手机号绑定方式
     * @param {disable} 发送验证码按钮是否禁用
     * @param {mobile} 手机号
     * @param {code} 验证码
     */

	data:{
		isShow:true,
        disable:false,
        mobile:null,
        code:null,
        codeText:'获取验证码'
	},
    //绑定方式
	inpuBind:function(){
		this.setData({
			isShow: false
		})
	},
    //
    getMobile(e){
        this.setData({
            mobile:e.detail.value
        })
    },
    //
    getCode(e){
        this.setData({
            code: e.detail.value
        })
    },
    //发送验证码
    sendCode(){
        var that=this;
        if (that.checkMobile(that.data.mobile)){
            wx.request({
                url: app.globalData.url + 'clientMiniProgram/sendCodeToMobile',
                data: { mobile: that.data.mobile },
                method: 'GET',
                success: res => {
                    console.log(res.data)
                    if (res.data.isOk) {
                        wx.showToast({
                            title: '发送成功',
                            icon: 'success'
                        })

                        that.setIntCode()
                        that.setData({
                            disable: true
                        })
                    }else{
                        wx.showToast({
                            title: res.data.msg,
                            image:'/image/shibai.png'
                        })
                    }
                },
                fail(){
                    wx.showToast({
                        title: '系统错误',
                        image:'/image/shibai.png'
                    })
                }
            })
        }else{
            wx.showToast({
                title: '手机号错误',
                image:'/image/shibai.png'
            })
        }
        
    },

    //绑定手机号码
    bindPhone(){
        if(this.data.code==null || this.data.mobile==null){
            wx.showToast({
                title: '请检查输入',
                image:'/image/shibai.png'
            })
        }else{
            wx.request({
                url: app.globalData.url + 'clientMiniProgram/bindingMobile',
                data: { mobile: this.data.mobile, code: this.data.code },
                method: 'GET',
                success: res => {
                    if (res.data.isOk) {
                        wx.navigateTo({
                            url: '../my/my',
                        })
                    } else {
                        wx.showToast({
                            title: res.data.msg,
                            image: '/image/shibai.png'
                        })
                    }
                },
                fail(){
                    wx.showToast({
                        title: '系统错误',
                        image:'/image/shibai.png'
                    })
                }
            })
        }
        
    },
    //校验手机号码、
    checkMobile(str){
        console.log(str)
        let re = /^1\d{10}$/
        if(re.test(str)){
            return true
        }else{
            return false
        }
    },
    setIntCode(){
        let that=this;
        let int=60;
        let time=setInterval(function(){
            int=int-1
           console.log(int)
           if(int<=0){
               clearTimeout(time)
               that.setData({
                   codeText: '重新发送验证码',
                   disable: false
               })
           }else{
               that.setData({
                   codeText: int+'秒后重新发送'
               })
           }
          
        },1000)
    }

})