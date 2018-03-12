/**
 * author: Di (微信小程序开发工程师)
 * organization: WeAppDev(微信小程序开发论坛)(http://weappdev.com)
 *               垂直微信小程序开发交流社区
 * 
 * github地址: https://github.com/icindy/WxAutoImage
 * 
 * for: 微信小程序图片自动宽高
 * detail : 
 */


/***
 * wxAutoImageCal 计算宽高
 * 
 * 参数 e: iamge load函数的取得的值
 * 返回计算后的图片宽高
 * {
 *  imageWidth: 100px;
 *  imageHeight: 100px;
 * }
 */
function wxAutoImageCal(e){
    //获取图片的原始长宽
    var originalWidth = e.detail.width;
    var originalHeight = e.detail.height;
    var useHeight;
    var useWidth;
    var num = 100;
    if(originalHeight>=originalWidth){
      useHeight = num;
      useWidth = (num/originalHeight)*originalWidth;
    } else if (originalHeight < originalWidth){
      useWidth = num;
      useHeight = (num/originalWidth)*originalHeight;
    } else {
      useWidth = originalWidth;
      useHeight = originalHeight;
    }
  
    var results= {};
    wx.getSystemInfo({
      success: function(res) {
        results.imageWidth = useWidth;
        results.imageheight = useHeight;
      }
    })

    return results;

  }

module.exports = {
  wxAutoImageCal: wxAutoImageCal
}