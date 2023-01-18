class Loader {
  constructor(loader, config) {
    this.loader = loader;
    this.config = config;
  }

  preload() {
    for (const texture of this.config.loader) {
      this.loader.add(texture.name, texture.url);
    }
    return new Promise((resolve) => {
      this.loader.load((loader, resource) => resolve(resource));
    });
  }
}
