export class Elements {
    constructor() {
        let img = new Image();
        img.src = '../img/sheet.png';
        let canvas = document.createElement('canvas');
        canvas.width = 16;
        canvas.height = 16;
        let ctx = canvas.getContext('2d');
        img.onload = () => {
            ctx.drawImage(img, 48, 48, 16, 16, 0, 0, 16, 16);
            this.stoneUrl = canvas.toDataURL();
            ctx.reset();
            ctx.drawImage(img, 0, 65, 16, 16, 0, 0, 16, 16);
            this.grassUrl = canvas.toDataURL();
            ctx.reset();
            ctx.drawImage(img, 64, 48, 16, 16, 0, 0, 16, 16);
            this.brickUrl = canvas.toDataURL();
            ctx.reset();
            ctx.drawImage(img, 16, 224, 16, 16, 0, 0, 16, 16);
            this.powerUrl = canvas.toDataURL();
        };
    }
}
