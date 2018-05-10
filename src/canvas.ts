
// Initial Setup
const canvas = document.querySelector('canvas');
const ctx = canvas.getContext('2d');

setTimeout(() => {
    canvas.width = innerWidth;
    canvas.height = innerHeight;
}, 100);

// Variables
export const mouse = {
    x: innerWidth / 2,
    y: innerHeight / 2
};

// Event Listeners
addEventListener('mousemove', event => {
    mouse.x = event.clientX;
    mouse.y = event.clientY;
});

addEventListener('resize', () => {
    canvas.width = innerWidth;
    canvas.height = innerHeight;
});

export interface ICanvasElement {
    update(): boolean;
    draw(ctx: CanvasRenderingContext2D): void;
}

export const updaters = new Set<ICanvasElement>();

// Animation Loop
function animate(forceRedraw?: boolean) {
    requestAnimationFrame(() => animate());

    let needsRedraw = forceRedraw;
    updaters.forEach((item: ICanvasElement) => {
        needsRedraw = item.update() || needsRedraw;
    });

    if (needsRedraw) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        updaters.forEach((item) => {
            item.draw(ctx);
        });
    }
}

animate(true);
