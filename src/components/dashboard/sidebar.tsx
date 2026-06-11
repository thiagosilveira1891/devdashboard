"use client";

import {
  BarChart3,
  LayoutDashboard,
  Settings,
  Sparkles,
  User,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import type { DashboardUser } from "@/lib/types";
import { cn } from "@/lib/utils";

const NAV = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard, ready: true },
  { href: "/analytics", label: "Analytics", icon: BarChart3, ready: true },
  { href: "/wrapped", label: "Wrapped", icon: Sparkles, ready: true },
  { href: "/settings", label: "Settings", icon: Settings, ready: true },
];

export function Sidebar({
  user,
  isDemo,
}: {
  user: DashboardUser;
  isDemo: boolean;
}) {
  const pathname = usePathname();
  const profileHref = user.profileSlug ? `/u/${user.profileSlug}` : null;

  return (
    <aside className="hidden md:flex w-60 shrink-0 flex-col border-r border-sidebar-border bg-sidebar min-h-screen sticky top-0 max-h-screen">
      {/* Logo */}
      <div className="flex items-center gap-2.5 px-5 h-16">
        <div className="size-7 rounded-md bg-primary/15 border border-primary/30 grid place-items-center">
          <span className="text-primary text-[11px] font-mono font-semibold">
            {"</>"}
          </span>
        </div>
        <span className="text-[15px] font-semibold tracking-tight">
          devdash
        </span>
      </div>

      {/* Navegación */}
      <nav className="flex flex-col gap-0.5 px-3 mt-2">
        {NAV.map(({ href, label, icon: Icon, ready }) => {
          const active = pathname.startsWith(href);
          return ready ? (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-2.5 rounded-md px-2.5 py-2 text-[13px] transition-colors",
                active
                  ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium"
                  : "text-muted-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
              )}
            >
              <Icon className="size-4" strokeWidth={1.75} />
              {label}
            </Link>
          ) : (
            <span
              key={href}
              className="flex items-center gap-2.5 rounded-md px-2.5 py-2 text-[13px] text-muted-foreground/50 cursor-default select-none"
            >
              <Icon className="size-4" strokeWidth={1.75} />
              {label}
              <Badge
                variant="outline"
                className="ml-auto text-[10px] px-1.5 py-0 text-muted-foreground/60 border-border"
              >
                pronto
              </Badge>
            </span>
          );
        })}

        {/* Profile — dynamic: shows link when slug is available */}
        {profileHref ? (
          <Link
            href={profileHref}
            className={cn(
              "flex items-center gap-2.5 rounded-md px-2.5 py-2 text-[13px] transition-colors",
              pathname.startsWith("/u/")
                ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium"
                : "text-muted-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
            )}
          >
            <User className="size-4" strokeWidth={1.75} />
            Profile
          </Link>
        ) : (
          <span className="flex items-center gap-2.5 rounded-md px-2.5 py-2 text-[13px] text-muted-foreground/50 cursor-default select-none">
            <User className="size-4" strokeWidth={1.75} />
            Profile
            <Badge
              variant="outline"
              className="ml-auto text-[10px] px-1.5 py-0 text-muted-foreground/60 border-border"
            >
              setup
            </Badge>
          </span>
        )}
      </nav>

      {/* Usuario */}
      <div className="mt-auto border-t border-sidebar-border px-4 py-4 flex items-center gap-2.5">
        {user.image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={user.image}
            alt=""
            className="size-8 rounded-full border border-border"
          />
        ) : (
          <div className="size-8 rounded-full bg-primary/15 border border-primary/30 grid place-items-center text-primary text-xs font-semibold">
            {user.name.charAt(0).toUpperCase()}
          </div>
        )}
        <div className="min-w-0 leading-tight">
          <p className="text-[13px] font-medium truncate">{user.name}</p>
          <p className="text-[11px] text-muted-foreground truncate">
            @{user.username}
          </p>
        </div>
        {isDemo && (
          <Badge
            variant="outline"
            className="ml-auto text-[10px] px-1.5 py-0 border-primary/40 text-primary"
          >
            demo
          </Badge>
        )}
      </div>
    </aside>
  );
}
