import { useEffect, useState } from "react";
import { Package, Plus, Edit, Trash2, Search } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
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
import { Label } from "@/components/ui/label";
import { adminApi } from "@/api/adminApi";
import { useToast } from "@/hooks/use-toast";

export default function AdminManage() {
	const [products, setProducts] = useState<any[]>([]);
	const [filteredProducts, setFilteredProducts] = useState<any[]>([]);
	const [loading, setLoading] = useState(true);
	const [searchTerm, setSearchTerm] = useState("");
	const [editDialogOpen, setEditDialogOpen] = useState(false);
	const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
	const [selectedProduct, setSelectedProduct] = useState<any>(null);
	const [editForm, setEditForm] = useState<any>({});
	const { toast } = useToast();

	const fetchProducts = async () => {
		try {
			setLoading(true);
			const data = await adminApi.getAllProducts();
			setProducts(data.products);
			setFilteredProducts(data.products);
		} catch (error: any) {
			toast({
				title: "Error",
				description: error.response?.data?.error || "Failed to fetch products",
				variant: "destructive",
			});
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		fetchProducts();
	}, []);

	useEffect(() => {
		if (searchTerm) {
			setFilteredProducts(
				products.filter(
					(p) =>
						p.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
						p.platform.toLowerCase().includes(searchTerm.toLowerCase()) ||
						p.category?.toLowerCase().includes(searchTerm.toLowerCase())
				)
			);
		} else {
			setFilteredProducts(products);
		}
	}, [searchTerm, products]);

	const handleEditClick = (product: any) => {
		setSelectedProduct(product);
		setEditForm({
			title: product.title,
			price: product.price,
			originalPrice: product.originalPrice,
			discount: product.discount,
			category: product.category,
			brand: product.brand,
		});
		setEditDialogOpen(true);
	};

	const handleDeleteClick = (product: any) => {
		setSelectedProduct(product);
		setDeleteDialogOpen(true);
	};

	const handleSaveEdit = async () => {
		if (!selectedProduct) return;

		try {
			await adminApi.updateProduct(selectedProduct.id, editForm);
			toast({
				title: "Success",
				description: "Product updated successfully",
			});
			fetchProducts();
			setEditDialogOpen(false);
		} catch (error: any) {
			toast({
				title: "Error",
				description: error.response?.data?.error || "Failed to update product",
				variant: "destructive",
			});
		}
	};

	const handleDeleteConfirm = async () => {
		if (!selectedProduct) return;

		try {
			await adminApi.deleteProduct(selectedProduct.id);
			toast({
				title: "Success",
				description: "Product deleted successfully",
			});
			fetchProducts();
		} catch (error: any) {
			toast({
				title: "Error",
				description: error.response?.data?.error || "Failed to delete product",
				variant: "destructive",
			});
		} finally {
			setDeleteDialogOpen(false);
			setSelectedProduct(null);
		}
	};

	if (loading) {
		return (
			<div className="space-y-6 animate-fade-in">
				<h1 className="text-3xl font-display font-bold">Product CRUD</h1>
				<p className="text-muted-foreground">Loading...</p>
			</div>
		);
	}

	return (
		<div className="space-y-6 animate-fade-in">
			<div>
				<h1 className="text-3xl font-display font-bold">Product CRUD</h1>
				<p className="text-muted-foreground">Manage product database</p>
			</div>

			<Card>
				<CardHeader>
					<div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
						<CardTitle>All Products ({filteredProducts.length})</CardTitle>
						<div className="flex items-center gap-2">
							<div className="relative flex-1 md:w-80">
								<Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
								<Input
									placeholder="Search products..."
									value={searchTerm}
									onChange={(e) => setSearchTerm(e.target.value)}
									className="pl-9"
								/>
							</div>
						</div>
					</div>
				</CardHeader>
				<CardContent>
					<div className="overflow-x-auto">
						<Table>
							<TableHeader>
								<TableRow>
									<TableHead>Product</TableHead>
									<TableHead>Platform</TableHead>
									<TableHead>Category</TableHead>
									<TableHead>Brand</TableHead>
									<TableHead>Price</TableHead>
									<TableHead>Discount</TableHead>
									<TableHead>Actions</TableHead>
								</TableRow>
							</TableHeader>
							<TableBody>
								{filteredProducts.slice(0, 50).map((product) => (
									<TableRow key={product.id}>
										<TableCell className="font-medium max-w-xs">
											<div className="truncate">{product.title}</div>
										</TableCell>
										<TableCell>
											<Badge variant="outline">{product.platform}</Badge>
										</TableCell>
										<TableCell>
											<Badge variant="secondary">
												{product.category || "N/A"}
											</Badge>
										</TableCell>
										<TableCell>{product.brand || "N/A"}</TableCell>
										<TableCell>₹{product.price?.toLocaleString()}</TableCell>
										<TableCell>
											{product.discount ? (
												<span className="text-success">
													{product.discount}%
												</span>
											) : (
												"N/A"
											)}
										</TableCell>
										<TableCell>
											<div className="flex items-center gap-2">
												<Button
													variant="outline"
													size="sm"
													onClick={() => handleEditClick(product)}>
													<Edit className="w-4 h-4" />
												</Button>
												<Button
													variant="destructive"
													size="sm"
													onClick={() => handleDeleteClick(product)}>
													<Trash2 className="w-4 h-4" />
												</Button>
											</div>
										</TableCell>
									</TableRow>
								))}
							</TableBody>
						</Table>
					</div>
				</CardContent>
			</Card>

			<Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>Edit Product</DialogTitle>
						<DialogDescription>Update product information</DialogDescription>
					</DialogHeader>
					<div className="space-y-4">
						<div className="space-y-2">
							<Label>Title</Label>
							<Input
								value={editForm.title || ""}
								onChange={(e) =>
									setEditForm({ ...editForm, title: e.target.value })
								}
							/>
						</div>
						<div className="grid grid-cols-2 gap-4">
							<div className="space-y-2">
								<Label>Price</Label>
								<Input
									type="number"
									value={editForm.price || ""}
									onChange={(e) =>
										setEditForm({ ...editForm, price: Number(e.target.value) })
									}
								/>
							</div>
							<div className="space-y-2">
								<Label>Original Price</Label>
								<Input
									type="number"
									value={editForm.originalPrice || ""}
									onChange={(e) =>
										setEditForm({
											...editForm,
											originalPrice: Number(e.target.value),
										})
									}
								/>
							</div>
						</div>
						<div className="space-y-2">
							<Label>Discount %</Label>
							<Input
								type="number"
								value={editForm.discount || ""}
								onChange={(e) =>
									setEditForm({ ...editForm, discount: Number(e.target.value) })
								}
							/>
						</div>
						<div className="space-y-2">
							<Label>Category</Label>
							<Input
								value={editForm.category || ""}
								onChange={(e) =>
									setEditForm({ ...editForm, category: e.target.value })
								}
							/>
						</div>
						<div className="space-y-2">
							<Label>Brand</Label>
							<Input
								value={editForm.brand || ""}
								onChange={(e) =>
									setEditForm({ ...editForm, brand: e.target.value })
								}
							/>
						</div>
					</div>
					<DialogFooter>
						<Button variant="outline" onClick={() => setEditDialogOpen(false)}>
							Cancel
						</Button>
						<Button onClick={handleSaveEdit}>Save Changes</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>

			<AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
				<AlertDialogContent>
					<AlertDialogHeader>
						<AlertDialogTitle>Are you sure?</AlertDialogTitle>
						<AlertDialogDescription>
							This action cannot be undone. This will permanently delete the
							product from the database.
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
