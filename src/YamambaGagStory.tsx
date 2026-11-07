import '@fontsource/noto-sans-jp/700.css';
import React from 'react';
import {
  AbsoluteFill,
  Img,
  Sequence,
  interpolate,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from 'remotion';
import {Audio} from '@remotion/media';

const fps = 30;
export const yamambaGagStoryDurationInFrames = 18 * fps;

const clips = [
  {
    src: 'yamamba-gag/scene-01.png',
    from: 0,
    duration: 4.4,
    caption: '山道で迷子。地図は、まさかの上下逆。',
  },
  {
    src: 'yamamba-gag/scene-02.png',
    from: 4.2,
    duration: 4.3,
    caption: '山姥「いただきまーす！」 犬「……え？」',
  },
  {
    src: 'yamamba-gag/scene-03.png',
    from: 8.2,
    duration: 4.7,
    caption: '必殺、わんこ波動。山姥、全力でのけぞる。',
  },
  {
    src: 'yamamba-gag/scene-04.png',
    from: 12.5,
    duration: 5.5,
    caption: '勝者、犬。ハイカー、深々とお礼。',
  },
] as const;

const clamp = {extrapolateLeft: 'clamp' as const, extrapolateRight: 'clamp' as const};

const Scene: React.FC<{clip: (typeof clips)[number]; index: number}> = ({clip, index}) => {
  const frame = useCurrentFrame();
  const {fps: videoFps} = useVideoConfig();
  const localDuration = Math.round(clip.duration * videoFps);
  const enter = spring({
    frame,
    fps: videoFps,
    config: {damping: 20, stiffness: 90},
    durationInFrames: 18,
  });
  const captionIn = interpolate(frame, [8, 18, localDuration - 20, localDuration - 8], [0, 1, 1, 0], clamp);
  const zoom = 1.04 + index * 0.008 + frame / localDuration * 0.035;
  const wobble = index === 2 ? Math.sin(frame * 0.9) * 6 : Math.sin(frame * 0.24) * 1.2;

  return (
    <AbsoluteFill style={{backgroundColor: '#081016', overflow: 'hidden'}}>
      <Img
        src={staticFile(clip.src)}
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          transform: `scale(${zoom}) translateX(${wobble}px)`,
          filter: index === 2 ? 'saturate(1.18) contrast(1.08)' : 'saturate(1.05)',
        }}
      />
      <AbsoluteFill
        style={{
          background:
            'linear-gradient(180deg, rgba(0,0,0,0.12) 0%, rgba(0,0,0,0.04) 48%, rgba(0,0,0,0.54) 100%)',
        }}
      />
      {index === 2 ? (
        <AbsoluteFill
          style={{
            background: `rgba(255,226,87,${interpolate(frame, [0, 8, 24, 48], [0, 0.34, 0.08, 0], clamp)})`,
          }}
        />
      ) : null}
      <div
        style={{
          position: 'absolute',
          left: 72,
          right: 72,
          bottom: 58,
          padding: '22px 28px',
          borderRadius: 18,
          background: 'rgba(4, 11, 15, 0.7)',
          border: '3px solid rgba(255, 224, 114, 0.72)',
          color: '#fff8dd',
          fontFamily: '"Noto Sans JP", sans-serif',
          fontWeight: 700,
          fontSize: 42,
          lineHeight: 1.18,
          opacity: captionIn,
          transform: `translateY(${(1 - enter) * 24}px) scale(${0.98 + enter * 0.02})`,
          textShadow: '0 4px 18px rgba(0,0,0,0.72)',
        }}
      >
        {clip.caption}
      </div>
    </AbsoluteFill>
  );
};

export const YamambaGagStory: React.FC = () => {
  return (
    <AbsoluteFill style={{backgroundColor: '#081016'}}>
      <Audio src={staticFile('yamamba-gag/yamamba-gag-music.wav')} />
      {clips.map((clip, index) => (
        <Sequence
          key={clip.src}
          from={Math.round(clip.from * fps)}
          durationInFrames={Math.round(clip.duration * fps)}
          premountFor={fps}
        >
          <Scene clip={clip} index={index} />
        </Sequence>
      ))}
    </AbsoluteFill>
  );
};
