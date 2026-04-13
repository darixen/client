'use client';
import { useEffect, useState, useMemo } from 'react';
import { 
  Container, Grid, Paper, Text, Group, Table, Badge, 
  Skeleton, Stack, ScrollArea, ActionIcon, Tooltip as MantineTooltip,
  Center, Divider, Box
} from '@mantine/core';
import { 
  IconTrendingUp, IconArrowUpRight, IconArrowDownLeft, 
  IconWallet, IconActivity, IconBox, IconExternalLink, IconSearch 
} from '@tabler/icons-react';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, 
  Tooltip, ResponsiveContainer, PieChart, Pie, Cell 
} from 'recharts';
import { useAuth } from '@/providers/AuthProvider';

const COLORS = ['#3b82f6', '#22c55e', '#a855f7', '#f59e0b', '#06b6d4', '#ef4444'];

export default function PortfolioPage() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [deposits, setDeposits] = useState<any[]>([]);

  const API_URL = process.env.NEXT_PUBLIC_PAYLOAD_URL || "http://localhost:3000";

  useEffect(() => {
    const fetchPortfolio = async () => {
      if (!user?.id) return;
      try {
        // Fetch real deposits for this user
        // We include 'pool' and 'pool.category' via Payload's depth parameter
        const res = await fetch(`${API_URL}/api/deposits?where[user][equals]=${user.id}&limit=1000&sort=-createdAt&depth=2`);
        const data = await res.json();
        setDeposits(data.docs || []);
      } catch (e) {
        console.error("Portfolio Sync Error:", e);
      } finally {
        setLoading(false);
      }
    };
    fetchPortfolio();
  }, [user, API_URL]);

  // --- INDUSTRIAL DATA PROCESSING ---
  const stats = useMemo(() => {
    const confirmed = deposits.filter(d => d.status === 'confirmed');
    
    // 1. Total Capital Deployed
    const totalInvested = confirmed.reduce((sum, d) => sum + d.amount, 0);

    // 2. Active Pool Count
    const activePools = new Set(confirmed.map(d => d.pool?.id)).size;

    // 3. Allocation (Pie Chart)
    const allocationMap: Record<string, number> = {};
    confirmed.forEach(d => {
      const category = d.pool?.category?.title || 'General';
      allocationMap[category] = (allocationMap[category] || 0) + d.amount;
    });
    const allocation = Object.entries(allocationMap).map(([name, value], i) => ({
      name, value, color: COLORS[i % COLORS.length]
    }));

    // 4. Growth History (Area Chart)
    // We sort chronologically and create a running total
    const growth = confirmed
      .slice()
      .reverse()
      .reduce((acc: any[], d) => {
        const lastVal = acc.length > 0 ? acc[acc.length - 1].value : 0;
        acc.push({
          date: new Date(d.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
          value: lastVal + d.amount
        });
        return acc;
      }, []);

    return { totalInvested, activePools, allocation, growth };
  }, [deposits]);

  if (loading) return <PortfolioLoader />;

  return (
    <Container size="xl" py="xl" className="bg-[#0A0A0A] min-h-screen">
      <Stack gap={0} mb={40}>
        <Text size="xs" fw={900} c="blue.5" className="tracking-[0.3em] uppercase opacity-80">
          Portfolio Management
        </Text>
        <Text size="3xl" fw={900} className="text-white tracking-tighter uppercase">
          Asset Command <span className="text-gray-500">Center</span>
        </Text>
      </Stack>

      {/* Metric Dashboard */}
      <Grid mb="xl" gutter="md">
        <MetricCard 
          title="Net Liquidity" 
          value={`$${stats.totalInvested.toLocaleString()}`} 
          subValue="Real-time blockchain valuation"
          icon={<IconWallet size={22} />} 
          color="blue"
        />
        <MetricCard 
          title="Active Positions" 
          value={stats.activePools.toString()} 
          subValue="Across diversified sectors"
          icon={<IconBox size={22} />} 
          color="emerald"
        />
        <MetricCard 
          title="Projected Yield" 
          value="12.4%" 
          subValue="Weighted avg. interest rate"
          icon={<IconActivity size={22} />} 
          color="purple"
        />
      </Grid>

      {deposits.length > 0 ? (
        <>
          <Grid mb="xl" gutter="md">
            {/* Growth Curve */}
            <Grid.Col span={{ base: 12, lg: 8 }}>
              <Paper p="xl" bg="#111" className="border border-gray-800 h-[450px]">
                <Group justify="space-between" mb="xl">
                  <div>
                    <Text fw={900} size="sm" className="uppercase tracking-widest text-gray-400">Growth Index</Text>
                    <Text size="xs" c="dimmed">Cumulative investment volume over time</Text>
                  </div>
                  <IconTrendingUp size={20} className="text-blue-500"/>
                </Group>
                
                <ResponsiveContainer width="100%" height="80%">
                  <AreaChart data={stats.growth}>
                    <defs>
                      <linearGradient id="growthGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1F2937" vertical={false} />
                    <XAxis dataKey="date" stroke="#4B5563" fontSize={10} tickLine={false} axisLine={false} />
                    <YAxis stroke="#4B5563" fontSize={10} tickLine={false} axisLine={false} tickFormatter={(v) => `$${v}`} />
                    <Tooltip content={<CustomTooltip />} />
                    <Area type="monotone" dataKey="value" stroke="#3b82f6" strokeWidth={3} fill="url(#growthGrad)" />
                  </AreaChart>
                </ResponsiveContainer>
              </Paper>
            </Grid.Col>

            {/* Allocation */}
            <Grid.Col span={{ base: 12, lg: 4 }}>
              <Paper p="xl" bg="#111" className="border border-gray-800 h-[450px] flex flex-col">
                <Text fw={900} size="sm" className="uppercase tracking-widest text-gray-400" mb="xl">Sector Exposure</Text>
                
                <div className="flex-1 relative">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={stats.allocation}
                        innerRadius={75}
                        outerRadius={95}
                        paddingAngle={10}
                        dataKey="value"
                        stroke="none"
                      >
                        {stats.allocation.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                    <Text size="xs" c="dimmed" fw={900}>Sectors</Text>
                    <Text size="xl" fw={900} c="white">{stats.allocation.length}</Text>
                  </div>
                </div>

                <Stack gap={10} mt="xl">
                  {stats.allocation.map((item) => (
                    <Group key={item.name} justify="space-between" wrap="nowrap">
                      <Group gap="xs">
                        <Box w={8} h={8} style={{ borderRadius: '2px', backgroundColor: item.color }} />
                        <Text size="xs" fw={700} c="gray.4">{item.name}</Text>
                      </Group>
                      <Text size="xs" fw={900} className="font-mono text-white">${item.value.toLocaleString()}</Text>
                    </Group>
                  ))}
                </Stack>
              </Paper>
            </Grid.Col>
          </Grid>

          {/* Transaction Ledger */}
          <Paper bg="#111" className="border border-gray-800 overflow-hidden">
            <Box p="lg" bg="#161616" className="border-b border-gray-800">
              <Text fw={900} size="xs" className="tracking-[0.2em] uppercase text-gray-500">Full Transaction Ledger</Text>
            </Box>
            
            <ScrollArea>
              <Table horizontalSpacing="xl" verticalSpacing="md" className="min-w-[900px]">
                <Table.Thead className="bg-[#161616]">
                  <Table.Tr>
                    <Table.Th className="text-gray-600 size-xs border-none">TX HASH</Table.Th>
                    <Table.Th className="text-gray-600 size-xs border-none">NETWORK</Table.Th>
                    <Table.Th className="text-gray-600 size-xs border-none">ASSET POOL</Table.Th>
                    <Table.Th className="text-gray-600 size-xs border-none text-right">VOLUME</Table.Th>
                    <Table.Th className="text-gray-600 size-xs border-none text-right">STATUS</Table.Th>
                  </Table.Tr>
                </Table.Thead>
                <Table.Tbody>
                  {deposits.map((tx) => (
                    <Table.Tr key={tx.id} className="hover:bg-[#1A1A1A] border-b border-gray-900 transition-colors">
                      <Table.Td>
                        <Group gap="xs">
                          <Text size="xs" className="font-mono text-blue-500">{tx.txHash?.slice(0, 16)}...</Text>
                          <IconExternalLink size={12} className="text-gray-700 cursor-pointer hover:text-white" />
                        </Group>
                      </Table.Td>
                      <Table.Td>
                        <Badge size="xs" radius={0} color={tx.chain === 'TRON' ? 'red' : 'blue'} variant="outline">
                          {tx.chain}
                        </Badge>
                      </Table.Td>
                      <Table.Td>
                        <Text size="xs" fw={700} c="gray.3">{tx.pool?.name || 'Processing...'}</Text>
                      </Table.Td>
                      <Table.Td className="text-right">
                        <Text size="xs" fw={900} c="white" className="font-mono">${tx.amount?.toLocaleString()}</Text>
                      </Table.Td>
                      <Table.Td className="text-right">
                        <StatusBadge status={tx.status} />
                      </Table.Td>
                    </Table.Tr>
                  ))}
                </Table.Tbody>
              </Table>
            </ScrollArea>
          </Paper>
        </>
      ) : (
        <EmptyState />
      )}
    </Container>
  );
}

// --- INDUSTRIAL SUBCOMPONENTS ---

function MetricCard({ title, value, subValue, icon, color }: any) {
  return (
    <Grid.Col span={{ base: 12, md: 4 }}>
      <Paper p="xl" bg="#111" className="border border-gray-800 relative group overflow-hidden">
        <Box className={`absolute top-0 left-0 w-1 h-full bg-${color}-500`} />
        <Group justify="space-between" align="flex-start">
          <Stack gap={4}>
            <Text size="10px" c="dimmed" fw={900} className="tracking-[0.2em] uppercase">{title}</Text>
            <Text size="2xl" fw={900} c="white" className="font-mono">{value}</Text>
            <Text size="xs" c="dimmed">{subValue}</Text>
          </Stack>
          <Box p="md" bg="#161616" className="rounded group-hover:scale-110 transition-transform">
            {icon}
          </Box>
        </Group>
      </Paper>
    </Grid.Col>
  );
}

function StatusBadge({ status }: { status: string }) {
  const map: any = {
    confirmed: { color: 'green', label: 'Verified' },
    pending: { color: 'yellow', label: 'Processing' },
    failed: { color: 'red', label: 'Failed' }
  };
  const config = map[status] || { color: 'gray', label: status };
  return <Badge color={config.color} variant="dot" size="xs" radius={0} className="uppercase fw-bold">{config.label}</Badge>;
}

function EmptyState() {
  return (
    <Center py={100} className="border border-dashed border-gray-800 rounded">
      <Stack align="center" gap="sm">
        <IconSearch size={48} className="text-gray-800" />
        <Text fw={900} c="gray.6" className="uppercase tracking-widest">No Active Positions</Text>
        <Text size="xs" c="dimmed">Begin by deploying capital into an available investment pool.</Text>
      </Stack>
    </Center>
  );
}

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload?.[0]) {
    return (
      <Paper p="sm" bg="#161616" className="border border-gray-800 shadow-2xl">
        <Text size="10px" c="dimmed" mb={4} tt="uppercase" fw={800}>{payload[0].payload.date}</Text>
        <Text fw={900} size="sm" c="white">${payload[0].value.toLocaleString()}</Text>
      </Paper>
    );
  }
  return null;
};

function PortfolioLoader() {
  return (
    <Container size="xl" py="xl">
      <Skeleton h={40} w={300} mb="xl" bg="gray.9" />
      <Grid mb="xl">
        {[1, 2, 3].map(i => <Grid.Col key={i} span={4}><Skeleton h={140} radius={0} bg="gray.9" /></Grid.Col>)}
      </Grid>
      <Skeleton h={400} radius={0} bg="gray.9" />
    </Container>
  );
}