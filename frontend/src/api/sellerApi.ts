import axiosInstance from "./axiosInstance";

export const sellerApi = {
	// Dashboard
	getDashboard: async () => {
		const { data } = await axiosInstance.get("/seller/dashboard");
		return data;
	},

	// Competition analysis
	getCompetition: async () => {
		const { data } = await axiosInstance.get("/seller/competition");
		return data;
	},

	// Trending products
	getTrending: async () => {
		const { data } = await axiosInstance.get("/seller/trending");
		return data;
	},

	// Customer interests
	getInterests: async () => {
		const { data } = await axiosInstance.get("/seller/interests");
		return data;
	},

	// Sales insights
	getInsights: async () => {
		const { data } = await axiosInstance.get("/seller/insights");
		return data;
	},
};
