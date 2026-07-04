import AuthBrandHeader from "@/components/AuthBrandHeader";
import AuthButton from "@/components/AuthButton";
import AuthTextField from "@/components/AuthTextField";
import "@/global.css";
import { getCodeError, getEmailError, getPasswordError } from "@/lib/validation";
import { useAuth, useSignUp } from "@clerk/expo";
import { Link, useRouter } from "expo-router";
import { styled } from "nativewind";
import React, { useEffect, useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  View,
} from "react-native";
import { SafeAreaView as RNSaveAreaView } from "react-native-safe-area-context";

const SafeAreaView = styled(RNSaveAreaView);

const RESEND_COOLDOWN_SECONDS = 30;

const SignUp = () => {
  const { signUp, errors, fetchStatus } = useSignUp();
  const { isSignedIn } = useAuth();
  const router = useRouter();

  const [emailAddress, setEmailAddress] = useState("");
  const [password, setPassword] = useState("");
  const [code, setCode] = useState("");
  const [clientErrors, setClientErrors] = useState<{
    emailAddress?: string | null;
    password?: string | null;
    code?: string | null;
  }>({});
  const [resendCooldown, setResendCooldown] = useState(0);

  const isSubmitting = fetchStatus === "fetching";

  useEffect(() => {
    if (resendCooldown <= 0) return;
    const timer = setTimeout(
      () => setResendCooldown((seconds) => seconds - 1),
      1000,
    );
    return () => clearTimeout(timer);
  }, [resendCooldown]);

  const handleSubmit = async () => {
    const nextErrors = {
      emailAddress: getEmailError(emailAddress),
      password: getPasswordError(password, { strict: true }),
    };
    setClientErrors(nextErrors);
    if (nextErrors.emailAddress || nextErrors.password) return;

    const { error } = await signUp.password({
      emailAddress: emailAddress.trim(),
      password,
    });
    if (error) return;

    const { error: sendError } = await signUp.verifications.sendEmailCode();
    if (!sendError) setResendCooldown(RESEND_COOLDOWN_SECONDS);
  };

  const handleVerify = async () => {
    const codeError = getCodeError(code);
    setClientErrors({ code: codeError });
    if (codeError) return;

    await signUp.verifications.verifyEmailCode({ code: code.trim() });

    if (signUp.status === "complete") {
      await signUp.finalize({
        navigate: ({ session }) => {
          // Session tasks (e.g. org selection) are not used by this app yet.
          if (session?.currentTask) return;
          router.replace("/");
        },
      });
    }
  };

  const handleResend = async () => {
    setCode("");
    setClientErrors({});
    const { error } = await signUp.verifications.sendEmailCode();
    if (!error) setResendCooldown(RESEND_COOLDOWN_SECONDS);
  };

  // The (auth) layout redirects as soon as the session becomes active.
  if (signUp.status === "complete" || isSignedIn) {
    return null;
  }

  const isVerifyStep =
    signUp.status === "missing_requirements" &&
    signUp.unverifiedFields.includes("email_address") &&
    signUp.missingFields.length === 0;

  const globalError = errors.global?.[0]?.message;

  return (
    <SafeAreaView className="auth-safe-area">
      <KeyboardAvoidingView
        className="auth-screen"
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          className="auth-scroll"
          contentContainerClassName="auth-content"
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {isVerifyStep ? (
            <>
              <AuthBrandHeader
                title="Check your email"
                subtitle={`We sent a verification code to ${emailAddress.trim()}. Enter it below to finish setting up your account.`}
              />

              <View className="auth-card">
                <View className="auth-form">
                  <AuthTextField
                    label="Verification code"
                    value={code}
                    onChangeText={setCode}
                    placeholder="Enter the 6-digit code"
                    keyboardType="number-pad"
                    autoComplete="one-time-code"
                    textContentType="oneTimeCode"
                    error={clientErrors.code ?? errors.fields.code?.message}
                    editable={!isSubmitting}
                  />
                  {!!globalError && (
                    <Text className="auth-error">{globalError}</Text>
                  )}
                  <AuthButton
                    title="Verify email"
                    onPress={handleVerify}
                    disabled={!code.trim() || isSubmitting}
                    loading={isSubmitting}
                  />
                  <AuthButton
                    title={
                      resendCooldown > 0
                        ? `Resend code in ${resendCooldown}s`
                        : "Resend code"
                    }
                    onPress={handleResend}
                    disabled={resendCooldown > 0 || isSubmitting}
                    variant="secondary"
                  />
                </View>
              </View>

              <View className="auth-link-row">
                <Text className="auth-link-copy">Wrong email?</Text>
                <Pressable onPress={() => signUp.reset()} hitSlop={8}>
                  <Text className="auth-link">Start over</Text>
                </Pressable>
              </View>
            </>
          ) : (
            <>
              <AuthBrandHeader
                title="Create your account"
                subtitle="Track every subscription and renewal in one place."
              />

              <View className="auth-card">
                <View className="auth-form">
                  <AuthTextField
                    label="Email address"
                    value={emailAddress}
                    onChangeText={(value) => {
                      setEmailAddress(value);
                      if (clientErrors.emailAddress)
                        setClientErrors((current) => ({
                          ...current,
                          emailAddress: null,
                        }));
                    }}
                    placeholder="you@example.com"
                    keyboardType="email-address"
                    autoComplete="email"
                    textContentType="emailAddress"
                    error={
                      clientErrors.emailAddress ??
                      errors.fields.emailAddress?.message
                    }
                    editable={!isSubmitting}
                  />
                  <AuthTextField
                    label="Password"
                    value={password}
                    onChangeText={(value) => {
                      setPassword(value);
                      if (clientErrors.password)
                        setClientErrors((current) => ({
                          ...current,
                          password: null,
                        }));
                    }}
                    placeholder="At least 8 characters"
                    secureTextEntry
                    autoComplete="new-password"
                    textContentType="newPassword"
                    error={
                      clientErrors.password ?? errors.fields.password?.message
                    }
                    editable={!isSubmitting}
                  />
                  <Text className="auth-helper">
                    Use 8+ characters with at least one letter and one number.
                  </Text>
                  {!!globalError && (
                    <Text className="auth-error">{globalError}</Text>
                  )}
                  <AuthButton
                    title="Create account"
                    onPress={handleSubmit}
                    disabled={!emailAddress || !password || isSubmitting}
                    loading={isSubmitting}
                  />
                </View>
              </View>

              <View className="auth-link-row">
                <Text className="auth-link-copy">Already have an account?</Text>
                <Link href="/(auth)/sign-in" replace>
                  <Text className="auth-link">Sign in</Text>
                </Link>
              </View>

              {/* Required for sign-up flows. Clerk's bot protection is enabled by default. */}
              <View nativeID="clerk-captcha" />
            </>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default SignUp;
