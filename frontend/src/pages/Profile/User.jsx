import Header from "../../shared/Header/Header.jsx";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function User() {
  let navigate = useNavigate();

  useEffect(() => {
    if (!localStorage.getItem("access_token")) {
      navigate("/login");
    }
  }, []);

  return (
    <>
      <Header />
      <p></p>
    </>
  );
}
