 "use client";

import { Card, CardContent, Typography, Button } from "@mui/material";
import Link from "next/link";

export default function ThankYouClient() {
  return (
    <div
      style={{
        minHeight: "80vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <Card
        sx={{
          p: 3,
          borderRadius: 3,
          boxShadow: 5,
          maxWidth: 500,
          textAlign: "center",
        }}
      >
        <CardContent>
          <i
            className="bi bi-check-circle-fill"
            style={{ fontSize: 80, color: "#22c55e", display: "inline-block", marginBottom: 20 }}
            aria-hidden="true"
          />
          <span className="visually-hidden">Success</span>

          <Typography
            variant="h5"
            fontWeight="bold"
            gutterBottom
            sx={{ fontFamily: "inherit" }}
          >
            Thank you for submitting your information with{" "}
            <Link
              href="/"
              style={{ color: "#000", textDecoration: "none" }}
            >
              motorhomesforsale.com.au
            </Link>
            .
          </Typography>

          <Typography
            variant="body1"
            color="text.secondary"
            gutterBottom
            sx={{ fontFamily: "inherit" }}
          >
            Your motorhome dealer will contact you as soon as possible.
          </Typography>

          <Link href="/" style={{ textDecoration: "none" }}>
            <Button
              variant="contained"
              sx={{
                mt: 3,
                fontFamily: "inherit",
                backgroundColor: "#1aa8de",
                color: "white",
                "&:hover": { backgroundColor: "#0088c6" },
              }}
            >
              Go Back
            </Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}
