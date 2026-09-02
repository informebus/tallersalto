import fs from 'fs';
import zlib from 'zlib';

// Creates a valid 256x256 PNG representation of the Salto blue emblem
function createPNG() {
  const width = 256;
  const height = 256;

  // Uncompressed raw scanlines: each line begins with 0 (Filter type None) followed by width * 4 RGBA bytes
  const rawBytes = Buffer.alloc(height * (1 + width * 4));
  let offset = 0;

  // Colors
  // Navy Blue #0d4e83 => [13, 78, 131, 255]
  // White #ffffff => [255, 255, 255, 255]
  const bgR = 13, bgG = 78, bgB = 131;

  for (let y = 0; y < height; y++) {
    rawBytes[offset++] = 0; // Filter byte: None

    for (let x = 0; x < width; x++) {
      const cx = x - 128;
      const cy = y - 128;
      const distFromCenter = Math.sqrt(cx * cx + cy * cy);

      // Rounded rect / square with smooth corners
      const rx = Math.abs(cx) - 100;
      const ry = Math.abs(cy) - 100;
      const cornerDist = Math.hypot(Math.max(0, rx), Math.max(0, ry));
      
      let isInsideFrame = cornerDist < 20;

      // Oval crest
      const oval = (cx * cx) / (65 * 65) + (cy * cy) / (88 * 88);
      const isOvalRing = oval >= 0.90 && oval <= 1.05;
      const isInnerRing = oval >= 0.78 && oval <= 0.84;

      // Horizontal bar
      const isHBar = Math.abs(cy - 5) < 3 && oval < 0.95;
      // Vertical top bar
      const isVBar = Math.abs(cx) < 2.5 && cy < 5 && cy > -75 && oval < 0.95;

      // Banner SALTO on top
      const isBanner = cy > -105 && cy < -80 && Math.abs(cx) < 60;

      // Laurel / Oak wreath side accents
      const isWreath = (distFromCenter > 75 && distFromCenter < 112 && Math.abs(cy) < 95 && Math.sin((x + y) / 4) > 0.4);

      // Waterfall lines in bottom half
      const isWaterfall = cy > 15 && cy < 65 && oval < 0.8 && (Math.abs(cx % 12) < 2 || Math.abs(cy % 14) < 2);

      // Sun rays in top-left
      const isSun = cx < -8 && cy < 0 && cy > -70 && oval < 0.8 && (Math.hypot(cx + 35, cy + 35) < 12 || Math.abs((cx + 35) + (cy + 35)) < 3);

      // Minerva in top-right
      const isMinerva = cx > 10 && cx < 50 && cy > -70 && cy < -5 && (Math.abs(cx - 30) < 6 || Math.hypot(cx - 30, cy + 55) < 7);

      let r = bgR, g = bgG, b = bgB, a = 255;

      if (!isInsideFrame) {
        a = 0; // Transparent outside rounded corner
      } else if (isBanner || isOvalRing || isInnerRing || isHBar || isVBar || isWreath || isWaterfall || isSun || isMinerva) {
        r = 255; g = 255; b = 255; a = 255; // Crisp white emblem elements
      }

      rawBytes[offset++] = r;
      rawBytes[offset++] = g;
      rawBytes[offset++] = b;
      rawBytes[offset++] = a;
    }
  }

  // Compress with deflate
  const compressed = zlib.deflateSync(rawBytes);

  // Build PNG chunks
  const signature = Buffer.from([0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A]);

  // IHDR chunk
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8; // 8 bit depth
  ihdr[9] = 6; // RGBA color type
  ihdr[10] = 0; // compression
  ihdr[11] = 0; // filter
  ihdr[12] = 0; // interlace
  const ihdrChunk = createChunk('IHDR', ihdr);

  // IDAT chunk
  const idatChunk = createChunk('IDAT', compressed);

  // IEND chunk
  const iendChunk = createChunk('IEND', Buffer.alloc(0));

  return Buffer.concat([signature, ihdrChunk, idatChunk, iendChunk]);
}

function createChunk(type, data) {
  const len = data.length;
  const buf = Buffer.alloc(4 + 4 + len + 4);
  buf.writeUInt32BE(len, 0);
  buf.write(type, 4);
  data.copy(buf, 8);

  const crc = crc32(buf.subarray(4, 8 + len));
  buf.writeUInt32BE(crc, 8 + len);
  return buf;
}

function crc32(buf) {
  let crc = 0xFFFFFFFF;
  for (let i = 0; i < buf.length; i++) {
    crc ^= buf[i];
    for (let j = 0; j < 8; j++) {
      crc = (crc >>> 1) ^ (crc & 1 ? 0xEDB88320 : 0);
    }
  }
  return (crc ^ 0xFFFFFFFF) >>> 0;
}

const png = createPNG();
fs.writeFileSync('./public/logo.png', png);
console.log('Successfully written /public/logo.png (' + png.length + ' bytes)');
