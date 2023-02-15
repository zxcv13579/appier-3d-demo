import Template from "./template.js";
import { insDefaultSetting } from "../insDefaultSetting.js";

class Effect extends Template {
  insDataSetting = insDefaultSetting;
  canvas = document.querySelector("#canvas");
  app = new PIXI.Application({
    width: this.insDataSetting["data-width"],
    height: this.insDataSetting["data-height"],
    view: this.canvas,
  });
  scene = new PIXI.Container();
  displacementFilter;
  fingerHolding = false;
  min;
  max;
  cycleTime = this.insDataSetting["data-cycle-time"];
  delay = 5;
  direction;
  idleTimer;
  circularRef;

  constructor() {
    super();
    this.pointerMoveHandler = this.pointerMoveHandler.bind(this);
    this.pointerUpHandler = this.pointerUpHandler.bind(this);
    this.toMinPosition = this.toMinPosition.bind(this);
    this.doAnimate = this.doAnimate.bind(this);
    this.doCircularAnimate = this.doCircularAnimate.bind(this);
    if (this.insDataSetting["data-interactive"].toLowerCase() === "true") {
      this.canvas.addEventListener("pointerdown", this.pointerDownHandler);
      this.canvas.addEventListener("pointermove", (e) =>
        this.pointerMoveHandler(e)
      );
      this.canvas.addEventListener("pointerup", this.pointerUpHandler);
    }

    switch (this.insDataSetting["data-animate-type"]) {
      case "horizontal":
        this.direction = "x";
        break;
      case "vertical":
        this.direction = "y";
        break;
      default:
        this.direction = null;
    }
  }
  /**  Template Life Cycle */
  TemplateDOMLoad() {}
  TemplateDidLoad() {
    console.log("[3d effect is loaded]");
    console.log("[3d effect insDataSetting] ", this.insDataSetting);

    this.init();
  }
  init() {
    this.app.stage.addChild(this.scene);

    // loader
    const depth_img = new PIXI.Sprite(
      new PIXI.Texture.from(`./assets/images/depth.jpg`)
    );
    const origin_img = new PIXI.Sprite(
      new PIXI.Texture.from(`./assets/images/origin.jpg`)
    );
    this.scene.addChild(depth_img);
    this.scene.addChild(origin_img);

    // filter
    this.displacementFilter = new PIXI.filters.DisplacementFilter(depth_img);
    this.displacementFilter.scale.x = 0;
    this.displacementFilter.scale.y = 0;

    this.scene.filters = [this.displacementFilter];

    this.calculateMinAndMax();

    if (this.insDataSetting["data-animate-type"] !== "none") {
      this.idleTimer = setTimeout(() => {
        this.toMinPosition();
      }, this.delay * 1000);
    }
  }
  toMinPosition() {
    if (this.insDataSetting["data-animate-type"] === "circular") {
      // 執行 circular 先回原點，並歸零 t
      gsap.to(this.displacementFilter.scale, {
        x: 0,
        y: 0,
        duration: this.cycleTime / 2,
        ease: "linear",
        onComplete: this.doCircularAnimate,
      });

      return;
    }
    const otherDirection = this.direction === "x" ? "y" : "x";
    gsap.to(this.displacementFilter.scale, {
      [this.direction]: this.min,
      [otherDirection]: 0,
      duration: this.cycleTime / 2,
      ease: "linear",
      onComplete: this.doAnimate,
    });
  }
  doAnimate() {
    /**
     * 左邊是 正
     * 右邊是 負
     */
    this.tl = gsap.timeline();
    this.tl
      .to(this.displacementFilter.scale, {
        [this.direction]: this.max,
        duration: this.cycleTime / 2,
        ease: "linear",
      })
      .to(this.displacementFilter.scale, {
        [this.direction]: this.min,
        duration: this.cycleTime / 2,
        ease: "linear",
        onComplete: this.doAnimate,
      });
  }
  doCircularAnimate() {
    const now = window.performance.now();

    this.displacementFilter.scale = {
      x: Math.sin((now * Math.PI * 2) / 1 / 1000) * this.max,
      y: Math.cos((now * Math.PI * 2) / 1 / 1000) * this.max,
    };
    this.circularRef = window.requestAnimationFrame(this.doCircularAnimate);
  }
  pointerDownHandler = () => {
    this.fingerHolding = true;
  };
  pointerMoveHandler(target) {
    if (!this.fingerHolding) return;
    //  清除 idleTimer
    if (this.idleTimer) clearTimeout(this.idleTimer);
    // 如果有 gsap 動畫，就 kill();
    if (this.insDataSetting["data-animate-type"] !== "none" && this.tl) {
      this.tl.kill();
    }
    if (this.insDataSetting["data-animate-type"] === "circular") {
      window.cancelAnimationFrame(this.circularRef);
    }

    this.displacementFilter.scale.x =
      (this.insDataSetting["data-width"] / 2 - target.clientX) /
      this.insDataSetting["data-swing"];
    this.displacementFilter.scale.y =
      -(this.insDataSetting["data-height"] / 2 - target.clientY) /
      this.insDataSetting["data-swing"];
  }
  pointerUpHandler = () => {
    this.fingerHolding = false;
    // 五秒後，執行動畫
    if (this.insDataSetting["data-animate-type"] !== "none") {
      this.idleTimer = setTimeout(this.toMinPosition, this.delay * 1000);
    }
  };
  calculateMinAndMax() {
    const {
      "data-animate-type": animateType,
      "data-swing": swing,
      "data-width": width,
      "data-height": height,
    } = this.insDataSetting;

    const xMin = width / 2 / swing;
    const xMax = (width / 2 - width) / swing;
    const yMin = height / 2 / swing;
    const yMax = (height / 2 - height) / swing;

    // 忽略 circular
    const isHorizontal = animateType === "horizontal";
    this.min = isHorizontal ? xMin : yMin;
    this.max = isHorizontal ? xMax : yMax;
  }
}

export default new Effect();
