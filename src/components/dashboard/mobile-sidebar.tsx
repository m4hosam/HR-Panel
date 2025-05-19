"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Menu, LayoutDashboard, Users, Settings, LogOut, Folders, CheckSquare } from "lucide-react";
import { SidebarNavItem } from "./sidebar";
import { signOut } from "next-auth/react";

export function MobileSidebar() {
  const [open, setOpen] = useState(false);

  return (
    <Sheet
      open={open}
      onOpenChange={setOpen}
    >
      <SheetTrigger asChild>
        <Button
          variant="outline"
          size="icon"
          className="lg:hidden"
        >
          <Menu className="h-5 w-5" />
          <span className="sr-only">Toggle Menu</span>
        </Button>
      </SheetTrigger>{" "}
      <SheetContent
        side="left"
        className="p-0 w-[300px]"
      >
        <SheetHeader className="sr-only">
          <SheetTitle>Navigation Menu</SheetTitle>
        </SheetHeader>
        <div className="h-full flex w-full">
          {/* Override the hidden class from DashboardSidebar to make it visible on mobile */}
          <div className="w-full flex-1">
            <div className="flex h-full max-h-screen flex-col">
              <div className="flex-1 overflow-auto py-2">
                <div className="flex flex-col gap-2 p-4">
                  <SidebarNavItem
                    href="/dashboard"
                    icon={<LayoutDashboard className="h-4 w-4" />}
                    title="Overview"
                  />
                  <SidebarNavItem
                    href="/dashboard/employees"
                    icon={<Users className="h-4 w-4" />}
                    title="Employees"
                  />
                  <SidebarNavItem
                    href="/dashboard/projects"
                    icon={<Folders className="h-4 w-4" />}
                    title="Projects"
                  />
                  <SidebarNavItem
                    href="/dashboard/tasks"
                    icon={<CheckSquare className="h-4 w-4" />}
                    title="Tasks"
                  />
                  <div className="mt-4 text-xs font-medium uppercase text-muted-foreground">Settings</div>
                  <SidebarNavItem
                    href="/dashboard/settings"
                    icon={<Settings className="h-4 w-4" />}
                    title="Settings"
                  />
                </div>
              </div>
              <div className="border-t p-4">
                <Button
                  variant="outline"
                  className="w-full justify-start gap-2"
                  onClick={() => signOut({ callbackUrl: "/" })}
                >
                  <LogOut className="h-4 w-4" />
                  Sign out
                </Button>
              </div>
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
