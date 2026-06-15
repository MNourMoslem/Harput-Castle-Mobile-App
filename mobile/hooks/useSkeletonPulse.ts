import { useEffect, useRef } from 'react';
import { Animated } from 'react-native';

/**
 * Returns an Animated.Value that pulses between minOpacity and maxOpacity
 * while `enabled` is true, and stops cleanly when `enabled` becomes false.
 */
export function useSkeletonPulse(
  enabled: boolean,
  options: { min?: number; max?: number; duration?: number } = {},
): Animated.Value {
  const { min = 0.4, max = 0.95, duration = 650 } = options;
  const pulse = useRef(new Animated.Value(min)).current;
  const animRef = useRef<Animated.CompositeAnimation | null>(null);

  useEffect(() => {
    if (!enabled) {
      if (animRef.current) {
        animRef.current.stop();
        animRef.current = null;
      }
      return;
    }

    animRef.current = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, {
          toValue: max,
          duration,
          useNativeDriver: true,
        }),
        Animated.timing(pulse, {
          toValue: min,
          duration,
          useNativeDriver: true,
        }),
      ]),
    );

    animRef.current.start();

    return () => {
      if (animRef.current) {
        animRef.current.stop();
        animRef.current = null;
      }
    };
  }, [enabled, min, max, duration, pulse]);

  return pulse;
}
