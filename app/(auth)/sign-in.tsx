import AuthBrandHeader from "@/components/AuthBrandHeader";
import AuthButton from "@/components/AuthButton";
import AuthTextField from "@/components/AuthTextField";
import "@/global.css";
import { getCodeError, getEmailError, getPasswordError } from "@/lib/validation";
import { useSignIn } from "@clerk/expo";
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

const SignIn = () => {
  const { signIn, errors, fetchStatus } = useSignIn();
  const router = useRouter();

  const [emailAddress, setEmailAddress] = useState("");
  const [password, setPassword] = useState("");
  const [code, setCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [isResetFlow, setIsResetFlow] = useState(false);
  const [clientErrors, setClientErrors] = useState<{
    emailAddress?: string | null;
    password?: string | null;
    code?: string | null;
    newPassword?: string | null;
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

  const finalizeSignIn = async () => {
    await signIn.finalize({
      navigate: ({ session }) => {
        // Session tasks (e.g. org selection) are not used by this app yet.
        if (session?.currentTask) return;
        router.replace("/");
      },
    });
  };

  const handleSubmit = async () => {
    const nextErrors = {
      emailAddress: getEmailError(emailAddress),
      password: getPasswordError(password),
    };
    setClientErrors(nextErrors);
    if (nextErrors.emailAddress || nextErrors.password) return;

    const { error } = await signIn.password({
      emailAddress: emailAddress.trim(),
      password,
    });
    if (error) return;

    if (signIn.status === "complete") {
      await finalizeSignIn();
    } else if (signIn.status === "needs_client_trust") {
      const emailCodeFactor = signIn.supportedSecondFactors.find(
        (factor) => factor.strategy === "email_code",
      );
      if (emailCodeFactor) {
        const { error: sendError } = await signIn.mfa.sendEmailCode();
        if (!sendError) setResendCooldown(RESEND_COOLDOWN_SECONDS);
      }
    }
  };

  const handleVerifyTrust = async () => {
    const codeError = getCodeError(code);
    setClientErrors({ code: codeError });
    if (codeError) return;

    const { error } = await signIn.mfa.verifyEmailCode({ code: code.trim() });
    if (error) return;

    if (signIn.status === "complete") {
      await finalizeSignIn();
    }
  };

  const handleForgotPassword = async () => {
    const emailError = getEmailError(emailAddress);
    setClientErrors({ emailAddress: emailError });
    if (emailError) return;

    const { error } = await signIn.create({
      identifier: emailAddress.trim(),
    });
    if (error) return;

    const { error: sendError } = await signIn.resetPasswordEmailCode.sendCode();
    if (sendError) return;

    setCode("");
    setIsResetFlow(true);
    setResendCooldown(RESEND_COOLDOWN_SECONDS);
  };

  const handleVerifyResetCode = async () => {
    const codeError = getCodeError(code);
    setClientErrors({ code: codeError });
    if (codeError) return;

    // On success signIn.status becomes "needs_new_password".
    await signIn.resetPasswordEmailCode.verifyCode({ code: code.trim() });
  };

  const handleSubmitNewPassword = async () => {
    const passwordError = getPasswordError(newPassword, { strict: true });
    setClientErrors({ newPassword: passwordError });
    if (passwordError) return;

    const { error } = await signIn.resetPasswordEmailCode.submitPassword({
      password: newPassword,
    });
    if (error) return;

    if (signIn.status === "complete") {
      await finalizeSignIn();
    }
  };

  const handleResendResetCode = async () => {
    setCode("");
    setClientErrors({});
    const { error } = await signIn.resetPasswordEmailCode.sendCode();
    if (!error) setResendCooldown(RESEND_COOLDOWN_SECONDS);
  };

  const handleStartOver = async () => {
    setIsResetFlow(false);
    setCode("");
    setNewPassword("");
    setClientErrors({});
    await signIn.reset();
  };

  const globalError = errors.global?.[0]?.message;

  const renderCard = () => {
    if (signIn.status === "needs_client_trust") {
      return (
        <>
          <AuthBrandHeader
            title="Verify it's you"
            subtitle="This device isn't recognized yet. Enter the code we sent to your email to continue."
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
              {!!globalError && <Text className="auth-error">{globalError}</Text>}
              <AuthButton
                title="Verify"
                onPress={handleVerifyTrust}
                disabled={!code.trim() || isSubmitting}
                loading={isSubmitting}
              />
              <AuthButton
                title={
                  resendCooldown > 0
                    ? `Resend code in ${resendCooldown}s`
                    : "Resend code"
                }
                onPress={async () => {
                  setCode("");
                  const { error } = await signIn.mfa.sendEmailCode();
                  if (!error) setResendCooldown(RESEND_COOLDOWN_SECONDS);
                }}
                disabled={resendCooldown > 0 || isSubmitting}
                variant="secondary"
              />
            </View>
          </View>

          <View className="auth-link-row">
            <Text className="auth-link-copy">Having trouble?</Text>
            <Pressable onPress={handleStartOver} hitSlop={8}>
              <Text className="auth-link">Start over</Text>
            </Pressable>
          </View>
        </>
      );
    }

    if (signIn.status === "needs_new_password") {
      return (
        <>
          <AuthBrandHeader
            title="Set a new password"
            subtitle="Your code was verified. Choose a new password for your account."
          />

          <View className="auth-card">
            <View className="auth-form">
              <AuthTextField
                label="New password"
                value={newPassword}
                onChangeText={(value) => {
                  setNewPassword(value);
                  if (clientErrors.newPassword)
                    setClientErrors((current) => ({
                      ...current,
                      newPassword: null,
                    }));
                }}
                placeholder="At least 8 characters"
                secureTextEntry
                autoComplete="new-password"
                textContentType="newPassword"
                error={
                  clientErrors.newPassword ?? errors.fields.password?.message
                }
                editable={!isSubmitting}
              />
              <Text className="auth-helper">
                Use 8+ characters with at least one letter and one number.
              </Text>
              {!!globalError && <Text className="auth-error">{globalError}</Text>}
              <AuthButton
                title="Update password"
                onPress={handleSubmitNewPassword}
                disabled={!newPassword || isSubmitting}
                loading={isSubmitting}
              />
            </View>
          </View>

          <View className="auth-link-row">
            <Text className="auth-link-copy">Changed your mind?</Text>
            <Pressable onPress={handleStartOver} hitSlop={8}>
              <Text className="auth-link">Back to sign in</Text>
            </Pressable>
          </View>
        </>
      );
    }

    if (isResetFlow) {
      return (
        <>
          <AuthBrandHeader
            title="Reset your password"
            subtitle={`We sent a reset code to ${emailAddress.trim()}. Enter it below to continue.`}
          />

          <View className="auth-card">
            <View className="auth-form">
              <AuthTextField
                label="Reset code"
                value={code}
                onChangeText={setCode}
                placeholder="Enter the 6-digit code"
                keyboardType="number-pad"
                autoComplete="one-time-code"
                textContentType="oneTimeCode"
                error={clientErrors.code ?? errors.fields.code?.message}
                editable={!isSubmitting}
              />
              {!!globalError && <Text className="auth-error">{globalError}</Text>}
              <AuthButton
                title="Verify code"
                onPress={handleVerifyResetCode}
                disabled={!code.trim() || isSubmitting}
                loading={isSubmitting}
              />
              <AuthButton
                title={
                  resendCooldown > 0
                    ? `Resend code in ${resendCooldown}s`
                    : "Resend code"
                }
                onPress={handleResendResetCode}
                disabled={resendCooldown > 0 || isSubmitting}
                variant="secondary"
              />
            </View>
          </View>

          <View className="auth-link-row">
            <Text className="auth-link-copy">Remembered it?</Text>
            <Pressable onPress={handleStartOver} hitSlop={8}>
              <Text className="auth-link">Back to sign in</Text>
            </Pressable>
          </View>
        </>
      );
    }

    return (
      <>
        <AuthBrandHeader
          title="Welcome back"
          subtitle="Sign in to keep tabs on your subscriptions and renewals."
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
                clientErrors.emailAddress ?? errors.fields.identifier?.message
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
              placeholder="Your password"
              secureTextEntry
              autoComplete="current-password"
              textContentType="password"
              error={clientErrors.password ?? errors.fields.password?.message}
              editable={!isSubmitting}
            />
            <Pressable
              className="self-end"
              onPress={handleForgotPassword}
              disabled={isSubmitting}
              hitSlop={8}
            >
              <Text className="auth-link">Forgot password?</Text>
            </Pressable>
            {!!globalError && <Text className="auth-error">{globalError}</Text>}
            <AuthButton
              title="Sign in"
              onPress={handleSubmit}
              disabled={!emailAddress || !password || isSubmitting}
              loading={isSubmitting}
            />
          </View>
        </View>

        <View className="auth-link-row">
          <Text className="auth-link-copy">Don&apos;t have an account?</Text>
          <Link href="/(auth)/sign-up" replace>
            <Text className="auth-link">Sign up</Text>
          </Link>
        </View>
      </>
    );
  };

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
          {renderCard()}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default SignIn;
