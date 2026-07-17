import React from 'react';
import { View, StyleSheet } from 'react-native';
import Svg, { Defs, LinearGradient, Stop, Path } from 'react-native-svg';

export type TrendPoint = {
  invoices: number;
  quotations: number;
};

type Props = {
  // Pass real data points here. If omitted, falls back to the original static demo shape
  // so nothing breaks if this component is ever reused elsewhere without data.
  data?: TrendPoint[];
};

const VIEW_WIDTH = 300;
const VIEW_HEIGHT = 100;

// Turns a list of values into a smooth-ish SVG path, scaled to the chart's viewBox.
function buildPath(values: number[], closeToBottom: boolean) {
  if (values.length === 0) return '';

  const max = Math.max(...values, 1);
  const min = Math.min(...values, 0);
  const range = max - min || 1;

  const stepX = values.length > 1 ? VIEW_WIDTH / (values.length - 1) : VIEW_WIDTH;

  const points = values.map((v, i) => {
    const x = i * stepX;
    // Leave a little headroom at top/bottom (10-90 range) so lines don't touch the edges
    const y = VIEW_HEIGHT - 10 - ((v - min) / range) * (VIEW_HEIGHT - 20);
    return { x, y };
  });

  let d = `M${points[0].x} ${points[0].y}`;
  for (let i = 1; i < points.length; i++) {
    const prev = points[i - 1];
    const curr = points[i];
    const midX = (prev.x + curr.x) / 2;
    d += ` Q ${midX} ${prev.y}, ${curr.x} ${curr.y}`;
  }

  if (closeToBottom) {
    d += ` L ${VIEW_WIDTH} ${VIEW_HEIGHT} L 0 ${VIEW_HEIGHT} Z`;
  }

  return d;
}

export function TrendChart({ data }: Props) {
  const hasData = data && data.length > 0;

  const invoiceValues = hasData ? data!.map((d) => d.invoices) : [90, 70, 50, 30, 20];
  const quotationValues = hasData ? data!.map((d) => d.quotations) : [70, 50, 30, 10];

  const invoiceLine = buildPath(invoiceValues, false);
  const invoiceArea = buildPath(invoiceValues, true);
  const quotationLine = buildPath(quotationValues, false);
  const quotationArea = buildPath(quotationValues, true);

  return (
    <View style={styles.container}>
      <Svg width="100%" height="100%" viewBox={`0 0 ${VIEW_WIDTH} ${VIEW_HEIGHT}`} preserveAspectRatio="none">
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

        <Path d={quotationArea} fill="url(#grad-quo)" />
        <Path d={quotationLine} fill="none" stroke="#c8a0f0" strokeWidth="2" />

        <Path d={invoiceArea} fill="url(#grad-inv)" />
        <Path d={invoiceLine} fill="none" stroke="#7dd3fc" strokeWidth="2" />
      </Svg>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    height: 192,
    width: '100%',
    overflow: 'visible',
  },
});
