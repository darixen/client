"use client";
import { useEffect, useState, useMemo } from "react";
import {
  Grid,
  Paper,
  Text,
  Progress,
  Group,
  Badge,
  Button,
  Tabs,
  Modal,
  ActionIcon,
  CopyButton,
  Center,
  TextInput,
  NumberInput,
  Stack,
  Divider,
  Tooltip,
  Alert,
  Box,
} from "@mantine/core";
import {
  IconGavel,
  IconBuilding,
  IconCpu,
  IconCheck,
  IconCopy,
  IconAlertCircle,
  IconSearch,
  IconWallet,
  IconRocket,
  IconInfoCircle,
  IconClock,
  IconChartPie,
} from "@tabler/icons-react";
import { SkullLoader } from "@/components/ui/SkullLoader";
import { useAuth } from "@/providers/AuthProvider";
import { useDisclosure } from "@mantine/hooks";
import { notifications } from "@mantine/notifications";
import QRCode from "react-qr-code";
import Loading from "../loading";

const iconMap: any = {
  gavel: <IconGavel size={18} />,
  building: <IconBuilding size={18} />,
  cpu: <IconCpu size={18} />,
};

export default function InvestmentsPage() {
  const { user } = useAuth();
  const [categories, setCategories] = useState<any[]>([]);
  const [pools, setPools] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState<string | null>(null);

  const [opened, { open, close }] = useDisclosure(false);
  const [selectedPool, setSelectedPool] = useState<any>(null);
  const [depositAmount, setDepositAmount] = useState<number | string>(0);
  const [payoutAddress, setPayoutAddress] = useState("");

  const API_URL =
    process.env.NEXT_PUBLIC_PAYLOAD_URL || "http://localhost:3000";

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [catRes, poolRes] = await Promise.all([
          fetch(`${API_URL}/api/investment-categories`),
          fetch(`${API_URL}/api/pools?where[status][equals]=open`),
        ]);
        const catData = await catRes.json();
        const poolData = await poolRes.json();

        setCategories(catData.docs || []);
        if (catData.docs?.length > 0) setActiveTab(catData.docs[0].id);
        setPools(poolData.docs || []);
      } catch (e) {
        notifications.show({
          title: "Sync Error",
          message: "Hub connection failed.",
          color: "red",
        });
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [API_URL]);

  const remainingCap = selectedPool
    ? selectedPool.targetAmount - selectedPool.filledAmount
    : 0;

  // Industrial Math: Calculate expected returns live
  const expectedReturn = useMemo(() => {
    if (!selectedPool || !depositAmount) return 0;
    const principal = Number(depositAmount);
    const interest = principal * (selectedPool.interestRate / 100);
    return principal + interest;
  }, [selectedPool, depositAmount]);

  const handleInitiateDeposit = async () => {
    if (!payoutAddress || !depositAmount || Number(depositAmount) <= 0) {
      notifications.show({
        title: "Error",
        message: "Please fill all fields.",
        color: "red",
      });
      return;
    }

    setSubmitting(true);
    try {
      const walletRes = await fetch(
        `${API_URL}/api/blockchain-wallets?where[address][equals]=${selectedPool.walletAddress}`,
      );
      const walletData = await walletRes.json();
      const walletId = walletData.docs[0]?.id;

      const res = await fetch(`${API_URL}/api/deposits`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user: user?.id,
          pool: selectedPool.id,
          wallet: walletId,
          amount: Number(depositAmount),
          chain: selectedPool.chain,
          payoutAddress: payoutAddress,
          txHash: `PENDING-${user?.id}-${Date.now()}`,
          status: "pending",
        }),
      });

      if (res.ok) {
        notifications.show({
          title: "Signal Confirmed",
          message: "The Scanner is now monitoring for your transaction.",
          color: "blue",
          icon: <IconRocket size={18} />,
        });
        close();
      }
    } catch (e) {
      notifications.show({
        title: "Error",
        message: "Failed to transmit signal.",
        color: "red",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const filteredPools = pools.filter(
    (p) => (p.category?.id || p.category) === activeTab,
  );

  if (loading) return <Loading />;

  return (
    <Box p="lg" className="bg-[#0A0A0A] min-h-screen">
      {/* Institutional Header */}
      <Stack gap={0} mb={40}>
        <Text
          size="xs"
          fw={900}
          c="blue.5"
          className="tracking-[0.3em] uppercase opacity-80"
        >
          Liquidity Provisioning
        </Text>
        <Text
          size="3xl"
          fw={900}
          className="text-white tracking-tighter uppercase"
        >
          Market <span className="text-gray-500">Inventory</span>
        </Text>
      </Stack>

      <Tabs
        value={activeTab}
        onChange={setActiveTab}
        variant="unstyled"
        mb={40}
      >
        <Tabs.List className="flex gap-2">
          {categories.map((cat) => (
            <Tabs.Tab
              key={cat.id}
              value={cat.id}
              className="px-6 py-2 rounded-sm border border-gray-800 text-gray-500 data-[active=true]:bg-white data-[active=true]:text-black data-[active=true]:border-white transition-all uppercase text-[10px] fw-bold"
            >
              {cat.title}
            </Tabs.Tab>
          ))}
        </Tabs.List>
      </Tabs>

      <Grid gutter="xl">
        {filteredPools.length > 0 ? (
          filteredPools.map((pool) => {
            const progress = Math.min(
              (pool.filledAmount / pool.targetAmount) * 100,
              100,
            );
            return (
              <Grid.Col key={pool.id} span={{ base: 12, md: 6, lg: 4 }}>
                <Paper
                  p="xl"
                  bg="#111"
                  className="border border-gray-800 hover:border-blue-500/50 transition-all group"
                >
                  <Stack gap="lg">
                    <Group justify="space-between">
                      <Badge
                        variant="dot"
                        color={pool.chain === "TRON" ? "red" : "blue"}
                        className="bg-transparent uppercase"
                      >
                        {pool.chain} Network
                      </Badge>
                      <Text size="xs" c="dimmed" className="font-mono">
                        #{pool.id.slice(-6)}
                      </Text>
                    </Group>

                    <div>
                      <Text
                        fw={900}
                        size="xl"
                        className="text-white uppercase tracking-tight"
                      >
                        {pool.name}
                      </Text>
                      <Text size="xs" c="dimmed" mt={4}>
                        Guaranteed ROI: {pool.interestRate}%
                      </Text>
                    </div>

                    <Grid gutter="xs">
                      <Grid.Col span={6}>
                        <Paper
                          p="xs"
                          bg="#161616"
                          className="border border-gray-800"
                        >
                          <Text
                            size="10px"
                            c="dimmed"
                            fw={700}
                            tt={"uppercase"}
                          >
                            Target Cap
                          </Text>
                          <Text fw={800} size="sm">
                            ${pool.targetAmount.toLocaleString()}
                          </Text>
                        </Paper>
                      </Grid.Col>
                      <Grid.Col span={6}>
                        <Paper
                          p="xs"
                          bg="#161616"
                          className="border border-gray-800"
                        >
                          <Text
                            size="10px"
                            c="dimmed"
                            fw={700}
                            tt={"uppercase"}
                          >
                            Lock Duration
                          </Text>
                          <Text fw={800} size="sm">
                            {pool.lockDurationDays} Days
                          </Text>
                        </Paper>
                      </Grid.Col>
                    </Grid>

                    <div>
                      <Group justify="space-between" mb={6}>
                        <Text size="10px" fw={900} c="dimmed" tt={"uppercase"}>
                          Vault Utilization
                        </Text>
                        <Text size="xs" fw={900} c="blue">
                          {Math.round(progress)}%
                        </Text>
                      </Group>
                      <Progress
                        value={progress}
                        color="blue"
                        size="sm"
                        radius={0}
                        bg="gray.9"
                      />
                    </div>

                    <Button
                      fullWidth
                      onClick={() => {
                        setSelectedPool(pool);
                        open();
                      }}
                      variant="white"
                      radius={0}
                      fw={900}
                      className="text-black uppercase text-xs h-12"
                    >
                      Allocate Capital
                    </Button>
                  </Stack>
                </Paper>
              </Grid.Col>
            );
          })
        ) : (
          <Grid.Col span={12}>
            <Center
              py={100}
              className="flex-col gap-4 border border-dashed border-gray-800"
            >
              <IconSearch size={48} className="text-gray-800" />
              <div className="text-center">
                <Text fw={900} c="gray.6" tt={"uppercase"}>
                  No Active Vaults
                </Text>
                <Text size="xs" c="dimmed">
                  This sector is currently fully capitalized.
                </Text>
              </div>
            </Center>
          </Grid.Col>
        )}
      </Grid>

      {/* Industrial Deposit Modal */}
      <Modal
        opened={opened}
        onClose={close}
        centered
        size="lg"
        radius={0}
        withCloseButton={false}
        classNames={{
          content: "bg-[#0F0F0F] border border-gray-800 p-0",
          body: "p-0",
        }}
      >
        {selectedPool && (
          <div className="flex flex-col">
            <div className="p-6 bg-[#161616] border-b border-gray-800 flex justify-between items-center">
              <Group gap="sm">
                <IconWallet className="text-blue-500" size={24} />
                <Text fw={900} className="uppercase tracking-widest text-white">
                  Initiate {selectedPool.chain} Transfer
                </Text>
              </Group>
              <ActionIcon variant="subtle" color="gray" onClick={close}>
                &times;
              </ActionIcon>
            </div>

            <div className="p-8">
              <Grid gutter="xl">
                <Grid.Col span={{ base: 12, md: 5 }}>
                  <Stack align="center" gap="md">
                    <div className="bg-white p-3 shadow-2xl">
                      <QRCode value={selectedPool.walletAddress} size={160} />
                    </div>
                    <Text
                      size="10px"
                      c="dimmed"
                      fw={700}
                      tt="uppercase"
                      className="text-center"
                    >
                      Scan to transfer via {selectedPool.chain}
                    </Text>
                  </Stack>
                </Grid.Col>

                <Grid.Col span={{ base: 12, md: 7 }}>
                  <Stack gap="lg">
                    <Paper p="md" bg="black" className="border border-gray-800">
                      <Text
                        size="10px"
                        c="dimmed"
                        fw={800}
                        mb={4}
                        tt={"uppercase"}
                      >
                        Designated Vault
                      </Text>
                      <Group justify="space-between" wrap="nowrap">
                        <Text className="font-mono text-[11px] text-green-400 truncate">
                          {selectedPool.walletAddress}
                        </Text>
                        <CopyButton value={selectedPool.walletAddress}>
                          {({ copied, copy }) => (
                            <Tooltip label={copied ? "Copied" : "Copy Address"}>
                              <ActionIcon
                                variant="subtle"
                                color={copied ? "teal" : "gray"}
                                onClick={copy}
                              >
                                {copied ? (
                                  <IconCheck size={14} />
                                ) : (
                                  <IconCopy size={14} />
                                )}
                              </ActionIcon>
                            </Tooltip>
                          )}
                        </CopyButton>
                      </Group>
                    </Paper>

                    <div className="space-y-4">
                      <NumberInput
                        label="PRINCIPAL AMOUNT (USDC)"
                        max={remainingCap} // <--- PREVENTS UI OVERFLOW
                        description={`Remaining Capacity: $${remainingCap.toLocaleString()}`}
                        error={
                          Number(depositAmount) > remainingCap
                            ? "Amount exceeds vault capacity"
                            : null
                        }
                        value={depositAmount}
                        onChange={setDepositAmount}
                        variant="filled"
                        hideControls
                        classNames={{
                          input:
                            "bg-[#161616] border-gray-800 text-white font-mono text-lg h-12",
                        }}
                      />
                      <TextInput
                        label={`${selectedPool.chain} RETURN ADDRESS`}
                        placeholder="Enter your destination wallet"
                        value={payoutAddress}
                        onChange={(e) =>
                          setPayoutAddress(e.currentTarget.value)
                        }
                        variant="filled"
                        classNames={{
                          input:
                            "bg-[#161616] border-gray-800 text-white font-mono h-12",
                        }}
                      />
                    </div>
                  </Stack>
                </Grid.Col>
              </Grid>

              <Divider
                my={30}
                color="gray.9"
                label="Maturity Projection"
                labelPosition="center"
              />

              <Grid gutter="md">
                <Grid.Col span={6}>
                  <Text size="xs" c="dimmed">
                    Gross Maturity Payout
                  </Text>
                  <Text size="xl" fw={900} c="green.5">
                    ${expectedReturn.toLocaleString()}
                  </Text>
                </Grid.Col>
                <Grid.Col span={6}>
                  <Text size="xs" c="dimmed">
                    Net Interest
                  </Text>
                  <Text size="xl" fw={900} c="blue.5">
                    +$
                    {(expectedReturn - Number(depositAmount)).toLocaleString()}
                  </Text>
                </Grid.Col>
              </Grid>

              <Button
                mt={30}
                fullWidth
                size="xl"
                color="blue"
                radius={0}
                loading={submitting}
                onClick={handleInitiateDeposit}
                leftSection={<IconRocket size={20} />}
              >
                DEPLOY CAPITAL
              </Button>

              <Text
                size="10px"
                c="dimmed"
                mt="sm"
                className="text-center italic"
              >
                By deploying, you agree to the {selectedPool.lockDurationDays}
                -day institutional lock period.
              </Text>
            </div>
          </div>
        )}
      </Modal>
    </Box>
  );
}
