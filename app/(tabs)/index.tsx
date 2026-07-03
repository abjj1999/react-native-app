import "@/global.css"
import { Text, View } from "react-native";
import {Link} from "expo-router";
import {SafeAreaView as RNSaveAreaView} from "react-native-safe-area-context";
import {styled} from "nativewind";

const SafeAreaView = styled(RNSaveAreaView);

export default function App() {
    return (
        <SafeAreaView className="flex-1 bg-background p-5">
            <Text className="text-xl font-bold text-success">
                Welcome to Nativewind!
            </Text>
            <Link href="/onboarding" className="mt-4 rounded bg-primary text-white">
                Go to Onboarding
            </Link>
            <Link href="/(auth)/sign-in" className="mt-4 rounded bg-primary text-white">
                Go to Sign in
            </Link>
            <Link href="/(auth)/sign-up" className="mt-4 rounded bg-primary text-white">
                Go to sign up
            </Link>
            <Link href="/subscriptions/1" className="mt-4 rounded bg-primary text-white">
                Go to sign up
            </Link>
        </SafeAreaView>
    );
}