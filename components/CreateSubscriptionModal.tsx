import AuthButton from "@/components/AuthButton";
import AuthTextField from "@/components/AuthTextField";
import { SUBSCRIPTION_CATEGORIES } from "@/constants/data";
import { resolveSubscriptionIcon } from "@/lib/subscriptionIcons";
import clsx from "clsx";
import dayjs from "dayjs";
import React, { useState } from "react";
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  Text,
  View,
} from "react-native";
import { z } from "zod";

const FREQUENCIES: SubscriptionFrequency[] = ["Monthly", "Yearly"];

const subscriptionSchema = z.object({
  name: z.string().trim().min(1, "Name is required."),
  price: z
    .string()
    .trim()
    .min(1, "Price is required.")
    .refine(
      (value) => Number.isFinite(Number(value)) && Number(value) > 0,
      "Enter a price greater than zero.",
    ),
});

const CreateSubscriptionModal = ({
  visible,
  onClose,
  onCreate,
}: CreateSubscriptionModalProps) => {
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [frequency, setFrequency] = useState<SubscriptionFrequency>("Monthly");
  const [category, setCategory] = useState<string>(SUBSCRIPTION_CATEGORIES[0]);
  const [fieldErrors, setFieldErrors] = useState<{
    name?: string;
    price?: string;
  }>({});

  const resetForm = () => {
    setName("");
    setPrice("");
    setFrequency("Monthly");
    setCategory(SUBSCRIPTION_CATEGORIES[0]);
    setFieldErrors({});
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleSubmit = () => {
    const result = subscriptionSchema.safeParse({ name, price });
    if (!result.success) {
      const flattened = z.flattenError(result.error).fieldErrors;
      setFieldErrors({
        name: flattened.name?.[0],
        price: flattened.price?.[0],
      });
      return;
    }

    const startDate = dayjs();
    const renewalDate = startDate.add(
      1,
      frequency === "Monthly" ? "month" : "year",
    );
    const { image, brandIcon } = resolveSubscriptionIcon(result.data.name);

    onCreate({
      id: `${result.data.name.toLowerCase().replace(/\s+/g, "-")}-${Date.now()}`,
      icon: image,
      brandIcon,
      name: result.data.name,
      category,
      status: "active",
      startDate: startDate.toISOString(),
      price: Number(result.data.price),
      currency: "USD",
      billing: frequency,
      renewalDate: renewalDate.toISOString(),
    });
    handleClose();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={handleClose}
    >
      <View className="modal-overlay">
        <KeyboardAvoidingView
          className="flex-1"
          behavior={Platform.OS === "ios" ? "padding" : undefined}
        >
          <Pressable
            className="flex-1"
            onPress={handleClose}
            accessibilityLabel="Close new subscription form"
          />
          <View className="modal-container">
            <View className="modal-header">
              <Text className="modal-title">New Subscription</Text>
              <Pressable
                className="modal-close"
                onPress={handleClose}
                hitSlop={8}
                accessibilityRole="button"
                accessibilityLabel="Close"
              >
                <Text className="modal-close-text">✕</Text>
              </Pressable>
            </View>
            <ScrollView
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}
            >
              <View className="modal-body">
                <AuthTextField
                  label="Name"
                  value={name}
                  onChangeText={(value) => {
                    setName(value);
                    if (fieldErrors.name)
                      setFieldErrors((current) => ({
                        ...current,
                        name: undefined,
                      }));
                  }}
                  placeholder="e.g. Netflix"
                  autoCapitalize="words"
                  error={fieldErrors.name}
                />
                <AuthTextField
                  label="Price"
                  value={price}
                  onChangeText={(value) => {
                    setPrice(value);
                    if (fieldErrors.price)
                      setFieldErrors((current) => ({
                        ...current,
                        price: undefined,
                      }));
                  }}
                  placeholder="0.00"
                  keyboardType="decimal-pad"
                  error={fieldErrors.price}
                />
                <View className="auth-field">
                  <Text className="auth-label">Frequency</Text>
                  <View className="picker-row">
                    {FREQUENCIES.map((option) => (
                      <Pressable
                        key={option}
                        className={clsx(
                          "picker-option",
                          frequency === option && "picker-option-active",
                        )}
                        onPress={() => setFrequency(option)}
                        accessibilityRole="button"
                        accessibilityState={{ selected: frequency === option }}
                      >
                        <Text
                          className={clsx(
                            "picker-option-text",
                            frequency === option && "picker-option-text-active",
                          )}
                        >
                          {option}
                        </Text>
                      </Pressable>
                    ))}
                  </View>
                </View>
                <View className="auth-field">
                  <Text className="auth-label">Category</Text>
                  <View className="category-scroll">
                    {SUBSCRIPTION_CATEGORIES.map((option) => (
                      <Pressable
                        key={option}
                        className={clsx(
                          "category-chip",
                          category === option && "category-chip-active",
                        )}
                        onPress={() => setCategory(option)}
                        accessibilityRole="button"
                        accessibilityState={{ selected: category === option }}
                      >
                        <Text
                          className={clsx(
                            "category-chip-text",
                            category === option && "category-chip-text-active",
                          )}
                        >
                          {option}
                        </Text>
                      </Pressable>
                    ))}
                  </View>
                </View>
                <AuthButton
                  title="Add Subscription"
                  onPress={handleSubmit}
                  disabled={!name.trim() || !price.trim()}
                />
              </View>
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
};

export default CreateSubscriptionModal;
