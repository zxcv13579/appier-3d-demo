const scenes = {
  scene1: {
    width: 768,
    height: 432,
  },
};

const config = {
  loader: [
    {
      name: "scene_1_img",
      url: "./assets/images/pikachu-1.jpg",
    },
    {
      name: "scene_1_mask",
      url: "./assets/images/pikachu-2.jpg",
    },
  ],
};

class Effect {
  container = document.querySelector("#container");
  width = 768;
  height = 432;
  t = 0;
  executed = true;
  toggle = true;
  app = new PIXI.Application({ width: this.width, height: this.height });
  scene1 = new PIXI.Container();
  scene_1_img;
  scene_1_mask;
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

    this.loader = new Loader(this.app.loader, config);
    this.loader.preload().then((resource) => this.create(resource));
  }
  create(resource) {
    // 場景 1
    this.app.stage.addChild(this.scene1);
    this.scene_1_img = new PIXI.Sprite(resource.scene_1_img.texture);
    this.scene_1_img.width = scenes.scene1.width;
    this.scene_1_img.height = scenes.scene1.height;

    this.scene_1_mask = new PIXI.Sprite.from(resource.scene_1_mask.texture);
    this.scene_1_mask.width = scenes.scene1.width;
    this.scene_1_mask.height = scenes.scene1.height;

    this.displacementFilter1 = new PIXI.filters.DisplacementFilter(
      this.scene_1_mask
    );

    this.displacementFilter1.scale.x = 0;
    this.displacementFilter1.scale.y = 0;

    this.scene1.addChild(this.scene_1_mask);
    this.scene1.addChild(this.scene_1_img);

    this.scene1.filters = [this.displacementFilter1];

    this.app.ticker.add((delta) => {
      if (!this.executed) return;
      this.t += Math.PI / 120;

      if (this.state.animations.horizontal) {
        [this.displacementFilter1].forEach((displacementFilter) => {
          displacementFilter.scale.x =
            displacementFilter.scale.x -
            Math.sin(this.t) * this.state.animations.swing;
        });
      }
      if (this.state.animations.vertical) {
        [this.displacementFilter1].forEach((displacementFilter) => {
          displacementFilter.scale.y =
            displacementFilter.scale.y -
            Math.sin(this.t) * this.state.animations.swing;
        });
      }
    });

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

window.addEventListener("load", function () {
  const pixi = new Effect();
  pixi.init();
});
