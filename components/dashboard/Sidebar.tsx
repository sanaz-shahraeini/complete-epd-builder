"use client";

import { useEffect, useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  LayoutDashboard,
  FileText,
  Settings,
  Search,
  MessageSquare,
  LogOut,
  Menu,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTranslations } from "next-intl";
import Image from "next/image";
import { useUserStore } from "@/lib/store/user";
import { getUserProfile, UserProfile } from "@/lib/api/auth";
import { ROUTES } from "@/i18n/navigation";

interface User extends UserProfile {
  profile?: {
    created_at?: string;
    bio?: string;
    profile_picture?: string;
    profile_picture_url?: string;
  };
}

const getNavigationItems = (t: (key: string) => string) => [
  {
    name: t("dashboard.portfolio"),
    href: "/product-portfolio",
    icon: LayoutDashboard,
  },
  {
    name: t("dashboard.projects"),
    href: ROUTES.DASHBOARD_ROUTES.PROJECTS,
    icon: FileText,
  },
  {
    name: t("dashboard.admin"),
    href: ROUTES.DASHBOARD_ROUTES.ADMIN,
    icon: Settings,
  },
  {
    name: t("dashboard.epd"),
    href: ROUTES.DASHBOARD_ROUTES.EPD,
    icon: Search,
  },
  {
    name: t("dashboard.requests"),
    href: ROUTES.DASHBOARD_ROUTES.REQUESTS,
    icon: MessageSquare,
    badge: 2,
  },
];

interface SidebarProps {}

const Sidebar: React.FC<SidebarProps> = () => {
  const pathname = usePathname();
  const t = useTranslations("navigation");
  const navigation = getNavigationItems(t);
  const { user, setUser } = useUserStore();
  const [imageErrors, setImageErrors] = useState<Record<string, boolean>>({});

  const handleImageError = (userId: number) => {
    setImageErrors((prev) => ({
      ...prev,
      [userId]: true,
    }));
  };

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const userProfile = await getUserProfile();

        if (userProfile) {
          let profilePictureUrl =
            userProfile.profile?.profile_picture_url ||
            userProfile.profile?.profile_picture ||
            "";

          // Ensure the URL is absolute
          if (
            profilePictureUrl &&
            !profilePictureUrl.match(/^(http|https):\/\//)
          ) {
            const baseUrl =
              process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "") || "";
            profilePictureUrl = `${baseUrl}${
              profilePictureUrl.startsWith("/") ? "" : "/"
            }${profilePictureUrl}`;
          }

          const userData = {
            ...userProfile,
            profile_picture_url: profilePictureUrl,
          };
          setUser(userData);
        }
      } catch (error) {
        console.error("Error fetching user profile in sidebar:", error);
      }
    };

    fetchUserData();
  }, [setUser]);

  return (
    <div className="flex flex-col h-full bg-white border-r w-64 py-6 overflow-x-hidden">
      <div className="px-4 mb-8">
        <Image
          src="/assets/images/ipsum-logo.svg"
          alt="logo"
          width={120}
          height={55}
          priority
          className="w-auto h-auto"
        />
      </div>

      <div className="px-4 mb-6">
        <div className="flex items-center gap-3">
          <Avatar className="h-8 w-8">
            {user?.profile_picture_url && !imageErrors[user?.id || 0] ? (
              <AvatarImage
                src={user.profile_picture_url}
                alt={user?.username || "User"}
                className="object-cover"
                onError={() => user?.id && handleImageError(user.id)}
              />
            ) : (
              <AvatarFallback className="bg-gray-100">
                {user?.first_name?.[0] || user?.username?.[0] || "U"}
              </AvatarFallback>
            )}
          </Avatar>
          <div className="flex flex-col overflow-hidden">
            <span className="text-[14px] font-normal text-gray-900 truncate">
              {user?.username || t("userName")}
            </span>
            <span className="text-[12px] text-gray-500 truncate">
              {user?.company_name || t("companyName")}
            </span>
          </div>
        </div>
      </div>

      <nav className="flex-1 px-3 overflow-y-auto">
        {navigation.map((item) => {
          const isActive = (() => {
            const exactMatches = {
              "/product-portfolio": pathname === "/product-portfolio",
              [ROUTES.DASHBOARD_ROUTES.PROJECTS]:
                pathname === "/en/dashboard/projects",
              [ROUTES.DASHBOARD_ROUTES.ADMIN]:
                pathname === "/en/dashboard/admin",
              [ROUTES.DASHBOARD_ROUTES.EPD]: pathname === "/en/dashboard/epd",
              [ROUTES.DASHBOARD_ROUTES.REQUESTS]:
                pathname === "/en/dashboard/requests",
            };

            const nestedMatches = {
              "/product-portfolio": pathname && pathname.startsWith("/product-portfolio"),
              [ROUTES.DASHBOARD_ROUTES.PROJECTS]: pathname && pathname.startsWith("/en/dashboard/projects"),
              [ROUTES.DASHBOARD_ROUTES.ADMIN]: pathname && (pathname === "/en/dashboard/admin" || pathname?.startsWith("/en/dashboard/profile")),
              [ROUTES.DASHBOARD_ROUTES.EPD]: pathname && (pathname === "/en/dashboard/epd" || pathname?.startsWith("/en/dashboard/epd/")),
              [ROUTES.DASHBOARD_ROUTES.REQUESTS]: pathname && pathname.startsWith("/en/dashboard/requests"),
            };

            if (
              pathname && pathname.startsWith("/en/dashboard/epd") ||
              pathname && pathname.startsWith("/en/dashboard/inbox")
            ) {
              return item.href === ROUTES.DASHBOARD_ROUTES.ADMIN;
            }

            return exactMatches[item.href as keyof typeof exactMatches] || nestedMatches[item.href as keyof typeof nestedMatches] || false;
          })();

          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2 text-sm rounded-md mb-1 relative w-full ${
                isActive
                  ? "text-[#00A499] bg-[#E6F6F5] font-semibold border-l-4 border-[#00A499]"
                  : "text-gray-700 hover:bg-gray-100"
              }`}
            >
              <item.icon
                className={`h-5 w-5 ${isActive ? "text-[#00A499]" : ""}`}
              />
              <span className="truncate">{item.name}</span>
              {item.badge && (
                <span className="absolute right-3 bg-[#8CC63F] text-white text-xs px-1.5 py-0.5 rounded-full">
                  {item.badge}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      <div className="px-3 mt-auto">
        <Link
          href="api/auth/signout"
          className="flex items-center gap-3 px-3 py-2 text-sm text-gray-700 rounded-md hover:bg-gray-100 w-full"
        >
          <LogOut className="h-5 w-5" />
          <span>{t("logout")}</span>
        </Link>
      </div>
    </div>
  );
};

export { Sidebar };
