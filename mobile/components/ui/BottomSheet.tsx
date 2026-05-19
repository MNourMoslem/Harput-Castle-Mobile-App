/**
 * BottomSheet — rebuilt from scratch.
 *
 * Key design decisions:
 *   • Anchored at `bottom: 0` so it ALWAYS reaches the very bottom of the
 *     screen — no gap behind the tab bar or home indicator.
 *   • Uses `Dimensions.get('screen')` (full physical screen) rather than
 *     `'window'` so the height is correct on Android with translucent bars.
 *   • PanResponder lives on the handle area and uses always-fresh refs so
 *     stale closures are impossible. `onStartShouldSetPanResponder` is `true`
 *     so the gesture is captured reliably from the first touch.
 */
import React, { useCallback, useEffect, useRef } from 'react';
import {
  Animated,
  Dimensions,
  Easing,
  Modal,
  PanResponder,
  StyleSheet,
  TouchableWithoutFeedback,
  View,
} from 'react-native';
import Colors from '@/constants/colors';

// Full physical screen height — includes status bar on Android
const SCREEN_H = Dimensions.get('screen').height;

interface BottomSheetProps {
  visible: boolean;
  /** Called after the close animation completes */
  onClose: () => void;
  children: React.ReactNode;
  /** Pixels of screen peeking above the sheet when fully open (default 60) */
  topGap?: number;
}

export default function BottomSheet({
  visible,
  onClose,
  children,
  topGap = 60,
}: BottomSheetProps) {
  const SHEET_H = SCREEN_H - topGap;

  // translateY = 0 → sheet fully visible; SHEET_H → fully below the screen
  const translateY = useRef(new Animated.Value(SHEET_H)).current;

  // ── Always-fresh refs (avoid stale closures inside PanResponder) ──────────
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;

  const sheetHRef = useRef(SHEET_H);
  sheetHRef.current = SHEET_H;

  // closeSheet is also kept in a ref so PanResponder can call it
  const closeSheet = useCallback(() => {
    Animated.timing(translateY, {
      toValue: SHEET_H,
      duration: 300,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start(() => onCloseRef.current());
  }, [translateY, SHEET_H]);

  const closeSheetRef = useRef(closeSheet);
  closeSheetRef.current = closeSheet;

  // ── Open / close triggers ─────────────────────────────────────────────────
  useEffect(() => {
    if (visible) {
      translateY.setValue(SHEET_H);
      Animated.spring(translateY, {
        toValue: 0,
        useNativeDriver: true,
        bounciness: 3,
        speed: 16,
      }).start();
    }
  }, [visible, translateY, SHEET_H]);

  // ── Backdrop opacity (fades in as sheet rises) ────────────────────────────
  const backdropOpacity = translateY.interpolate({
    inputRange: [0, SHEET_H],
    outputRange: [0.55, 0],
    extrapolate: 'clamp',
  });

  // ── Drag-to-dismiss gesture (handle area only) ────────────────────────────
  const panResponder = useRef(
    PanResponder.create({
      // Claim the touch immediately on the handle
      onStartShouldSetPanResponder: () => true,
      // Also claim if movement is primarily vertical
      onMoveShouldSetPanResponder: (_, g) =>
        Math.abs(g.dy) > 3 && Math.abs(g.dy) > Math.abs(g.dx),

      onPanResponderMove: (_, g) => {
        // Only allow dragging downward
        if (g.dy > 0) translateY.setValue(g.dy);
      },

      onPanResponderRelease: (_, g) => {
        const sh = sheetHRef.current;
        if (g.dy > sh * 0.28 || g.vy > 0.9) {
          // Fast enough or far enough → close
          closeSheetRef.current();
        } else {
          // Snap back to open position
          Animated.spring(translateY, {
            toValue: 0,
            useNativeDriver: true,
            bounciness: 3,
            speed: 16,
          }).start();
        }
      },

      onPanResponderTerminate: () => {
        // Another recognizer stole the gesture — snap back
        Animated.spring(translateY, {
          toValue: 0,
          useNativeDriver: true,
          bounciness: 3,
          speed: 16,
        }).start();
      },
    }),
  ).current;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={closeSheet}
      statusBarTranslucent
    >
      {/* Dim backdrop — tap anywhere outside sheet to close */}
      <TouchableWithoutFeedback onPress={closeSheet}>
        <Animated.View
          style={[
            StyleSheet.absoluteFill,
            { backgroundColor: '#000000', opacity: backdropOpacity },
          ]}
        />
      </TouchableWithoutFeedback>

      {/* ── Sheet ── anchored to bottom, never has a gap ──────────────────── */}
      <Animated.View
        style={[
          styles.sheet,
          { height: SHEET_H },
          { transform: [{ translateY }] },
        ]}
      >
        {/* Drag handle — generous touch target */}
        <View style={styles.handleWrap} {...panResponder.panHandlers}>
          <View style={styles.handle} />
        </View>

        {/* Content fills the remaining space */}
        <View style={styles.body}>{children}</View>
      </Animated.View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  sheet: {
    position: 'absolute',
    bottom: 0,        // ← anchored at screen bottom, never leaves a gap
    left: 0,
    right: 0,
    backgroundColor: Colors.background,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    overflow: 'hidden',
  },
  handleWrap: {
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  handle: {
    width: 44,
    height: 5,
    borderRadius: 3,
    backgroundColor: Colors.border,
  },
  body: {
    flex: 1,
  },
});
