const Util = require('./util.js');
// created by gpake
(function () {

  var config = {
    qiniuRegion: '',
    qiniuImageURLPrefix: '',
    qiniuUploadToken: '',
    qiniuUploadTokenURL: '',
    qiniuUploadTokenFunction: null
  }

  module.exports = {
    init: init,
    upload: upload,
  }

  // 在整个程序生命周期中，只需要 init 一次即可
  // 如果需要变更参数，再调用 init 即可
  function init(options) {
    config = {
      qiniuRegion: '',
      qiniuImageURLPrefix: '',
      qiniuUploadToken: '',
      qiniuUploadTokenURL: '',
      qiniuUploadTokenFunction: null
    };
    updateConfigWithOptions(options);
  }

  function updateConfigWithOptions(options) {
    if (options.region) {
      config.qiniuRegion = options.region;
    } else {
      console.error('qiniu uploader need your bucket region');
    }
    if (options.uptoken) {
      config.qiniuUploadToken = options.uptoken;
    } else if (options.uptokenURL) {
      config.qiniuUploadTokenURL = options.uptokenURL;
    } else if (options.uptokenFunc) {
      config.qiniuUploadTokenFunction = options.uptokenFunc;
    }
    if (options.domain) {
      config.qiniuImageURLPrefix = options.domain;
    }
  }

  function upload(filePath, that, index, file, app, success, fail, options) {
    if (null == filePath) {
      console.error('qiniu uploader need filePath to upload');
      return;
    }
    if (options) {
      init(options);
    }
    if (config.qiniuUploadToken) {
      doUpload(filePath, that, index, file, app, success, fail, options);
    } else if (config.qiniuUploadTokenURL) {
      getQiniuToken(function () {
        doUpload(filePath, that, index, file, app, success, fail, options);
      });
    } else if (config.qiniuUploadTokenFunction) {
      config.qiniuUploadToken = config.qiniuUploadTokenFunction();
    } else {
      console.error('qiniu uploader need one of [uptoken, uptokenURL, uptokenFunc]');
      return;
    }
  }
  
  function doUpload(filePath, that, index, file, app, success, fail, options) {
    var url = uploadURLFromRegionCode(config.qiniuRegion);
    var fileName = filePath.split('//')[1];
    if (options && options.key) {
      fileName = options.key;
    }
    var formData = {
      'token': config.qiniuUploadToken,
      'key': file.hash,
      'x:fileName': 'fileName'
    };
    console.log('url:', url, 'filePath:', filePath, 'formData:', formData, 'fileName', fileName, 'file', file)

  var uploadTask = wx.uploadFile({
    url: url,
    filePath: filePath,
    name: 'file',
    formData: formData,
    success: function (res) {
      var dataString = res.data
      var dataObject = JSON.parse(dataString);
      //do something
      var imageUrl = config.qiniuImageURLPrefix + dataObject.key;
      dataObject.imageURL = imageUrl;
      console.log(dataObject);
      if (success) {
        success(dataObject);
      }
    },
    fail: function (error) {
      console.log(error);
      if (fail) {
        fail(error);
      }
    }
  })

  uploadTask.onProgressUpdate((res) => {
    that.data.dataList[index].progress = res.progress
    that.data.dataList[index].progressText = res.progress
    that.data.dataList[index].size = Util.timeCurrentMillFn(res.totalBytesExpectedToSend/1024)
    that.data.dataList[index].fileInfo = {}
    that.data.dataList[index].state = res.progress == 100 ? 2 : 1
    that.setData({
      dataList: that.data.dataList
    })
    app.data.fileList = that.data.dataList
    console.log('上传进度', res.progress)
    console.log('已经上传的数据长度', res.totalBytesSent)
    console.log('预期需要上传的数据总长度', res.totalBytesExpectedToSend)
    console.log('预期需要上传的数据总长度 app', app)
    console.log('预期需要上传的数据总长度 that.data.dataList[index].fileInfo', that.data.dataList)
  })
  }


  function getQiniuToken(callback) {
    wx.request({
      url: config.qiniuUploadTokenURL,
      success: function (res) {
        var token = res.data.uptoken;
        config.qiniuUploadToken = token;
        if (callback) {
          callback();
        }
      },
      fail: function (error) {
        console.log(error);
      }
    })
  }
  
  function uploadURLFromRegionCode(code) {
    var uploadURL = null;
    switch (code) {
      case 'ECN': uploadURL = 'https://up.qbox.me'; break;
      case 'NCN': uploadURL = 'https://up-z1.qbox.me'; break;
      case 'SCN': uploadURL = 'https://up-z2.qbox.me'; break;
      case 'NA': uploadURL = 'https://up-na0.qbox.me'; break;
      case 'HB': uploadURL = 'https://upload-z1.qiniup.com'; break;
      default: console.error('please make the region is with one of [ECN, SCN, NCN, NA]');
    }
    return uploadURL;
  }

})();

