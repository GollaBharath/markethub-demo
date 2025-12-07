import { useEffect, useState } from "react";
import { Sparkles, TrendingDown, Tag, Flame, Bell } from "lucide-react";
import { getLiveDeals } from "@/api/dealApi";

interface TickerItem {
	icon: React.ReactNode;
	text: string;
	highlight?: boolean;
}

const fallbackTickerItems: TickerItem[] = [
	{
		icon: <Flame className="w-4 h-4 text-destructive" />,
		text: "🔥 Flipkart Big Billion Days Sale Coming Soon!",
		highlight: true,
	},
	{
		icon: <TrendingDown className="w-4 h-4 text-success" />,
		text: "iPhone 15 Pro dropped ₹5,000 on Amazon",
	},
	{
		icon: <Tag className="w-4 h-4 text-accent" />,
		text: "Sony WH-1000XM5 at lowest price ever!",
	},
	{
		icon: <Sparkles className="w-4 h-4 text-warning" />,
		text: "✨ New: Track prices from Ajio & Myntra",
	},
	{
		icon: <Bell className="w-4 h-4 text-info" />,
		text: "Over 45,000 products tracked today",
	},
	{
		icon: <TrendingDown className="w-4 h-4 text-success" />,
		text: "MacBook Air M3 - Best time to buy!",
	},
];

interface FloatingTickerProps {
	items?: TickerItem[];
	className?: string;
}

export function FloatingTicker({ items, className }: FloatingTickerProps) {
	const [tickerItems, setTickerItems] = useState<TickerItem[]>(
		items || fallbackTickerItems
	);

	useEffect(() => {
		if (items) return; // Don't fetch if items are provided

		const fetchDealsForTicker = async () => {
			try {
				const response = await getLiveDeals({ limit: 10 });

				if (response.deals && response.deals.length > 0) {
					const dealsTickerItems: TickerItem[] = response.deals
						.filter((deal) => deal.discount && deal.discount > 15)
						.slice(0, 6)
						.map((deal, index) => ({
							icon:
								index === 0 && deal.discount! > 30 ? (
									<Flame className="w-4 h-4 text-destructive" />
								) : (
									<TrendingDown className="w-4 h-4 text-success" />
								),
							text: `${deal.title} - ${deal.discount}% off on ${deal.platform}!`,
							highlight: index === 0 && deal.discount! > 30,
						}));

					if (dealsTickerItems.length > 0) {
						setTickerItems(dealsTickerItems);
					}
				}
			} catch (error) {
				console.error("Error fetching deals for ticker:", error);
				// Keep fallback items on error
			}
		};

		fetchDealsForTicker();
	}, [items]);

	const duplicatedItems = [...tickerItems, ...tickerItems];

	return (
		<div className={`floating-bar ${className}`}>
			<div className="ticker-content">
				{duplicatedItems.map((item, index) => (
					<div
						key={index}
						className={`flex items-center gap-2 px-4 py-1 rounded-full text-sm font-medium ${
							item.highlight
								? "bg-primary/10 text-primary border border-primary/20"
								: "text-muted-foreground"
						}`}>
						{item.icon}
						<span>{item.text}</span>
					</div>
				))}
			</div>
		</div>
	);
}
