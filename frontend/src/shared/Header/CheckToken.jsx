export const CheckToken = () => {
  if (localStorage.getItem("access_token")) {
    console.log(localStorage.getItem("access_token"));
    return true;
  } else {
    return false;
  }
};
