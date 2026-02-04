import React, { useEffect, useMemo, useState } from 'react';
import {
  Image,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import {
  Calendar,
  Check,
  Pencil,
  Plus,
  Scale,
  Scissors,
  Settings,
  Syringe,
  Trash2,
  Users,
  X,
} from 'lucide-react-native';

import { petsRepo, tutorsRepo, vaccinesRepo } from '@/data/repositories';
import { useActivePetStore } from '@/state/activePetStore';
import { colors, radii, spacing } from '@/theme';
import { AppText, Button, Card, IconButton, Input } from '@/ui';

const formatDate = (date?: string | null) => {
  if (!date) return '-';
  const [year, month, day] = date.split('-');
  if (!year || !month || !day) return date;
  return `${day}/${month}/${year}`;
};

type VaccineForm = {
  id?: string;
  name: string;
  appliedAt: string;
  nextDoseAt: string;
  vetName: string;
  notes: string;
};

export default function ProfileScreen() {
  const activePetId = useActivePetStore((state) => state.activePetId);
  const setActivePetId = useActivePetStore((state) => state.setActivePetId);
  const [pet, setPet] = useState<petsRepo.Pet | null>(null);
  const [tutors, setTutors] = useState<tutorsRepo.Tutor[]>([]);
  const [vaccines, setVaccines] = useState<vaccinesRepo.VaccineRecord[]>([]);
  const [tutorModalVisible, setTutorModalVisible] = useState(false);
  const [vaccineModalVisible, setVaccineModalVisible] = useState(false);
  const [newTutorName, setNewTutorName] = useState('');
  const [newTutorRole, setNewTutorRole] = useState('');
  const [vaccineForm, setVaccineForm] = useState<VaccineForm>({
    name: '',
    appliedAt: '',
    nextDoseAt: '',
    vetName: '',
    notes: '',
  });

  const loadData = async () => {
    if (!activePetId) {
      setPet(null);
      setTutors([]);
      setVaccines([]);
      return;
    }

    const [petData, tutorData, vaccineData] = await Promise.all([
      petsRepo.getPetById(activePetId),
      tutorsRepo.getTutorsByPet(activePetId),
      vaccinesRepo.getVaccinesByPet(activePetId),
    ]);

    setPet(petData);
    setTutors(tutorData);
    setVaccines(vaccineData);
  };

  useEffect(() => {
    loadData().catch((error) => console.error('loadProfile', error));
  }, [activePetId]);

  useEffect(() => {
    if (activePetId) return;
    petsRepo
      .getPets()
      .then((list) => {
        if (list[0]) {
          setActivePetId(list[0].id);
        }
      })
      .catch((error) => console.error('loadPetsForProfile', error));
  }, [activePetId, setActivePetId]);

  const stats = useMemo(() => {
    if (!pet) return [];
    return [
      {
        label: 'Peso',
        value: pet.weightKg ? `${pet.weightKg} kg` : '-',
        icon: Scale,
        accent: colors.primary,
      },
      {
        label: 'Nascimento',
        value: pet.birthDate ? formatDate(pet.birthDate) : '-',
        icon: Calendar,
        accent: '#F97316',
      },
      {
        label: 'Castrado',
        value: pet.neutered ? 'Sim' : 'Não',
        icon: Scissors,
        accent: '#8B5CF6',
      },
    ];
  }, [pet]);

  const handleAddTutor = async () => {
    if (!activePetId || !newTutorName.trim()) return;

    await tutorsRepo.createTutor({
      petId: activePetId,
      name: newTutorName.trim(),
      role: newTutorRole.trim() || undefined,
    });

    setNewTutorName('');
    setNewTutorRole('');
    await loadData();
  };

  const handleRemoveTutor = async (id: string) => {
    await tutorsRepo.deleteTutor(id);
    await loadData();
  };

  const openCreateVaccine = () => {
    setVaccineForm({
      name: '',
      appliedAt: '',
      nextDoseAt: '',
      vetName: '',
      notes: '',
    });
    setVaccineModalVisible(true);
  };

  const openEditVaccine = (vaccine: vaccinesRepo.VaccineRecord) => {
    setVaccineForm({
      id: vaccine.id,
      name: vaccine.name,
      appliedAt: vaccine.appliedAt,
      nextDoseAt: vaccine.nextDoseAt ?? '',
      vetName: vaccine.vetName ?? '',
      notes: vaccine.notes ?? '',
    });
    setVaccineModalVisible(true);
  };

  const saveVaccine = async () => {
    if (!activePetId || !vaccineForm.name.trim() || !vaccineForm.appliedAt.trim()) return;

    const payload = {
      name: vaccineForm.name.trim(),
      appliedAt: vaccineForm.appliedAt.trim(),
      nextDoseAt: vaccineForm.nextDoseAt.trim() || undefined,
      vetName: vaccineForm.vetName.trim() || undefined,
      notes: vaccineForm.notes.trim() || undefined,
    };

    if (vaccineForm.id) {
      await vaccinesRepo.updateVaccine(vaccineForm.id, payload);
    } else {
      await vaccinesRepo.createVaccine({
        petId: activePetId,
        ...payload,
      });
    }

    setVaccineModalVisible(false);
    await loadData();
  };

  const removeVaccine = async (id: string) => {
    await vaccinesRepo.deleteVaccine(id);
    await loadData();
  };

  if (!pet) {
    return (
      <View style={styles.emptyState}>
        <AppText variant="title">Perfil</AppText>
        <AppText variant="body" color={colors.textSecondary}>
          Nenhum pet ativo selecionado.
        </AppText>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <AppText variant="title">Perfil do Pet</AppText>
          <IconButton icon={<Settings size={18} color={colors.textSecondary} />} onPress={() => {}} />
        </View>

        <Card style={styles.heroCard}>
          <View style={styles.heroRow}>
            {pet.photoUri ? (
              <Image source={{ uri: pet.photoUri }} style={styles.heroImage} />
            ) : (
              <View style={styles.heroImagePlaceholder} />
            )}
            <View style={styles.heroInfo}>
              <AppText variant="subtitle">{pet.name}</AppText>
              <AppText variant="caption" color={colors.textSecondary}>
                {pet.breed ?? 'Sem raça definida'}
              </AppText>
              <View style={styles.heroTags}>
                <View style={styles.heroTag}>
                  <AppText variant="caption" color={colors.primary}>
                    {pet.species}
                  </AppText>
                </View>
                <View style={styles.heroTagMuted}>
                  <AppText variant="caption" color={colors.textSecondary}>
                    {pet.sex ?? 'Sexo não informado'}
                  </AppText>
                </View>
              </View>
            </View>
            <Pressable style={styles.heroEdit}>
              <Pencil size={16} color={colors.primary} />
            </Pressable>
          </View>
        </Card>

        <View style={styles.statsRow}>
          {stats.map((stat) => {
            const Icon = stat.icon;
            return (
              <View key={stat.label} style={styles.statCard}>
                <View style={[styles.statIcon, { backgroundColor: `${stat.accent}1A` }]}> 
                  <Icon size={16} color={stat.accent} />
                </View>
                <AppText variant="body" style={styles.statValue}>
                  {stat.value}
                </AppText>
                <AppText variant="caption" color={colors.textSecondary}>
                  {stat.label}
                </AppText>
              </View>
            );
          })}
        </View>

        <Card style={styles.sectionCard}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionTitleRow}>
              <Users size={18} color={colors.primary} />
              <AppText variant="subtitle">Tutores</AppText>
            </View>
            <Pressable onPress={() => setTutorModalVisible(true)}>
              <AppText variant="caption" color={colors.primary}>
                Gerenciar
              </AppText>
            </Pressable>
          </View>

          {tutors.length === 0 ? (
            <AppText variant="caption" color={colors.textSecondary}>
              Nenhum tutor cadastrado.
            </AppText>
          ) : (
            tutors.map((tutor) => (
              <View key={tutor.id} style={styles.tutorRow}>
                <View>
                  <AppText variant="body" style={styles.tutorName}>
                    {tutor.name}
                  </AppText>
                  <AppText variant="caption" color={colors.textSecondary}>
                    {tutor.role ?? 'Tutor'}
                  </AppText>
                </View>
                <Check size={16} color={colors.primary} />
              </View>
            ))
          )}
        </Card>

        <Card style={styles.sectionCard}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionTitleRow}>
              <Syringe size={18} color={colors.primary} />
              <AppText variant="subtitle">Carteira de vacinação</AppText>
            </View>
            <Pressable style={styles.addVaccine} onPress={openCreateVaccine}>
              <Plus size={14} color={colors.primary} />
              <AppText variant="caption" color={colors.primary}>
                Adicionar
              </AppText>
            </Pressable>
          </View>

          {vaccines.length === 0 ? (
            <AppText variant="caption" color={colors.textSecondary}>
              Nenhuma vacina cadastrada.
            </AppText>
          ) : (
            vaccines.map((vaccine) => (
              <View key={vaccine.id} style={styles.vaccineRow}>
                <View style={styles.vaccineInfo}>
                  <AppText variant="body" style={styles.vaccineTitle}>
                    {vaccine.name}
                  </AppText>
                  <AppText variant="caption" color={colors.textSecondary}>
                    Aplicada: {formatDate(vaccine.appliedAt)}
                  </AppText>
                  <AppText variant="caption" color={colors.textSecondary}>
                    Próxima: {formatDate(vaccine.nextDoseAt)}
                  </AppText>
                  {vaccine.vetName ? (
                    <AppText variant="caption" color={colors.textSecondary}>
                      Vet: {vaccine.vetName}
                    </AppText>
                  ) : null}
                </View>
                <View style={styles.reminderActions}>
                  <Pressable onPress={() => openEditVaccine(vaccine)} style={styles.iconAction}>
                    <Pencil size={16} color={colors.textSecondary} />
                  </Pressable>
                  <Pressable onPress={() => removeVaccine(vaccine.id)} style={styles.iconActionDanger}>
                    <Trash2 size={16} color={colors.danger} />
                  </Pressable>
                </View>
              </View>
            ))
          )}
        </Card>
      </ScrollView>

      <Modal visible={tutorModalVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <Pressable style={StyleSheet.absoluteFill} onPress={() => setTutorModalVisible(false)} />
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <AppText variant="subtitle">Gerenciar tutores</AppText>
              <Pressable onPress={() => setTutorModalVisible(false)}>
                <X size={18} color={colors.textSecondary} />
              </Pressable>
            </View>

            <Input
              label="Nome"
              value={newTutorName}
              onChangeText={setNewTutorName}
              placeholder="Nome do tutor"
            />
            <Input
              label="Relação"
              value={newTutorRole}
              onChangeText={setNewTutorRole}
              placeholder="Ex.: Dona"
            />
            <Button label="Adicionar tutor" onPress={handleAddTutor} />

            <View style={styles.modalList}>
              {tutors.map((tutor) => (
                <View key={tutor.id} style={styles.modalRow}>
                  <View>
                    <AppText variant="body">{tutor.name}</AppText>
                    <AppText variant="caption" color={colors.textSecondary}>
                      {tutor.role ?? 'Tutor'}
                    </AppText>
                  </View>
                  <Pressable onPress={() => handleRemoveTutor(tutor.id)} style={styles.iconActionDanger}>
                    <Trash2 size={16} color={colors.danger} />
                  </Pressable>
                </View>
              ))}
            </View>
          </View>
        </View>
      </Modal>

      <Modal visible={vaccineModalVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <Pressable style={StyleSheet.absoluteFill} onPress={() => setVaccineModalVisible(false)} />
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <AppText variant="subtitle">{vaccineForm.id ? 'Editar vacina' : 'Nova vacina'}</AppText>
              <Pressable onPress={() => setVaccineModalVisible(false)}>
                <X size={18} color={colors.textSecondary} />
              </Pressable>
            </View>

            <Input
              label="Nome"
              value={vaccineForm.name}
              onChangeText={(value) => setVaccineForm((prev) => ({ ...prev, name: value }))}
              placeholder="Ex.: V10"
            />
            <Input
              label="Data aplicada (YYYY-MM-DD)"
              value={vaccineForm.appliedAt}
              onChangeText={(value) => setVaccineForm((prev) => ({ ...prev, appliedAt: value }))}
              placeholder="2025-10-10"
            />
            <Input
              label="Próxima dose (opcional)"
              value={vaccineForm.nextDoseAt}
              onChangeText={(value) => setVaccineForm((prev) => ({ ...prev, nextDoseAt: value }))}
              placeholder="2026-10-10"
            />
            <Input
              label="Veterinário"
              value={vaccineForm.vetName}
              onChangeText={(value) => setVaccineForm((prev) => ({ ...prev, vetName: value }))}
              placeholder="Clínica ou nome"
            />
            <Input
              label="Notas"
              value={vaccineForm.notes}
              onChangeText={(value) => setVaccineForm((prev) => ({ ...prev, notes: value }))}
              placeholder="Observações"
              multiline
            />

            <Button label={vaccineForm.id ? 'Salvar alterações' : 'Salvar vacina'} onPress={saveVaccine} />
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
  emptyState: {
    flex: 1,
    backgroundColor: colors.background,
    padding: spacing.xl,
    gap: spacing.sm,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  heroCard: {
    padding: spacing.lg,
  },
  heroRow: {
    flexDirection: 'row',
    gap: spacing.md,
    alignItems: 'center',
  },
  heroImage: {
    width: 72,
    height: 72,
    borderRadius: radii.pill,
  },
  heroImagePlaceholder: {
    width: 72,
    height: 72,
    borderRadius: radii.pill,
    backgroundColor: colors.surfaceMuted,
  },
  heroInfo: {
    flex: 1,
    gap: spacing.xs,
  },
  heroTags: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.xs,
  },
  heroTag: {
    backgroundColor: colors.primarySoft,
    borderRadius: radii.pill,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
  },
  heroTagMuted: {
    backgroundColor: colors.surfaceMuted,
    borderRadius: radii.pill,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
  },
  heroEdit: {
    width: 36,
    height: 36,
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statsRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  statCard: {
    flex: 1,
    padding: spacing.md,
    borderRadius: radii.lg,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    gap: spacing.xs,
    alignItems: 'center',
  },
  statIcon: {
    width: 32,
    height: 32,
    borderRadius: radii.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statValue: {
    fontWeight: '600',
  },
  sectionCard: {
    gap: spacing.md,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sectionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  tutorRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  tutorName: {
    fontWeight: '600',
  },
  addVaccine: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  vaccineRow: {
    flexDirection: 'row',
    gap: spacing.md,
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  vaccineInfo: {
    flex: 1,
    gap: spacing.xs,
  },
  vaccineTitle: {
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
  modalList: {
    gap: spacing.sm,
  },
  modalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
});
