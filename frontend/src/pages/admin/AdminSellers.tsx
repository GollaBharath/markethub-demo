import { useEffect, useState } from "react";
import { Building2, UserCheck, Users } from "lucide-react";
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

export default function AdminSellers() {
	const [sellers, setSellers] = useState<any[]>([]);
	const [analytics, setAnalytics] = useState<any>(null);
	const [loading, setLoading] = useState(true);
	const { toast } = useToast();

	const fetchSellers = async () => {
		try {
			setLoading(true);
			const data = await adminApi.getAllSellers();
			setSellers(data.sellers);
			setAnalytics(data.analytics);
		} catch (error: any) {
			toast({
				title: "Error",
				description: error.response?.data?.error || "Failed to fetch sellers",
				variant: "destructive",
			});
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		fetchSellers();
	}, []);

	if (loading) {
		return (
			<div className="space-y-6 animate-fade-in">
				<h1 className="text-3xl font-display font-bold">Seller Analytics</h1>
				<p className="text-muted-foreground">Loading...</p>
			</div>
		);
	}

	return (
		<div className="space-y-6 animate-fade-in">
			<div>
				<h1 className="text-3xl font-display font-bold">Seller Analytics</h1>
				<p className="text-muted-foreground">Monitor all registered sellers</p>
			</div>

			{analytics && (
				<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
					<StatCard
						title="Total Sellers"
						value={analytics.totalSellers.toLocaleString()}
						icon={Building2}
						variant="primary"
					/>
					<StatCard
						title="Active Last 30 Days"
						value={analytics.activeLast30Days.toLocaleString()}
						icon={UserCheck}
						variant="success"
					/>
				</div>
			)}

			<Card>
				<CardHeader>
					<CardTitle>All Sellers ({sellers.length})</CardTitle>
				</CardHeader>
				<CardContent>
					<div className="overflow-x-auto">
						<Table>
							<TableHeader>
								<TableRow>
									<TableHead>Name</TableHead>
									<TableHead>Email</TableHead>
									<TableHead>Status</TableHead>
									<TableHead>Joined</TableHead>
									<TableHead>Last Login</TableHead>
								</TableRow>
							</TableHeader>
							<TableBody>
								{sellers.map((seller) => {
									const isActive =
										new Date(seller.lastLogin) >
										new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
									return (
										<TableRow key={seller.id}>
											<TableCell className="font-medium">
												{seller.name}
											</TableCell>
											<TableCell>{seller.email}</TableCell>
											<TableCell>
												<Badge variant={isActive ? "default" : "secondary"}>
													{isActive ? "Active" : "Inactive"}
												</Badge>
											</TableCell>
											<TableCell>
												{new Date(seller.joinedAt).toLocaleDateString()}
											</TableCell>
											<TableCell>
												{new Date(seller.lastLogin).toLocaleDateString()}
											</TableCell>
										</TableRow>
									);
								})}
							</TableBody>
						</Table>
					</div>
				</CardContent>
			</Card>
		</div>
	);
}
