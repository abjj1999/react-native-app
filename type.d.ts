import type { ImageSourcePropType } from "react-native";

declare global {
    interface AppTab {
        name: string;
        title: string;
        icon: ImageSourcePropType;
    }

    interface TabIconProps {
        focused: boolean;
        icon: ImageSourcePropType;
    }

    interface Subscription {
        id: string;
        icon: ImageSourcePropType;
        name: string;
        plan?: string;
        category?: string;
        paymentMethod?: string;
        status?: string;
        startDate?: string;
        price: number;
        currency?: string;
        billing: string;
        frequency?: string;
        renewalDate?: string;
        color?: string;
    }

    interface SubscriptionCardProps extends Omit<Subscription, "id"> {
        expanded: boolean;
        onPress: () => void;
        onCancelPress?: () => void;
        isCancelling?: boolean;
    }

    interface UpcomingSubscription {
        id: string;
        icon: ImageSourcePropType;
        name: string;
        price: number;
        currency?: string;
        daysLeft: number;
    }

    interface UpcomingSubscriptionCardProps
        extends Omit<UpcomingSubscription, "id"> {}

    interface ListHeadingProps {
        title: string;
    }

    interface AuthTextFieldProps {
        label: string;
        value: string;
        onChangeText: (value: string) => void;
        error?: string | null;
        placeholder?: string;
        secureTextEntry?: boolean;
        keyboardType?: import("react-native").KeyboardTypeOptions;
        autoCapitalize?: "none" | "sentences" | "words" | "characters";
        autoComplete?: import("react-native").TextInputProps["autoComplete"];
        textContentType?: import("react-native").TextInputProps["textContentType"];
        editable?: boolean;
    }

    interface AuthButtonProps {
        title: string;
        onPress: () => void;
        disabled?: boolean;
        loading?: boolean;
        variant?: "primary" | "secondary";
    }

    interface AuthBrandHeaderProps {
        title: string;
        subtitle: string;
    }
}

export {};