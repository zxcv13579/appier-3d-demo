class GUI {
  gui = new dat.GUI({
    name: "My GUI",
    domElement: document.querySelector("#tool"),
  });
  state = {
    scenes: {
      scene1: true,
      scene2: false,
    },
    displacementFilter: {
      enabled: false,
    },
    swing: {
      swing: 20,
    },
    animations: {
      none: false,
      horizontal: true,
      vertical: false,
    },
    events: {
      none: false,
      horizontal: true,
      vertical: false,
    },
  };
}
