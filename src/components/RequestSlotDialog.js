import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Box,
  Typography,
  Alert,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
  Stack,
} from "@mui/material";

import axiosInstance from "../utils/axios";

const RequestSlotDialog = ({ open, onClose, slot, onRequestSubmitted }) => {
  const [formData, setFormData] = useState({
    discordUsername: "",
    vtc: "",
    truck: "",
    trailer: "",
    notes: "",
    vtcName: "",
    vtcRole: "",
    vtcLink: "",
    slotNumber: "",
    playercount: "",
  });
  const [error, setError] = useState("");
  const [showSuccess, setShowSuccess] = useState(false);

  const [loading, setLoading] = useState(false);

  // Reset form when dialog opens
  useEffect(() => {
    if (open) {
      setFormData({
        discordUsername: "",
        vtc: "",
        truck: "",
        trailer: "",
        notes: "",
        vtcName: "",
        vtcRole: "",
        vtcLink: "",
        slotNumber: "",
        playercount: "",
      });
      setError("");
      setShowSuccess(false);
    }
  }, [open]);

  // Get available slot numbers
  const availableSlots = slot?.slots?.filter((s) => s.isAvailable) || [];

  const validateForm = () => {
    if (!formData.vtcName.trim()) {
      setError("VTC name is required");
      return false;
    }
    if (!formData.slotNumber) {
      setError("Please select a slot number");
      return false;
    }
    if (!formData.discordUsername.trim()) {
      setError("Discord username is required");
      return false;
    }
    if (formData.vtcLink && !formData.vtcLink.includes("truckersmp.com/vtc/")) {
      setError("Please provide a valid TruckersMP VTC profile link");
      return false;
    }
    if (!formData.playercount || formData.playercount < 0) {
      setError("Give valid number of players");
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm() || loading) return;

    setLoading(true);
    setError("");

    try {
      console.log("Submitting request for slot:", {
        slotId: slot._id,
        slotNumber: formData.slotNumber,
        vtcName: formData.vtcName,
        players: formData.playercount,
        discordUsername: formData.discordUsername,
      });

      const response = await axiosInstance.post(`/slots/${slot._id}/request`, {
        vtcName: formData.vtcName,
        vtcRole: formData.vtcRole || "",
        vtcLink: formData.vtcLink || "",
        slotNumber: parseInt(formData.slotNumber),
        playercount: formData.playercount,
        discordUsername: formData.discordUsername,
      });

      console.log("Slot request response:", response.data);

      if (onRequestSubmitted) {
        onRequestSubmitted();
      }
      setShowSuccess(true);
    } catch (error) {
      console.error("Error requesting slot:", error);
      setError(
        error.response?.data?.message || "Failed to submit slot request"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Dialog
        open={open}
        onClose={() => !loading && onClose(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: { borderRadius: 2 },
        }}
      >
        <DialogTitle>
          <Typography variant="h6" component="div">
            Request Slot for Image {slot?.imageNumber}
          </Typography>
        </DialogTitle>

        <DialogContent>
          <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
            {error && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {error}
              </Alert>
            )}

            {showSuccess && (
              <Alert severity="success" sx={{ mb: 2 }}>
                Slot requested successfully!
              </Alert>
            )}
            {/* Slot Image Preview */}
            {slot?.imageUrl && (
              <Box sx={{ mb: 3, textAlign: "center" }}>
                <img
                  src={slot.imageUrl}
                  alt="Slot Preview"
                  style={{
                    width: "100%",
                    height: "200px",
                    objectFit: "cover",
                    borderRadius: "8px",
                  }}
                />
              </Box>
            )}

            {/* Slot Number Selection */}
            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel id="slot-number-label">Select Slot Number</InputLabel>
              <Select
                labelId="slot-number-label"
                id="slot-number"
                value={formData.slotNumber}
                label="Select Slot Number"
                onChange={(e) =>
                  setFormData({ ...formData, slotNumber: e.target.value })
                }
                disabled={loading}
              >
                {availableSlots.length > 0 ? (
                  availableSlots.map((slotItem) => (
                    <MenuItem key={slotItem.number} value={slotItem.number}>
                      Slot {slotItem.number}
                    </MenuItem>
                  ))
                ) : (
                  <MenuItem disabled>No slots available</MenuItem>
                )}
              </Select>
            </FormControl>

            <Stack spacing={2}>
              <TextField
                label="Discord Username"
                fullWidth
                required
                helperText="Please enter your Discord username (e.g., username#1234)"
                value={formData.discordUsername}
                onChange={(e) =>
                  setFormData({ ...formData, discordUsername: e.target.value })
                }
              />
              <TextField
                label="VTC Name"
                fullWidth
                required
                value={formData.vtcName}
                onChange={(e) =>
                  setFormData({ ...formData, vtcName: e.target.value })
                }
                disabled={loading}
                error={error && !formData.vtcName}
              />
              <TextField
                fullWidth
                label="VTC Role"
                name="vtcRole"
                value={formData.vtcRole}
                onChange={(e) =>
                  setFormData({ ...formData, vtcRole: e.target.value })
                }
                margin="normal"
                disabled={loading}
                placeholder="e.g., Driver, Manager, Owner"
              />
              <TextField
                fullWidth
                label="VTC Link"
                name="vtcLink"
                value={formData.vtcLink}
                onChange={(e) =>
                  setFormData({ ...formData, vtcLink: e.target.value })
                }
                margin="normal"
                disabled={loading}
                placeholder="https://truckersmp.com/vtc/12345"
                error={
                  error &&
                  formData.vtcLink &&
                  !formData.vtcLink.includes("truckersmp.com/vtc/")
                }
                helperText={
                  formData.vtcLink &&
                  !formData.vtcLink.includes("truckersmp.com/vtc/")
                    ? "Please enter a valid TruckersMP VTC link"
                    : ""
                }
              />
              <TextField
                fullWidth
                
                label="Estimated Number of Players"
                name="playercount"
                type="number"
                
                value={formData.playercount}
                onChange={(e) =>
                  setFormData({ ...formData, playercount: e.target.value })
                }
                margin="normal"
                disabled={loading}
                error={
                  error && (!formData.playercount || formData.playercount < 0)
                }
                helperText={
                  error && (!formData.playercount || formData.playercount < 0)
                    ? "Please enter a valid number of players"
                    : ""
                }
              />
            </Stack>
            <p>* Once booking is done, please come back after sometime to know the booking status!</p>
          </Box>
        </DialogContent>

        <DialogActions sx={{ p: 2.5 }}>
          <Button onClick={() => onClose(false)} disabled={loading}>
            Cancel
          </Button>
          <Button
            type="submit"
            variant="contained"
            onClick={handleSubmit}
            disabled={loading || availableSlots.length === 0}
            sx={{ minWidth: 100 }}
          >
            {loading ? (
              <CircularProgress size={24} color="inherit" />
            ) : (
              "Request Slot"
            )}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default RequestSlotDialog;
