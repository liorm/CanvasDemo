import {ICanvasElement} from "./canvas";
import {Node} from "./node";

const MAX_DISTANCE = 150;

export class Connection implements ICanvasElement {
    constructor(
        private _n1: Node,
        private _n2: Node,
        public width: number,
        public color: string
    ) {
    }

    draw(ctx: CanvasRenderingContext2D): void {
        if (!this.isVisible)
            return;

        ctx.beginPath();
        ctx.globalAlpha = this._opacity;
        ctx.strokeStyle = this.color;
        ctx.lineWidth = this.width;
        ctx.moveTo(this._n1.x, this._n1.y);
        ctx.lineTo(this._n2.x, this._n2.y);
        ctx.stroke();
        ctx.closePath();
    }

    update(ms: number): boolean {
        const wasVisible = this.isVisible;

        const xDist = Math.abs(this._n2.x - this._n1.x);
        const yDist = Math.abs(this._n2.y - this._n1.y);
        if (yDist >= MAX_DISTANCE || xDist >= MAX_DISTANCE) {
            this._opacity = 0;
        } else {
            const distance = Math.sqrt(Math.pow(xDist, 2) + Math.pow(yDist, 2));
            this._opacity = 1 - distance / MAX_DISTANCE;
            if (this._opacity > 1) this._opacity = 1;
            if (this._opacity <= 0.1) this._opacity = 0;

            // Make sure opacity corrolates the nodes opacity - used for smoothing the connection in when node is added.
            if (this._opacity > this._n1.opacity) this._opacity = this._n1.opacity;
            if (this._opacity > this._n2.opacity) this._opacity = this._n2.opacity;
        }

        return this.isVisible || wasVisible != this.isVisible;
    }

    private _opacity = 0;

    public get isVisible(): boolean {
        return this._opacity > 0;
    }

    public get isOffscreen(): boolean {
        return this._n1.isOffscreen || this._n2.isOffscreen;
    }
}