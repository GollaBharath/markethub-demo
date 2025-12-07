import { useEffect, useState } from "react";
import { Activity, User, Package, Bell, Filter } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { adminApi } from "@/api/adminApi";
import { useToast } from "@/hooks/use-toast";

export default function AdminLogs() {
	const [logs, setLogs] = useState<any[]>([]);
	const [filteredLogs, setFilteredLogs] = useState<any[]>([]);
	const [loading, setLoading] = useState(true);
	const [filter, setFilter] = useState<string>("all");
	const { toast } = useToast();

	const fetchLogs = async () => {
		try {
			setLoading(true);
			const data = await adminApi.getSystemLogs();
			setLogs(data.logs);
			setFilteredLogs(data.logs);
		} catch (error: any) {
			toast({
				title: "Error",
				description: error.response?.data?.error || "Failed to fetch logs",
				variant: "destructive",
			});
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		fetchLogs();
	}, []);

	useEffect(() => {
		if (filter === "all") {
			setFilteredLogs(logs);
		} else {
			setFilteredLogs(logs.filter((log) => log.type === filter));
		}
	}, [filter, logs]);

	const getIcon = (type: string) => {
		switch (type) {
			case "user":
				return <User className="w-4 h-4" />;
			case "product":
				return <Package className="w-4 h-4" />;
			case "alert":
				return <Bell className="w-4 h-4" />;
			default:
				return <Activity className="w-4 h-4" />;
		}
	};

	const getVariant = (type: string) => {
		switch (type) {
			case "user":
				return "default";
			case "product":
				return "secondary";
			case "alert":
				return "outline";
			default:
				return "default";
		}
	};

	if (loading) {
		return (
			<div className="space-y-6 animate-fade-in">
				<h1 className="text-3xl font-display font-bold">System Logs</h1>
				<p className="text-muted-foreground">Loading...</p>
			</div>
		);
	}

	return (
		<div className="space-y-6 animate-fade-in">
			<div>
				<h1 className="text-3xl font-display font-bold">System Logs</h1>
				<p className="text-muted-foreground">Monitor all system activities</p>
			</div>

			<Card>
				<CardHeader>
					<div className="flex items-center justify-between">
						<CardTitle>Activity Log ({filteredLogs.length})</CardTitle>
						<div className="flex items-center gap-2">
							<Filter className="w-4 h-4 text-muted-foreground" />
							<Select value={filter} onValueChange={setFilter}>
								<SelectTrigger className="w-40">
									<SelectValue />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="all">All Activities</SelectItem>
									<SelectItem value="user">User Activities</SelectItem>
									<SelectItem value="product">Product Updates</SelectItem>
									<SelectItem value="alert">Alert Activities</SelectItem>
								</SelectContent>
							</Select>
						</div>
					</div>
				</CardHeader>
				<CardContent>
					<div className="space-y-3 max-h-[600px] overflow-y-auto">
						{filteredLogs.map((log) => (
							<div
								key={log.id}
								className="flex items-start gap-4 p-4 rounded-lg border bg-card hover:bg-accent/5 transition-colors">
								<div className="mt-1">{getIcon(log.type)}</div>
								<div className="flex-1 space-y-1">
									<div className="flex items-center gap-2">
										<Badge variant={getVariant(log.type)}>{log.type}</Badge>
										<Badge variant="outline">{log.action}</Badge>
									</div>
									<p className="text-sm">{log.description}</p>
									<p className="text-xs text-muted-foreground">
										{new Date(log.timestamp).toLocaleString()}
									</p>
								</div>
							</div>
						))}
					</div>
				</CardContent>
			</Card>

			<div className="grid md:grid-cols-3 gap-4">
				<Card>
					<CardContent className="pt-6">
						<div className="flex items-center gap-3">
							<div className="p-3 rounded-lg bg-primary/10">
								<User className="w-5 h-5 text-primary" />
							</div>
							<div>
								<p className="text-2xl font-bold">
									{logs.filter((l) => l.type === "user").length}
								</p>
								<p className="text-sm text-muted-foreground">User Activities</p>
							</div>
						</div>
					</CardContent>
				</Card>

				<Card>
					<CardContent className="pt-6">
						<div className="flex items-center gap-3">
							<div className="p-3 rounded-lg bg-success/10">
								<Package className="w-5 h-5 text-success" />
							</div>
							<div>
								<p className="text-2xl font-bold">
									{logs.filter((l) => l.type === "product").length}
								</p>
								<p className="text-sm text-muted-foreground">Product Updates</p>
							</div>
						</div>
					</CardContent>
				</Card>

				<Card>
					<CardContent className="pt-6">
						<div className="flex items-center gap-3">
							<div className="p-3 rounded-lg bg-warning/10">
								<Bell className="w-5 h-5 text-warning" />
							</div>
							<div>
								<p className="text-2xl font-bold">
									{logs.filter((l) => l.type === "alert").length}
								</p>
								<p className="text-sm text-muted-foreground">
									Alert Activities
								</p>
							</div>
						</div>
					</CardContent>
				</Card>
			</div>
		</div>
	);
}
