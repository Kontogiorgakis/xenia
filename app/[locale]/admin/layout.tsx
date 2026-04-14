import { getServerSession } from "next-auth";
import { setRequestLocale } from "next-intl/server";

import { AdminHeader } from "@/components/admin/admin-header";
import { AdminSidebar } from "@/components/admin/admin-sidebar";
import { ErrorPage } from "@/components/error-page";
import { ScrollArea } from "@/components/ui/scroll-area";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { authOptions } from "@/lib/auth/auth";
import { getInboxCounts } from "@/server_actions/inquiries";
import { BaseLayoutProps } from "@/types/page-props";

const AdminLayout = async ({ children, params }: BaseLayoutProps) => {
  const { locale } = await params;
  setRequestLocale(locale);

  const session = await getServerSession(authOptions);
  if (!session) {
    return (
      <ErrorPage
        title="Access Denied"
        description="You are not authorized to access the admin panel. Please sign in with an admin account."
      />
    );
  }

  // Defensive: don't let the badge fetch break the whole admin shell.
  let inboxUnreadCount = 0;
  try {
    const { counts } = await getInboxCounts();
    inboxUnreadCount = counts.unread;
  } catch (error) {
    console.error("Failed to load inbox unread count:", error);
  }

  return (
    <SidebarProvider className="admin-shell">
      <AdminSidebar inboxUnreadCount={inboxUnreadCount} />
      <SidebarInset className="h-svh max-h-svh overflow-hidden">
        <AdminHeader />
        <ScrollArea className="h-0 flex-1">
          <main className="mx-auto max-w-screen-2xl px-4 py-6">
            {children}
          </main>
        </ScrollArea>
      </SidebarInset>
    </SidebarProvider>
  );
};

export default AdminLayout;
