import type { Metadata } from "next";
import Box from "@mui/material/Box";
import Container from "@mui/material/Container";
import Paper from "@mui/material/Paper";
import UserHeader from "@/components/user/UserHeader";

type UserPageProps = {
  params: Promise<{ username: string }>;
};

/** Public profiles — refresh cached HTML periodically when data is wired. */
export const revalidate = 300;

export async function generateMetadata({
  params,
}: UserPageProps): Promise<Metadata> {
  const { username } = await params;
  const displayName = username.replace(/-/g, " ");

  return {
    title: `@${username}`,
    description: `Perfil público de ${displayName} no Mission App.`,
    alternates: { canonical: `/user/${username}` },
    openGraph: {
      title: `@${username} | Mission App`,
      description: `Perfil público de ${displayName} no Mission App.`,
      url: `/user/${username}`,
      type: "profile",
    },
    robots: { index: true, follow: true },
  };
}

export default async function UserPage({ params }: UserPageProps) {
  const { username } = await params;

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "background.default", py: 6 }}>
      <Container maxWidth="md">
        <Paper
          elevation={0}
          sx={{
            p: { xs: 3, md: 4 },
            borderRadius: 4,
            border: "1px solid",
            borderColor: "divider",
          }}
        >
          <UserHeader
            username={username}
            displayName={username.replace(/-/g, " ")}
            bio="Perfil público no Mission App."
          />
        </Paper>
      </Container>
    </Box>
  );
}
