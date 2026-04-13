'use client';
import { useState, useEffect } from 'react';
import { Container, Paper, TextInput, Button, Title, Avatar, Group, Text, Divider } from '@mantine/core';
import { useAuth } from '@/providers/AuthProvider';
import { IconDeviceFloppy } from '@tabler/icons-react';

export default function ProfilePage() {
  const { user, refreshUser } = useAuth();
  const [formData, setFormData] = useState({ fullName: '', telegramHandle: '', email: '' });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (user) {
      setFormData({
        fullName: user.fullName || '',
        telegramHandle: user.telegramHandle || '',
        email: user.email || '',
      });
    }
  }, [user]);

  const handleUpdate = async () => {
    setSaving(true);
    try {
      const API_URL = process.env.NEXT_PUBLIC_PAYLOAD_URL || 'http://localhost:3000';
      const res = await fetch(`${API_URL}/api/users/${user?.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullName: formData.fullName,
          telegramHandle: formData.telegramHandle
        }),
      });

      if (res.ok) {
        await refreshUser();
        // Add toast notification here
      }
    } catch (error) {
      console.error(error);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Container size="sm" py="xl">
      <Title order={2} className="text-white mb-6">Operative Profile</Title>
      
      <Paper p="xl" radius="md" bg="#141517" className="border border-gray-800">
        <Group mb="xl">
           <Avatar size="xl" radius="xl" color="blue" src={null} alt={user?.email}>
             {(user?.email?.[0] || 'U').toUpperCase()}
           </Avatar>
           <div>
             <Text size="lg" fw={700} c="white">{user?.email}</Text>
             <Text size="sm" c="dimmed">Security Level: Standard</Text>
           </div>
        </Group>

        <Divider my="lg" color="dark.5" />

        <div className="space-y-4">
          <TextInput 
            label="Full Alias (Name)" 
            value={formData.fullName}
            onChange={(e) => setFormData({...formData, fullName: e.target.value})}
            classNames={{ input: 'bg-[#1A1B1E] border-gray-700 text-white' }}
          />
          
          <TextInput 
            label="Telegram Handle (Secure Comms)" 
            value={formData.telegramHandle}
            onChange={(e) => setFormData({...formData, telegramHandle: e.target.value})}
            description="Used for emergency contact regarding high-value pools."
            classNames={{ input: 'bg-[#1A1B1E] border-gray-700 text-white' }}
          />

          <TextInput 
            label="Email Identity" 
            value={formData.email} 
            disabled 
            classNames={{ input: 'bg-[#101113] border-none text-gray-500' }}
          />
        </div>

        <Button 
          fullWidth 
          mt="xl" 
          color="blue" 
          loading={saving}
          leftSection={<IconDeviceFloppy size={18} />}
          onClick={handleUpdate}
        >
          Save Changes
        </Button>
      </Paper>
    </Container>
  );
}