import fs from 'node:fs';
import path from 'node:path';
import {execFileSync} from 'node:child_process';
import ffmpeg from '@ffmpeg-installer/ffmpeg';

const root = process.cwd();
const publicDir = path.join(root, 'public', 'yamamba-gag');
const renderDir = path.join(root, 'dist', 'renders');
fs.mkdirSync(publicDir, {recursive: true});
fs.mkdirSync(renderDir, {recursive: true});

const output = path.join(renderDir, 'yamamba-gag-story.mp4');
const music = path.join(publicDir, 'yamamba-gag-music.wav');
const preview = path.join(renderDir, 'yamamba-gag-story-preview.png');
const fontCandidates = [
  '/System/Library/Fonts/ヒラギノ角ゴシック W6.ttc',
  '/System/Library/Fonts/Supplemental/Arial Unicode.ttf',
];
const font = fontCandidates.find((candidate) => fs.existsSync(candidate)) ?? fontCandidates[1];
const safeFont = font.replaceAll('\\', '\\\\').replaceAll(':', '\\:').replaceAll("'", "\\'");

const captions = [
  {text: '山道で迷子。地図は、まさかの上下逆。', start: 0.7, end: 4.0},
  {text: '山姥「いただきまーす！」 犬「……え？」', start: 4.5, end: 8.1},
  {text: '必殺、わんこ波動。山姥、全力でのけぞる。', start: 8.5, end: 12.3},
  {text: '勝者、犬。ハイカー、深々とお礼。', start: 13.0, end: 17.3},
];

const esc = (text) => text.replaceAll('\\', '\\\\').replaceAll(':', '\\:').replaceAll("'", "\\'");
const captionFilter = (input, caption, index) => {
  const alpha = `if(between(t,${caption.start},${caption.end}),min((t-${caption.start})/0.18,min(1,(${caption.end}-t)/0.22)),0)`;
  return `[${input}]drawtext=fontfile='${safeFont}':text='${esc(caption.text)}':x=58:y=598:fontcolor=0xfff8dc:fontsize=33:alpha='${alpha}':box=1:boxcolor=0x071018@0.72:boxborderw=18:shadowcolor=black@0.85:shadowx=3:shadowy=4[v${index}]`;
};

execFileSync(
  ffmpeg.path,
  [
    '-y',
    '-f',
    'lavfi',
    '-i',
    'sine=frequency=392:sample_rate=48000:d=18',
    '-f',
    'lavfi',
    '-i',
    'sine=frequency=523:sample_rate=48000:d=18',
    '-f',
    'lavfi',
    '-i',
    'sine=frequency=784:sample_rate=48000:d=18',
    '-f',
    'lavfi',
    '-i',
    'anoisesrc=color=pink:amplitude=0.018:sample_rate=48000:d=18',
    '-filter_complex',
    [
      '[0:a]volume=0.10,atrim=0:18,asetpts=N/SR/TB[a0]',
      '[1:a]volume=0.05,atrim=0:18,asetpts=N/SR/TB[a1]',
      '[2:a]volume=0.06,adelay=4500|4500,atrim=0:18,asetpts=N/SR/TB[a2]',
      '[3:a]highpass=f=800,volume=0.08,atrim=0:18,asetpts=N/SR/TB[hat]',
      'sine=frequency=1200:sample_rate=48000:d=0.12,volume=0.22,adelay=4300|4300[s1]',
      'sine=frequency=180:sample_rate=48000:d=0.28,volume=0.25,adelay=8200|8200[s2]',
      'sine=frequency=980:sample_rate=48000:d=0.18,volume=0.20,adelay=11800|11800[s3]',
      'sine=frequency=660:sample_rate=48000:d=0.38,volume=0.18,adelay=15800|15800[s4]',
      '[a0][a1][a2][hat][s1][s2][s3][s4]amix=inputs=8:duration=first,afade=t=in:st=0:d=0.3,afade=t=out:st=17.2:d=0.8[a]',
    ].join(';'),
    '-map',
    '[a]',
    music,
  ],
  {stdio: 'ignore'},
);

const sceneFilters = [
  '[0:v]scale=1800:-1,zoompan=z=1.04+0.00020*on:x=170+0.14*on:y=38+0.02*on:d=105:s=1280x720:fps=24,format=rgba[s1]',
  '[1:v]scale=1800:-1,zoompan=z=1.06+0.00025*on:x=230-0.09*on:y=30:d=103:s=1280x720:fps=24,format=rgba[s2]',
  '[2:v]scale=1800:-1,zoompan=z=1.08+0.00035*on:x=260+10*sin(on/5):y=42+6*cos(on/6):d=113:s=1280x720:fps=24,format=rgba[s3]',
  '[3:v]scale=1800:-1,zoompan=z=1.04+0.00018*on:x=240-0.08*on:y=48:d=132:s=1280x720:fps=24,format=rgba[s4]',
  '[s1][s2]xfade=transition=fade:duration=0.35:offset=4.05[x1]',
  '[x1][s3]xfade=transition=fade:duration=0.28:offset=8.0[x2]',
  '[x2][s4]xfade=transition=fade:duration=0.38:offset=12.35[x3]',
  "color=c=0xffe45d@0.0:s=1280x720:d=18:r=24,format=rgba,geq=r='255':g='228':b='93':a='if(between(T,8.25,9.35),130*(1-abs(T-8.8)/0.55),0)'[flash]",
  '[x3][flash]overlay=0:0:format=auto[vbase]',
  "color=c=0xffffff@0.0:s=1280x720:d=18:r=24,format=rgba,geq=r='255':g='255':b='255':a='if(between(T,4.2,4.45),160*(1-abs(T-4.325)/0.125),0)+if(between(T,11.8,12.05),150*(1-abs(T-11.925)/0.125),0)'[pop]",
  '[vbase][pop]overlay=0:0:format=auto[vpop]',
  '[vpop]drawbox=x=0:y=0:w=1280:h=720:color=black@0.13:t=fill,fade=t=in:st=0:d=0.35,fade=t=out:st=17.5:d=0.5[vshade]',
  `[vshade]drawtext=fontfile='${safeFont}':text='山姥 vs 犬':x=58:y=42:fontcolor=0xffeb77:fontsize=54:alpha='if(lt(t,0.45),t/0.45,if(lt(t,2.6),1,if(lt(t,3.1),(3.1-t)/0.5,0)))':shadowcolor=black@0.7:shadowx=4:shadowy=5[vtitle]`,
].join(';');

const captionFilters = captions.reduce(
  (acc, caption, index) => {
    const input = index === 0 ? 'vtitle' : `v${index}`;
    acc.push(captionFilter(input, caption, index + 1));
    return acc;
  },
  [],
);

execFileSync(
  ffmpeg.path,
  [
    '-y',
    '-loop',
    '1',
    '-t',
    '4.4',
    '-i',
    path.join(publicDir, 'scene-01.png'),
    '-loop',
    '1',
    '-t',
    '4.3',
    '-i',
    path.join(publicDir, 'scene-02.png'),
    '-loop',
    '1',
    '-t',
    '4.7',
    '-i',
    path.join(publicDir, 'scene-03.png'),
    '-loop',
    '1',
    '-t',
    '5.5',
    '-i',
    path.join(publicDir, 'scene-04.png'),
    '-i',
    music,
    '-filter_complex',
    `${sceneFilters};${captionFilters.join(';')};[v4]format=yuv420p[v]`,
    '-map',
    '[v]',
    '-map',
    '4:a',
    '-t',
    '18',
    '-c:v',
    'libx264',
    '-crf',
    '17',
    '-preset',
    'medium',
    '-c:a',
    'aac',
    '-b:a',
    '160k',
    '-movflags',
    '+faststart',
    output,
  ],
  {stdio: 'inherit'},
);

execFileSync(
  ffmpeg.path,
  ['-y', '-ss', '00:00:08.8', '-i', output, '-frames:v', '1', preview],
  {stdio: 'ignore'},
);

console.log(output);
