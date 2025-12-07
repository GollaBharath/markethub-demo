import { Link } from "react-router-dom";
import {
	TrendingDown,
	Star,
	Bell,
	Package,
	Sparkles,
	ChevronRight,
	Eye,
	Clock,
	ArrowRight,
	Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { StatCard } from "@/components/common/StatCard";
import { ProductCard } from "@/components/common/ProductCard";
import { FloatingTicker } from "@/components/common/FloatingTicker";
import { useAuthStore } from "@/store/authStore";
import { useAppStore } from "@/store/appStore";
import { useDeals } from "@/hooks/use-deals";

export default function UserDashboard() {
	const { activeUserData } = useAuthStore();
	const { alerts, tracklist, notifications } = useAppStore();

	const { products: trendingProducts, loading: loadingTrending } = useDeals(4);
	const { products: recentProducts, loading: loadingRecent } = useDeals(4);
	const unreadNotifications = notifications.filter((n) => !n.read).length;

	return (
		<div className="space-y-6 animate-fade-in">
			{/* Welcome Section */}
			<div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
				<div>
					<h1 className="text-3xl font-display font-bold text-foreground">
						Welcome back, {activeUserData?.name?.split(" ")[0]}! 👋
					</h1>
					<p className="text-muted-foreground mt-1">
						Here's what's happening with your price tracking today.
					</p>
				</div>
				<Button asChild>
					<Link to="/user/search">
						Search Products
						<ArrowRight className="w-4 h-4 ml-2" />
					</Link>
				</Button>
			</div>

			{/* Floating Deal Ticker */}
			<FloatingTicker className="rounded-xl" />

			{/* Stats Grid */}
			<div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
				<StatCard
					title="Tracking"
					value={tracklist.length}
					subtitle="products"
					icon={Star}
					variant="primary"
				/>
				<StatCard
					title="Active Alerts"
					value={alerts.filter((a) => a.status === "active").length}
					subtitle="price alerts"
					icon={Bell}
					variant="warning"
				/>
				<StatCard
					title="Notifications"
					value={unreadNotifications}
					subtitle="unread"
					icon={Package}
					variant="info"
				/>
				<StatCard
					title="Price Drops"
					value={12}
					subtitle="this week"
					icon={TrendingDown}
					variant="success"
					trend={{ value: 23, positive: true }}
				/>
			</div>

			{/* Main Content Grid */}
			<div className="grid lg:grid-cols-3 gap-6">
				{/* Trending Deals */}
				<div className="lg:col-span-2 space-y-4">
					<div className="flex items-center justify-between">
						<h2 className="text-xl font-semibold flex items-center gap-2">
							<Sparkles className="w-5 h-5 text-warning" />
							Trending Deals
						</h2>
						<Button variant="ghost" size="sm" asChild>
							<Link to="/user/search">
								View all <ChevronRight className="w-4 h-4 ml-1" />
							</Link>
						</Button>
					</div>
					{loadingTrending ? (
						<div className="flex justify-center items-center py-12">
							<Loader2 className="w-6 h-6 animate-spin text-primary" />
						</div>
					) : (
						<div className="grid sm:grid-cols-2 gap-4">
							{trendingProducts.map((product) => (
								<ProductCard key={product.id} product={product} />
							))}
						</div>
					)}
				</div>

				{/* Sidebar */}
				<div className="space-y-6">
					{/* Recent Alerts */}
					<Card>
						<CardHeader className="pb-3">
							<CardTitle className="text-lg flex items-center gap-2">
								<Bell className="w-5 h-5 text-warning" />
								Recent Alerts
							</CardTitle>
						</CardHeader>
						<CardContent className="space-y-3">
							{alerts.slice(0, 3).map((alert) => (
								<div
									key={alert.id}
									className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
									<div className="min-w-0 flex-1">
										<p className="font-medium text-sm truncate">
											{alert.productName}
										</p>
										<p className="text-xs text-muted-foreground">
											Target: ₹{alert.targetPrice.toLocaleString()}
										</p>
									</div>
									<Badge
										variant={
											alert.status === "active" ? "default" : "secondary"
										}
										className="ml-2">
										{alert.status}
									</Badge>
								</div>
							))}
							<Button variant="outline" className="w-full" size="sm" asChild>
								<Link to="/user/alerts">View All Alerts</Link>
							</Button>
						</CardContent>
					</Card>

					{/* Recent Activity */}
					<Card>
						<CardHeader className="pb-3">
							<CardTitle className="text-lg flex items-center gap-2">
								<Clock className="w-5 h-5 text-info" />
								Recent Activity
							</CardTitle>
						</CardHeader>
						<CardContent className="space-y-3">
							{notifications.slice(0, 4).map((notif) => (
								<div key={notif.id} className="flex items-start gap-3 p-2">
									<div
										className={`w-2 h-2 mt-2 rounded-full ${
											notif.read ? "bg-muted" : "bg-primary"
										}`}
									/>
									<div className="min-w-0 flex-1">
										<p className="text-sm font-medium">{notif.title}</p>
										<p className="text-xs text-muted-foreground truncate">
											{notif.message}
										</p>
									</div>
								</div>
							))}
							<Button variant="outline" className="w-full" size="sm" asChild>
								<Link to="/user/notifications">View All</Link>
							</Button>
						</CardContent>
					</Card>
				</div>
			</div>

			{/* Recently Viewed */}
			<div className="space-y-4">
				<div className="flex items-center justify-between">
					<h2 className="text-xl font-semibold flex items-center gap-2">
						<Eye className="w-5 h-5 text-muted-foreground" />
						Recently Viewed
					</h2>
				</div>
				{loadingRecent ? (
					<div className="flex justify-center items-center py-12">
						<Loader2 className="w-6 h-6 animate-spin text-primary" />
					</div>
				) : (
					<div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
						{recentProducts.map((product) => (
							<ProductCard key={product.id} product={product} />
						))}
					</div>
				)}
			</div>
		</div>
	);
}
