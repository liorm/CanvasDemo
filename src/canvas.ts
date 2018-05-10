
// Initial Setup
const canvas = document.querySelector('canvas');
const ctx = canvas.getContext('2d');

canvas.width = innerWidth;
canvas.height = innerHeight;

// Variables
export const mouse = {
    x: -1,
    y: -1
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

/// FPS avergae.
export let fps = 0;
const FPS_AVG_SAMPLES = 60;

// Animation Loop
function animate(forceRedraw?: boolean) {
    requestAnimationFrame(() => animate());

    const t0 = performance.now();

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

    const ellapsed = performance.now() - t0;
    const newFps = 100 / ellapsed;

    fps -= fps / FPS_AVG_SAMPLES;
    fps += newFps / FPS_AVG_SAMPLES;

    if (isNaN(fps))
        fps = 0;
    else if (fps > 60)
        fps = 60;
}

animate(true);
