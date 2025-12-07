import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import type { FutureConfig } from "react-router-dom";

// Layouts
import { PublicLayout } from "@/components/layouts/PublicLayout";
import { DashboardLayout } from "@/components/layouts/DashboardLayout";

// Public Pages
import Landing from "@/pages/Landing";
import NotFound from "@/pages/NotFound";

// Auth Pages
import UserLogin from "@/pages/auth/UserLogin";
import UserRegister from "@/pages/auth/UserRegister";
import SellerLogin from "@/pages/auth/SellerLogin";
import SellerRegister from "@/pages/auth/SellerRegister";
import AdminLogin from "@/pages/auth/AdminLogin";

// User Pages
import UserDashboard from "@/pages/user/UserDashboard";
import UserSearch from "@/pages/user/UserSearch";
import ProductView from "@/pages/user/ProductView";
import UserTracklist from "@/pages/user/UserTracklist";
import UserAlerts from "@/pages/user/UserAlerts";
import UserNotifications from "@/pages/user/UserNotifications";
import UserHistory from "@/pages/user/UserHistory";
import UserSettings from "@/pages/user/UserSettings";
import UserReport from "@/pages/user/UserReport";

// Seller Pages
import SellerDashboard from "@/pages/seller/SellerDashboard";
import SellerCompetition from "@/pages/seller/SellerCompetition";
import SellerInterests from "@/pages/seller/SellerInterests";
import SellerInsights from "@/pages/seller/SellerInsights";
import SellerTrending from "@/pages/seller/SellerTrending";
import SellerSettings from "@/pages/seller/SellerSettings";
import SellerReport from "@/pages/seller/SellerReport";

// Admin Pages
import AdminDashboard from "@/pages/admin/AdminDashboard";
import AdminUsers from "@/pages/admin/AdminUsers";
import AdminSellers from "@/pages/admin/AdminSellers";
import AdminProducts from "@/pages/admin/AdminProducts";
import AdminTrends from "@/pages/admin/AdminTrends";
import AdminLogs from "@/pages/admin/AdminLogs";
import AdminManage from "@/pages/admin/AdminManage";
import AdminReports from "@/pages/admin/AdminReports";
import AdminSettings from "@/pages/admin/AdminSettings";

const queryClient = new QueryClient();

const futureConfig = {
	v7_startTransition: true,
	v7_relativeSplatPath: true,
};

const App = () => (
	<QueryClientProvider client={queryClient}>
		<TooltipProvider>
			<Toaster />
			<Sonner />
			<BrowserRouter future={futureConfig}>
				<Routes>
					{/* Public Routes */}
					<Route element={<PublicLayout />}>
						<Route path="/" element={<Landing />} />
					</Route>
					{/* Auth Routes */}
					<Route path="/login/user" element={<UserLogin />} />
					<Route path="/register/user" element={<UserRegister />} />
					<Route path="/login/seller" element={<SellerLogin />} />
					<Route path="/register/seller" element={<SellerRegister />} />
					<Route path="/login/admin" element={<AdminLogin />} />
					{/* User Routes */}
					<Route element={<DashboardLayout />}>
						<Route path="/user/dashboard" element={<UserDashboard />} />
						<Route path="/user/search" element={<UserSearch />} />
						<Route path="/user/product/:productId" element={<ProductView />} />
						<Route path="/user/tracklist" element={<UserTracklist />} />
						<Route path="/user/alerts" element={<UserAlerts />} />
						<Route path="/user/notifications" element={<UserNotifications />} />
						<Route path="/user/history" element={<UserHistory />} />
						<Route path="/user/settings" element={<UserSettings />} />
						<Route path="/user/report" element={<UserReport />} />
					</Route>
					{/* Seller Routes */}
					<Route element={<DashboardLayout />}>
						<Route path="/seller/dashboard" element={<SellerDashboard />} />
						<Route path="/seller/competition" element={<SellerCompetition />} />
						<Route path="/seller/interests" element={<SellerInterests />} />
						<Route path="/seller/insights" element={<SellerInsights />} />
						<Route path="/seller/trending" element={<SellerTrending />} />
						<Route path="/seller/settings" element={<SellerSettings />} />
						<Route path="/seller/report" element={<SellerReport />} />
					</Route>
					{/* Admin Routes */}
					<Route element={<DashboardLayout />}>
						<Route path="/admin/dashboard" element={<AdminDashboard />} />
						<Route path="/admin/users" element={<AdminUsers />} />
						<Route path="/admin/sellers" element={<AdminSellers />} />
						<Route path="/admin/products" element={<AdminProducts />} />
						<Route path="/admin/trends" element={<AdminTrends />} />
						<Route path="/admin/logs" element={<AdminLogs />} />
						<Route path="/admin/reports" element={<AdminReports />} />
						<Route path="/admin/manage" element={<AdminManage />} />
						<Route path="/admin/settings" element={<AdminSettings />} />
					</Route>{" "}
					<Route path="*" element={<NotFound />} />
				</Routes>
			</BrowserRouter>
		</TooltipProvider>
	</QueryClientProvider>
);

export default App;
