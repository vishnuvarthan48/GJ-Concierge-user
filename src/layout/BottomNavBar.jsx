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
import { useNavigate, useParams, useLocation } from "react-router-dom";

function BottomNavBar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { tenantId, roomId } = useParams();

  const pathname = location.pathname;
  const basePath = `/t/${tenantId}/r/${roomId}`;
  const value = pathname === `${basePath}` ? 0
    : pathname.startsWith(`${basePath}/requests`) ? 1
    : pathname.startsWith(`${basePath}/explore`) ? 2
    : pathname.startsWith(`${basePath}/more`) ? 3
    : 0;

  const handleNavigation = (newValue, path) => {
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
            value={0}
            onClick={() => handleNavigation(0, `${basePath}`)}
          />
          <BottomNavigationAction
            icon={<RequestsIcon />}
            label="Requests"
            value={1}
            onClick={() => handleNavigation(1, `${basePath}/requests`)}
          />
          <BottomNavigationAction
            icon={<ExploreIcon />}
            label="Explore"
            value={2}
            onClick={() => handleNavigation(2, `${basePath}/explore`)}
          />
          <BottomNavigationAction
            icon={<MoreIcon />}
            label="More"
            value={3}
            onClick={() => handleNavigation(3, `${basePath}/more`)}
          />
        </BottomNavigation>
      </Paper>
    </Box>
  );
}

export default BottomNavBar;
