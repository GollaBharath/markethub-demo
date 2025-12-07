import axiosInstance from "./axiosInstance";

export const adminApi = {
	// Dashboard analytics
	getDashboardAnalytics: async () => {
		const { data } = await axiosInstance.get("/admin/analytics");
		return data;
	},

	// Users
	getAllUsers: async () => {
		const { data } = await axiosInstance.get("/admin/users");
		return data;
	},

	deleteUser: async (userId: string) => {
		const { data } = await axiosInstance.delete(`/admin/users/${userId}`);
		return data;
	},

	// Sellers
	getAllSellers: async () => {
		const { data } = await axiosInstance.get("/admin/sellers");
		return data;
	},

	// Products
	getAllProducts: async () => {
		const { data } = await axiosInstance.get("/admin/products");
		return data;
	},

	deleteProduct: async (productId: string) => {
		const { data } = await axiosInstance.delete(`/admin/products/${productId}`);
		return data;
	},

	updateProduct: async (productId: string, updates: any) => {
		const { data } = await axiosInstance.put(
			`/admin/products/${productId}`,
			updates
		);
		return data;
	},

	// Trends
	getSalesTrends: async () => {
		const { data } = await axiosInstance.get("/admin/trends");
		return data;
	},
};
