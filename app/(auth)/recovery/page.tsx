'use client';

import { useState, useMemo } from 'react';
import { 
  TextInput, PasswordInput, Button, Paper, Title, Container, 
  Text, Anchor, Stack, Box, Flex, Grid, Divider, ActionIcon, 
  Tooltip, Progress, Group
} from '@mantine/core';
import { 
  IconKey, IconShieldCheck, IconAlertTriangle, IconArrowLeft, 
  IconLock, IconClipboardText, IconShieldLock, IconChevronRight
} from '@tabler/icons-react';
import { useRouter } from 'next/navigation';
import { notifications } from '@mantine/notifications';
import Link from 'next/link';
import { BackgroundHud } from '@/components/auth/BackgroundHud';
import { SecurityFeed } from '@/components/auth/SecurityFeed';

export default function RecoveryPage() {
  const [step, setStep] = useState(1); 
  const [words, setWords] = useState(Array(12).fill(''));
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  
  const API_URL = process.env.NEXT_PUBLIC_PAYLOAD_URL || 'http://localhost:3000';

  // --- INDUSTRIAL LOGIC: PASSWORD STRENGTH ---
  const strength = useMemo(() => {
    let s = 0;
    if (newPassword.length > 7) s += 25;
    if (/[A-Z]/.test(newPassword)) s += 25;
    if (/[0-9]/.test(newPassword)) s += 25;
    if (/[^A-Za-z0-9]/.test(newPassword)) s += 25;
    return s;
  }, [newPassword]);

  const passwordsMatch = newPassword.length > 0 && newPassword === confirmPassword;

  const getStrengthColor = () => {
    if (strength === 0) return 'gray.8';
    if (strength < 50) return 'red.7';
    if (strength < 100) return 'orange.7';
    return 'blue.6';
  };

  // --- SMART PASTE LOGIC ---
  const handleSmartPaste = (text: string) => {
    const pastedWords = text.trim().split(/\s+/).slice(0, 12);
    if (pastedWords.length === 12) {
      setWords(pastedWords.map(w => w.toLowerCase()));
      notifications.show({ title: 'SEQUENCE DETECTED', message: '12 words mapped to grid.', color: 'blue' });
    } else {
      notifications.show({ title: 'PASTE ERROR', message: 'Clipboard must contain exactly 12 words.', color: 'red' });
    }
  };

  const readClipboard = async () => {
    try {
      const text = await navigator.clipboard.readText();
      handleSmartPaste(text);
    } catch (err) {
      notifications.show({ title: 'ACCESS DENIED', message: 'Permission to read clipboard rejected.', color: 'red' });
    }
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const mnemonic = words.join(' ').toLowerCase().trim();

    try {
      const res = await fetch(`${API_URL}/api/users/verify-mnemonic`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mnemonic }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      notifications.show({ title: 'IDENTITY VERIFIED', message: 'Mnemonic sequence accepted.', color: 'blue' });
      setStep(2);
    } catch (err: any) {
      notifications.show({ title: 'VERIFICATION FAILED', message: err.message, color: 'red', icon: <IconAlertTriangle size={16}/> });
    } finally { setLoading(false); }
  };

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (strength < 75) {
      notifications.show({ title: 'VULNERABILITY', message: 'New access code entropy too low.', color: 'red' });
      return;
    }
    if (!passwordsMatch) {
      notifications.show({ title: 'MISMATCH', message: 'Confirmation keys do not align.', color: 'red' });
      return;
    }

    setLoading(true);
    const mnemonic = words.join(' ').toLowerCase().trim();

    try {
      const res = await fetch(`${API_URL}/api/users/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mnemonic, newPassword }),
      });

      if (!res.ok) throw new Error('Protocol update failed.');

      notifications.show({ title: 'ACCESS RESTORED', message: 'Encryption keys updated.', color: 'green' });
      router.push('/login');
    } catch (err: any) {
      notifications.show({ title: 'ERROR', message: err.message, color: 'red' });
    } finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen w-full bg-[#050505] relative flex flex-col items-center justify-center py-20 px-4 overflow-x-hidden">
      <BackgroundHud />
      <Container size={step === 1 ? 520 : 440} p={0} className="relative z-10 w-full">
        <Stack gap={40}>
          
          <Stack align="center" gap="xs">
            <Box className="p-4 rounded-full border border-blue-500/20 bg-blue-500/5 animate-pulse">
              <IconKey size={48} className="text-blue-500" stroke={1.5} />
            </Box>
            <Title order={1} className="text-white tracking-[0.3em] font-black uppercase text-2xl text-center">
              Node<span className="text-blue-600">Recovery</span>
            </Title>
          </Stack>

          <Paper p={{ base: 24, sm: 40 }} radius={0} bg="transparent" className="border border-gray-800 backdrop-blur-md relative">
            <div className="absolute -top-[1px] -left-[1px] w-4 h-4 border-t-2 border-l-2 border-blue-600" />
            
            {step === 1 ? (
              <form onSubmit={handleVerify}>
                <Stack gap="lg">
                  <Flex justify="space-between" align="center">
                    <Text size="xs" c="dimmed" fw={900} className="uppercase tracking-widest">Master Sequence</Text>
                    <Button 
                      size="compact-xs" variant="subtle" color="blue" 
                      leftSection={<IconClipboardText size={14}/>}
                      onClick={readClipboard}
                      className="uppercase text-[9px] tracking-tighter"
                    >
                      Paste Sequence
                    </Button>
                  </Flex>

                  <Grid gutter="xs">
                    {words.map((w, i) => (
                      <Grid.Col span={{ base: 6, sm: 4 }} key={i}>
                        <TextInput 
                          placeholder={`${String(i+1).padStart(2, '0')}.`} required variant="filled"
                          onPaste={(e) => {
                            if (i === 0) {
                              const val = e.clipboardData.getData('text');
                              if (val.split(/\s+/).length > 1) {
                                e.preventDefault();
                                handleSmartPaste(val);
                              }
                            }
                          }}
                          classNames={{ input: 'bg-black/50 border-gray-800 text-white font-mono text-xs uppercase' }}
                          value={w} onChange={(e) => {
                            const newWords = [...words];
                            newWords[i] = e.target.value.toLowerCase().trim();
                            setWords(newWords);
                          }}
                        />
                      </Grid.Col>
                    ))}
                  </Grid>

                  <Button 
                    fullWidth size="lg" radius={0} mt="lg" type="submit" loading={loading} 
                    className="bg-blue-600 text-white font-black uppercase text-xs h-14 transition-all"
                  >
                    Verify Security Handshake
                  </Button>
                </Stack>
              </form>
            ) : (
              <form onSubmit={handleReset}>
                <Stack gap="lg">
                  <Box>
                    <PasswordInput 
                      label="NEW ENCRYPTION CODE" placeholder="••••••••" required variant="filled"
                      value={newPassword} onChange={(e) => setNewPassword(e.target.value)}
                      classNames={{ input: 'bg-black/50 border-gray-800 h-12 text-white', label: 'text-gray-500 text-[10px] font-bold uppercase tracking-widest mb-1' }}
                    />
                    <Stack gap={4} mt={10}>
                      <Flex justify="space-between" align="center">
                        <Text size="9px" fw={900} c="dimmed" className="uppercase">Entropy Analysis</Text>
                        <Text size="9px" fw={900} c={getStrengthColor()}>{strength}% SECURE</Text>
                      </Flex>
                      <Progress color={getStrengthColor()} size="2px" value={strength} radius={0} bg="gray.9" />
                    </Stack>
                  </Box>

                  <Box>
                    <PasswordInput 
                      label="CONFIRM ENCRYPTION CODE" placeholder="••••••••" required variant="filled"
                      value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)}
                      error={confirmPassword && !passwordsMatch ? "Keys do not match" : null}
                      classNames={{ input: 'bg-black/50 border-gray-800 h-12 text-white', label: 'text-gray-500 text-[10px] font-bold uppercase tracking-widest mb-1' }}
                    />
                  </Box>

                  <Button 
                    fullWidth size="lg" radius={0} mt="md" type="submit" loading={loading} 
                    disabled={!passwordsMatch || strength < 75}
                    className={`${passwordsMatch && strength >= 75 ? 'bg-blue-600 hover:bg-blue-500' : 'bg-gray-800'} text-white font-black uppercase text-xs h-14 transition-all`}
                    leftSection={loading ? null : <IconShieldLock size={18} />}
                    rightSection={loading ? null : <IconChevronRight size={14} className="opacity-50" />}
                  >
                    Authorize Node Access
                  </Button>
                </Stack>
              </form>
            )}

            <Divider my={30} color="gray.9" />
            <Flex justify="center">
              <Anchor component={Link} href="/login" c="gray.6" size="xs" className="uppercase tracking-widest font-bold flex items-center gap-2 hover:text-white transition-colors">
                <IconArrowLeft size={14} /> Return to Terminal
              </Anchor>
            </Flex>
          </Paper>
          <SecurityFeed type="recovery" />
        </Stack>
      </Container>
    </div>
  );
}