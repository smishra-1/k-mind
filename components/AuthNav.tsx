import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

export default async function AuthNav() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <nav className="mx-auto flex w-full max-w-6xl items-center justify-between px-4 pt-4 text-sm sm:px-6">
      <Link href="/" className="font-extrabold text-violet-700">
        K-Mind 🧠
      </Link>
      {user ? (
        <div className="flex items-center gap-4">
          <Link href="/maps" className="font-semibold text-violet-700 hover:underline">
            My maps
          </Link>
          <span className="hidden text-slate-500 sm:inline">{user.email}</span>
          <form action="/auth/signout" method="post">
            <button className="rounded-full bg-slate-100 px-3 py-1 font-medium text-slate-700 hover:bg-slate-200">
              Log out
            </button>
          </form>
        </div>
      ) : (
        <Link
          href="/login"
          className="rounded-full bg-violet-600 px-4 py-1.5 font-semibold text-white hover:bg-violet-700"
        >
          Log in
        </Link>
      )}
    </nav>
  );
}
