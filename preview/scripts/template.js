export default class Template {
  constructor() {
    // bind this execution contexts
    this.TemplateDOMLoad = this.TemplateDOMLoad.bind(this);
    this.TemplateDidLoad = this.TemplateDidLoad.bind(this);
    this.TemplateWillUnload = this.TemplateWillUnload.bind(this);

    // prepare event listeners
    window.addEventListener("DOMContentLoaded", this.TemplateDOMLoad);
    window.addEventListener("load", this.TemplateDidLoad);

    // remove event listeners before page unloads
    window.onbeforeunload = () => {
      this.TemplateWillUnload();
      window.removeEventListener("DOMContentLoaded", this.TemplateDOMLoad);
      window.removeEventListener("load", this.TemplateDidLoad);
    };
  }

  TemplateDOMLoad() {}
  TemplateDidLoad() {}
  TemplateWillUnload() {}
}
