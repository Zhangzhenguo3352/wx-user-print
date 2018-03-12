const Util = require('../../utils/util.js');
const qiniuUploader = require("../../utils/qiniuUploader");
var WxAutoImage = require('../../WxAutoImage/WxAutoImage.js');


// let uurl = 'http://192.168.100.6:8759'
let uurl = 'https://wx.yinzhimeng.com.cn:8759'
//index.js
//获取应用实例
const app = getApp()

// 初始化七牛相关参数
function initQiniu() {
  var options = {
    region: 'HB', // 华东区，生产环境应换成自己七牛帐户bucket的区域
    // uptokenURL: 'http://192.168.100.6:7654/file/testToken/', // 生产环境该地址应换成自己七牛帐户的token地址，具体配置请见server端
    uptokenURL: 'https://wx.yinzhimeng.com.cn:7654/file/getToken/', // 生产环境该地址应换成自己七牛帐户的token地址，具体配置请见server端
    domain: 'http://p3i2cdjb5.bkt.clouddn.com/' // 生产环境该地址应换成自己七牛帐户对象存储的域名
  };
  
  qiniuUploader.init(options);
}


function didPressChooesImage(filePath, that, i, file, app) {
  initQiniu();
  // 交给七牛上传
  qiniuUploader.upload(filePath, that, i, file, app, (res) => {
    console.log('thatrer',res)
  }, (error) => {
    console.error('error: ' + JSON.stringify(error));
  });
}


Page({
  cusImageLoad: function (e) {
    var that = this;
    var index = e.currentTarget.dataset.index
    //这里看你在wxml中绑定的数据格式 单独取出自己绑定即可
    
    this.data.dataList[index].imageHeight = WxAutoImage.wxAutoImageCal(e).imageheight
    this.data.dataList[index].imageWidth = WxAutoImage.wxAutoImageCal(e).imageWidth
    that.setData({
      dataList: that.data.dataList
    });
  },

    /**
     * @param {arrary} 文档列表
     * @param {delBtnWidth} 删除按钮宽度
     * @param {winHeight} 可用窗口高度
     * 
     */
	data: {
		delBtnWidth :120,
		winHeight:0,
		count:0,
    dataList: [],
    imageWidth: 0,
    imageheight: 0,
    scrollY: true,
    animationData: {},
    modelImageSrc: "",
    uploadTask: null,
    userAuth: 11,
    currentType: 0,  // 0 初始化进来， 1保存方式进来
	},
  swipeCheckX: 0,        //激活检测滑动的阈值
  swipeCheckState: 1,     //0未激活 1激活
  maxMoveLeft:64,       //消息列表项最大左滑距离
  correctMoveLeft: 64,   //显示菜单时的左滑距离
  thresholdMoveLeft: 20,  //左滑阈值，超过则显示菜单
  lastShowMsgId: '',      //记录上次显示菜单的消息id
  moveX: 0,               //记录平移距离
  showState: 0,           //0 未显示菜单 1显示菜单
  touchStartState: 0,     // 开始触摸时的状态 0 未显示菜单 1 显示菜单
  swipeDirection: 1,      //是否触发水平滑动 0:未触发 1:触发水平滑动 2:触发垂直滑动

  //获取 首页列表
  fileNameOmitted: function (fileName, ext) {
    if (fileName.length >= 20) {
      var str = fileName.replace('tmp/', '')
      console.log('str', str)
      console.log('fileName', fileName)
      return `${Util.cutString(fileName, 20)}${ext}`;
    } else {
      return fileName;
    }
  },


  //

  /**
   *下拉刷新
   */
  onPullDownRefresh: function () {
    this.setData({ 
      userAuth: app.data.userAuth
    })
    // var openId = wx.getStorageSync('openid')

    // if (!openId) {
    //   app.onLaunch()
    //   return;
    // }
    var that = this;

   
    wx.request({
      url: uurl+ '/userFile/fileList',
      success: function (res) {
        var arr = [];
        if(res.data.code == '1') {
          
          var currenTarr = res.data.data.map((item, index) => {
            var imgUrl = item.fileName.split('--')[0].split('.')[0].replace('http://tmp/', '')
            console.log('`${imgUrl}...${item.ext}`', `${imgUrl}...${item.ext}`)
            // imageS.
            return {
              image: Util.fileNameCompare(item.ext) ? item.url : `../../image/${item.ext}.png` ,
              id: `id-${index+1}`,
              userFileId: item.userFileId,
              progress: 100,
              progressText: 100,
              title: Util.wxUrl(item.fileName) ? `${imgUrl}...${item.ext}` : that.fileNameOmitted(item.fileName, item.ext),
              create_time: Util.getDefaultHours(item.createTime/1000, 0),  // 这个时间会在 数据 上传完成后添加上去
              specification: '', // 用户选择的，没有想好
              type: '',
              imageHeight: 0,
              imageWidth: 0,
              size: Util.timeCurrentMillFn(item.size/1024),
              userName: '',
              msgText: '',
              headerImg: '',
              state: 2, // 0 没有上传， 1正在上传， 2上传完毕
              fileTypeIsImag: Util.fileNameCompare(item.ext), // 文件类型是图片 true
              fileTypeName: '',
              fileInfo: {},
              hash: item.hash 
            };
          })

          that.setData({
            dataList: currenTarr
          });
          app.data.fileList = currenTarr
          app.data.rankLoaded = true;//加载完成
          wx.stopPullDownRefresh();
        }
        
      },
      fail: function() {
        wx.showToast({
          title: '加载失败',
          image: '/image/shibai.png',
        })
        wx.stopPullDownRefresh();
      }
    });
    
  },





  onShow: function () {
    var openId = wx.getStorageSync('openid')
    console.log('show')
    if (!openId) {
      app.onLaunch()
      return;
    }

    var that = this
    this.setData({
      currentType: app.data.currentType
    })
    if (app.data.num !=0) {
      wx.showToast({
        title: `${app.data.num}文件已存在`,
        icon: 'success'
      })

    }

    let type = this.data.currentType
    // 初始化
    if (type == 0) {
      // this.getList();
    } else if (type == 1) {
      // 保存进来
      // 选中照片后 返回触发
      app.data.currentType = 0 // 保存状态设置 为初始状态
      that.setData({
        dataList: app.data.fileList
      })
      for (let i = 0; i < that.data.dataList.length; i++) {
        var fileInfo = that.data.dataList[i].fileInfo
        if (!!fileInfo.path) { // 存在， 就去上传七牛
          var file = that.data.dataList[i]
          didPressChooesImage(fileInfo.path, that, i, file, app);
        }
        
      }
    }
  },


  
	//事件处理函数
	onLoad: function () {
    var that = this;
    wx.startPullDownRefresh()
    // Util.utilAjax('index.php', 
    //   {
    //     x: 1,
    //     y: 2
    //   }, function(res) {
    //     console.log('a', res)
    // })
		//获取设备信息
		wx.getSystemInfo({
      
			success: function (res) {
				that.setData({
					winHeight: res.windowHeight
				})
			},
		})
		//获取经纬度
		wx.getLocation({
			"type": "gcj02",
			success: function (res) {
				wx.setStorage({
					key: 'latitude',
					data: res.latitude,
				})
				wx.setStorage({
					key: 'longitude',
					data: res.longitude,
				})
			},
		})
    
   
	},

  onProgressUpdate: function() {

  },
  // 触摸开始时
  onTouchStart: function (e) {
    if (this.showState === 1) {
      this.touchStartState = 1;
      this.showState = 0;
      this.moveX = 0;
      this.translateXMsgItem(this.lastShowMsgId, 0, 200);
      this.lastShowMsgId = "";
      return;
    }
    this.firstTouchX = e.touches[0].clientX;
    this.firstTouchY = e.touches[0].clientY;
    if (this.firstTouchX > this.swipeCheckX) {
      this.swipeCheckState = 1;
    }
    this.lastMoveTime = e.timeStamp;
  },
  // 触摸 移动时
  onTouchMove: function (e) {
    if (this.swipeCheckState === 0) {
      return;
    }
    //当开始触摸时有菜单显示时，不处理滑动操作
    if (this.touchStartState === 1) {
      return;
    }
    var moveX = e.touches[0].clientX - this.firstTouchX;
    var moveY = e.touches[0].clientY - this.firstTouchY;
    //已触发垂直滑动，由scroll-view处理滑动操作
    if (this.swipeDirection === 2) {
      return;
    }
    //未触发滑动方向
    if (this.swipeDirection === 0) {
      //触发垂直操作
      if (Math.abs(moveY) > 4) {
        this.swipeDirection = 2;
        return;
      }
      //触发水平操作
      if (Math.abs(moveX) > 4) {
        this.swipeDirection = 1;
        this.setData({ scrollY: false });
      } else {
        return;
      }

    }
    //禁用垂直滚动
    // if (this.data.scrollY) {
    //   this.setData({scrollY:false});
    // }

    this.lastMoveTime = e.timeStamp;
    //处理边界情况
    if (moveX > 0) {
      moveX = 0;
    }
    //检测最大左滑距离
    if (moveX < -this.maxMoveLeft) {
      moveX = -this.maxMoveLeft;
    }
    this.moveX = moveX;
    this.translateXMsgItem(e.currentTarget.id, moveX, 0);
  },
  // 触摸结束事件
  onTouchEnd: function (e) {
    this.swipeCheckState = 0;
    var swipeDirection = this.swipeDirection;
    this.swipeDirection = 0;
    if (this.touchStartState === 1) {
      this.touchStartState = 0;
      this.setData({ scrollY: true });
      return;
    }
    //垂直滚动，忽略
    if (swipeDirection !== 1) {
      return;
    }
    if (this.moveX === 0) {
      this.showState = 0;
      //不显示菜单状态下,激活垂直滚动
      this.setData({ scrollY: true });
      return;
    }
    if (this.moveX === this.correctMoveLeft) {
      this.showState = 1;
      this.lastShowMsgId = e.currentTarget.id;
      return;
    }
    if (this.moveX < -this.thresholdMoveLeft) {
      this.moveX = -this.correctMoveLeft;
      this.showState = 1;
      this.lastShowMsgId = e.currentTarget.id;
    } else {
      this.moveX = 0;
      this.showState = 0;
      //不显示菜单,激活垂直滚动
      this.setData({ scrollY: true });
    }
    this.translateXMsgItem(e.currentTarget.id, this.moveX, 500);
    //this.translateXMsgItem(e.currentTarget.id, 0, 0);
  },
  onDeleteMsgTap: function (e) {
    this.deleteMsgItem(e);
  },
  onDeleteMsgLongtap: function (e) {
    console.log(e);
  },
  onMarkMsgTap: function (e) {
    console.log(e);
  },
  onMarkMsgLongtap: function (e) {
    console.log(e);
  },
  // 动画删除的一部分
  getItemIndex: function (id) {
    var dataList = this.data.dataList;
    for (var i = 0; i < dataList.length; i++) {
      if (dataList[i].id === id) {
        return i;
      }
    }
    return -1;
  },
  
  translateXMsgItem: function (id, x, duration) {
    var animation = wx.createAnimation({
      duration: duration
    });
    animation.translateX(x).step();
    this.animationMsgItem(id, animation);
  },
  animationMsgItem: function (id, animation) {
    var index = this.getItemIndex(id);
    var param = {};
    var indexString = 'dataList[' + index + '].animation';
    param[indexString] = animation.export();
    this.setData(param);
  },
  // 没有数据交互式  数据删除的 一部分
  animationMsgWrapItem: function (id, animation) {
    var index = this.getItemIndex(id);
    var param = {};
    var indexString = 'dataList[' + index + '].wrapAnimation';
    param[indexString] = animation.export();
    this.setData(param);
  },



  //点击 图片放大
  clickImag: function (e) {
    let index = e.target.dataset.id;
    let data = this.data.dataList
    wx.previewImage({
      urls: [data[index].image], // 需要浏览显示图片的http 链接
      current: [data[index].image] // 当前显示图片的http 链接
    })
  },
  // 创建动画 公共的 部分
  createAnimationFn: function(time) {
    return wx.createAnimation({
      duration: time, // 动画播放的速度
      timingFunction: 'ease',
    })
  },
  // 查看器 初始化
  clearImageInit: function() {
    this.setData({
      modelImageSrc: "",
      animationData: {}
    })
  },
 
  // 取消上传
  abortFn: function() {
    this.data.uploadTask.abort()
  },
	
	// 没有数据的删除 动画
  deleteMsgItem: function (e) {
    console.log('e',e)
    var animation = wx.createAnimation({ duration: 200 });
    animation.height(0).opacity(0).step();
    this.animationMsgWrapItem(e.currentTarget.id, animation);
    var s = this;
    setTimeout(function () {
      var index = s.getItemIndex(e.currentTarget.id);
      s.data.dataList.splice(index, 1);
      s.setData({ dataList: s.data.dataList });
    }, 200);
    
    this.showState = 0;
    this.setData({ scrollY: true });
    this.touchStartState = 1;
    this.showState = 0;
    this.moveX = 0;
    this.translateXMsgItem(this.lastShowMsgId, 0, 200);
    this.lastShowMsgId = "";
  },
	//删除文档
	delWord:function(e){
    console.log('点击删除',e.currentTarget.dataset.userfileid)
    var that = this;
      wx.request({
        url: uurl + '/userFile/deleteUserFile',
        method: 'GET',
        data: { userFileId: e.currentTarget.dataset.userfileid },
        success: function (res) {
          
          if (res.data.code == 1) {
            wx.showToast({
              title: '删除成功',
              icon: 'success'
            })
            // wx.startPullDownRefresh()

            
            that.deleteMsgItem(e)
            // 更新数据仓库
            that.setData({
              dataList: that.data.dataList
            })
            app.data.fileList = that.data.dataList
          } else {
            wx.showToast({
              title: res.data.msg,
              image: '/image/shibai.png',
            })
          }
        },
        fail: function () {
          wx.showToast({
            title: '系统出错',
            image: '/image/shibai.png',
          })
        },
        complete: function() {
          wx.stopPullDownRefresh();
        }
      })


		
	},
	//添加打印文档
	addWord:function(e){
		var that=this;
		wx.request({
      url: app.globalData.url + 'clientMiniProgram/addDocumentToWaitPrint?userId=' + wx.getStorageSync("userId"),
			data: {uf_id: e.currentTarget.dataset.id},
			method:'GET',
			success:function(res){
				that.setData({
					count:that.data.count+1
				})

				if (res.data.isOk){
					wx.showToast({
						title: '添加成功',
						icon: 'success',
					})
				}else{
					wx.showToast({
						title: '系统出错',
						image: '/image/shibai.png',
					})
				}
			},
			fail:function(){
				wx.showToast({
					title: '系统出错',
					image: '/image/shibai.png',
				})
			}
		})
	},
	//长按删除
	longTap:function(e){
		var that=this;
    wx.vibrateShort({})
		wx.showModal({
			title: '文档删除',
      content: e.currentTarget.dataset.content,
			success: function (res) {
				if(res.confirm){
          that.delWord(e)
				}
				
			}

		})
	},


	/*================================
	 滑动删除
	 ================================*/

	 //触摸开始
	touchS:function(e){
		var that=this
		if (e.touches.length===1){
			that.setData({
				startX: e.touches[0].clientX
			})
		}

	},
	//触摸移动
	touchM:function(e){
		var that=this;
		if(e.touches.length===1){
			var moveX = e.touches[0].clientX  //触摸点X轴坐标
			var disX = that.data.startX - moveX 	//触摸点起点X轴坐标与当前触摸点X轴差值
			var delBtnWidth = that.data.delBtnWidth 
			var txtStyle=''
			if(disX===0 || disX<0){	//如果移动距离小于等于0，位置不变
				txtStyle='left:0rpx'
			}else if(disX>0){
				txtStyle='left:-'+disX+'rpx'
				if(disX>=delBtnWidth){
					txtStyle='left:-'+delBtnWidth+'rpx'
				}
			}

			var index = e.currentTarget.dataset.index
			var list=that.data.array
			list[index].txtStyle=txtStyle
			that.setData({
				array:list
			})
		}
	},
	//触摸结束
	touchE:function(e){
		var that=this
		if (e.changedTouches.length===1){
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
	},

  // 触摸开始时
  onTouchStart: function (e) {
    if (this.showState === 1) {
      this.touchStartState = 1;
      this.showState = 0;
      this.moveX = 0;
      this.translateXMsgItem(this.lastShowMsgId, 0, 200);
      this.lastShowMsgId = "";
      return;
    }
    this.firstTouchX = e.touches[0].clientX;
    this.firstTouchY = e.touches[0].clientY;
    if (this.firstTouchX > this.swipeCheckX) {
      this.swipeCheckState = 1;
    }
    this.lastMoveTime = e.timeStamp;
  },
  // 触摸 移动时
  onTouchMove: function (e) {
    if (this.swipeCheckState === 0) {
      return;
    }
    //当开始触摸时有菜单显示时，不处理滑动操作
    if (this.touchStartState === 1) {
      return;
    }
    var moveX = e.touches[0].clientX - this.firstTouchX;
    var moveY = e.touches[0].clientY - this.firstTouchY;
    //已触发垂直滑动，由scroll-view处理滑动操作
    if (this.swipeDirection === 2) {
      return;
    }
    //未触发滑动方向
    if (this.swipeDirection === 0) {
      
      //触发垂直操作
      if (Math.abs(moveY) > 4) {
        this.swipeDirection = 2;
        return;
      }
      //触发水平操作
      if (Math.abs(moveX) > 4) {
        this.swipeDirection = 1;
        this.setData({ scrollY: false });
      } else {
        return;
      }

    }
    //禁用垂直滚动
    // if (this.data.scrollY) {
    //   this.setData({scrollY:false});
    // }

    this.lastMoveTime = e.timeStamp;
    //处理边界情况
    if (moveX > 0) {
      moveX = 0;
    }
    //检测最大左滑距离
    if (moveX < -this.maxMoveLeft) {
      moveX = -this.maxMoveLeft;
    }
    this.moveX = moveX;
    this.translateXMsgItem(e.currentTarget.id, moveX, 0);
  },
  // 触摸结束事件
  onTouchEnd: function (e) {
    this.swipeCheckState = 0;
    var swipeDirection = this.swipeDirection;
    this.swipeDirection = 0;
    if (this.touchStartState === 1) {
      this.touchStartState = 0;
      this.setData({ scrollY: true });
      return;
    }
    //垂直滚动，忽略
    if (swipeDirection !== 1) {
      return;
    }
    if (this.moveX === 0) {
      this.showState = 0;
      //不显示菜单状态下,激活垂直滚动
      this.setData({ scrollY: true });
      return;
    }
    if (this.moveX === this.correctMoveLeft) {
      this.showState = 1;
      this.lastShowMsgId = e.currentTarget.id;
      return;
    }
    if (this.moveX < -this.thresholdMoveLeft) {
      this.moveX = -this.correctMoveLeft;
      this.showState = 1;
      this.lastShowMsgId = e.currentTarget.id;
    } else {
      this.moveX = 0;
      this.showState = 0;
      //不显示菜单,激活垂直滚动
      this.setData({ scrollY: true });
    }
    this.translateXMsgItem(e.currentTarget.id, this.moveX, 100);
    //this.translateXMsgItem(e.currentTarget.id, 0, 0);
  },
  onDeleteMsgTap: function (e) {
    this.deleteMsgItem(e);
  },
  onDeleteMsgLongtap: function (e) {
    console.log(e);
  },
  onMarkMsgTap: function (e) {
    console.log(e);
  },
  onMarkMsgLongtap: function (e) {
    console.log(e);
  },
  // 动画删除的一部分
  getItemIndex: function (id) {
    var dataList = this.data.dataList;
    for (var i = 0; i < dataList.length; i++) {
      if (dataList[i].id === id) {
        return i;
      }
    }
    return -1;
  },

  translateXMsgItem: function (id, x, duration) {
    var animation = wx.createAnimation({
      duration: duration
    });
    animation.translateX(x).step();
    this.animationMsgItem(id, animation);
  },
  animationMsgItem: function (id, animation) {
    var index = this.getItemIndex(id);
    var param = {};
    var indexString = 'dataList[' + index + '].animation';
    param[indexString] = animation.export();
    this.setData(param);
  },
  // 没有数据交互式  数据删除的 一部分
  animationMsgWrapItem: function (id, animation) {
    
    var index = this.getItemIndex(id);
    var param = {};
    
    var indexString = 'dataList[' + index + '].wrapAnimation';
    param[indexString] = animation.export();
    this.setData(param);
  },
	//一堆跳转
	bindViewTap: function () {
		wx.navigateTo({
			url: '../logs/logs'
		})
	},
	linkMy: function () {
		wx.navigateTo({
			url: '../my/my',
		})
	},
	linkFileUpload: function () {
    // app.checkSettingStatu()
		wx.navigateTo({
			url: '../fileUpload/fileUpload',
		})
	},
	linkNotPrint: function () {
		wx.navigateTo({
			url: '../notPrint/notPrint',
		})
	},

	linkIndex: function () {
		wx.navigateTo({
			url: '../index/index',
		})
	},
	linkGetFile: function () {
		wx.navigateTo({
			url: '../getFile/getFile',
		})
	},
	linkFindPrint: function () {
		wx.navigateTo({
			url: '../findPrint/findPrint',
		})
	},

})
