const initialValue = {
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
  gui = new GUI();
  guiInterface = this.gui.gui;
  state = this.gui.state;
  tl = gsap.timeline();
  loader;

  constructor() {
    this.create = this.create.bind(this);
    this.setDelta = this.setDelta.bind(this);

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

    // this.loader = new Loader(this.app.loader, config);
    // this.loader.preload().then((resource) => this.create(resource));
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

    this.displacementFilter1 = new PIXI.filters.DisplacementFilter(
      this.scene_deep
    );

    this.displacementFilter1.scale.x = 0;
    this.displacementFilter1.scale.y = 0;

    this.scene.addChild(this.scene_deep);
    this.scene.addChild(this.scene_origin);

    this.scene.filters = [this.displacementFilter1];

    // this.app.ticker.add((delta) => {
    //   if (!this.executed) return;
    //   this.t += Math.PI / 120;

    //   if (this.state.animations.horizontal) {
    //     [this.displacementFilter1].forEach((displacementFilter) => {
    //       displacementFilter.scale.x =
    //         displacementFilter.scale.x -
    //         Math.sin(this.t) * this.state.animations.swing;
    //     });
    //   }
    //   if (this.state.animations.vertical) {
    //     [this.displacementFilter1].forEach((displacementFilter) => {
    //       displacementFilter.scale.y =
    //         displacementFilter.scale.y -
    //         Math.sin(this.t) * this.state.animations.swing;
    //     });
    //   }
    // });

    // handle gui
    document.querySelector("#tool").append(this.guiInterface.domElement);

    this.guiInterface
      .addFolder("displacementFilter")
      .add(this.state.displacementFilter, "enabled")
      .listen()
      .onChange(
        () =>
          (this.displacementFilter1.enabled = !this.displacementFilter1.enabled)
      );

    const animationFolder = this.guiInterface.addFolder("動畫控制");
    for (let animation in this.state.animations) {
      if (animation === "swing") continue;
      animationFolder
        .add(this.state.animations, animation)
        .listen()
        .onChange(() => this.setAnimationCheck(animation));
    }
    animationFolder
      .add(this.state.animations, "swing", 0, 2)
      .listen()
      .onChange(this.setDelta);

    const eventsFolder = this.guiInterface.addFolder("手指、滑鼠事件");
    for (let direction in this.state.events) {
      if (direction === "depth") continue;
      eventsFolder
        .add(this.state.events, direction)
        .listen()
        .onChange(() => this.setDirectionCheck(direction));
    }
    eventsFolder
      .add(this.state.events, "depth", -100, 100)
      .listen()
      .onChange(this.setDelta);
  }

  setDelta() {
    this.t = 0;
    this.displacementFilter1.scale.x = 0;
    this.displacementFilter1.scale.y = 0;
  }
  setResize({ width, height }) {
    this.app.renderer.resize(width, height);
    this.container.style.width = `${width}px`;
    this.container.style.height = `${height}px`;
  }
  setAnimationCheck(prop) {
    for (let animation in this.state.animations) {
      if (animation === "swing") continue;
      this.state.animations[animation] = false;
    }
    this.state.animations[prop] = true;
    this.setDelta();
  }
  setDirectionCheck(prop) {
    for (let event in this.state.events) {
      if (event === "depth") continue;
      this.state.events[event] = false;
    }
    this.state.events[prop] = true;
    this.setDelta();
  }

  onPointerMove(e) {
    if (!this.toggle) return;
    this.executed = false;
    if (this.state.events.horizontal) {
      [this.displacementFilter1].forEach((displacementFilter) => {
        displacementFilter.scale.x =
          (this.width / 2 - e.clientX) / this.state.events.depth;
      });
    }
    if (this.state.events.vertical) {
      [this.displacementFilter1].forEach((displacementFilter) => {
        displacementFilter.scale.y =
          (this.height / 2 - e.clientY) / this.state.events.depth;
      });
    }
  }

  onPointerOut() {
    this.executed = true;
  }
}

// window.addEventListener("load", function () {
//   const pixi = new Effect();
//   pixi.init();
// });
