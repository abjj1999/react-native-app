import {View, Text, StyleSheet} from 'react-native';
import React from 'react';
import {Link} from "expo-router";

const SignUp = () => {
    return (
        <View>
            <Text className="text-xl font-bold text-success">
                Sign up
            </Text>
            <Link href="/(auth)/sign-in">Sign In</Link>
        </View>
    )
}

export default SignUp;