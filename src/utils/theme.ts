export const theme = {
  colors: {
    // Primary Navy Colors
    primary: {
      main: "#1E3A8A", // Navy blue
      light: "#3B82F6", // Lighter navy
      dark: "#1E293B", // Dark navy
      gradient: ["#1E3A8A", "#3B82F6"],
    },

    // Pastel Colors
    pastel: {
      pink: "#FCE7F3", // Light pink
      blue: "#DBEAFE", // Light blue
      green: "#D1FAE5", // Light green
      yellow: "#FEF3C7", // Light yellow
      purple: "#E9D5FF", // Light purple
      orange: "#FED7AA", // Light orange
      gray: "#F1F5F9", // Light gray
    },

    // Status Colors (softened)
    status: {
      success: "#059669", // Softer green
      warning: "#D97706", // Softer orange
      error: "#DC2626", // Softer red
      info: "#2563EB", // Softer blue
      pending: "#7C2D12", // Softer brown
    },

    // Text Colors
    text: {
      primary: "#1F2937", // Dark gray
      secondary: "#6B7280", // Medium gray
      light: "#9CA3AF", // Light gray
      inverse: "#FFFFFF", // White
      accent: "#1E3A8A", // Navy
    },

    // Background Colors
    background: {
      primary: "#FFFFFF", // White
      secondary: "#F8FAFC", // Very light gray
      tertiary: "#F1F5F9", // Light gray
      card: "#FFFFFF", // White
      overlay: "rgba(30, 58, 138, 0.1)", // Navy overlay
    },

    // Border Colors
    border: {
      light: "#E2E8F0", // Light border
      medium: "#CBD5E1", // Medium border
      dark: "#94A3B8", // Dark border
    },

    // Shadow
    shadow: {
      color: "#1E3A8A",
      opacity: 0.08,
    },
  },

  // Spacing
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    xxl: 48,
  },

  // Border Radius
  borderRadius: {
    sm: 8,
    md: 12,
    lg: 16,
    xl: 20,
    round: 50,
  },

  // Typography
  typography: {
    size: {
      xs: 10,
      sm: 12,
      md: 14,
      lg: 16,
      xl: 18,
      xxl: 20,
      title: 24,
      header: 28,
      hero: 32,
    },
    weight: {
      light: "300",
      normal: "400",
      medium: "500",
      semibold: "600",
      bold: "700",
      extrabold: "800",
    },
  },
};

export type Theme = typeof theme;
