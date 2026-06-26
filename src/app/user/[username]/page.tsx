import Box from "@mui/material/Box";
import Container from "@mui/material/Container";
import Paper from "@mui/material/Paper";
import UserHeader from "@/components/user/UserHeader";

type UserPageProps = {
  params: Promise<{ username: string }>;
};

export default async function UserPage({ params }: UserPageProps) {
  const { username } = await params;

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "background.default", py: 6 }}>
      <Container maxWidth="md">
        <Paper elevation={0} sx={{ p: { xs: 3, md: 4 }, borderRadius: 4, border: "1px solid", borderColor: "divider" }}>
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
