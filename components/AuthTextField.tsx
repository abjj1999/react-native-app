import clsx from "clsx";
import { useState } from "react";
import { Pressable, Text, TextInput, View } from "react-native";

const AuthTextField = ({
  label,
  value,
  onChangeText,
  error,
  placeholder,
  secureTextEntry,
  keyboardType,
  autoCapitalize = "none",
  autoComplete,
  textContentType,
  editable = true,
}: AuthTextFieldProps) => {
  const [hidden, setHidden] = useState(!!secureTextEntry);

  return (
    <View className="auth-field">
      <Text className="auth-label">{label}</Text>
      <View className="relative">
        <TextInput
          className={clsx(
            "auth-input",
            secureTextEntry && "pr-16",
            error && "auth-input-error",
          )}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor="rgba(0, 0, 0, 0.35)"
          secureTextEntry={hidden}
          keyboardType={keyboardType}
          autoCapitalize={autoCapitalize}
          autoComplete={autoComplete}
          textContentType={textContentType}
          autoCorrect={false}
          editable={editable}
        />
        {secureTextEntry && (
          <Pressable
            className="absolute bottom-0 right-4 top-0 justify-center"
            onPress={() => setHidden((current) => !current)}
            hitSlop={8}
            accessibilityRole="button"
            accessibilityLabel={hidden ? "Show password" : "Hide password"}
          >
            <Text className="text-xs font-sans-bold text-accent">
              {hidden ? "Show" : "Hide"}
            </Text>
          </Pressable>
        )}
      </View>
      {!!error && <Text className="auth-error">{error}</Text>}
    </View>
  );
};

export default AuthTextField;
