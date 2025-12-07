import { useEffect, useState } from "react";
import { TrendingUp, TrendingDown, DollarSign, Bell } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { adminApi } from "@/api/adminApi";
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
	Legend,
} from "recharts";

export default function AdminTrends() {
	const [trends, setTrends] = useState<any>(null);
	const [loading, setLoading] = useState(true);
	const { toast } = useToast();

	const fetchTrends = async () => {
		try {
			setLoading(true);
			const data = await adminApi.getSalesTrends();
			setTrends(data);
		} catch (error: any) {
			toast({
				title: "Error",
				description: error.response?.data?.error || "Failed to fetch trends",
				variant: "destructive",
			});
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		fetchTrends();
	}, []);

	if (loading) {
		return (
			<div className="space-y-6 animate-fade-in">
				<h1 className="text-3xl font-display font-bold">Sales Trends</h1>
				<p className="text-muted-foreground">Loading...</p>
			</div>
		);
	}

	const priceDropData =
		trends?.priceDrops?.map((item: any) => ({
			date: item._id,
			count: item.count,
			avgPrice: Math.round(item.avgPrice),
		})) || [];

	const platformPerformanceData =
		trends?.platformPerformance?.map((item: any) => ({
			platform: item._id,
			products: item.totalProducts,
			avgDiscount: Math.round(item.avgDiscount || 0),
			avgRating: (item.avgRating || 0).toFixed(1),
		})) || [];

	const alertData =
		trends?.alertStats?.map((item: any) => ({
			date: item._id,
			alerts: item.count,
		})) || [];

	return (
		<div className="space-y-6 animate-fade-in">
			<div>
				<h1 className="text-3xl font-display font-bold">Sales Trends</h1>
				<p className="text-muted-foreground">
					Analyze market trends and performance
				</p>
			</div>

			<div className="grid lg:grid-cols-2 gap-6">
				<Card>
					<CardHeader>
						<CardTitle>Price Tracking Activity (Last 30 Days)</CardTitle>
					</CardHeader>
					<CardContent>
						{priceDropData.length > 0 ? (
							<ResponsiveContainer width="100%" height={250}>
								<AreaChart data={priceDropData}>
									<defs>
										<linearGradient id="priceGrad" x1="0" y1="0" x2="0" y2="1">
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
										dataKey="date"
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
										dataKey="count"
										stroke="hsl(var(--primary))"
										fillOpacity={1}
										fill="url(#priceGrad)"
										name="Price Updates"
									/>
								</AreaChart>
							</ResponsiveContainer>
						) : (
							<p className="text-muted-foreground text-center py-8">
								No data available
							</p>
						)}
					</CardContent>
				</Card>

				<Card>
					<CardHeader>
						<CardTitle>Alert Activity (Last 30 Days)</CardTitle>
					</CardHeader>
					<CardContent>
						{alertData.length > 0 ? (
							<ResponsiveContainer width="100%" height={250}>
								<AreaChart data={alertData}>
									<defs>
										<linearGradient id="alertGrad" x1="0" y1="0" x2="0" y2="1">
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
										dataKey="date"
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
										dataKey="alerts"
										stroke="hsl(var(--success))"
										fillOpacity={1}
										fill="url(#alertGrad)"
										name="Alerts Created"
									/>
								</AreaChart>
							</ResponsiveContainer>
						) : (
							<p className="text-muted-foreground text-center py-8">
								No data available
							</p>
						)}
					</CardContent>
				</Card>
			</div>

			<Card>
				<CardHeader>
					<CardTitle>Platform Performance</CardTitle>
				</CardHeader>
				<CardContent>
					{platformPerformanceData.length > 0 ? (
						<ResponsiveContainer width="100%" height={300}>
							<BarChart data={platformPerformanceData}>
								<CartesianGrid
									strokeDasharray="3 3"
									stroke="hsl(var(--border))"
								/>
								<XAxis
									dataKey="platform"
									stroke="hsl(var(--muted-foreground))"
								/>
								<YAxis stroke="hsl(var(--muted-foreground))" />
								<Tooltip
									contentStyle={{
										backgroundColor: "hsl(var(--card))",
										border: "1px solid hsl(var(--border))",
										borderRadius: "12px",
									}}
								/>
								<Legend />
								<Bar
									dataKey="products"
									fill="hsl(var(--primary))"
									name="Products"
								/>
								<Bar
									dataKey="avgDiscount"
									fill="hsl(var(--success))"
									name="Avg Discount %"
								/>
							</BarChart>
						</ResponsiveContainer>
					) : (
						<p className="text-muted-foreground text-center py-8">
							No data available
						</p>
					)}
				</CardContent>
			</Card>

			<Card>
				<CardHeader>
					<CardTitle>Top Deals by Discount</CardTitle>
				</CardHeader>
				<CardContent>
					<div className="overflow-x-auto">
						<Table>
							<TableHeader>
								<TableRow>
									<TableHead>Product</TableHead>
									<TableHead>Platform</TableHead>
									<TableHead>Original Price</TableHead>
									<TableHead>Current Price</TableHead>
									<TableHead>Discount</TableHead>
								</TableRow>
							</TableHeader>
							<TableBody>
								{trends?.topDeals?.map((deal: any) => (
									<TableRow key={deal._id}>
										<TableCell className="font-medium max-w-xs truncate">
											{deal.title}
										</TableCell>
										<TableCell>
											<Badge variant="outline">{deal.platform}</Badge>
										</TableCell>
										<TableCell className="line-through text-muted-foreground">
											₹{deal.originalPrice?.toLocaleString() || "N/A"}
										</TableCell>
										<TableCell className="font-bold text-success">
											₹{deal.price?.toLocaleString()}
										</TableCell>
										<TableCell>
											<Badge variant="default" className="bg-success">
												{deal.discount}% OFF
											</Badge>
										</TableCell>
									</TableRow>
								))}
							</TableBody>
						</Table>
					</div>
				</CardContent>
			</Card>
		</div>
	);
}
