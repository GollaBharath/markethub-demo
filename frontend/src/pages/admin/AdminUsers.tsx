import { useEffect, useState } from "react";
import { Users, TrendingUp, UserCheck } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatCard } from "@/components/common/StatCard";
import { Button } from "@/components/ui/button";
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
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export default function AdminUsers() {
	const [users, setUsers] = useState<any[]>([]);
	const [analytics, setAnalytics] = useState<any>(null);
	const [loading, setLoading] = useState(true);
	const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
	const [userToDelete, setUserToDelete] = useState<string | null>(null);
	const { toast } = useToast();

	const fetchUsers = async () => {
		try {
			setLoading(true);
			const data = await adminApi.getAllUsers();
			setUsers(data.users);
			setAnalytics(data.analytics);
		} catch (error: any) {
			toast({
				title: "Error",
				description: error.response?.data?.error || "Failed to fetch users",
				variant: "destructive",
			});
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		fetchUsers();
	}, []);

	const handleDeleteClick = (userId: string) => {
		setUserToDelete(userId);
		setDeleteDialogOpen(true);
	};

	const handleDeleteConfirm = async () => {
		if (!userToDelete) return;

		try {
			await adminApi.deleteUser(userToDelete);
			toast({
				title: "Success",
				description: "User deleted successfully",
			});
			fetchUsers();
		} catch (error: any) {
			toast({
				title: "Error",
				description: error.response?.data?.error || "Failed to delete user",
				variant: "destructive",
			});
		} finally {
			setDeleteDialogOpen(false);
			setUserToDelete(null);
		}
	};

	if (loading) {
		return (
			<div className="space-y-6 animate-fade-in">
				<h1 className="text-3xl font-display font-bold">User Analytics</h1>
				<p className="text-muted-foreground">Loading...</p>
			</div>
		);
	}

	return (
		<div className="space-y-6 animate-fade-in">
			<div>
				<h1 className="text-3xl font-display font-bold">User Analytics</h1>
				<p className="text-muted-foreground">Manage and monitor all users</p>
			</div>

			{analytics && (
				<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
					<StatCard
						title="Total Users"
						value={analytics.totalUsers.toLocaleString()}
						icon={Users}
						variant="primary"
					/>
					<StatCard
						title="Active Last 30 Days"
						value={analytics.activeLast30Days.toLocaleString()}
						icon={UserCheck}
						variant="success"
					/>
					<StatCard
						title="Avg Tracklist Size"
						value={analytics.avgTracklistSize.toFixed(1)}
						icon={TrendingUp}
						variant="info"
					/>
				</div>
			)}

			<Card>
				<CardHeader>
					<CardTitle>All Users ({users.length})</CardTitle>
				</CardHeader>
				<CardContent>
					<div className="overflow-x-auto">
						<Table>
							<TableHeader>
								<TableRow>
									<TableHead>Name</TableHead>
									<TableHead>Email</TableHead>
									<TableHead>Role</TableHead>
									<TableHead>Tracklist Items</TableHead>
									<TableHead>Joined</TableHead>
									<TableHead>Last Login</TableHead>
									<TableHead>Actions</TableHead>
								</TableRow>
							</TableHeader>
							<TableBody>
								{users.map((user) => (
									<TableRow key={user.id}>
										<TableCell className="font-medium">{user.name}</TableCell>
										<TableCell>{user.email}</TableCell>
										<TableCell>
											<Badge
												variant={
													user.role === "user" ? "default" : "secondary"
												}>
												{user.role}
											</Badge>
										</TableCell>
										<TableCell>{user.tracklistCount}</TableCell>
										<TableCell>
											{new Date(user.joinedAt).toLocaleDateString()}
										</TableCell>
										<TableCell>
											{new Date(user.lastLogin).toLocaleDateString()}
										</TableCell>
										<TableCell>
											<Button
												variant="destructive"
												size="sm"
												onClick={() => handleDeleteClick(user.id)}>
												Delete
											</Button>
										</TableCell>
									</TableRow>
								))}
							</TableBody>
						</Table>
					</div>
				</CardContent>
			</Card>

			<AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
				<AlertDialogContent>
					<AlertDialogHeader>
						<AlertDialogTitle>Are you sure?</AlertDialogTitle>
						<AlertDialogDescription>
							This action cannot be undone. This will permanently delete the
							user and all their data.
						</AlertDialogDescription>
					</AlertDialogHeader>
					<AlertDialogFooter>
						<AlertDialogCancel>Cancel</AlertDialogCancel>
						<AlertDialogAction onClick={handleDeleteConfirm}>
							Delete
						</AlertDialogAction>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>
		</div>
	);
}
