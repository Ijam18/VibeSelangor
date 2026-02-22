// vite.config.js
import { defineConfig } from "file:///E:/WebAPP/VibeOnboarding/node_modules/vite/dist/node/index.js";
import react from "file:///E:/WebAPP/VibeOnboarding/node_modules/@vitejs/plugin-react-swc/index.js";
import { VitePWA } from "file:///E:/WebAPP/VibeOnboarding/node_modules/vite-plugin-pwa/dist/index.js";
var vite_config_default = defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: "autoUpdate",
      includeAssets: ["selangor-parlimen.svg", "Threads_(app)_logo.svg.png"],
      manifest: {
        name: "VibeSelangor",
        short_name: "VibeSelangor",
        description: "Selangor Builder Sprint 2026 \u2014 Now Everyone Can Build (NECB)",
        start_url: "/",
        display: "standalone",
        background_color: "#0a0a0a",
        theme_color: "#CE1126",
        orientation: "portrait-primary",
        icons: [
          {
            src: "/icons/icon-192.png",
            sizes: "192x192",
            type: "image/png",
            purpose: "any maskable"
          },
          {
            src: "/icons/icon-512.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "any maskable"
          }
        ],
        shortcuts: [
          {
            name: "Builder Dashboard",
            short_name: "Dashboard",
            description: "Go to your builder dashboard",
            url: "/?page=dashboard",
            icons: [{ src: "/icons/icon-192.png", sizes: "192x192" }]
          },
          {
            name: "Builder Showcase",
            short_name: "Showcase",
            description: "View all builder projects",
            url: "/?page=showcase",
            icons: [{ src: "/icons/icon-192.png", sizes: "192x192" }]
          }
        ],
        categories: ["education", "productivity", "social"],
        lang: "ms-MY"
      },
      workbox: {
        globPatterns: ["**/*.{js,css,html,ico,png,svg,woff2}"],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
            handler: "CacheFirst",
            options: {
              cacheName: "google-fonts-cache",
              expiration: { maxEntries: 10, maxAgeSeconds: 60 * 60 * 24 * 365 },
              cacheableResponse: { statuses: [0, 200] }
            }
          },
          {
            urlPattern: /^https:\/\/fonts\.gstatic\.com\/.*/i,
            handler: "CacheFirst",
            options: {
              cacheName: "gstatic-fonts-cache",
              expiration: { maxEntries: 10, maxAgeSeconds: 60 * 60 * 24 * 365 },
              cacheableResponse: { statuses: [0, 200] }
            }
          }
        ]
      },
      devOptions: {
        enabled: false
        // Don't enable SW in dev to avoid caching issues
      }
    })
  ],
  server: {
    proxy: {
      "/api/kracked": {
        target: "https://krackeddevs.com",
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/kracked/, "")
      }
    }
  }
});
export {
  vite_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcuanMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCJFOlxcXFxXZWJBUFBcXFxcVmliZU9uYm9hcmRpbmdcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZmlsZW5hbWUgPSBcIkU6XFxcXFdlYkFQUFxcXFxWaWJlT25ib2FyZGluZ1xcXFx2aXRlLmNvbmZpZy5qc1wiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9pbXBvcnRfbWV0YV91cmwgPSBcImZpbGU6Ly8vRTovV2ViQVBQL1ZpYmVPbmJvYXJkaW5nL3ZpdGUuY29uZmlnLmpzXCI7aW1wb3J0IHsgZGVmaW5lQ29uZmlnIH0gZnJvbSAndml0ZSdcclxuaW1wb3J0IHJlYWN0IGZyb20gJ0B2aXRlanMvcGx1Z2luLXJlYWN0LXN3YydcclxuaW1wb3J0IHsgVml0ZVBXQSB9IGZyb20gJ3ZpdGUtcGx1Z2luLXB3YSdcclxuXHJcbi8vIGh0dHBzOi8vdml0ZS5kZXYvY29uZmlnL1xyXG5leHBvcnQgZGVmYXVsdCBkZWZpbmVDb25maWcoe1xyXG4gIHBsdWdpbnM6IFtcclxuICAgIHJlYWN0KCksXHJcbiAgICBWaXRlUFdBKHtcclxuICAgICAgcmVnaXN0ZXJUeXBlOiAnYXV0b1VwZGF0ZScsXHJcbiAgICAgIGluY2x1ZGVBc3NldHM6IFsnc2VsYW5nb3ItcGFybGltZW4uc3ZnJywgJ1RocmVhZHNfKGFwcClfbG9nby5zdmcucG5nJ10sXHJcbiAgICAgIG1hbmlmZXN0OiB7XHJcbiAgICAgICAgbmFtZTogJ1ZpYmVTZWxhbmdvcicsXHJcbiAgICAgICAgc2hvcnRfbmFtZTogJ1ZpYmVTZWxhbmdvcicsXHJcbiAgICAgICAgZGVzY3JpcHRpb246ICdTZWxhbmdvciBCdWlsZGVyIFNwcmludCAyMDI2IFx1MjAxNCBOb3cgRXZlcnlvbmUgQ2FuIEJ1aWxkIChORUNCKScsXHJcbiAgICAgICAgc3RhcnRfdXJsOiAnLycsXHJcbiAgICAgICAgZGlzcGxheTogJ3N0YW5kYWxvbmUnLFxyXG4gICAgICAgIGJhY2tncm91bmRfY29sb3I6ICcjMGEwYTBhJyxcclxuICAgICAgICB0aGVtZV9jb2xvcjogJyNDRTExMjYnLFxyXG4gICAgICAgIG9yaWVudGF0aW9uOiAncG9ydHJhaXQtcHJpbWFyeScsXHJcbiAgICAgICAgaWNvbnM6IFtcclxuICAgICAgICAgIHtcclxuICAgICAgICAgICAgc3JjOiAnL2ljb25zL2ljb24tMTkyLnBuZycsXHJcbiAgICAgICAgICAgIHNpemVzOiAnMTkyeDE5MicsXHJcbiAgICAgICAgICAgIHR5cGU6ICdpbWFnZS9wbmcnLFxyXG4gICAgICAgICAgICBwdXJwb3NlOiAnYW55IG1hc2thYmxlJ1xyXG4gICAgICAgICAgfSxcclxuICAgICAgICAgIHtcclxuICAgICAgICAgICAgc3JjOiAnL2ljb25zL2ljb24tNTEyLnBuZycsXHJcbiAgICAgICAgICAgIHNpemVzOiAnNTEyeDUxMicsXHJcbiAgICAgICAgICAgIHR5cGU6ICdpbWFnZS9wbmcnLFxyXG4gICAgICAgICAgICBwdXJwb3NlOiAnYW55IG1hc2thYmxlJ1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgIF0sXHJcbiAgICAgICAgc2hvcnRjdXRzOiBbXHJcbiAgICAgICAgICB7XHJcbiAgICAgICAgICAgIG5hbWU6ICdCdWlsZGVyIERhc2hib2FyZCcsXHJcbiAgICAgICAgICAgIHNob3J0X25hbWU6ICdEYXNoYm9hcmQnLFxyXG4gICAgICAgICAgICBkZXNjcmlwdGlvbjogJ0dvIHRvIHlvdXIgYnVpbGRlciBkYXNoYm9hcmQnLFxyXG4gICAgICAgICAgICB1cmw6ICcvP3BhZ2U9ZGFzaGJvYXJkJyxcclxuICAgICAgICAgICAgaWNvbnM6IFt7IHNyYzogJy9pY29ucy9pY29uLTE5Mi5wbmcnLCBzaXplczogJzE5MngxOTInIH1dXHJcbiAgICAgICAgICB9LFxyXG4gICAgICAgICAge1xyXG4gICAgICAgICAgICBuYW1lOiAnQnVpbGRlciBTaG93Y2FzZScsXHJcbiAgICAgICAgICAgIHNob3J0X25hbWU6ICdTaG93Y2FzZScsXHJcbiAgICAgICAgICAgIGRlc2NyaXB0aW9uOiAnVmlldyBhbGwgYnVpbGRlciBwcm9qZWN0cycsXHJcbiAgICAgICAgICAgIHVybDogJy8/cGFnZT1zaG93Y2FzZScsXHJcbiAgICAgICAgICAgIGljb25zOiBbeyBzcmM6ICcvaWNvbnMvaWNvbi0xOTIucG5nJywgc2l6ZXM6ICcxOTJ4MTkyJyB9XVxyXG4gICAgICAgICAgfVxyXG4gICAgICAgIF0sXHJcbiAgICAgICAgY2F0ZWdvcmllczogWydlZHVjYXRpb24nLCAncHJvZHVjdGl2aXR5JywgJ3NvY2lhbCddLFxyXG4gICAgICAgIGxhbmc6ICdtcy1NWScsXHJcbiAgICAgIH0sXHJcbiAgICAgIHdvcmtib3g6IHtcclxuICAgICAgICBnbG9iUGF0dGVybnM6IFsnKiovKi57anMsY3NzLGh0bWwsaWNvLHBuZyxzdmcsd29mZjJ9J10sXHJcbiAgICAgICAgcnVudGltZUNhY2hpbmc6IFtcclxuICAgICAgICAgIHtcclxuICAgICAgICAgICAgdXJsUGF0dGVybjogL15odHRwczpcXC9cXC9mb250c1xcLmdvb2dsZWFwaXNcXC5jb21cXC8uKi9pLFxyXG4gICAgICAgICAgICBoYW5kbGVyOiAnQ2FjaGVGaXJzdCcsXHJcbiAgICAgICAgICAgIG9wdGlvbnM6IHtcclxuICAgICAgICAgICAgICBjYWNoZU5hbWU6ICdnb29nbGUtZm9udHMtY2FjaGUnLFxyXG4gICAgICAgICAgICAgIGV4cGlyYXRpb246IHsgbWF4RW50cmllczogMTAsIG1heEFnZVNlY29uZHM6IDYwICogNjAgKiAyNCAqIDM2NSB9LFxyXG4gICAgICAgICAgICAgIGNhY2hlYWJsZVJlc3BvbnNlOiB7IHN0YXR1c2VzOiBbMCwgMjAwXSB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgIH0sXHJcbiAgICAgICAgICB7XHJcbiAgICAgICAgICAgIHVybFBhdHRlcm46IC9eaHR0cHM6XFwvXFwvZm9udHNcXC5nc3RhdGljXFwuY29tXFwvLiovaSxcclxuICAgICAgICAgICAgaGFuZGxlcjogJ0NhY2hlRmlyc3QnLFxyXG4gICAgICAgICAgICBvcHRpb25zOiB7XHJcbiAgICAgICAgICAgICAgY2FjaGVOYW1lOiAnZ3N0YXRpYy1mb250cy1jYWNoZScsXHJcbiAgICAgICAgICAgICAgZXhwaXJhdGlvbjogeyBtYXhFbnRyaWVzOiAxMCwgbWF4QWdlU2Vjb25kczogNjAgKiA2MCAqIDI0ICogMzY1IH0sXHJcbiAgICAgICAgICAgICAgY2FjaGVhYmxlUmVzcG9uc2U6IHsgc3RhdHVzZXM6IFswLCAyMDBdIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgfVxyXG4gICAgICAgIF1cclxuICAgICAgfSxcclxuICAgICAgZGV2T3B0aW9uczoge1xyXG4gICAgICAgIGVuYWJsZWQ6IGZhbHNlIC8vIERvbid0IGVuYWJsZSBTVyBpbiBkZXYgdG8gYXZvaWQgY2FjaGluZyBpc3N1ZXNcclxuICAgICAgfVxyXG4gICAgfSlcclxuICBdLFxyXG4gIHNlcnZlcjoge1xyXG4gICAgcHJveHk6IHtcclxuICAgICAgJy9hcGkva3JhY2tlZCc6IHtcclxuICAgICAgICB0YXJnZXQ6ICdodHRwczovL2tyYWNrZWRkZXZzLmNvbScsXHJcbiAgICAgICAgY2hhbmdlT3JpZ2luOiB0cnVlLFxyXG4gICAgICAgIHJld3JpdGU6IChwYXRoKSA9PiBwYXRoLnJlcGxhY2UoL15cXC9hcGlcXC9rcmFja2VkLywgJycpLFxyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgfVxyXG59KVxyXG5cclxuXHJcbiJdLAogICJtYXBwaW5ncyI6ICI7QUFBZ1EsU0FBUyxvQkFBb0I7QUFDN1IsT0FBTyxXQUFXO0FBQ2xCLFNBQVMsZUFBZTtBQUd4QixJQUFPLHNCQUFRLGFBQWE7QUFBQSxFQUMxQixTQUFTO0FBQUEsSUFDUCxNQUFNO0FBQUEsSUFDTixRQUFRO0FBQUEsTUFDTixjQUFjO0FBQUEsTUFDZCxlQUFlLENBQUMseUJBQXlCLDRCQUE0QjtBQUFBLE1BQ3JFLFVBQVU7QUFBQSxRQUNSLE1BQU07QUFBQSxRQUNOLFlBQVk7QUFBQSxRQUNaLGFBQWE7QUFBQSxRQUNiLFdBQVc7QUFBQSxRQUNYLFNBQVM7QUFBQSxRQUNULGtCQUFrQjtBQUFBLFFBQ2xCLGFBQWE7QUFBQSxRQUNiLGFBQWE7QUFBQSxRQUNiLE9BQU87QUFBQSxVQUNMO0FBQUEsWUFDRSxLQUFLO0FBQUEsWUFDTCxPQUFPO0FBQUEsWUFDUCxNQUFNO0FBQUEsWUFDTixTQUFTO0FBQUEsVUFDWDtBQUFBLFVBQ0E7QUFBQSxZQUNFLEtBQUs7QUFBQSxZQUNMLE9BQU87QUFBQSxZQUNQLE1BQU07QUFBQSxZQUNOLFNBQVM7QUFBQSxVQUNYO0FBQUEsUUFDRjtBQUFBLFFBQ0EsV0FBVztBQUFBLFVBQ1Q7QUFBQSxZQUNFLE1BQU07QUFBQSxZQUNOLFlBQVk7QUFBQSxZQUNaLGFBQWE7QUFBQSxZQUNiLEtBQUs7QUFBQSxZQUNMLE9BQU8sQ0FBQyxFQUFFLEtBQUssdUJBQXVCLE9BQU8sVUFBVSxDQUFDO0FBQUEsVUFDMUQ7QUFBQSxVQUNBO0FBQUEsWUFDRSxNQUFNO0FBQUEsWUFDTixZQUFZO0FBQUEsWUFDWixhQUFhO0FBQUEsWUFDYixLQUFLO0FBQUEsWUFDTCxPQUFPLENBQUMsRUFBRSxLQUFLLHVCQUF1QixPQUFPLFVBQVUsQ0FBQztBQUFBLFVBQzFEO0FBQUEsUUFDRjtBQUFBLFFBQ0EsWUFBWSxDQUFDLGFBQWEsZ0JBQWdCLFFBQVE7QUFBQSxRQUNsRCxNQUFNO0FBQUEsTUFDUjtBQUFBLE1BQ0EsU0FBUztBQUFBLFFBQ1AsY0FBYyxDQUFDLHNDQUFzQztBQUFBLFFBQ3JELGdCQUFnQjtBQUFBLFVBQ2Q7QUFBQSxZQUNFLFlBQVk7QUFBQSxZQUNaLFNBQVM7QUFBQSxZQUNULFNBQVM7QUFBQSxjQUNQLFdBQVc7QUFBQSxjQUNYLFlBQVksRUFBRSxZQUFZLElBQUksZUFBZSxLQUFLLEtBQUssS0FBSyxJQUFJO0FBQUEsY0FDaEUsbUJBQW1CLEVBQUUsVUFBVSxDQUFDLEdBQUcsR0FBRyxFQUFFO0FBQUEsWUFDMUM7QUFBQSxVQUNGO0FBQUEsVUFDQTtBQUFBLFlBQ0UsWUFBWTtBQUFBLFlBQ1osU0FBUztBQUFBLFlBQ1QsU0FBUztBQUFBLGNBQ1AsV0FBVztBQUFBLGNBQ1gsWUFBWSxFQUFFLFlBQVksSUFBSSxlQUFlLEtBQUssS0FBSyxLQUFLLElBQUk7QUFBQSxjQUNoRSxtQkFBbUIsRUFBRSxVQUFVLENBQUMsR0FBRyxHQUFHLEVBQUU7QUFBQSxZQUMxQztBQUFBLFVBQ0Y7QUFBQSxRQUNGO0FBQUEsTUFDRjtBQUFBLE1BQ0EsWUFBWTtBQUFBLFFBQ1YsU0FBUztBQUFBO0FBQUEsTUFDWDtBQUFBLElBQ0YsQ0FBQztBQUFBLEVBQ0g7QUFBQSxFQUNBLFFBQVE7QUFBQSxJQUNOLE9BQU87QUFBQSxNQUNMLGdCQUFnQjtBQUFBLFFBQ2QsUUFBUTtBQUFBLFFBQ1IsY0FBYztBQUFBLFFBQ2QsU0FBUyxDQUFDLFNBQVMsS0FBSyxRQUFRLG1CQUFtQixFQUFFO0FBQUEsTUFDdkQ7QUFBQSxJQUNGO0FBQUEsRUFDRjtBQUNGLENBQUM7IiwKICAibmFtZXMiOiBbXQp9Cg==
