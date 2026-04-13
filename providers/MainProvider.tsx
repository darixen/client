"use client"; // <--- This is the fix

import { MantineProvider, createTheme } from "@mantine/core";
import { Notifications } from "@mantine/notifications";
import { AuthProvider } from "@/providers/AuthProvider";
import { SkullLoader } from "@/components/ui/SkullLoader";

const theme = createTheme({
  primaryColor: "dark",
  defaultRadius: "0px",
  fontFamily: "Courier New, monospace",
  colors: {
    dark: ["#C1C2C5","#A6A7AB","#909296","#5C5F66","#373A40","#2C2E33","#25262B","#1A1B1E","#141517","#101113"],
  },
  components: {
    Loader: {
      defaultProps: {
        // Now that this is a Client Component, functions are allowed
        component: () => (
          <div className="flex items-center justify-center p-10">
            <SkullLoader size={30} label=""/>
          </div>
        ),
      },
    },
  },
});

export function MainProvider({ children }: { children: React.ReactNode }) {
  return (
    <MantineProvider theme={theme} defaultColorScheme="dark">
      <Notifications position="top-right" zIndex={1000} />
      <AuthProvider>
        {children}
      </AuthProvider>
    </MantineProvider>
  );
}