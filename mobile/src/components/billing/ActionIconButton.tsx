import React from "react";
import { TouchableOpacity, StyleSheet, ViewStyle } from "react-native";
import { LucideIcon } from "lucide-react-native";

interface ActionIconButtonProps {
  icon: LucideIcon;
  onPress: () => void;
  color?: string;
  size?: number;
  style?: ViewStyle;
}

export function ActionIconButton({
  icon: Icon,
  onPress,
  color = "#A0B4C4",
  size = 18,
  style,
}: ActionIconButtonProps) {
  return (
    <TouchableOpacity
      activeOpacity={0.6}
      style={[styles.button, style]}
      onPress={onPress}
    >
      <Icon size={size} color={color} strokeWidth={2.2} />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: "rgba(125, 211, 252, 0.04)",
    borderWidth: 1,
    borderColor: "rgba(125, 211, 252, 0.08)",
    alignItems: "center",
    justifyContent: "center",
  },
});
