import { colors } from "@/constants/theme";
import clsx from "clsx";
import { ActivityIndicator, Pressable, Text } from "react-native";

const AuthButton = ({
  title,
  onPress,
  disabled,
  loading,
  variant = "primary",
}: AuthButtonProps) => {
  const isPrimary = variant === "primary";

  return (
    <Pressable
      className={clsx(
        isPrimary ? "auth-button" : "auth-secondary-button",
        isPrimary && disabled && "auth-button-disabled",
      )}
      onPress={onPress}
      disabled={disabled || loading}
      accessibilityRole="button"
      accessibilityState={{ disabled: disabled || loading }}
    >
      {loading ? (
        <ActivityIndicator
          size="small"
          color={isPrimary ? colors.primary : colors.accent}
        />
      ) : (
        <Text
          className={
            isPrimary ? "auth-button-text" : "auth-secondary-button-text"
          }
        >
          {title}
        </Text>
      )}
    </Pressable>
  );
};

export default AuthButton;
