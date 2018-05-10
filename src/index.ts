import {Node, Vector} from "./node";
import {ICanvasElement, updaters} from "./canvas";

const MAX_NODES = 50;

// Utility Functions
function randomIntFromRange(min: number, max: number) {
    return Math.floor(Math.random() * (max - min + 1) + min)
}

function distance(x1: number, y1: number, x2: number, y2: number) {
    const xDist = x2 - x1;
    const yDist = y2 - y1;

    // noinspection JSSuspiciousNameCombination
    return Math.sqrt(Math.pow(xDist, 2) + Math.pow(yDist, 2))
}


class Controller implements ICanvasElement {

    constructor() {
        for (let i = 0; i < MAX_NODES; ++i) {
            this.createNode();
        }
    }

    private createNode() {
        const node = new Node(
            randomIntFromRange(0, innerWidth),
            randomIntFromRange(0, innerHeight),
            2,
            'white',
            new Vector(
                randomIntFromRange(-3, 3),
                randomIntFromRange(-3, 3)
            ));
        this._nodes.push(node);
    }

    draw(ctx: CanvasRenderingContext2D): void {
        this._nodes.forEach(node => node.draw(ctx));
    }

    update(): boolean {
        for (let i = 0; i < this._nodes.length; ++i) {
            const node = this._nodes[i];
            node.update();

            let remove = false;
            if (node.x > innerWidth || node.x < 0) {
                remove = true;
            }
            if (node.y > innerHeight || node.y < 0) {
                remove = true;
            }

            if (remove) {
                this._nodes.splice(i, 1);
                --i;
                this.createNode();
            }
        }
        return true;
    }

    private _nodes: Node[] = [];
}

updaters.add(new Controller());
