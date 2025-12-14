// Sheet.js
import { Modal, Box, useMediaQuery } from '@mui/material';
import { useTheme } from '@mui/material/styles';

export default function Sheet({ open, onClose, children }) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const sheetSx = isMobile
    ? {
        position: 'fixed',
        left: 0, right: 0, bottom: 0,
        width: '100vw',
        maxHeight: 'calc(100vh - 100px)',   // 화면 밖으로 안 나감
        bgcolor: 'background.paper',
        borderTopLeftRadius: 16,
        borderTopRightRadius: 16,
        boxShadow: 8,
        p: 2,
        overflowY: 'auto',
      }
    : {
        position: 'fixed',
        left: 0, right: 0, bottom: 0,
        width: 400,
        maxWidth: '92vw',
        maxHeight: '70vh',
        mx:'auto',
        bgcolor: 'background.paper',
        borderRadius: 12,
        boxShadow: 4,
        p: 3,
        overflowY: 'auto',
      };

  return (
    <Modal
      open={open}
      onClose={onClose}
      keepMounted
      // 포털로 body에 렌더링되므로 transform 조상 영향 X
      BackdropProps={{ sx: { backgroundColor: 'rgba(0,0,0,0.2)' } }}
    >
      <Box sx={sheetSx}>{children}</Box>
    </Modal>
  );
}
