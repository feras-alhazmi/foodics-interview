
module.exports = {
  devServer: {
    proxy: {
      "/api": {
        target: "https://api.foodics.dev/v5",
        changeOrigin: true,
        pathRewrite: { "^/api": "" },
      },
    },
  },
};