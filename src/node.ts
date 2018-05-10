import {ICanvasElement} from "./canvas";

const NODE_OPACITY_STEP = 0.05;

export class Vector {

    constructor(x?: number, y?: number) {
        this.x = x || 0;
        this.y = y || 0;
    }

    public x: number;
    public y: number;
}

export class Node implements ICanvasElement {
    constructor(
        public x: number,
        public y: number,
        public radius: number,
        public color: string,
        public velocity: Vector,
    ) {
        this.invalidateOffScreen();
    }

    public update(): boolean {
        // Update opacity gradually.
        this._opacity += NODE_OPACITY_STEP;
        if (this._opacity >= 1) this._opacity = 1;

        // Check if this node is updatable.
        if (this.velocity.x === 0 && this.velocity.y === 0)
            return false;

        this.x += this.velocity.x;
        this.y += this.velocity.y;
        this.invalidateOffScreen();
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

    public get isOffscreen() {
        return this._isOffscreen;
    }
    private _isOffscreen: boolean = false;

    public get opacity() {
        return this._opacity;
    }
    private _opacity: number = 0;
}
