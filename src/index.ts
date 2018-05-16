import {Node, Vector} from "./node";
import {fps, ICanvasElement, isAnimationPaused, mouse, updaters} from "./canvas";
import {Connection} from "./connection";

const INITIAL_NODES = 300;
const MIN_FPS = 0;
const MAX_NODES = 400;
const NODE_SPEED = 30;

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
        return new Node(
            0,
            0,
            2,
            'white',
            new Vector()
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
            node = new Node(
                x,
                y,
                2,
                'white',
                new Vector(
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
            node = new Node(
                randomFromRange(1, innerWidth - 1),
                randomFromRange(1, innerHeight - 1),
                2,
                'white',
                new Vector(
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
            node = new Node(
                innerWidth / 2,
                innerHeight / 2,
                2,
                'white',
                new Vector(
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
            this.createNode(NodeGenerators.RandomNode);
        }

        this._mouseNode = this.createNode(NodeGenerators.StillNode);

        // Periodically try to create nodes.
        setInterval(() => {
            this.tryCreateNewNode();
            this.tryCreateNewNode();
        }, 100);
    }

    private createNode(generator: () => Node): Node {
        const node = generator();
        // Add connections for the new node.
        this._nodes.forEach(n2 => {
            let conn: Connection;
            if (this._deadConnectionsCount > 0) {
                this._deadConnectionsCount--;
                conn = this._deadConnections[this._deadConnectionsCount];
                this._deadConnections[this._deadConnectionsCount] = null;
                conn.reinitialize(node, n2, 2, 'white');
            } else {
                conn = new Connection(node, n2, 2, 'white');
            }
            this._connections.push(conn);
        });

        this._nodes.push(node);

        return node;
    }

    private _mouseNode: Node;

    draw(ctx: CanvasRenderingContext2D): void {
        this._nodes.forEach(item => item.draw(ctx));
        this._connections.forEach(item => item.draw(ctx));

        ctx.globalAlpha = 1;
        ctx.fillText('Nodes: ' + this._nodes.length,0,15);
        ctx.fillText('Connections: ' + this._connections.length,0,30);
        ctx.fillText('FPS: ' + fps.toFixed(2),0,45);
    }

    update(secs: number): boolean {
        // Move the mouse node
        this._mouseNode.x = mouse.x;
        this._mouseNode.y = mouse.y;

        for (let i = 0; i < this._nodes.length; ++i) {
            const node = this._nodes[i];
            node.update(secs);

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
            conn.update(secs);

            let remove = conn.isPeerDead;
            if (remove) {
                const deadConn = this._connections.splice(i, 1);
                --i;
                if (this._deadConnectionsCount < this._deadConnections.length) {
                    this._deadConnections[this._deadConnectionsCount] = deadConn[0];
                    this._deadConnectionsCount++;
                }
            }
        }
        return true;
    }

    private _nodes: Node[] = [];
    private _connections: Connection[] = [];

    private _deadConnections: Connection[] = new Array(50000);
    private _deadConnectionsCount = 0;

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
