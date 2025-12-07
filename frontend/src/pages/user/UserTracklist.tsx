import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
	Star,
	Trash2,
	ExternalLink,
	TrendingDown,
	Bell,
	ChevronRight,
	Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
	getTracklist,
	removeFromTracklist as removeFromTracklistAPI,
} from "@/api/tracklistApi";
import { getProductById } from "@/api/dealApi";
import { useToast } from "@/hooks/use-toast";
import { PriceHistoryChart } from "@/components/common/PriceHistoryChart";

export default function UserTracklist() {
	const [tracklist, setTracklist] = useState<any[]>([]);
	const [loading, setLoading] = useState(true);
	const { toast } = useToast();

	useEffect(() => {
		fetchTracklist();
	}, []);

	const fetchTracklist = async () => {
		try {
			setLoading(true);
			const data = await getTracklist();
			// Fetch product details for each tracked item
			const tracklistWithProducts = await Promise.all(
				data.map(async (item: any) => {
					try {
						const product = await getProductById(item.productId);
						return { ...item, product };
					} catch {
						return { ...item, product: null };
					}
				})
			);
			setTracklist(tracklistWithProducts.filter((item) => item.product));
		} catch (error: any) {
			toast({
				title: "Error",
				description: "Failed to load tracklist",
				variant: "destructive",
			});
		} finally {
			setLoading(false);
		}
	};

	const handleRemove = async (productId: string) => {
		try {
			await removeFromTracklistAPI(productId);
			setTracklist(tracklist.filter((item) => item.productId !== productId));
			toast({
				title: "Removed",
				description: "Product removed from tracklist",
			});
		} catch (error) {
			toast({
				title: "Error",
				description: "Failed to remove product",
				variant: "destructive",
			});
		}
	};

	if (loading) {
		return (
			<div className="flex items-center justify-center py-20">
				<Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
			</div>
		);
	}

	const trackedProducts = tracklist;

	return (
		<div className="space-y-6 animate-fade-in">
			<div className="flex items-center justify-between">
				<div>
					<h1 className="text-3xl font-display font-bold">My Tracklist</h1>
					<p className="text-muted-foreground">
						Products you're tracking for price drops
					</p>
				</div>
				<Badge variant="secondary" className="text-lg px-4 py-2">
					<Star className="w-4 h-4 mr-2" />
					{trackedProducts.length} products
				</Badge>
			</div>

			{trackedProducts.length === 0 ? (
				<Card className="py-12">
					<CardContent className="text-center space-y-4">
						<Star className="w-12 h-12 mx-auto text-muted-foreground" />
						<h2 className="text-xl font-semibold">No products tracked yet</h2>
						<p className="text-muted-foreground">
							Start adding products to your tracklist to monitor price changes
						</p>
						<Button asChild>
							<Link to="/user/search">Browse Products</Link>
						</Button>
					</CardContent>
				</Card>
			) : (
				<div className="space-y-6">
					{trackedProducts.map(({ product, addedAt }) => {
						if (!product) return null;
						const lowestPrice = Math.min(
							...Object.values(product.prices)
								.filter((p) => p)
								.map((p) => p!.price)
						);
						const lowestStore = Object.entries(product.prices).filter(
							([_, v]) => v?.price === lowestPrice
						)[0];

						return (
							<Card key={product.id} className="overflow-hidden">
								<div className="flex flex-col lg:flex-row">
									<div className="lg:w-48 aspect-square lg:aspect-auto">
										<img
											src={product.image}
											alt={product.name}
											className="w-full h-full object-cover"
										/>
									</div>
									<div className="flex-1 p-6 space-y-4">
										<div className="flex items-start justify-between gap-4">
											<div>
												<Badge variant="secondary" className="mb-2">
													{product.category}
												</Badge>
												<h3 className="text-xl font-semibold">
													{product.name}
												</h3>
												<p className="text-sm text-muted-foreground mt-1">
													Tracking since{" "}
													{new Date(addedAt).toLocaleDateString()}
												</p>
											</div>
											<Button
												variant="ghost"
												size="icon"
												className="text-destructive hover:text-destructive"
												onClick={() => handleRemove(product.id)}>
												<Trash2 className="w-5 h-5" />
											</Button>
										</div>

										<div className="flex flex-wrap items-center gap-4">
											<div>
												<p className="text-sm text-muted-foreground">
													Lowest Price
												</p>
												<p className="text-2xl font-bold">
													₹{lowestPrice.toLocaleString()}
												</p>
												<p className="text-xs text-muted-foreground capitalize">
													on {lowestStore?.[0]}
												</p>
											</div>
											<Badge className="price-good">
												<TrendingDown className="w-3 h-3 mr-1" />
												-5% this week
											</Badge>
										</div>

										<div className="flex flex-wrap gap-2">
											<Button asChild>
												<Link to={`/user/product/${product.id}`}>
													View Details
													<ChevronRight className="w-4 h-4 ml-1" />
												</Link>
											</Button>
											<Button
												variant="outline"
												onClick={() =>
													lowestStore &&
													window.open((lowestStore[1] as any).url, "_blank")
												}>
												<ExternalLink className="w-4 h-4 mr-2" />
												Buy Now
											</Button>
											<Button variant="outline">
												<Bell className="w-4 h-4 mr-2" />
												Set Alert
											</Button>
										</div>
									</div>
								</div>
								<div className="border-t p-4">
									<PriceHistoryChart
										data={product.priceHistory}
										showLegend={false}
									/>
								</div>
							</Card>
						);
					})}
				</div>
			)}
		</div>
	);
}
