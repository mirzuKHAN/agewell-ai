import { useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import {
  ActionIcon,
  Alert,
  AppShell,
  Badge,
  Box,
  Button,
  Card,
  Divider,
  Grid,
  Group,
  Modal,
  NumberInput,
  Paper,
  Progress,
  ScrollArea,
  Select,
  SimpleGrid,
  Slider,
  Stack,
  Table,
  Text,
  Textarea,
  ThemeIcon,
  Title,
  Tooltip,
  Switch,
} from '@mantine/core';
import { notifications } from '@mantine/notifications';
import {
  IconActivity,
  IconAlertTriangle,
  IconBell,
  IconChartBar,
  IconCheck,
  IconChevronRight,
  IconClock,
  IconClipboardList,
  IconHeartHandshake,
  IconHome,
  IconRefresh,
  IconShieldCheck,
  IconPill,
  IconPlus,
  IconUsers,
  IconUserShield,
  IconWallet,
  IconPlayerPlay,
} from '@tabler/icons-react';
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip as ChartTooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { DEMO_AUDIT, DEMO_HEALTH_READINGS, DEMO_MEDICATION_EVENTS, DEMO_RESIDENTS, WEEKLY_MEDICATION_DATA } from './data/demoData';
import { DEFAULT_FINANCIAL_INPUTS, calculateFinancialForecast } from './engine/financial';
import { formatClock, getHealthFlags, getMedicationDisplayStatus, isOverdue } from './engine/medication';
import type { AuditEntry, DemoRole, FinancialInputs, HealthReading, MedicationEvent, MedicationStatus, Resident } from './types';

 type PageKey = 'overview' | 'residents' | 'medication' | 'health' | 'family' | 'financial' | 'audit';

const NAV_ITEMS: { key: PageKey; label: string; icon: typeof IconHome; roles: DemoRole[] }[] = [
  { key: 'overview', label: 'Overview', icon: IconHome, roles: ['manager', 'caregiver', 'clinician', 'family'] },
  { key: 'residents', label: 'Residents', icon: IconUsers, roles: ['manager', 'caregiver', 'clinician'] },
  { key: 'medication', label: 'Medication', icon: IconPill, roles: ['manager', 'caregiver', 'clinician'] },
  { key: 'health', label: 'Health monitoring', icon: IconActivity, roles: ['manager', 'caregiver', 'clinician'] },
  { key: 'family', label: 'Family portal', icon: IconHeartHandshake, roles: ['manager', 'family'] },
  { key: 'financial', label: 'Business simulation', icon: IconChartBar, roles: ['manager'] },
  { key: 'audit', label: 'Audit log', icon: IconClipboardList, roles: ['manager', 'clinician'] },
];

const ROLE_LABELS: Record<DemoRole, string> = {
  manager: 'Institution manager',
  caregiver: 'Caregiver',
  clinician: 'Healthcare professional',
  family: 'Family member',
};

const PAGE_TITLES: Record<PageKey, { title: string; subtitle: string }> = {
  overview: { title: 'Good morning', subtitle: 'Here is the operational snapshot for Harbour View Care Home.' },
  residents: { title: 'Residents', subtitle: 'Fictional resident profiles and family-sharing permissions.' },
  medication: { title: 'Medication management', subtitle: 'Daily tasks, event recording, overdue detection and follow-up.' },
  health: { title: 'Health monitoring', subtitle: 'Synthetic device readings and institution-configured review flags.' },
  family: { title: 'Family portal', subtitle: 'Consent-based summaries using verified demonstration records.' },
  financial: { title: 'Business simulation', subtitle: 'Explore the proposal’s 2027–2031 assumptions and financial outcomes.' },
  audit: { title: 'Audit log', subtitle: 'A timestamped record of actions taken inside this local simulation.' },
};

function formatMoneyShort(value: number): string {
  return `HK$${(value / 1_000_000).toFixed(2)}m`;
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { color: string; label: string }> = {
    pending: { color: 'yellow', label: 'Pending' },
    overdue: { color: 'red', label: 'Overdue' },
    administered: { color: 'green', label: 'Administered' },
    declined: { color: 'orange', label: 'Declined' },
    withheld: { color: 'gray', label: 'Withheld' },
    missed: { color: 'red', label: 'Missed' },
    not_confirmed: { color: 'gray', label: 'Not confirmed' },
    reviewed: { color: 'green', label: 'Reviewed' },
    'needs review': { color: 'red', label: 'Needs review' },
  };
  const item = map[status] ?? { color: 'gray', label: status };
  return <Badge color={item.color} variant="light" radius="sm">{item.label}</Badge>;
}

function StatCard({ label, value, detail, icon: Icon, color = 'blue' }: {
  label: string; value: string | number; detail: string; icon: typeof IconHome; color?: string;
}) {
  return (
    <Card className="stat-card" withBorder radius="lg" padding="lg">
      <Box pos="relative" mih={92}>
        <ThemeIcon
          size={42}
          radius="md"
          variant="light"
          color={color}
          className="stat-card-icon"
          aria-hidden="true"
        >
          <Icon size={21} />
        </ThemeIcon>
        <Stack gap={5} pr={54}>
          <Text size="sm" c="dimmed" fw={600}>{label}</Text>
          <Title order={2} fw={700}>{value}</Title>
          <Text size="xs" c="dimmed">{detail}</Text>
        </Stack>
      </Box>
    </Card>
  );
}

function SectionTitle({ title, description, right }: { title: string; description?: string; right?: ReactNode }) {
  return (
    <Group justify="space-between" align="flex-end" mb="md" wrap="wrap">
      <Box>
        <Title order={4}>{title}</Title>
        {description && <Text c="dimmed" size="sm" mt={3}>{description}</Text>}
      </Box>
      {right}
    </Group>
  );
}

export default function App() {
  const [page, setPage] = useState<PageKey>('overview');
  const [role, setRole] = useState<DemoRole>('manager');
  const [simulatedMinutes, setSimulatedMinutes] = useState(8 * 60 + 55);
  const [residents, setResidents] = useState<Resident[]>(DEMO_RESIDENTS);
  const [medicationEvents, setMedicationEvents] = useState<MedicationEvent[]>(DEMO_MEDICATION_EVENTS);
  const [healthReadings, setHealthReadings] = useState<HealthReading[]>(DEMO_HEALTH_READINGS);
  const [auditEntries, setAuditEntries] = useState<AuditEntry[]>(DEMO_AUDIT);
  const [selectedMedication, setSelectedMedication] = useState<MedicationEvent | null>(null);
  const [medicationNote, setMedicationNote] = useState('');
  const [selectedHealth, setSelectedHealth] = useState<HealthReading | null>(null);
  const [healthNote, setHealthNote] = useState('');
  const [financialInputs, setFinancialInputs] = useState<FinancialInputs>(DEFAULT_FINANCIAL_INPUTS);

  const visibleNav = NAV_ITEMS.filter((item) => item.roles.includes(role));
  const residentById = useMemo(() => new Map(residents.map((resident) => [resident.id, resident])), [residents]);
  const overdueEvents = medicationEvents.filter((event) => isOverdue(event, simulatedMinutes));
  const flaggedReadings = healthReadings.filter((reading) => getHealthFlags(reading).length > 0 && !reading.reviewed);
  const completedEvents = medicationEvents.filter((event) => event.status === 'administered').length;
  const dueEvents = medicationEvents.filter((event) => event.dueMinutes <= simulatedMinutes && event.status === 'pending').length;
  const alertCount = overdueEvents.length + flaggedReadings.length;

  const pushAudit = (entry: Omit<AuditEntry, 'id'>) => {
    setAuditEntries((current) => [{ ...entry, id: `LOG-${Date.now()}-${Math.random().toString(16).slice(2, 6)}` }, ...current]);
  };

  const changePage = (nextPage: PageKey) => {
    setPage(nextPage);
  };

  const advanceClock = (amount: number) => {
    setSimulatedMinutes((current) => current + amount);
  };

  const resetDemo = () => {
    setPage('overview');
    setRole('manager');
    setSimulatedMinutes(8 * 60 + 55);
    setResidents(DEMO_RESIDENTS);
    setMedicationEvents(DEMO_MEDICATION_EVENTS);
    setHealthReadings(DEMO_HEALTH_READINGS);
    setAuditEntries(DEMO_AUDIT);
    setFinancialInputs(DEFAULT_FINANCIAL_INPUTS);
    setSelectedMedication(null);
    setSelectedHealth(null);
    notifications.show({ title: 'Demo reset', message: 'All simulation data has returned to its starting state.', color: 'blue' });
  };

  const recordMedication = (status: MedicationStatus) => {
    if (!selectedMedication) return;
    const resident = residentById.get(selectedMedication.residentId);
    const note = medicationNote.trim();
    setMedicationEvents((current) => current.map((event) => event.id === selectedMedication.id
      ? { ...event, status, recordedAt: simulatedMinutes, recordedBy: role === 'manager' ? 'Demo manager' : ROLE_LABELS[role], note: note || undefined }
      : event));
    pushAudit({
      time: simulatedMinutes,
      actor: ROLE_LABELS[role],
      action: 'Medication event updated',
      detail: `${selectedMedication.medication} for ${resident?.name ?? selectedMedication.residentId} recorded as ${status.replace('_', ' ')}.`,
    });
    notifications.show({ title: 'Medication record saved', message: 'The event status and audit trail have been updated.', color: 'green' });
    setSelectedMedication(null);
    setMedicationNote('');
  };

  const markHealthReviewed = () => {
    if (!selectedHealth) return;
    const resident = residentById.get(selectedHealth.residentId);
    setHealthReadings((current) => current.map((reading) => reading.id === selectedHealth.id
      ? { ...reading, reviewed: true, followUp: healthNote.trim() || 'Reviewed by authorised demo user.' }
      : reading));
    pushAudit({
      time: simulatedMinutes,
      actor: ROLE_LABELS[role],
      action: 'Health reading reviewed',
      detail: `Synthetic reading for ${resident?.name ?? selectedHealth.residentId} reviewed.`,
    });
    notifications.show({ title: 'Review recorded', message: 'The reading is marked as reviewed. This is not a clinical decision.', color: 'green' });
    setSelectedHealth(null);
    setHealthNote('');
  };

  const addSyntheticReading = () => {
    const random = Math.random();
    const reading: HealthReading = {
      id: `HR-${Date.now()}`,
      residentId: residents[Math.floor(Math.random() * residents.length)]?.id ?? 'R-001',
      systolic: random > 0.72 ? 164 : 122 + Math.floor(Math.random() * 22),
      diastolic: random > 0.72 ? 92 : 70 + Math.floor(Math.random() * 15),
      heartRate: random > 0.84 ? 114 : 66 + Math.floor(Math.random() * 25),
      activity: 20 + Math.floor(Math.random() * 60),
      measuredAt: simulatedMinutes,
      source: 'Simulated device',
      reviewed: false,
    };
    setHealthReadings((current) => [reading, ...current]);
    pushAudit({ time: simulatedMinutes, actor: 'Monitoring service', action: 'Synthetic reading received', detail: `A simulated measurement was received for ${residentById.get(reading.residentId)?.name ?? reading.residentId}.` });
    notifications.show({ title: 'Synthetic reading received', message: 'Check the health monitoring page for any review flags.', color: 'blue' });
  };

  const updateRole = (value: string | null) => {
    if (!value) return;
    const nextRole = value as DemoRole;
    setRole(nextRole);
    const nextDefaultPage: PageKey = nextRole === 'family' ? 'family' : 'overview';
    setPage(nextDefaultPage);
  };

  const pageInfo = PAGE_TITLES[page];

  return (
    <>
      <AppShell
        navbar={{ width: 252, breakpoint: 'sm' }}
        padding="lg"
        className="agewell-shell"
      >
        <AppShell.Navbar p="md" className="sidebar">
          <Group gap="sm" mb={28} px={4}>
            <ThemeIcon size={42} radius="xl" color="teal" variant="filled"><IconHeartHandshake size={23} /></ThemeIcon>
            <Box>
              <Text fw={800} size="lg" c="#172c45" lh={1.1}>AgeWell AI</Text>
              <Text size="xs" c="dimmed" mt={3}>Care operations platform</Text>
            </Box>
          </Group>
          <Text className="nav-caption" mb={8}>WORKSPACE</Text>
          <Stack gap={5}>
            {visibleNav.map((item) => {
              const Icon = item.icon;
              return (
                <Button
                  key={item.key}
                  onClick={() => changePage(item.key)}
                  variant={page === item.key ? 'light' : 'subtle'}
                  color={page === item.key ? 'teal' : 'gray'}
                  justify="flex-start"
                  leftSection={<Icon size={18} />}
                  rightSection={item.key === 'health' && flaggedReadings.length > 0 ? <Badge size="xs" color="red">{flaggedReadings.length}</Badge> : undefined}
                  className="nav-button"
                >
                  {item.label}
                </Button>
              );
            })}
          </Stack>
          <Box mt="auto">
            <Paper bg="#f1f7f6" radius="lg" p="sm">
              <Group gap={8} mb={6}>
                <IconShieldCheck size={16} color="#13877b" />
                <Text size="xs" fw={700} c="#17685f">LOCAL DEMO MODE</Text>
              </Group>
              <Text size="xs" c="dimmed" lh={1.5}>Synthetic data only. No backend, external services or real resident records.</Text>
            </Paper>
            <Text size="xs" c="dimmed" mt="md" ta="center">AgeWell AI · Academic prototype</Text>
          </Box>
        </AppShell.Navbar>

        <AppShell.Main>
          <Group justify="space-between" align="center" mb="lg" className="topbar" wrap="wrap">
            <Group gap={7}>
              <Text size="sm" c="dimmed">Harbour View Care Home</Text>
              <IconChevronRight size={14} color="#9ca8b5" />
              <Text size="sm" fw={600}>{pageInfo.title}</Text>
            </Group>
            <Group gap="sm" wrap="wrap">
              <Paper className="clock-pill" radius="xl" px="sm" py={7} withBorder>
                <Group gap={7}>
                  <IconClock size={15} color="#167d74" />
                  <Text size="sm" fw={700} ff="monospace">{formatClock(simulatedMinutes)}</Text>
                  <Text size="xs" c="dimmed">DEMO TIME</Text>
                </Group>
              </Paper>
              <Tooltip label="Advance simulated time by 5 minutes">
                <ActionIcon variant="light" color="teal" size="lg" onClick={() => advanceClock(5)} aria-label="Advance simulation clock"><IconPlayerPlay size={18} /></ActionIcon>
              </Tooltip>
              <Tooltip label="Advance simulated time by 15 minutes">
                <Button size="xs" variant="light" color="teal" onClick={() => advanceClock(15)}>+15 min</Button>
              </Tooltip>
              <Select
                aria-label="Demo role"
                value={role}
                onChange={updateRole}
                data={[
                  { value: 'manager', label: 'Manager view' },
                  { value: 'caregiver', label: 'Caregiver view' },
                  { value: 'clinician', label: 'Professional view' },
                  { value: 'family', label: 'Family view' },
                ]}
                w={156}
                size="xs"
                allowDeselect={false}
              />
              <Tooltip label="Reset demonstration">
                <ActionIcon variant="subtle" color="gray" size="lg" onClick={resetDemo} aria-label="Reset demo"><IconRefresh size={18} /></ActionIcon>
              </Tooltip>
            </Group>
          </Group>

          <Group justify="space-between" align="flex-end" mb="lg" wrap="wrap">
            <Box>
              <Title order={2} className="page-title">{pageInfo.title}</Title>
              <Text c="dimmed" size="sm" mt={5}>{pageInfo.subtitle}</Text>
            </Box>
            <Badge color="teal" variant="light" leftSection={<IconUserShield size={12} />}>{ROLE_LABELS[role]} · demo role</Badge>
          </Group>

          {page === 'overview' && role === 'family' && (
            <FamilyPage residents={residents} events={medicationEvents} readings={healthReadings} time={simulatedMinutes} />
          )}
          {page === 'overview' && role !== 'family' && (
            <OverviewPage
              residents={residents}
              events={medicationEvents}
              readings={healthReadings}
              audit={auditEntries}
              time={simulatedMinutes}
              residentById={residentById}
              dueCount={dueEvents}
              overdueCount={overdueEvents.length}
              completedCount={completedEvents}
              alertCount={alertCount}
              onNavigate={changePage}
            />
          )}
          {page === 'residents' && (
            <ResidentsPage residents={residents} role={role} onConsentChange={(id, checked) => {
              setResidents((current) => current.map((resident) => resident.id === id ? { ...resident, shareWithFamily: checked } : resident));
              pushAudit({ time: simulatedMinutes, actor: ROLE_LABELS[role], action: 'Family sharing permission updated', detail: `Family sharing for resident ${id} set to ${checked ? 'enabled' : 'disabled'}.` });
            }} />
          )}
          {page === 'medication' && (
            <MedicationPage
              events={medicationEvents}
              residents={residentById}
              time={simulatedMinutes}
              role={role}
              onSelect={setSelectedMedication}
              onAdvance={() => advanceClock(15)}
            />
          )}
          {page === 'health' && (
            <HealthPage
              readings={healthReadings}
              residentById={residentById}
              role={role}
              onSelect={setSelectedHealth}
              onAddReading={addSyntheticReading}
            />
          )}
          {page === 'family' && (
            <FamilyPage residents={residents} events={medicationEvents} readings={healthReadings} time={simulatedMinutes} />
          )}
          {page === 'financial' && (
            <FinancialPage inputs={financialInputs} onChange={setFinancialInputs} />
          )}
          {page === 'audit' && <AuditPage entries={auditEntries} />}
        </AppShell.Main>
      </AppShell>

      <Modal opened={selectedMedication !== null} onClose={() => { setSelectedMedication(null); setMedicationNote(''); }} title="Record medication event" centered>
        {selectedMedication && (
          <Stack>
            <Paper bg="gray.0" p="sm" radius="md">
              <Text fw={700}>{selectedMedication.medication} · {selectedMedication.dose}</Text>
              <Text size="sm" c="dimmed">{residentById.get(selectedMedication.residentId)?.name} · Due {formatClock(selectedMedication.dueMinutes)}</Text>
            </Paper>
            <Alert color="yellow" variant="light" title="Accurate event recording">Select the outcome actually recorded by authorised staff. A reminder acknowledgement is not proof of ingestion.</Alert>
            <Textarea label="Optional note" value={medicationNote} onChange={(event) => setMedicationNote(event.currentTarget.value)} placeholder="Add a handover or follow-up note" />
            <SimpleGrid cols={2}>
              <Button color="green" leftSection={<IconCheck size={16} />} onClick={() => recordMedication('administered')}>Administered</Button>
              <Button color="orange" variant="light" onClick={() => recordMedication('declined')}>Declined</Button>
              <Button color="gray" variant="light" onClick={() => recordMedication('withheld')}>Withheld</Button>
              <Button color="red" variant="light" onClick={() => recordMedication('missed')}>Missed</Button>
              <Button color="gray" variant="subtle" onClick={() => recordMedication('not_confirmed')}>Not confirmed</Button>
            </SimpleGrid>
            <Text size="xs" c="dimmed">This action updates the synthetic record and local audit log only.</Text>
          </Stack>
        )}
      </Modal>

      <Modal opened={selectedHealth !== null} onClose={() => { setSelectedHealth(null); setHealthNote(''); }} title="Review measurement" centered>
        {selectedHealth && (
          <Stack>
            <Paper bg="gray.0" p="sm" radius="md">
              <Text fw={700}>{residentById.get(selectedHealth.residentId)?.name}</Text>
              <Text size="sm" c="dimmed">{selectedHealth.systolic}/{selectedHealth.diastolic} mmHg · {selectedHealth.heartRate} bpm · {formatClock(selectedHealth.measuredAt)}</Text>
              <Text size="xs" c="dimmed" mt={5}>{getHealthFlags(selectedHealth).join(' · ') || 'No configured review flag'}</Text>
            </Paper>
            <Alert color="yellow" variant="light">Demo thresholds only. This screen does not provide diagnosis, triage or clinical recommendations.</Alert>
            <Textarea label="Review / follow-up note" value={healthNote} onChange={(event) => setHealthNote(event.currentTarget.value)} placeholder="Record the review or follow-up action" />
            <Button leftSection={<IconCheck size={16} />} onClick={markHealthReviewed}>Mark reviewed</Button>
          </Stack>
        )}
      </Modal>
    </>
  );
}

function OverviewPage({
  residents, events, readings, audit, time, residentById, dueCount, overdueCount, completedCount, alertCount, onNavigate,
}: {
  residents: Resident[]; events: MedicationEvent[]; readings: HealthReading[]; audit: AuditEntry[]; time: number;
  residentById: Map<string, Resident>; dueCount: number; overdueCount: number; completedCount: number; alertCount: number;
  onNavigate: (page: PageKey) => void;
}) {
  const completion = events.length ? Math.round((completedCount / events.length) * 100) : 0;
  const pendingEvents = events.filter((event) => event.status === 'pending').slice(0, 5);
  const urgentReadings = readings.filter((reading) => getHealthFlags(reading).length > 0 && !reading.reviewed);
  return (
    <Stack gap="lg">
      <SimpleGrid cols={{ base: 1, sm: 2, xl: 4 }}>
        <StatCard label="Active residents" value={residents.length} detail="Synthetic resident profiles" icon={IconUsers} color="blue" />
        <StatCard label="Medication tasks due" value={dueCount} detail="Due at or before demo time" icon={IconPill} color="teal" />
        <StatCard label="Overdue tasks" value={overdueCount} detail="Pending beyond 10-minute grace" icon={IconClock} color="red" />
        <StatCard label="Open review alerts" value={alertCount} detail={`${urgentReadings.length} health · ${overdueCount} medication`} icon={IconBell} color="orange" />
      </SimpleGrid>
      <Grid gutter="lg">
        <Grid.Col span={{ base: 12, xl: 8 }}>
          <Card withBorder radius="lg" padding="lg" h="100%">
            <SectionTitle title="Medication documentation" description="Illustrative 7-day documentation completeness trend." right={<Badge color="teal" variant="light">Demo data</Badge>} />
            <Group align="baseline" gap={8} mb="xs">
              <Title order={2}>{completion}%</Title>
              <Text c="dimmed" size="xs">of listed events currently recorded as administered</Text>
            </Group>
            <Progress value={completion} color="teal" size="md" radius="xl" mb="lg" />
            <Box h={230}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={WEEKLY_MEDICATION_DATA} barGap={5}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e8edf1" />
                  <XAxis dataKey="day" tickLine={false} axisLine={false} />
                  <YAxis domain={[0, 100]} tickLine={false} axisLine={false} width={35} />
                  <ChartTooltip />
                  <Legend />
                  <Bar dataKey="recorded" name="Recorded (%)" fill="#159b8c" radius={[5, 5, 0, 0]} />
                  <Bar dataKey="due" name="Scheduled (%)" fill="#d8e6e5" radius={[5, 5, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </Box>
          </Card>
        </Grid.Col>
        <Grid.Col span={{ base: 12, xl: 4 }}>
          <Card withBorder radius="lg" padding="lg" h="100%">
            <SectionTitle title="Needs attention" description="Exceptions for staff review." />
            <Stack gap="sm">
              {overdueCount === 0 && urgentReadings.length === 0 && <Alert color="green" title="No open exceptions">There are no overdue medication events or unreviewed flagged readings.</Alert>}
              {events.filter((event) => isOverdue(event, time)).slice(0, 3).map((event) => (
                <Paper key={event.id} p="sm" radius="md" bg="red.0">
                  <Group justify="space-between" align="center">
                    <Text size="sm" fw={700}>{residentById.get(event.residentId)?.name}</Text>
                    <StatusBadge status="overdue" />
                  </Group>
                  <Text size="xs" c="dimmed">{event.medication} · due {formatClock(event.dueMinutes)}</Text>
                </Paper>
              ))}
              {urgentReadings.slice(0, 3).map((reading) => (
                <Paper key={reading.id} p="sm" radius="md" bg="orange.0">
                  <Group justify="space-between" align="center">
                    <Text size="sm" fw={700}>{residentById.get(reading.residentId)?.name}</Text>
                    <StatusBadge status="needs review" />
                  </Group>
                  <Text size="xs" c="dimmed">{getHealthFlags(reading).join(', ')}</Text>
                </Paper>
              ))}
              <Button variant="light" color="teal" rightSection={<IconChevronRight size={15} />} onClick={() => onNavigate(overdueCount > 0 ? 'medication' : 'health')}>Review exceptions</Button>
            </Stack>
          </Card>
        </Grid.Col>
      </Grid>
      <Grid gutter="lg">
        <Grid.Col span={{ base: 12, lg: 7 }}>
          <Card withBorder radius="lg" padding="lg">
            <SectionTitle title="Upcoming medication tasks" description="Next pending events in the simulation." right={<Button size="xs" variant="subtle" color="teal" onClick={() => onNavigate('medication')}>View all</Button>} />
            <Table verticalSpacing="sm" highlightOnHover>
              <Table.Thead><Table.Tr><Table.Th>Resident</Table.Th><Table.Th>Medication</Table.Th><Table.Th>Due</Table.Th><Table.Th>Status</Table.Th></Table.Tr></Table.Thead>
              <Table.Tbody>
                {pendingEvents.map((event) => <Table.Tr key={event.id}>
                  <Table.Td><Text size="sm" fw={600}>{residentById.get(event.residentId)?.name}</Text></Table.Td>
                  <Table.Td><Text size="sm">{event.medication}</Text><Text size="xs" c="dimmed">{event.dose}</Text></Table.Td>
                  <Table.Td><Text size="sm" ff="monospace">{formatClock(event.dueMinutes)}</Text></Table.Td>
                  <Table.Td><StatusBadge status={getMedicationDisplayStatus(event, time)} /></Table.Td>
                </Table.Tr>)}
              </Table.Tbody>
            </Table>
          </Card>
        </Grid.Col>
        <Grid.Col span={{ base: 12, lg: 5 }}>
          <Card withBorder radius="lg" padding="lg" h="100%">
            <SectionTitle title="Recent activity" description="Latest actions in the audit trail." right={<Button size="xs" variant="subtle" color="teal" onClick={() => onNavigate('audit')}>Audit log</Button>} />
            <Stack gap="md">
              {audit.slice(0, 4).map((entry) => <Group key={entry.id} align="flex-start" gap="sm" wrap="nowrap">
                <ThemeIcon color="gray" variant="light" radius="xl" size="sm"><IconClipboardList size={13} /></ThemeIcon>
                <Box style={{ flex: 1 }}>
                  <Group justify="space-between"><Text size="sm" fw={600}>{entry.action}</Text><Text size="xs" c="dimmed" ff="monospace">{formatClock(entry.time)}</Text></Group>
                  <Text size="xs" c="dimmed">{entry.detail}</Text>
                </Box>
              </Group>)}
            </Stack>
          </Card>
        </Grid.Col>
      </Grid>
    </Stack>
  );
}

function ResidentsPage({ residents, role, onConsentChange }: { residents: Resident[]; role: DemoRole; onConsentChange: (id: string, checked: boolean) => void }) {
  return (
    <Stack gap="lg">
      <Alert color="blue" variant="light" title="Demonstration records">All names and records are fictional. Family sharing is a simulated permission switch, not a consent-management or identity-verification system.</Alert>
      <Card withBorder radius="lg" padding="lg">
        <SectionTitle title="Resident directory" description={`${residents.length} fictional resident profiles`} right={<Badge color="blue" variant="light">Sample dataset</Badge>} />
        <ScrollArea>
          <Table miw={780} highlightOnHover verticalSpacing="sm">
            <Table.Thead><Table.Tr><Table.Th>Resident</Table.Th><Table.Th>Room</Table.Th><Table.Th>Age</Table.Th><Table.Th>Care level</Table.Th><Table.Th>Family sharing</Table.Th><Table.Th>Profile notes</Table.Th></Table.Tr></Table.Thead>
            <Table.Tbody>
              {residents.map((resident) => <Table.Tr key={resident.id}>
                <Table.Td><Text fw={600} size="sm">{resident.name}</Text><Text size="xs" c="dimmed">{resident.id}</Text></Table.Td>
                <Table.Td>{resident.room}</Table.Td>
                <Table.Td>{resident.age}</Table.Td>
                <Table.Td><Badge variant="light" color={resident.careLevel === 'High support' ? 'orange' : resident.careLevel === 'Enhanced' ? 'blue' : 'gray'}>{resident.careLevel}</Badge></Table.Td>
                <Table.Td><Switch checked={resident.shareWithFamily} disabled={role !== 'manager'} onChange={(event) => onConsentChange(resident.id, event.currentTarget.checked)} label={resident.shareWithFamily ? 'Enabled' : 'Disabled'} size="sm" color="teal" /></Table.Td>
                <Table.Td><Text size="xs" c="dimmed" maw={230}>{resident.notes}</Text></Table.Td>
              </Table.Tr>)}
            </Table.Tbody>
          </Table>
        </ScrollArea>
        {role !== 'manager' && <Text c="dimmed" size="xs" mt="sm">Switch to Manager view to change the demonstration family-sharing permissions.</Text>}
      </Card>
    </Stack>
  );
}

function MedicationPage({ events, residents, time, role, onSelect, onAdvance }: {
  events: MedicationEvent[]; residents: Map<string, Resident>; time: number; role: DemoRole;
  onSelect: (event: MedicationEvent) => void; onAdvance: () => void;
}) {
  const sorted = [...events].sort((a, b) => a.dueMinutes - b.dueMinutes);
  const canRecord = role === 'manager' || role === 'caregiver';
  return (
    <Stack gap="lg">
      <Alert color="teal" variant="light" title="Medication-first workflow">Staff record what happened at the medication event. The system does not prescribe, change a dose or infer that medication was swallowed.</Alert>
      <SimpleGrid cols={{ base: 1, sm: 3 }}>
        <StatCard label="Scheduled events" value={events.length} detail="All events in the demo dataset" icon={IconClipboardList} color="blue" />
        <StatCard label="Pending" value={events.filter((event) => event.status === 'pending').length} detail="Awaiting a recorded outcome" icon={IconClock} color="yellow" />
        <StatCard label="Overdue" value={events.filter((event) => isOverdue(event, time)).length} detail="More than 10 minutes past due" icon={IconAlertTriangle} color="red" />
      </SimpleGrid>
      <Card withBorder radius="lg" padding="lg">
        <SectionTitle title="Medication administration record" description="Select a pending event to record the outcome." right={<Button variant="light" color="teal" leftSection={<IconClock size={15} />} onClick={onAdvance}>Advance 15 minutes</Button>} />
        <ScrollArea>
          <Table miw={850} highlightOnHover verticalSpacing="sm">
            <Table.Thead><Table.Tr><Table.Th>Resident</Table.Th><Table.Th>Medication</Table.Th><Table.Th>Due</Table.Th><Table.Th>Event status</Table.Th><Table.Th>Recorded by</Table.Th><Table.Th>Action</Table.Th></Table.Tr></Table.Thead>
            <Table.Tbody>
              {sorted.map((event) => {
                const status = getMedicationDisplayStatus(event, time);
                return <Table.Tr key={event.id}>
                  <Table.Td><Text size="sm" fw={600}>{residents.get(event.residentId)?.name ?? event.residentId}</Text><Text size="xs" c="dimmed">{event.residentId}</Text></Table.Td>
                  <Table.Td><Text size="sm" fw={500}>{event.medication}</Text><Text size="xs" c="dimmed">{event.dose}</Text></Table.Td>
                  <Table.Td><Text size="sm" ff="monospace">{formatClock(event.dueMinutes)}</Text></Table.Td>
                  <Table.Td><StatusBadge status={status} /></Table.Td>
                  <Table.Td><Text size="xs" c="dimmed">{event.recordedBy ?? '—'}</Text></Table.Td>
                  <Table.Td>{event.status === 'pending' && canRecord ? <Button size="xs" variant="light" color="teal" onClick={() => onSelect(event)}>Record outcome</Button> : <Text size="xs" c="dimmed">{event.note ?? 'No action available'}</Text>}</Table.Td>
                </Table.Tr>;
              })}
            </Table.Tbody>
          </Table>
        </ScrollArea>
        {!canRecord && <Text size="xs" c="dimmed" mt="sm">This demo role is read-only for medication events. Switch to Caregiver or Manager to record an outcome.</Text>}
      </Card>
      <VoicePromptDemo />
    </Stack>
  );
}

function VoicePromptDemo() {
  const [selectedLanguage, setSelectedLanguage] = useState('Cantonese');
  const prompts: Record<string, string> = {
    Cantonese: '而家係食藥時間，請搵照顧員協助。',
    Mandarin: '现在是服药时间，请联系护理人员协助。',
    English: 'It is time for your scheduled medication. Please ask a care staff member for assistance.',
  };
  return (
    <Card withBorder radius="lg" padding="lg">
      <SectionTitle title="Multilingual reminder preview" description="Cantonese-first text prompt concept. No audio is played in this prototype." />
      <Group align="flex-end" wrap="wrap">
        <Select label="Prompt language" value={selectedLanguage} onChange={(value) => setSelectedLanguage(value ?? 'Cantonese')} data={['Cantonese', 'Mandarin', 'English']} w={190} allowDeselect={false} />
        <Button variant="light" color="teal" onClick={() => notifications.show({ title: `${selectedLanguage} reminder preview`, message: prompts[selectedLanguage], autoClose: 6000, color: 'teal' })}>Preview reminder</Button>
      </Group>
      <Paper bg="gray.0" radius="md" p="sm" mt="md">
        <Text size="xs" c="dimmed" mb={5}>SAMPLE PROMPT</Text>
        <Text size="sm" fw={600}>{prompts[selectedLanguage]}</Text>
      </Paper>
    </Card>
  );
}

function HealthPage({ readings, residentById, role, onSelect, onAddReading }: {
  readings: HealthReading[]; residentById: Map<string, Resident>; role: DemoRole;
  onSelect: (reading: HealthReading) => void; onAddReading: () => void;
}) {
  const canReview = role === 'manager' || role === 'clinician';
  const chartData = [...readings].slice(0, 8).reverse().map((reading) => ({
    time: formatClock(reading.measuredAt), systolic: reading.systolic, heartRate: reading.heartRate,
  }));
  return (
    <Stack gap="lg">
      <Alert color="yellow" variant="light" title="Safety and interpretation boundary">All readings and thresholds are synthetic demonstration values. Alerts prompt review by an authorised person; they are not diagnoses, predictions or emergency decisions.</Alert>
      <Grid gutter="lg">
        <Grid.Col span={{ base: 12, xl: 8 }}>
          <Card withBorder radius="lg" padding="lg">
            <SectionTitle title="Recent synthetic readings" description="Systolic pressure and heart-rate examples from simulated devices." right={<Button size="xs" leftSection={<IconPlus size={14} />} onClick={onAddReading}>Generate reading</Button>} />
            <Box h={250}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e8edf1" />
                  <XAxis dataKey="time" tickLine={false} axisLine={false} />
                  <YAxis yAxisId="left" tickLine={false} axisLine={false} />
                  <YAxis yAxisId="right" orientation="right" tickLine={false} axisLine={false} />
                  <ChartTooltip />
                  <Legend />
                  <Line yAxisId="left" type="monotone" dataKey="systolic" name="Systolic (mmHg)" stroke="#168b80" strokeWidth={2.5} dot={{ r: 3 }} />
                  <Line yAxisId="right" type="monotone" dataKey="heartRate" name="Heart rate (bpm)" stroke="#6c7fe3" strokeWidth={2.5} dot={{ r: 3 }} />
                </LineChart>
              </ResponsiveContainer>
            </Box>
          </Card>
        </Grid.Col>
        <Grid.Col span={{ base: 12, xl: 4 }}>
          <Card withBorder radius="lg" padding="lg" h="100%">
            <SectionTitle title="Review queue" description="Illustrative threshold flags." />
            <Stack gap="sm">
              {readings.filter((reading) => getHealthFlags(reading).length > 0 && !reading.reviewed).length === 0 && <Alert color="green">No unreviewed flagged readings.</Alert>}
              {readings.filter((reading) => getHealthFlags(reading).length > 0 && !reading.reviewed).map((reading) => <Paper key={reading.id} radius="md" p="sm" bg="red.0">
                <Group justify="space-between"><Text fw={600} size="sm">{residentById.get(reading.residentId)?.name}</Text><StatusBadge status="needs review" /></Group>
                <Text size="xs" c="dimmed">{getHealthFlags(reading).join(', ')}</Text>
                {canReview && <Button size="xs" mt="xs" color="teal" variant="light" onClick={() => onSelect(reading)}>Review reading</Button>}
              </Paper>)}
              <Text size="xs" c="dimmed">Configured demo thresholds: systolic ≥160 or &lt;90; diastolic ≥100 or &lt;55; heart rate &gt;110 or &lt;50.</Text>
            </Stack>
          </Card>
        </Grid.Col>
      </Grid>
      <Card withBorder radius="lg" padding="lg">
        <SectionTitle title="Measurement history" description={`${readings.length} synthetic readings in local memory`} />
        <ScrollArea>
          <Table miw={850} highlightOnHover verticalSpacing="sm">
            <Table.Thead><Table.Tr><Table.Th>Resident</Table.Th><Table.Th>Blood pressure</Table.Th><Table.Th>Heart rate</Table.Th><Table.Th>Activity</Table.Th><Table.Th>Device / time</Table.Th><Table.Th>Review</Table.Th><Table.Th /></Table.Tr></Table.Thead>
            <Table.Tbody>
              {readings.map((reading) => {
                const flags = getHealthFlags(reading);
                return <Table.Tr key={reading.id}>
                  <Table.Td><Text size="sm" fw={600}>{residentById.get(reading.residentId)?.name ?? reading.residentId}</Text></Table.Td>
                  <Table.Td><Text size="sm">{reading.systolic}/{reading.diastolic} mmHg</Text></Table.Td>
                  <Table.Td><Text size="sm">{reading.heartRate} bpm</Text></Table.Td>
                  <Table.Td><Text size="sm">{reading.activity} pts</Text></Table.Td>
                  <Table.Td><Text size="xs">{reading.source}</Text><Text size="xs" c="dimmed">{formatClock(reading.measuredAt)}</Text></Table.Td>
                  <Table.Td><StatusBadge status={reading.reviewed ? 'reviewed' : flags.length ? 'needs review' : 'pending'} /></Table.Td>
                  <Table.Td>{!reading.reviewed && canReview && flags.length > 0 && <Button size="xs" variant="subtle" onClick={() => onSelect(reading)}>Review</Button>}</Table.Td>
                </Table.Tr>;
              })}
            </Table.Tbody>
          </Table>
        </ScrollArea>
      </Card>
    </Stack>
  );
}

function FamilyPage({ residents, events, readings, time }: { residents: Resident[]; events: MedicationEvent[]; readings: HealthReading[]; time: number }) {
  const sharedResidents = residents.filter((resident) => resident.shareWithFamily);
  const sharedIds = new Set(sharedResidents.map((resident) => resident.id));
  const familyEvents = events.filter((event) => sharedIds.has(event.residentId) && event.status !== 'pending').slice(0, 6);
  const familyReadings = readings.filter((reading) => sharedIds.has(reading.residentId)).slice(0, 4);
  return (
    <Stack gap="lg">
      <Alert color="blue" variant="light" title="Consent-filtered demonstration portal">Only resident records with family sharing enabled appear here. In a real deployment, identity verification, lawful authority and consent workflows would need to be implemented and reviewed.</Alert>
      <SimpleGrid cols={{ base: 1, sm: 2, xl: 3 }}>
        {sharedResidents.map((resident) => <Card key={resident.id} withBorder radius="lg" padding="lg">
          <Group justify="space-between" mb="xs"><ThemeIcon color="teal" variant="light" size="lg" radius="xl"><IconUsers size={17} /></ThemeIcon><Badge color="green" variant="light">Sharing enabled</Badge></Group>
          <Title order={4}>{resident.name}</Title>
          <Text c="dimmed" size="sm">Room {resident.room} · {resident.age} years old</Text>
          <Divider my="sm" />
          <Text size="sm" fw={600}>{resident.familyName}</Text>
          <Text size="xs" c="dimmed">{resident.familyEmail}</Text>
          <Text size="xs" mt="sm" c="dimmed">Only approved updates and verified event records are displayed.</Text>
        </Card>)}
      </SimpleGrid>
      <Grid gutter="lg">
        <Grid.Col span={{ base: 12, lg: 7 }}>
          <Card withBorder radius="lg" padding="lg">
            <SectionTitle title="Recent care updates" description="Medication events recorded for share-enabled residents." />
            <Stack gap="sm">
              {familyEvents.length === 0 && <Text size="sm" c="dimmed">No shareable medication updates are available yet.</Text>}
              {familyEvents.map((event) => <Group key={event.id} justify="space-between" align="center">
                <Box><Text size="sm" fw={600}>{sharedResidents.find((resident) => resident.id === event.residentId)?.name}</Text><Text size="xs" c="dimmed">{event.medication} · {event.dose} · {event.recordedBy ?? 'Staff record'}</Text></Box>
                <StatusBadge status={event.status} />
              </Group>)}
            </Stack>
          </Card>
        </Grid.Col>
        <Grid.Col span={{ base: 12, lg: 5 }}>
          <Card withBorder radius="lg" padding="lg">
            <SectionTitle title="Measurement summaries" description="Source and timestamp preserved." />
            <Stack gap="sm">
              {familyReadings.map((reading) => <Paper key={reading.id} radius="md" bg="gray.0" p="sm">
                <Text size="sm" fw={600}>{sharedResidents.find((resident) => resident.id === reading.residentId)?.name}</Text>
                <Text size="sm">{reading.systolic}/{reading.diastolic} mmHg · {reading.heartRate} bpm</Text>
                <Text size="xs" c="dimmed">{reading.source} · {formatClock(reading.measuredAt)}</Text>
                {reading.followUp && <Text size="xs" mt={5} c="dimmed">Staff note: {reading.followUp}</Text>}
              </Paper>)}
            </Stack>
          </Card>
        </Grid.Col>
      </Grid>
      <Text size="xs" c="dimmed">Portal view time: {formatClock(time)} · No unsupported AI-generated health conclusions are shown.</Text>
    </Stack>
  );
}

function FinancialPage({ inputs, onChange }: { inputs: FinancialInputs; onChange: (inputs: FinancialInputs) => void }) {
  const forecast = useMemo(() => calculateFinancialForecast(inputs), [inputs]);
  const finalYear = forecast[forecast.length - 1];
  const chartData = forecast.map((row) => ({
    year: String(row.year),
    revenue: Number((row.totalRevenue / 1_000_000).toFixed(3)),
    operatingProfit: Number((row.operatingProfit / 1_000_000).toFixed(3)),
    cash: Number((row.closingCash / 1_000_000).toFixed(3)),
  }));
  const setPreset = (preset: string | null) => {
    if (preset === 'downside') onChange({ ...inputs, acquisitionMultiplier: 0.75, servicingMultiplier: 1.2 });
    else if (preset === 'base') onChange({ ...inputs, acquisitionMultiplier: 1, servicingMultiplier: 1 });
    else if (preset === 'upside') onChange({ ...inputs, acquisitionMultiplier: 1.25, servicingMultiplier: 1 });
  };
  return (
    <Stack gap="lg">
      <Alert color="blue" variant="light" title="Planning model, not actual company results">The base case reproduces the proposal’s illustrative assumptions. The additional scenario multipliers are user-adjustable demonstration assumptions; the proposal does not specify exact upside or higher-servicing percentages.</Alert>
      <SimpleGrid cols={{ base: 1, sm: 2, xl: 4 }}>
        <StatCard label="2031 revenue" value={formatMoneyShort(finalYear.totalRevenue)} detail="Base / selected scenario output" icon={IconChartBar} color="blue" />
        <StatCard label="2031 operating profit" value={formatMoneyShort(finalYear.operatingProfit)} detail="Before depreciation, interest and tax" icon={IconWallet} color={finalYear.operatingProfit >= 0 ? 'teal' : 'red'} />
        <StatCard label="2031 institutions" value={finalYear.yearEndInstitutions} detail="Cumulative year-end customers" icon={IconHome} color="violet" />
        <StatCard label="2031 closing cash" value={formatMoneyShort(finalYear.closingCash)} detail="Simplified cash model" icon={IconActivity} color="green" />
      </SimpleGrid>
      <Grid gutter="lg">
        <Grid.Col span={{ base: 12, xl: 4 }}>
          <Card withBorder radius="lg" padding="lg">
            <SectionTitle title="Scenario controls" description="Change assumptions and recalculate instantly." />
            <Stack gap="md">
              <Select label="Scenario preset" defaultValue="base" data={[
                { value: 'downside', label: 'Downside · 25% fewer wins' },
                { value: 'base', label: 'Base case · proposal' },
                { value: 'upside', label: 'Illustrative upside · 25% more wins' },
              ]} onChange={setPreset} allowDeselect={false} />
              <Box>
                <Group justify="space-between"><Text size="sm" fw={600}>Acquisition multiplier</Text><Text size="sm" fw={700}>{Math.round(inputs.acquisitionMultiplier * 100)}%</Text></Group>
                <Slider mt="sm" min={0.5} max={1.5} step={0.05} value={inputs.acquisitionMultiplier} onChange={(value) => onChange({ ...inputs, acquisitionMultiplier: value })} marks={[{ value: 0.5, label: '50%' }, { value: 1, label: '100%' }, { value: 1.5, label: '150%' }]} color="teal" />
              </Box>
              <Box>
                <Group justify="space-between"><Text size="sm" fw={600}>Servicing cost multiplier</Text><Text size="sm" fw={700}>{Math.round(inputs.servicingMultiplier * 100)}%</Text></Group>
                <Slider mt="sm" min={0.75} max={1.75} step={0.05} value={inputs.servicingMultiplier} onChange={(value) => onChange({ ...inputs, servicingMultiplier: value })} marks={[{ value: 0.75, label: '75%' }, { value: 1, label: '100%' }, { value: 1.75, label: '175%' }]} color="orange" />
              </Box>
              <Divider />
              <NumberInput label="Monthly site fee (HK$)" value={inputs.siteFee} min={0} step={100} onChange={(value) => onChange({ ...inputs, siteFee: Number(value) || 0 })} thousandSeparator />
              <NumberInput label="Monthly fee per resident (HK$)" value={inputs.residentFee} min={0} step={5} onChange={(value) => onChange({ ...inputs, residentFee: Number(value) || 0 })} />
              <NumberInput label="Average residents per site" value={inputs.residentsPerSite} min={1} max={500} onChange={(value) => onChange({ ...inputs, residentsPerSite: Number(value) || 1 })} />
              <Button variant="default" leftSection={<IconRefresh size={15} />} onClick={() => onChange(DEFAULT_FINANCIAL_INPUTS)}>Restore base assumptions</Button>
            </Stack>
          </Card>
        </Grid.Col>
        <Grid.Col span={{ base: 12, xl: 8 }}>
          <Card withBorder radius="lg" padding="lg" mb="lg">
            <SectionTitle title="Revenue and operating result" description="HK$ million · recalculated from current controls." />
            <Box h={265}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} barGap={8}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e8edf1" />
                  <XAxis dataKey="year" tickLine={false} axisLine={false} />
                  <YAxis tickLine={false} axisLine={false} />
                  <ChartTooltip formatter={(value) => `HK$${Number(value).toFixed(3)}m`} />
                  <Legend />
                  <Bar dataKey="revenue" name="Revenue" fill="#168b80" radius={[5, 5, 0, 0]} />
                  <Bar dataKey="operatingProfit" name="Operating profit / (loss)" fill="#8193c8" radius={[5, 5, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </Box>
          </Card>
          <Card withBorder radius="lg" padding="lg">
            <SectionTitle title="Closing cash balance" description="Assumes HK$9m initial funding at the start of 2027." />
            <Box h={190}>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e8edf1" />
                  <XAxis dataKey="year" tickLine={false} axisLine={false} />
                  <YAxis tickLine={false} axisLine={false} />
                  <ChartTooltip formatter={(value) => `HK$${Number(value).toFixed(3)}m`} />
                  <Area type="monotone" dataKey="cash" name="Closing cash (HK$m)" stroke="#168b80" fill="#bce4df" strokeWidth={2.5} />
                </AreaChart>
              </ResponsiveContainer>
            </Box>
          </Card>
        </Grid.Col>
      </Grid>
      <Card withBorder radius="lg" padding="lg">
        <SectionTitle title="Five-year forecast" description="Calculated using the proposal’s revenue and cost formulae." />
        <ScrollArea>
          <Table miw={1100} striped verticalSpacing="sm">
            <Table.Thead><Table.Tr><Table.Th>Year</Table.Th><Table.Th>New sites</Table.Th><Table.Th>Year-end sites</Table.Th><Table.Th>Avg. active sites</Table.Th><Table.Th>Revenue</Table.Th><Table.Th>Gross profit</Table.Th><Table.Th>Operating profit / (loss)</Table.Th><Table.Th>Closing cash</Table.Th></Table.Tr></Table.Thead>
            <Table.Tbody>
              {forecast.map((row) => <Table.Tr key={row.year}>
                <Table.Td><Text fw={700}>{row.year}</Text></Table.Td>
                <Table.Td>{row.newInstitutions}</Table.Td>
                <Table.Td>{row.yearEndInstitutions}</Table.Td>
                <Table.Td>{row.averageActiveInstitutions.toFixed(1)}</Table.Td>
                <Table.Td>{formatMoneyShort(row.totalRevenue)}</Table.Td>
                <Table.Td>{formatMoneyShort(row.grossProfit)}</Table.Td>
                <Table.Td><Text c={row.operatingProfit >= 0 ? 'teal.7' : 'red.7'} fw={600}>{formatMoneyShort(row.operatingProfit)}</Text></Table.Td>
                <Table.Td>{formatMoneyShort(row.closingCash)}</Table.Td>
              </Table.Tr>)}
            </Table.Tbody>
          </Table>
        </ScrollArea>
        <Divider my="md" />
        <Text size="xs" c="dimmed">Formula notes: subscription revenue = average active sites × annual recurring revenue per site; implementation and hardware revenue = new sites × assumed one-off fees; gross profit deducts servicing/hosting and hardware costs; operating profit deducts operating expenses; closing cash deducts capital expenditure and assumes no working-capital movement, financing cost, tax or depreciation.</Text>
      </Card>
    </Stack>
  );
}

function AuditPage({ entries }: { entries: AuditEntry[] }) {
  return (
    <Card withBorder radius="lg" padding="lg">
      <SectionTitle title="Activity history" description={`${entries.length} local audit entries · most recent first`} right={<Badge color="gray" variant="light">In-memory only</Badge>} />
      <Stack gap="md">
        {entries.map((entry) => <Group key={entry.id} align="flex-start" gap="sm" wrap="nowrap">
          <ThemeIcon color="teal" variant="light" radius="xl"><IconClipboardList size={16} /></ThemeIcon>
          <Box style={{ flex: 1 }}>
            <Group justify="space-between" wrap="wrap">
              <Text size="sm" fw={700}>{entry.action}</Text>
              <Text size="xs" c="dimmed" ff="monospace">{formatClock(entry.time)}</Text>
            </Group>
            <Text size="xs" c="dimmed">{entry.actor} · {entry.detail}</Text>
          </Box>
        </Group>)}
      </Stack>
    </Card>
  );
}
