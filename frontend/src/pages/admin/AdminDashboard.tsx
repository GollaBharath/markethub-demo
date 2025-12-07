import { useEffect, useState } from "react";
import {
	Users,
	Package,
	TrendingUp,
	Search,
	Bell,
	DollarSign,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatCard } from "@/components/common/StatCard";
import {
	AreaChart,
	Area,
	XAxis,
	YAxis,
	CartesianGrid,
	Tooltip,
	ResponsiveContainer,
	PieChart,
	Pie,
	Cell,
} from "recharts";
import { adminApi } from "@/api/adminApi";
import { useToast } from "@/hooks/use-toast";

const COLORS = [
	"hsl(var(--primary))",
	"hsl(var(--success))",
	"hsl(var(--warning))",
	"hsl(var(--info))",
	"hsl(var(--accent))",
];

export default function AdminDashboard() {
	const [analytics, setAnalytics] = useState<any>(null);
	const [userGrowth, setUserGrowth] = useState<any[]>([]);
	const [categoryPopularity, setCategoryPopularity] = useState<any[]>([]);
	const [loading, setLoading] = useState(true);
	const { toast } = useToast();

	useEffect(() => {
		const fetchData = async () => {
			try {
				setLoading(true);
				const data = await adminApi.getDashboardAnalytics();
				setAnalytics(data.analytics);
				setUserGrowth(data.userGrowth);

				// Calculate percentages for category popularity
				const total = data.categoryPopularity.reduce(
					(acc: number, item: any) => acc + item.count,
					0
				);
				const categoryWithPercentage = data.categoryPopularity.map(
					(item: any) => ({
						...item,
						percentage: total > 0 ? Math.round((item.count / total) * 100) : 0,
					})
				);
				setCategoryPopularity(categoryWithPercentage);
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

	if (loading) {
		return (
			<div className="space-y-6 animate-fade-in">
				<h1 className="text-3xl font-display font-bold">Admin Dashboard</h1>
				<p className="text-muted-foreground">Loading...</p>
			</div>
		);
	}

	if (!analytics) {
		return (
			<div className="space-y-6 animate-fade-in">
				<h1 className="text-3xl font-display font-bold">Admin Dashboard</h1>
				<p className="text-muted-foreground">No data available</p>
			</div>
		);
	}

	return (
		<div className="space-y-6 animate-fade-in">
			<div>
				<h1 className="text-3xl font-display font-bold">Admin Dashboard</h1>
				<p className="text-muted-foreground">Platform overview and analytics</p>
			</div>

			<div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
				<StatCard
					title="Total Users"
					value={analytics.totalUsers?.toLocaleString() || "0"}
					icon={Users}
					variant="primary"
				/>
				<StatCard
					title="Sellers"
					value={analytics.totalSellers?.toLocaleString() || "0"}
					icon={Package}
					variant="success"
				/>
				<StatCard
					title="Products"
					value={analytics.totalProducts?.toLocaleString() || "0"}
					icon={TrendingUp}
					variant="info"
				/>
				<StatCard
					title="Alerts"
					value={analytics.totalAlerts?.toLocaleString() || "0"}
					icon={Bell}
					variant="default"
				/>
			</div>

			<div className="grid lg:grid-cols-2 gap-6">
				<Card>
					<CardHeader>
						<CardTitle>User Growth</CardTitle>
					</CardHeader>
					<CardContent>
						<ResponsiveContainer width="100%" height={250}>
							<AreaChart data={userGrowth}>
								<defs>
									<linearGradient id="usersGrad" x1="0" y1="0" x2="0" y2="1">
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
									dataKey="users"
									stroke="hsl(var(--primary))"
									fillOpacity={1}
									fill="url(#usersGrad)"
									name="Users"
								/>
							</AreaChart>
						</ResponsiveContainer>
					</CardContent>
				</Card>

				<Card>
					<CardHeader>
						<CardTitle>Category Popularity</CardTitle>
					</CardHeader>
					<CardContent>
						<ResponsiveContainer width="100%" height={250}>
							<PieChart>
								<Pie
									data={categoryPopularity}
									dataKey="percentage"
									nameKey="name"
									cx="50%"
									cy="50%"
									outerRadius={80}
									label={(e) => `${e.name}: ${e.percentage}%`}>
									{categoryPopularity.map((_, index) => (
										<Cell key={index} fill={COLORS[index % COLORS.length]} />
									))}
								</Pie>
								<Tooltip />
							</PieChart>
						</ResponsiveContainer>
					</CardContent>
				</Card>
			</div>
		</div>
	);
}
