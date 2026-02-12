import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  LayoutAnimation,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  UIManager,
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
  Pencil,
  Trash2,
  Timer,
  EllipsisVertical,
  X,
} from 'lucide-react-native';
import DraggableFlatList, { RenderItemParams } from 'react-native-draggable-flatlist';
import { Vibration } from 'react-native';

import { activitiesRepo, petsRepo, tutorsRepo } from '@/data/repositories';
import { loadLocationPreference } from '@/features/agenda/weather';
import { useActivePetStore } from '@/state/activePetStore';
import { colors, radii, spacing, typography } from '@/theme';
import { useThemeColors } from '@/theme';
import {
  AppText,
  Button,
  Card,
  IconButton,
  Input,
  KeyboardAvoider,
  PressableScale,
  ScreenFade,
  useScreenPadding,
  useToast,
} from '@/ui';
import { DEFAULT_ACTIVITY_TEMPLATES } from '@/features/home/activityDefaults';

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
  const [tutorName, setTutorName] = useState('');
  const [locationLabel, setLocationLabel] = useState('Localização não definida');
  const [templates, setTemplates] = useState<Template[]>([]);
  const [activityCounts, setActivityCounts] = useState<ActivityCounts>({});
  const [loadingChecklist, setLoadingChecklist] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [petModalVisible, setPetModalVisible] = useState(false);
  const [activityModalVisible, setActivityModalVisible] = useState(false);
  const [manageModalVisible, setManageModalVisible] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<Template | null>(null);
  const [newActivityTitle, setNewActivityTitle] = useState('');
  const [newActivityTarget, setNewActivityTarget] = useState('');
  const [newActivityType, setNewActivityType] = useState<'register' | 'timer'>('register');
  const [newActivityIcon, setNewActivityIcon] = useState('bone');
  const [timerState, setTimerState] = useState<ActivityTimerState>({
    template: null,
    visible: false,
    running: false,
    elapsed: 0,
  });

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const activePetId = useActivePetStore((state) => state.activePetId);
  const setActivePetId = useActivePetStore((state) => state.setActivePetId);
  const screenPadding = useScreenPadding();
  const themeColors = useThemeColors();
  const toast = useToast();

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
    if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
      UIManager.setLayoutAnimationEnabledExperimental(true);
    }
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

    for (const template of DEFAULT_ACTIVITY_TEMPLATES) {
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
    setLoadingChecklist(true);
    try {
      const templateList = await ensureDefaultTemplates(petId);
      setTemplates(templateList);

      const logs = await activitiesRepo.getLogsByPetDate(petId, date);
      const counts = logs.reduce<ActivityCounts>((acc, log) => {
        acc[log.templateId] = (acc[log.templateId] ?? 0) + log.countIncrement;
        return acc;
      }, {});
      setActivityCounts(counts);
    } finally {
      setLoadingChecklist(false);
    }
  };

  useEffect(() => {
    if (!activePetId) return;
    loadChecklist(activePetId, dateKey).catch((error) => console.error('loadChecklist', error));
    tutorsRepo
      .getTutorsByPet(activePetId)
      .then((data) => setTutorName(data[0]?.name ?? ''))
      .catch((error) => console.error('loadTutors', error));
  }, [activePetId, dateKey]);

  useEffect(() => {
    loadLocationPreference()
      .then((stored) => {
        if (stored?.label) {
          setLocationLabel(stored.label);
        }
      })
      .catch((error) => console.error('loadLocationPreference', error));
  }, []);

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
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
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
      icon: newActivityIcon,
      targetCountPerDay: Number.isNaN(parsedTarget) ? undefined : parsedTarget,
      isTimer: newActivityType === 'timer',
      sortOrder: templates.length + 1,
    });

    setNewActivityTitle('');
    setNewActivityTarget('');
    setNewActivityType('register');
    setNewActivityIcon('bone');
    setActivityModalVisible(false);

    await loadChecklist(activePetId, dateKey);
    toast.show('Atividade adicionada', 'success');
  };

  const openEditTemplate = (template: Template, options?: { closeManageModal?: boolean }) => {
    if (options?.closeManageModal ?? true) {
      setManageModalVisible(false);
    }
    setEditingTemplate(template);
    setNewActivityTitle(template.title);
    setNewActivityTarget(template.targetCountPerDay ? String(template.targetCountPerDay) : '');
    setNewActivityType(template.isTimer ? 'timer' : 'register');
    setNewActivityIcon(template.icon ?? 'bone');
    setActivityModalVisible(true);
  };

  const handleUpdateActivity = async () => {
    if (!editingTemplate) return;
    const target = newActivityTarget.trim();
    const parsedTarget = target ? Number.parseInt(target, 10) : undefined;

    await activitiesRepo.updateTemplate(editingTemplate.id, {
      title: newActivityTitle.trim() || editingTemplate.title,
      icon: newActivityIcon,
      targetCountPerDay: Number.isNaN(parsedTarget) ? undefined : parsedTarget,
      isTimer: newActivityType === 'timer',
    });

    setEditingTemplate(null);
    setNewActivityTitle('');
    setNewActivityTarget('');
    setNewActivityType('register');
    setNewActivityIcon('bone');
    setActivityModalVisible(false);
    await loadChecklist(editingTemplate.petId, dateKey);
    toast.show('Atividade atualizada', 'success');
  };

  const handleDeleteTemplate = async (template: Template) => {
    await activitiesRepo.deleteTemplate(template.id);
    await loadChecklist(template.petId, dateKey);
    toast.show('Atividade removida', 'info');
  };

  const openTemplateActions = (template: Template) => {
    Alert.alert(
      template.title,
      'O que você deseja fazer com esta atividade?',
      [
        {
          text: 'Editar',
          onPress: () => openEditTemplate(template, { closeManageModal: false }),
        },
        {
          text: 'Excluir',
          style: 'destructive',
          onPress: () => handleDeleteTemplate(template),
        },
        { text: 'Cancelar', style: 'cancel' },
      ],
      { cancelable: true },
    );
  };

  const handleReorderTemplates = async (data: Template[]) => {
    setTemplates(data);
    await Promise.all(
      data.map((item, index) => activitiesRepo.updateTemplate(item.id, { sortOrder: index + 1 })),
    );
  };

  const closeActivityModal = () => {
    setActivityModalVisible(false);
    setEditingTemplate(null);
    setNewActivityTitle('');
    setNewActivityTarget('');
    setNewActivityType('register');
    setNewActivityIcon('bone');
  };

  const renderPetCard = () => (
    <PressableScale
      onPress={() => setPetModalVisible(true)}
      accessibilityRole="button"
      accessibilityLabel="Selecionar pet"
    >
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
          <View style={[styles.petBadge, { backgroundColor: themeColors.primarySoft }]}>
            <AppText variant="caption" color={themeColors.primary}>
              Ativo
            </AppText>
          </View>
        </View>
      </Card>
    </PressableScale>
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
        <View style={styles.checklistActions}>
          <Pressable
            onPress={() => setManageModalVisible(true)}
            accessibilityRole="button"
            accessibilityLabel="Gerenciar checklist"
          >
            <AppText variant="caption" color={themeColors.primary}>
              Gerenciar
            </AppText>
          </Pressable>
          <IconButton
            icon={<Plus size={18} color="white" />}
            variant="primary"
            onPress={() => setActivityModalVisible(true)}
            size={44}
            style={[styles.addButton, { backgroundColor: themeColors.primary }]}
            accessibilityLabel="Adicionar atividade"
          />
        </View>
      </View>

      <View style={styles.progressTrack}>
        <View
          style={[
            styles.progressFill,
            { width: `${Math.round(progress * 100)}%`, backgroundColor: themeColors.primary },
          ]}
        />
      </View>

      {loadingChecklist ? (
        <View style={styles.loadingRow}>
          <ActivityIndicator />
          <AppText variant="caption" color={colors.textSecondary}>
            Carregando checklist...
          </AppText>
        </View>
      ) : templates.length === 0 ? (
        <View style={styles.emptyChecklist}>
          <AppText variant="caption" color={colors.textSecondary}>
            Sem atividades por aqui.
          </AppText>
          <Button label="Adicionar atividade" onPress={() => setActivityModalVisible(true)} />
        </View>
      ) : (
        templates.map((template) => {
          const target = template.targetCountPerDay ?? 1;
          const count = activityCounts[template.id] ?? 0;
          const done = count >= target;
          const Icon = getIcon(template.icon);

          return (
            <View key={template.id} style={[styles.activityRow, done && styles.activityDone]}>
              <View
                style={[
                  styles.activityIcon,
                  done && styles.activityIconDone,
                  done && { backgroundColor: themeColors.primarySoft },
                ]}
              >
                <Icon size={18} color={done ? themeColors.primary : colors.textSecondary} />
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
                  <Pressable
                    style={styles.actionButtonSecondary}
                    onPress={() => handleRegister(template.id)}
                  >
                    <Text style={styles.actionTextSecondary}>Registrar</Text>
                  </Pressable>
                ) : null}
                <Pressable
                  style={[
                    styles.actionButton,
                    { backgroundColor: themeColors.primary },
                    done && styles.actionButtonDone,
                  ]}
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
                <Pressable
                  onPress={() => openTemplateActions(template)}
                  accessibilityRole="button"
                  accessibilityLabel={`Editar opções de ${template.title}`}
                  style={styles.activityMenuButton}
                >
                  <EllipsisVertical size={16} color={colors.textSecondary} />
                </Pressable>
              </View>
            </View>
          );
        })
      )}
    </Card>
  );

  return (
    <ScreenFade style={[styles.container, { backgroundColor: themeColors.background }]}>
      <ScrollView
        contentContainerStyle={[styles.content, screenPadding]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <View>
            <AppText variant="caption" color={colors.textSecondary}>
              Bom dia,
            </AppText>
            <AppText variant="title">{tutorName || 'Olá'}</AppText>
            <View style={styles.locationRow}>
              <MapPin size={14} color={themeColors.primary} />
              <AppText variant="caption" color={colors.textSecondary}>
                {locationLabel}
              </AppText>
            </View>
          </View>
          <IconButton
            icon={<Bell size={18} color={colors.textPrimary} />}
            onPress={() => {}}
            accessibilityLabel="Notificações"
          />
        </View>

        {renderPetCard()}

        <View style={styles.weekSelector}>
          {weekDates.map((date) => {
            const selected = formatDateKey(date) === dateKey;
            return (
              <PressableScale
                key={date.toISOString()}
                style={[
                  styles.dayChip,
                  selected && {
                    backgroundColor: themeColors.primary,
                    borderColor: themeColors.primary,
                  },
                ]}
                onPress={() => setSelectedDate(date)}
              >
                <AppText variant="caption" color={selected ? '#fff' : colors.textSecondary}>
                  {weekDays[date.getDay()]}
                </AppText>
                <AppText variant="body" color={selected ? '#fff' : colors.textPrimary}>
                  {date.getDate()}
                </AppText>
              </PressableScale>
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
                {pet.id === activePetId ? <Check size={16} color={themeColors.primary} /> : null}
              </Pressable>
            ))}
            {pets.length === 0 ? (
              <AppText variant="caption" color={colors.textSecondary}>
                Nenhum pet por aqui ainda.
              </AppText>
            ) : null}
          </View>
        </View>
      </Modal>

      <Modal visible={activityModalVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <KeyboardAvoider style={styles.modalContentLarge}>
            <View style={styles.modalHeader}>
              <AppText variant="subtitle">
                {editingTemplate ? 'Editar atividade' : 'Adicionar atividade'}
              </AppText>
              <Pressable onPress={closeActivityModal}>
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
                <AppText
                  variant="caption"
                  color={newActivityType === 'register' ? '#fff' : colors.textSecondary}
                >
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
                <AppText
                  variant="caption"
                  color={newActivityType === 'timer' ? '#fff' : colors.textSecondary}
                >
                  Timer
                </AppText>
              </Pressable>
            </View>

            <View style={styles.iconPickerRow}>
              {Object.keys(iconMap).map((iconKey) => {
                const Icon = getIcon(iconKey);
                const selected = newActivityIcon === iconKey;
                return (
                  <Pressable
                    key={iconKey}
                    onPress={() => setNewActivityIcon(iconKey)}
                    style={[
                      styles.iconChip,
                      selected && {
                        backgroundColor: themeColors.primary,
                        borderColor: themeColors.primary,
                      },
                    ]}
                  >
                    <Icon size={18} color={selected ? '#fff' : colors.textSecondary} />
                  </Pressable>
                );
              })}
            </View>

            <Button
              label={editingTemplate ? 'Salvar alterações' : 'Salvar atividade'}
              onPress={editingTemplate ? handleUpdateActivity : handleAddActivity}
            />
          </KeyboardAvoider>
        </View>
      </Modal>

      <Modal visible={manageModalVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <Pressable style={StyleSheet.absoluteFill} onPress={() => setManageModalVisible(false)} />
          <View style={styles.modalContentLarge}>
            <View style={styles.modalHeader}>
              <AppText variant="subtitle">Gerenciar atividades</AppText>
              <Pressable onPress={() => setManageModalVisible(false)}>
                <X size={18} color={colors.textSecondary} />
              </Pressable>
            </View>
            <AppText variant="caption" color={colors.textSecondary}>
              Toque em editar/excluir ou segure uma linha para reordenar.
            </AppText>
            <DraggableFlatList
              data={templates}
              keyExtractor={(item) => item.id}
              onDragEnd={({ data }) => handleReorderTemplates(data)}
              style={styles.manageListContainer}
              contentContainerStyle={styles.manageList}
              renderItem={({ item, drag, isActive }: RenderItemParams<Template>) => (
                <Pressable
                  onLongPress={() => {
                    Vibration.vibrate(10);
                    drag();
                  }}
                  style={[styles.manageRow, isActive && styles.manageRowActive]}
                >
                  <View style={styles.manageInfo}>
                    <AppText variant="body">{item.title}</AppText>
                    <AppText variant="caption" color={colors.textSecondary}>
                      {item.targetCountPerDay ?? 1}x ao dia • {item.isTimer ? 'Timer' : 'Registro'}
                    </AppText>
                  </View>
                  <View style={styles.manageActions}>
                    <Pressable
                      onPress={() => openEditTemplate(item)}
                      style={styles.iconAction}
                      accessibilityRole="button"
                      accessibilityLabel={`Editar ${item.title}`}
                    >
                      <Pencil size={16} color={colors.textSecondary} />
                      <AppText variant="caption" color={colors.textSecondary}>
                        Editar
                      </AppText>
                    </Pressable>
                    <Pressable
                      onPress={() => handleDeleteTemplate(item)}
                      style={styles.iconActionDanger}
                      accessibilityRole="button"
                      accessibilityLabel={`Excluir ${item.title}`}
                    >
                      <Trash2 size={16} color={colors.danger} />
                      <AppText variant="caption" color={colors.danger}>
                        Excluir
                      </AppText>
                    </Pressable>
                  </View>
                </Pressable>
              )}
            />
            <Button
              label="Adicionar atividade"
              onPress={() => {
                setManageModalVisible(false);
                setEditingTemplate(null);
                setActivityModalVisible(true);
              }}
            />
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
                {Math.floor(timerState.elapsed / 60)}:
                {`${timerState.elapsed % 60}`.padStart(2, '0')}
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
    </ScreenFade>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    paddingHorizontal: spacing.xl,
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
  checklistActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
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
  loadingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.sm,
  },
  emptyChecklist: {
    gap: spacing.sm,
    paddingVertical: spacing.sm,
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
  activityMenuButton: {
    width: 36,
    height: 36,
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surface,
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
    maxHeight: '85%',
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
  iconPickerRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  iconChip: {
    width: 40,
    height: 40,
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surface,
  },
  iconChipSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  manageRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    backgroundColor: colors.surface,
  },
  manageRowActive: {
    backgroundColor: colors.primarySoft,
  },
  manageListContainer: {
    flex: 1,
  },
  manageList: {
    paddingBottom: spacing.sm,
  },
  manageInfo: {
    flex: 1,
    gap: spacing.xs,
  },
  manageActions: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  iconAction: {
    minWidth: 88,
    height: 36,
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: spacing.sm,
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.xs,
    justifyContent: 'center',
  },
  iconActionDanger: {
    minWidth: 88,
    height: 36,
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: spacing.sm,
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.xs,
    justifyContent: 'center',
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
