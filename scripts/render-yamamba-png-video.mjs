import fs from 'node:fs';
import path from 'node:path';
import {execFileSync} from 'node:child_process';
import {PNG} from 'pngjs';
import ffmpeg from '@ffmpeg-installer/ffmpeg';

const root = process.cwd();
const outDir = path.join(root, 'dist', 'yamamba-frames');
const renderDir = path.join(root, 'dist', 'renders');
const output = path.join(renderDir, 'yamamba-trail-rescue.mp4');
const W = 1280;
const H = 720;
const FPS = 24;
const DURATION = 18;
const TOTAL = FPS * DURATION;

fs.rmSync(outDir, {recursive: true, force: true});
fs.mkdirSync(outDir, {recursive: true});
fs.mkdirSync(renderDir, {recursive: true});

const clamp01 = (n) => Math.max(0, Math.min(1, n));
const lerp = (a, b, t) => a + (b - a) * clamp01(t);
const ease = (t) => {
  const x = clamp01(t);
  return x * x * (3 - 2 * x);
};

const color = (hex, a = 255) => {
  const v = hex.replace('#', '');
  return [
    Number.parseInt(v.slice(0, 2), 16),
    Number.parseInt(v.slice(2, 4), 16),
    Number.parseInt(v.slice(4, 6), 16),
    Math.round(a),
  ];
};

const mix = (a, b, t) => [
  Math.round(lerp(a[0], b[0], t)),
  Math.round(lerp(a[1], b[1], t)),
  Math.round(lerp(a[2], b[2], t)),
  255,
];

const put = (png, x, y, rgba) => {
  if (x < 0 || x >= W || y < 0 || y >= H) return;
  const idx = (Math.floor(y) * W + Math.floor(x)) * 4;
  const a = rgba[3] / 255;
  png.data[idx] = Math.round(rgba[0] * a + png.data[idx] * (1 - a));
  png.data[idx + 1] = Math.round(rgba[1] * a + png.data[idx + 1] * (1 - a));
  png.data[idx + 2] = Math.round(rgba[2] * a + png.data[idx + 2] * (1 - a));
  png.data[idx + 3] = 255;
};

const rect = (png, x, y, w, h, rgba) => {
  const x0 = Math.max(0, Math.floor(x));
  const y0 = Math.max(0, Math.floor(y));
  const x1 = Math.min(W, Math.ceil(x + w));
  const y1 = Math.min(H, Math.ceil(y + h));
  for (let yy = y0; yy < y1; yy++) {
    for (let xx = x0; xx < x1; xx++) put(png, xx, yy, rgba);
  }
};

const ellipse = (png, cx, cy, rx, ry, rgba) => {
  const x0 = Math.max(0, Math.floor(cx - rx));
  const y0 = Math.max(0, Math.floor(cy - ry));
  const x1 = Math.min(W, Math.ceil(cx + rx));
  const y1 = Math.min(H, Math.ceil(cy + ry));
  for (let y = y0; y < y1; y++) {
    for (let x = x0; x < x1; x++) {
      const dx = (x - cx) / rx;
      const dy = (y - cy) / ry;
      if (dx * dx + dy * dy <= 1) put(png, x, y, rgba);
    }
  }
};

const line = (png, x0, y0, x1, y1, width, rgba) => {
  const steps = Math.max(Math.abs(x1 - x0), Math.abs(y1 - y0));
  for (let i = 0; i <= steps; i++) {
    const t = i / Math.max(1, steps);
    ellipse(png, lerp(x0, x1, t), lerp(y0, y1, t), width / 2, width / 2, rgba);
  }
};

const poly = (png, pts, rgba) => {
  const minY = Math.max(0, Math.floor(Math.min(...pts.map((p) => p[1]))));
  const maxY = Math.min(H - 1, Math.ceil(Math.max(...pts.map((p) => p[1]))));
  for (let y = minY; y <= maxY; y++) {
    const xs = [];
    for (let i = 0; i < pts.length; i++) {
      const [x1, y1] = pts[i];
      const [x2, y2] = pts[(i + 1) % pts.length];
      if ((y1 <= y && y2 > y) || (y2 <= y && y1 > y)) {
        xs.push(x1 + ((y - y1) * (x2 - x1)) / (y2 - y1));
      }
    }
    xs.sort((a, b) => a - b);
    for (let i = 0; i < xs.length; i += 2) {
      rect(png, xs[i], y, xs[i + 1] - xs[i], 1, rgba);
    }
  }
};

const background = (png, t, panic) => {
  const dawn = ease((t - 0.78) / 0.22);
  const topA = color('#0d1727');
  const topB = color('#324f5b');
  const botA = color('#25170f');
  const botB = color('#5f4a27');
  for (let y = 0; y < H; y++) {
    const k = y / H;
    const sky = mix(mix(topA, botA, k), mix(topB, botB, k), dawn);
    rect(png, 0, y, W, 1, sky);
  }
  ellipse(png, 1050, 90, 78, 78, color('#f5d891', 70 + dawn * 105));
  for (let i = 0; i < 18; i++) {
    const x = i * 82 - 80 + Math.sin(t * 28 + i) * panic * 12;
    const base = 585;
    rect(png, x + 34, 270 + (i % 4) * 22, 16, base - 270, color('#22170f'));
    poly(
      png,
      [
        [x + 42, 130 + (i % 5) * 22],
        [x - 18, 405 + (i % 3) * 16],
        [x + 102, 405 + (i % 3) * 16],
      ],
      color(i % 2 ? '#183322' : '#11271d'),
    );
    poly(
      png,
      [
        [x + 42, 210 + (i % 5) * 15],
        [x - 5, 465 + (i % 3) * 12],
        [x + 89, 465 + (i % 3) * 12],
      ],
      color('#1d432e', 235),
    );
  }
  ellipse(png, W / 2, 790, 820, 210, color('#2d2215'));
  ellipse(png, 690, 730, 250, 170, color('#85633a', 95));
  for (let i = 0; i < 9; i++) {
    const x = ((i * 160 + t * 220 * (i % 2 ? -1 : 1)) % 1500) - 110;
    ellipse(png, x, 140 + (i % 4) * 72, 190, 28, color('#d9e5d8', 30));
  }
};

const hiker = (png, x, y, fear, frame) => {
  const tremble = Math.sin(frame * 0.7) * fear * 7;
  const bob = Math.sin(frame * 0.22) * 3;
  x += tremble;
  y += bob;
  ellipse(png, x + 74, y + 38, 28, 34, color('#d4a06e'));
  rect(png, x + 45, y + 72, 58, 90, color('#d75333'));
  ellipse(png, x + 74, y + 74, 30, 16, color('#d75333'));
  rect(png, x + 18, y + 80, 24, 88, color('#c58b5b'));
  rect(png, x + 108, y + 80, 24, 88, color('#c58b5b'));
  rect(png, x + 52, y + 160, 22, 94, color('#243149'));
  rect(png, x + 85, y + 160, 22, 94, color('#243149'));
  rect(png, x + 18, y + 102, 24, 80, color('#31433b'));
  rect(png, x + 36, y + 28, 78, 16, color('#24472f'));
  rect(png, x + 56, y + 5, 38, 36, color('#24472f'));
};

const dog = (png, x, y, leap, glow, frame) => {
  const rise = Math.sin(leap * Math.PI) * -95;
  const wag = Math.sin(frame * 0.65) * 22;
  const gx = x;
  const gy = y + rise;
  if (glow > 0) {
    ellipse(png, gx + 125, gy + 74, 135 + glow * 55, 80 + glow * 35, color('#ffe77b', 55 * glow));
  }
  line(png, gx + 46, gy + 62, gx + 10, gy + 50 + wag, 17, color('#f0bf6e'));
  ellipse(png, gx + 84, gy + 72, 70, 37, color('#f0bf6e'));
  ellipse(png, gx + 155, gy + 48, 34, 31, color('#f2c979'));
  line(png, gx + 173, gy + 34, gx + 190, gy + 70, 22, color('#92542c'));
  ellipse(png, gx + 164, gy + 48, 4, 4, color('#16120e'));
  ellipse(png, gx + 190, gy + 56, 10, 6, color('#16120e'));
  rect(png, gx + 66, gy + 101, 18, 48, color('#b9783d'));
  rect(png, gx + 115, gy + 101, 18, 48, color('#b9783d'));
};

const yamamba = (png, x, y, retreat, hit, frame) => {
  const fade = 1 - ease(retreat);
  if (fade <= 0.02) return;
  const a = 255 * fade;
  const sx = x + retreat * 300 + Math.sin(frame * 0.16) * 8;
  const sy = y + hit * 35;
  ellipse(png, sx + 98, sy + 70, 95, 82, color('#c9c9bd', a * 0.75));
  ellipse(png, sx + 104, sy + 108, 55, 58, color('#d4b596', a));
  rect(png, sx + 58, sy + 166, 100, 150, color('#4b2130', a));
  ellipse(png, sx + 86, sy + 109, 7, 5, color('#2a0f12', a));
  ellipse(png, sx + 125, sy + 109, 7, 5, color('#2a0f12', a));
  rect(png, sx + 99, sy + 133, 34, 7, color('#5a2021', a));
  line(png, sx + 64, sy + 182, sx + 12, sy + 230 - hit * 35, 21, color('#d4b596', a));
  line(png, sx + 155, sy + 182, sx + 220, sy + 230 + hit * 38, 22, color('#d4b596', a));
  rect(png, sx + 75, sy + 310, 25, 68, color('#33202c', a));
  rect(png, sx + 120, sy + 310, 25, 68, color('#33202c', a));
};

const lightWave = (png, t) => {
  const local = (t - 0.55) / 0.16;
  if (local < 0 || local > 1.2) return;
  const k = ease(Math.min(local, 1));
  const alpha = 150 * (1 - Math.abs(local - 0.45));
  for (let r = 0; r < 5; r++) {
    ellipse(png, 690, 435, 30 + k * (210 + r * 36), 26 + k * (72 + r * 10), color('#ffe77b', Math.max(0, alpha - r * 18)));
  }
};

for (let frame = 0; frame < TOTAL; frame++) {
  const t = frame / (TOTAL - 1);
  const png = new PNG({width: W, height: H});
  const yamIn = 1 - ease((t - 0.22) / 0.12);
  const fear = ease((t - 0.25) / 0.18) * (1 - ease((t - 0.62) / 0.18));
  const leap = ease((t - 0.47) / 0.07) * (1 - ease((t - 0.62) / 0.08));
  const hit = ease((t - 0.56) / 0.08) * (1 - ease((t - 0.72) / 0.1));
  const retreat = ease((t - 0.61) / 0.21);
  background(png, t, hit);
  yamamba(png, 910 - yamIn * 110, 240, retreat, hit, frame);
  hiker(png, lerp(205, 355, ease(t / 0.38)), 390, fear, frame);
  dog(png, lerp(120, 520, ease((t - 0.04) / 0.55)), 515, leap, ease((t - 0.48) / 0.18) * (1 - retreat), frame);
  lightWave(png, t);
  rect(png, 0, 0, W, H, color('#000000', t < 0.04 ? (1 - t / 0.04) * 255 : 0));
  rect(png, 0, 0, W, H, color('#fff6ce', hit * 90));
  const name = `frame-${String(frame).padStart(4, '0')}.png`;
  fs.writeFileSync(path.join(outDir, name), PNG.sync.write(png));
  if (frame % 48 === 0) process.stdout.write(`frame ${frame}/${TOTAL}\n`);
}

execFileSync(
  ffmpeg.path,
  [
    '-y',
    '-framerate',
    String(FPS),
    '-i',
    path.join(outDir, 'frame-%04d.png'),
    '-f',
    'lavfi',
    '-i',
    `anullsrc=channel_layout=stereo:sample_rate=48000`,
    '-t',
    String(DURATION),
    '-c:v',
    'libx264',
    '-pix_fmt',
    'yuv420p',
    '-crf',
    '18',
    '-shortest',
    output,
  ],
  {stdio: 'inherit'},
);

console.log(output);
