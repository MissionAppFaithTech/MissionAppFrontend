import type { Metadata } from "next";
import ProfilePageContent from "./ProfilePageContent";

export const metadata: Metadata = {
  title: "Meu perfil",
  robots: { index: false, follow: false },
};

export default function ProfilePage() {
  return <ProfilePageContent />;
}
