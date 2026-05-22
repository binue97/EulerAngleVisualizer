import { Line, Text, Billboard } from '@react-three/drei';

interface AxesProps {
  length?: number;
  lineWidth?: number;
  opacity?: number;
  colors?: [string, string, string]; // [X, Y, Z]
  /** Optional labels at axis tips (e.g. ['X', 'Y', 'Z']). Omit for no labels. */
  labels?: [string, string, string];
}

const LABEL_GAP = 0.18;
const LABEL_FONT_SIZE = 0.22;
const LABEL_OUTLINE = 0.035;

/** Three colored line segments from the origin, optionally tipped with text labels. */
export function Axes({
  length = 1.5,
  lineWidth = 2.5,
  opacity = 1,
  colors = ['#ff4f4f', '#4ade80', '#5b8def'],
  labels,
}: AxesProps) {
  const tip = length + LABEL_GAP;
  return (
    <group>
      <Line points={[[0, 0, 0], [length, 0, 0]]} color={colors[0]} lineWidth={lineWidth} transparent opacity={opacity} />
      <Line points={[[0, 0, 0], [0, length, 0]]} color={colors[1]} lineWidth={lineWidth} transparent opacity={opacity} />
      <Line points={[[0, 0, 0], [0, 0, length]]} color={colors[2]} lineWidth={lineWidth} transparent opacity={opacity} />

      {labels && (
        <>
          <Billboard position={[tip, 0, 0]}>
            <Text fontSize={LABEL_FONT_SIZE} color={colors[0]} outlineColor="#000" outlineWidth={LABEL_OUTLINE}>
              {labels[0]}
            </Text>
          </Billboard>
          <Billboard position={[0, tip, 0]}>
            <Text fontSize={LABEL_FONT_SIZE} color={colors[1]} outlineColor="#000" outlineWidth={LABEL_OUTLINE}>
              {labels[1]}
            </Text>
          </Billboard>
          <Billboard position={[0, 0, tip]}>
            <Text fontSize={LABEL_FONT_SIZE} color={colors[2]} outlineColor="#000" outlineWidth={LABEL_OUTLINE}>
              {labels[2]}
            </Text>
          </Billboard>
        </>
      )}
    </group>
  );
}
