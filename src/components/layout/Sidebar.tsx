import { LayoutDashboard, Receipt, TrendingUp, Wallet, Tag, Settings, FileText } from "lucide-react";
import { cn } from "@/lib/utils";
import { NavLink } from "react-router-dom";

const navItems = [
  { icon: LayoutDashboard, label: "Дашборд", path: "/" },
  { icon: Receipt, label: "Транзакции", path: "/transactions" },
  { icon: Wallet, label: "Счета", path: "/accounts" },
  { icon: Tag, label: "Категории", path: "/categories" },
  { icon: TrendingUp, label: "Бюджеты", path: "/budgets" },
  { icon: FileText, label: "Отчёты", path: "/reports" },
  { icon: Settings, label: "Настройки", path: "/settings" },
];

export const Sidebar = () => {
  return (
    <aside className="fixed left-0 top-16 z-40 h-[calc(100vh-4rem)] w-64 border-r border-border bg-card">
      <nav className="flex h-full flex-col gap-1 p-4">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            end={item.path === "/"}
            className={({ isActive }) =>
              cn(
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all hover:bg-accent hover:text-accent-foreground",
                isActive
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-muted-foreground"
              )
            }
          >
            <item.icon className="h-5 w-5" />
            {item.label}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
};
