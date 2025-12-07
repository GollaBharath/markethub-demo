import { useState } from "react";
import { Outlet, Link, useNavigate, useLocation } from "react-router-dom";
import {
	ShoppingBag,
	Menu,
	X,
	LogOut,
	ChevronLeft,
	ChevronRight,
	Home,
	Search,
	Package,
	Star,
	Bell,
	History,
	Settings,
	Bug,
	BarChart3,
	Users,
	TrendingUp,
	FileText,
	Database,
	AlertTriangle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuthStore, UserRole } from "@/store/authStore";
import { useAppStore } from "@/store/appStore";
import { cn } from "@/lib/utils";

interface NavItem {
	icon: React.ElementType;
	label: string;
	path: string;
}

const userNavItems: NavItem[] = [
	{ icon: Home, label: "Home", path: "/user/dashboard" },
	{ icon: Search, label: "Search", path: "/user/search" },
	{ icon: Star, label: "Tracklist", path: "/user/tracklist" },
	{ icon: Bell, label: "Alerts", path: "/user/alerts" },
	{ icon: Package, label: "Notifications", path: "/user/notifications" },
	{ icon: History, label: "Search History", path: "/user/history" },
	{ icon: Settings, label: "Settings", path: "/user/settings" },
	{ icon: Bug, label: "Report Issue", path: "/user/report" },
];

const sellerNavItems: NavItem[] = [
	{ icon: Home, label: "Dashboard", path: "/seller/dashboard" },
	{ icon: BarChart3, label: "Competition", path: "/seller/competition" },
	{ icon: Package, label: "Product Interests", path: "/seller/interests" },
	{ icon: TrendingUp, label: "Sales Insights", path: "/seller/insights" },
	{ icon: Star, label: "Trending", path: "/seller/trending" },
	{ icon: Settings, label: "Settings", path: "/seller/settings" },
	{ icon: Bug, label: "Report Issue", path: "/seller/report" },
];

const adminNavItems: NavItem[] = [
	{ icon: Home, label: "Dashboard", path: "/admin/dashboard" },
	{ icon: Users, label: "User Analytics", path: "/admin/users" },
	{ icon: Package, label: "Seller Analytics", path: "/admin/sellers" },
	{ icon: Database, label: "Product Analytics", path: "/admin/products" },
	{ icon: TrendingUp, label: "Sales Trends", path: "/admin/trends" },
	{ icon: AlertTriangle, label: "Reports", path: "/admin/reports" },
	{ icon: Package, label: "Product CRUD", path: "/admin/manage" },
	{ icon: Settings, label: "Settings", path: "/admin/settings" },
];

export function DashboardLayout() {
	const navigate = useNavigate();
	const location = useLocation();
	const { activeRole, activeUserData, logout } = useAuthStore();
	const { sidebarOpen, setSidebarOpen } = useAppStore();
	const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

	const navItems =
		activeRole === "admin"
			? adminNavItems
			: activeRole === "seller"
			? sellerNavItems
			: userNavItems;

	const handleLogout = () => {
		logout();
		navigate("/");
	};

	const roleColors = {
		user: "from-primary to-primary/80",
		seller: "from-accent to-accent/80",
		admin: "from-destructive to-destructive/80",
	};

	return (
		<div className="min-h-screen bg-background flex">
			{/* Desktop Sidebar */}
			<aside
				className={cn(
					"hidden lg:flex flex-col bg-sidebar border-r border-sidebar-border transition-all duration-300",
					sidebarOpen ? "w-64" : "w-20"
				)}>
				{/* Logo */}
				<div className="h-16 flex items-center justify-between px-4 border-b border-sidebar-border">
					{sidebarOpen && (
						<Link to="/" className="flex items-center gap-2">
							<div
								className={cn(
									"w-9 h-9 rounded-xl bg-gradient-to-br flex items-center justify-center",
									roleColors[activeRole || "user"]
								)}>
								<ShoppingBag className="w-5 h-5 text-primary-foreground" />
							</div>
							<span className="font-display font-bold text-sidebar-foreground">
								MarketHub
							</span>
						</Link>
					)}
					<Button
						variant="ghost"
						size="icon"
						onClick={() => setSidebarOpen(!sidebarOpen)}
						className="text-sidebar-foreground">
						{sidebarOpen ? (
							<ChevronLeft className="w-4 h-4" />
						) : (
							<ChevronRight className="w-4 h-4" />
						)}
					</Button>
				</div>

				{/* Nav Items */}
				<nav className="flex-1 p-4 space-y-2 overflow-y-auto">
					{navItems.map((item) => {
						const isActive = location.pathname === item.path;
						return (
							<Link
								key={item.path}
								to={item.path}
								className={cn(
									"flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200",
									isActive
										? "bg-sidebar-primary text-sidebar-primary-foreground shadow-sm"
										: "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
									!sidebarOpen && "justify-center"
								)}>
								<item.icon className="w-5 h-5 shrink-0" />
								{sidebarOpen && (
									<span className="font-medium">{item.label}</span>
								)}
							</Link>
						);
					})}
				</nav>

				{/* User Info */}
				<div className="p-4 border-t border-sidebar-border">
					<div
						className={cn(
							"flex items-center gap-3",
							!sidebarOpen && "justify-center"
						)}>
						<Avatar className="w-10 h-10">
							<AvatarImage src={activeUserData?.avatar} />
							<AvatarFallback className="bg-sidebar-accent text-sidebar-accent-foreground">
								{activeUserData?.name?.charAt(0) || "U"}
							</AvatarFallback>
						</Avatar>
						{sidebarOpen && (
							<div className="flex-1 min-w-0">
								<p className="font-medium text-sm text-sidebar-foreground truncate">
									{activeUserData?.name || "User"}
								</p>
								<p className="text-xs text-sidebar-foreground/60 capitalize">
									{activeRole}
								</p>
							</div>
						)}
						{sidebarOpen && (
							<Button
								variant="ghost"
								size="icon"
								onClick={handleLogout}
								className="text-sidebar-foreground">
								<LogOut className="w-4 h-4" />
							</Button>
						)}
					</div>
				</div>
			</aside>

			{/* Mobile Sidebar */}
			{mobileMenuOpen && (
				<div className="fixed inset-0 z-50 lg:hidden">
					<div
						className="fixed inset-0 bg-background/80 backdrop-blur-sm"
						onClick={() => setMobileMenuOpen(false)}
					/>
					<aside className="fixed left-0 top-0 bottom-0 w-72 bg-sidebar border-r border-sidebar-border animate-slide-up">
						<div className="h-16 flex items-center justify-between px-4 border-b border-sidebar-border">
							<Link to="/" className="flex items-center gap-2">
								<div
									className={cn(
										"w-9 h-9 rounded-xl bg-gradient-to-br flex items-center justify-center",
										roleColors[activeRole || "user"]
									)}>
									<ShoppingBag className="w-5 h-5 text-primary-foreground" />
								</div>
								<span className="font-display font-bold text-sidebar-foreground">
									MarketHub
								</span>
							</Link>
							<Button
								variant="ghost"
								size="icon"
								onClick={() => setMobileMenuOpen(false)}>
								<X className="w-5 h-5" />
							</Button>
						</div>
						<nav className="p-4 space-y-2">
							{navItems.map((item) => {
								const isActive = location.pathname === item.path;
								return (
									<Link
										key={item.path}
										to={item.path}
										onClick={() => setMobileMenuOpen(false)}
										className={cn(
											"flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200",
											isActive
												? "bg-sidebar-primary text-sidebar-primary-foreground"
												: "text-sidebar-foreground hover:bg-sidebar-accent"
										)}>
										<item.icon className="w-5 h-5" />
										<span className="font-medium">{item.label}</span>
									</Link>
								);
							})}
						</nav>
						<div className="absolute bottom-0 left-0 right-0 p-4 border-t border-sidebar-border">
							<Button
								variant="outline"
								className="w-full"
								onClick={handleLogout}>
								<LogOut className="w-4 h-4 mr-2" />
								Logout
							</Button>
						</div>
					</aside>
				</div>
			)}

			{/* Main Content */}
			<div className="flex-1 flex flex-col min-w-0">
				{/* Top Bar */}
				<header className="h-16 bg-background/80 backdrop-blur-xl border-b border-border flex items-center px-4 lg:px-6">
					<Button
						variant="ghost"
						size="icon"
						className="lg:hidden mr-2"
						onClick={() => setMobileMenuOpen(true)}>
						<Menu className="w-5 h-5" />
					</Button>

					<div className="flex-1" />

					<div className="flex items-center gap-4">
						<span className="text-sm text-muted-foreground hidden sm:inline">
							Welcome back,{" "}
							<span className="font-medium text-foreground">
								{activeUserData?.name}
							</span>
						</span>
					</div>
				</header>

				{/* Page Content */}
				<main className="flex-1 overflow-auto p-4 lg:p-6">
					<Outlet />
				</main>
			</div>
		</div>
	);
}
