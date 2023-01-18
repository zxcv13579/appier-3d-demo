class GUI {
  gui = new dat.GUI({ name: "My GUI" });
  state = {
    scenes: {
      scene1: true,
      scene2: false,
    },
    displacementFilter: {
      enabled: false,
    },
    swing: {
      value: 0.2,
    },
    animations: {
      none: false,
      horizontal: true,
      vertical: false,
      swing: 0.2,
    },
    events: {
      none: false,
      horizontal: true,
      vertical: false,
      depth: 20,
    },
  };
}
