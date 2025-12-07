import { useEffect, useState } from "react";
import { Package, TrendingUp, BarChart3 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatCard } from "@/components/common/StatCard";
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
	PieChart,
	Pie,
	Cell,
	ResponsiveContainer,
	Tooltip,
	Legend,
} from "recharts";

const COLORS = [
	"hsl(var(--primary))",
	"hsl(var(--success))",
	"hsl(var(--warning))",
	"hsl(var(--info))",
	"hsl(var(--accent))",
];

export default function AdminProducts() {
	const [products, setProducts] = useState<any[]>([]);
	const [analytics, setAnalytics] = useState<any>(null);
	const [loading, setLoading] = useState(true);
	const { toast } = useToast();

	const fetchProducts = async () => {
		try {
			setLoading(true);
			const data = await adminApi.getAllProducts();
			setProducts(data.products);
			setAnalytics(data.analytics);
		} catch (error: any) {
			toast({
				title: "Error",
				description: error.response?.data?.error || "Failed to fetch products",
				variant: "destructive",
			});
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		fetchProducts();
	}, []);

	if (loading) {
		return (
			<div className="space-y-6 animate-fade-in">
				<h1 className="text-3xl font-display font-bold">Product Analytics</h1>
				<p className="text-muted-foreground">Loading...</p>
			</div>
		);
	}

	const platformData =
		analytics?.byPlatform?.map((item: any) => ({
			name: item._id,
			value: item.count,
		})) || [];

	const categoryData =
		analytics?.byCategory?.map((item: any) => ({
			name: item._id || "Uncategorized",
			value: item.count,
		})) || [];

	const avgPrice = analytics?.avgPrice?.[0]?.avgPrice || 0;

	return (
		<div className="space-y-6 animate-fade-in">
			<div>
				<h1 className="text-3xl font-display font-bold">Product Analytics</h1>
				<p className="text-muted-foreground">
					Analyze tracked products across platforms
				</p>
			</div>

			{analytics && (
				<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
					<StatCard
						title="Total Products"
						value={analytics.totalProducts.toLocaleString()}
						icon={Package}
						variant="primary"
					/>
					<StatCard
						title="Avg Price"
						value={`₹${avgPrice.toFixed(0)}`}
						icon={TrendingUp}
						variant="success"
					/>
					<StatCard
						title="Categories"
						value={analytics.byCategory?.length || 0}
						icon={BarChart3}
						variant="info"
					/>
				</div>
			)}

			<div className="grid lg:grid-cols-2 gap-6">
				<Card>
					<CardHeader>
						<CardTitle>Products by Platform</CardTitle>
					</CardHeader>
					<CardContent>
						{platformData.length > 0 ? (
							<ResponsiveContainer width="100%" height={250}>
								<PieChart>
									<Pie
										data={platformData}
										dataKey="value"
										nameKey="name"
										cx="50%"
										cy="50%"
										outerRadius={80}
										label={(entry) => `${entry.name}: ${entry.value}`}>
										{platformData.map((_: any, index: number) => (
											<Cell
												key={`cell-${index}`}
												fill={COLORS[index % COLORS.length]}
											/>
										))}
									</Pie>
									<Tooltip />
									<Legend />
								</PieChart>
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
						<CardTitle>Top Categories</CardTitle>
					</CardHeader>
					<CardContent>
						{categoryData.length > 0 ? (
							<ResponsiveContainer width="100%" height={250}>
								<PieChart>
									<Pie
										data={categoryData}
										dataKey="value"
										nameKey="name"
										cx="50%"
										cy="50%"
										outerRadius={80}
										label={(entry) => `${entry.name}: ${entry.value}`}>
										{categoryData.map((_: any, index: number) => (
											<Cell
												key={`cell-${index}`}
												fill={COLORS[index % COLORS.length]}
											/>
										))}
									</Pie>
									<Tooltip />
									<Legend />
								</PieChart>
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
					<CardTitle>Recent Products ({products.length})</CardTitle>
				</CardHeader>
				<CardContent>
					<div className="overflow-x-auto">
						<Table>
							<TableHeader>
								<TableRow>
									<TableHead>Product</TableHead>
									<TableHead>Platform</TableHead>
									<TableHead>Category</TableHead>
									<TableHead>Price</TableHead>
									<TableHead>Discount</TableHead>
									<TableHead>Rating</TableHead>
									<TableHead>Last Scraped</TableHead>
								</TableRow>
							</TableHeader>
							<TableBody>
								{products.slice(0, 20).map((product) => (
									<TableRow key={product.id}>
										<TableCell className="font-medium max-w-xs truncate">
											{product.title}
										</TableCell>
										<TableCell>
											<Badge variant="outline">{product.platform}</Badge>
										</TableCell>
										<TableCell>
											<Badge variant="secondary">
												{product.category || "N/A"}
											</Badge>
										</TableCell>
										<TableCell>₹{product.price?.toLocaleString()}</TableCell>
										<TableCell>
											{product.discount ? (
												<span className="text-success">
													{product.discount}%
												</span>
											) : (
												"N/A"
											)}
										</TableCell>
										<TableCell>
											{product.rating ? (
												<span>⭐ {product.rating}</span>
											) : (
												"N/A"
											)}
										</TableCell>
										<TableCell>
											{new Date(product.lastScraped).toLocaleDateString()}
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
