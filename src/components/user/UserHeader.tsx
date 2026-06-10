"use client";

import { Avatar, Button, Stack, Typography } from "@mui/material";
import PersonIcon from "@mui/icons-material/Person";

type UserHeaderProps = {
  username: string;
  displayName: string;
  bio?: string;
};

export default function UserHeader({ username, displayName, bio }: UserHeaderProps) {
  return (
    <Stack direction={{ xs: "column", sm: "row" }} spacing={2} sx={{ alignItems: "center" }}>
      <Avatar sx={{ width: 96, height: 96 }}>
        <PersonIcon sx={{ fontSize: 48 }} />
      </Avatar>

      <Stack spacing={1} sx={{ flex: 1, alignItems: { xs: "center", sm: "flex-start" } }}>
        <Stack direction="row" spacing={1} sx={{ alignItems: "center", flexWrap: "wrap" }}>
          <Typography variant="body2" color="text.secondary">
            @{username}
          </Typography>
          <Button variant="contained" color="supporter" size="small">
            Seguir
          </Button>
          <Button variant="contained" color="mission" size="small">
            Doar
          </Button>
        </Stack>
        <Typography variant="h5">{displayName}</Typography>
        {bio ? (
          <Typography variant="body2" color="text.secondary">
            {bio}
          </Typography>
        ) : null}
      </Stack>
    </Stack>
  );
}
