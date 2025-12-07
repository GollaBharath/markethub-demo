import { useEffect, useState } from "react";
import {
	TrendingUp,
	DollarSign,
	Users,
	Package,
	ArrowUp,
	ArrowDown,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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
import { sellerApi } from "@/api/sellerApi";
import { useToast } from "@/hooks/use-toast";

const COLORS = [
	"hsl(var(--primary))",
	"hsl(var(--success))",
	"hsl(var(--warning))",
	"hsl(var(--info))",
];

export default function SellerInsights() {
	const [salesInsights, setSalesInsights] = useState<any>(null);
	const [loading, setLoading] = useState(true);
	const { toast } = useToast();

	useEffect(() => {
		const fetchData = async () => {
			try {
				setLoading(true);
				const data = await sellerApi.getInsights();
				setSalesInsights(data.salesInsights);
			} catch (error: any) {
				toast({
					title: "Error",
					description:
						error.response?.data?.error || "Failed to fetch insights",
					variant: "destructive",
				});
			} finally {
				setLoading(false);
			}
		};
		fetchData();
	}, []);

	if (loading || !salesInsights) {
		return (
			<div className="space-y-6 animate-fade-in">
				<h1 className="text-3xl font-display font-bold">Sales Insights</h1>
				<p className="text-muted-foreground">Loading...</p>
			</div>
		);
	}

	return (
		<div className="space-y-6 animate-fade-in">
			<div>
				<h1 className="text-3xl font-display font-bold">Sales Insights</h1>
				<p className="text-muted-foreground">
					Analytics and forecasts for your business
				</p>
			</div>

			<div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
				<StatCard
					title="Total Sales"
					value={salesInsights.totalSales}
					icon={Package}
					variant="primary"
					trend={{ value: 15, positive: true }}
				/>
				<StatCard
					title="Revenue"
					value={`₹${(salesInsights.revenue / 100000).toFixed(1)}L`}
					icon={DollarSign}
					variant="success"
				/>
				<StatCard
					title="Avg. Order"
					value={`₹${salesInsights.avgOrderValue.toLocaleString()}`}
					icon={TrendingUp}
					variant="info"
				/>
				<StatCard
					title="Conversion"
					value={`${salesInsights.conversionRate}%`}
					icon={Users}
					variant="warning"
				/>
			</div>

			<div className="grid lg:grid-cols-2 gap-6">
				<Card>
					<CardHeader>
						<CardTitle>Revenue Trend</CardTitle>
					</CardHeader>
					<CardContent>
						<ResponsiveContainer width="100%" height={250}>
							<AreaChart data={salesInsights.monthlySales}>
								<defs>
									<linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
										<stop
											offset="5%"
											stopColor="hsl(var(--success))"
											stopOpacity={0.3}
										/>
										<stop
											offset="95%"
											stopColor="hsl(var(--success))"
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
								<YAxis
									stroke="hsl(var(--muted-foreground))"
									fontSize={12}
									tickFormatter={(v) => `₹${(v / 100000).toFixed(0)}L`}
								/>
								<Tooltip
									contentStyle={{
										backgroundColor: "hsl(var(--card))",
										border: "1px solid hsl(var(--border))",
										borderRadius: "12px",
									}}
									formatter={(v: number) => [
										`₹${v.toLocaleString()}`,
										"Revenue",
									]}
								/>
								<Area
									type="monotone"
									dataKey="revenue"
									stroke="hsl(var(--success))"
									fillOpacity={1}
									fill="url(#revenueGrad)"
								/>
							</AreaChart>
						</ResponsiveContainer>
					</CardContent>
				</Card>

				<Card>
					<CardHeader>
						<CardTitle>Category Distribution</CardTitle>
					</CardHeader>
					<CardContent>
						<ResponsiveContainer width="100%" height={250}>
							<PieChart>
								<Pie
									data={salesInsights.topCategories}
									dataKey="percentage"
									nameKey="name"
									cx="50%"
									cy="50%"
									outerRadius={80}
									label={(e) => `${e.name}: ${e.percentage}%`}>
									{salesInsights.topCategories.map((_, index) => (
										<Cell
											key={`cell-${index}`}
											fill={COLORS[index % COLORS.length]}
										/>
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
