<template>
  <div class="">
    <view class="img" @click="uploadTap()">
      <image
        style="width: 200px; height: 200px; background-color: #eeeeee;"
        mode="aspectFit"
        :src="src"
      ></image>
    </view>
    <canvas style="width: 300px; height: 300px;" canvas-id="myCanvas"></canvas>
    <div @click="drawCanvas()">生成</div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      src: '111.png'
    };
  },

  mounted() {
    
  },

  methods: {
    uploadTap() {
      wx.chooseImage({
        count: 1, // 默认9
        sizeType: ["original", "compressed"], 
        sourceType: ["album", "camera"], 
        success: res => {
          this.src = res.tempFilePaths[0];  
        },
        fail: error => {
          console.log(error);
        }
      });
    },
    drawCanvas() {
      // const img = new Image();
      // img.src = this.src;
      // img.crossOrigin = 'anonymous';
      // img.onload = function() {
      //   const canvas = document.createElement('canvas');
      //   canvas.width = img.width;
      //   canvas.height = img.height;
      //   const ctx = canvas.getContext('2d');

      //   ctx.drawImage(img, 0, 0);
      //   ctx.textAlign = 'center';
      //   ctx.fillText('testing', img.width - 100, img.height - 30);
      // }

      const ctx = wx.createCanvasContext('myCanvas');
      ctx.drawImage(this.src, 0, 0, 150, 100);
      ctx.setFontSize(20);
      ctx.fillText('Hello', 20, 20);
      ctx.draw(false,
        wx.canvasToTempFilePath({
          x: 100,
          y: 200,
          width: 50,
          height: 50,
          destWidth: 100,
          destHeight: 100,
          canvasId: 'myCanvas',
          success(res) {
            console.log(res.tempFilePath)
            wx.saveImageToPhotosAlbum({
              filePath: res.tempFilePath,
              success(res) { 
                console.log('222');
                
              }
            })
          }
        })
      );
    }
  },

  created() {
    // 调用应用实例的方法获取全局数据
  },

  // 页面卸载
  onUnload() {
    
  }
};
</script>

<style scope lang='scss'>

</style>
