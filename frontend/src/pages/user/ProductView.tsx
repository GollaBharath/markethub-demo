import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
	Star,
	ExternalLink,
	Bell,
	Heart,
	Share2,
	MapPin,
	MessageSquare,
	Send,
	TrendingDown,
	TrendingUp,
	Minus,
	ChevronLeft,
	CheckCircle2,
	Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
import { PriceHistoryChart } from "@/components/common/PriceHistoryChart";
import { useToast } from "@/hooks/use-toast";
import { getProductById } from "@/api/dealApi";
import {
	addToTracklist as addToTracklistAPI,
	getTracklist,
} from "@/api/tracklistApi";
import { createAlert } from "@/api/alertApi";

export default function ProductView() {
	const { productId } = useParams();
	const navigate = useNavigate();
	const { toast } = useToast();

	const [product, setProduct] = useState<any>(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [isTracked, setIsTracked] = useState(false);
	const [pincode, setPincode] = useState("");
	const [deliveryInfo, setDeliveryInfo] = useState<string | null>(null);
	const [comment, setComment] = useState("");
	const [targetPrice, setTargetPrice] = useState("");
	const [emailAlert, setEmailAlert] = useState(true);

	useEffect(() => {
		const fetchData = async () => {
			if (!productId) return;
			try {
				setLoading(true);
				const [productData, tracklistData] = await Promise.all([
					getProductById(productId),
					getTracklist().catch(() => []),
				]);
				setProduct(productData);
				setIsTracked(tracklistData.some((t: any) => t.productId === productId));
			} catch (err: any) {
				setError(err.response?.data?.message || "Failed to load product");
				toast({
					title: "Error",
					description: "Failed to load product details",
					variant: "destructive",
				});
			} finally {
				setLoading(false);
			}
		};

		fetchData();
	}, [productId]);

	if (loading) {
		return (
			<div className="flex flex-col items-center justify-center py-20">
				<Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
				<p className="mt-4 text-muted-foreground">Loading product...</p>
			</div>
		);
	}

	if (error || !product) {
		return (
			<div className="flex flex-col items-center justify-center py-20">
				<p className="text-muted-foreground">{error || "Product not found"}</p>
				<Button variant="link" onClick={() => navigate("/user/search")}>
					Go back to search
				</Button>
			</div>
		);
	}

	const priceEntries = Object.entries(product.prices)
		.filter(([_, value]) => value !== null && value !== undefined)
		.map(([store, value]) => ({
			store,
			price: value!.price,
			url: value!.url,
		}))
		.sort((a, b) => a.price - b.price);

	const lowestPrice = priceEntries[0];
	const highestPrice = priceEntries[priceEntries.length - 1];

	const storeColors: Record<string, string> = {
		amazon: "bg-orange-100 text-orange-700 border-orange-200",
		flipkart: "bg-blue-100 text-blue-700 border-blue-200",
		meesho: "bg-pink-100 text-pink-700 border-pink-200",
		myntra: "bg-rose-100 text-rose-700 border-rose-200",
		ajio: "bg-amber-100 text-amber-700 border-amber-200",
	};

	const recommendationStyles = {
		good: { bg: "bg-success", text: "Best time to buy!", icon: TrendingDown },
		neutral: { bg: "bg-warning", text: "Price is average", icon: Minus },
		high: {
			bg: "bg-destructive",
			text: "Wait for price drop",
			icon: TrendingUp,
		},
	};

	const rec =
		recommendationStyles[
			product.buyRecommendation as keyof typeof recommendationStyles
		];

	const checkDelivery = () => {
		if (pincode.length === 6) {
			setDeliveryInfo("Delivery available in 3-5 business days");
		}
	};

	const handleAddToTracklist = async () => {
		try {
			await addToTracklistAPI({
				productId: product.id,
				title: product.name,
				url: priceEntries[0].url,
				price: priceEntries[0].price,
			});
			setIsTracked(true);
			toast({
				title: "Added to tracklist!",
				description: `${product.name} is now being tracked.`,
			});
		} catch (error: any) {
			toast({
				title: "Error",
				description:
					error.response?.data?.message || "Failed to add to tracklist",
				variant: "destructive",
			});
		}
	};

	const handleAddAlert = async () => {
		if (!targetPrice) return;
		try {
			await createAlert({
				productId: product.id,
				targetPrice: Number(targetPrice),
			});
			toast({
				title: "Alert created!",
				description: `We'll notify you when price drops to ₹${targetPrice}`,
			});
			setTargetPrice("");
		} catch (error: any) {
			toast({
				title: "Error",
				description: error.response?.data?.message || "Failed to create alert",
				variant: "destructive",
			});
		}
	};

	const dummyComments = [
		{
			id: 1,
			user: "Rahul S.",
			text: "Great product! Got it during sale for even less.",
			date: "2 days ago",
		},
		{
			id: 2,
			user: "Priya M.",
			text: "Lowest price I found was on Amazon during Prime Day.",
			date: "1 week ago",
		},
		{
			id: 3,
			user: "Amit K.",
			text: "Quality is excellent. Worth the price.",
			date: "2 weeks ago",
		},
	];

	return (
		<div className="space-y-6 animate-fade-in">
			{/* Back Button */}
			<Button variant="ghost" onClick={() => navigate(-1)} className="gap-2">
				<ChevronLeft className="w-4 h-4" />
				Back
			</Button>

			<div className="grid lg:grid-cols-2 gap-8">
				{/* Left Column - Image & Details */}
				<div className="space-y-6">
					{/* Image */}
					<Card className="overflow-hidden">
						<div className="aspect-square relative bg-muted">
							<img
								src={product.image}
								alt={product.name}
								className="w-full h-full object-cover"
							/>
							<div className="absolute top-4 left-4">
								<Badge className={`${rec.bg} text-white`}>
									<rec.icon className="w-3 h-3 mr-1" />
									{rec.text}
								</Badge>
							</div>
						</div>
					</Card>

					{/* Buy Recommendation Bar */}
					<Card>
						<CardContent className="p-4">
							<div className="flex items-center gap-4">
								<div
									className={`w-4 h-full min-h-[60px] rounded-full ${rec.bg}`}
								/>
								<div>
									<h3 className="font-semibold">{rec.text}</h3>
									<p className="text-sm text-muted-foreground">
										{product.buyRecommendation === "good"
											? "Prices are at their lowest. Great time to purchase!"
											: product.buyRecommendation === "neutral"
											? "Price is average. May drop during sales."
											: "Price is higher than usual. Consider waiting."}
									</p>
								</div>
							</div>
						</CardContent>
					</Card>

					{/* Description */}
					<Card>
						<CardHeader>
							<CardTitle>Description</CardTitle>
						</CardHeader>
						<CardContent>
							<p className="text-muted-foreground">{product.description}</p>
						</CardContent>
					</Card>

					{/* Delivery Check */}
					<Card>
						<CardHeader>
							<CardTitle className="flex items-center gap-2">
								<MapPin className="w-5 h-5" />
								Check Delivery
							</CardTitle>
						</CardHeader>
						<CardContent>
							<div className="flex gap-2">
								<Input
									placeholder="Enter pincode"
									value={pincode}
									onChange={(e) => setPincode(e.target.value)}
									maxLength={6}
								/>
								<Button onClick={checkDelivery}>Check</Button>
							</div>
							{deliveryInfo && (
								<p className="mt-3 text-sm text-success flex items-center gap-2">
									<CheckCircle2 className="w-4 h-4" />
									{deliveryInfo}
								</p>
							)}
						</CardContent>
					</Card>
				</div>

				{/* Right Column - Pricing & Actions */}
				<div className="space-y-6">
					{/* Title & Rating */}
					<div className="space-y-4">
						<Badge variant="secondary">{product.category}</Badge>
						<h1 className="text-3xl font-display font-bold">{product.name}</h1>
						<div className="flex items-center gap-4">
							<div className="flex items-center gap-1">
								<Star className="w-5 h-5 fill-warning text-warning" />
								<span className="font-semibold">{product.rating}</span>
							</div>
							<span className="text-muted-foreground">
								({product.reviewCount.toLocaleString()} reviews)
							</span>
						</div>
					</div>

					{/* Price Comparison Table */}
					<Card>
						<CardHeader>
							<CardTitle>Price Comparison</CardTitle>
						</CardHeader>
						<CardContent className="space-y-3">
							{priceEntries.map((entry, index) => (
								<div
									key={entry.store}
									className={`flex items-center justify-between p-3 rounded-xl border ${
										index === 0 ? storeColors[entry.store] : "bg-muted/50"
									}`}>
									<div className="flex items-center gap-3">
										{index === 0 && <Badge variant="secondary">Lowest</Badge>}
										<span className="font-medium capitalize">
											{entry.store}
										</span>
									</div>
									<div className="flex items-center gap-3">
										<span className="text-xl font-bold">
											₹{entry.price.toLocaleString()}
										</span>
										<Button
											size="sm"
											onClick={() => window.open(entry.url, "_blank")}>
											<ExternalLink className="w-4 h-4 mr-1" />
											Buy
										</Button>
									</div>
								</div>
							))}
						</CardContent>
					</Card>

					{/* Action Buttons */}
					<div className="flex gap-3">
						<Button
							className="flex-1"
							size="lg"
							onClick={() => window.open(lowestPrice.url, "_blank")}>
							<ExternalLink className="w-4 h-4 mr-2" />
							Buy Now on {lowestPrice.store}
						</Button>
						<Button
							variant="outline"
							size="lg"
							onClick={handleAddToTracklist}
							disabled={isTracked}>
							<Heart className={`w-4 h-4 ${isTracked ? "fill-current" : ""}`} />
						</Button>
						<Button variant="outline" size="lg">
							<Share2 className="w-4 h-4" />
						</Button>
					</div>

					{/* Set Alert */}
					<Card>
						<CardHeader>
							<CardTitle className="flex items-center gap-2">
								<Bell className="w-5 h-5" />
								Set Price Alert
							</CardTitle>
						</CardHeader>
						<CardContent className="space-y-4">
							<div className="flex gap-2">
								<Input
									type="number"
									placeholder="Target price"
									value={targetPrice}
									onChange={(e) => setTargetPrice(e.target.value)}
								/>
								<Button onClick={handleAddAlert}>Set Alert</Button>
							</div>
							<div className="flex items-center justify-between">
								<Label
									htmlFor="email-alert"
									className="flex items-center gap-2 cursor-pointer">
									Send to my email
								</Label>
								<Switch
									id="email-alert"
									checked={emailAlert}
									onCheckedChange={setEmailAlert}
								/>
							</div>
						</CardContent>
					</Card>

					{/* Price History Chart */}
					<PriceHistoryChart data={product.priceHistory} />
				</div>
			</div>

			{/* Comments Section */}
			<Card>
				<CardHeader>
					<CardTitle className="flex items-center gap-2">
						<MessageSquare className="w-5 h-5" />
						Community Comments
					</CardTitle>
				</CardHeader>
				<CardContent className="space-y-4">
					<div className="flex gap-2">
						<Textarea
							placeholder="Share your experience or tip..."
							value={comment}
							onChange={(e) => setComment(e.target.value)}
							className="min-h-[80px]"
						/>
					</div>
					<Button
						onClick={() => {
							setComment("");
							toast({ title: "Comment posted!" });
						}}>
						<Send className="w-4 h-4 mr-2" />
						Post Comment
					</Button>

					<Separator className="my-4" />

					<div className="space-y-4">
						{dummyComments.map((c) => (
							<div key={c.id} className="p-4 rounded-xl bg-muted/50">
								<div className="flex items-center justify-between mb-2">
									<span className="font-medium">{c.user}</span>
									<span className="text-xs text-muted-foreground">
										{c.date}
									</span>
								</div>
								<p className="text-sm text-muted-foreground">{c.text}</p>
							</div>
						))}
					</div>
				</CardContent>
			</Card>
		</div>
	);
}
