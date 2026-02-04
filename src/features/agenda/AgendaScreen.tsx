import React, { useEffect, useMemo, useState } from 'react';
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Pencil,
  Plus,
  Trash2,
  X,
} from 'lucide-react-native';

import { remindersRepo } from '@/data/repositories';
import { useActivePetStore } from '@/state/activePetStore';
import { colors, radii, spacing } from '@/theme';
import { AppText, Button, Card, IconButton, Input } from '@/ui';

const dayLabels = ['D', 'S', 'T', 'Q', 'Q', 'S', 'S'];
const reminderTypes = [
  { id: 'vacina', label: 'Vacina' },
  { id: 'banho', label: 'Banho' },
  { id: 'tosa', label: 'Tosa' },
  { id: 'vet', label: 'Vet' },
  { id: 'outro', label: 'Outro' },
];

const formatDateKey = (date: Date) => {
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, '0');
  const day = `${date.getDate()}`.padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const formatMonthLabel = (date: Date) => {
  return date.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });
};

const buildDateTime = (date: string, time: string) => {
  const normalizedTime = time.length === 5 ? `${time}:00` : time;
  return `${date}T${normalizedTime}`;
};

const formatTime = (iso: string) => {
  const date = new Date(iso);
  return date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
};

const getDaysForMonth = (currentMonth: Date) => {
  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth();
  const firstDay = new Date(year, month, 1);
  const startWeekday = firstDay.getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const days: Array<{ date: Date; currentMonth: boolean }> = [];

  for (let i = 0; i < startWeekday; i += 1) {
    const prevDate = new Date(year, month, i - startWeekday + 1);
    days.push({ date: prevDate, currentMonth: false });
  }

  for (let day = 1; day <= daysInMonth; day += 1) {
    days.push({ date: new Date(year, month, day), currentMonth: true });
  }

  const remaining = 42 - days.length;
  for (let i = 1; i <= remaining; i += 1) {
    days.push({ date: new Date(year, month + 1, i), currentMonth: false });
  }

  return days;
};

type FormState = {
  id?: string;
  title: string;
  type: string;
  date: string;
  time: string;
  notes: string;
};

const today = new Date();

export default function AgendaScreen() {
  const [currentMonth, setCurrentMonth] = useState(new Date(today.getFullYear(), today.getMonth(), 1));
  const [selectedDate, setSelectedDate] = useState(today);
  const [reminders, setReminders] = useState<remindersRepo.Reminder[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [form, setForm] = useState<FormState>({
    title: '',
    type: reminderTypes[0].id,
    date: formatDateKey(today),
    time: '09:00',
    notes: '',
  });

  const activePetId = useActivePetStore((state) => state.activePetId);

  const dateKey = useMemo(() => formatDateKey(selectedDate), [selectedDate]);
  const monthDays = useMemo(() => getDaysForMonth(currentMonth), [currentMonth]);

  const remindersForDay = useMemo(() => {
    return reminders.filter((reminder) => reminder.datetime.startsWith(dateKey));
  }, [reminders, dateKey]);

  const loadReminders = async () => {
    if (!activePetId) {
      setReminders([]);
      return;
    }
    const data = await remindersRepo.getRemindersByPet(activePetId);
    setReminders(data);
  };

  useEffect(() => {
    loadReminders().catch((error) => console.error('loadReminders', error));
  }, [activePetId]);

  const navigateMonth = (direction: number) => {
    const nextMonth = new Date(currentMonth);
    nextMonth.setMonth(currentMonth.getMonth() + direction, 1);
    setCurrentMonth(nextMonth);

    if (nextMonth.getMonth() !== selectedDate.getMonth() || nextMonth.getFullYear() !== selectedDate.getFullYear()) {
      setSelectedDate(new Date(nextMonth.getFullYear(), nextMonth.getMonth(), 1));
    }
  };

  const goToToday = () => {
    const now = new Date();
    setCurrentMonth(new Date(now.getFullYear(), now.getMonth(), 1));
    setSelectedDate(now);
  };

  const openCreateModal = () => {
    setForm({
      title: '',
      type: reminderTypes[0].id,
      date: dateKey,
      time: '09:00',
      notes: '',
    });
    setModalVisible(true);
  };

  const openEditModal = (reminder: remindersRepo.Reminder) => {
    const date = reminder.datetime.slice(0, 10);
    const time = formatTime(reminder.datetime);
    setForm({
      id: reminder.id,
      title: reminder.title,
      type: reminder.type,
      date,
      time,
      notes: reminder.notes ?? '',
    });
    setModalVisible(true);
  };

  const saveReminder = async () => {
    if (!activePetId || !form.title.trim()) return;

    const datetime = buildDateTime(form.date, form.time);

    if (form.id) {
      await remindersRepo.updateReminder(form.id, {
        title: form.title.trim(),
        type: form.type,
        datetime,
        notes: form.notes.trim() || undefined,
      });
    } else {
      await remindersRepo.createReminder({
        petId: activePetId,
        title: form.title.trim(),
        type: form.type,
        datetime,
        notes: form.notes.trim() || undefined,
      });
    }

    setModalVisible(false);
    await loadReminders();
  };

  const removeReminder = async (id: string) => {
    await remindersRepo.deleteReminder(id);
    await loadReminders();
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <View>
            <AppText variant="title">Agenda</AppText>
            <AppText variant="caption" color={colors.textSecondary}>
              Lembretes do seu pet
            </AppText>
          </View>
          <IconButton icon={<Plus size={18} color="white" />} onPress={openCreateModal} variant="primary" />
        </View>

        <Card style={styles.calendarCard}>
          <View style={styles.calendarHeader}>
            <View style={styles.monthNav}>
              <Pressable style={styles.navButton} onPress={() => navigateMonth(-1)}>
                <ChevronLeft size={18} color={colors.textSecondary} />
              </Pressable>
              <AppText variant="subtitle" style={styles.monthLabel}>
                {formatMonthLabel(currentMonth)}
              </AppText>
              <Pressable style={styles.navButton} onPress={() => navigateMonth(1)}>
                <ChevronRight size={18} color={colors.textSecondary} />
              </Pressable>
            </View>
            <Pressable style={styles.todayButton} onPress={goToToday}>
              <CalendarIcon size={14} color={colors.primary} />
              <AppText variant="caption" color={colors.primary}>
                Hoje
              </AppText>
            </Pressable>
          </View>

          <View style={styles.weekRow}>
            {dayLabels.map((label) => (
              <AppText key={label} variant="caption" color={colors.textSecondary} style={styles.weekLabel}>
                {label}
              </AppText>
            ))}
          </View>

          <View style={styles.daysGrid}>
            {monthDays.map((item) => {
              const key = item.date.toISOString();
              const isSelected = formatDateKey(item.date) === dateKey;
              const isToday = formatDateKey(item.date) === formatDateKey(today);
              const isCurrentMonth = item.currentMonth;

              return (
                <Pressable
                  key={key}
                  style={[
                    styles.dayCell,
                    isSelected && styles.dayCellSelected,
                    !isCurrentMonth && styles.dayCellOutside,
                  ]}
                  onPress={() => setSelectedDate(item.date)}
                >
                  <AppText
                    variant="caption"
                    color={isSelected ? '#fff' : isCurrentMonth ? colors.textPrimary : colors.textSecondary}
                    style={isToday && !isSelected ? styles.todayText : undefined}
                  >
                    {item.date.getDate()}
                  </AppText>
                </Pressable>
              );
            })}
          </View>
        </Card>

        <Card style={styles.remindersCard}>
          <View style={styles.remindersHeader}>
            <AppText variant="subtitle">Lembretes do dia</AppText>
            <AppText variant="caption" color={colors.textSecondary}>
              {dateKey}
            </AppText>
          </View>

          {remindersForDay.length === 0 ? (
            <View style={styles.emptyState}>
              <AppText variant="body">Nenhum lembrete</AppText>
              <AppText variant="caption" color={colors.textSecondary}>
                Adicione lembretes para esse dia.
              </AppText>
            </View>
          ) : (
            remindersForDay.map((reminder) => (
              <View key={reminder.id} style={styles.reminderRow}>
                <View style={styles.reminderInfo}>
                  <AppText variant="body" style={styles.reminderTitle}>
                    {reminder.title}
                  </AppText>
                  <AppText variant="caption" color={colors.textSecondary}>
                    {reminder.type} • {formatTime(reminder.datetime)}
                  </AppText>
                  {reminder.notes ? (
                    <AppText variant="caption" color={colors.textSecondary}>
                      {reminder.notes}
                    </AppText>
                  ) : null}
                </View>
                <View style={styles.reminderActions}>
                  <Pressable onPress={() => openEditModal(reminder)} style={styles.iconAction}>
                    <Pencil size={16} color={colors.textSecondary} />
                  </Pressable>
                  <Pressable onPress={() => removeReminder(reminder.id)} style={styles.iconActionDanger}>
                    <Trash2 size={16} color={colors.danger} />
                  </Pressable>
                </View>
              </View>
            ))
          )}
        </Card>
      </ScrollView>

      <Modal visible={modalVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <Pressable style={StyleSheet.absoluteFill} onPress={() => setModalVisible(false)} />
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <AppText variant="subtitle">{form.id ? 'Editar lembrete' : 'Novo lembrete'}</AppText>
              <Pressable onPress={() => setModalVisible(false)}>
                <X size={18} color={colors.textSecondary} />
              </Pressable>
            </View>

            <Input
              label="Título"
              value={form.title}
              onChangeText={(value) => setForm((prev) => ({ ...prev, title: value }))}
              placeholder="Consulta, vacina, banho..."
            />

            <View style={styles.typeRow}>
              {reminderTypes.map((type) => {
                const selected = form.type === type.id;
                return (
                  <Pressable
                    key={type.id}
                    style={[styles.typeChip, selected && styles.typeChipSelected]}
                    onPress={() => setForm((prev) => ({ ...prev, type: type.id }))}
                  >
                    <AppText variant="caption" color={selected ? '#fff' : colors.textSecondary}>
                      {type.label}
                    </AppText>
                  </Pressable>
                );
              })}
            </View>

            <View style={styles.dateRow}>
              <Input
                label="Data (YYYY-MM-DD)"
                value={form.date}
                onChangeText={(value) => setForm((prev) => ({ ...prev, date: value }))}
                placeholder="2026-03-10"
              />
              <Input
                label="Hora (HH:mm)"
                value={form.time}
                onChangeText={(value) => setForm((prev) => ({ ...prev, time: value }))}
                placeholder="09:00"
              />
            </View>

            <Input
              label="Notas"
              value={form.notes}
              onChangeText={(value) => setForm((prev) => ({ ...prev, notes: value }))}
              placeholder="Observações"
              multiline
            />

            <Button label={form.id ? 'Salvar alterações' : 'Criar lembrete'} onPress={saveReminder} />
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
    gap: spacing.lg,
    paddingBottom: spacing['2xl'],
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  calendarCard: {
    gap: spacing.md,
  },
  calendarHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  monthNav: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  monthLabel: {
    textTransform: 'capitalize',
  },
  navButton: {
    width: 32,
    height: 32,
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  todayButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: radii.lg,
    backgroundColor: colors.primarySoft,
  },
  weekRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  weekLabel: {
    width: 32,
    textAlign: 'center',
  },
  daysGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  dayCell: {
    width: 32,
    height: 32,
    borderRadius: radii.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dayCellSelected: {
    backgroundColor: colors.primary,
  },
  dayCellOutside: {
    opacity: 0.4,
  },
  todayText: {
    color: colors.primary,
    fontWeight: '700',
  },
  remindersCard: {
    gap: spacing.md,
  },
  remindersHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  emptyState: {
    gap: spacing.xs,
  },
  reminderRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.md,
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  reminderInfo: {
    flex: 1,
    gap: spacing.xs,
  },
  reminderTitle: {
    fontWeight: '600',
  },
  reminderActions: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  iconAction: {
    width: 32,
    height: 32,
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconActionDanger: {
    width: 32,
    height: 32,
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
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
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  typeRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  typeChip: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: colors.border,
  },
  typeChipSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  dateRow: {
    gap: spacing.sm,
  },
});
