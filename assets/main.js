const setting = {
  message: "Appier tool",
  swing: 20,
  pointerEvent: false,
  animations: {
    none: false,
    horizontal: true,
    vertical: false,
  },
};
const initialValue = {
  o: "",
  d: "",
  origin: "",
  deep: "",
  width: "",
  height: "",
};

// bind event
Array.prototype.slice
  .call(document.querySelectorAll('input[type="file"'))
  .forEach(function (el) {
    el.addEventListener("change", fileChange);
  });
document.querySelector("#start").addEventListener("click", function () {
  if (initialValue.origin && initialValue.deep) {
    const pixi = new Effect();
    pixi.init();
  }
});

function fileChange(e) {
  const id = e.target.id;
  const file = e.target.files[0];

  if (id === "origin") {
    document.querySelector("#o").textContent = file.name;
  } else {
    document.querySelector("#d").textContent = file.name;
  }

  const objUrl = URL.createObjectURL(file);
  initialValue[id] = objUrl;
  getImgInfo(objUrl);
}
function getImgInfo(url) {
  const img = new Image();
  img.onload = function () {
    initialValue.width = this.width;
    initialValue.height = this.height;
  };
  img.src = url;
}

class Effect {
  container = document.querySelector("#container");
  width = initialValue.width;
  height = initialValue.height;
  t = 0;
  executed = true;
  toggle = true;
  app = new PIXI.Application({ width: this.width, height: this.height });
  scene = new PIXI.Container();
  scene_origin;
  scene_deep;
  displacementFilter;
  gui = new GUI(setting);
  guiInterface = this.gui.gui;
  state = this.gui.state;
  tl = null;
  loader;
  min;
  max;
  ax;
  xMax;
  yMin;
  yMax;

  constructor() {
    this.create = this.create.bind(this);
    this.setSwing = this.setSwing.bind(this);

    this.setAnimationCheck = this.setAnimationCheck.bind(this);
    this.setDirectionCheck = this.setDirectionCheck.bind(this);
    this.setResize = this.setResize.bind(this);
    this.onPointerMove = this.onPointerMove.bind(this);
    this.onPointerOut = this.onPointerOut.bind(this);

    this.container.addEventListener("mousemove", this.onPointerMove);
    this.container.addEventListener("mouseout", this.onPointerOut);
  }

  init() {
    this.container.style.width = `${this.width}px`;
    this.container.style.height = `${this.height}px`;
    this.container.appendChild(this.app.view);

    this.app.loader.add("origin", initialValue.origin);
    this.app.loader.add("deep", initialValue.deep);
    this.app.loader.load((loader, resource) => this.create());
  }
  create(resource) {
    // 場景 1
    this.app.stage.addChild(this.scene);
    this.scene_origin = new PIXI.Sprite(
      new PIXI.Texture.from(initialValue.origin)
    );
    this.scene_origin.width = initialValue.width;
    this.scene_origin.height = initialValue.height;

    this.scene_deep = new PIXI.Sprite(new PIXI.Texture.from(initialValue.deep));
    this.scene_deep.width = initialValue.width;
    this.scene_deep.height = initialValue.height;

    this.displacementFilter = new PIXI.filters.DisplacementFilter(
      this.scene_deep
    );

    this.displacementFilter.scale.x = 0;
    this.displacementFilter.scale.y = 0;

    this.calculateMinAndMax();

    this.scene.addChild(this.scene_deep);
    this.scene.addChild(this.scene_origin);

    this.scene.filters = [this.displacementFilter];

    // handle gui
    document.querySelector("#tool").append(this.guiInterface.domElement);

    this.guiInterface.add(this.state, "message");
    this.guiInterface
      .add(this.state, "swing", -100, 100)
      .onChange(this.setSwing);
    this.guiInterface
      .add(this.state, "pointerEvent")
      .onChange(() => this.setDirectionCheck());
    const animationFolder = this.guiInterface.addFolder("動畫控制");
    for (let animation in this.state.animations) {
      animationFolder
        .add(this.state["animations"], animation)
        .onChange(() => this.setAnimationCheck(animation));
    }

    this.loop();
  }

  loop() {
    const direction = this.state.animations.horizontal ? "x" : "y";
    this.displacementFilter.scale.x = 0;
    this.displacementFilter.scale.y = 0;
    this.tl = gsap.timeline({ repeat: -1 });
    this.tl
      .to(this.displacementFilter.scale, {
        [direction]: this.min,
        duration: 0.25,
        ease: "linear",
      })
      .to(this.displacementFilter.scale, {
        [direction]: this.max,
        duration: 0.5,
        ease: "linear",
      })
      .to(this.displacementFilter.scale, {
        [direction]: 0,
        duration: 0.25,
        ease: "linear",
      });
  }

  setSwing() {
    this.tl.kill();
    this.displacementFilter.scale.x = 0;
    this.displacementFilter.scale.y = 0;
    this.calculateMinAndMax();
    this.loop();
  }
  setResize({ width, height }) {
    this.app.renderer.resize(width, height);
    this.container.style.width = `${width}px`;
    this.container.style.height = `${height}px`;
  }
  setAnimationCheck(prop) {
    for (let animation in this.state.animations) {
      this.state.animations[animation] = false;
    }
    this.state.animations[prop] = true;
    if (prop === "none") {
      this.tl.kill();
      this.displacementFilter.scale.x = 0;
      this.displacementFilter.scale.y = 0;
      return;
    }
    this.setSwing();
  }
  setDirectionCheck(prop) {
    if (prop) {
      return;
    }
    this.setSwing();
  }
  onPointerMove(e) {
    if (this.state.pointerEvent) return;
    if (this.executed) {
      this.tl.kill();
      this.executed = false;
    }
    this.displacementFilter.scale.x =
      (this.width / 2 - e.clientX) / this.state.swing;
    this.displacementFilter.scale.y =
      (this.height / 2 - e.clientY) / this.state.swing;
  }
  onPointerOut() {
    if (this.state.animations.none || this.state.pointerEvent) return;
    this.executed = true;
    this.loop();
  }
  calculateMinAndMax() {
    // 要計算 x、y 的 min max
    this.xMin = this.width / 2 / this.state.swing;
    this.xMax = (this.width / 2 - this.width) / this.state.swing;
    this.yMin = this.height / 2 / this.state.swing;
    this.yMax = (this.height / 2 - this.height) / this.state.swing;

    const isHorizontal = this.state.animations.horizontal ? true : false;
    this.min = isHorizontal ? this.xMin : this.yMin;
    this.max = isHorizontal ? this.xMax : this.yMax;
    console.log(this.min, this.max);
  }
}
