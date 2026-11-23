import Svg, { Circle, Path, Rect } from "react-native-svg";

export type DuoKind = "ac" | "broom" | "calendar" | "truck" | "sofa";

const BY_CODE: Record<string, DuoKind> = {
  HOME_CLEANING_HOURLY: "broom",
  HOME_CLEANING_MONTHLY: "calendar",
  HOME_MOVING: "truck",
  UPHOLSTERY_CLEANING: "sofa",
};

const BY_SECTION: Record<string, DuoKind> = {
  HOME_CLEANING: "broom",
  APPLIANCE_CLEANING: "ac",
  MOVING: "truck",
  UPHOLSTERY_CLEANING: "sofa",
};

export function getDuoKind(code: string, sectionCode: string): DuoKind | null {
  if (BY_CODE[code]) return BY_CODE[code];
  if (code.startsWith("AIR_CONDITIONER")) return "ac";
  return BY_SECTION[sectionCode] ?? null;
}

type Props = { kind: DuoKind; size: number; color: string };

export function ServiceDuoIcon({ kind, size, color }: Props) {
  const S = {
    stroke: color,
    strokeWidth: 2.5,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
  };
  const soft = { fill: color, fillOpacity: 0.22 };

  return (
    <Svg width={size} height={size} viewBox="0 0 48 48">
      {kind === "ac" && (
        <>
          <Rect x={5} y={9} width={38} height={17} rx={4} {...soft} {...S} />
          <Path d="M11 21h26" fill="none" {...S} />
          <Path
            d="M14 31v8M10.5 33l7 4M17.5 33l-7 4M34 31v8M30.5 33l7 4M37.5 33l-7 4"
            fill="none"
            {...S}
            strokeWidth={2}
          />
          <Circle cx={24} cy={36} r={1.8} fill={color} />
        </>
      )}
      {kind === "broom" && (
        <>
          <Path d="M31 5L24 26" fill="none" {...S} strokeWidth={3} />
          <Path d="M16 26h16l6 17H10z" {...soft} {...S} />
          <Path d="M19 33l-2 10M24 33v10M29 33l2 10" fill="none" {...S} strokeWidth={2} />
          <Path d="M39 9l2 5 5 1-5 1-2 5-2-5-5-1 5-1z" fill={color} />
        </>
      )}
      {kind === "calendar" && (
        <>
          <Rect x={7} y={10} width={34} height={31} rx={5} {...soft} {...S} />
          <Path d="M7 20h34" fill="none" {...S} />
          <Path d="M16 6v8M32 6v8" fill="none" {...S} strokeWidth={3} />
          <Path d="M17 31l5 5 9-10" fill="none" {...S} strokeWidth={3} />
        </>
      )}
      {kind === "truck" && (
        <>
          <Rect x={3} y={14} width={27} height={20} rx={3} {...soft} {...S} />
          <Path d="M30 20h7l7 7v7H30z" {...soft} {...S} />
          <Path d="M34 24h3.5l3 3H34z" fill={color} />
          <Circle cx={14} cy={36} r={4.5} fill={color} />
          <Circle cx={37} cy={36} r={4.5} fill={color} />
        </>
      )}
      {kind === "sofa" && (
        <>
          <Rect x={9} y={11} width={30} height={20} rx={5} {...soft} {...S} />
          <Rect x={3} y={20} width={9} height={17} rx={4.5} {...soft} {...S} />
          <Rect x={36} y={20} width={9} height={17} rx={4.5} {...soft} {...S} />
          <Rect x={12} y={25} width={24} height={11} rx={4} fill={color} fillOpacity={0.45} {...S} />
          <Path d="M12 38v4M36 38v4" fill="none" {...S} strokeWidth={3} />
        </>
      )}
    </Svg>
  );
}