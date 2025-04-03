import { removeItem } from "../localStorageWithExpiry";

export const logout = () => {
  // Remove user data from localStorage
  removeItem("user");
  // You can add any additional cleanup here
  // Redirect to login page
  window.location.href = "/login";
}; 