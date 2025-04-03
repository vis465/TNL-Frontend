

export const getItemWithExpiry = (key) => {
  
  const itemStr = localStorage.getItem(key);
  
  if (!itemStr) {
    return null;
  }
  const item = JSON.parse(itemStr);
  console.log("item", item);
  
  return item;
};

export const getUserRole = () => {
  const user = getItemWithExpiry("user");
  return user ? user.role : null;
};

export const removeItem = (key) => {
  localStorage.removeItem(key);
}; 