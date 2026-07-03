import {View, Text} from 'react-native'
import React from "react";
import {Link, useLocalSearchParams} from "expo-router";

const SubscriptionDetails = () => {
    const {id} = useLocalSearchParams<{ id: string }>()
    return (
        <View className="flex justify-center items-center px-5 py-5 pt-28 pb-5">
            <Text>
                SubscriptionDetails : {id}
            </Text>
            <Link href='/'>go back</Link>
        </View>
    )
}

export default SubscriptionDetails;