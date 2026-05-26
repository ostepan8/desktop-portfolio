"use client";

import { SidebarItem } from "@/components/ui/SidebarItem";

const FINDER_TAGS = [
  { color: "#ff3b30", name: "Red" },
  { color: "#ff9500", name: "Orange" },
  { color: "#34c759", name: "Green" },
  { color: "#007aff", name: "Blue" },
  { color: "#af52de", name: "Purple" },
] as const;

function SidebarSection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <>
      <div className="mt-4 first:mt-0 px-4 py-1.5 text-[11px] text-white/40 uppercase tracking-wider font-semibold">
        {title}
      </div>
      <div className="px-2 space-y-0.5">{children}</div>
    </>
  );
}

export interface FinderFavorite {
  id: string | null;
  sidebarKey: string;
  name: string;
  icon: string;
}

interface FinderSidebarProps {
  activeSidebarItem: string | null;
  searchQuery: string;
  favorites: ReadonlyArray<FinderFavorite>;
  onPickFavorite: (favorite: FinderFavorite) => void;
  onPickMacintoshHD: () => void;
}

export function FinderSidebar({
  activeSidebarItem,
  searchQuery,
  favorites,
  onPickFavorite,
  onPickMacintoshHD,
}: FinderSidebarProps) {
  return (
    <aside className="w-52 bg-[#1e1e1e]/50 backdrop-blur-xl border-r border-white/5 flex flex-col py-2">
      <SidebarSection title="Favorites">
        {favorites.map((fav) => (
          <SidebarItem
            key={fav.sidebarKey}
            icon={fav.icon}
            label={fav.name}
            active={activeSidebarItem === fav.sidebarKey && !searchQuery}
            onClick={() => onPickFavorite(fav)}
          />
        ))}
      </SidebarSection>

      <SidebarSection title="Locations">
        <SidebarItem
          icon="💻"
          label="Macintosh HD"
          active={activeSidebarItem === "macintosh-hd" && !searchQuery}
          onClick={onPickMacintoshHD}
        />
      </SidebarSection>

      <SidebarSection title="Tags">
        {FINDER_TAGS.map((tag) => (
          <SidebarItem
            key={tag.name}
            variant="subtle"
            icon={
              <span
                className="inline-block w-3 h-3 rounded-full"
                style={{ backgroundColor: tag.color }}
              />
            }
            label={tag.name}
          />
        ))}
      </SidebarSection>
    </aside>
  );
}
