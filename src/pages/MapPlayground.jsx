import React from "react";
import { Container, Typography, Card, CardContent, Stack } from "@mui/material";
import LeafletMap from "../components/maps/LeafletMap";
import MapRoute from "../components/maps/MapRoute";

const mockJobData = {
  source: { city: { lat: 51.5074, lng: -0.1278, name: "London" } },
  destination: { city: { lat: 48.8566, lng: 2.3522, name: "Paris" } },
};

const mockRoutePoints = [
  { lat: 51.5074, lng: -0.1278 },
  { lat: 50.1109, lng: 8.6821 },
  { lat: 48.8566, lng: 2.3522 },
];

export default function MapPlayground() {
  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h4" gutterBottom>
        Map Playground
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        This page is only for testing the custom Leaflet + ETS2/ATS-style route integration.
      </Typography>
      <Stack spacing={3}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Basic Leaflet Map
            </Typography>
            <LeafletMap />
          </CardContent>
        </Card>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Mock ETS2 Route (London → Paris)
            </Typography>
            <MapRoute jobData={mockJobData} routePoints={mockRoutePoints} />
          </CardContent>
        </Card>
      </Stack>
    </Container>
  );
}

