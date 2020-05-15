import {Node, StillNode} from "./node";
import {fps, ICanvasElement, isAnimationPaused, mouse, mouseDown} from "./canvas";
import {Connection} from "./connection";
import {NodeGenerators} from "./nodeGenerators";
import {getRandomColor, randomFromRange} from "./utils";

const INITIAL_NODES = 300;
const MIN_FPS = 15;
const MAX_NODES = 600;

export class Controller implements ICanvasElement {
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
        const connectionsList = new Array<Connection>(this._nodesCount);
        for (let i = 0; i < this._nodesCount; ++i)
            connectionsList[i] = new Connection(node, this._nodes[i], 2);
        node.setOwnConnections(connectionsList);

        // Add to the list.
        this._nodes[this._nodesCount] = node;
        ++this._nodesCount;

        return node;
    }

    private _mouseNode: StillNode;

    draw(ctx: CanvasRenderingContext2D): void {
        for (let i = 0; i < this._nodesCount; ++i)
            this._nodes[i].draw(ctx);

        ctx.globalAlpha = 1;
        ctx.strokeStyle = 'white';
        ctx.fillStyle = 'white';
        ctx.fillText('Nodes: ' + this._nodesCount,0,15);
        ctx.fillText('FPS: ' + fps.toFixed(2),0,45);
    }

    update(secs: number): boolean {
        // Move the mouse node
        this._mouseNode.move(mouse.x, mouse.y);

        for (let i = 0; i < this._nodesCount; ++i) {
            const node = this._nodes[i];
            node.update(secs);

            // Remove invisible nodes.
            if (!node.isVisible && this._mouseNode != node) {
                node.setOwnConnections([]);

                if (this._nodesCount > 1) {
                    this._nodes[i] = this._nodes[this._nodesCount - 1];
                }
                --this._nodesCount;
                --i;
            }
        }

        return true;
    }

    private _nodesCount = 0;
    private _nodes: Node[] = new Array<Node>(MAX_NODES);

    private tryCreateNewNode() {
        if (mouseDown) {
            const node = this.createNode(NodeGenerators.FountainNode);
            node.color = getRandomColor();
            node.setDecaying(randomFromRange(2, 5));
        } else {
            // Create "background noise"
            if (
                fps >= MIN_FPS &&
                !isAnimationPaused &&
                this._nodesCount < MAX_NODES
            ) {
                this.createNode(NodeGenerators.RandomNode);
            }
        }
    }
}
