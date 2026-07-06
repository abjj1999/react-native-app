import SubscriptionCard from "@/components/SubscriptionCard";
import { HOME_SUBSCRIPTIONS } from "@/constants/data";
import "@/global.css";
import React, { useMemo, useState } from "react";
import { FlatList, Keyboard, Text, TextInput, View } from "react-native";
import { SafeAreaView as RNSaveAreaView } from "react-native-safe-area-context";
import { styled } from "nativewind";

const SafeAreaView = styled(RNSaveAreaView);

const Subscriptions = () => {
    const [query, setQuery] = useState("");
    const [expandedSubscriptionId, setExpandedSubscriptionId] = useState<
        string | null
    >(null);

    const filteredSubscriptions = useMemo(() => {
        const search = query.trim().toLowerCase();
        if (!search) return HOME_SUBSCRIPTIONS;
        return HOME_SUBSCRIPTIONS.filter((subscription) =>
            [subscription.name, subscription.category, subscription.plan]
                .filter(Boolean)
                .some((field) => field!.toLowerCase().includes(search)),
        );
    }, [query]);

    return (
        <SafeAreaView className='flex-1 bg-background p-5'>
            <FlatList
                ListHeaderComponent={
                    <>
                        <Text className="list-title">Subscriptions</Text>
                        <TextInput
                            className="auth-input my-5 bg-card"
                            value={query}
                            onChangeText={setQuery}
                            placeholder="Search by name, category, or plan"
                            placeholderTextColor="rgba(0, 0, 0, 0.35)"
                            autoCapitalize="none"
                            autoCorrect={false}
                            returnKeyType="search"
                            onSubmitEditing={Keyboard.dismiss}
                            clearButtonMode="while-editing"
                            accessibilityLabel="Search subscriptions"
                        />
                    </>
                }
                data={filteredSubscriptions}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                    <SubscriptionCard
                        {...item}
                        expanded={expandedSubscriptionId === item.id}
                        onPress={() =>
                            setExpandedSubscriptionId((currentId) =>
                                currentId === item.id ? null : item.id,
                            )
                        }
                    />
                )}
                extraData={expandedSubscriptionId}
                ItemSeparatorComponent={() => <View className="h-4" />}
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="handled"
                keyboardDismissMode="on-drag"
                ListEmptyComponent={
                    <Text className="home-empty-state">
                        No subscriptions match “{query.trim()}”.
                    </Text>
                }
                contentContainerClassName="pb-30"
            />
        </SafeAreaView>
    )
}

export default Subscriptions;
