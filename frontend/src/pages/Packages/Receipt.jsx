import Header from "../../shared/Header/Header.jsx";
import { useNavigate, useParams } from "react-router-dom";

export default function RecipePage() {
  let { id } = useParams();
  let navigate = useNavigate();

  return (
    <>
      Заказ {id} принят
      <button
        onClick={() => {
          navigate("/profile");
        }}
      >
        В личный кабинет
      </button>
    </>
  );
}
