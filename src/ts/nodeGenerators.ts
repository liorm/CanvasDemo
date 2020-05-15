import {Node, StillNode, VectorNode} from "./node";
import {Point} from "paper";
import {mouse} from "./canvas";
import {randomFromRange, randomIntFromRange} from "./utils";

const NODE_SPEED = 60;

export class NodeGenerators {
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
        let x = randomFromRange(1, innerWidth - 1);
        let y = randomFromRange(1, innerHeight - 1);

        do {
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

    static FountainNode(): Node {
        let node: Node;
        // let x: number = innerWidth / 2;
        // let y: number = innerHeight / 2;
        let x: number = mouse.x;
        let y: number = mouse.y;

        node = new VectorNode(
            x,
            y,
            2,
            'white',
            new Point(
                randomFromRange(-NODE_SPEED * 2, NODE_SPEED * 2),
                randomFromRange(-NODE_SPEED * 3, -NODE_SPEED * 2)
            ),
            new Point(
                0,
                randomFromRange(NODE_SPEED, NODE_SPEED * 2)
            )
        );

        return node;
    }

    static GravityNode(): Node {
        let node: Node;
        // let x: number = innerWidth / 2;
        // let y: number = innerHeight / 2;
        let x: number = mouse.x;
        let y: number = mouse.y;

        node = new VectorNode(
            x,
            y,
            2,
            'white',
            new Point(0, NODE_SPEED),
            new Point(
                randomFromRange(-10, 10),
                randomFromRange(NODE_SPEED / 2, NODE_SPEED)
            )
        );

        return node;
    }
}
