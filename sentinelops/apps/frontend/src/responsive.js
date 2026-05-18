// responsive.js

export const getDeviceType = () => {
  const width = window.innerWidth;

  if (width <= 768) return "mobile";
  if (width <= 1024) return "tablet";
  return "desktop";
};