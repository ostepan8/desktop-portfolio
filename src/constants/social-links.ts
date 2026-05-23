import type { BrandIconId } from "./brand-icons";

/**
 * Owen's own social profile URLs. Single source of truth so AboutMe and
 * any future bio/footer surfaces stop hardcoding `https://github.com/ostepan`
 * etc. Update here when handles change.
 */
export interface SocialLink {
  readonly id: BrandIconId;
  readonly name: string;
  readonly url: string;
  readonly brandColor: string;
}

export const SOCIAL_LINKS: readonly SocialLink[] = [
  {
    id: "github",
    name: "GitHub",
    url: "https://github.com/ostepan",
    brandColor: "#333",
  },
  {
    id: "linkedin",
    name: "LinkedIn",
    url: "https://linkedin.com/in/ostepan",
    brandColor: "#0A66C2",
  },
  {
    id: "twitter",
    name: "Twitter",
    url: "https://x.com/ostepan",
    brandColor: "#1DA1F2",
  },
  {
    id: "email",
    name: "Email",
    url: "mailto:oleg@owen-stepan.com",
    brandColor: "#EA4335",
  },
] as const;
