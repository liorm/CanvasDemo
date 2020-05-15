
export function randomIntFromRange(min: number, max: number) {
    return Math.floor(Math.random() * (max - min + 1) + min)
}

export function randomFromRange(min: number, max: number, fraction: number = 2) {
    const div = Math.pow(1, fraction);

    let number = 0;
    while (number === 0)
        number = Math.random() * div * (max - min + 1) + min * div;

    number = number / div;

    return number;
}

export function getRandomColor() {
    const letters = '0123456789ABCDEF';
    let color = '#';
    for (let i = 0; i < 6; i++) {
        color += letters[randomIntFromRange(0, 15)];
    }
    return color;
}

