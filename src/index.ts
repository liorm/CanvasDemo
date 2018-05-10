import {Node, Vector} from "./node";
import {fps, ICanvasElement, isAnimationPaused, mouse, updaters} from "./canvas";
import {Connection} from "./connection";

const INITIAL_NODES = 150;
const MIN_FPS = 35;
const NODE_SPEED = 10;

function randomIntFromRange(min: number, max: number) {
    return Math.floor(Math.random() * (max - min + 1) + min)
}
function randomFromRange(min: number, max: number, fraction: number = 2) {
    const div = Math.pow(1, fraction);

    let number = 0;
    while (number === 0)
        number = Math.random() * div * (max - min + 1) + min * div;

    number = number / div;

    return number;
}

class Controller implements ICanvasElement {
    constructor() {
        for (let i = 0; i < INITIAL_NODES; ++i) {
            this.createNode(false);
        }

        this._mouseNode = this.createNode(true,true);

        // Periodically try to create nodes.
        setInterval(() => this.tryCreateNewNode(), 100);
    }

    private createNode(fromEdge: boolean, still?: boolean): Node {
        let x: number;
        let y: number;

        let node: Node;
        do {
            if (fromEdge) {
                const edge = randomIntFromRange(0, 3);
                if (edge === 0 || edge === 1) {
                    x = edge === 0 ? 1 : innerWidth - 1;
                    y = randomFromRange(1, innerHeight - 1);
                } else {
                    x = randomFromRange(1, innerWidth - 1);
                    y = edge === 2 ? 1 : innerHeight - 1;
                }
            } else {
                x = randomFromRange(1, innerWidth - 1);
                y = randomFromRange(1, innerHeight - 1);
            }
            node = new Node(
                x,
                y,
                2,
                'white',
                still ?
                    new Vector() :
                    new Vector(
                        randomFromRange(-NODE_SPEED, NODE_SPEED),
                        randomFromRange(-NODE_SPEED, NODE_SPEED)
                    )
            );
        } while (node.isOffscreen);

        // Add connections for the new node.
        this._nodes.forEach(n2 => {
            this._connections.push(new Connection(node, n2, 2, 'white'));
        });

        this._nodes.push(node);

        return node;
    }

    private _mouseNode: Node;

    draw(ctx: CanvasRenderingContext2D): void {
        this._nodes.forEach(item => item.draw(ctx));
        this._connections.forEach(item => item.draw(ctx));
    }

    update(ms: number): boolean {
        // Move the mouse node
        this._mouseNode.x = mouse.x;
        this._mouseNode.y = mouse.y;

        for (let i = 0; i < this._nodes.length; ++i) {
            const node = this._nodes[i];
            node.update(ms);

            if (node.isOffscreen) {
                node.startDecay();
            }
            if (!node.isVisible) {
                this._nodes.splice(i, 1);
                --i;
            }
        }

        for (let i = 0; i < this._connections.length; ++i) {
            const conn = this._connections[i];
            conn.update(ms);

            let remove = conn.isPeerDead;
            if (remove) {
                this._connections.splice(i, 1);
                --i;
            }
        }
        return true;
    }

    private _nodes: Node[] = [];
    private _connections: Connection[] = [];

    private tryCreateNewNode() {
        if (fps >= MIN_FPS && !isAnimationPaused) {
            this.createNode(false);
            this.createNode(false);
        }
    }
}

updaters.add(new Controller());
