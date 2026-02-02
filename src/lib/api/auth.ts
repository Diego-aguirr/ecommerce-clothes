interface ApiResponse {
  message: string;
}

async function post<T>(url: string, body: unknown): Promise<T> {
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.message || "Request failed");
  }

  return data;
}

export function forgotPassword(email: string) {
  return post<ApiResponse>("/api/auth/forgot-password", { email });
}

export function resetPassword(token: string, password: string) {
  return post<ApiResponse>("/api/auth/reset-password", {
    token,
    password,
  });
}

export function resendVerificationEmail() {
  return post<ApiResponse>("/api/auth/resend-verification", {});
}
