import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  CircularProgress,
  Alert,
  Link,
  Chip,
  Button,
  Stack,
  CardMedia,
  useTheme,
} from "@mui/material";
import axiosInstance from "../utils/axios";
import { format } from "date-fns";
import { styled, keyframes } from "@mui/material/styles";

const AttendingEvents = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const theme = useTheme();
  const fadeIn = keyframes`
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`;
const StyledButton = styled(Button)(({ theme }) => ({
  borderRadius: '4px',
  padding: '8px 16px',
  fontWeight: 500,
  textTransform: 'none',
  transition: 'all 0.3s ease',
  fontFamily: "'Montserrat', sans-serif",
  '&:hover': {
    transform: 'translateY(-2px)',
  },
}));
  const StyledCard = styled(Card)(({ theme }) => ({
    height: "100%",
    color: "white",
    display: "flex",
    flexDirection: "column",
    background: "#1e1e1e",
    borderRadius: "8px",
    border: "1px solid rgba(255, 255, 255, 0.05)",
    boxShadow: "0 4px 20px rgba(0, 0, 0, 0.2)",
    transition: "all 0.3s ease",
    animation: `${fadeIn} 0.5s ease-out`,
    "&:hover": {
      transform: "translateY(-5px)",
      boxShadow: "0 8px 25px rgba(0, 0, 0, 0.3)",
      border: "1px solid rgba(255, 255, 255, 0.1)",
    },
  }));
  const fetchEvents = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get("/events/attending");
      console.log("Fetched events:", response.data); // Ensure data is an array
      setEvents(response.data); // Assuming API response is an array
      setError(null);
    } catch (err) {
      console.error("Error details:", err);
      setError("Failed to fetch attending events. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  if (loading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="400px"
      >
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box m={2}>
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3, background: "#131313" }}>
      <Typography variant="h4" gutterBottom style={{ color: "white" }}>
        Events We're Attending
      </Typography>

      <Grid container spacing={3}>
        {events.length === 0 ? (
          <Grid item xs={12}>
            <Alert severity="info">No events currently being attended.</Alert>
          </Grid>
        ) : (
          events.map((event) => (
            <Grid item xs={12} md={6} lg={4} key={event.id}>
              <StyledCard
                sx={{
                  height: "90%",
                  width: "80%",
                  display: "flex",
                  flexDirection: "column",
                  "&:hover": {
                    transform: "translateY(-4px)",
                    boxShadow: theme.shadows[8],
                  },
                }}
              >
                {event.banner && (
                  <CardMedia
                    component="img"
                    height="200"
                    image={event.banner}
                    alt={event.name}
                    sx={{ objectFit: "cover" }}
                  />
                )}
                <CardContent sx={{ flexGrow: 1 }}>
                  <Typography variant="h6" gutterBottom>
                    {event.name}
                  </Typography>

                  <Stack spacing={2}>
                    <Typography variant="body2">
                      Start: {format(new Date(event.start_at), "PPP p")}
                    </Typography>

                    {event.server && (
                      <Typography variant="body2">
                        Server: {event.server.name}
                      </Typography>
                    )}

                    {event.departure && (
                      <Typography variant="body2">
                        <p>
                          Departure: {event.departure.city} -{" "}
                          {event.departure.location}
                        </p>
                      </Typography>
                    )}

                    {event.arrival && (
                      <Typography variant="body2">
                        Arrival: {event.arrival}
                      </Typography>
                    )}

                    <Box sx={{ mt: 2 }}>
                      <Chip
                        label={event.game === "ETS2" ? "ETS2" : "ATS"}
                        size="small"
                        color="primary"
                        sx={{ mr: 1 }}
                      />
                      
                    </Box>
                    <Box sx={{mt:2}}>
                    <StyledButton
              variant="contained"
              color="primary"
              href={`/events/${event.id}`}
              fullWidth
            >
              View Details
            </StyledButton>
                    </Box>
                    
                  </Stack>
                </CardContent>
              </StyledCard>
            </Grid>
          ))
        )}
      </Grid>
    </Box>
  );
};

export default AttendingEvents;
