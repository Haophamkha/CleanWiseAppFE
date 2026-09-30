import { COLORS } from "@/constants/theme";
import { useEffect, useRef, useState } from "react";
import {
  Image,
  NativeScrollEvent,
  NativeSyntheticEvent,
  ScrollView,
  View,
  useWindowDimensions,
} from "react-native";
import { HOME_BANNERS } from "../data/banners";

const INTERVAL = 4000;
const H_PADDING = 20;
const ASPECT = 2;

export function BannerCarousel() {
  const { width } = useWindowDimensions();
  const itemWidth = width - H_PADDING * 2;
  const itemHeight = itemWidth / ASPECT;
  const step = itemWidth + 12;

  const scrollRef = useRef<ScrollView>(null);
  const indexRef = useRef(0);
  const pausedRef = useRef(false);
  const [index, setIndex] = useState(0);

  const goTo = (i: number, animated = true) => {
    indexRef.current = i;
    setIndex(i);
    scrollRef.current?.scrollTo({ x: i * step, animated });
  };

  useEffect(() => {
    if (HOME_BANNERS.length < 2) return;
    const timer = setInterval(() => {
      if (pausedRef.current) return;
      goTo((indexRef.current + 1) % HOME_BANNERS.length);
    }, INTERVAL);
    return () => clearInterval(timer);
  }, [step]);

  const onEnd = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const i = Math.round(e.nativeEvent.contentOffset.x / step);
    indexRef.current = i;
    setIndex(i);
    pausedRef.current = false;
  };

  if (HOME_BANNERS.length === 0) return null;

  return (
    <View className="mt-5">
      <ScrollView
        ref={scrollRef}
        horizontal
        showsHorizontalScrollIndicator={false}
        decelerationRate="fast"
        snapToInterval={step}
        contentContainerStyle={{ paddingHorizontal: H_PADDING }}
        onScrollBeginDrag={() => (pausedRef.current = true)}
        onMomentumScrollEnd={onEnd}
      >
        {HOME_BANNERS.map((b, i) => (
          <Image
            key={b.id}
            source={b.source}
            resizeMode="cover"
            style={{
              width: itemWidth,
              height: itemHeight,
              borderRadius: 20,
              marginRight: i === HOME_BANNERS.length - 1 ? 0 : 12,
            }}
          />
        ))}
      </ScrollView>

      {HOME_BANNERS.length > 1 && (
        <View className="flex-row justify-center mt-3" style={{ gap: 6 }}>
          {HOME_BANNERS.map((b, i) => (
            <View
              key={b.id}
              style={{
                height: 6,
                width: i === index ? 18 : 6,
                borderRadius: 3,
                backgroundColor: i === index ? COLORS.primary : COLORS.line,
              }}
            />
          ))}
        </View>
      )}
    </View>
  );
}
