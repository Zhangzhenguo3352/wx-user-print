const Util = require('../../utils/util.js');
// const uurl = 'http://192.168.100.6:7654'
const uurl = 'https://wx.yinzhimeng.com.cn:7654'


// pages/fileUpload/fileUpload.js
const app=getApp();
Page({

	/**
	 * 页面的初始数据
	 */
	data: {
    num: 0
	},

	linkMyWord: function () {
		wx.navigateTo({
			url: '../myWord/myWord',
		})
	},
	linkPcUpload: function () {
		wx.navigateTo({
			url: '../pcUpload/pcUpload',
		})
	},

	/**
	 * 生命周期函数--监听页面加载
	 */
	onLoad: function (options) {

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

	/**
	 * 生命周期函数--监听页面隐藏
	 */
	onHide: function () {
    console.log('app.data.file222222222List', app.data.fileList)
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

  // 执行组件
  setJsonDataFn: function (fileName, fileNameBool, fileSuffix, fileInfo, fileData, index, fileNumber, sameMd5 ) {
    var that = this
    var arr = app.data.fileList;
    console.log('aaaaaaarr', arr)
    var imgUrl = fileName.split('--')[0].split('.')[0].replace('http://', '')
    var json = {
      image: fileName,
      id: 'id-' + (Number(app.data.fileList.length) + 1),
      userFileId: '',
      progress: 0,
      progressText: 0,
      title: Util.wxUrl(fileName) ? `${imgUrl}..${fileSuffix}` : fileName,
      create_time: Util.getDefaultHours(new Date().getTime() / 1000, 0),  // 这个时间会在 数据 上传完成后添加上去
      specification: '单面', // 用户选择的，没有想好
      type: '六寸照片',
      imageHeight: 0,
      imageWidth: 0,
      size: 0,
      userName: '1',
      msgText: '2',
      headerImg: fileName,
      state: 1, // 0 没有上传， 1正在上传， 2上传完毕
      fileTypeIsImag: fileNameBool, // 文件类型是图片 true
      fileTypeName: fileSuffix,
      // fileInfo: that.compareFn(fileData, fileName) ? fileInfo : {},
      fileInfo: sameMd5 ? {} : fileInfo,
      hash: fileData.digest
    };
    app.data.fileList.unshift(json)
    app.data.currentType = '1' // 保存状态设置
   
    console.log('fileNumber.length', fileNumber.length)
    if (index == fileNumber.length - 1) {

      wx.navigateBack({
        url: '../fileList/fileList'
      })
    }
   
  },

  // 
  compareFn: function (res_fileInfo, fileName) {
    var arr = app.data.fileList;
    
    for (var j = 0; j < arr.length; j++) {
      console.log('111res_fileInfo.digest',  res_fileInfo.digest)
      console.log('111arr[j].hash', arr[j].hash)
      if (arr[j].hash == res_fileInfo.digest) { //  和 本地文件 MD5 相同
        return true // 有相同文件
      }
    }
    return false; // ，没有相同文件
  },

  commonFn: function(res, that) {
    // that.upFile(res.tempFilePaths[0])
    // 设置成 全局的里面 为了在下一个页面使用
    var arr = app.data.fileList;
    var numAix = 0
    for (var i = 0; i < res.tempFilePaths.length; i++) {
      var index = i;

      var fileNameBool = that.fileTypeFn(res.tempFilePaths[i])
      var fileName = res.tempFilePaths[i]
      var fileSuffix = that.fileTypeNameFn(res.tempFilePaths[i])
      var fileInfo = res.tempFiles[i]
      var fileNumber = res.tempFilePaths

      
      if (fileNameBool) {
        that.getFileInfoFn(fileName, fileNameBool, fileSuffix, fileInfo, numAix, function (res_fileInfo, ix, fileName, fileNameBool, fileSuffix, fileInfo, numAix) {
          var Aix = ix

         
          that.numFn(res_fileInfo)
          // 本地没有的文件， 去做文件做校验
          if (!that.compareFn(res_fileInfo, fileName)) { // 查找本地文件，没有才去 
            // 校验 MD5 文件是否相同(和云上比较)
            Util.utilAjax(uurl + '/file/inspectHash',
              {
                hash: res_fileInfo.digest,
                fileName: fileName,
                size: res_fileInfo.size
              }, function (res_md5) {
                console.log('res_md5.data.code', res_md5.data.code)
                if (res_md5.data.code == '1') {

                  that.upLoadFn(res_fileInfo, fileName)
                  that.setJsonDataFn(fileName, fileNameBool, fileSuffix, fileInfo, res_fileInfo, numAix, res.tempFilePaths, 'sameMd5')
                  
                } else if (res_md5.data.code == '106') {
                  
                  wx.showToast({
                    title: fileSuffix + '文件不支持',
                    image: '/image/shibai.png',
                  })
                  if (numAix == fileNumber.length - 1) {
                    wx.navigateBack({
                      url: '../fileList/fileList'
                    })
                  }
                } else {
                  // that.upLoadFn(res_fileInfo, fileName)
                  that.setJsonDataFn(fileName, fileNameBool, fileSuffix, fileInfo, res_fileInfo, numAix, res.tempFilePaths)
                }


              }, 'POST')
          } else {
            if (numAix == fileNumber.length - 1) {
              wx.navigateBack({
                url: '../fileList/fileList'
              })
            }

          }

        }, index)


      } else {
        wx.showToast({
          title: fileSuffix + '文件不支持',
          image: '/image/shibai.png',

        })

      }
      numAix++;
    }
    // app.data.fileList = arr
    app.data.currentType = 1 // 保存状态设置
        // 选择完成 到 文件列表页


  },
  // 关联
  upLoadFn: function (fileData, fileName) {
    console.log('fileData', fileData, 'fileName', fileName)
    Util.utilAjax(uurl + '/file/upLoad',
      {
        hash: fileData.digest,
        fileName: fileName,
        size: fileData.size
      }, function (res) {
        console.log('ressss')
      }
      , 'POST')

  },
  getFileInfoFn: function (fileName, fileNameBool, fileSuffix, fileInfo, numAix, callback, i) {
    
    wx.getFileInfo({ // 获取 MD5
      filePath: fileName, //仅做示例用，非真正的文件路径
      success: (res_fileInfo) => {
                
                callback(res_fileInfo, i, fileName, fileNameBool, fileSuffix, fileInfo, numAix)
      },
      fail: function () {
        console.log('md5没有拿到')
      }
    })
  },
  numFn: function (res_fileInfo) {
    var arr = app.data.fileList;
    var that = this;
    for (var j = 0; j < arr.length; j++) {
      if (arr[j].hash == res_fileInfo.digest) { //  和 本地文件 MD5 相同
        that.data.num++
        that.setData({
          num: that.data.num++
        })
      } else {
      }

    }
    
    app.data.num = that.data.num
  },
	/***拍摄图片* */
	cameraImg:function(){
        let that=this;
		wx.chooseImage({
			sourceType: ['camera'],                
			success: function(res) {
        that.commonFn(res, that)
			},
		})
	},

  // 拿MD5  
  getMd5: (filePath, fileInfo, i, callback, fileNameBool ) => {
    wx.getFileInfo({
      filePath: filePath, //仅做示例用，非真正的文件路径
      success: function (res) {
        callback(res, filePath, fileInfo, fileNameBool, i)
      },
      fail: function() {
        console.log('md5没有拿到')
      }
    })
  },
  //校验那些文件不支持，不能上传文件
  fileCheck:  (fileCheck, fileSuffix, callback, fail) => {
    if (!fileCheck) {
      // 文件不支持 回调
      fail(fileSuffix)
      return;
    }
    callback()
  },
	/**相册上传* */
	albumImg:function(){
    let that = this;
		wx.chooseImage({
			sourceType: ['album'],
			success: function (res) {
        that.commonFn(res, that)
			},
		})
	},

  setFileData:function() {
    
  },
  // 保存时 编写文件类型，这里做转换
  fileTypeFn: function(url) {
    // var reg = /\.[^\.]+$/.exec(url)[0];
    var reg = /([a-zA-Z0-9_]+)(.gif|.jpg|.jpeg|.GIF|.JPG|.JPEG|.png)/.test(url)
    return reg;
  },
  // 名字提取出来
  fileTypeNameFn: function(url) {
    var reg = /\.[^\.]+$/.exec(url)[0];
    return reg;
  }
})


