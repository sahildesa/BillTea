import React from "react";
import { TouchableOpacity, StyleSheet, ViewStyle } from "react-native";
import { LucideIcon } from "lucide-react-native";
import { useTheme } from "../../hooks/useTheme";

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
  color,
  size = 18,
  style,
}: ActionIconButtonProps) {
  const { colors, isDark } = useTheme();
  const iconColor = color || colors.textSecondary;

  return (
    <TouchableOpacity
      activeOpacity={0.6}
      style={[
        styles.button,
        {
          backgroundColor: isDark ? "rgba(125, 211, 252, 0.04)" : "rgba(3, 105, 161, 0.04)",
          borderColor: isDark ? "rgba(125, 211, 252, 0.08)" : "rgba(3, 105, 161, 0.08)",
        },
        style,
      ]}
      onPress={onPress}
    >
      <Icon size={size} color={iconColor} strokeWidth={2.2} />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    width: 34,
    height: 34,
    borderRadius: 17,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
});
