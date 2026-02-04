import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Image,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import {
  Bell,
  Bone,
  Check,
  ChevronDown,
  Droplets,
  Footprints,
  MapPin,
  Play,
  Plus,
  Timer,
  X,
} from 'lucide-react-native';

import { activitiesRepo, petsRepo } from '@/data/repositories';
import { useActivePetStore } from '@/state/activePetStore';
import { colors, radii, spacing, typography } from '@/theme';
import { AppText, Button, Card, IconButton, Input } from '@/ui';

const DEFAULT_TEMPLATES = [
  { title: 'Alimentar', icon: 'bone', targetCountPerDay: 2, isTimer: false, sortOrder: 1 },
  { title: 'Passear', icon: 'footprints', targetCountPerDay: 2, isTimer: true, sortOrder: 2 },
  { title: 'Brincar', icon: 'play', targetCountPerDay: 1, isTimer: true, sortOrder: 3 },
  { title: 'Trocar água', icon: 'droplets', targetCountPerDay: 3, isTimer: false, sortOrder: 4 },
] as const;

type Template = activitiesRepo.ActivityTemplate;

type ActivityCounts = Record<string, number>;

type ActivityTimerState = {
  template: Template | null;
  visible: boolean;
  running: boolean;
  elapsed: number;
};

const formatDateKey = (date: Date) => {
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, '0');
  const day = `${date.getDate()}`.padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const addDays = (date: Date, delta: number) => {
  const next = new Date(date);
  next.setDate(next.getDate() + delta);
  return next;
};

const weekDays = ['D', 'S', 'T', 'Q', 'Q', 'S', 'S'];

const iconMap = {
  bone: Bone,
  footprints: Footprints,
  play: Play,
  droplets: Droplets,
};

const getIcon = (name: string | null | undefined) => {
  if (!name) return Play;
  return iconMap[name as keyof typeof iconMap] ?? Play;
};

export default function HomeScreen() {
  const [pets, setPets] = useState<petsRepo.Pet[]>([]);
  const [templates, setTemplates] = useState<Template[]>([]);
  const [activityCounts, setActivityCounts] = useState<ActivityCounts>({});
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [petModalVisible, setPetModalVisible] = useState(false);
  const [activityModalVisible, setActivityModalVisible] = useState(false);
  const [newActivityTitle, setNewActivityTitle] = useState('');
  const [newActivityTarget, setNewActivityTarget] = useState('');
  const [newActivityType, setNewActivityType] = useState<'register' | 'timer'>('register');
  const [timerState, setTimerState] = useState<ActivityTimerState>({
    template: null,
    visible: false,
    running: false,
    elapsed: 0,
  });

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const activePetId = useActivePetStore((state) => state.activePetId);
  const setActivePetId = useActivePetStore((state) => state.setActivePetId);

  const activePet = pets.find((pet) => pet.id === activePetId) ?? pets[0];
  const dateKey = useMemo(() => formatDateKey(selectedDate), [selectedDate]);

  const weekDates = useMemo(() => {
    const start = addDays(selectedDate, -selectedDate.getDay());
    return Array.from({ length: 7 }, (_, idx) => addDays(start, idx));
  }, [selectedDate]);

  const progress = useMemo(() => {
    if (templates.length === 0) return 0;

    const totals = templates.map((template) => template.targetCountPerDay ?? 1);
    const done = templates.map((template) => {
      const target = template.targetCountPerDay ?? 1;
      const count = activityCounts[template.id] ?? 0;
      return Math.min(count, target);
    });

    const totalUnits = totals.reduce((acc, value) => acc + value, 0);
    const doneUnits = done.reduce((acc, value) => acc + value, 0);

    return totalUnits === 0 ? 0 : doneUnits / totalUnits;
  }, [templates, activityCounts]);

  useEffect(() => {
    petsRepo
      .getPets()
      .then((list) => setPets(list))
      .catch((error) => console.error('loadPets', error));
  }, []);

  useEffect(() => {
    if (pets.length > 0 && !activePetId) {
      setActivePetId(pets[0].id);
    }
  }, [pets, activePetId, setActivePetId]);

  const ensureDefaultTemplates = async (petId: string) => {
    const current = await activitiesRepo.getTemplatesByPet(petId);
    if (current.length > 0) return current;

    for (const template of DEFAULT_TEMPLATES) {
      await activitiesRepo.createTemplate({
        petId,
        title: template.title,
        icon: template.icon,
        targetCountPerDay: template.targetCountPerDay,
        isTimer: template.isTimer,
        sortOrder: template.sortOrder,
      });
    }

    return activitiesRepo.getTemplatesByPet(petId);
  };

  const loadChecklist = async (petId: string, date: string) => {
    const templateList = await ensureDefaultTemplates(petId);
    setTemplates(templateList);

    const logs = await activitiesRepo.getLogsByPetDate(petId, date);
    const counts = logs.reduce<ActivityCounts>((acc, log) => {
      acc[log.templateId] = (acc[log.templateId] ?? 0) + log.countIncrement;
      return acc;
    }, {});
    setActivityCounts(counts);
  };

  useEffect(() => {
    if (!activePetId) return;
    loadChecklist(activePetId, dateKey).catch((error) => console.error('loadChecklist', error));
  }, [activePetId, dateKey]);

  useEffect(() => {
    if (!timerState.running) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      return;
    }

    intervalRef.current = setInterval(() => {
      setTimerState((state) => ({ ...state, elapsed: state.elapsed + 1 }));
    }, 1000);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [timerState.running]);

  const handleRegister = async (templateId: string) => {
    if (!activePetId) return;
    await activitiesRepo.logActivity({
      petId: activePetId,
      templateId,
      date: dateKey,
      countIncrement: 1,
    });
    await loadChecklist(activePetId, dateKey);
  };

  const openTimer = (template: Template) => {
    setTimerState({ template, visible: true, running: false, elapsed: 0 });
  };

  const closeTimer = () => {
    setTimerState({ template: null, visible: false, running: false, elapsed: 0 });
  };

  const toggleTimer = async () => {
    if (!timerState.template || !activePetId) return;

    if (!timerState.running) {
      setTimerState((state) => ({ ...state, running: true }));
      return;
    }

    const duration = timerState.elapsed;
    setTimerState((state) => ({ ...state, running: false }));

    await activitiesRepo.logActivity({
      petId: activePetId,
      templateId: timerState.template.id,
      date: dateKey,
      countIncrement: 1,
      durationSec: duration,
    });
    await loadChecklist(activePetId, dateKey);
    closeTimer();
  };

  const handleAddActivity = async () => {
    if (!activePetId || !newActivityTitle.trim()) return;

    const target = newActivityTarget.trim();
    const parsedTarget = target ? Number.parseInt(target, 10) : undefined;

    await activitiesRepo.createTemplate({
      petId: activePetId,
      title: newActivityTitle.trim(),
      icon: newActivityType === 'timer' ? 'play' : 'bone',
      targetCountPerDay: Number.isNaN(parsedTarget) ? undefined : parsedTarget,
      isTimer: newActivityType === 'timer',
      sortOrder: templates.length + 1,
    });

    setNewActivityTitle('');
    setNewActivityTarget('');
    setNewActivityType('register');
    setActivityModalVisible(false);

    await loadChecklist(activePetId, dateKey);
  };

  const renderPetCard = () => (
    <Pressable onPress={() => setPetModalVisible(true)}>
      <Card style={styles.petCard}>
        <View style={styles.petRow}>
          {activePet?.photoUri ? (
            <Image source={{ uri: activePet.photoUri }} style={styles.petImage} />
          ) : (
            <View style={styles.petPlaceholder} />
          )}
          <View style={styles.petInfo}>
            <View style={styles.petNameRow}>
              <AppText variant="subtitle">{activePet?.name ?? 'Seu pet'}</AppText>
              <ChevronDown size={16} color={colors.textSecondary} />
            </View>
            <AppText variant="caption" color={colors.textSecondary}>
              {activePet?.breed ?? 'Toque para escolher'}
            </AppText>
          </View>
          <View style={styles.petBadge}>
            <AppText variant="caption" color={colors.primary}>
              Ativo
            </AppText>
          </View>
        </View>
      </Card>
    </Pressable>
  );

  const renderChecklist = () => (
    <Card style={styles.checklistCard}>
      <View style={styles.checklistHeader}>
        <View>
          <AppText variant="subtitle">Checklist do dia</AppText>
          <AppText variant="caption" color={colors.textSecondary}>
            {Math.round(progress * 100)}% concluído
          </AppText>
        </View>
        <IconButton
          icon={<Plus size={18} color="white" />}
          variant="primary"
          onPress={() => setActivityModalVisible(true)}
          size={44}
          style={styles.addButton}
        />
      </View>

      <View style={styles.progressTrack}>
        <View style={[styles.progressFill, { width: `${Math.round(progress * 100)}%` }]} />
      </View>

      {templates.length === 0 ? (
        <AppText variant="caption" color={colors.textSecondary}>
          Nenhuma atividade cadastrada.
        </AppText>
      ) : (
        templates.map((template) => {
          const target = template.targetCountPerDay ?? 1;
          const count = activityCounts[template.id] ?? 0;
          const done = count >= target;
          const Icon = getIcon(template.icon);

          return (
            <View key={template.id} style={[styles.activityRow, done && styles.activityDone]}>
              <View style={[styles.activityIcon, done && styles.activityIconDone]}>
                <Icon size={18} color={done ? colors.primary : colors.textSecondary} />
              </View>
              <View style={styles.activityInfo}>
                <AppText variant="body" style={styles.activityTitle}>
                  {template.title}
                </AppText>
                <AppText variant="caption" color={colors.textSecondary}>
                  {count}/{target} no dia
                </AppText>
              </View>
              <View style={styles.activityActions}>
                {template.isTimer ? (
                  <Pressable style={styles.actionButtonSecondary} onPress={() => handleRegister(template.id)}>
                    <Text style={styles.actionTextSecondary}>Registrar</Text>
                  </Pressable>
                ) : null}
                <Pressable
                  style={[styles.actionButton, done && styles.actionButtonDone]}
                  onPress={() =>
                    template.isTimer ? openTimer(template) : handleRegister(template.id)
                  }
                >
                  {done ? (
                    <Check size={16} color="white" />
                  ) : template.isTimer ? (
                    <Timer size={16} color="white" />
                  ) : (
                    <Text style={styles.actionText}>Registrar</Text>
                  )}
                </Pressable>
              </View>
            </View>
          );
        })
      )}
    </Card>
  );

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <View>
            <AppText variant="caption" color={colors.textSecondary}>
              Bom dia,
            </AppText>
            <AppText variant="title">Ana Silva</AppText>
            <View style={styles.locationRow}>
              <MapPin size={12} color={colors.primary} />
              <AppText variant="caption" color={colors.textSecondary}>
                São Paulo, SP
              </AppText>
            </View>
          </View>
          <IconButton icon={<Bell size={18} color={colors.textPrimary} />} onPress={() => {}} />
        </View>

        {renderPetCard()}

        <View style={styles.weekSelector}>
          {weekDates.map((date) => {
            const selected = formatDateKey(date) === dateKey;
            return (
              <Pressable
                key={date.toISOString()}
                style={[styles.dayChip, selected && styles.dayChipSelected]}
                onPress={() => setSelectedDate(date)}
              >
                <AppText variant="caption" color={selected ? '#fff' : colors.textSecondary}>
                  {weekDays[date.getDay()]}
                </AppText>
                <AppText variant="body" color={selected ? '#fff' : colors.textPrimary}>
                  {date.getDate()}
                </AppText>
              </Pressable>
            );
          })}
        </View>

        {renderChecklist()}
      </ScrollView>

      <Modal visible={petModalVisible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <Pressable style={StyleSheet.absoluteFill} onPress={() => setPetModalVisible(false)} />
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <AppText variant="subtitle">Selecionar pet</AppText>
              <Pressable onPress={() => setPetModalVisible(false)}>
                <X size={18} color={colors.textSecondary} />
              </Pressable>
            </View>
            {pets.map((pet) => (
              <Pressable
                key={pet.id}
                style={styles.modalItem}
                onPress={() => {
                  setActivePetId(pet.id);
                  setPetModalVisible(false);
                }}
              >
                <AppText variant="body">{pet.name}</AppText>
                {pet.id === activePetId ? (
                  <Check size={16} color={colors.primary} />
                ) : null}
              </Pressable>
            ))}
            {pets.length === 0 ? (
              <AppText variant="caption" color={colors.textSecondary}>
                Nenhum pet cadastrado.
              </AppText>
            ) : null}
          </View>
        </View>
      </Modal>

      <Modal visible={activityModalVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContentLarge}>
            <View style={styles.modalHeader}>
              <AppText variant="subtitle">Adicionar atividade</AppText>
              <Pressable onPress={() => setActivityModalVisible(false)}>
                <X size={18} color={colors.textSecondary} />
              </Pressable>
            </View>

            <Input
              label="Nome da atividade"
              value={newActivityTitle}
              onChangeText={setNewActivityTitle}
              placeholder="Ex.: Escovar"
            />
            <Input
              label="Meta diária (opcional)"
              value={newActivityTarget}
              onChangeText={setNewActivityTarget}
              placeholder="Ex.: 3"
              keyboardType="numeric"
            />
            <View style={styles.typeRow}>
              <Pressable
                style={[
                  styles.typeButton,
                  newActivityType === 'register' && styles.typeButtonSelected,
                ]}
                onPress={() => setNewActivityType('register')}
              >
                <AppText variant="caption" color={newActivityType === 'register' ? '#fff' : colors.textSecondary}>
                  Registrar
                </AppText>
              </Pressable>
              <Pressable
                style={[
                  styles.typeButton,
                  newActivityType === 'timer' && styles.typeButtonSelected,
                ]}
                onPress={() => setNewActivityType('timer')}
              >
                <AppText variant="caption" color={newActivityType === 'timer' ? '#fff' : colors.textSecondary}>
                  Timer
                </AppText>
              </Pressable>
            </View>

            <Button label="Salvar atividade" onPress={handleAddActivity} />
          </View>
        </View>
      </Modal>

      <Modal visible={timerState.visible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.timerModal}>
            <View style={styles.modalHeader}>
              <AppText variant="subtitle">{timerState.template?.title ?? 'Timer'}</AppText>
              <Pressable onPress={closeTimer}>
                <X size={18} color={colors.textSecondary} />
              </Pressable>
            </View>
            <View style={styles.timerBody}>
              <AppText variant="title" style={styles.timerValue}>
                {Math.floor(timerState.elapsed / 60)}:{`${timerState.elapsed % 60}`.padStart(2, '0')}
              </AppText>
              <AppText variant="caption" color={colors.textSecondary}>
                Toque em iniciar para contabilizar a duração.
              </AppText>
            </View>
            <Button
              label={timerState.running ? 'Parar e salvar' : 'Iniciar'}
              onPress={toggleTimer}
            />
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    padding: spacing.xl,
    paddingBottom: spacing['2xl'],
    gap: spacing.lg,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  petCard: {
    padding: spacing.lg,
  },
  petRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  petImage: {
    width: 56,
    height: 56,
    borderRadius: radii.pill,
  },
  petPlaceholder: {
    width: 56,
    height: 56,
    borderRadius: radii.pill,
    backgroundColor: colors.surfaceMuted,
  },
  petInfo: {
    flex: 1,
  },
  petNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  petBadge: {
    backgroundColor: colors.primarySoft,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: radii.pill,
  },
  weekSelector: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  dayChip: {
    width: 42,
    height: 52,
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    backgroundColor: colors.surface,
  },
  dayChipSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  checklistCard: {
    gap: spacing.md,
  },
  checklistHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  addButton: {
    backgroundColor: colors.primary,
    borderRadius: radii.lg,
    borderWidth: 0,
  },
  progressTrack: {
    height: 6,
    borderRadius: radii.pill,
    backgroundColor: colors.surfaceMuted,
    overflow: 'hidden',
  },
  progressFill: {
    height: 6,
    borderRadius: radii.pill,
    backgroundColor: colors.primary,
  },
  activityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: spacing.sm,
  },
  activityDone: {
    opacity: 0.8,
  },
  activityIcon: {
    width: 40,
    height: 40,
    borderRadius: radii.lg,
    backgroundColor: colors.surfaceMuted,
    alignItems: 'center',
    justifyContent: 'center',
  },
  activityIconDone: {
    backgroundColor: colors.primarySoft,
  },
  activityInfo: {
    flex: 1,
  },
  activityTitle: {
    fontWeight: '600',
  },
  activityActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  actionButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radii.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionButtonDone: {
    backgroundColor: colors.success,
  },
  actionText: {
    color: 'white',
    fontWeight: '600',
    fontSize: typography.size.sm,
  },
  actionButtonSecondary: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: colors.border,
  },
  actionTextSecondary: {
    color: colors.textSecondary,
    fontWeight: '600',
    fontSize: typography.size.sm,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.35)',
    justifyContent: 'center',
    padding: spacing.xl,
  },
  modalContent: {
    backgroundColor: colors.surface,
    borderRadius: radii.xl,
    padding: spacing.lg,
    gap: spacing.md,
  },
  modalContentLarge: {
    backgroundColor: colors.surface,
    borderRadius: radii.xl,
    padding: spacing.lg,
    gap: spacing.md,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  modalItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.sm,
  },
  typeRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  typeButton: {
    flex: 1,
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: colors.border,
    paddingVertical: spacing.sm,
    alignItems: 'center',
    backgroundColor: colors.surface,
  },
  typeButtonSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  timerModal: {
    backgroundColor: colors.surface,
    borderRadius: radii.xl,
    padding: spacing.lg,
    gap: spacing.lg,
  },
  timerBody: {
    alignItems: 'center',
    gap: spacing.sm,
  },
  timerValue: {
    fontWeight: '700',
  },
});
