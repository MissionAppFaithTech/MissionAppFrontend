"use client";

import { Box, FormHelperText, InputLabel, useTheme } from "@mui/material";
import { PhoneInput } from "react-international-phone";
import "react-international-phone/style.css";

type PhoneFieldProps = {
  value: string;
  onChange: (value: string) => void;
  error?: boolean;
  helperText?: string;
  label?: string;
  defaultCountry?: string;
};

export default function PhoneField({
  value,
  onChange,
  error,
  helperText,
  label = "Telefone",
  defaultCountry = "br",
}: PhoneFieldProps) {
  const theme = useTheme();
  const borderColor = error ? theme.palette.error.main : theme.palette.divider;
  const backgroundColor =
    theme.palette.mode === "light" ? theme.palette.surface?.main ?? "#EAF1FA" : undefined;

  return (
    <Box sx={{ width: "100%" }}>
      <InputLabel
        shrink
        error={error}
        sx={{ typography: "body2", color: "text.primary", mb: 0.75, display: "block" }}
      >
        {label}
      </InputLabel>

      <Box
        sx={{
          width: "100%",
          border: "1px solid",
          borderColor,
          borderRadius: 1,
          bgcolor: backgroundColor,
          px: 1,
          py: 0.25,
          transition: "border-color 0.2s ease",
          "&:focus-within": {
            borderColor: error ? theme.palette.error.main : theme.palette.primary.main,
            borderWidth: 2,
            px: "7px",
            py: "1px",
          },
          "& .react-international-phone-input-container": {
            width: "100%",
            display: "flex",
            alignItems: "center",
            gap: 1,
          },
          "& .react-international-phone-country-selector-button": {
            border: "none",
            background: "transparent",
            padding: "8px 4px",
            height: "auto",
          },
          "& .react-international-phone-input": {
            flex: 1,
            border: "none",
            outline: "none",
            background: "transparent",
            font: "inherit",
            fontSize: "1rem",
            py: 1.25,
            px: 0.5,
            color: theme.palette.text.primary,
          },
        }}
      >
        <PhoneInput
          defaultCountry={defaultCountry}
          value={value}
          onChange={(phone) => onChange(phone)}
          forceDialCode
          placeholder="(11) 98765-4321"
        />
      </Box>

      {helperText ? <FormHelperText error={error}>{helperText}</FormHelperText> : null}
    </Box>
  );
}

export function isValidInternationalPhone(value: string): boolean {
  const digits = value.replace(/\D/g, "");
  return digits.length >= 10;
}
