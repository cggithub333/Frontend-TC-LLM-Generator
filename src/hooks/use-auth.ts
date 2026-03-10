import { useMutation } from "@tanstack/react-query";
import type {
  LoginRequest,
  RegisterRequest,
  ApiErrorResponse,
} from "@/types/auth.types";

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
    mutationFn: async (input: LoginRequest) => {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input),
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
