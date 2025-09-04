export const CheckToken = () => {
  if (localStorage.getItem("access_token")) {
    return true;
  } else {
    console.log("xuesus");
  }
};
