import { History, Search, Trash2, X } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useAppStore } from "@/store/appStore";

export default function UserHistory() {
	const navigate = useNavigate();
	const { searchHistory } = useAppStore();

	const handleSearchAgain = (query: string) => {
		navigate(`/user/search?q=${encodeURIComponent(query)}`);
	};

	return (
		<div className="space-y-6 animate-fade-in">
			<div className="flex items-center justify-between">
				<div>
					<h1 className="text-3xl font-display font-bold">Search History</h1>
					<p className="text-muted-foreground">Your recent product searches</p>
				</div>
			</div>

			{searchHistory.length === 0 ? (
				<Card className="py-12">
					<CardContent className="text-center space-y-4">
						<History className="w-12 h-12 mx-auto text-muted-foreground" />
						<h2 className="text-xl font-semibold">No search history</h2>
						<p className="text-muted-foreground">
							Your searches will appear here
						</p>
					</CardContent>
				</Card>
			) : (
				<div className="space-y-3">
					{searchHistory.map((item) => (
						<Card key={item.id} className="hover:shadow-md transition-shadow">
							<CardContent className="p-4">
								<div className="flex items-center justify-between">
									<div className="flex items-center gap-3">
										<div className="p-2 rounded-xl bg-muted">
											<Search className="w-4 h-4 text-muted-foreground" />
										</div>
										<div>
											<p className="font-medium">{item.query}</p>
											<p className="text-xs text-muted-foreground">
												{new Date(item.timestamp).toLocaleString()}
											</p>
										</div>
									</div>
									<Button
										variant="outline"
										size="sm"
										onClick={() => handleSearchAgain(item.query)}>
										<Search className="w-4 h-4 mr-2" />
										Search Again
									</Button>
								</div>
							</CardContent>
						</Card>
					))}
				</div>
			)}
		</div>
	);
}
