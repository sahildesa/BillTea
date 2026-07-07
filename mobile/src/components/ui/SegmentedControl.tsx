import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ViewStyle, StyleProp } from 'react-native';
import { useTheme } from '../../hooks/useTheme';

interface SegmentedControlProps<T extends string> {
  options: T[];
  activeOption: T;
  onOptionChange: (option: T) => void;
  style?: StyleProp<ViewStyle>;
}

export function SegmentedControl<T extends string>({
  options,
  activeOption,
  onOptionChange,
  style,
}: SegmentedControlProps<T>) {
  const { colors } = useTheme();

  return (
    <View style={[styles.tabNav, { backgroundColor: colors.glassBackground, borderColor: colors.border }, style]}>
      {options.map((option) => {
        const isActive = activeOption === option;
        return (
            <TouchableOpacity
              key={option}
              style={[
                styles.tabBtn, 
                isActive && { backgroundColor: colors.surfaceVariant, borderColor: colors.glassBorder }
              ]}
              onPress={() => onOptionChange(option)}
            >
              <Text
                style={[
                  styles.tabBtnText,
                  isActive ? { color: colors.primary } : { color: colors.textSecondary },
                ]}
              >
                {option}
              </Text>
            </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  tabNav: {
    flexDirection: 'row',
    borderRadius: 999,
    padding: 3,
    borderWidth: 1,
    marginBottom: 16,
  },
  tabBtn: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 999,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  tabBtnText: {
    fontSize: 14,
    fontWeight: '600',
  },
});
