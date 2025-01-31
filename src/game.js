var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import './style.css';
import { Elements } from './elements';
import { Anim } from './engine';
import { Helper } from './helpers';
import frameData from './data.json';
const width = 21;
const height = 11;
const moveBinds = [65, 87, 68, 83];
const helper = new Helper();
const dsplySize = helper.size;
const elements = new Elements();
export class Game {
    constructor() {
        this.gameBoard = [];
        this.baloonCount = 10;
        this.controller = [];
        this.exploding = false;
        this.isDead = false;
        this.desBrickCount = 0;
        this.movePlayer = false;
        this.powered = false;
        this.flamePoses = [];
        this.anim = () => {
            this.allSprites.bomb.moving ? this.allSprites.bomb.goAnim() : null;
            this.allSprites.player.goAnim();
            this.allSprites.baloons.forEach((e) => {
                if (!e.moving) {
                    this.allSprites.baloons.splice(this.allSprites.baloons.indexOf(e), 1);
                    this.baloonCount--;
                }
                e.goAnim();
            });
            if (this.exploding) {
                let booms = 0;
                this.allSprites.flames.forEach((e) => {
                    e.goAnim();
                    e.moving === true ? booms++ : null;
                });
                this.exploding = booms === 0 ? false : true;
            }
            for (let i = 0; i < this.desBrickCount; i++) {
                if (!this.allSprites.desBrick[i].moving) {
                    this.desBrickCount = 0;
                    break;
                }
                this.allSprites.desBrick[i].goAnim();
            }
            this.isDead ? this.allSprites.dead.goAnim() : null;
            setTimeout(window.requestAnimationFrame, 1000 / 30, this.anim); // ~30 klatek/s
        };
        // createGameBoard = (w: number, h: number) => {
        // };
        this.placeBricks = (n) => {
            const poses = helper.getNRandomFreePositions(n, width, height, this.gameBoard);
            this.powerPose = poses[Math.floor(Math.random() * n)];
            poses.forEach((e) => {
                if (e[0] == this.powerPose[0] && e[1] == this.powerPose[1]) {
                    console.log(this.powerPose);
                    const power = helper.newTile('power', 'sprite', elements.powerUrl, e[0], e[1], dsplySize);
                    this.body.appendChild(power);
                }
                const brick = helper.newTile(`brick${e[1]},${e[0]}`, 'sprite', elements.brickUrl, e[0], e[1], dsplySize);
                this.gameBoard[e[1]][e[0]] = 4;
                this.body.appendChild(brick);
            });
        };
        this.activateControls = () => {
            addEventListener('keypress', this.handleBinds);
            addEventListener('keyup', (e) => {
                if (moveBinds.includes(e.which)) {
                    this.controller.splice(this.controller.indexOf(e.which), 1);
                    if (this.controller.length == 0) {
                        this.movePlayer = false;
                    }
                    this.allSprites.player.moving = false;
                }
            });
        };
        this.handleBinds = (e) => {
            const prKey = e.which - 32;
            if (moveBinds.includes(prKey)) {
                //wasd
                this.currKey = prKey;
                this.controller.includes(this.currKey)
                    ? null
                    : this.controller.push(this.currKey);
                this.movePlayer = true;
            }
            else if (prKey == 90) {
                //z
                if (!this.exploding && !this.allSprites.bomb.moving) {
                    this.explode(this.allSprites.player.pos[0], this.allSprites.player.pos[1]);
                }
            }
        };
        this.allatPlayerMoveShi = () => {
            if (this.movePlayer) {
                let xyMove = [0, 0];
                const velocity = Math.round(dsplySize / 9);
                let directions = ['left', 'up', 'right', 'down'];
                const hb = this.allSprites.player.hitbox;
                this.controller.forEach((key) => {
                    let temp;
                    switch (key) {
                        case moveBinds[0]:
                            temp = helper.checkMoveAvail(hb.lt[1], hb.lt[0] - velocity, hb.lb[1], hb.lb[0] - velocity, -velocity, this.gameBoard, dsplySize);
                            if (typeof temp === 'string')
                                directions[0] = temp;
                            else
                                xyMove[0] = temp;
                            break;
                        case moveBinds[1]:
                            temp = helper.checkMoveAvail(hb.lt[1] - velocity, hb.lt[0], hb.rt[1] - velocity, hb.rt[0], -velocity, this.gameBoard, dsplySize);
                            if (typeof temp === 'string')
                                directions[1] = temp;
                            else
                                xyMove[1] = temp;
                            break;
                        case moveBinds[2]:
                            temp = helper.checkMoveAvail(hb.rt[1], hb.rt[0] + velocity, hb.rb[1], hb.rb[0] + velocity, velocity, this.gameBoard, dsplySize);
                            if (typeof temp === 'string')
                                directions[2] = temp;
                            else
                                xyMove[0] = temp;
                            break;
                        case moveBinds[3]:
                            temp = helper.checkMoveAvail(hb.lb[1] + velocity, hb.lb[0], hb.rb[1] + velocity, hb.rb[0], velocity, this.gameBoard, dsplySize);
                            if (typeof temp === 'string')
                                directions[3] = temp;
                            else
                                xyMove[1] = temp;
                            break;
                    }
                });
                this.allSprites.player.moving = true;
                this.allSprites.player.movePlayer(directions[moveBinds.indexOf(this.currKey)], xyMove);
                this.allSprites.baloons.forEach((e) => {
                    if (e.pos[0] === this.allSprites.player.pos[0] &&
                        e.pos[1] === this.allSprites.player.pos[1]) {
                        this.killPlayer();
                    }
                    else if (this.gameBoard[this.allSprites.player.pos[1]][this.allSprites.player.pos[0]] == 5) {
                        this.killPlayer();
                    }
                });
                if (this.powerPose[0] === this.allSprites.player.pos[0] &&
                    this.powerPose[1] === this.allSprites.player.pos[1]) {
                    document.getElementById('power').style.display = 'none';
                    document.getElementById('player').style.filter = 'hue-rotate(163deg)';
                    this.powerPose = [0, 0];
                    this.powered = true;
                }
            }
        };
        this.ActivateBaloon = (baloon, pos) => {
            const obj = {
                left: this.gameBoard[pos[1]][pos[0] - 1] === 2 ? true : false,
                up: this.gameBoard[pos[1] - 1][pos[0]] === 2 ? true : false,
                right: this.gameBoard[pos[1]][pos[0] + 1] === 2 ? true : false,
                down: this.gameBoard[pos[1] + 1][pos[0]] === 2 ? true : false,
            };
            baloon.moveBaloon(obj);
            if (baloon.pos[0] === this.allSprites.player.pos[0] &&
                baloon.pos[1] === this.allSprites.player.pos[1]) {
                this.killPlayer();
            }
        };
        this.explode = (x, y) => __awaiter(this, void 0, void 0, function* () {
            this.allSprites.bomb.moving = true;
            this.allSprites.bomb.goTo(x, y);
            this.gameBoard[y][x] = 6;
            yield new Promise((e) => setTimeout(e, 2500));
            this.tileExplosion(x, y, 4);
            if (this.powered) {
                if (this.tileExplosion(x - 1, y, 5))
                    this.tileExplosion(x - 2, y, 0);
                if (this.tileExplosion(x, y - 1, 6))
                    this.tileExplosion(x, y - 2, 1);
                if (this.tileExplosion(x + 1, y, 7))
                    this.tileExplosion(x + 2, y, 2);
                if (this.tileExplosion(x, y + 1, 8))
                    this.tileExplosion(x, y + 2, 3);
            }
            else {
                this.tileExplosion(x - 1, y, 0);
                this.tileExplosion(x, y - 1, 1);
                this.tileExplosion(x + 1, y, 2);
                this.tileExplosion(x, y + 1, 3);
            }
            this.clearFlames();
            this.exploding = true;
        });
        this.tileExplosion = (x, y, i) => {
            if (this.gameBoard[y][x] !== 3 &&
                x > 0 &&
                y > 0 &&
                x < width &&
                y < height) {
                if (this.gameBoard[y][x] == 4) {
                    document.getElementById(`brick${y},${x}`).style.display = 'none';
                    this.gameBoard[y][x] = 2;
                    this.allSprites.desBrick[this.desBrickCount].goTo(x, y);
                    this.allSprites.desBrick[this.desBrickCount].moving = true;
                    this.desBrickCount++;
                }
                this.allSprites.flames[i].goTo(x, y);
                this.flamePoses.push([x, y]);
                this.allSprites.flames[i].moving = true;
                if (this.allSprites.player.pos[0] == x &&
                    this.allSprites.player.pos[1] == y) {
                    this.killPlayer();
                }
                this.allSprites.baloons.forEach((e) => {
                    if (e.pos[0] == x && e.pos[1] == y) {
                        this.killBaloon(e);
                    }
                });
                this.gameBoard[y][x] = 5;
            }
            return this.gameBoard[y][x] !== 3;
        };
        this.clearFlames = () => __awaiter(this, void 0, void 0, function* () {
            yield new Promise((r) => setTimeout(r, 700));
            this.flamePoses.forEach((e) => {
                this.gameBoard[e[1]][e[0]] = 2;
            });
            this.flamePoses = [];
        });
        this.killPlayer = () => {
            this.isDead = true;
            this.allSprites.player.moving = false;
            this.allSprites.player.vanish();
            this.allSprites.dead.el.style.top = this.allSprites.player.el.style.top;
            this.allSprites.dead.el.style.left = this.allSprites.player.el.style.left;
            this.allSprites.dead.moving = true;
            removeEventListener('keypress', this.handleBinds);
            clearInterval(this.baloonMover);
            clearInterval(this.moveInterval);
        };
        this.killBaloon = (e) => __awaiter(this, void 0, void 0, function* () {
            e.currDir = 'dead';
            e.actFrame = 0;
            e.repeat = false;
        });
        document.querySelector('#app').innerHTML = `<div id="test"></div>`;
        this.body = document.querySelector('#test');
        this.data = frameData;
        let img = new Image();
        img.src = '../img/sheet.png';
        let imgs = [];
        img.onload = () => {
            for (let i = 0; i < height; i++) {
                const container = document.createElement('div');
                const tileTypes = [elements.grassUrl, elements.stoneUrl];
                container.className = 'container';
                this.gameBoard.push([]);
                for (let j = 0; j < width; j++) {
                    const el = i === 0 ||
                        i === height - 1 ||
                        j === 0 ||
                        j === width - 1 ||
                        (i % 2 === 0 && j % 2 === 0)
                        ? 3
                        : 2;
                    const field = helper.newTile(`${i},${j}`, 'field', tileTypes[el % 2], j, i, dsplySize);
                    el === 3 ? field.classList.add('stone') : null;
                    container.appendChild(field);
                    this.gameBoard[i].push(el);
                }
                this.body.appendChild(container);
            }
            const baloonPoses = helper.getNRandomFreePositions(this.baloonCount, width, height, this.gameBoard);
            this.placeBricks(width);
            for (let i = 0; i < this.baloonCount; i++) {
                imgs.push(new Anim(img, this.data.baloon, `baloon${i}`, baloonPoses[i], 'right', true));
            }
            const player = new Anim(img, this.data.player, 'player', [1, 1], 'right', true);
            player.renderFrame(0, 'down');
            player.moving = false;
            this.allSprites = {
                player: player,
                baloons: imgs,
                bomb: new Anim(img, this.data.bomb, 'bomb', [0, 0], 'right', false),
                flames: [
                    new Anim(img, this.data.explosion, `explosion1`, [0, 0], 'left', false),
                    new Anim(img, this.data.explosion, `explosion2`, [0, 0], 'top', false),
                    new Anim(img, this.data.explosion, `explosion3`, [0, 0], 'right', false),
                    new Anim(img, this.data.explosion, `explosion4`, [0, 0], 'down', false),
                    new Anim(img, this.data.explosion, `explosion5`, [0, 0], 'middle', false),
                    new Anim(img, this.data.explosion, `explosion6`, [0, 0], 'midleft', false),
                    new Anim(img, this.data.explosion, `explosion7`, [0, 0], 'midtop', false),
                    new Anim(img, this.data.explosion, `explosion8`, [0, 0], 'midright', false),
                    new Anim(img, this.data.explosion, `explosion9`, [0, 0], 'middown', false),
                ],
                dead: new Anim(img, this.data.dead_player, 'dead_guy', [0, 0], 'right', false),
                desBrick: [
                    new Anim(img, this.data.brick_des, `desbrick1`, [0, 0], 'right', false),
                    new Anim(img, this.data.brick_des, `desbrick2`, [0, 0], 'right', false),
                    new Anim(img, this.data.brick_des, `desbrick3`, [0, 0], 'right', false),
                    new Anim(img, this.data.brick_des, `desbrick4`, [0, 0], 'right', false),
                ],
            };
            this.anim();
            this.activateControls();
            this.baloonMover = setInterval(() => {
                this.allSprites.baloons.forEach((e) => {
                    this.ActivateBaloon(e, e.pos);
                });
            }, 1000);
            this.moveInterval = setInterval(this.allatPlayerMoveShi, 50);
        };
    }
}
