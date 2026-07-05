import type { BrandIconId } from "./brand-icons";
import { PROFILE } from "./profile";

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
    url: PROFILE.githubUrl,
    brandColor: "#333",
  },
  {
    id: "linkedin",
    name: "LinkedIn",
    url: PROFILE.linkedinUrl,
    brandColor: "#0A66C2",
  },
  {
    id: "email",
    name: "Email",
    url: `mailto:${PROFILE.email}`,
    brandColor: "#EA4335",
  },
] as const;
