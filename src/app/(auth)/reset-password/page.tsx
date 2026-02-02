import ResetPasswordForm from "@/app/(auth)/reset-password/ui/ResetPasswordForm";

export default function ResetPasswordPage({
  searchParams,
}: {
  searchParams: { token?: string };
}) {
  const token = searchParams.token;

  if (!token) {
    return <p className="text-red-600">Token inválido</p>;
  }

  return (
    <div className="max-w-md mx-auto mt-20">
      <ResetPasswordForm token={token} />
    </div>
  );
}
