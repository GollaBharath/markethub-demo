import axios from "axios";

const API = axios.create({
	baseURL: "http://localhost:5000/api",
});

// Attach token to every request
API.interceptors.request.use((config) => {
	const token = localStorage.getItem("token");
	if (token) {
		config.headers.Authorization = `Bearer ${token}`;
	}
	return config;
});

export default API;

// Export all API modules
export * from "./authApi";
export * from "./productApi";
export * from "./historyApi";
export * from "./alertApi";
export * from "./summaryApi";
export * from "./tracklistApi";
export * from "./dealApi";
