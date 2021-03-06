import { fillPoints, randomY } from './utility.js';
import Crack from './crack.js';

export default class CrackOpenIntro extends HTMLElement {
  constructor() {
    super();
    this.shadow = this.attachShadow({mode: 'open'});
    this.shadow.innerHTML = `
      <style>
        canvas {
          position: absolute;
          top: 0;
          left: 0;
          z-index: 1000;
        }
      </style>
      <canvas></canvas>
    `;

    this.canvas = this.shadow.querySelector('canvas');
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;

    var resizeTimer;
    window.onresize = event => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
      }, 250);
    };
  }

  connectedCallback() {
    this.context = this.canvas.getContext('2d');
    this.gap = 0;
    this.gapSpeed = parseFloat(this.dataset.gapSpeed) || 0;
    this.gapAcceleration = parseFloat(this.dataset.gapAcceleration) || 0.2;
    this.lineRed = parseFloat(this.dataset.lineRed) || 0;
    this.lineGreen = parseFloat(this.dataset.lineGreen) || 0;
    this.lineBlue = parseFloat(this.dataset.lineBlue) || 0;
    this.lineOpacity = parseFloat(this.dataset.lineOpacity) || 1;
    this.fillRed = parseFloat(this.dataset.fillRed) || 230;
    this.fillGreen = parseFloat(this.dataset.fillGreen) || 230;
    this.fillBlue = parseFloat(this.dataset.fillBlue) || 230;
    this.fillOpacity = parseFloat(this.dataset.fillOpacity) || 1;
    this.acceleration = parseFloat(this.dataset.acceleration) || 0.05;

    this.crack = new Crack({
      context: this.context,
      startX: 0,
      startY: (randomY() / 4) + (window.innerHeight * (3/8)),
      segmentCount: 1,
      breakSize: 10,
      red: this.lineRed,
      blue: this.lineBlue,
      green: this.lineGreen,
      opacity: this.lineOpacity,
      breakSpeed: 0,
      breakAcceleration: this.acceleration,
      startGrows: false,
      endGrowHorizontalDir: 1,
      stayBounded: true
    });

    var self = this;
    function animate() {
      requestAnimationFrame(animate);
      self.context.clearRect(0, 0, window.innerWidth, window.innerHeight);
      self.doAnimate();
      self.crack.update();
    }

    animate();
  }

  doAnimate() {
    if (this.crack.reachedEdge) {
      this.crack.doUpdate = false;
      this.crack.render = false;
      this.gap += this.gapSpeed;
      this.gapSpeed += this.gapAcceleration;

      var belowPoints = Array.from(this.crack.points);
      belowPoints.push({x: window.innerWidth, y: window.innerHeight});
      belowPoints.push({x: 0, y: window.innerHeight});
      fillPoints({
        context: this.context,
        points: belowPoints,
        shift: this.gap,
        fillRed: this.fillRed,
        fillGreen: this.fillGreen,
        fillBlue: this.fillBlue,
        fillOpacity: this.fillOpacity,
        lineOpacity: 0
      });

      var abovePoints = Array.from(this.crack.points);
      abovePoints.push({x: window.innerWidth, y: 0});
      abovePoints.push({x: 0, y: 0});
      fillPoints({
        context: this.context,
        points: abovePoints,
        shift: -this.gap,
        fillRed: this.fillRed,
        fillGreen: this.fillGreen,
        fillBlue: this.fillBlue,
        fillOpacity: this.fillOpacity,
        lineOpacity: 0
      });
    } else {
      this.context.fillStyle = `rgb(${this.fillRed}, ${this.fillGreen}, ${this.fillBlue}, ${this.fillOpacity})`;
      this.context.fillRect(0, 0, window.innerWidth, window.innerHeight);
    }
  }
}

customElements.define('crack-open-intro', CrackOpenIntro);
