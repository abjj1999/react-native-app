import {View, Text, StyleSheet} from 'react-native';
import React from 'react';
import {Link} from "expo-router";

const SignIn = () => {
    return (
        <View>
            <Text className="text-xl font-bold text-success">
                Sign in
            </Text>
            <Link href="/(auth)/sign-up">Create an Account</Link>
        </View>
    )
}

export default SignIn;