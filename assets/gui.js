class GUI {
  gui = new dat.GUI({
    name: "My GUI",
    domElement: document.querySelector("#tool"),
  });
  constructor(setting) {
    this.state = setting;
  }
}
