const app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    fileList: []
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    console.log('onLoad')
    console.log('app', app)
    console.log(' wx.getStorageSync("userId")', '|' + wx.getStorageSync("userId") + '|')
    this.setData({
      fileList: app.data.fileList
    })
    for (let i = 0; i < this.data.fileList.length; i++) {
      console.log('thththt',this)
      console.log('this.data.fileList', this.data.fileList)
      this.upFile(this.data.fileList[i], i)
    }
    // this.upFile(this.data.fileList[0],0)
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
    console.log('onReady')
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    console.log('onShow')
  },
  //up fun
  upFile(path, index) {
    console.log(path)
    const uploadTask = wx.uploadFile({
      url: app.globalData.url + 'clientMiniProgram/uploadUserDocument?userId=' + wx.getStorageSync("userId"),
      filePath: path.image,
      name: 'file',
      success: function (res) {
        console.log(res, 'ssssss')
        // 改写 上传成功的 时间：
      }
    })
    console.log('uploadTask', uploadTask)
    uploadTask.onProgressUpdate((res) => {
      setTimeout(() => {console.log(1111)},1000)
      this.data.fileList[index].progress = res.progress 
      this.data.fileList[index].progressText = res.progress
      this.setData({
        fileList: this.data.fileList
      })
      console.log('上传进度', res.progress)
      console.log('已经上传的数据长度', res.totalBytesSent)
      console.log('预期需要上传的数据总长度', res.totalBytesExpectedToSend)
    })
    

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {
    console.log('onHide')
  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {
    console.log('onUnload')
  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {
    console.log('onPullDownRefresh')
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
    console.log('onReachBottom')
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {
    console.log('onShareAppMessage')
  }
})