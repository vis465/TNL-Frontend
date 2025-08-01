import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function RedirectBasedOnHost() {
  const navigate = useNavigate();

  useEffect(() => {
    const host = window.location.hostname;
    const path = window.location.pathname;

    if (
      (host === "events.tamilnadulogistics.in" || (host === "localhost" && path === "/abs")) &&
      path === "/"
    ) {
      navigate("/events");
    } else if (
      (host === "tamilnadulogistics.in" || (host === "localhost" && path === "/abd")) &&
      path === "/"
    ) {
      navigate("/");
    }
  }, [navigate]);

  return null;
}
