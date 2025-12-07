import { Link } from "react-router-dom";
import {
	TrendingDown,
	Bell,
	BarChart3,
	Shield,
	Users,
	Sparkles,
	ArrowRight,
	Star,
	ChevronRight,
	Tag,
	Zap,
	Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ProductCard } from "@/components/common/ProductCard";
import { useDeals } from "@/hooks/use-deals";

interface ProductData {
	id: string;
	name: string;
	category: string;
	image: string;
	rating: number;
	reviewCount: number;
	prices: {
		amazon?: { price: number; url: string } | null;
		flipkart?: { price: number; url: string } | null;
		meesho?: { price: number; url: string } | null;
		myntra?: { price: number; url: string } | null;
		ajio?: { price: number; url: string } | null;
	};
	buyRecommendation: string;
}

const features = [
	{
		icon: TrendingDown,
		title: "Price Tracking",
		description:
			"Monitor prices across Amazon, Flipkart, Meesho, Myntra & Ajio in real-time.",
		color: "bg-primary/10 text-primary",
	},
	{
		icon: BarChart3,
		title: "Price History",
		description:
			"View detailed price history charts to find the best time to buy.",
		color: "bg-success/10 text-success",
	},
	{
		icon: Bell,
		title: "Smart Alerts",
		description: "Get notified instantly when prices drop to your target.",
		color: "bg-warning/10 text-warning",
	},
	{
		icon: Users,
		title: "Seller Tools",
		description: "Competition analysis and insights for sellers to stay ahead.",
		color: "bg-accent/10 text-accent",
	},
	{
		icon: Shield,
		title: "Admin Dashboard",
		description: "Comprehensive analytics and management tools for admins.",
		color: "bg-info/10 text-info",
	},
	{
		icon: Zap,
		title: "Instant Updates",
		description: "Lightning-fast price updates from all major platforms.",
		color: "bg-destructive/10 text-destructive",
	},
];

const stores = [
	{
		name: "Amazon",
		emoji: "🛒",
		color: "bg-orange-100 text-orange-600 border-orange-200",
	},
	{
		name: "Flipkart",
		emoji: "🛍️",
		color: "bg-blue-100 text-blue-600 border-blue-200",
	},
	{
		name: "Meesho",
		emoji: "🎁",
		color: "bg-pink-100 text-pink-600 border-pink-200",
	},
	{
		name: "Myntra",
		emoji: "👗",
		color: "bg-rose-100 text-rose-600 border-rose-200",
	},
	{
		name: "Ajio",
		emoji: "👔",
		color: "bg-amber-100 text-amber-600 border-amber-200",
	},
];

export default function Landing() {
	const { products: trendingProducts, loading } = useDeals(8);

	return (
		<div className="min-h-screen">
			{/* Hero Section */}
			<section id="home" className="relative py-20 lg:py-32 overflow-hidden">
				{/* Background Elements */}
				<div className="absolute inset-0 -z-10">
					<div className="absolute top-20 left-10 w-72 h-72 bg-primary/10 rounded-full blur-3xl animate-float" />
					<div
						className="absolute bottom-20 right-10 w-96 h-96 bg-accent/10 rounded-full blur-3xl animate-float"
						style={{ animationDelay: "2s" }}
					/>
					<div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-secondary/20 rounded-full blur-3xl" />
				</div>

				<div id="home" className="container mx-auto px-4">
					<div className="max-w-4xl mx-auto text-center space-y-8">
						<Badge variant="secondary" className="px-4 py-2 text-sm">
							<Sparkles className="w-4 h-4 mr-2" />
							Track prices from 5 major platforms
						</Badge>

						<h1 className="text-4xl sm:text-5xl lg:text-6xl font-display font-bold leading-tight">
							Track Prices.
							<br />
							<span className="gradient-text">Save Money.</span>
						</h1>

						<p className="text-xl text-muted-foreground max-w-2xl mx-auto">
							Compare prices across Amazon, Flipkart, Meesho, Myntra & Ajio. Get
							alerts when prices drop. Shop smart, save more.
						</p>

						<div className="flex flex-wrap justify-center gap-4">
							<Button variant="hero" size="xl" asChild>
								<Link to="/register/user">
									Get Started Free
									<ArrowRight className="w-5 h-5 ml-2" />
								</Link>
							</Button>
							<Button variant="outline" size="xl" asChild>
								<Link to="/login/user">Sign In</Link>
							</Button>
						</div>

						{/* Store Badges */}
						<div className="flex flex-wrap justify-center gap-3 pt-8">
							{stores.map((store) => (
								<div
									key={store.name}
									className={`px-4 py-2 rounded-full border ${store.color} flex items-center gap-2 text-sm font-medium`}>
									<span>{store.emoji}</span>
									{store.name}
								</div>
							))}
						</div>
					</div>
				</div>
			</section>

			{/* Features Grid */}
			<section id="features" className="py-20 bg-muted/30">
				<div className="container mx-auto px-4">
					<div className="text-center mb-12">
						<Badge variant="outline" className="mb-4">
							Features
						</Badge>
						<h2 className="text-3xl lg:text-4xl font-display font-bold mb-4">
							Everything you need to save money
						</h2>
						<p className="text-muted-foreground max-w-2xl mx-auto">
							Powerful tools for shoppers, sellers, and administrators.
						</p>
					</div>

					<div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
						{features.map((feature) => (
							<Card key={feature.title} className="hover-lift border-border/50">
								<CardContent className="p-6 space-y-4">
									<div
										className={`w-12 h-12 rounded-xl ${feature.color} flex items-center justify-center`}>
										<feature.icon className="w-6 h-6" />
									</div>
									<h3 className="text-lg font-semibold">{feature.title}</h3>
									<p className="text-muted-foreground text-sm">
										{feature.description}
									</p>
								</CardContent>
							</Card>
						))}
					</div>
				</div>
			</section>

			{/* Trending Products */}
			<section id="deals" className="py-20">
				<div className="container mx-auto px-4">
					<div className="flex items-center justify-between mb-8">
						<div>
							<Badge variant="outline" className="mb-4">
								<Star className="w-3 h-3 mr-1 fill-warning text-warning" />
								Trending
							</Badge>
							<h2 className="text-3xl font-display font-bold">
								Hot deals right now
							</h2>
						</div>
						<Button variant="ghost" className="hidden sm:flex" asChild>
							<Link to="/login/user">
								View all
								<ChevronRight className="w-4 h-4 ml-1" />
							</Link>
						</Button>
					</div>

					{loading ? (
						<div className="flex justify-center items-center py-12">
							<Loader2 className="w-8 h-8 animate-spin text-primary" />
						</div>
					) : (
						<div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
							{trendingProducts.map((product) => (
								<ProductCard
									key={product.id}
									product={product}
									showActions={false}
								/>
							))}
						</div>
					)}
				</div>
			</section>

			{/* CTA Section */}
			<section className="py-20 bg-gradient-to-br from-primary/5 via-accent/5 to-secondary/5">
				<div className="container mx-auto px-4">
					<div className="max-w-3xl mx-auto text-center space-y-8">
						<Badge variant="secondary">
							<Tag className="w-4 h-4 mr-2" />
							Join thousands of smart shoppers
						</Badge>
						<h2 className="text-3xl lg:text-4xl font-display font-bold">
							Ready to start saving?
						</h2>
						<p className="text-lg text-muted-foreground">
							Create your free account and never miss a deal again.
						</p>
						<div className="flex flex-wrap justify-center gap-4">
							<Button variant="hero" size="lg" asChild>
								<Link to="/register/user">
									Create Free Account
									<ArrowRight className="w-5 h-5 ml-2" />
								</Link>
							</Button>
							<Button variant="outline" size="lg" asChild>
								<Link to="/register/seller">I'm a Seller</Link>
							</Button>
						</div>
					</div>
				</div>
			</section>
		</div>
	);
}
