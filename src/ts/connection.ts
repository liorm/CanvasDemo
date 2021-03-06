import {ICanvasElement} from "./canvas";
import {Node} from "./node";

const MAX_DISTANCE = 150;

export class Connection implements ICanvasElement {
    constructor(
        ownerNode: Node,
        peerNode: Node,
        width: number
    ) {
        this.reinitialize(ownerNode, peerNode, width);
    }

    reinitialize(
        owner: Node,
        peerNode: Node,
        width: number
    ) {
        this._ownerNode = owner;
        this._peerNode = peerNode;
        this.width = width;
        this._opacity = 0;
    }

    private _ownerNode: Node;
    private _peerNode: Node;
    public width: number;
    private _opacity: number;

    public get peer() { return this._peerNode; }

    draw(ctx: CanvasRenderingContext2D): void {
        if (!this.isVisible)
            return;

        let stroke;
        if (this._ownerNode.color === this._peerNode.color) {
            stroke = this._ownerNode.color;
        } else {
            const gradient = ctx.createLinearGradient(
                this._ownerNode.x, this._ownerNode.y,
                this._peerNode.x, this._peerNode.y
            );
            gradient.addColorStop(0, this._ownerNode.color);
            gradient.addColorStop(1, this._peerNode.color);
            stroke = gradient;
        }

        ctx.beginPath();
        ctx.globalAlpha = this._opacity;
        ctx.strokeStyle = stroke;
        ctx.lineWidth = this.width;
        ctx.moveTo(this._ownerNode.x, this._ownerNode.y);
        ctx.lineTo(this._peerNode.x, this._peerNode.y);
        ctx.stroke();
        ctx.closePath();
    }

    update(secs: number): boolean {
        if (this.isPeerDead)
            return false;

        const wasVisible = this.isVisible;

        const xDist = Math.abs(this._peerNode.x - this._ownerNode.x);
        const yDist = Math.abs(this._peerNode.y - this._ownerNode.y);
        if (yDist >= MAX_DISTANCE || xDist >= MAX_DISTANCE) {
            this._opacity = 0;
        } else {
            const distance = Math.sqrt(Math.pow(xDist, 2) + Math.pow(yDist, 2));
            if (distance >= MAX_DISTANCE) {
                this._opacity = 0;
            } else {
                this._opacity = 1 - distance / MAX_DISTANCE;
                if (this._opacity > 1) {
                    this._opacity = 1;
                }

                // Make sure opacity correlates the nodes opacity - used for smoothing the connection in when node is added.
                if (this._opacity > this._ownerNode.opacity) {
                    this._opacity = this._ownerNode.opacity;
                }
                if (this._opacity > this._peerNode.opacity) {
                    this._opacity = this._peerNode.opacity;
                }
            }
        }

        return this.isVisible || wasVisible != this.isVisible;
    }

    public get isVisible(): boolean {
        return !this.isPeerDead && this._opacity > 0;
    }

    public get isPeerDead(): boolean {
        return !this._peerNode.isVisible;
    }
}
