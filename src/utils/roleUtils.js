export const getLoggedInUserRole = () => {
  const userData = localStorage.getItem("loggedInUser");
  if (!userData) return "";

  try {
    return JSON.parse(userData)?.role || "";
  } catch (error) {
    console.error("Invalid loggedInUser JSON in localStorage:", error);
    return "";
  }
};

export const isSuperUserRole = () => {
  return String(getLoggedInUserRole() || "").trim().toUpperCase() === "SUPER_USER";
};
