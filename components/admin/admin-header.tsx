"use client";

import { Bell } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { SidebarTrigger } from "@/components/ui/sidebar";

export const AdminHeader = () => {
  return (
    <header className="flex h-16 shrink-0 items-center gap-2 border-b">
      <div className="flex h-full w-full items-center gap-3 p-4 sm:gap-4">
        <SidebarTrigger className="max-md:scale-125" />
        <Separator orientation="vertical" className="h-6" />
        <div className="flex-1" />
        <Button variant="ghost" size="icon" className="relative cursor-pointer">
          <Bell className="size-5" />
          <span className="absolute right-1.5 top-1.5 size-2 rounded-full bg-xenia-amber" />
        </Button>
      </div>
    </header>
  );
};
