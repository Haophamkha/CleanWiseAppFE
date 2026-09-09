import { Region } from "@/types/Region";

export interface LocationMapViewHandle {
  animateToRegion: (region: Region, duration?: number) => void;
}

export interface LocationMapViewProps {
  initialRegion: Region;
  onRegionChangeComplete: (region: Region) => void;
}
