import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { Search, TrendingUp, Loader2, Zap } from "lucide-react";
import {
	searchProducts,
	getLiveDeals,
	triggerLiveScraping,
	ProductGroup,
	Deal,
} from "@/api/dealApi";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Input } from "@/components/ui/input";
import { useAppStore } from "@/store/appStore";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function UserSearch() {
	const { toast } = useToast();
	const [searchParams] = useSearchParams();
	const { addSearchHistory } = useAppStore();
	const [searchQuery, setSearchQuery] = useState("");
	const [searchResults, setSearchResults] = useState<ProductGroup[]>([]);
	const [liveDeals, setLiveDeals] = useState<Deal[]>([]);
	const [loading, setLoading] = useState(false);
	const [dealsLoading, setDealsLoading] = useState(false);
	const [fromCache, setFromCache] = useState(false);
	const [scrapingLive, setScrapingLive] = useState(false);
	const [shouldSuggestScraping, setShouldSuggestScraping] = useState(false);

	// Filters
	const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>([]);
	const [sortBy, setSortBy] = useState<
		"relevance" | "price_low" | "price_high" | "rating"
	>("relevance");
	const [minPrice, setMinPrice] = useState<number | undefined>();
	const [maxPrice, setMaxPrice] = useState<number | undefined>();

	// Load live deals on mount
	useEffect(() => {
		loadLiveDeals();
	}, []);

	// Handle URL query parameter
	useEffect(() => {
		const query = searchParams.get("q");
		if (query) {
			setSearchQuery(query);
			// Trigger search automatically
			searchProducts(query, {})
				.then((response) => {
					setSearchResults(response.products);
					setFromCache(response.fromCache);
					setShouldSuggestScraping(
						response.products.length === 0 && !response.fromCache
					);
				})
				.catch((error) => {
					console.error("Search failed:", error);
				});
		}
	}, [searchParams]);

	const loadLiveDeals = async () => {
		try {
			setDealsLoading(true);
			const response = await getLiveDeals({ limit: 20 });
			// Filter out invalid deals
			const validDeals = response.deals.filter(
				(deal) =>
					deal.title &&
					deal.title !== "Blocked" &&
					deal.title !== "N/A" &&
					deal.title !== "" &&
					deal.price > 0
			);
			setLiveDeals(validDeals);
		} catch (error) {
			console.error("Failed to load live deals:", error);
		} finally {
			setDealsLoading(false);
		}
	};

	const handleSearch = async () => {
		if (!searchQuery.trim()) return;

		try {
			setLoading(true);
			setShouldSuggestScraping(false);

			// Add to search history
			addSearchHistory(searchQuery);

			const response = await searchProducts(searchQuery, {
				platforms: selectedPlatforms.length > 0 ? selectedPlatforms : undefined,
				sortBy,
				minPrice,
				maxPrice,
			});

			setSearchResults(response.products);
			setFromCache(response.fromCache);
			setShouldSuggestScraping(
				response.products.length === 0 && !response.fromCache
			);
		} catch (error) {
			console.error("Search failed:", error);
		} finally {
			setLoading(false);
		}
	};

	const handleLiveScraping = async () => {
		if (!searchQuery.trim()) return;

		try {
			setScrapingLive(true);
			const response = await triggerLiveScraping(
				searchQuery,
				selectedPlatforms.length > 0 ? selectedPlatforms : undefined
			);

			// Show success notification
			toast({
				title: "Scraping Started! 🚀",
				description:
					"Fetching fresh deals from all platforms. This will take about 1-2 minutes. The page will auto-refresh.",
				duration: 5000,
			});

			// Wait 60 seconds for scraping to complete, then search again
			setTimeout(async () => {
				await handleSearch();
				setScrapingLive(false);
				toast({
					title: "Search Updated! ✨",
					description: "Results have been refreshed with latest deals.",
					duration: 3000,
				});
			}, 60000);
		} catch (error) {
			console.error("Live scraping failed:", error);
			toast({
				title: "Scraping Failed",
				description:
					"Unable to trigger scraping. Please try again in a moment.",
				variant: "destructive",
				duration: 4000,
			});
			setScrapingLive(false);
		}
	};

	const handleKeyPress = (e: React.KeyboardEvent) => {
		if (e.key === "Enter") {
			handleSearch();
		}
	};

	const togglePlatform = (platform: string) => {
		setSelectedPlatforms((prev) =>
			prev.includes(platform)
				? prev.filter((p) => p !== platform)
				: [...prev, platform]
		);
	};

	const getPlatformColor = (platform: string) => {
		const colors: Record<string, string> = {
			amazon: "bg-orange-500",
			flipkart: "bg-blue-500",
			meesho: "bg-pink-500",
			myntra: "bg-purple-500",
			ajio: "bg-yellow-600",
		};
		return colors[platform] || "bg-gray-500";
	};

	return (
		<div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
			<div className="max-w-7xl mx-auto">
				{/* Header */}
				<div className="text-center mb-8">
					<h1 className="text-4xl font-bold text-gray-800 mb-2">
						Smart Product Search
					</h1>
					<p className="text-gray-600">
						Search across all platforms and find the best deals
					</p>
				</div>

				<Tabs defaultValue="search" className="w-full">
					<TabsList className="grid w-full max-w-md mx-auto grid-cols-2 mb-6">
						<TabsTrigger value="search">
							<Search className="w-4 h-4 mr-2" />
							Search Products
						</TabsTrigger>
						<TabsTrigger value="deals">
							<TrendingUp className="w-4 h-4 mr-2" />
							Live Deals
						</TabsTrigger>
					</TabsList>

					{/* Search Tab */}
					<TabsContent value="search" className="space-y-6">
						{/* Search Bar */}
						<Card>
							<CardContent className="pt-6">
								<div className="flex gap-3">
									<Input
										placeholder="Search for products... (e.g., 'iPhone 15', 'Nike shoes')"
										value={searchQuery}
										onChange={(e) => setSearchQuery(e.target.value)}
										onKeyPress={handleKeyPress}
										className="flex-1"
									/>
									<Button onClick={handleSearch} disabled={loading}>
										{loading ? (
											<Loader2 className="w-4 h-4 animate-spin" />
										) : (
											<Search className="w-4 h-4" />
										)}
									</Button>
								</div>

								{/* Filters */}
								<div className="mt-4 flex flex-wrap gap-3">
									{/* Platform filters */}
									<div className="flex gap-2">
										{["amazon", "flipkart", "meesho", "myntra", "ajio"].map(
											(platform) => (
												<Badge
													key={platform}
													variant={
														selectedPlatforms.includes(platform)
															? "default"
															: "outline"
													}
													className={`cursor-pointer ${
														selectedPlatforms.includes(platform)
															? getPlatformColor(platform) + " text-white"
															: ""
													}`}
													onClick={() => togglePlatform(platform)}>
													{platform.charAt(0).toUpperCase() + platform.slice(1)}
												</Badge>
											)
										)}
									</div>

									{/* Sort by */}
									<Select
										value={sortBy}
										onValueChange={(v: any) => setSortBy(v)}>
										<SelectTrigger className="w-40">
											<SelectValue placeholder="Sort by" />
										</SelectTrigger>
										<SelectContent>
											<SelectItem value="relevance">Relevance</SelectItem>
											<SelectItem value="price_low">
												Price: Low to High
											</SelectItem>
											<SelectItem value="price_high">
												Price: High to Low
											</SelectItem>
											<SelectItem value="rating">Rating</SelectItem>
										</SelectContent>
									</Select>

									{/* Price range */}
									<Input
										type="number"
										placeholder="Min price"
										className="w-32"
										value={minPrice || ""}
										onChange={(e) =>
											setMinPrice(
												e.target.value ? Number(e.target.value) : undefined
											)
										}
									/>
									<Input
										type="number"
										placeholder="Max price"
										className="w-32"
										value={maxPrice || ""}
										onChange={(e) =>
											setMaxPrice(
												e.target.value ? Number(e.target.value) : undefined
											)
										}
									/>
								</div>

								{fromCache && (
									<div className="mt-3 text-sm text-green-600">
										⚡ Results loaded from cache
									</div>
								)}
							</CardContent>
						</Card>

						{/* Search Results */}
						{searchResults.length > 0 && (
							<div className="space-y-6">
								<h2 className="text-2xl font-semibold text-gray-800">
									{searchResults.length} Product Groups Found
								</h2>

								{searchResults.map((group, idx) => (
									<Card key={idx} className="overflow-hidden">
										<CardHeader className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white">
											<CardTitle className="text-xl">
												{group.productName}
											</CardTitle>
											<div className="flex gap-2 mt-2">
												{group.brand && (
													<Badge variant="secondary">{group.brand}</Badge>
												)}
												<Badge variant="secondary">{group.category}</Badge>
												<Badge variant="secondary">
													{group.variants.length} platform
													{group.variants.length > 1 ? "s" : ""}
												</Badge>
											</div>
										</CardHeader>
										<CardContent className="pt-6">
											<div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
												{group.variants.map((variant) => (
													<div
														key={variant._id}
														className="border rounded-lg p-4 hover:shadow-lg transition-shadow">
														{/* Platform Badge */}
														<Badge
															className={`${getPlatformColor(
																variant.platform
															)} text-white mb-3`}>
															{variant.platform.toUpperCase()}
														</Badge>

														{/* Image */}
														{variant.image && (
															<img
																src={variant.image}
																alt={variant.title}
																className="w-full h-48 object-contain mb-3 rounded"
															/>
														)}

														{/* Title */}
														<h3 className="font-semibold text-sm mb-2 line-clamp-2">
															{variant.title}
														</h3>

														{/* Price */}
														<div className="flex items-baseline gap-2 mb-2">
															<span className="text-2xl font-bold text-green-600">
																₹{variant.price.toLocaleString()}
															</span>
															{group.bestDeal._id === variant._id && (
																<Badge className="bg-green-500 text-white">
																	Best Price
																</Badge>
															)}
														</div>

														{/* Rating */}
														{variant.rating > 0 && (
															<div className="flex items-center gap-2 mb-3">
																<div className="flex items-center gap-1 bg-green-600 text-white px-2 py-1 rounded text-xs">
																	<span>⭐</span>
																	<span>{variant.rating.toFixed(1)}</span>
																</div>
																{variant.reviews > 0 && (
																	<span className="text-xs text-gray-500">
																		({variant.reviews.toLocaleString()} reviews)
																	</span>
																)}
															</div>
														)}

														{/* View Button */}
														<Button
															className="w-full"
															onClick={() =>
																window.open(variant.url, "_blank")
															}>
															View on {variant.platform}
														</Button>
													</div>
												))}
											</div>
										</CardContent>
									</Card>
								))}
							</div>
						)}

						{searchResults.length === 0 && !loading && searchQuery && (
							<Card>
								<CardContent className="py-12 text-center space-y-4">
									<p className="text-gray-500">
										No products found in database.
									</p>
									{shouldSuggestScraping && (
										<div className="space-y-3">
											<p className="text-sm text-gray-600">
												Try scraping live from platforms for fresh results!
											</p>
											<Button
												onClick={handleLiveScraping}
												disabled={scrapingLive}
												className="gap-2">
												{scrapingLive ? (
													<>
														<Loader2 className="w-4 h-4 animate-spin" />
														Scraping...
													</>
												) : (
													<>
														<Zap className="w-4 h-4" />
														Scrape Live from Platforms
													</>
												)}
											</Button>
										</div>
									)}
								</CardContent>
							</Card>
						)}
					</TabsContent>

					{/* Live Deals Tab */}
					<TabsContent value="deals">
						<Card>
							<CardHeader>
								<CardTitle className="flex items-center gap-2">
									<TrendingUp className="w-5 h-5" />
									Live Deals from All Platforms
								</CardTitle>
							</CardHeader>
							<CardContent>
								{dealsLoading ? (
									<div className="flex justify-center py-12">
										<Loader2 className="w-8 h-8 animate-spin text-blue-500" />
									</div>
								) : (
									<div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
										{liveDeals.map((deal) => (
											<div
												key={deal._id}
												className="border rounded-lg p-4 hover:shadow-lg transition-shadow">
												<Badge
													className={`${getPlatformColor(
														deal.platform
													)} text-white mb-3`}>
													{deal.platform.toUpperCase()}
												</Badge>

												{deal.image && (
													<img
														src={deal.image}
														alt={deal.title}
														className="w-full h-40 object-contain mb-3 rounded"
													/>
												)}

												<h3 className="font-semibold text-sm mb-2 line-clamp-2">
													{deal.title}
												</h3>

												<div className="text-2xl font-bold text-green-600 mb-2">
													₹{deal.price.toLocaleString()}
												</div>

												{deal.rating > 0 && (
													<div className="flex items-center gap-1 mb-3">
														<div className="flex items-center gap-1 bg-green-600 text-white px-2 py-1 rounded text-xs">
															<span>⭐</span>
															<span>{deal.rating.toFixed(1)}</span>
														</div>
													</div>
												)}

												<Button
													className="w-full"
													size="sm"
													onClick={() => window.open(deal.url, "_blank")}>
													View Deal
												</Button>
											</div>
										))}
									</div>
								)}
							</CardContent>
						</Card>
					</TabsContent>
				</Tabs>
			</div>
		</div>
	);
}
