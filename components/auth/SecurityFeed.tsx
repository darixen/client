// components/auth/SecurityFeed.tsx
import { Group, Stack, Text } from '@mantine/core';
import { IconActivity } from '@tabler/icons-react';

export const SecurityFeed = ({ type = "access" }: { type?: string }) => (
  <Stack gap="xs" className="opacity-40">
    <Group justify="center" gap="md">
      <Group gap={4}>
        <IconActivity size={12} className="text-green-500" />
        <Text size="10px" className="font-mono text-gray-500 uppercase tracking-widest">Link: Active</Text>
      </Group>
      <Group gap={4}>
        <div className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
        <Text size="10px" className="font-mono text-gray-500 uppercase tracking-widest">Encrypted</Text>
      </Group>
    </Group>
    
    <Text size="10px" ta="center" className="font-mono text-gray-500 uppercase leading-relaxed px-4">
      Warning: All {type} attempts recorded via syndicate monitoring.<br/>
      Unauthorized entry results in node termination.
    </Text>
  </Stack>
);