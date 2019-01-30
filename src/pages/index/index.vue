<template>
  <div class="container">
    <div class="nav">  
      <navigator class="nav-btn" url="/pages/recognize/main?type=text">文字识别</navigator>
      <navigator class="nav-btn" url="/pages/recognize/main?type=img">植物识别</navigator>
      <navigator class="nav-btn" url="/pages/watermark/main">水印照片</navigator>
    </div>
    <div class="lunar" @click="refresh()">
      <p class="week">{{ week }}</p>
      <p class="year">{{ lunar.cyclicalYear + lunar.animal + '年' }}</p>
      <p class="month">{{ coverCnmonth }}</p>
      <p class="day" v-if="lunar.day" :data-content='lunar.day'>{{ lunar.day }}</p>
    </div>
    <div class="hitokoto">
      <div class="daily-word">{{ dailyWord }}</div>
      <div class="author">{{dailyWordAuthor }}</div>
    </div>
  </div>
</template>

<script>
export default {
  data () {
    return { 
      dailyWord: '',
      dailyWordAuthor: '',
      lunar: {}
    }
  },
  computed: {
    coverCnmonth: function() {
      if(this.lunar.lunarMonth === 12) {
        return `${this.lunar.cnmonth}月${this.lunar.cnday}`;
      } else {
        return `${this.lunar.cnmonth}${this.lunar.cnday}`;
      }
    },
    week: function() {
      switch (this.lunar.week) {
        case 'Tuesday':
          return '星期贰'
          break;
        case 'Wednesday':
          return '星期叁'
          break;
        case 'Thursday':
          return '星期肆'
          break;
        case 'Friday':
          return '星期伍'
          break;
        case 'Saturday':
          return '星期陆'
          break;
        case 'Sunday':
          return '星期柒'
          break;
        case 'Monday':
          return '星期壹'
          break;
        default:
        return '外星入侵' // 接口频繁请求报错时使用
          break;
      }
    }
  },
  methods: {
    // 接入一言api
    getHitokoto() {
      let _this = this;
      // 参数c类型： a动画 b漫画 c游戏 d小说 e原创 f网络 g其他
      let items = ['a', 'b', 'c', 'd'];
      let item = items[Math.floor(Math.random() * items.length)];
      this.$fly.get("/", { encode: 'json', c: item }, {
        baseURL: 'https://v1.hitokoto.cn',
      }).then(function(res) {
        _this.dailyWord = res.data.hitokoto;  
        _this.dailyWordAuthor = res.data.from;  
      })
    },
    // 接入获取农历信息api
    getLunar() {
      let _this = this;
      this.$fly
        .get("https://www.sojson.com/open/api/lunar/json.shtml",{
          baseURL: '',
        })
        .then(function(res) {
          if(res.data.status === 304) {
            wx.showToast({
              title: '请勿频繁操作',
              icon: 'warning',
              duration: 1500
            });
            
          } else {
            _this.lunar = res.data.data;
          }
        })
    },

    refresh() {
      wx.redirectTo({
        url: '/pages/index/main'
      })
    }
  },
  created() {
    // wx.redirectTo 不会再次执行
    this.getLunar();
  },
  mounted () {
    this.getHitokoto();
  }
}
</script>

<style scoped lang='scss'>
.container {
  padding: 0 0 160rpx 0; 
  height: 100vh;
  background: #d0d0d0 url(https://bing.ioliu.cn/v1/rand?w=720&h=1280) no-repeat 0 0 { /* bing随机图片api */
    size: cover
  };
}

.nav {
  background-color:rgba(255,255,255,.6);
  padding: 40rpx 40rpx 0;
  border-radius: 10rpx;
  box-shadow: 0 2rpx 6rpx 2rpx #999;
  margin: 340rpx 0 0 320rpx;
}

.nav-btn {
  position: relative;
  font-size: 40rpx;
  line-height: 1.5;
  padding: 10rpx 20rpx;
  margin-bottom: 30rpx;
  background: linear-gradient(to right, #f00, #00f); /* 字体渐变 */
  -webkit-background-clip: text;
  color: transparent;

  &::before {
    position: absolute; 
    content: '';
    top: 0;
    left: 0; 
    width: 100%; 
    height: 100%; 
    background: linear-gradient(to left, #f00, #f00) left top no-repeat, 
                linear-gradient(to bottom, #f00, #f00) left top no-repeat, 
                linear-gradient(to left, #f00, #f00) right top no-repeat,
                linear-gradient(to bottom, #f00, #f00) right top no-repeat, 
                linear-gradient(to left, #f00, #f00) left bottom no-repeat,
                linear-gradient(to bottom, #f00, #f00) left bottom no-repeat,
                linear-gradient(to left, #f00, #f00) right bottom no-repeat,
                linear-gradient(to left, #f00, #f00) right bottom no-repeat;
    background-size: 1px 10px, 10px 1px;
  }
}

.hitokoto {
  min-width: 50%;
  color: #fff;
  font-size: 30rpx;
  margin: 0 40rpx;
  letter-spacing: 2rpx;
  .daily-word {
    text-indent: 2em;
  }
  .author {
    text-align: right;
    font-size: 32rpx;
    margin-top: 20rpx;
  }
}

.lunar {
  position: absolute;
  top: 100rpx;
  left: 40rpx;
  writing-mode: vertical-rl; /* 文字排列 */
  font-size: 24rpx;
  letter-spacing: 6rpx;
  color: #fff;
  .year {
    margin-right: 6rpx;
    border-right: 1rpx dashed #fff;
  }
  .month {
    margin-top: 1em;
    margin-right: 6rpx;
    border-right: 1rpx dashed #fff;
  }
  .week {
    margin-top: 2em;
    border-right: 1rpx dashed #fff;
  }
  .day {
    writing-mode: horizontal-tb;
    font-size: 90rpx;
    color: #000;
    position: relative;
      &:before {
      display:block;
      z-index:1;
      position:absolute;
      top: 0;
      left:0;
      width: 100%;
      height: 50%;
      content: attr(data-content); /* 伪元素的动态获取内容 */
      overflow:hidden;
      color: #fff;
    }
  }
}
</style>
