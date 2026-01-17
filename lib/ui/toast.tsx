import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { Animated, Easing, Text, View } from 'react-native';

type ToastType = 'success' | 'error' | 'info';

type ToastState = {
  text: string;
  type: ToastType;
  duration?: number;
};

const ToastContext = createContext<{ show: (text: string, type?: ToastType, duration?: number) => void }>({
  show: () => {},
});

export function useToast() {
  return useContext(ToastContext);
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toast, setToast] = useState<ToastState | null>(null);
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(20)).current;
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const show = useCallback((text: string, type: ToastType = 'info', duration = 3000) => {
    if (timer.current) {
      clearTimeout(timer.current);
      timer.current = null;
    }
    setToast({ text, type, duration });
  }, []);

  useEffect(() => {
    if (!toast) return;
    Animated.parallel([
      Animated.timing(opacity, { toValue: 1, duration: 200, easing: Easing.out(Easing.quad), useNativeDriver: true }),
      Animated.timing(translateY, { toValue: 0, duration: 200, easing: Easing.out(Easing.quad), useNativeDriver: true }),
    ]).start();
    timer.current = setTimeout(() => {
      Animated.parallel([
        Animated.timing(opacity, { toValue: 0, duration: 200, easing: Easing.in(Easing.quad), useNativeDriver: true }),
        Animated.timing(translateY, { toValue: 20, duration: 200, easing: Easing.in(Easing.quad), useNativeDriver: true }),
      ]).start(() => setToast(null));
    }, toast.duration ?? 3000);
  }, [toast, opacity, translateY]);

  const bg = useMemo(() => {
    if (toast?.type === 'success') return '#22c55e';
    if (toast?.type === 'error') return '#ef4444';
    return '#334155';
  }, [toast]);

  return (
    <ToastContext.Provider value={{ show }}>
      {children}
      {toast && (
        <View pointerEvents="none" style={{ position: 'absolute', left: 0, right: 0, bottom: 40, alignItems: 'center' }}>
          <Animated.View
            style={{
              opacity,
              transform: [{ translateY }],
              backgroundColor: bg,
              paddingVertical: 12,
              paddingHorizontal: 16,
              borderRadius: 8,
              maxWidth: '90%',
            }}
          >
            <Text style={{ color: '#fff', fontWeight: '600', textAlign: 'center' }}>{toast.text}</Text>
          </Animated.View>
        </View>
      )}
    </ToastContext.Provider>
  );
}
