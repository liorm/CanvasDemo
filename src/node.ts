import {ICanvasElement} from "./canvas";

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
    }

    public update(): boolean {
        if (this.velocity.x === 0 && this.velocity.y === 0)
            return false;

        this.x += this.velocity.x;
        this.y += this.velocity.y;
    }

    public draw(ctx: CanvasRenderingContext2D) {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
        ctx.fillStyle = this.color;
        ctx.fill();
        ctx.closePath()
    }
}
