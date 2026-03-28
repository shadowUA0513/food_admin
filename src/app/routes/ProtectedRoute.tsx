import { type PropsWithChildren, useEffect } from "react";

interface ProtectedRouteProps extends PropsWithChildren {
  isAllowed: boolean;
  onDeny: () => void;
}

export function ProtectedRoute({ children, isAllowed, onDeny }: ProtectedRouteProps) {
  useEffect(() => {
    if (!isAllowed) {
      onDeny();
    }
  }, [isAllowed, onDeny]);

  if (!isAllowed) {
    return null;
  }

  return children;
}
