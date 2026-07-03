import {View, Text} from 'react-native'
import React from "react";
import {SafeAreaView as RNSaveAreaView} from "react-native-safe-area-context";
import {styled} from "nativewind";

const SafeAreaView = styled(RNSaveAreaView);

const Insights = () => {
    return (
        <SafeAreaView className='flex-1 bg-background p-5'>
            <Text>
                Insights
            </Text>
        </SafeAreaView>
    )
}

export default Insights;