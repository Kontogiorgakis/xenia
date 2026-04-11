"use client";

import { Building2, ChevronsUpDown, Globe, Home, LogOut, Moon, Sun } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { signOut, useSession } from "next-auth/react";
import { useTheme } from "next-themes";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuBadge,
  SidebarRail,
  useSidebar,
} from "@/components/ui/sidebar";
import { adminNavItems } from "@/lib/admin/config";
import { Link, usePathname, useRouter } from "@/lib/i18n/navigation";

export const AdminSidebar = () => {
  const pathname = usePathname();
  const router = useRouter();
  const locale = useLocale();
  const { setOpenMobile, isMobile } = useSidebar();
  const { data: session } = useSession();
  const { theme, setTheme } = useTheme();
  const t = useTranslations("Admin.nav");

  const switchLocale = (newLocale: string) => {
    router.replace(pathname, { locale: newLocale });
  };

  const userName = session?.user?.name || "Admin User";
  const userEmail = session?.user?.email || "admin@example.com";
  const userImage = session?.user?.image;
  const userInitials = userName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <Link href="/admin" onClick={() => setOpenMobile(false)}>
                <div className="flex aspect-square size-8 shrink-0 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
                  <Building2 className="size-4" />
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-semibold">Xenia</span>
                  <span className="truncate text-xs">Host Dashboard</span>
                </div>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        {Object.entries(adminNavItems).map(([group, buttons]) => (
          <SidebarGroup key={group}>
            <SidebarGroupLabel>{t(`sections.${group.toLowerCase()}`)}</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {buttons.map((button) => {
                  const href = `/admin/${button.href}`;
                  const active =
                    pathname === href || pathname.startsWith(`${href}/`);

                  return (
                    <SidebarMenuItem key={button.href}>
                      <SidebarMenuButton
                        asChild
                        isActive={active}
                        tooltip={t(button.href)}
                      >
                        <Link href={href} onClick={() => setOpenMobile(false)}>
                          <button.icon className="size-4" />
                          <span>{t(button.href)}</span>
                        </Link>
                      </SidebarMenuButton>
                      {button.badge && (
                        <SidebarMenuBadge className="text-[10px] text-muted-foreground">
                          {button.badge === "soon" ? "Soon" : button.badge}
                        </SidebarMenuBadge>
                      )}
                    </SidebarMenuItem>
                  );
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>

      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuButton
                  size="lg"
                  className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
                >
                  <Avatar className="size-8 rounded-lg">
                    {userImage && <AvatarImage src={userImage} alt={userName} />}
                    <AvatarFallback className="rounded-lg text-xs">{userInitials}</AvatarFallback>
                  </Avatar>
                  <div className="grid flex-1 text-left text-sm leading-tight">
                    <span className="truncate font-semibold">{userName}</span>
                    <span className="truncate text-xs text-muted-foreground">{userEmail}</span>
                  </div>
                  <ChevronsUpDown className="ms-auto size-4" />
                </SidebarMenuButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
                side={isMobile ? "bottom" : "right"}
                align="end"
                sideOffset={4}
              >
                <DropdownMenuLabel className="p-0 font-normal">
                  <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                    <Avatar className="size-8 rounded-lg">
                      {userImage && <AvatarImage src={userImage} alt={userName} />}
                      <AvatarFallback className="rounded-lg text-xs">{userInitials}</AvatarFallback>
                    </Avatar>
                    <div className="grid flex-1 text-left text-sm leading-tight">
                      <span className="truncate font-semibold">{userName}</span>
                      <span className="truncate text-xs text-muted-foreground">{userEmail}</span>
                    </div>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/" onClick={() => setOpenMobile(false)}>
                    <Home className="size-4" />
                    Back to Home
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => switchLocale(locale === "en" ? "el" : "en")}
                  className="cursor-pointer"
                >
                  <Globe className="size-4" />
                  {locale === "en" ? "Ελληνικά" : "English"}
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                  className="cursor-pointer"
                >
                  {theme === "dark" ? (
                    <Sun className="size-4" />
                  ) : (
                    <Moon className="size-4" />
                  )}
                  {theme === "dark" ? "Light mode" : "Dark mode"}
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => signOut()} className="cursor-pointer">
                  <LogOut className="size-4" />
                  Sign out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  );
};
