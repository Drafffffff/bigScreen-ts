import "./style.css";
import Matter, {
  Bodies,
  Body,
  Composite,
  Engine,
  Render,
  Runner,
  Sleeping,
  Vector,
} from "matter-js";
import * as mqtt from "mqtt/dist/mqtt.min"; // import everything inside the mqtt module and give it the namespace "mqtt"

const wordList: CanvasWord[] = [];
const wordApplyList: wordApply[] = [];
let Barriars: Barriar[];
const engine = Engine.create({
  // enableSleeping: true,
  gravity: { scale: 0.001 },
});
const World = engine.world;
Composite.add(World, [
  Bodies.rectangle(1680 / 2, 1008, 1680, 80, { isStatic: true }),
  Bodies.rectangle(0, 1008 / 2, 80, 1008, { isStatic: true }),
  Bodies.rectangle(1680, 1008 / 2, 80, 1008, { isStatic: true }),
  // Bodies.trapezoid(400, 300, 400, 70, 1, { isStatic: true }),
  Bodies.rectangle(1680 / 2, 0, 1680, 80, { isStatic: true }),
]);

const render = Render.create({
  element: document.body,
  engine: engine,
  options: {
    width: 1680,
    height: 1008,
    showAngleIndicator: true,
  },
});

function setup() {
  // create two boxes and a ground
  Barriars = [
    new Barriar(300, 500, "cate1"),
    new Barriar(100, 589, "cate2"),
    new Barriar(400, 589 + 89, "cate3"),
  ];
  const options = {
    // Clean session
    clean: true,
    clientId: "BIGScreen",
    username: "admin",
    password: "pubilc",
    reconnectPeriod: 1000,
    connectTimeout: 30 * 1000,
  };
  const client = mqtt.connect("ws://zstu-interaction.art:8083/mqtt", options);
  client.on("error", error => {
    console.log("连接失败:", error);
  });
  client.subscribe("work/create", { qos: 0 });
  client.subscribe("work/apply", { qos: 0 });
  client.on("message", (topic, message) => {
    if (topic === "work/apply") {
      const msg = JSON.parse(message) as wordApply;
      wordApplyList.push(msg);
    } else if (topic === "work/create") {
      const msg = JSON.parse(message) as wordInfo;
      console.log(msg);
      createWord(msg);
    }
  });

  var runner = Runner.create();
  Runner.run(runner, engine);
  Render.run(render);
  // document.getElementById("app")!.onclick = handleClick;
  requestAnimationFrame(loop);
}

function loop() {
  Barriars.map(e => {
    e.update();
  });
  const deathlist: number[] = [];
  wordList.map((e, i) => {
    if (e.death) {
      deathlist.push(i);
    }
    if (!e.body.isSleeping) {
      e.draw();
    }
  });

  if (wordList) {
    wordApplyList.map(e => {
      console.log(e);
      const obj = wordList.find(obj => obj.id === e.id && obj.type === e.type);
      if (obj) {
        Sleeping.set(obj.body, false);
        Body.applyForce(obj.body, obj.body.position, e.vec);
      }
    });
  }
  wordApplyList.splice(0, wordApplyList.length);
  deathlist.forEach(e => {
    wordList.splice(e, 1);
  });
  requestAnimationFrame(loop);
}

class CanvasWord {
  el: HTMLElement;
  x: number;
  y: number;
  width: number;
  height: number;
  body: Matter.Body;
  r: number;
  id: string;
  type: wordType;
  death: boolean;
  lifeTime: number;
  constructor(word: string, x: number, y: number, id: string, type: wordType) {
    this.el = document.createElement("span");
    this.el.innerHTML = word;
    document.querySelector("#app")!.appendChild(this.el);
    // this.el.className = "canvasWord";
    //n
    if (type === 0) {
      this.el.className = "canvasWordn";
    } else if (type === 1) {
      this.el.className = "canvasWordr";
    }
    this.r = 0;
    this.x = x;
    this.y = y;
    this.id = id;
    this.type = type;
    this.width = this.el.offsetWidth;
    this.height = this.el.offsetHeight;
    this.body = Bodies.rectangle(this.x, this.y, this.width, this.height, {
      restitution: 0.2,
      angle: Math.random() * Math.PI,
      frictionStatic: 0.1,
      friction: 0.1,
    });
    this.death = false;
    // console.log(this.body);
    this.body.frictionAir = 0;
    Composite.add(World, this.body);
    this.lifeTime = 0;
  }
  show() {
    this.el.style.transform = `translateX(${this.x}px) translateY(${
      this.y - this.height / 2
    }px) rotate(${this.r}rad)`;
  }
  update() {
    if (this.lifeTime > 400) {
      this.delete();
    }
    this.x = this.body.position.x - 80;
    this.y = this.body.position.y;
    this.r = this.body.angle;
    this.lifeTime++;
  }
  draw() {
    this.update();
    this.show();
  }
  appleyForce(velocity: Matter.Vector) {
    console.log(velocity);
    Body.setVelocity(this.body, velocity);
  }
  delete() {
    Composite.remove(World, this.body, true);
    this.el.parentNode?.removeChild(this.el);
    this.death = true;
  }
}
class Barriar {
  x: number;
  y: number;
  body: Body;
  width: number;
  height: number;
  el: HTMLElement;
  v: number;
  stasticX: number;
  constructor(x: number, y: number, query: string) {
    this.x = x;
    this.stasticX = x;
    this.y = y;
    this.el = document.getElementById(query)!;
    this.width = this.el.offsetWidth;
    this.height = this.el.offsetHeight;
    this.body = Bodies.rectangle(this.x, this.y, this.width, this.height, {
      isStatic: true,
      frictionStatic: 0.1,
      friction: 0.1,
    });
    this.v = 0.01;
    Composite.add(World, this.body);
  }
  update() {
    var py =
      600 +
      this.stasticX *
        Math.sin((engine.timing.timestamp + this.stasticX) * 0.0006);
    Body.setPosition(this.body, Vector.create(py, this.y));
    // console.log(this.body.position)
    this.x = this.body.position.x;
    this.y = this.body.position.y;

    this.el.style.transform = `translateX(${
      this.x - this.width / 2
    }px) translateY(${this.y - this.height / 2}px)`;
  }
}

function createWord(data: wordInfo): void {
  wordList.push(
    new CanvasWord(
      data.word,
      Math.random() * 1000 + 300,
      120,
      data.id,
      data.type
    )
  );
}

setup();
