import { useState, useContext } from "react";
import {
  Box,
  Typography,
  TextField,
  Button,
  Stack,
  List,
  ListItem,
  ListItemText,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Stepper,
  Step,
  StepLabel,
  Divider,
  Paper,
} from "@mui/material";
import Header from "../layout/Header";
import BottomNavBar from "../layout/BottomNavBar";
import { AppContext } from "../context/AppContext";

const STEPS = ["Open", "Assigned", "In Progress", "Completed", "Closed"];

function Requests() {
  const { getRequestsByMobile, advanceRequestStatus } = useContext(AppContext);

  // Lookup state
  const [lookupMobile, setLookupMobile] = useState("");
  const [foundRequests, setFoundRequests] = useState([]);

  // Dialog for stepper
  const [openDialog, setOpenDialog] = useState(false);
  const [activeRequest, setActiveRequest] = useState(null);

  // Creation moved to checkout in cart

  const handleLookup = () => {
    const results = getRequestsByMobile(lookupMobile.trim());
    setFoundRequests(results);
  };

  const openRequestDialog = (request) => {
    setActiveRequest(request);
    setOpenDialog(true);
  };

  const handleAdvance = () => {
    if (!activeRequest) return;
    advanceRequestStatus(activeRequest.id);
    // refresh activeRequest reference
    const updated = getRequestsByMobile(activeRequest.mobile).find(
      (r) => r.id === activeRequest.id,
    );
    setActiveRequest(updated || activeRequest);
  };

  return (
    <Box sx={{ width: "100%" }}>
      <Header />

      <Box sx={{ px: { xs: 1, sm: 2 }, py: { xs: 2, sm: 3 }, pb: 12 }}>
        <Divider sx={{ my: 2 }} />

        <Typography variant="h6" sx={{ mb: 1 }}>
          Request History
        </Typography>

        <Stack direction="row" spacing={1} sx={{ mb: 2 }}>
          <TextField
            label="Enter mobile to fetch requests"
            value={lookupMobile}
            onChange={(e) => setLookupMobile(e.target.value)}
            size="small"
            fullWidth
          />
          <Button variant="outlined" onClick={handleLookup}>
            Search
          </Button>
        </Stack>

        <List>
          {foundRequests.map((r) => (
            <ListItem key={r.id} button onClick={() => openRequestDialog(r)}>
              <ListItemText
                primary={r.name + " — " + r.description}
                secondary={`${r.mobile} • ${new Date(r.createdAt).toLocaleString()}`}
              />
            </ListItem>
          ))}
        </List>

        {/* Dialog showing stepper */}
        <Dialog
          open={openDialog}
          onClose={() => setOpenDialog(false)}
          fullWidth
          maxWidth="sm"
        >
          <DialogTitle>Request Tracking</DialogTitle>
          <DialogContent>
            {activeRequest && (
              <Box sx={{ mt: 1 }}>
                <Typography
                  variant="subtitle1"
                  sx={{ mb: 1, fontWeight: "bold" }}
                >
                  {activeRequest.name}
                </Typography>
                <Stepper
                  activeStep={activeRequest.currentStatusIndex}
                  orientation="vertical"
                >
                  {STEPS.map((step) => (
                    <Step key={step} expanded>
                      <StepLabel>{step}</StepLabel>
                    </Step>
                  ))}
                </Stepper>
              </Box>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenDialog(false)}>Close</Button>
            <Button onClick={handleAdvance} variant="contained">
              Advance Status
            </Button>
          </DialogActions>
        </Dialog>
      </Box>

      <BottomNavBar />
    </Box>
  );
}

export default Requests;
