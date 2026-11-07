import '@fontsource/noto-sans-jp/500.css';
import '@fontsource/noto-sans-jp/700.css';
import React from 'react';
import {
  AbsoluteFill,
  interpolate,
  Sequence,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from 'remotion';

const fps = 30;
export const yamambaTrailRescueDurationInFrames = 24 * fps;

const clamp = {
  extrapolateLeft: 'clamp' as const,
  extrapolateRight: 'clamp' as const,
};

const titleFont = '"Noto Sans JP", "Hiragino Sans", sans-serif';

const Mist: React.FC = () => {
  const frame = useCurrentFrame();
  const layers = Array.from({length: 9}, (_, index) => {
    const drift = interpolate(frame + index * 17, [0, 720], [-260, 260], clamp);
    return (
      <div
        key={index}
        style={{
          position: 'absolute',
          left: `${index * 13 - 10}%`,
          top: `${18 + (index % 4) * 14}%`,
          width: 420 + index * 36,
          height: 74 + (index % 3) * 22,
          borderRadius: 999,
          background:
            index % 2 === 0
              ? 'rgba(202,226,214,0.12)'
              : 'rgba(247,236,202,0.08)',
          filter: 'blur(28px)',
          transform: `translateX(${drift * (index % 2 === 0 ? 1 : -0.75)}px)`,
        }}
      />
    );
  });

  return <AbsoluteFill>{layers}</AbsoluteFill>;
};

const Forest: React.FC<{panic?: number}> = ({panic = 0}) => {
  const frame = useCurrentFrame();
  const shake = Math.sin(frame * 0.72) * panic * 8;
  const trees = Array.from({length: 18}, (_, index) => {
    const left = index * 6 - 4;
    const height = 420 + (index % 5) * 70;
    const hue = index % 2 === 0 ? '#12271f' : '#193226';
    return (
      <div
        key={index}
        style={{
          position: 'absolute',
          left: `${left}%`,
          bottom: 118,
          width: 88,
          height,
          transform: `translateX(${shake * (index % 2 === 0 ? 1 : -1)}px)`,
        }}
      >
        <div
          style={{
            position: 'absolute',
            bottom: 0,
            left: 34,
            width: 20,
            height: height * 0.76,
            borderRadius: 20,
            background: '#23180f',
            boxShadow: 'inset 8px 0 rgba(255,255,255,0.05)',
          }}
        />
        <div
          style={{
            position: 'absolute',
            bottom: height * 0.34,
            left: -8,
            width: 104,
            height: 184,
            clipPath: 'polygon(50% 0%, 6% 100%, 94% 100%)',
            background: hue,
            filter: 'drop-shadow(0 18px 24px rgba(0,0,0,0.28))',
          }}
        />
        <div
          style={{
            position: 'absolute',
            bottom: height * 0.52,
            left: 2,
            width: 84,
            height: 140,
            clipPath: 'polygon(50% 0%, 2% 100%, 98% 100%)',
            background: '#1d3f2e',
          }}
        />
      </div>
    );
  });

  return (
    <AbsoluteFill
      style={{
        background:
          'linear-gradient(180deg, #101a27 0%, #1b2c2c 44%, #29321e 72%, #251a12 100%)',
        overflow: 'hidden',
      }}
    >
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background:
            'radial-gradient(circle at 78% 15%, rgba(255,228,166,0.38), transparent 18%), radial-gradient(circle at 24% 18%, rgba(116,172,164,0.18), transparent 28%)',
        }}
      />
      {trees}
      <div
        style={{
          position: 'absolute',
          left: -180,
          right: -180,
          bottom: -80,
          height: 330,
          borderRadius: '50% 50% 0 0',
          background: '#2f2518',
          boxShadow: 'inset 0 36px rgba(255,224,149,0.05)',
        }}
      />
      <div
        style={{
          position: 'absolute',
          left: 580,
          bottom: -60,
          width: 740,
          height: 360,
          borderRadius: '50% 50% 0 0',
          background:
            'linear-gradient(90deg, rgba(119,88,47,0.18), rgba(211,173,99,0.44), rgba(119,88,47,0.12))',
          transform: 'skewX(-11deg)',
        }}
      />
      <Mist />
    </AbsoluteFill>
  );
};

const Hiker: React.FC<{x: number; y: number; fear?: number}> = ({x, y, fear = 0}) => {
  const frame = useCurrentFrame();
  const bob = Math.sin(frame / 5) * 5;
  const tremble = Math.sin(frame * 1.4) * fear * 7;

  return (
    <div
      style={{
        position: 'absolute',
        left: x,
        top: y + bob,
        width: 160,
        height: 310,
        transform: `translateX(${tremble}px)`,
      }}
    >
      <div
        style={{
          position: 'absolute',
          left: 48,
          top: 0,
          width: 66,
          height: 72,
          borderRadius: '48% 48% 45% 45%',
          background: '#d7a06d',
          boxShadow: 'inset -10px -8px rgba(100,54,32,0.18)',
        }}
      />
      <div
        style={{
          position: 'absolute',
          left: 34,
          top: 64,
          width: 92,
          height: 116,
          borderRadius: '28px 28px 20px 20px',
          background: '#d94f31',
          boxShadow: 'inset 14px 0 rgba(255,255,255,0.12)',
        }}
      />
      <div
        style={{
          position: 'absolute',
          left: 15,
          top: 74,
          width: 46,
          height: 122,
          borderRadius: 30,
          background: '#cf8d5a',
          transform: `rotate(${-20 - fear * 18}deg)`,
          transformOrigin: 'top right',
        }}
      />
      <div
        style={{
          position: 'absolute',
          left: 102,
          top: 72,
          width: 44,
          height: 124,
          borderRadius: 30,
          background: '#cf8d5a',
          transform: `rotate(${24 + fear * 16}deg)`,
          transformOrigin: 'top left',
        }}
      />
      <div
        style={{
          position: 'absolute',
          left: 18,
          top: 98,
          width: 36,
          height: 110,
          borderRadius: 18,
          background: '#33433d',
        }}
      />
      <div
        style={{
          position: 'absolute',
          left: 50,
          top: 178,
          width: 34,
          height: 120,
          borderRadius: 18,
          background: '#253448',
          transform: 'rotate(8deg)',
        }}
      />
      <div
        style={{
          position: 'absolute',
          left: 90,
          top: 178,
          width: 34,
          height: 120,
          borderRadius: 18,
          background: '#253448',
          transform: 'rotate(-8deg)',
        }}
      />
      <div
        style={{
          position: 'absolute',
          left: 30,
          top: 34,
          width: 104,
          height: 24,
          borderRadius: 999,
          background: '#264834',
        }}
      />
      <div
        style={{
          position: 'absolute',
          left: 53,
          top: -16,
          width: 56,
          height: 44,
          borderRadius: '50% 50% 12px 12px',
          background: '#264834',
        }}
      />
    </div>
  );
};

const Dog: React.FC<{x: number; y: number; leap?: number; glow?: number}> = ({
  x,
  y,
  leap = 0,
  glow = 0,
}) => {
  const frame = useCurrentFrame();
  const wag = Math.sin(frame * 0.8) * 18;
  const rise = Math.sin(leap * Math.PI) * -145;
  const stretch = 1 + leap * 0.14;

  return (
    <div
      style={{
        position: 'absolute',
        left: x,
        top: y + rise,
        width: 260,
        height: 160,
        transform: `scale(${stretch}) rotate(${interpolate(leap, [0, 1], [0, -8], clamp)}deg)`,
        filter: glow ? `drop-shadow(0 0 ${24 + glow * 40}px rgba(255,232,129,${0.45 + glow * 0.35}))` : undefined,
      }}
    >
      <div
        style={{
          position: 'absolute',
          left: 54,
          top: 54,
          width: 142,
          height: 76,
          borderRadius: '55% 45% 42% 48%',
          background: '#f0c06e',
          boxShadow: 'inset -18px -12px rgba(128,72,26,0.17)',
        }}
      />
      <div
        style={{
          position: 'absolute',
          left: 170,
          top: 28,
          width: 70,
          height: 66,
          borderRadius: '46% 54% 46% 42%',
          background: '#f2c979',
        }}
      />
      <div
        style={{
          position: 'absolute',
          left: 210,
          top: 20,
          width: 30,
          height: 58,
          borderRadius: '80% 20% 80% 20%',
          background: '#9b5e31',
          transform: 'rotate(24deg)',
        }}
      />
      <div
        style={{
          position: 'absolute',
          left: 194,
          top: 50,
          width: 10,
          height: 10,
          borderRadius: 999,
          background: '#1d1711',
        }}
      />
      <div
        style={{
          position: 'absolute',
          left: 232,
          top: 64,
          width: 24,
          height: 12,
          borderRadius: 999,
          background: '#1d1711',
        }}
      />
      <div
        style={{
          position: 'absolute',
          left: 18,
          top: 52,
          width: 74,
          height: 18,
          borderRadius: 999,
          background: '#f0c06e',
          transform: `rotate(${-18 + wag}deg)`,
          transformOrigin: 'right center',
        }}
      />
      {[84, 134].map((left, index) => (
        <div
          key={left}
          style={{
            position: 'absolute',
            left,
            top: 114,
            width: 24,
            height: 58,
            borderRadius: 16,
            background: '#b9773b',
            transform: `rotate(${index === 0 ? 9 : -7}deg)`,
          }}
        />
      ))}
    </div>
  );
};

const Yamamba: React.FC<{x: number; y: number; retreat?: number; hit?: number}> = ({
  x,
  y,
  retreat = 0,
  hit = 0,
}) => {
  const frame = useCurrentFrame();
  const sway = Math.sin(frame / 7) * 11;
  const retreatX = retreat * 420;
  const fade = interpolate(retreat, [0, 0.8, 1], [1, 0.8, 0], clamp);
  const squash = 1 - hit * 0.18;

  return (
    <div
      style={{
        position: 'absolute',
        left: x + retreatX,
        top: y + hit * 42,
        width: 310,
        height: 430,
        opacity: fade,
        transform: `translateX(${sway}px) scale(${1 + hit * 0.07}, ${squash}) rotate(${retreat * 15}deg)`,
        filter: 'drop-shadow(0 34px 38px rgba(0,0,0,0.55))',
      }}
    >
      <div
        style={{
          position: 'absolute',
          left: 34,
          top: 0,
          width: 250,
          height: 230,
          borderRadius: '50%',
          background:
            'radial-gradient(circle at 40% 30%, rgba(240,240,230,0.86), rgba(174,179,166,0.66) 30%, rgba(64,70,67,0.82) 72%)',
          filter: 'blur(1px)',
        }}
      />
      <div
        style={{
          position: 'absolute',
          left: 82,
          top: 66,
          width: 142,
          height: 124,
          borderRadius: '48% 52% 42% 45%',
          background: '#d4b596',
          boxShadow: 'inset -20px -18px rgba(91,52,44,0.22)',
        }}
      />
      <div
        style={{
          position: 'absolute',
          left: 104,
          top: 112,
          width: 18,
          height: 12,
          borderRadius: 999,
          background: '#2a0f12',
          boxShadow: '64px 0 #2a0f12',
        }}
      />
      <div
        style={{
          position: 'absolute',
          left: 132,
          top: 146,
          width: 52,
          height: 12,
          borderRadius: 999,
          background: '#5a2021',
        }}
      />
      <div
        style={{
          position: 'absolute',
          left: 52,
          top: 168,
          width: 210,
          height: 210,
          borderRadius: '38px 38px 60px 60px',
          background: '#4b2130',
          boxShadow: 'inset 22px 0 rgba(255,255,255,0.06)',
        }}
      />
      <div
        style={{
          position: 'absolute',
          left: -4,
          top: 176,
          width: 96,
          height: 32,
          borderRadius: 999,
          background: '#d4b596',
          transform: `rotate(${-36 - hit * 30}deg)`,
          transformOrigin: 'right center',
        }}
      />
      <div
        style={{
          position: 'absolute',
          left: 224,
          top: 174,
          width: 108,
          height: 34,
          borderRadius: 999,
          background: '#d4b596',
          transform: `rotate(${28 + hit * 52}deg)`,
          transformOrigin: 'left center',
        }}
      />
    </div>
  );
};

const Caption: React.FC<{children: React.ReactNode; from: number; to: number}> = ({
  children,
  from,
  to,
}) => {
  const frame = useCurrentFrame();
  const opacity = interpolate(frame, [from, from + 12, to - 12, to], [0, 1, 1, 0], clamp);
  const y = interpolate(frame, [from, from + 18], [24, 0], clamp);

  return (
    <div
      style={{
        position: 'absolute',
        left: 96,
        right: 96,
        bottom: 74,
        padding: '22px 30px',
        borderLeft: '8px solid #f6d277',
        background: 'linear-gradient(90deg, rgba(12,16,18,0.84), rgba(12,16,18,0.48))',
        color: '#fff9e8',
        fontFamily: titleFont,
        fontWeight: 700,
        fontSize: 42,
        letterSpacing: 0,
        lineHeight: 1.22,
        opacity,
        transform: `translateY(${y}px)`,
        textShadow: '0 4px 18px rgba(0,0,0,0.65)',
      }}
    >
      {children}
    </div>
  );
};

const LightWave: React.FC<{from: number}> = ({from}) => {
  const frame = useCurrentFrame();
  const local = frame - from;
  const spread = interpolate(local, [0, 32, 90], [0, 520, 980], clamp);
  const opacity = interpolate(local, [0, 10, 62, 96], [0, 0.9, 0.45, 0], clamp);

  return (
    <div
      style={{
        position: 'absolute',
        left: 830,
        top: 482,
        width: spread,
        height: 170 + spread * 0.12,
        borderRadius: '50%',
        border: '16px solid rgba(255,232,120,0.75)',
        boxShadow: '0 0 48px rgba(255,232,120,0.72), inset 0 0 48px rgba(255,232,120,0.28)',
        opacity,
        transform: 'translate(-50%, -50%) rotate(-5deg)',
      }}
    />
  );
};

export const YamambaTrailRescue: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps: videoFps} = useVideoConfig();
  const intro = spring({fps: videoFps, frame, config: {damping: 22, stiffness: 80}});
  const hikerX = interpolate(frame, [0, 150, 270], [260, 455, 520], clamp);
  const dogX = interpolate(frame, [0, 150, 330], [130, 340, 620], clamp);
  const yamambaIn = interpolate(frame, [150, 220], [1, 0], clamp);
  const fear = interpolate(frame, [172, 225, 345], [0, 1, 0.35], clamp);
  const leap = interpolate(frame, [332, 382, 430], [0, 1, 0], clamp);
  const hit = interpolate(frame, [394, 430, 500], [0, 1, 0.2], clamp);
  const retreat = interpolate(frame, [430, 575], [0, 1], clamp);
  const dawn = interpolate(frame, [560, yamambaTrailRescueDurationInFrames], [0, 1], clamp);

  return (
    <AbsoluteFill style={{backgroundColor: '#0c1212', overflow: 'hidden'}}>
      <Forest panic={hit} />
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: `rgba(255,214,126,${dawn * 0.2})`,
        }}
      />
      <Yamamba x={1290 - yamambaIn * 160} y={278} retreat={retreat} hit={hit} />
      <Hiker x={hikerX} y={405} fear={fear} />
      <Dog x={dogX} y={635} leap={leap} glow={interpolate(frame, [320, 405, 520], [0, 1, 0], clamp)} />
      <LightWave from={392} />
      <Sequence from={0} durationInFrames={118}>
        <div
          style={{
            position: 'absolute',
            left: 86,
            top: 78,
            color: '#fff7d6',
            fontFamily: titleFont,
            fontWeight: 700,
            fontSize: 74,
            lineHeight: 1.05,
            opacity: interpolate(frame, [0, 18, 90, 118], [0, 1, 1, 0], clamp),
            transform: `translateY(${(1 - intro) * 30}px)`,
            textShadow: '0 8px 32px rgba(0,0,0,0.58)',
          }}
        >
          山道の夕暮れ
          <br />
          小さな相棒
        </div>
      </Sequence>
      <Caption from={116} to={222}>ハイカーが山道を進むと、霧の奥から山姥が現れる。</Caption>
      <Caption from={240} to={356}>逃げ場はない。けれど、犬だけは一歩も引かなかった。</Caption>
      <Caption from={380} to={505}>まぶしい咆哮。山姥はひるみ、森の奥へ退いていく。</Caption>
      <Caption from={548} to={704}>夜明けの道。ハイカーと犬は、また並んで歩き出す。</Caption>
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background:
            'radial-gradient(circle at 50% 42%, rgba(255,255,255,0) 42%, rgba(0,0,0,0.4) 100%)',
          pointerEvents: 'none',
        }}
      />
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: `rgba(255,246,208,${interpolate(frame, [394, 404, 430], [0, 0.42, 0], clamp)})`,
          pointerEvents: 'none',
        }}
      />
    </AbsoluteFill>
  );
};
