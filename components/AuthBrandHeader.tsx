import { Text, View } from "react-native";

const AuthBrandHeader = ({ title, subtitle }: AuthBrandHeaderProps) => {
  return (
    <View className="auth-brand-block">
      <View className="auth-logo-wrap">
        <View className="auth-logo-mark">
          <Text className="auth-logo-mark-text">B</Text>
        </View>
        <View>
          <Text className="auth-wordmark">Budget</Text>
          <Text className="auth-wordmark-sub">Subscription tracker</Text>
        </View>
      </View>
      <Text className="auth-title">{title}</Text>
      <Text className="auth-subtitle">{subtitle}</Text>
    </View>
  );
};

export default AuthBrandHeader;
