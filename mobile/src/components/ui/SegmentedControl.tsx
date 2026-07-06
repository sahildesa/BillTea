import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

interface SegmentedControlProps<T extends string> {
  options: T[];
  activeOption: T;
  onOptionChange: (option: T) => void;
}

export function SegmentedControl<T extends string>({
  options,
  activeOption,
  onOptionChange,
}: SegmentedControlProps<T>) {
  return (
    <View style={styles.tabNav}>
      {options.map((option) => {
        const isActive = activeOption === option;
        return (
          <TouchableOpacity
            key={option}
            style={[styles.tabBtn, isActive && styles.tabBtnActive]}
            onPress={() => onOptionChange(option)}
          >
            <Text
              style={[
                styles.tabBtnText,
                isActive ? styles.tabBtnTextActive : styles.tabBtnTextInactive,
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
    backgroundColor: 'rgba(20, 28, 46, 0.5)',
    borderRadius: 12,
    padding: 4,
    borderWidth: 1,
    borderColor: 'rgba(42, 58, 72, 0.3)',
    marginBottom: 16,
  },
  tabBtn: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  tabBtnActive: {
    backgroundColor: '#1a2438',
    borderColor: 'rgba(125, 211, 252, 0.3)',
  },
  tabBtnText: {
    fontSize: 14,
    fontWeight: '600',
  },
  tabBtnTextActive: {
    color: '#7dd3fc',
  },
  tabBtnTextInactive: {
    color: '#a0b4c4',
  },
});
