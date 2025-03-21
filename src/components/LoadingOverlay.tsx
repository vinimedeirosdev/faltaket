import { Backdrop, CircularProgress } from "@mui/material";

function LoadingOverlay({ loading }: any) {
  return (
    <Backdrop
      sx={{ color: "#fff", zIndex: (theme) => theme.zIndex.drawer + 1 }}
      open={loading}
    >
      <CircularProgress color="primary" size={64} />
    </Backdrop>
  );
}

export default LoadingOverlay;
