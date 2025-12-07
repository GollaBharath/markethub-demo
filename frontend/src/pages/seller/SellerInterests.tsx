import { useEffect, useState } from "react";
import { Package, TrendingUp, Search } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { sellerApi } from "@/api/sellerApi";
import { useToast } from "@/hooks/use-toast";

export default function SellerInterests() {
	const [customerInterests, setCustomerInterests] = useState<any[]>([]);
	const [loading, setLoading] = useState(true);
	const { toast } = useToast();

	useEffect(() => {
		const fetchData = async () => {
			try {
				setLoading(true);
				const data = await sellerApi.getInterests();
				setCustomerInterests(data.customerInterests);
			} catch (error: any) {
				toast({
					title: "Error",
					description:
						error.response?.data?.error || "Failed to fetch customer interests",
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
				<h1 className="text-3xl font-display font-bold">Customer Interests</h1>
				<p className="text-muted-foreground">Loading...</p>
			</div>
		);
	}

	return (
		<div className="space-y-6 animate-fade-in">
			<div>
				<h1 className="text-3xl font-display font-bold">Customer Interests</h1>
				<p className="text-muted-foreground">
					Popular categories and search trends
				</p>
			</div>

			<div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
				{customerInterests.map((interest, index) => (
					<Card key={index}>
						<CardHeader>
							<div className="flex items-center justify-between">
								<CardTitle className="text-base">{interest.category}</CardTitle>
								<Badge variant="outline">
									<Search className="w-3 h-3 mr-1" />
									{interest.searchVolume}
								</Badge>
							</div>
						</CardHeader>
						<CardContent className="space-y-4">
							<div className="flex items-center justify-between">
								<span className="text-sm text-muted-foreground">Avg Price</span>
								<span className="font-semibold">
									₹{interest.avgPrice.toLocaleString()}
								</span>
							</div>
							<div className="space-y-2">
								<p className="text-xs text-muted-foreground font-medium">
									Top Products:
								</p>
								{interest.products
									.slice(0, 3)
									.map((product: any, pIndex: number) => (
										<div
											key={pIndex}
											className="text-xs p-2 rounded bg-muted/50">
											<p className="line-clamp-1">{product.title}</p>
											<div className="flex items-center justify-between mt-1">
												<Badge variant="secondary" className="text-xs">
													{product.platform}
												</Badge>
												<span className="font-medium">
													₹{product.price?.toLocaleString()}
												</span>
											</div>
										</div>
									))}
							</div>
						</CardContent>
					</Card>
				))}
			</div>

			<Card>
				<CardHeader>
					<CardTitle className="flex items-center gap-2">
						<TrendingUp className="w-5 h-5 text-success" />
						Market Insights
					</CardTitle>
				</CardHeader>
				<CardContent>
					<div className="grid md:grid-cols-3 gap-4">
						<div className="p-4 rounded-xl bg-success/10 border border-success/30">
							<h4 className="font-semibold text-success mb-2">High Demand</h4>
							<p className="text-sm text-muted-foreground">
								Top categories are seeing increased customer interest.
							</p>
						</div>
						<div className="p-4 rounded-xl bg-info/10 border border-info/30">
							<h4 className="font-semibold text-info mb-2">Price Range</h4>
							<p className="text-sm text-muted-foreground">
								Average prices vary by category. Position your products
								strategically.
							</p>
						</div>
						<div className="p-4 rounded-xl bg-warning/10 border border-warning/30">
							<h4 className="font-semibold text-warning mb-2">Search Volume</h4>
							<p className="text-sm text-muted-foreground">
								Track search volumes to identify trending products.
							</p>
						</div>
					</div>
				</CardContent>
			</Card>
		</div>
	);
}
