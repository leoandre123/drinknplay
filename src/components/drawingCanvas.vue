<template>
    <div class="drawing-canvas">
        <canvas ref="myCanvas" width="600px" height="300" @mousedown="startPosition" @mousemove="moving"
            @mouseup="finishedPosition">
        </canvas>
    </div>
</template>

<script>

export default {

    props: {
        options: Object
    },

    data() {
        return {
            pos: {},
            ctx: null,
            painting: false,
            savedCanvasPNG: null,
        };
    },
    mounted() {
        this.ctx = this.$refs.myCanvas.getContext("2d");
        this.ctx.fillStyle = "white";
        this.ctx.fillRect(0, 0, this.$refs.myCanvas.width, this.$refs.myCanvas.height);
        console.log("background white")

    },
    methods: {
        startPosition(evt) {
            this.pos = getPos(evt);
            if (this.isBucket) {
                this.floodFill(this.pos, this.getPixel(this.pos));
            } else {
                this.painting = true;
            }
        },

        moving(evt) {
            if (this.painting) {
                this.draw(evt);
            }

        },
        finishedPosition() {
            this.painting = false;
        },

        draw(evt) {
            this.ctx.strokeStyle = this.options.brushColor;
            this.ctx.lineWidth = this.options.brushSize;
            this.ctx.lineCap = "round";
            this.ctx.beginPath();
            this.ctx.moveTo(this.pos.x, this.pos.y);
            this.pos = getPos(evt);
            this.ctx.lineTo(this.pos.x, this.pos.y);
            this.ctx.stroke();
        },
        getPixel(pos) {
            const imgData = this.ctx.getImageData(pos.x, pos.y, 1, 1)
            return {
                r: imgData.data[0],
                g: imgData.data[1],
                b: imgData.data[2],
                a: imgData.data[3],
            }
        },
        compareColor(c0, c1) {
            return (c0.r == c1.r && c0.g == c1.g && c0.b == c1.b && c0.a == c1.a);
        },
        floodFill(pos, refColor) {
            const cl = this.getPixel(pos);
            this.counter++;
            if (this.compareColor(refColor, cl)) {

                console.log(this.counter);
                setTimeout(() => this.floodFill({ x: pos.x + 1, y: pos.y }, refColor), 0);
                setTimeout(() => this.floodFill({ x: pos.x - 1, y: pos.y }, refColor), 0);
                setTimeout(() => this.floodFill({ x: pos.x, y: pos.y + 1 }, refColor), 0);
                setTimeout(() => this.floodFill({ x: pos.x, y: pos.y - 1 }, refColor), 0);
                this.ctx.fillRect(pos.x, pos.y, 1, 1);
            }
        },

        getCanvas() {
            const canvasDataURL = this.$refs.myCanvas.toDataURL('image/png')
            this.savedCanvasPNG = canvasDataURL;
            console.log("saving canvas");
            return canvasDataURL;
        }
    }
};

function getPos(evt) {
    const rect = evt.currentTarget.getBoundingClientRect();

    if (evt.touches && evt.touches.length > 0) {
        // Touch event
        return {
            x: evt.touches[0].clientX - rect.left,
            y: evt.touches[0].clientY - rect.top
        };
    } else {
        // Mouse event
        return {
            x: evt.clientX - rect.left,
            y: evt.clientY - rect.top
        };
    }
}
</script>


<style scoped>
canvas {
     display: block;
}

.drawing-canvas {
    border: 5px inset black;

}
</style>