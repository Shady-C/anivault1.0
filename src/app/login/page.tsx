import LoginClient from "./login-client";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const sp = await searchParams;
  const nextParam = sp.next;
  const next =
    typeof nextParam === "string"
      ? nextParam
      : Array.isArray(nextParam)
        ? nextParam[0]
        : null;

  return <LoginClient next={next ?? undefined} />;
}
