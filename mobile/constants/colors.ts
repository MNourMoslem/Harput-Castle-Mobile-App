const Colors = {
  primary: "#2E4A22",        // deep forest green
  secondary: "#7A9A56",      // sage green
  accent: "#C4DC45",         // lime green — main accent (inspired by modern travel UI)
  background: "#F3F5EE",     // very light neutral green-white
  surface: "#FFFFFF",        // pure white for cards
  textPrimary: "#1A2415",    // near-black green
  textSecondary: "#6A7A58",  // muted olive
  textLight: "#FAF8F5",      // light text on dark backgrounds
  overlay: "rgba(15, 20, 8, 0.52)" as string,  // dark green overlay for hero images
  border: "#DDE8CE",         // soft green border
  visited: "#5D8A42",        // forest green for visited pins
  unvisited: "#C4DC45",      // lime for unvisited pins
  white: "#FFFFFF",
} as const;

export default Colors;
