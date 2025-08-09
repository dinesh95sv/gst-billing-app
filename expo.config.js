module.exports = {
  name: "GST Billing App",
  slug: "gst-billing-app",
  version: "1.0.0",
  orientation: "portrait",
  icon: "./assets/icon.png",
  userInterfaceStyle: "light",
  splash: {
    image: "./assets/icon.png",
    resizeMode: "contain",
    backgroundColor: "#ffffff"
  },
  updates: {
    fallbackToCacheTimeout: 0
  },
  assetBundlePatterns: [
    "**/*"
  ],
  ios: {
    supportsTablet: true,
    bundleIdentifier: "com.dinesh95sv.gstbillingapp",
  },
  android: {
    package: "com.dinesh95sv.gstbillingapp",
    adaptiveIcon: {
      foregroundImage: "./assets/icon.png",
      backgroundColor: "#ffffff"
    },
  },
  web: {
    favicon: "./assets/icon.png"
  },
  extra: {
    // Custom values to expose in your app
    supportsGST: true,
    buildYear: 2025,
  },
};