import "node:module";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { VitePWA } from "vite-plugin-pwa";
//#endregion
//#region package.json
var version = "1.0.0-rc.33";
//#endregion
//#region vite.config.ts
const __vite_injected_original_dirname = "/sessions/rcw-01eismghgtxpc3vh2mfbwcgz/mnt/one-job";
var vite_config_default = defineConfig(({ mode }) => ({
	base: mode === "production" ? "/app/" : mode === "capacitor" ? "./" : "/",
	build: { outDir: mode === "capacitor" ? "dist-native" : "app" },
	server: {
		host: true,
		port: 8080
	},
	plugins: [react(), mode !== "capacitor" && VitePWA({
		registerType: "autoUpdate",
		includeAssets: ["favicon.svg", "icons/apple-touch-icon.png"],
		manifest: {
			name: "One Job",
			short_name: "One Job",
			description: "See one task. Do one task. Feel accomplished.",
			theme_color: "#f9fafb",
			background_color: "#f9fafb",
			display: "standalone",
			orientation: "portrait",
			start_url: ".",
			scope: ".",
			icons: [
				{
					src: "icons/icon-192.png",
					sizes: "192x192",
					type: "image/png"
				},
				{
					src: "icons/icon-512.png",
					sizes: "512x512",
					type: "image/png"
				},
				{
					src: "icons/icon-maskable-512.png",
					sizes: "512x512",
					type: "image/png",
					purpose: "maskable"
				}
			]
		},
		workbox: { globPatterns: ["**/*.{js,css,html,svg,png}"] }
	})].filter(Boolean),
	resolve: { alias: { "@": path.resolve(__vite_injected_original_dirname, "./src") } },
	define: { __APP_VERSION__: JSON.stringify(version) },
	test: {
		environment: "jsdom",
		setupFiles: ["./src/test/setup.ts"]
	}
}));
//#endregion
export { vite_config_default as default };

//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidml0ZS5jb25maWcuanMiLCJuYW1lcyI6W10sInNvdXJjZXMiOlsiL3Nlc3Npb25zL3Jjdy0wMWVpc21naGd0eHBjM3ZoMm1mYndjZ3ovbW50L29uZS1qb2IvcGFja2FnZS5qc29uIiwiL3Nlc3Npb25zL3Jjdy0wMWVpc21naGd0eHBjM3ZoMm1mYndjZ3ovbW50L29uZS1qb2Ivdml0ZS5jb25maWcudHMiXSwic291cmNlc0NvbnRlbnQiOlsiIiwiLy8vIDxyZWZlcmVuY2UgdHlwZXM9XCJ2aXRlc3QvY29uZmlnXCIgLz5cbmltcG9ydCB7IGRlZmluZUNvbmZpZyB9IGZyb20gXCJ2aXRlXCI7XG5pbXBvcnQgeyB2ZXJzaW9uIH0gZnJvbSBcIi4vcGFja2FnZS5qc29uXCI7XG5pbXBvcnQgcmVhY3QgZnJvbSBcIkB2aXRlanMvcGx1Z2luLXJlYWN0LXN3Y1wiO1xuaW1wb3J0IHBhdGggZnJvbSBcInBhdGhcIjtcbmltcG9ydCB7IFZpdGVQV0EgfSBmcm9tIFwidml0ZS1wbHVnaW4tcHdhXCI7XG5cbi8vIGh0dHBzOi8vdml0ZWpzLmRldi9jb25maWcvXG5leHBvcnQgZGVmYXVsdCBkZWZpbmVDb25maWcoKHsgbW9kZSB9KSA9PiAoe1xuICAvLyAnY2FwYWNpdG9yJyBtb2RlIGJ1aWxkcyB0aGUgbmF0aXZlIChhcHAgc3RvcmUpIGJ1bmRsZTogcmVsYXRpdmUgYXNzZXRcbiAgLy8gcGF0aHMgZm9yIHRoZSBXZWJWaWV3J3MgbG9jYWwgZmlsZXMsIHNlcGFyYXRlIG91dHB1dCBkaXIsIG5vIHNlcnZpY2VcbiAgLy8gd29ya2VyIChhc3NldHMgYXJlIGFscmVhZHkgb24tZGV2aWNlKS5cbiAgYmFzZTogbW9kZSA9PT0gJ3Byb2R1Y3Rpb24nID8gJy9hcHAvJyA6IG1vZGUgPT09ICdjYXBhY2l0b3InID8gJy4vJyA6ICcvJyxcbiAgYnVpbGQ6IHtcbiAgICBvdXREaXI6IG1vZGUgPT09ICdjYXBhY2l0b3InID8gJ2Rpc3QtbmF0aXZlJyA6ICdhcHAnLFxuICB9LFxuICBzZXJ2ZXI6IHtcbiAgICAvLyBCaW5kIGFsbCBpbnRlcmZhY2VzIChJUHY0ICsgSVB2NikuIFRoZSBwcmV2aW91cyBcIjo6XCIgd2FzIElQdjYtb25seSxcbiAgICAvLyB3aGljaCBtYWRlIHRoZSBkZXYgc2VydmVyIHVucmVhY2hhYmxlIGZyb20gYnJvd3NlcnMgaGl0dGluZyAxMjcuMC4wLjEuXG4gICAgaG9zdDogdHJ1ZSxcbiAgICBwb3J0OiA4MDgwLFxuICB9LFxuICBwbHVnaW5zOiBbXG4gICAgcmVhY3QoKSxcbiAgICBtb2RlICE9PSAnY2FwYWNpdG9yJyAmJlxuICAgIFZpdGVQV0Eoe1xuICAgICAgcmVnaXN0ZXJUeXBlOiBcImF1dG9VcGRhdGVcIixcbiAgICAgIGluY2x1ZGVBc3NldHM6IFtcImZhdmljb24uc3ZnXCIsIFwiaWNvbnMvYXBwbGUtdG91Y2gtaWNvbi5wbmdcIl0sXG4gICAgICBtYW5pZmVzdDoge1xuICAgICAgICBuYW1lOiBcIk9uZSBKb2JcIixcbiAgICAgICAgc2hvcnRfbmFtZTogXCJPbmUgSm9iXCIsXG4gICAgICAgIGRlc2NyaXB0aW9uOiBcIlNlZSBvbmUgdGFzay4gRG8gb25lIHRhc2suIEZlZWwgYWNjb21wbGlzaGVkLlwiLFxuICAgICAgICAvLyBPbmUgY29udGludW91cyBzdXJmYWNlOiBjaHJvbWUgYW5kIHNwbGFzaCBtYXRjaCB0aGUgYXBwJ3NcbiAgICAgICAgLy8gZ3JheS01MCBiYWNrZ3JvdW5kIHNvIHRoZSBhcHAgbmV2ZXIgc2l0cyBpbnNpZGUgYSBjb2xvcmVkIGZyYW1lXG4gICAgICAgIHRoZW1lX2NvbG9yOiBcIiNmOWZhZmJcIixcbiAgICAgICAgYmFja2dyb3VuZF9jb2xvcjogXCIjZjlmYWZiXCIsXG4gICAgICAgIGRpc3BsYXk6IFwic3RhbmRhbG9uZVwiLFxuICAgICAgICBvcmllbnRhdGlvbjogXCJwb3J0cmFpdFwiLFxuICAgICAgICBzdGFydF91cmw6IFwiLlwiLFxuICAgICAgICBzY29wZTogXCIuXCIsXG4gICAgICAgIGljb25zOiBbXG4gICAgICAgICAgeyBzcmM6IFwiaWNvbnMvaWNvbi0xOTIucG5nXCIsIHNpemVzOiBcIjE5MngxOTJcIiwgdHlwZTogXCJpbWFnZS9wbmdcIiB9LFxuICAgICAgICAgIHsgc3JjOiBcImljb25zL2ljb24tNTEyLnBuZ1wiLCBzaXplczogXCI1MTJ4NTEyXCIsIHR5cGU6IFwiaW1hZ2UvcG5nXCIgfSxcbiAgICAgICAgICB7IHNyYzogXCJpY29ucy9pY29uLW1hc2thYmxlLTUxMi5wbmdcIiwgc2l6ZXM6IFwiNTEyeDUxMlwiLCB0eXBlOiBcImltYWdlL3BuZ1wiLCBwdXJwb3NlOiBcIm1hc2thYmxlXCIgfSxcbiAgICAgICAgXSxcbiAgICAgIH0sXG4gICAgICB3b3JrYm94OiB7XG4gICAgICAgIGdsb2JQYXR0ZXJuczogW1wiKiovKi57anMsY3NzLGh0bWwsc3ZnLHBuZ31cIl0sXG4gICAgICB9LFxuICAgIH0pLFxuICBdLmZpbHRlcihCb29sZWFuKSxcbiAgcmVzb2x2ZToge1xuICAgIGFsaWFzOiB7XG4gICAgICBcIkBcIjogcGF0aC5yZXNvbHZlKF9fZGlybmFtZSwgXCIuL3NyY1wiKSxcbiAgICB9LFxuICB9LFxuICBkZWZpbmU6IHtcbiAgICBfX0FQUF9WRVJTSU9OX186IEpTT04uc3RyaW5naWZ5KHZlcnNpb24pLFxuICB9LFxuICB0ZXN0OiB7XG4gICAgZW52aXJvbm1lbnQ6IFwianNkb21cIixcbiAgICAvLyBqc2RvbSBkZWZlcnMgbG9jYWxTdG9yYWdlIHRvIHRoZSBwbGF0Zm9ybSwgYW5kIE5vZGUgMjYncyBidWlsdC1pbiBpc1xuICAgIC8vIGluZXJ0IHdpdGhvdXQgLS1sb2NhbHN0b3JhZ2UtZmlsZS4gc2V0dXAudHMgaW5zdGFsbHMgYSBkZXRlcm1pbmlzdGljXG4gICAgLy8gaW4tbWVtb3J5IFN0b3JhZ2Ugc28gdGhlIHN1aXRlIGlzIE5vZGUtdmVyc2lvbiBpbmRlcGVuZGVudC5cbiAgICBzZXR1cEZpbGVzOiBbXCIuL3NyYy90ZXN0L3NldHVwLnRzXCJdLFxuICB9LFxufSkpO1xuIl0sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7O0FDQUEsTUFBTSxtQ0FBbUM7QUFRekMsSUFBQSxzQkFBZSxjQUFjLEVBQUUsWUFBWTtDQUl6QyxNQUFNLFNBQVMsZUFBZSxVQUFVLFNBQVMsY0FBYyxPQUFPO0NBQ3RFLE9BQU8sRUFDTCxRQUFRLFNBQVMsY0FBYyxnQkFBZ0IsTUFDakQ7Q0FDQSxRQUFRO0VBR04sTUFBTTtFQUNOLE1BQU07Q0FDUjtDQUNBLFNBQVMsQ0FDUCxNQUFNLEdBQ04sU0FBUyxlQUNULFFBQVE7RUFDTixjQUFjO0VBQ2QsZUFBZSxDQUFDLGVBQWUsNEJBQTRCO0VBQzNELFVBQVU7R0FDUixNQUFNO0dBQ04sWUFBWTtHQUNaLGFBQWE7R0FHYixhQUFhO0dBQ2Isa0JBQWtCO0dBQ2xCLFNBQVM7R0FDVCxhQUFhO0dBQ2IsV0FBVztHQUNYLE9BQU87R0FDUCxPQUFPO0lBQ0w7S0FBRSxLQUFLO0tBQXNCLE9BQU87S0FBVyxNQUFNO0lBQVk7SUFDakU7S0FBRSxLQUFLO0tBQXNCLE9BQU87S0FBVyxNQUFNO0lBQVk7SUFDakU7S0FBRSxLQUFLO0tBQStCLE9BQU87S0FBVyxNQUFNO0tBQWEsU0FBUztJQUFXO0dBQ2pHO0VBQ0Y7RUFDQSxTQUFTLEVBQ1AsY0FBYyxDQUFDLDRCQUE0QixFQUM3QztDQUNGLENBQUMsQ0FDSCxDQUFDLENBQUMsT0FBTyxPQUFPO0NBQ2hCLFNBQVMsRUFDUCxPQUFPLEVBQ0wsS0FBSyxLQUFLLFFBQUEsa0NBQW1CLE9BQU8sRUFDdEMsRUFDRjtDQUNBLFFBQVEsRUFDTixpQkFBaUIsS0FBSyxVQUFVLE9BQU8sRUFDekM7Q0FDQSxNQUFNO0VBQ0osYUFBYTtFQUliLFlBQVksQ0FBQyxxQkFBcUI7Q0FDcEM7QUFDRixFQUFFIn0=