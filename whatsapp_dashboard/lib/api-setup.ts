
import { useEffect } from "react";
import { setAuthTokenGetter } from "@workspace/api-client-react";
import { useAuth } from "../hooks/use-auth";

export function ApiSetup() {
  const { token } = useAuth();
  
  useEffect(() => {
    setAuthTokenGetter(() => token);
  }, [token]);
  
  return null;
}
