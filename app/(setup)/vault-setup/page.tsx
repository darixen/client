'use client';

import { useState, useEffect } from 'react';
import { 
  Paper, Title, Container, Text, Stack, Box, Flex, Group, 
  Alert, CopyButton, Button, Grid, Checkbox, ActionIcon, Tooltip 
} from '@mantine/core';
import { 
  IconLockOpen, IconAlertTriangle, IconDownload, IconCheck, 
  IconCopy, IconTerminal2, IconShieldCheck 
} from '@tabler/icons-react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/providers/AuthProvider';
import { notifications } from '@mantine/notifications';
import { BackgroundHud } from '@/components/auth/BackgroundHud';

export default function VaultSetupPage() {
  const { user, refreshUser } = useAuth();
  const [phrase, setPhrase] = useState('');
  const [loading, setLoading] = useState(false);
  const [hasSaved, setHasSaved] = useState(false);
  const router = useRouter();
  const API_URL = process.env.NEXT_PUBLIC_PAYLOAD_URL || 'http://localhost:3000';

  useEffect(() => {
    const initializeVault = async () => {
      setLoading(true);
      try {
        const res = await fetch(`${API_URL}/api/users/reinitialize-vault`, {
          method: 'POST',
          credentials: 'include'
        });
        const data = await res.json();
        if (data.mnemonic) setPhrase(data.mnemonic);
      } catch (e) {
        console.log(e);        
        notifications.show({ title: 'System Error', message: 'Vault comms failed.', color: 'red' });
      } finally {
        setLoading(false);
      }
    };
    if (user && !phrase) initializeVault();
  }, [user, phrase, API_URL]);

  const downloadKeys = () => {
    const element = document.createElement("a");
    const file = new Blob([
      `DARK CAPITAL - SECURE RECOVERY KEY\n`,
      `-----------------------------------\n`,
      `OPERATIVE ID: ${user?.id}\n`,
      `TIMESTAMP: ${new Date().toISOString()}\n\n`,
      `MNEMONIC PHRASE (BIP39):\n${phrase}\n\n`,
      `WARNING: NEVER SHARE THIS PHRASE. STORE IT OFFLINE.`
    ], {type: 'text/plain'});
    element.href = URL.createObjectURL(file);
    element.download = `Vault_Recovery_Keys.txt`;
    document.body.appendChild(element);
    element.click();
    notifications.show({ title: 'EXPORT SUCCESSFUL', message: 'Keys saved to local drive.', color: 'blue' });
  };

  const handleFinalize = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/users/${user?.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ setupStatus: 'completed' }),
      });

      if (res.ok) {
        await refreshUser();
        notifications.show({ title: 'PROTOCOL LOCKED', message: 'Account activated.', color: 'green' });
        router.push('/');
      }
    } catch (e) {
      notifications.show({ title: 'Error', message: 'Activation failed.', color: 'red' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-[#050505] relative flex items-center justify-center py-20 px-4">
      <BackgroundHud />
      <Container size={540} p={0} className="relative z-10 w-full">
        <Stack gap={40}>
          <Stack align="center" gap="xs">
            <Box className="p-4 rounded-full border border-red-500/20 bg-red-500/5 animate-pulse">
              <IconLockOpen size={48} className="text-red-500" stroke={1.5} />
            </Box>
            <Title order={1} className="text-white tracking-[0.3em] font-black uppercase text-2xl text-center">
              Mnemonic<span className="text-red-600">Vault</span>
            </Title>
            <Group gap={8} className="opacity-40">
              <IconTerminal2 size={14} className="text-red-400" />
              <Text size="xs" fw={700} className="uppercase tracking-[0.2em] font-mono">Incomplete Handshake</Text>
            </Group>
          </Stack>

          <Paper p={{ base: 24, sm: 40 }} radius={0} bg="transparent" className="border border-red-900/40 backdrop-blur-md relative">
            <div className="absolute -top-[1px] -left-[1px] w-6 h-6 border-t-2 border-l-2 border-red-600" />
            <div className="absolute -bottom-[1px] -right-[1px] w-6 h-6 border-b-2 border-r-2 border-red-600" />

            <Stack gap="xl">
              <Alert color="red" radius={0} variant="filled" className="font-mono border-l-4 border-red-600 bg-red-950/20">
                <Text size="xs" fw={900} className="uppercase mb-1 tracking-widest text-red-500">Security Warning Level 5:</Text>
                <Text size="11px" className="opacity-90 leading-relaxed text-red-200">
                  You must record this 12-word sequence. Dark Capital servers do not persist this phrase. 
                  If lost, recovery is impossible. Total asset forfeiture will occur.
                </Text>
              </Alert>

              <Paper bg="black" p="md" className="border border-gray-800 shadow-inner">
                <Grid gutter="xs">
                  {phrase.split(' ').map((word, i) => (
                    <Grid.Col span={{ base: 6, sm: 4 }} key={i}>
                      <Flex gap={8} align="center" className="bg-white/5 p-2 border border-white/5">
                        <Text size="9px" c="dimmed" fw={900} className="font-mono opacity-50">{String(i + 1).padStart(2, '0')}</Text>
                        <Text size="xs" fw={900} c="green.4" className="font-mono uppercase tracking-widest">{word}</Text>
                      </Flex>
                    </Grid.Col>
                  ))}
                </Grid>
              </Paper>

              <Group grow gap="md">
                <CopyButton value={phrase} timeout={2000}>
                  {({ copied, copy }) => (
                    <Button 
                      variant="outline" color={copied ? "teal" : "gray"} onClick={copy} radius={0}
                      className="uppercase text-[10px] font-black tracking-[0.2em] border-gray-800 h-12"
                      leftSection={copied ? <IconCheck size={14}/> : <IconCopy size={14} />}
                    >
                      {copied ? 'keys copied' : 'copy sequence'}
                    </Button>
                  )}
                </CopyButton>

                <Button 
                  variant="outline" color="gray" onClick={downloadKeys} radius={0}
                  className="uppercase text-[10px] font-black tracking-[0.2em] border-gray-800 h-12"
                  leftSection={<IconDownload size={14} />}
                >
                  Export Keyfile
                </Button>
              </Group>

              <Checkbox 
                color="red" checked={hasSaved} onChange={(e) => setHasSaved(e.currentTarget.checked)}
                label={
                  <Text size="xs" c="dimmed" fw={700} className="uppercase tracking-tighter">
                    I have recorded this BIP39 sequence offline and understand the risk.
                  </Text>
                }
                classNames={{ label: 'pt-1 cursor-pointer', input: 'rounded-none bg-black' }}
              />

              <Button 
                fullWidth size="lg" radius={0} disabled={!hasSaved || !phrase} loading={loading}
                onClick={handleFinalize}
                className={`${hasSaved ? 'bg-blue-600 hover:bg-blue-500' : 'bg-gray-800'} text-white font-black uppercase text-xs h-14 transition-all`}
                leftSection={<IconShieldCheck size={18} />}
              >
                Confirm Vault Lock
              </Button>
            </Stack>
          </Paper>
        </Stack>
      </Container>
    </div>
  );
}