import { Outlet, Link } from "react-router-dom";
import {
	ShoppingBag,
	User,
	Building2,
	Shield,
	Github,
	Twitter,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { FloatingTicker } from "@/components/common/FloatingTicker";

export function PublicLayout() {
	return (
		<div className="min-h-screen bg-background flex flex-col">
			{/* Floating Ticker */}
			<FloatingTicker />

			{/* Header */}
			<header className="sticky top-0 z-50 bg-background/80 backdrop-blur-xl border-b border-border">
				<div className="container mx-auto px-4 h-16 flex items-center justify-between">
					<Link to="/" className="flex items-center gap-2">
						<div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center">
							<ShoppingBag className="w-5 h-5 text-primary-foreground" />
						</div>
						<span className="text-xl font-display font-bold gradient-text">
							MarketHub
						</span>
					</Link>

					<nav className="hidden md:flex items-center gap-6">
						<a
							href="/#home"
							className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
							Home
						</a>
						<a
							href="/#features"
							className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
							Features
						</a>
						<a
							href="/#deals"
							className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
							Deals
						</a>
					</nav>

					<div className="flex items-center gap-2">
						<Button variant="ghost" size="sm" asChild>
							<Link to="/login/user" className="flex items-center gap-2">
								<User className="w-4 h-4" />
								<span className="hidden sm:inline">User</span>
							</Link>
						</Button>
						<Button variant="ghost" size="sm" asChild>
							<Link to="/login/seller" className="flex items-center gap-2">
								<Building2 className="w-4 h-4" />
								<span className="hidden sm:inline">Seller</span>
							</Link>
						</Button>
						<Button variant="default" size="sm" asChild>
							<Link to="/login/admin" className="flex items-center gap-2">
								<Shield className="w-4 h-4" />
								<span className="hidden sm:inline">Admin</span>
							</Link>
						</Button>
					</div>
				</div>
			</header>

			{/* Main Content */}
			<main className="flex-1">
				<Outlet />
			</main>

			{/* Footer */}
			<footer className="bg-card border-t border-border">
				<div className="container mx-auto px-4 py-12">
					<div className="grid grid-cols-1 md:grid-cols-4 gap-8">
						<div className="space-y-4">
							<div className="flex items-center gap-2">
								<div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center">
									<ShoppingBag className="w-4 h-4 text-primary-foreground" />
								</div>
								<span className="font-display font-bold">MarketHub</span>
							</div>
							<p className="text-sm text-muted-foreground">
								Track prices across India's top e-commerce platforms. Save
								money, shop smart.
							</p>
						</div>

						<div>
							<h4 className="font-semibold mb-4">Platforms</h4>
							<ul className="space-y-2 text-sm text-muted-foreground">
								<li>Amazon India</li>
								<li>Flipkart</li>
								<li>Meesho</li>
								<li>Myntra</li>
								<li>Ajio</li>
							</ul>
						</div>

						<div>
							<h4 className="font-semibold mb-4">Features</h4>
							<ul className="space-y-2 text-sm text-muted-foreground">
								<li>Price Tracking</li>
								<li>Price Alerts</li>
								<li>Price History</li>
								<li>Seller Tools</li>
								<li>Analytics</li>
							</ul>
						</div>

						<div>
							<h4 className="font-semibold mb-4">Connect</h4>
							<div className="flex gap-3">
								<Button variant="outline" size="icon" className="rounded-full">
									<Twitter className="w-4 h-4" />
								</Button>
								<Button variant="outline" size="icon" className="rounded-full">
									<Github className="w-4 h-4" />
								</Button>
							</div>
						</div>
					</div>

					<div className="mt-8 pt-8 border-t border-border text-center text-sm text-muted-foreground">
						<p>© 2024 MarketHub. All rights reserved.</p>
					</div>
				</div>
			</footer>
		</div>
	);
}
