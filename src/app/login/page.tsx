import { Login } from "@/components/Login";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Login - AA FairShare",
  description: "Log in to your FairShare account",
};

export default function LoginPage() {
  return <Login />;
}
