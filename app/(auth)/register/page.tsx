"use client";

import { useState, useMemo } from "react";
import {
  TextInput,
  PasswordInput,
  Button,
  Paper,
  Title,
  Container,
  Text,
  Anchor,
  Stack,
  Box,
  Flex,
  Group,
  Alert,
  CopyButton,
  ActionIcon,
  Tooltip,
  Divider,
  Grid,
  Checkbox,
  Progress,
  Transition,
} from "@mantine/core";
import {
  IconAlertTriangle,
  IconCopy,
  IconCheck,
  IconFingerprint,
  IconShieldCheck,
  IconTerminal2,
  IconUserPlus,
  IconActivity,
  IconDownload,
  IconLockOpen,
  IconChevronRight,
  IconShieldLock,
} from "@tabler/icons-react";
import { useRouter } from "next/navigation";
import { register } from "@/lib/auth/actions";
import { notifications } from "@mantine/notifications";
import Link from "next/link";

// Custom Components
import { SecurityFeed } from "@/components/auth/SecurityFeed";
import { BackgroundHud } from "@/components/auth/BackgroundHud";

export default function RegisterPage() {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    fullName: "",
  });
  const [createdUserId, setCreatedUserId] = useState<string | null>(null);
  const [phrase, setPhrase] = useState("");
  const [loading, setLoading] = useState(false);
  const [hasSaved, setHasSaved] = useState(false);
  const router = useRouter();
  const API_URL =
    process.env.NEXT_PUBLIC_PAYLOAD_URL || "http://localhost:3000";

  // --- INDUSTRIAL LOGIC: PASSWORD STRENGTH ---
  const strength = useMemo(() => {
    let s = 0;
    if (formData.password.length > 7) s += 25;
    if (/[A-Z]/.test(formData.password)) s += 25;
    if (/[0-9]/.test(formData.password)) s += 25;
    if (/[^A-Za-z0-9]/.test(formData.password)) s += 25;
    return s;
  }, [formData.password]);

  const getStrengthColor = () => {
    if (strength === 0) return "gray.8";
    if (strength < 50) return "red.7";
    if (strength < 100) return "orange.7";
    return "blue.6";
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // 1. Password Entropy Check (from previous update)
    if (strength < 75) {
      notifications.show({
        title: "SECURITY VULNERABILITY",
        message: "Encryption key entropy too low.",
        color: "red",
      });
      return;
    }

    setLoading(true);

    try {
      const data = await register(
        formData.email,
        formData.password,
        formData.fullName,
      );
      console.log("RAW DATA FROM SERVER:", data);

      // 1. Check for errors
      if (
        data.errors ||
        data.message === "The request could not be completed."
      ) {
        throw new Error(data.errors?.[0]?.message || "Identity Sync Failed");
      }

      // 2. Extract the phrase (Handling both Payload response styles)
      const createdUser = data.doc || data;
      const mnemonic = createdUser.generatedPhrase;

      if (createdUser && mnemonic) {
        setCreatedUserId(createdUser.id);
        setPhrase(mnemonic); // Save phrase to state

        notifications.show({
          title: "IDENTITY ESTABLISHED",
          message: "Node synchronized. Accessing Mnemonic Vault...",
          color: "blue.6",
          icon: <IconShieldCheck size={16} />,
        });

        // 3. EXECUTE TRANSITION TO VAULT (Step 2)
        setStep(2);
        window.scrollTo({ top: 0, behavior: "smooth" });
      } else {
        // If mnemonic is missing, registration worked but phrase didn't return
        throw new Error("Mnemonic generation failed. Contact Admin.");
      }
    } catch (err: any) {
      notifications.show({
        title: "REGISTRATION ERROR",
        message: err.message || "System unable to verify new operative.",
        color: "red.8",
        icon: <IconAlertTriangle size={16} />,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleFinalizeRegistration = async () => {
    if (!createdUserId || !phrase) return;

    setLoading(true);
    try {
      // Call the CUSTOM endpoint instead of the standard PATCH /api/users/:id
      const res = await fetch(`${API_URL}/api/users/activate`, {
        method: "POST", // Changed from PATCH
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: createdUserId,
          mnemonic: phrase, // Prove we own the account
        }),
      });

      const data = await res.json();

      if (res.ok) {
        notifications.show({
          title: "PROTOCOL LOCKED",
          message: "Security handshake successful. Node activated.",
          color: "blue.6",
          icon: <IconShieldCheck size={18} />,
        });
        router.push("/login");
      } else {
        throw new Error(data.error || "Activation failed");
      }
    } catch (err: any) {
      notifications.show({
        title: "ACTIVATION ERROR",
        message: err.message,
        color: "red",
      });
    } finally {
      setLoading(false);
    }
  };

  const downloadKeys = () => {
    const element = document.createElement("a");
    const file = new Blob(
      [
        `DARK CAPITAL - SECURE RECOVERY KEY\n`,
        `-----------------------------------\n`,
        `OPERATIVE: ${formData.fullName.toUpperCase()}\n`,
        `IDENTIFIER: ${formData.email.toLowerCase()}\n`,
        `CLEARANCE DATE: ${new Date().toISOString()}\n\n`,
        `MNEMONIC PHRASE (BIP39 Standard):\n${phrase}\n\n`,
        `CRITICAL WARNING: If you lose this phrase, your assets are lost forever.\n`,
        `Do not share this file. Store on an encrypted drive or physical paper.`,
      ],
      { type: "text/plain" },
    );
    element.href = URL.createObjectURL(file);
    element.download = `Vault_Keys_${formData.fullName.replace(/\s+/g, "_")}.txt`;
    document.body.appendChild(element);
    element.click();
    notifications.show({
      title: "EXPORT SUCCESSFUL",
      message: "Keys exported to local storage.",
      color: "blue",
    });
  };

  return (
    <div className="min-h-screen w-full bg-[#050505] relative flex flex-col items-center justify-center py-20 px-4 overflow-x-hidden">
      <BackgroundHud />

      <Container
        size={step === 1 ? 440 : 540}
        p={0}
        className="relative z-10 w-full"
      >
        <Stack gap={30}>
          {/* TACTICAL STEPPER HUD */}
          <Flex justify="center" align="center" gap="xl" className="opacity-60">
            <Stack gap={4} align="center">
              <Box
                className={`w-8 h-1 ${step >= 1 ? "bg-blue-600" : "bg-gray-800"}`}
              />
              <Text
                size="10px"
                fw={900}
                c={step >= 1 ? "white" : "dimmed"}
                className="font-mono"
              >
                01_IDENTITY
              </Text>
            </Stack>
            <Stack gap={4} align="center">
              <Box
                className={`w-8 h-1 ${step >= 2 ? "bg-blue-600" : "bg-gray-800"}`}
              />
              <Text
                size="10px"
                fw={900}
                c={step >= 2 ? "white" : "dimmed"}
                className="font-mono"
              >
                02_VAULT
              </Text>
            </Stack>
          </Flex>

          <Stack align="center" gap="xs">
            <Box
              className={`p-4 rounded-full border ${step === 1 ? "border-blue-500/20 bg-blue-500/5" : "border-red-500/20 bg-red-500/5"} animate-pulse`}
            >
              {step === 1 ? (
                <IconUserPlus
                  size={40}
                  className="text-blue-500"
                  stroke={1.5}
                />
              ) : (
                <IconLockOpen size={40} className="text-red-500" stroke={1.5} />
              )}
            </Box>
            <Title
              order={1}
              className="text-white tracking-[0.4em] font-black uppercase text-2xl text-center"
            >
              {step === 1 ? "Clearance" : "Vault"}{" "}
              <span className={step === 1 ? "text-blue-600" : "text-red-600"}>
                Alpha
              </span>
            </Title>
          </Stack>

          {step === 1 ? (
            /* STEP 1: IDENTITY APPLICATION */
            <Paper
              p={{ base: 24, sm: 40 }}
              radius={0}
              bg="transparent"
              className="border border-gray-800 backdrop-blur-md relative"
            >
              <div className="absolute -top-[1px] -left-[1px] w-6 h-6 border-t-2 border-l-2 border-blue-600" />
              <div className="absolute -bottom-[1px] -right-[1px] w-6 h-6 border-b-2 border-r-2 border-blue-600" />

              <form onSubmit={handleSubmit}>
                <Stack gap="lg">
                  <TextInput
                    label="OPERATIVE ALIAS"
                    placeholder="NAME / CODENAME"
                    required
                    variant="filled"
                    classNames={{
                      input:
                        "bg-black/50 border-gray-800 text-white focus:border-blue-500 h-12 font-mono uppercase text-xs",
                      label:
                        "text-gray-500 font-bold uppercase text-[9px] tracking-widest mb-1",
                    }}
                    value={formData.fullName}
                    onChange={(e) =>
                      setFormData({ ...formData, fullName: e.target.value })
                    }
                  />

                  <TextInput
                    label="SECURE NODE EMAIL"
                    placeholder="EMAIL@SYNDICATE.COM"
                    required
                    variant="filled"
                    classNames={{
                      input:
                        "bg-black/50 border-gray-800 text-white focus:border-blue-500 h-12 font-mono text-xs",
                      label:
                        "text-gray-500 font-bold uppercase text-[9px] tracking-widest mb-1",
                    }}
                    value={formData.email}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                  />

                  <Box>
                    <PasswordInput
                      label="ENCRYPTION ACCESS CODE"
                      placeholder="••••••••"
                      required
                      variant="filled"
                      classNames={{
                        input:
                          "bg-black/50 border-gray-800 text-white focus:border-blue-500 h-12",
                        label:
                          "text-gray-500 font-bold uppercase text-[9px] tracking-widest mb-1",
                      }}
                      value={formData.password}
                      onChange={(e) =>
                        setFormData({ ...formData, password: e.target.value })
                      }
                    />
                    <Stack gap={4} mt={10}>
                      <Flex justify="space-between" align="center">
                        <Text
                          size="9px"
                          fw={900}
                          c="dimmed"
                          className="uppercase"
                        >
                          Entropy Analysis
                        </Text>
                        <Text size="9px" fw={900} c={getStrengthColor()}>
                          {strength}% SECURE
                        </Text>
                      </Flex>
                      <Progress
                        color={getStrengthColor()}
                        size="2px"
                        value={strength}
                        radius={0}
                        bg="gray.9"
                      />
                    </Stack>
                  </Box>

                  <Button
                    fullWidth
                    size="lg"
                    type="submit"
                    loading={loading}
                    radius={0}
                    className="bg-blue-600 hover:bg-blue-500 text-white font-black uppercase tracking-[0.2em] text-xs h-14 transition-all"
                    leftSection={loading ? null : <IconShieldLock size={18} />}
                    rightSection={
                      loading ? null : (
                        <IconChevronRight size={14} className="opacity-50" />
                      )
                    }
                  >
                    Initiate Handshake
                  </Button>
                </Stack>
              </form>

              <Divider
                my={30}
                label="Clearance Required"
                labelPosition="center"
                color="gray.9"
              />

              <Flex justify="center">
                <Text
                  size="xs"
                  c="dimmed"
                  fw={700}
                  className="uppercase tracking-widest text-center"
                >
                  Existing Node?{" "}
                  <Anchor component={Link} href="/login" c="blue.5" fw={900}>
                    Access Terminal
                  </Anchor>
                </Text>
              </Flex>
            </Paper>
          ) : (
            /* STEP 2: MNEMONIC VAULT */
            <Paper
              p={{ base: 24, sm: 40 }}
              radius={0}
              bg="transparent"
              className="border border-red-900/40 backdrop-blur-md relative"
            >
              <div className="absolute -top-[1px] -left-[1px] w-6 h-6 border-t-2 border-l-2 border-red-600" />
              <div className="absolute -bottom-[1px] -right-[1px] w-6 h-6 border-b-2 border-r-2 border-red-600" />

              <Stack gap="xl">
                <Alert
                  color="red"
                  radius={0}
                  variant="filled"
                  className="font-mono border-l-4 border-red-600 bg-red-950/20"
                >
                  <Text
                    size="xs"
                    fw={900}
                    className="uppercase mb-1 tracking-widest text-red-500"
                  >
                    Security Warning Level 5:
                  </Text>
                  <Text
                    size="11px"
                    className="opacity-90 leading-relaxed text-red-200"
                  >
                    The sequence below is your <b>MASTER KEY</b>. Dark Capital
                    servers do not persist this phrase. If lost, recovery is
                    impossible. Total asset forfeiture will occur.
                  </Text>
                </Alert>

                <Paper
                  bg="black"
                  p="md"
                  className="border border-gray-800 shadow-inner"
                >
                  <Grid gutter="xs">
                    {phrase.split(" ").map((word, i) => (
                      <Grid.Col span={{ base: 6, sm: 4 }} key={i}>
                        <Flex
                          gap={8}
                          align="center"
                          className="bg-white/5 p-2 border border-white/5"
                        >
                          <Text
                            size="9px"
                            c="dimmed"
                            fw={900}
                            className="font-mono opacity-50"
                          >
                            {String(i + 1).padStart(2, "0")}
                          </Text>
                          <Text
                            size="xs"
                            fw={900}
                            c="green.4"
                            className="font-mono uppercase tracking-widest"
                          >
                            {word}
                          </Text>
                        </Flex>
                      </Grid.Col>
                    ))}
                  </Grid>
                </Paper>

                <Group grow gap="md">
                  <CopyButton value={phrase} timeout={2000}>
                    {({ copied, copy }) => (
                      <Button
                        variant="outline"
                        color={copied ? "teal" : "gray"}
                        onClick={copy}
                        radius={0}
                        className="uppercase text-[10px] font-black tracking-[0.2em] border-gray-800 h-12"
                        leftSection={
                          copied ? (
                            <IconCheck size={14} />
                          ) : (
                            <IconCopy size={14} />
                          )
                        }
                      >
                        {copied ? "keys copied" : "copy sequence"}
                      </Button>
                    )}
                  </CopyButton>

                  <Button
                    variant="outline"
                    color="gray"
                    onClick={downloadKeys}
                    radius={0}
                    className="uppercase text-[10px] font-black tracking-[0.2em] border-gray-800 h-12"
                    leftSection={<IconDownload size={14} />}
                  >
                    Export Keyfile
                  </Button>
                </Group>

                <Divider color="gray.9" />

                <Checkbox
                  color="red"
                  checked={hasSaved}
                  onChange={(e) => setHasSaved(e.currentTarget.checked)}
                  label={
                    <Text
                      size="xs"
                      c="dimmed"
                      fw={700}
                      className="uppercase tracking-tighter"
                    >
                      I have recorded this BIP39 sequence offline and understand
                      the risk.
                    </Text>
                  }
                  classNames={{
                    label: "pt-1 cursor-pointer",
                    input: "rounded-none bg-black",
                  }}
                />

                <Button
                  fullWidth
                  size="lg"
                  radius={0}
                  disabled={!hasSaved}
                  onClick={handleFinalizeRegistration}
                  className={`${hasSaved ? "bg-blue-600 hover:bg-blue-500" : "bg-gray-800"} text-white font-black uppercase text-xs h-14 transition-all`}
                  leftSection={<IconShieldCheck size={18} />}
                >
                  Confirm Vault Lock
                </Button>
              </Stack>
            </Paper>
          )}

          <SecurityFeed type={step === 1 ? "clearance" : "vault_lock"} />
        </Stack>
      </Container>
    </div>
  );
}
