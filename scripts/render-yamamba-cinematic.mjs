import fs from 'node:fs';
import path from 'node:path';
import {execFileSync} from 'node:child_process';
import ffmpeg from '@ffmpeg-installer/ffmpeg';

const root = process.cwd();
const assetDir = path.join(root, 'public', 'yamamba-rescue');
const renderDir = path.join(root, 'dist', 'renders');
const audioDir = path.join(root, 'dist', 'audio');
fs.mkdirSync(renderDir, {recursive: true});
fs.mkdirSync(audioDir, {recursive: true});

const keyArt = path.join(assetDir, 'key-art.png');
const closingArt = path.join(assetDir, 'closing-art.png');
const ambience = path.join(audioDir, 'yamamba-ambience.wav');
const output = path.join(renderDir, 'yamamba-trail-rescue-cinematic.mp4');

const font =
  '/System/Library/Fonts/ヒラギノ角ゴシック W6.ttc';
const fontFallback = '/System/Library/Fonts/Supplemental/Arial Unicode.ttf';
const fontFile = fs.existsSync(font) ? font : fontFallback;
const safeFont = fontFile.replaceAll('\\', '\\\\').replaceAll(':', '\\:').replaceAll("'", "\\'");

execFileSync(
  ffmpeg.path,
  [
    '-y',
    '-f',
    'lavfi',
    '-i',
    'anoisesrc=color=brown:amplitude=0.045:sample_rate=48000:d=24',
    '-f',
    'lavfi',
    '-i',
    'sine=frequency=72:sample_rate=48000:d=24',
    '-filter_complex',
    '[0:a]lowpass=f=900,highpass=f=90,volume=0.30[wind];[1:a]volume=0.08,afade=t=in:st=8:d=2,afade=t=out:st=16:d=4[drone];[wind][drone]amix=inputs=2:duration=first,afade=t=in:st=0:d=2,afade=t=out:st=21:d=3[a]',
    '-map',
    '[a]',
    ambience,
  ],
  {stdio: 'ignore'},
);

const vf = [
  '[0:v]scale=2400:-1,zoompan=z=1.07+0.00022*on:x=250+0.18*on:y=30+0.04*on:d=216:s=1280x720:fps=24,format=rgba[hero]',
  '[1:v]scale=2400:-1,zoompan=z=1.03+0.00018*on:x=430-0.08*on:y=70:d=216:s=1280x720:fps=24,format=rgba[close]',
  'color=c=0x061017@0.0:s=1280x720:d=18:r=24[base]',
  '[base][hero]overlay=0:0:enable=between(t\\,0\\,9)[v1]',
  '[v1][close]overlay=0:0:enable=gte(t\\,9)[v2]',
  "color=c=0xbfd7e6@0.16:s=1280x720:d=18:r=24,format=rgba,geq=r='r(X,Y)':g='g(X,Y)':b='b(X,Y)':a='80*(sin((X+T*52)/90)+sin((Y+T*30)/54)+2)/4'[mist]",
  '[v2][mist]overlay=x=0:y=0:format=auto[v3]',
  "color=c=0xffd77a@0.0:s=1280x720:d=18:r=24,format=rgba,geq=r='255':g='217':b='122':a='if(between(T,7.1,8.7),115*(1-abs(T-7.9)/0.8),0)'[flash]",
  '[v3][flash]overlay=0:0:format=auto[v4]',
  '[v4]drawbox=x=0:y=0:w=1280:h=720:color=black@0.22:t=fill,fade=t=in:st=0:d=1.1,fade=t=out:st=17:d=1[v5]',
  `[v5]drawtext=fontfile='${safeFont}':text='山道の相棒':x=72:y=64:fontcolor=0xfff4d2:fontsize=54:alpha='if(lt(t,0.8),t/0.8,if(lt(t,4.3),1,if(lt(t,5.1),(5.1-t)/0.8,0)))':shadowcolor=black@0.55:shadowx=3:shadowy=4[v6]`,
  `[v6]drawtext=fontfile='${safeFont}':text='霧の奥から山姥が現れる。':x=72:y=602:fontcolor=0xfff6df:fontsize=34:alpha='if(between(t,2.0,6.4),min((t-2.0)/0.5,min(1,(6.4-t)/0.7)),0)':box=1:boxcolor=0x061017@0.48:boxborderw=18[v7]`,
  `[v7]drawtext=fontfile='${safeFont}':text='犬が前へ出る。光が山道を走る。':x=72:y=602:fontcolor=0xfff6df:fontsize=34:alpha='if(between(t,6.5,10.3),min((t-6.5)/0.4,min(1,(10.3-t)/0.7)),0)':box=1:boxcolor=0x061017@0.48:boxborderw=18[v8]`,
  `[v8]drawtext=fontfile='${safeFont}':text='夜明け、ふたりは無事に歩き出す。':x=72:y=602:fontcolor=0xfff6df:fontsize=34:alpha='if(between(t,11.2,16.4),min((t-11.2)/0.5,min(1,(16.4-t)/0.8)),0)':box=1:boxcolor=0x061017@0.48:boxborderw=18[v9]`,
  '[v9]format=yuv420p[v]',
].join(';');

execFileSync(
  ffmpeg.path,
  [
    '-y',
    '-loop',
    '1',
    '-t',
    '9',
    '-i',
    keyArt,
    '-loop',
    '1',
    '-t',
    '9',
    '-i',
    closingArt,
    '-i',
    ambience,
    '-filter_complex',
    vf,
    '-map',
    '[v]',
    '-map',
    '2:a',
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

console.log(output);
