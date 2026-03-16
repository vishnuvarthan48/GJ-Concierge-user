import React, { useState, useMemo } from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { CssBaseline, ThemeProvider, createTheme } from "@mui/material";

import App from "./App";
import { lightPalette, darkPalette } from "./theme/palette";
import typography from "./theme/typography";
import "./style.css";
import { AppProvider } from "./context/AppContext";
import { QueryClientProvider } from "@tanstack/react-query";
import queryClient from "./queryClient";

function Root() {
  const [isDarkMode, setIsDarkMode] = useState(false);

  const theme = useMemo(
    () =>
      createTheme({
        palette: isDarkMode ? darkPalette : lightPalette,
        typography,
        breakpoints: {
          values: {
            xs: 0,
            sm: 600,
            md: 960,
            lg: 1280,
            xl: 1920,
          },
        },
      }),
    [isDarkMode],
  );

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <AppProvider isDarkMode={isDarkMode} setIsDarkMode={setIsDarkMode}>
            <App isDarkMode={isDarkMode} setIsDarkMode={setIsDarkMode} />
          </AppProvider>
        </BrowserRouter>
      </QueryClientProvider>
    </ThemeProvider>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <Root />
  </React.StrictMode>,
);
