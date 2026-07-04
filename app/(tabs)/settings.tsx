import {Text, Pressable, View, Image, ScrollView} from 'react-native'
import React from "react";
import {SafeAreaView as RNSaveAreaView} from "react-native-safe-area-context";
import {styled} from "nativewind";
import {useClerk, useUser} from "@clerk/expo";
import images from "@/constants/images";
import dayjs from "dayjs";

const SafeAreaView = styled(RNSaveAreaView);

const formatDate = (value?: Date | null) =>
    value ? dayjs(value).format("MM/DD/YYYY") : "Not available";

const Settings = () => {
    const {signOut} = useClerk();
    const {user} = useUser();

    const primaryEmail = user?.primaryEmailAddress;
    const displayName = user?.fullName ?? user?.username ?? "Budget user";

    const accountDetails = [
        {label: "Email", value: primaryEmail?.emailAddress ?? "Not available"},
        {
            label: "Email status",
            value:
                primaryEmail?.verification?.status === "verified"
                    ? "Verified"
                    : "Unverified",
        },
        {label: "Member since", value: formatDate(user?.createdAt)},
        {label: "Last sign in", value: formatDate(user?.lastSignInAt)},
        {
            label: "Two-step verification",
            value: user?.twoFactorEnabled ? "Enabled" : "Off",
        },
    ];

    return (
        <SafeAreaView className='flex-1 bg-background p-5'>
            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerClassName="pb-30"
            >
                <Text className="list-title">
                    Settings
                </Text>

                <View className="mt-5 items-center rounded-3xl border border-border bg-card p-6">
                    <Image
                        source={user?.imageUrl ? {uri: user.imageUrl} : images.avatar}
                        className="home-avatar"
                    />
                    <Text className="mt-3 text-2xl font-sans-bold text-primary">
                        {displayName}
                    </Text>
                    <Text className="mt-1 text-sm font-sans-medium text-muted-foreground">
                        {primaryEmail?.emailAddress ?? "…"}
                    </Text>
                </View>

                <View className="mt-5 rounded-3xl border border-border bg-card p-5">
                    <Text className="mb-4 text-lg font-sans-bold text-primary">
                        Account
                    </Text>
                    <View className="gap-5">
                        {accountDetails.map((detail) => (
                            <View key={detail.label} className="sub-row">
                                <Text className="sub-label">{detail.label}</Text>
                                <Text className="shrink text-right font-sans-bold text-primary">
                                    {detail.value}
                                </Text>
                            </View>
                        ))}
                    </View>
                </View>

                <Pressable className="sub-cancel mt-6" onPress={() => signOut()}>
                    <Text className="sub-cancel-text">Sign out</Text>
                </Pressable>
            </ScrollView>
        </SafeAreaView>
    )
}

export default Settings;
