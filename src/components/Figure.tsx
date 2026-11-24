import type { Pose } from "@/data/program";

/**
 * Ilustração placeholder (flat) de uma mulher em cada posição de exercício.
 * Substituir por vídeos/GIFs reais via `mediaUrl` no program.ts.
 */

type P = [number, number];
interface Skeleton {
  head: P;
  shoulder: P;
  hip: P;
  near: { knee: P; foot: P; elbow: P; hand: P };
  far: { knee: P; foot: P; elbow: P; hand: P };
  prop?: "chair" | "shadow";
}

const POSES: Record<Pose, Skeleton> = {
  bridge: {
    head: [32, 118], shoulder: [50, 120], hip: [100, 100],
    near: { knee: [136, 92], foot: [142, 128], elbow: [72, 127], hand: [92, 127] },
    far: { knee: [130, 93], foot: [132, 128], elbow: [68, 126], hand: [86, 126] },
  },
  quadruped: {
    head: [40, 80], shoulder: [60, 90], hip: [122, 90],
    near: { knee: [124, 128], foot: [162, 128], elbow: [60, 110], hand: [62, 128] },
    far: { knee: [116, 126], foot: [154, 127], elbow: [54, 110], hand: [54, 128] },
  },
  side: {
    head: [36, 104], shoulder: [56, 112], hip: [112, 116],
    near: { knee: [148, 92], foot: [184, 80], elbow: [52, 128], hand: [30, 128] },
    far: { knee: [148, 124], foot: [184, 128], elbow: [48, 126], hand: [28, 127] },
  },
  squat: {
    head: [108, 38], shoulder: [102, 54], hip: [86, 96],
    near: { knee: [126, 100], foot: [116, 128], elbow: [126, 66], hand: [146, 64] },
    far: { knee: [118, 98], foot: [106, 128], elbow: [122, 64], hand: [142, 62] },
  },
  lunge: {
    head: [100, 32], shoulder: [100, 50], hip: [100, 90],
    near: { knee: [132, 98], foot: [136, 128], elbow: [86, 70], hand: [96, 88] },
    far: { knee: [74, 124], foot: [46, 128], elbow: [114, 70], hand: [104, 88] },
  },
  stand: {
    head: [100, 26], shoulder: [100, 44], hip: [100, 86],
    near: { knee: [104, 108], foot: [104, 128], elbow: [86, 64], hand: [94, 84] },
    far: { knee: [94, 108], foot: [92, 128], elbow: [114, 64], hand: [106, 84] },
  },
  plank: {
    head: [34, 92], shoulder: [52, 100], hip: [112, 106],
    near: { knee: [146, 114], foot: [178, 124], elbow: [52, 128], hand: [74, 128] },
    far: { knee: [142, 112], foot: [172, 122], elbow: [46, 127], hand: [68, 127] },
  },
  seated: {
    head: [100, 58], shoulder: [100, 76], hip: [100, 118],
    near: { knee: [136, 110], foot: [106, 126], elbow: [122, 100], hand: [104, 120] },
    far: { knee: [64, 110], foot: [94, 126], elbow: [78, 100], hand: [96, 120] },
  },
  jump: {
    head: [100, 18], shoulder: [100, 36], hip: [100, 72],
    near: { knee: [118, 88], foot: [112, 108], elbow: [118, 22], hand: [128, 6] },
    far: { knee: [82, 88], foot: [88, 108], elbow: [82, 22], hand: [72, 6] },
    prop: "shadow",
  },
  step: {
    head: [98, 16], shoulder: [98, 34], hip: [96, 72],
    near: { knee: [128, 72], foot: [132, 100], elbow: [84, 54], hand: [92, 70] },
    far: { knee: [90, 100], foot: [82, 128], elbow: [110, 54], hand: [102, 70] },
    prop: "chair",
  },
};

const C = {
  skin: "#eab28e",
  skinShade: "#d89a76",
  hair: "#3b2a33",
  top: "#a98cf3",
  legs: "#6a49d6",
  legsFar: "#5637b8",
  shoe: "#ffffff",
};

const line = (pts: P[]) => pts.map((p) => p.join(",")).join(" ");

export function Figure({ pose, className = "" }: { pose: Pose; className?: string }) {
  const s = POSES[pose];
  return (
    <svg viewBox="0 0 200 140" className={className} aria-hidden>
      {/* chão */}
      <ellipse cx="100" cy="131" rx="88" ry="5" fill="#000" opacity="0.06" />
      {s.prop === "chair" && (
        <g>
          <rect x="112" y="100" width="56" height="6" rx="3" fill="#c8b8f5" />
          <rect x="116" y="106" width="5" height="24" rx="2" fill="#b19df0" />
          <rect x="159" y="106" width="5" height="24" rx="2" fill="#b19df0" />
          <rect x="159" y="60" width="5" height="42" rx="2" fill="#b19df0" />
        </g>
      )}
      {s.prop === "shadow" && <ellipse cx="100" cy="128" rx="22" ry="4" fill="#000" opacity="0.1" />}

      <g strokeLinecap="round" strokeLinejoin="round" fill="none">
        {/* lado de trás */}
        <polyline points={line([s.shoulder, s.far.elbow, s.far.hand])} stroke={C.skinShade} strokeWidth="8" />
        <polyline points={line([s.hip, s.far.knee, s.far.foot])} stroke={C.legsFar} strokeWidth="14" />
        <circle cx={s.far.foot[0]} cy={s.far.foot[1] - 1} r="5" fill={C.shoe} stroke="none" />

        {/* tronco */}
        <line x1={s.shoulder[0]} y1={s.shoulder[1]} x2={s.hip[0]} y2={s.hip[1]} stroke={C.top} strokeWidth="22" />
        <line
          x1={(s.shoulder[0] + s.hip[0] * 2) / 3}
          y1={(s.shoulder[1] + s.hip[1] * 2) / 3}
          x2={s.hip[0]}
          y2={s.hip[1]}
          stroke={C.legs}
          strokeWidth="20"
        />

        {/* lado da frente */}
        <polyline points={line([s.hip, s.near.knee, s.near.foot])} stroke={C.legs} strokeWidth="15" />
        <circle cx={s.near.foot[0]} cy={s.near.foot[1] - 1} r="5.5" fill={C.shoe} stroke="#e6defa" strokeWidth="1" />
        <polyline points={line([s.shoulder, s.near.elbow, s.near.hand])} stroke={C.skin} strokeWidth="8" />
      </g>

      {/* cabeça */}
      <g>
        <circle cx={s.head[0] - 7} cy={s.head[1] - 9} r="6" fill={C.hair} />
        <circle cx={s.head[0]} cy={s.head[1]} r="11.5" fill={C.hair} />
        <circle cx={s.head[0] + 1.5} cy={s.head[1] + 2} r="9.5" fill={C.skin} />
        <path
          d={`M${s.head[0] - 10} ${s.head[1] - 1} Q ${s.head[0]} ${s.head[1] - 14} ${s.head[0] + 11} ${s.head[1] - 1}`}
          fill={C.hair}
        />
      </g>
    </svg>
  );
}

/** Folhinhas decorativas (como na referência visual). */
export function Leaves({ className = "", flip = false }: { className?: string; flip?: boolean }) {
  return (
    <svg viewBox="0 0 60 90" className={className} style={flip ? { transform: "scaleX(-1)" } : undefined} aria-hidden>
      <path d="M30 90 C30 60 28 35 22 8" stroke="#9fd3b4" strokeWidth="2.5" fill="none" strokeLinecap="round" />
      <path d="M27 40 C10 36 4 22 6 12 C18 14 27 26 27 40Z" fill="#b9e3c9" />
      <path d="M29 58 C46 52 54 38 52 28 C38 30 30 44 29 58Z" fill="#9fd3b4" />
      <path d="M24 22 C14 16 14 6 18 0 C26 4 28 14 24 22Z" fill="#c9ecd6" />
      <path d="M30 76 C14 74 6 64 6 56 C18 56 28 64 30 76Z" fill="#b9e3c9" />
    </svg>
  );
}
