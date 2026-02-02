import {
  BottomNavigation,
  BottomNavigationAction,
  Paper,
  Box,
} from "@mui/material";
import {
  Home as HomeIcon,
  Checklist as RequestsIcon,
  Explore as ExploreIcon,
  MoreHoriz as MoreIcon,
} from "@mui/icons-material";
import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

function BottomNavBar() {
  const [value, setValue] = useState(0);
  const navigate = useNavigate();
  const { tenantId, roomId } = useParams();

  const handleNavigation = (newValue, path) => {
    setValue(newValue);
    navigate(path);
  };

  return (
    <Box
      sx={{
        position: "fixed",
        bottom: 0,
        left: 0,
        right: 0,
        maxWidth: 600,
        mx: "auto",
      }}
    >
      <Paper
        elevation={3}
        sx={{
          borderRadius: "12px 12px 0 0",
        }}
      >
        <BottomNavigation
          value={value}
          onChange={(event, newValue) => newValue}
          showLabels
          sx={{
            "& .MuiBottomNavigationAction-root": {
              minWidth: "auto",
              py: 1,
            },
            "& .MuiBottomNavigationAction-label": {
              fontSize: { xs: "0.75rem", sm: "0.875rem" },
              display: "block",
            },
          }}
        >
          <BottomNavigationAction
            icon={<HomeIcon />}
            label="Home"
            onClick={() => handleNavigation(0, `/t/${tenantId}/r/${roomId}`)}
          />
          <BottomNavigationAction
            icon={<RequestsIcon />}
            label="Requests"
            onClick={() =>
              handleNavigation(1, `/t/${tenantId}/r/${roomId}/requests`)
            }
          />
          <BottomNavigationAction
            icon={<ExploreIcon />}
            label="Explore"
            onClick={() =>
              handleNavigation(2, `/t/${tenantId}/r/${roomId}/explore`)
            }
          />
          <BottomNavigationAction
            icon={<MoreIcon />}
            label="More"
            onClick={() =>
              handleNavigation(3, `/t/${tenantId}/r/${roomId}/more`)
            }
          />
        </BottomNavigation>
      </Paper>
    </Box>
  );
}

export default BottomNavBar;
