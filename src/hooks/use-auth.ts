import { useMutation, useQuery } from "@tanstack/react-query";
import type {
  LoginRequest,
  RegisterRequest,
  ApiErrorResponse,
} from "@/types/auth.types";

export interface CurrentUser {
  id: string;
  email: string;
  name: string;
}

export function useCurrentUser() {
  return useQuery<CurrentUser>({
    queryKey: ["currentUser"],
    queryFn: async () => {
      const res = await fetch("/api/auth/me");
      if (!res.ok) throw new Error("Not authenticated");
      const json = await res.json();
      return json.data;
    },
    retry: false,
    staleTime: 5 * 60 * 1000,
  });
}

async function handleAuthResponse(res: Response) {
  const data = await res.json();

  if (!res.ok) {
    const error = data as ApiErrorResponse;
    const message =
      error.errors?.map((e) => e.message).join(", ") || error.message;
    throw new Error(message || "Something went wrong");
  }

  return data;
}

export function useLogin() {
  return useMutation({
    mutationFn: async (credentials: LoginRequest) => {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(credentials),
      });
      return handleAuthResponse(res);
    },
  });
}

export function useRegister() {
  return useMutation({
    mutationFn: async (input: RegisterRequest) => {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input),
      });
      return handleAuthResponse(res);
    },
  });
}

export function useLoginGoogle() {
  return useMutation({
    mutationFn: async (idToken: string) => {
      const res = await fetch("/api/auth/login-google", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idToken }),
      });
      return handleAuthResponse(res);
    },
  });
}

export function useLogout() {
  return useMutation({
    mutationFn: async () => {
      const res = await fetch("/api/auth/logout", { method: "POST" });
      return handleAuthResponse(res);
    },
  });
}

export function useRefreshToken() {
  return useMutation({
    mutationFn: async () => {
      const res = await fetch("/api/auth/refresh", { method: "POST" });
      return handleAuthResponse(res);
    },
  });
}
