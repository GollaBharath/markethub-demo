import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
	TrendingDown,
	TrendingUp,
	Users,
	Package,
	DollarSign,
	BarChart3,
	ArrowRight,
	ChevronRight,
	Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { StatCard } from "@/components/common/StatCard";
import { useAuthStore } from "@/store/authStore";
import { useToast } from "@/hooks/use-toast";
import {
	AreaChart,
	Area,
	XAxis,
	YAxis,
	CartesianGrid,
	Tooltip,
	ResponsiveContainer,
	BarChart,
	Bar,
} from "recharts";
import { sellerApi } from "@/api/sellerApi";

export default function SellerDashboard() {
	const { activeUserData } = useAuthStore();
	const { toast } = useToast();
	const [salesData, setSalesData] = useState<any>(null);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		const fetchData = async () => {
			try {
				setLoading(true);
				const data = await sellerApi.getDashboard();
				setSalesData(data.salesInsights);
			} catch (error: any) {
				toast({
					title: "Error",
					description:
						error.response?.data?.error || "Failed to fetch dashboard data",
					variant: "destructive",
				});
			} finally {
				setLoading(false);
			}
		};
		fetchData();
	}, []);

	if (loading || !salesData) {
		return (
			<div className="space-y-6 animate-fade-in">
				<h1 className="text-3xl font-display font-bold">Seller Dashboard</h1>
				<p className="text-muted-foreground">Loading...</p>
			</div>
		);
	}

	return (
		<div className="space-y-6 animate-fade-in">
			{/* Welcome Section */}
			<div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
				<div>
					<h1 className="text-3xl font-display font-bold text-foreground">
						Welcome, {activeUserData?.businessName || activeUserData?.name}! 📊
					</h1>
					<p className="text-muted-foreground mt-1">
						Here's your business overview and competition insights.
					</p>
				</div>
				<Button asChild>
					<Link to="/seller/competition">
						View Competition
						<ArrowRight className="w-4 h-4 ml-2" />
					</Link>
				</Button>
			</div>

			{/* Stats Grid */}
			<div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
				<StatCard
					title="Total Revenue"
					value={`₹${(salesData.revenue / 100000).toFixed(1)}L`}
					subtitle="this month"
					icon={DollarSign}
					variant="success"
					trend={{ value: 12, positive: true }}
				/>
				<StatCard
					title="Total Sales"
					value={salesData.totalSales}
					subtitle="orders"
					icon={Package}
					variant="primary"
					trend={{ value: 8, positive: true }}
				/>
				<StatCard
					title="Avg. Order Value"
					value={`₹${salesData.avgOrderValue.toLocaleString()}`}
					subtitle="per order"
					icon={BarChart3}
					variant="info"
				/>
				<StatCard
					title="Conversion Rate"
					value={`${salesData.conversionRate}%`}
					subtitle="of visitors"
					icon={Users}
					variant="warning"
					trend={{ value: 0.5, positive: true }}
				/>
			</div>

			{/* Charts Grid */}
			<div className="grid lg:grid-cols-2 gap-6">
				{/* Sales Trend */}
				<Card>
					<CardHeader>
						<CardTitle className="flex items-center gap-2">
							<TrendingUp className="w-5 h-5 text-success" />
							Sales Trend
						</CardTitle>
					</CardHeader>
					<CardContent>
						<ResponsiveContainer width="100%" height={250}>
							<AreaChart data={salesData.monthlySales}>
								<defs>
									<linearGradient
										id="salesGradient"
										x1="0"
										y1="0"
										x2="0"
										y2="1">
										<stop
											offset="5%"
											stopColor="hsl(var(--primary))"
											stopOpacity={0.3}
										/>
										<stop
											offset="95%"
											stopColor="hsl(var(--primary))"
											stopOpacity={0}
										/>
									</linearGradient>
								</defs>
								<CartesianGrid
									strokeDasharray="3 3"
									stroke="hsl(var(--border))"
								/>
								<XAxis
									dataKey="month"
									stroke="hsl(var(--muted-foreground))"
									fontSize={12}
								/>
								<YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
								<Tooltip
									contentStyle={{
										backgroundColor: "hsl(var(--card))",
										border: "1px solid hsl(var(--border))",
										borderRadius: "12px",
									}}
								/>
								<Area
									type="monotone"
									dataKey="sales"
									stroke="hsl(var(--primary))"
									fillOpacity={1}
									fill="url(#salesGradient)"
								/>
							</AreaChart>
						</ResponsiveContainer>
					</CardContent>
				</Card>

				{/* Category Distribution */}
				<Card>
					<CardHeader>
						<CardTitle className="flex items-center gap-2">
							<BarChart3 className="w-5 h-5 text-accent" />
							Top Categories
						</CardTitle>
					</CardHeader>
					<CardContent>
						<div className="space-y-3">
							{salesData.topCategories.map((cat: any, index: number) => (
								<div key={index} className="flex items-center justify-between">
									<span className="text-sm">{cat.name}</span>
									<div className="flex items-center gap-2">
										<div className="w-32 h-2 bg-muted rounded-full overflow-hidden">
											<div
												className="h-full bg-primary"
												style={{ width: `${cat.percentage}%` }}
											/>
										</div>
										<span className="text-sm font-medium w-12 text-right">
											{cat.percentage}%
										</span>
									</div>
								</div>
							))}
						</div>
					</CardContent>
				</Card>
			</div>

			{/* Quick Actions */}
			<div className="grid lg:grid-cols-2 gap-6">
				{/* Quick Actions */}
				<Card>
					<CardHeader>
						<CardTitle>Quick Actions</CardTitle>
					</CardHeader>
					<CardContent className="space-y-3">
						<Button
							variant="outline"
							className="w-full justify-between"
							asChild>
							<Link to="/seller/competition">
								View Competition
								<ChevronRight className="w-4 h-4" />
							</Link>
						</Button>
						<Button
							variant="outline"
							className="w-full justify-between"
							asChild>
							<Link to="/seller/insights">
								Sales Insights
								<ChevronRight className="w-4 h-4" />
							</Link>
						</Button>
						<Button
							variant="outline"
							className="w-full justify-between"
							asChild>
							<Link to="/seller/interests">
								Product Interests
								<ChevronRight className="w-4 h-4" />
							</Link>
						</Button>
						<Button
							variant="outline"
							className="w-full justify-between"
							asChild>
							<Link to="/seller/trending">
								Trending Items
								<ChevronRight className="w-4 h-4" />
							</Link>
						</Button>
					</CardContent>
				</Card>
			</div>
		</div>
	);
}
