'use client';

import { useState } from 'react';
import {
  TextInput, PasswordInput, Button, Paper, Title,
  Container, Text, Anchor, Stack, Box, Divider,
  Group, Flex
} from '@mantine/core';
import {
  IconShieldLock, IconCheck, IconX, IconFingerprint,
  IconTerminal2, IconHelpCircle
} from '@tabler/icons-react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/providers/AuthProvider';
import { login } from '@/lib/auth/actions';
import { notifications } from '@mantine/notifications';
import Link from 'next/link';

// Import the missing utility components we created
import { BackgroundHud } from '@/components/auth/BackgroundHud';
import { SecurityFeed } from '@/components/auth/SecurityFeed';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const router = useRouter();
  const { refreshUser } = useAuth();
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const data = await login(email, password);

      if (data.user) {
        // 1. Force Next.js to purge its data cache for the current session
        router.refresh();

        // 2. Sync the AuthProvider state
        // Note: Ensure refreshUser() uses { credentials: 'include' } 
        // or manually passes the token if servers are on different TLDs
        await refreshUser();

        notifications.show({
          title: 'HANDSHAKE SUCCESSFUL',
          message: 'Welcome back, Operative.',
          color: 'blue.6',
          autoClose: 2000,
        });

        router.push('/');
      }
    } catch (err: any) {
      notifications.show({
        title: 'ACCESS DENIED',
        message: err.message || 'Invalid credentials.',
        color: 'red.8',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-[#050505] relative flex flex-col items-center justify-center py-20 px-4 overflow-x-hidden">

      {/* 1. Industrial Background (Fixed to prevent scroll issues) */}
      <BackgroundHud />

      <Container size={420} p={0} className="relative z-10 w-full">
        <Stack gap={40}>

          {/* 2. Header Section */}
          <Stack align="center" gap="xs">
            <Box className="p-4 rounded-full border border-blue-500/20 bg-blue-500/5 animate-pulse">
              <IconFingerprint size={48} className="text-blue-500" stroke={1.5} />
            </Box>
            <Title order={1} className="text-white tracking-[0.3em] font-black uppercase text-2xl">
              Dark<span className="text-blue-600">Capital</span>
            </Title>
            <Group gap={8} className="opacity-40">
              <IconTerminal2 size={14} className="text-blue-400" />
              <Text size="xs" fw={700} className="uppercase tracking-[0.2em] font-mono">
                Node Interface v2.0.4
              </Text>
            </Group>
          </Stack>

          {/* 3. Login Form Card */}
          <Paper
            p={{ base: 24, sm: 40 }}
            radius={0}
            bg="transparent"
            className="border border-gray-800 backdrop-blur-md relative"
          >
            {/* Corner Decorative Accents */}
            <div className="absolute -top-[1px] -left-[1px] w-4 h-4 border-t-2 border-l-2 border-blue-600" />
            <div className="absolute -bottom-[1px] -right-[1px] w-4 h-4 border-b-2 border-r-2 border-blue-600" />

            <form onSubmit={handleLogin}>
              <Stack gap="lg">
                <TextInput
                  label="OPERATIVE IDENTIFIER"
                  placeholder="ID-000000"
                  required
                  variant="filled"
                  autoComplete="email"
                  classNames={{
                    input: 'bg-black/50 border-gray-800 text-white focus:border-blue-500 h-12 font-mono uppercase text-xs',
                    label: 'text-gray-500 font-bold uppercase text-[10px] tracking-widest mb-1'
                  }}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />

                <Box>
                  <PasswordInput
                    label="ENCRYPTION KEY"
                    placeholder="••••••••"
                    required
                    variant="filled"
                    autoComplete="current-password"
                    classNames={{
                      input: 'bg-black/50 border-gray-800 text-white focus:border-blue-500 h-12',
                      innerInput: 'text-white font-mono',
                      label: 'text-gray-500 font-bold uppercase text-[10px] tracking-widest mb-1'
                    }}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                  <Flex justify="flex-end" mt={8}>
                    <Anchor component={Link} href="/recovery" size="xs" c="dimmed" className="uppercase tracking-widest font-bold hover:text-blue-500 transition-colors">
                      Forgot Access Code?
                    </Anchor>
                  </Flex>
                </Box>

                <Button
                  fullWidth
                  size="lg"
                  type="submit"
                  loading={loading}
                  loaderProps={{ type: 'bars' }}
                  radius={0}
                  className="bg-blue-600 hover:bg-blue-500 text-white font-black uppercase tracking-[0.2em] text-xs h-14"
                  leftSection={loading ? null : <IconShieldLock size={18} />}
                >
                  {loading ? 'INITIALIZING HANDSHAKE...' : 'AUTHORIZE ACCESS'}
                </Button>
              </Stack>
            </form>

            <Divider my={30} label="Authorization Required" labelPosition="center" color="gray.9" />

            <Flex justify="center">
              <Text size="xs" c="dimmed" fw={700} className="uppercase tracking-widest">
                New Operative?{' '}
                <Anchor component={Link} href="/register" c="blue.5" fw={900}>
                  Request Clearance
                </Anchor>
              </Text>
            </Flex>
          </Paper>

          {/* 4. Bottom Security Feed */}
          <SecurityFeed type="access" />

        </Stack>
      </Container>

      {/* Industrial Keyframes */}
      <style jsx global>{`
        @keyframes scanline { 0% { transform: translateY(-100%); } 100% { transform: translateY(100%); } }
        .animate-scanline { animation: scanline 6s linear infinite; }
      `}</style>
    </div>
  );
}