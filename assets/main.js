const container = document.querySelector("#container");
const width = 768;
const height = 432;
let t = 0;
let executed = true;

container.style.width = `${width}px`;
container.style.height = `${height}px`;

const app = new PIXI.Application({ width: width, height: height });
container.appendChild(app.view);

const frontImg = PIXI.Sprite.from("./assets/images/pikachu-1.jpg");
frontImg.width = width;
frontImg.height = height;
app.stage.addChild(frontImg);

const depthImg = PIXI.Sprite.from("./assets/images/pikachu-2.jpg");
depthImg.width = width;
depthImg.height = height;

const displacementFilter = new PIXI.filters.DisplacementFilter(depthImg);

app.stage.addChild(depthImg);
app.stage.addChild(frontImg);

app.stage.filters = [displacementFilter];

container.addEventListener("mousemove", onPointerMove);
container.addEventListener("mouseout", function () {
  executed = true;
});

function onPointerMove(e) {
  executed = false;
  displacementFilter.scale.x = (width / 2 - e.clientX) / 20;
  displacementFilter.scale.y = (height / 2 - e.clientY) / 20;

  // console.log(displacementFilter.scale.x);
}

app.ticker.add(function (delta) {
  if (!executed) return;
  t += Math.PI / 120;
  displacementFilter.scale.x = displacementFilter.scale.x - Math.sin(t) * 0.2;
});
