import {ICanvasElement} from "./canvas";

const NODE_DECAY_STEP = 1;
const NODE_OPACITY_STEP = 0.5;

export class Vector {

    constructor(x?: number, y?: number) {
        this.x = x || 0;
        this.y = y || 0;
    }

    public x: number;
    public y: number;
}

export abstract class Node implements ICanvasElement {
    protected constructor(
        public x: number,
        public y: number,
        public radius: number,
        public color: string
    ) {
        this.invalidateOffScreen();
    }

    public update(secs: number): boolean {
        // Update opacity gradually.
        this._opacity += NODE_OPACITY_STEP * secs;
        if (this._opacity >= 1) this._opacity = 1;

        if (this._isDecaying) {
            this._opacity -= NODE_DECAY_STEP * secs;
            if (this._opacity < 0) this._opacity = 0;
        }

        if ( !this.updatePosition(secs) )
            return false;

        this.invalidateOffScreen();

        // Decay when going offscreen.
        if (this.isOffscreen) {
            this.startDecay();
        }
    }

    private invalidateOffScreen() {
        if (this.x > innerWidth || this.x < 0) {
            this._isOffscreen = true;
        } else if (this.y > innerHeight || this.y < 0) {
            this._isOffscreen = true;
        } else
            this._isOffscreen = false;
    }

    public draw(ctx: CanvasRenderingContext2D) {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
        ctx.globalAlpha = this._opacity;
        ctx.fillStyle = this.color;
        ctx.fill();
        ctx.closePath()
    }

    public startDecay() {
        this._isDecaying = true;
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

export class VectorNode extends Node {
    constructor(
        x: number, y: number,
        radius: number,
        color: string,
        public velocity: Vector
    ) {
        super(x, y, radius, color);
    }

    protected updatePosition(secs: number) {
        if (this.velocity.x === 0 && this.velocity.y === 0)
            return false;

        this.x += this.velocity.x * secs;
        this.y += this.velocity.y * secs;
        return true;
    }
}
