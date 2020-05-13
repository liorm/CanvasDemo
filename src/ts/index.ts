import {Node, StillNode, VectorNode} from "./node";
import {fps, ICanvasElement, isAnimationPaused, mouse, updaters} from "./canvas";
import {Connection} from "./connection";
import { Point } from "paper";

const INITIAL_NODES = 300;
const MIN_FPS = 15;
const MAX_NODES = 600;
const NODE_SPEED = 60;

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

class NodeGenerators {
    static StillNode(): Node {
        return new StillNode(
            0,
            0,
            2,
            'white'
        );
    }
    static EdgeNode(): Node {
        let node: Node;
        let x: number;
        let y: number;

        do {
            const edge = randomIntFromRange(0, 3);
            if (edge === 0 || edge === 1) {
                x = edge === 0 ? 1 : innerWidth - 1;
                y = randomFromRange(1, innerHeight - 1);
            } else {
                x = randomFromRange(1, innerWidth - 1);
                y = edge === 2 ? 1 : innerHeight - 1;
            }
            node = new VectorNode(
                x,
                y,
                2,
                'white',
                new Point(
                    randomFromRange(-NODE_SPEED, NODE_SPEED),
                    randomFromRange(-NODE_SPEED, NODE_SPEED)
                )
            );
        } while (node.isOffscreen);

        return node;
    }
    static RandomNode(): Node {
        let node: Node;
        let x: number;
        let y: number;

        do {
            node = new VectorNode(
                randomFromRange(1, innerWidth - 1),
                randomFromRange(1, innerHeight - 1),
                2,
                'white',
                new Point(
                    randomFromRange(-NODE_SPEED, NODE_SPEED),
                    randomFromRange(-NODE_SPEED, NODE_SPEED)
                )
            );
        } while (node.isOffscreen);

        return node;
    }
    static FountainNode(): Node {
        let node: Node;
        let x: number;
        let y: number;

        do {
            node = new VectorNode(
                innerWidth / 2,
                innerHeight / 2,
                2,
                'white',
                new Point(0, 0),
                new Point(
                    randomFromRange(-NODE_SPEED, NODE_SPEED),
                    randomFromRange(-NODE_SPEED, NODE_SPEED)
                )
            );
        } while (node.isOffscreen);

        return node;
    }
}

class Controller implements ICanvasElement {
    constructor() {
        for (let i = 0; i < INITIAL_NODES; ++i) {
            this.tryCreateNewNode();
        }

        this._mouseNode = <StillNode>this.createNode(NodeGenerators.StillNode);

        // Periodically try to create nodes.
        setInterval(() => {
            this.tryCreateNewNode();
        }, 50);
    }

    private createNode(generator: () => Node): Node {
        const node = generator();

        // Initialize the connections to the current existing nodes.
        node.setOwnConnections(this._nodes.map(peer => new Connection(node, peer, 2, 'white')));

        // Add to the list.
        this._nodes.push(node);

        return node;
    }

    private _mouseNode: StillNode;

    draw(ctx: CanvasRenderingContext2D): void {
        this._nodes.forEach(item => item.draw(ctx));

        ctx.globalAlpha = 1;
        ctx.fillText('Nodes: ' + this._nodes.length,0,15);
        ctx.fillText('FPS: ' + fps.toFixed(2),0,45);
    }

    update(secs: number): boolean {
        // Move the mouse node
        this._mouseNode.move(mouse.x, mouse.y);

        for (let i = 0; i < this._nodes.length; ++i) {
            const node = this._nodes[i];
            node.update(secs);

            // Remove invisible nodes.
            if (!node.isVisible && this._mouseNode != node) {
                node.setOwnConnections([]);
                this._nodes.splice(i, 1);
                --i;
            }
        }

        return true;
    }

    private _nodes: Node[] = [];

    private tryCreateNewNode() {
        if (
            fps >= MIN_FPS &&
            !isAnimationPaused &&
            this._nodes.length < MAX_NODES
        ) {
            this.createNode(NodeGenerators.RandomNode);
        }
    }
}

updaters.add(new Controller());
