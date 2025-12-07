import { useEffect, useState } from "react";
import { Sparkles, TrendingUp, TrendingDown } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { sellerApi } from "@/api/sellerApi";
import { useToast } from "@/hooks/use-toast";

export default function SellerTrending() {
	const [trendingProducts, setTrendingProducts] = useState<any[]>([]);
	const [loading, setLoading] = useState(true);
	const { toast } = useToast();

	useEffect(() => {
		const fetchData = async () => {
			try {
				setLoading(true);
				const data = await sellerApi.getTrending();
				setTrendingProducts(data.trendingProducts);
			} catch (error: any) {
				toast({
					title: "Error",
					description:
						error.response?.data?.error || "Failed to fetch trending products",
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
				<h1 className="text-3xl font-display font-bold">Trending Items</h1>
				<p className="text-muted-foreground">Loading...</p>
			</div>
		);
	}

	return (
		<div className="space-y-6 animate-fade-in">
			<div>
				<h1 className="text-3xl font-display font-bold">Trending Items</h1>
				<p className="text-muted-foreground">Hot products across platforms</p>
			</div>

			<div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
				{trendingProducts.map((item, index) => (
					<Card key={index} className="hover-lift">
						<CardContent className="p-6">
							<div className="space-y-4">
								<div className="flex items-center justify-between">
									<Badge variant="outline">{item.platform}</Badge>
									<Badge
										variant={
											item.trend === "hot"
												? "destructive"
												: item.trend === "rising"
												? "default"
												: "secondary"
										}>
										{item.trend}
									</Badge>
								</div>
								<h3 className="font-semibold text-sm line-clamp-2">
									{item.name}
								</h3>
								<div className="flex items-center justify-between">
									<div>
										<p className="text-2xl font-bold text-success">
											₹{item.price.toLocaleString()}
										</p>
										{item.originalPrice && item.originalPrice > item.price && (
											<p className="text-sm text-muted-foreground line-through">
												₹{item.originalPrice.toLocaleString()}
											</p>
										)}
									</div>
									{item.discount > 0 && (
										<Badge variant="default" className="bg-success">
											{item.discount}% OFF
										</Badge>
									)}
								</div>
								<div className="flex items-center justify-between text-sm">
									<span className="text-muted-foreground">
										⭐ {item.rating || "N/A"}
									</span>
									<span className="text-muted-foreground">
										{item.reviews || 0} reviews
									</span>
								</div>
							</div>
						</CardContent>
					</Card>
				))}
			</div>
		</div>
	);
}
