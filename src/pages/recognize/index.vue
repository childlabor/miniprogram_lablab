<template>
  <div class="">
    <mpvue-cropper ref="cropper" :option="cropperOpt" @ready="cropperReady" @beforeDraw="cropperBeforeDraw" @beforeImageLoad="cropperBeforeImageLoad" @beforeLoad="cropperLoad"></mpvue-cropper>
    <icon v-if="recognizeContent.length !== 0" type="download" size="20" class="cp-btn" @click="cpContent()" />
    <scroll-view scroll-y class="content-text" >
      <ul v-if="pageType == 'text'">
        <li v-for="(item,index) in recognizeContent" :key="index">
          {{ item.words }}
        </li>
      </ul>
      <div v-else-if="pageType == 'img'">
        <h2>{{ recognizeContent[0].name }}</h2>
        <p>{{ recognizeContent[0].baike_info.description }}</p>
        <a class="read-more" @click="webviewNav">查看更多</a>
      </div>
      <view class="prompt-p" style="" v-else>
        <view class="prompt-c">
          &emsp;&emsp;请选择图片或拍照上传，并将需识别的内容缩放至识别框内。识别准确率跟拍摄光照、背景、清晰度等因素有关。请尽量保持图片内容整齐，清晰。文本字数影响识别速度，长文本请分段识别~
        </view>
      </view>
    </scroll-view>
    <div class="cropper-buttons">
      <div class="upload" @tap="uploadTap">
        选择图片
      </div>
      <div class="getCropperImage" @tap="getCropperImage">
        识别图片
      </div>
    </div>
  </div>
</template>

<script>
import MpvueCropper from "mpvue-cropper";
let wecropper;
const device = wx.getSystemInfoSync();
const width = device.windowWidth;
const height = device.windowHeight * 0.4;

export default {
  data() {
    return {
      cropperOpt: {
        id: "cropper",
        width, // 画布大小
        height,
        scale: 10, // 最大缩放倍数
        zoom: 8, // 缩放系数（1-10）
        cut: {
          x: width * 0.1 / 2, // 裁剪框的坐标
          y: height * 0.1 / 2,
          width: width * 0.9, // 裁剪框的大小
          height: height * 0.9
        }
      },
      imgData: {},
      recognizeContent: [],
      pageType: ''
    };
  },

  components: {
    MpvueCropper
  },

  mounted() {
    wecropper = this.$refs.cropper;
  },

  methods: {
    cropperReady(...args) {
      console.log("cropper ready!");
    },
    cropperBeforeImageLoad(...args) {
      console.log("before image load");
    },
    cropperLoad(...args) {
      console.log("image loaded");
    },
    cropperBeforeDraw(...args) {
      // Todo: 绘制水印等等
    },
    uploadTap() {
      wx.chooseImage({
        count: 1, // 默认9
        sizeType: ["original", "compressed"], // 可以指定是原图还是压缩图，默认二者都有
        sourceType: ["album", "camera"], // 可以指定来源是相册还是相机，默认二者都有
        success: res => {
          const src = res.tempFilePaths[0];
          //  获取裁剪图片资源后，给data添加src属性及其值
          wecropper.pushOrigin(src);
        },
        fail: error => {
          console.log(error);
        }
      });
    },
    getCropperImage() {
      wx.showLoading({
        title: "识别中..."
      });
      wecropper
        .getCropperImage()
        .then(src => {
          this.recognize(src);
        })
        .catch(e => {
          console.error("获取图片失败");
        });
    },

    recognize(src) {
      let type = this.$root.$mp.query.type
      let _this = this;
      // 转为base64码
      wx.getFileSystemManager().readFile({
        filePath: src,
        encoding: "base64",
        success: function(data) {
          switch (type) {
            case "text":
              _this.$fly
                .post("/ocrtest", {
                  imageBase64: data.data
                })
                .then(function(res) {
                  _this.recognizeContent = res.data.words_result;
                  _this.pageType = "text";
                  wx.hideLoading();
                })
                .catch(function(error) {
                  console.log(error);
                });
              break;
            case "img":
              _this.$fly
                .post("/plantDetect", {
                  imageBase64: data.data
                })
                .then(function(res) {
                  _this.recognizeContent =  res.data.result;
                  _this.pageType = "img";
                  wx.hideLoading();
                })
                .catch(function(error) {
                  console.log(error);
                });
              break;
            default:
              break;
          }
        }
      });
    },

    cpContent() {
      let contentText = "";
      if (this.recognizeContent.length != 0) {
        if(this.pageType == 'text') {  
          this.recognizeContent.forEach(function(item) {
            contentText += item.words;
          });
        }
        if(this.pageType == 'img') {  
          contentText = `${this.recognizeContent[0].name} \n\t ${this.recognizeContent[0].baike_info.description}`
        }
        wx.setClipboardData({
          data: contentText,
          success(res) {
            wx.showToast({
              title: "复制成功",
              icon: "success",
              duration: 1500
            });
          },
          fail(error) {
            wx.showToast({
              title: "复制失败",
              icon: "none",
              duration: 1500
            });
          }
        });
      } else {
        wx.showToast({
          title: "请先选择图片，进行识别...",
          icon: "none",
          duration: 1500
        });
      }
    },

    contentTextClear() {
      this.recognizeContent = [];
      this.pageType = "";
      console.log('leave');
    },

    webviewNav() {
      wx.navigateTo({
        url: `/pages/webview/main?type=${this.recognizeContent[0].baike_info.baike_url}`
      })
    }

  },

  created() {
    // 调用应用实例的方法获取全局数据
  },

  // 页面卸载
  onUnload() {
    this.contentTextClear();
  }
};
</script>

<style scope lang='scss'>
.content-text {
  position: relative;
  height: 50vh;
  padding: 10rpx 30rpx;
  box-sizing: border-box;
  text-align: justify;
  word-break: break-all;
  font-size: 32rpx;
}

.cp-btn {
  position: fixed;
  bottom: 70px;
  right: 20px;
  opacity: 0.7;
  z-index: 999;
}

.prompt-p {
  display: table;
  width: 100%;
  height: 100%;
}

.prompt-c {
  display: table-cell;
  vertical-align: middle;
  text-align: left;
  color: #a0a0a0;
  padding: 0 20rpx;
  font-size: 24rpx;
}

.read-more {
  color: #04b00f;
}

.cropper-wrapper {
  position: relative;
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  justify-content: center;
  height: 100%;
  background-color: #e5e5e5;
}

.cropper-buttons {
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  justify-content: center;
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  height: 50px;
  line-height: 50px;
  background-color: rgba(0, 0, 0, 0.95);
  color: #04b00f;

  .upload, .getCropperImage {
    width: 50%;
    text-align: center;
  }
  .upload {
    position: relative;
    &::before {
      content: '';
      width: 1px;
      height: 60%;
      position: absolute;
      right: 0;
      top: 20%;
      background: rgba(0, 255, 0, .3);
    }
  }
}

.cropper {
  position: absolute;
  top: 0;
  left: 0;
}

</style>
