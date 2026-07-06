import { icons } from "@/constants/icons";
import FontAwesome6 from "@expo/vector-icons/FontAwesome6";
import type { ImageSourcePropType } from "react-native";

interface ResolvedSubscriptionIcon {
  image: ImageSourcePropType;
  brandIcon?: string;
}

const LOCAL_BRAND_ICONS: Record<string, ImageSourcePropType> = {
  spotify: icons.spotify,
  notion: icons.notion,
  figma: icons.figma,
  github: icons.github,
  adobe: icons.adobe,
  canva: icons.canva,
  claude: icons.claude,
  openai: icons.openai,
  chatgpt: icons.openai,
  dropbox: icons.dropbox,
  medium: icons.medium,
  netflix: icons.netflix,
};

export const resolveSubscriptionIcon = (
  name: string,
): ResolvedSubscriptionIcon => {
  const words = name.trim().toLowerCase().split(/\s+/).filter(Boolean);
  // "Adobe Creative Cloud" -> ["adobe-creative-cloud", "adobecreativecloud", "adobe", ...]
  const candidates = [words.join("-"), words.join(""), ...words];

  for (const candidate of candidates) {
    if (LOCAL_BRAND_ICONS[candidate]) {
      return { image: LOCAL_BRAND_ICONS[candidate] };
    }
  }

  for (const candidate of candidates) {
    if (FontAwesome6.hasIcon(candidate, "brand")) {
      return { image: icons.wallet, brandIcon: candidate };
    }
  }

  return { image: icons.wallet };
};
