import { useGoogleLogin } from "@react-oauth/google";
import axios from "axios";
import { useNavigate } from "react-router-dom";

function Login() {
  const navigate = useNavigate();

  const googleLogin = useGoogleLogin({
    flow: "auth-code",

    onSuccess: async ({ code }) => {
      await axios.post(
        "http://localhost:3000/auth/google",
        { code },
        { withCredentials: true },
      );

      // redirect and reload client
      navigate("/dashboard");
      window.location.reload();
    },
  });

  return <button onClick={() => googleLogin()}>Login</button>;
}

export default Login;
