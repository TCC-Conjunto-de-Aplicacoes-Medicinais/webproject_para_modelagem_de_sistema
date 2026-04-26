'use client';

import Box from '@mui/material/Box';
import { NavigationProvider, useNavigation } from '@/app/contexts/NavigationContext';
import Navbar from '@/app/components/Navbar';
import Footer from '@/app/components/Footer';
import LandingPage from '@/app/pages/LandingPage';
import LoginPage from '@/app/pages/LoginPage';
import RegisterPage from '@/app/pages/RegisterPage';
import SystemCreationPage from '@/app/pages/SystemCreationPage';
import { PageRoute } from '@/app/types';

const PAGE_COMPONENTS: Record<PageRoute, React.ComponentType> = {
  [PageRoute.LANDING]: LandingPage,
  [PageRoute.LOGIN]: LoginPage,
  [PageRoute.REGISTER]: RegisterPage,
  [PageRoute.SYSTEM_CREATION]: SystemCreationPage,
};

function PageContent() {
  const { currentPage } = useNavigation();
  const ActivePage = PAGE_COMPONENTS[currentPage];

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        minHeight: '100vh',
      }}
    >
      <Navbar />
      <Box component="main" sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        <ActivePage />
      </Box>
      <Footer />
    </Box>
  );
}

export default function Home() {
  return (
    <NavigationProvider>
      <PageContent />
    </NavigationProvider>
  );
}
