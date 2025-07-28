// Utility to join class names conditionally
export function cn(...args) {
  return args.filter(Boolean).join(" ");
}
