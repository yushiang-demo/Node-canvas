const { program } = require("commander");
const { createCanvas, loadImage } = require("canvas");
const fs = require("fs");

const main = async (inputs, output, width, height, paddingX, paddingY) => {
  const canvas = createCanvas(width, height);
  const ctx = canvas.getContext("2d");

  ctx.fillStyle = "white";
  ctx.fillRect(0, 0, width,height);

  const images = await Promise.all(
    inputs.map((filename) => loadImage(filename))
  );

  const row = Math.ceil(Math.sqrt(inputs.length));
  const col = Math.ceil(inputs.length / row);

  const xBlockOffset = width / row;
  const yBlockOffset = height / col;

  ctx.setLineDash([1, 20]);

  Array.from({ length: col }, (_, index) => index).forEach(index=>{
    ctx.beginPath();
    ctx.moveTo(0,index*yBlockOffset);
    ctx.lineTo(width,index*yBlockOffset);
    ctx.stroke();
  });

  Array.from({ length: row }, (_, index) => index).forEach(index=>{
    ctx.beginPath();
    ctx.moveTo(index*xBlockOffset,0);
    ctx.lineTo(index*xBlockOffset, height);
    ctx.stroke();
  });



  const blockWidth = xBlockOffset - paddingX;
  const blockHeight = yBlockOffset - paddingY;

  images.forEach((image, index) => {
    const imageRow = Math.trunc(index / col);
    const imageCol = index % col;

    const { width, height } = image;
    const applySale = Math.min(blockWidth / width, blockHeight / height);

    const renderWidth = width * applySale;
    const renderHeight = height * applySale;

    const renderOriginX =
      xBlockOffset * imageRow + xBlockOffset / 2 - renderWidth / 2;
    const renderOriginY =
      yBlockOffset * imageCol + yBlockOffset / 2 - renderHeight / 2;

    ctx.drawImage(
      image,
      renderOriginX,
      renderOriginY,
      renderWidth,
      renderHeight
    );
  });

  fs.writeFileSync(output, canvas.toBuffer());
};

program
  .option("-i, --inputs [strings...]", "input filenames")
  .option("-o, --output <string>", "output filename")
  .option("-r, --resolution [number...]", "output resolution [width,height]")
  .option("-p, --padding [number...]", "padding [x,y]");

program.parse(process.argv);

const options = program.opts();

if (options.inputs && options.output && options.resolution) {
  const [width, height] = options.resolution.map((value) => parseInt(value));
  const [paddingX, paddingY] = options.padding.map((value) => parseInt(value));
  main(options.inputs, options.output, width, height, paddingX, paddingY);
} else {
  console.log(`arguments not found, current args: ${JSON.stringify(options)}`);
}
