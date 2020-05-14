import {ICanvasElement} from "./canvas";
import {Connection} from "./connection";
import Point = paper.Point;

const NODE_DECAY_DURATION_SECONDS = 1;
const NODE_OPACITY_STEP = 0.5;


export abstract class Node implements ICanvasElement {
    protected constructor(
        protected _x: number,
        protected _y: number,
        protected radius: number,
        public color: string
    ) {
        this.invalidateOffScreen();
    }

    public get x() { return this._x; }
    public get y() { return this._y; }

    private _explicitDecay = false;
    private _decayDuration = NODE_DECAY_DURATION_SECONDS;
    private _ownConnections: Connection[] = [];

    public setOwnConnections(list: Connection[]) {
        this._ownConnections = list;
    }

    public setDecaying(duration?: number) {
        this._explicitDecay = true;
        this._opacity = 1;
        if (duration !== undefined) {
            this._decayDuration = duration;
        }
    }

    public reinitialize(
        x: number,
        y: number
    ) {
        this._x = x;
        this._y = y;
        this.invalidateOffScreen();
    }

    public update(secs: number): boolean {
        // Update opacity gradually.
        if (this._isDecaying) {
            this._opacity -= secs / this._decayDuration;
            if (this._opacity < 0) this._opacity = 0;
        } else {
            this._opacity += NODE_OPACITY_STEP * secs;
            if (this._opacity >= 1) this._opacity = 1;
        }

        if ( !this.updatePosition(secs) )
            return false;

        this.invalidateOffScreen();

        // Decay when going off-screen.
        this._isDecaying = this._explicitDecay || this.isOffscreen;

        // Update own connections.
        let needsUpdate = false;
        this._ownConnections.forEach(conn => {
            needsUpdate = conn.update(secs) || needsUpdate;
        });

        return needsUpdate;
    }

    private invalidateOffScreen() {
        if (this._x > innerWidth || this._x < 0) {
            this._isOffscreen = true;
        } else if (this._y > innerHeight || this._y < 0) {
            this._isOffscreen = true;
        } else
            this._isOffscreen = false;
    }

    public draw(ctx: CanvasRenderingContext2D) {
        ctx.beginPath();
        ctx.arc(this._x, this._y, this.radius, 0, Math.PI * 2, false);
        ctx.globalAlpha = this._opacity;
        ctx.fillStyle = this.color;
        ctx.fill();
        ctx.closePath();

        // Draw own connections.
        this._ownConnections.forEach(conn => conn.draw(ctx));
    }

    private _isDecaying: boolean = false;

    public get isOffscreen() {
        return this._isOffscreen;
    }
    private _isOffscreen: boolean = false;

    public get isVisible() {
        return this._opacity > 0;
    }

    public get opacity() {
        return this._opacity;
    }
    private _opacity: number = 0;

    protected abstract updatePosition(secs: number): boolean;
}

export class StillNode extends Node {
    constructor(x: number, y: number, radius: number, color: string) {
        super(x, y, radius, color);
    }

    protected updatePosition(secs: number): boolean {
        if (this._moved) {
            this._moved = false;
            return true;
        }

        // Do nothing - it's a still node.
        return false;
    }

    private _moved: boolean = false;

    public move(x: number, y: number) {
        this._x = x;
        this._y = y;
        this._moved = true;
    }
}

export class VectorNode extends Node {
    constructor(
        x: number, y: number,
        radius: number,
        color: string,
        public velocity: Point,
        public acceleration?: Point
    ) {
        super(x, y, radius, color);
    }

    reinitialize(x: number, y: number): void {
        super.reinitialize(x, y);
        this.velocity.x = 0;
        this.velocity.y = 0;
    }

    protected updatePosition(secs: number) {
        if (this.velocity.x === 0 && this.velocity.y === 0 && !this.acceleration)
            return false;

        if (this.acceleration) {
            this.velocity.x += this.acceleration.x * secs;
            this.velocity.y += this.acceleration.y * secs;
        }

        this._x += this.velocity.x * secs;
        this._y += this.velocity.y * secs;
        return true;
    }
}
