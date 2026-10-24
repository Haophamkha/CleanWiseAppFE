import { useAppTheme } from "@/features/theme/ThemeProvider";

import { LinearGradient } from "expo-linear-gradient";
import { ReactNode } from "react";

export function GradientHeader({ children }: { children: ReactNode }) {
  const { GRADIENTS } = useAppTheme();

  return (
    <LinearGradient
      colors={GRADIENTS.hero}
      locations={[0, 0.55, 1]}
      style={{ paddingTop: 56, paddingHorizontal: 20, paddingBottom: 24 }}
    >
      {children}
    </LinearGradient>
  );
}
