import {
  Building2,
  CalendarDays,
  ClipboardList,
  LayoutDashboard,
  LucideIcon,
  MessageSquare,
  Settings,
  Users,
} from "lucide-react";

interface AdminNavItem {
  label: string;
  href: string;
  icon: LucideIcon;
  badge?: string;
}

export const adminNavItems: Record<string, AdminNavItem[]> = {
  Main: [
    { label: "Dashboard", href: "dashboard", icon: LayoutDashboard },
    { label: "Calendar", href: "calendar", icon: CalendarDays },
    { label: "Properties", href: "properties", icon: Building2 },
    { label: "Reservations", href: "reservations", icon: ClipboardList },
  ],
  Communication: [
    { label: "Inbox", href: "inbox", icon: MessageSquare, badge: "soon" },
  ],
  Guests: [{ label: "Guests", href: "guests", icon: Users }],
  Account: [{ label: "Settings", href: "settings", icon: Settings }],
};
