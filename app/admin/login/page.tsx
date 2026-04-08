import Link from "next/link";
import { redirect } from "next/navigation";
import { signInAction } from "@/app/actions";
import { createClient } from "@/lib/supabase/server";

export default async function AdminLoginPage() {
  const supabase = await createClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (user) {
    redirect("/admin/projects");
  }

  return (
    <main className="login-shell">
      <section className="card stack login-card">
        <div className="row">
          <h1 className="page-title">Admin Login</h1>
          <Link className="btn secondary" href="/">
            Home
          </Link>
        </div>
        <p className="muted">
          Sign in to manage client projects, publish updates, and share progress links.
        </p>
        <form className="stack" action={signInAction}>
          <label className="label">
            Email
            <input className="input" name="email" type="email" required />
          </label>
          <label className="label">
            Password
            <input className="input" name="password" type="password" required />
          </label>
          <button className="btn" type="submit">
            Sign in
          </button>
        </form>
      </section>
    </main>
  );
}
