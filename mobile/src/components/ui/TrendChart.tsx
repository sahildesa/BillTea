import React from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import Svg, { Defs, LinearGradient, Stop, Path } from 'react-native-svg';

export function TrendChart() {
  return (
    <View style={styles.container}>
      <Svg width="100%" height="100%" viewBox="0 0 300 100" preserveAspectRatio="none">
        <Defs>
          <LinearGradient id="grad-inv" x1="0%" x2="0%" y1="0%" y2="100%">
            <Stop offset="0%" stopColor="#7dd3fc" stopOpacity="0.3" />
            <Stop offset="100%" stopColor="#7dd3fc" stopOpacity="0.05" />
          </LinearGradient>
          <LinearGradient id="grad-quo" x1="0%" x2="0%" y1="0%" y2="100%">
            <Stop offset="0%" stopColor="#c8a0f0" stopOpacity="0.3" />
            <Stop offset="100%" stopColor="#c8a0f0" stopOpacity="0.05" />
          </LinearGradient>
        </Defs>

        <Path 
          d="M0 70 Q 50 80, 100 50 T 200 30 T 300 10 L 300 100 L 0 100 Z" 
          fill="url(#grad-quo)" 
        />
        <Path 
          d="M0 70 Q 50 80, 100 50 T 200 30 T 300 10" 
          fill="none" 
          stroke="#c8a0f0" 
          strokeWidth="2" 
        />
        
        <Path 
          d="M0 90 Q 50 60, 100 70 T 200 40 T 300 20 L 300 100 L 0 100 Z" 
          fill="url(#grad-inv)" 
        />
        <Path 
          d="M0 90 Q 50 60, 100 70 T 200 40 T 300 20" 
          fill="none" 
          stroke="#7dd3fc" 
          strokeWidth="2" 
        />
      </Svg>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    height: 192,
    width: '100%',
    overflow: 'visible',
  }
});
