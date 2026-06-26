"use client";

import Image from "next/image";
import Link from "next/link";
import Stack from "@mui/material/Stack";

export default function AppStoreBadges() {
  return (
    <Stack direction="row" spacing={2} sx={{ justifyContent: "center", flexWrap: "wrap" }}>
      <Link href="#" aria-label="Baixar na App Store">
        <Image src="/badges/app-store.svg" alt="Disponível na App Store" width={140} height={42} />
      </Link>
      <Link href="#" aria-label="Baixar no Google Play">
        <Image src="/badges/google-play.svg" alt="Disponível no Google Play" width={140} height={42} />
      </Link>
    </Stack>
  );
}
