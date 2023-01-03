import { createApp } from "vue";
import App from "./App.vue";

const app = createApp(App);

const lazyPlugin = {
  install(app, options) {
    const dom = document.querySelector("html");
    const ObserverList = [];
    const scrollFun = (() => {
      const initUrl = (num) => {
        ObserverList.forEach(({ el, value }, index) => {
          // 判断当前元素距离顶部减去当前屏幕高度的距离是否小于当前屏幕到顶部距离，如果小于则懒加载
          if (el.offsetTop - window.innerHeight < num) {
            el.src = value;
            // 移除渲染完毕的元素
            ObserverList.splice(index, 1);
          }
        });
      };
      return () => {
        initUrl(dom.scrollTop);
        window.addEventListener("scroll", () => {
          initUrl(dom.scrollTop);
        });
      };
    })();

    // 自定义指令
    app.directive("lazy", {
      mounted(el, { value }) {
        ObserverList.push({ el, value });
        scrollFun();
      },
    });
  },
};
app.use(lazyPlugin)
app.mount("#app");
