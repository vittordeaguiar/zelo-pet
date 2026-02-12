import React, { useEffect, useMemo, useState } from 'react';
import {
  Alert,
  ActivityIndicator,
  ActionSheetIOS,
  Image,
  LayoutAnimation,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  Share,
  StyleSheet,
  UIManager,
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

import Constants from 'expo-constants';

import { exportDatabase, importDatabase } from '@/data/backup';
import { resetAppData } from '@/data/reset';
import { activitiesRepo, petsRepo, tutorsRepo, vaccinesRepo } from '@/data/repositories';
import { useActivePetStore } from '@/state/activePetStore';
import { useAppStore } from '@/state/appStore';
import { ACCENT_OPTIONS, ThemeMode, useThemeStore } from '@/state/themeStore';
import { colors, radii, spacing } from '@/theme';
import { useThemeColors } from '@/theme';
import {
  AppText,
  Button,
  Card,
  IconButton,
  Input,
  KeyboardAvoider,
  ScreenFade,
  isValidDateString,
  launchCamera,
  launchImageLibrary,
  maskDate,
  maskNumber,
  parseLocalizedNumber,
  useScreenPadding,
  useToast,
} from '@/ui';
import {
  clearCachedWeather,
  clearLocationPreference,
  geocodeLocation,
  loadLocationPreference,
  saveLocationPreference,
} from '@/features/agenda/weather';
import { DEFAULT_ACTIVITY_TEMPLATES } from '@/features/home/activityDefaults';

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

const THEME_MODE_OPTIONS: Array<{ id: ThemeMode; label: string }> = [
  { id: 'system', label: 'Sistema' },
  { id: 'light', label: 'Claro' },
  { id: 'dark', label: 'Escuro' },
];

export default function ProfileScreen() {
  const activePetId = useActivePetStore((state) => state.activePetId);
  const setActivePetId = useActivePetStore((state) => state.setActivePetId);
  const setNeedsOnboarding = useAppStore((state) => state.setNeedsOnboarding);
  const accentId = useThemeStore((state) => state.accentId);
  const setAccentId = useThemeStore((state) => state.setAccentId);
  const themeMode = useThemeStore((state) => state.themeMode);
  const setThemeMode = useThemeStore((state) => state.setThemeMode);
  const themeColors = useThemeColors();
  const screenPadding = useScreenPadding();
  const toast = useToast();
  const [pet, setPet] = useState<petsRepo.Pet | null>(null);
  const [pets, setPets] = useState<petsRepo.Pet[]>([]);
  const [tutors, setTutors] = useState<tutorsRepo.Tutor[]>([]);
  const [vaccines, setVaccines] = useState<vaccinesRepo.VaccineRecord[]>([]);
  const [tutorModalVisible, setTutorModalVisible] = useState(false);
  const [vaccineModalVisible, setVaccineModalVisible] = useState(false);
  const [settingsVisible, setSettingsVisible] = useState(false);
  const [backupModalVisible, setBackupModalVisible] = useState(false);
  const [importModalVisible, setImportModalVisible] = useState(false);
  const [backupPayload, setBackupPayload] = useState('');
  const [backupLoading, setBackupLoading] = useState(false);
  const [importPayload, setImportPayload] = useState('');
  const [importLoading, setImportLoading] = useState(false);
  const [petsModalVisible, setPetsModalVisible] = useState(false);
  const [petFormVisible, setPetFormVisible] = useState(false);
  const [editingPet, setEditingPet] = useState<petsRepo.Pet | null>(null);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [petForm, setPetForm] = useState({
    name: '',
    species: 'Cão',
    breed: '',
    sex: 'Macho',
    birthDate: '',
    weightKg: '',
    neutered: null as boolean | null,
    photoUri: null as string | null,
  });
  const [tutorProfileVisible, setTutorProfileVisible] = useState(false);
  const [tutorProfile, setTutorProfile] = useState({ name: '', role: 'Dono' });
  const [weatherLocation, setWeatherLocation] = useState<string>('');
  const [manualWeatherLocation, setManualWeatherLocation] = useState('');
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
    setLoadingProfile(true);
    try {
      if (!activePetId) {
        setPet(null);
        setTutors([]);
        setVaccines([]);
        return;
      }

      const [petData, petsData, tutorData, vaccineData] = await Promise.all([
        petsRepo.getPetById(activePetId),
        petsRepo.getPets(),
        tutorsRepo.getTutorsByPet(activePetId),
        vaccinesRepo.getVaccinesByPet(activePetId),
      ]);

      if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
        UIManager.setLayoutAnimationEnabledExperimental(true);
      }
      LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
      setPet(petData);
      setPets(petsData);
      setTutors(tutorData);
      setVaccines(vaccineData);
    } finally {
      setLoadingProfile(false);
    }
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

  useEffect(() => {
    loadLocationPreference()
      .then((stored) => setWeatherLocation(stored?.label ?? 'Não definido'))
      .catch((error) => console.error('loadWeatherLocation', error));
  }, []);

  const stats = useMemo(() => {
    if (!pet) return [];
    return [
      {
        label: 'Peso',
        value: pet.weightKg ? `${pet.weightKg} kg` : '-',
        icon: Scale,
        accent: themeColors.primary,
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

  const openPetForm = (petToEdit?: petsRepo.Pet) => {
    if (petToEdit) {
      setEditingPet(petToEdit);
      setPetForm({
        name: petToEdit.name,
        species: petToEdit.species,
        breed: petToEdit.breed ?? '',
        sex: petToEdit.sex ?? 'Macho',
        birthDate: petToEdit.birthDate ?? '',
        weightKg: petToEdit.weightKg ? String(petToEdit.weightKg) : '',
        neutered: petToEdit.neutered ?? null,
        photoUri: petToEdit.photoUri ?? null,
      });
    } else {
      setEditingPet(null);
      setPetForm({
        name: '',
        species: 'Cão',
        breed: '',
        sex: 'Macho',
        birthDate: '',
        weightKg: '',
        neutered: null,
        photoUri: null,
      });
    }
    setPetFormVisible(true);
  };

  const pickPetPhoto = async () => {
    const uri = await launchImageLibrary({ aspect: [1, 1], allowsEditing: true, quality: 0.8 });
    if (uri) {
      setPetForm((prev) => ({ ...prev, photoUri: uri }));
    }
  };

  const takePetPhoto = async () => {
    const uri = await launchCamera({ aspect: [1, 1], allowsEditing: true, quality: 0.8 });
    if (uri) {
      setPetForm((prev) => ({ ...prev, photoUri: uri }));
    }
  };

  const openPetPhotoOptions = () => {
    if (Platform.OS === 'ios') {
      ActionSheetIOS.showActionSheetWithOptions(
        {
          options: ['Cancelar', 'Tirar foto', 'Escolher da galeria'],
          cancelButtonIndex: 0,
        },
        (buttonIndex) => {
          if (buttonIndex === 1) takePetPhoto();
          if (buttonIndex === 2) pickPetPhoto();
        },
      );
      return;
    }
    Alert.alert('Adicionar foto', 'Escolha uma opção', [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Tirar foto', onPress: takePetPhoto },
      { text: 'Escolher da galeria', onPress: pickPetPhoto },
    ]);
  };

  const savePetForm = async () => {
    if (!petForm.name.trim()) return;
    if (petForm.birthDate && !isValidDateString(petForm.birthDate)) {
      Alert.alert('Data inválida', 'Informe uma data válida no formato YYYY-MM-DD.');
      return;
    }
    const weight = petForm.weightKg.trim() ? parseLocalizedNumber(petForm.weightKg) : undefined;

    if (editingPet) {
      await petsRepo.updatePet(editingPet.id, {
        name: petForm.name.trim(),
        species: petForm.species,
        breed: petForm.breed.trim() || undefined,
        sex: petForm.sex,
        birthDate: petForm.birthDate.trim() || undefined,
        weightKg: Number.isNaN(weight) ? undefined : weight,
        neutered: petForm.neutered ?? undefined,
        photoUri: petForm.photoUri ?? undefined,
      });
      toast.show('Pet atualizado', 'success');
    } else {
      const created = await petsRepo.createPet({
        name: petForm.name.trim(),
        species: petForm.species,
        breed: petForm.breed.trim() || undefined,
        sex: petForm.sex,
        birthDate: petForm.birthDate.trim() || undefined,
        weightKg: Number.isNaN(weight) ? undefined : weight,
        neutered: petForm.neutered ?? undefined,
        photoUri: petForm.photoUri ?? undefined,
      });
      setActivePetId(created.id);
      toast.show('Pet cadastrado', 'success');
    }

    setPetFormVisible(false);
    await loadData();
  };

  const deletePet = async (petId: string) => {
    await petsRepo.deletePet(petId);
    if (activePetId === petId) {
      const remaining = await petsRepo.getPets();
      if (remaining[0]) {
        setActivePetId(remaining[0].id);
      } else {
        setActivePetId(null);
        setNeedsOnboarding(true);
      }
    }
    await loadData();
    toast.show('Pet removido', 'info');
  };

  const openTutorProfile = () => {
    const current = tutors[0];
    setTutorProfile({
      name: current?.name ?? '',
      role: current?.role ?? 'Dono',
    });
    setTutorProfileVisible(true);
  };

  const saveTutorProfile = async () => {
    if (!activePetId || !tutorProfile.name.trim()) return;
    const current = tutors[0];
    if (current) {
      await tutorsRepo.updateTutor(current.id, {
        name: tutorProfile.name.trim(),
        role: tutorProfile.role.trim() || undefined,
      });
    } else {
      await tutorsRepo.createTutor({
        petId: activePetId,
        name: tutorProfile.name.trim(),
        role: tutorProfile.role.trim() || undefined,
      });
    }
    setTutorProfileVisible(false);
    await loadData();
    toast.show('Tutor atualizado', 'success');
  };

  const resetDefaultActivities = async () => {
    if (!activePetId) return;
    await activitiesRepo.deleteTemplatesByPet(activePetId);
    for (const template of DEFAULT_ACTIVITY_TEMPLATES) {
      await activitiesRepo.createTemplate({
        petId: activePetId,
        title: template.title,
        icon: template.icon,
        targetCountPerDay: template.targetCountPerDay,
        isTimer: template.isTimer,
        sortOrder: template.sortOrder,
      });
    }
    toast.show('Checklist restaurado', 'success');
  };

  const updateWeatherLocation = async () => {
    if (!manualWeatherLocation.trim()) return;
    try {
      const geo = await geocodeLocation(manualWeatherLocation.trim());
      if (!geo) {
        toast.show('Não encontrei esse lugar', 'info');
        return;
      }
      await saveLocationPreference(geo.latitude, geo.longitude, geo.label);
      setWeatherLocation(geo.label);
      setManualWeatherLocation('');
      toast.show('Localização atualizada', 'success');
    } catch {
      toast.show('Sem conexão no momento', 'error');
    }
  };

  const clearWeatherCache = async () => {
    await clearCachedWeather();
    await clearLocationPreference();
    setWeatherLocation('Não definido');
    toast.show('Cache do clima limpo', 'info');
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
    if (!isValidDateString(vaccineForm.appliedAt)) {
      Alert.alert('Data inválida', 'Informe uma data válida no formato YYYY-MM-DD.');
      return;
    }
    if (vaccineForm.nextDoseAt && !isValidDateString(vaccineForm.nextDoseAt)) {
      Alert.alert('Data inválida', 'Informe uma data válida no formato YYYY-MM-DD.');
      return;
    }

    const payload = {
      name: vaccineForm.name.trim(),
      appliedAt: vaccineForm.appliedAt.trim(),
      nextDoseAt: vaccineForm.nextDoseAt.trim() || undefined,
      vetName: vaccineForm.vetName.trim() || undefined,
      notes: vaccineForm.notes.trim() || undefined,
    };

    if (vaccineForm.id) {
      await vaccinesRepo.updateVaccine(vaccineForm.id, payload);
      toast.show('Vacina atualizada', 'success');
    } else {
      await vaccinesRepo.createVaccine({
        petId: activePetId,
        ...payload,
      });
      toast.show('Vacina cadastrada', 'success');
    }

    setVaccineModalVisible(false);
    await loadData();
  };

  const removeVaccine = async (id: string) => {
    await vaccinesRepo.deleteVaccine(id);
    await loadData();
    toast.show('Vacina removida', 'info');
  };

  const handleResetApp = async () => {
    Alert.alert(
      'Resetar aplicativo?',
      'Isso apagará todos os dados locais e reiniciará o onboarding.',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Resetar',
          style: 'destructive',
          onPress: async () => {
            await resetAppData();
            setActivePetId(null);
            setNeedsOnboarding(true);
            setSettingsVisible(false);
          },
        },
      ],
    );
  };

  const openBackupModal = async () => {
    setBackupModalVisible(true);
    setBackupLoading(true);
    try {
      const payload = await exportDatabase();
      setBackupPayload(payload);
    } finally {
      setBackupLoading(false);
    }
  };

  const shareBackup = async () => {
    if (!backupPayload) return;
    await Share.share({ message: backupPayload });
  };

  const handleImportBackup = async () => {
    if (!importPayload.trim()) return;
    Alert.alert('Importar backup?', 'Isso substituirá seus dados atuais.', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Importar',
        style: 'destructive',
        onPress: async () => {
          setImportLoading(true);
          try {
            await importDatabase(importPayload, { overwrite: true });
            const updatedPets = await petsRepo.getPets();
            if (updatedPets[0]) {
              setActivePetId(updatedPets[0].id);
            }
            setNeedsOnboarding(updatedPets.length === 0);
            setImportPayload('');
            setImportModalVisible(false);
            await loadData();
            toast.show('Backup importado', 'success');
          } catch (error) {
            Alert.alert('Erro ao importar', 'Verifique se o conteúdo está correto.');
            toast.show('Falha ao importar backup', 'error');
          } finally {
            setImportLoading(false);
          }
        },
      },
    ]);
  };

  if (!pet) {
    return (
      <View style={[styles.emptyState, { backgroundColor: themeColors.background }]}>
        <AppText variant="title">Perfil</AppText>
        <AppText variant="body" color={themeColors.textSecondary}>
          Nenhum pet ativo por aqui.
        </AppText>
        {loadingProfile ? <ActivityIndicator /> : null}
      </View>
    );
  }

  return (
    <ScreenFade style={[styles.container, { backgroundColor: themeColors.background }]}>
      <ScrollView
        contentContainerStyle={[styles.content, screenPadding]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <AppText variant="title">Perfil do Pet</AppText>
          <IconButton
            icon={<Settings size={18} color={themeColors.textSecondary} />}
            onPress={() => setSettingsVisible(true)}
            accessibilityLabel="Abrir configurações"
          />
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
                <View style={[styles.heroTag, { backgroundColor: themeColors.primarySoft }]}>
                  <AppText variant="caption" color={themeColors.primary}>
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
            <Pressable
              style={styles.heroEdit}
              onPress={() => openPetForm(pet)}
              accessibilityLabel="Editar pet"
            >
              <Pencil size={16} color={themeColors.primary} />
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
              <Users size={18} color={themeColors.primary} />
              <AppText variant="subtitle">Tutores</AppText>
            </View>
            <Pressable onPress={() => setTutorModalVisible(true)}>
              <AppText variant="caption" color={themeColors.primary}>
                Gerenciar
              </AppText>
            </Pressable>
          </View>

          {tutors.length === 0 ? (
            <AppText variant="caption" color={colors.textSecondary}>
              Sem tutores por aqui.
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
                <Check size={16} color={themeColors.primary} />
              </View>
            ))
          )}
        </Card>

        <Card style={styles.sectionCard}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionTitleRow}>
              <Syringe size={18} color={themeColors.primary} />
              <AppText variant="subtitle">Carteira de vacinação</AppText>
            </View>
            <Pressable style={styles.addVaccine} onPress={openCreateVaccine}>
              <Plus size={14} color={themeColors.primary} />
              <AppText variant="caption" color={themeColors.primary}>
                Adicionar
              </AppText>
            </Pressable>
          </View>

          {vaccines.length === 0 ? (
            <AppText variant="caption" color={colors.textSecondary}>
              Sem vacinas registradas.
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
                  <Pressable
                    onPress={() => removeVaccine(vaccine.id)}
                    style={styles.iconActionDanger}
                  >
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
          <KeyboardAvoider style={styles.modalContent}>
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
                  <Pressable
                    onPress={() => handleRemoveTutor(tutor.id)}
                    style={styles.iconActionDanger}
                  >
                    <Trash2 size={16} color={colors.danger} />
                  </Pressable>
                </View>
              ))}
            </View>
          </KeyboardAvoider>
        </View>
      </Modal>

      <Modal visible={vaccineModalVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <Pressable
            style={StyleSheet.absoluteFill}
            onPress={() => setVaccineModalVisible(false)}
          />
          <KeyboardAvoider style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <AppText variant="subtitle">
                {vaccineForm.id ? 'Editar vacina' : 'Nova vacina'}
              </AppText>
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
              onChangeText={(value) =>
                setVaccineForm((prev) => ({ ...prev, appliedAt: maskDate(value) }))
              }
              placeholder="2025-10-10"
            />
            <Input
              label="Próxima dose (opcional)"
              value={vaccineForm.nextDoseAt}
              onChangeText={(value) =>
                setVaccineForm((prev) => ({ ...prev, nextDoseAt: maskDate(value) }))
              }
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

            <Button
              label={vaccineForm.id ? 'Salvar alterações' : 'Salvar vacina'}
              onPress={saveVaccine}
            />
          </KeyboardAvoider>
        </View>
      </Modal>

      <Modal visible={settingsVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <Pressable style={StyleSheet.absoluteFill} onPress={() => setSettingsVisible(false)} />
          <KeyboardAvoider style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <AppText variant="subtitle">Configurações</AppText>
              <Pressable onPress={() => setSettingsVisible(false)}>
                <X size={18} color={colors.textSecondary} />
              </Pressable>
            </View>

            <ScrollView contentContainerStyle={styles.settingsList}>
              <View style={styles.settingsSection}>
                <AppText variant="caption" color={colors.textSecondary}>
                  Perfil
                </AppText>
                <Pressable style={styles.settingsRow} onPress={openTutorProfile}>
                  <View>
                    <AppText variant="body">Perfil do tutor</AppText>
                    <AppText variant="caption" color={colors.textSecondary}>
                      {tutorProfile.name || tutors[0]?.name || 'Editar nome e relação'}
                    </AppText>
                  </View>
                </Pressable>
                <Pressable style={styles.settingsRow} onPress={() => setPetsModalVisible(true)}>
                  <View>
                    <AppText variant="body">Pets</AppText>
                    <AppText variant="caption" color={colors.textSecondary}>
                      Gerenciar pets cadastrados
                    </AppText>
                  </View>
                </Pressable>
              </View>

              <View style={styles.settingsSection}>
                <AppText variant="caption" color={colors.textSecondary}>
                  Checklist
                </AppText>
                <Pressable style={styles.settingsRow} onPress={resetDefaultActivities}>
                  <View>
                    <AppText variant="body">Restaurar atividades padrão</AppText>
                    <AppText variant="caption" color={colors.textSecondary}>
                      Recria a lista inicial do checklist
                    </AppText>
                  </View>
                </Pressable>
              </View>

              <View style={styles.settingsSection}>
                <AppText variant="caption" color={themeColors.textSecondary}>
                  Aparência
                </AppText>
                <View style={styles.accentRow}>
                  {ACCENT_OPTIONS.map((accent) => {
                    const selected = accentId === accent.id;
                    return (
                      <Pressable
                        key={accent.id}
                        onPress={() => setAccentId(accent.id)}
                        style={[
                          styles.accentChip,
                          { backgroundColor: accent.primarySoft, borderColor: accent.primary },
                          selected && styles.accentChipSelected,
                        ]}
                      >
                        <View style={[styles.accentDot, { backgroundColor: accent.primary }]} />
                        <AppText variant="caption" color={themeColors.textSecondary}>
                          {accent.label}
                        </AppText>
                      </Pressable>
                    );
                  })}
                </View>
                <View style={styles.modeRow}>
                  {THEME_MODE_OPTIONS.map((modeOption) => {
                    const selected = themeMode === modeOption.id;
                    return (
                      <Pressable
                        key={modeOption.id}
                        onPress={() => setThemeMode(modeOption.id)}
                        style={[
                          styles.modeChip,
                          { borderColor: themeColors.border, backgroundColor: themeColors.surface },
                          selected && styles.modeChipSelected,
                          selected && { borderColor: themeColors.primary },
                        ]}
                      >
                        <AppText
                          variant="caption"
                          color={selected ? themeColors.primary : themeColors.textSecondary}
                        >
                          {modeOption.label}
                        </AppText>
                      </Pressable>
                    );
                  })}
                </View>
              </View>

              <View style={styles.settingsSection}>
                <AppText variant="caption" color={colors.textSecondary}>
                  Notificações
                </AppText>
                <View style={styles.settingsRowDisabled}>
                  <View>
                    <AppText variant="body">Lembretes e vacinas</AppText>
                    <AppText variant="caption" color={colors.textSecondary}>
                      Em breve
                    </AppText>
                  </View>
                </View>
              </View>

              <View style={styles.settingsSection}>
                <AppText variant="caption" color={colors.textSecondary}>
                  Clima e localização
                </AppText>
                <View style={styles.settingsRow}>
                  <View>
                    <AppText variant="body">Localização atual</AppText>
                    <AppText variant="caption" color={colors.textSecondary}>
                      {weatherLocation}
                    </AppText>
                  </View>
                </View>
                <View style={styles.settingsRowInline}>
                  <View style={styles.settingsInlineInput}>
                    <Input
                      value={manualWeatherLocation}
                      onChangeText={setManualWeatherLocation}
                      placeholder="Atualizar cidade"
                    />
                  </View>
                  <Button label="Salvar" onPress={updateWeatherLocation} size="sm" />
                </View>
                <Pressable style={styles.settingsRow} onPress={clearWeatherCache}>
                  <View>
                    <AppText variant="body">Limpar cache do clima</AppText>
                    <AppText variant="caption" color={colors.textSecondary}>
                      Força uma nova atualização
                    </AppText>
                  </View>
                </Pressable>
              </View>

              <View style={styles.settingsSection}>
                <AppText variant="caption" color={colors.textSecondary}>
                  Privacidade
                </AppText>
                <Pressable style={styles.settingsRow} onPress={openBackupModal}>
                  <View>
                    <AppText variant="body">Exportar dados</AppText>
                    <AppText variant="caption" color={colors.textSecondary}>
                      Salve um backup em JSON
                    </AppText>
                  </View>
                </Pressable>
                <Pressable style={styles.settingsRow} onPress={() => setImportModalVisible(true)}>
                  <View>
                    <AppText variant="body">Importar dados</AppText>
                    <AppText variant="caption" color={colors.textSecondary}>
                      Restaurar de um backup
                    </AppText>
                  </View>
                </Pressable>
                <Pressable style={styles.settingsRow} onPress={handleResetApp}>
                  <View>
                    <AppText variant="body" style={styles.resetTitle}>
                      Resetar aplicativo
                    </AppText>
                    <AppText variant="caption" color={colors.textSecondary}>
                      Apaga todos os dados locais
                    </AppText>
                  </View>
                </Pressable>
              </View>

              <View style={styles.settingsSection}>
                <AppText variant="caption" color={colors.textSecondary}>
                  Sobre
                </AppText>
                <View style={styles.settingsRow}>
                  <View>
                    <AppText variant="body">Versão</AppText>
                    <AppText variant="caption" color={colors.textSecondary}>
                      {Constants.expoConfig?.version ?? '1.0.0'}
                    </AppText>
                  </View>
                </View>
              </View>
            </ScrollView>
          </KeyboardAvoider>
        </View>
      </Modal>

      <Modal visible={petsModalVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <Pressable style={StyleSheet.absoluteFill} onPress={() => setPetsModalVisible(false)} />
          <KeyboardAvoider style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <AppText variant="subtitle">Pets</AppText>
              <Pressable onPress={() => setPetsModalVisible(false)}>
                <X size={18} color={colors.textSecondary} />
              </Pressable>
            </View>

            <ScrollView contentContainerStyle={styles.modalList}>
              {pets.map((item) => (
                <View key={item.id} style={styles.modalRow}>
                  <Pressable onPress={() => setActivePetId(item.id)} style={styles.modalRowInfo}>
                    <AppText variant="body">{item.name}</AppText>
                    <AppText variant="caption" color={colors.textSecondary}>
                      {item.species} • {item.breed ?? 'Sem raça'}
                    </AppText>
                  </Pressable>
                  <View style={styles.manageActions}>
                    <Pressable onPress={() => openPetForm(item)} style={styles.iconAction}>
                      <Pencil size={16} color={colors.textSecondary} />
                    </Pressable>
                    <Pressable onPress={() => deletePet(item.id)} style={styles.iconActionDanger}>
                      <Trash2 size={16} color={colors.danger} />
                    </Pressable>
                  </View>
                </View>
              ))}
            </ScrollView>

            <Button label="Adicionar pet" onPress={() => openPetForm()} />
          </KeyboardAvoider>
        </View>
      </Modal>

      <Modal visible={petFormVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <Pressable style={StyleSheet.absoluteFill} onPress={() => setPetFormVisible(false)} />
          <KeyboardAvoider style={styles.modalContent}>
            <ScrollView
              contentContainerStyle={styles.modalContentInner}
              keyboardShouldPersistTaps="handled"
            >
              <View style={styles.modalHeader}>
                <AppText variant="subtitle">{editingPet ? 'Editar pet' : 'Novo pet'}</AppText>
                <Pressable onPress={() => setPetFormVisible(false)}>
                  <X size={18} color={colors.textSecondary} />
                </Pressable>
              </View>

              <Pressable
                style={styles.photoButton}
                onPress={openPetPhotoOptions}
                accessibilityRole="button"
                accessibilityLabel="Adicionar foto do pet"
              >
                {petForm.photoUri ? (
                  <Image source={{ uri: petForm.photoUri }} style={styles.photoPreview} />
                ) : (
                  <View
                    style={[styles.photoPlaceholder, { backgroundColor: themeColors.primarySoft }]}
                  >
                    <AppText variant="caption" color={themeColors.primary}>
                      Adicionar foto
                    </AppText>
                  </View>
                )}
              </Pressable>

              <Input
                label="Nome"
                value={petForm.name}
                onChangeText={(value) => setPetForm((prev) => ({ ...prev, name: value }))}
              />
              <Input
                label="Espécie"
                value={petForm.species}
                onChangeText={(value) => setPetForm((prev) => ({ ...prev, species: value }))}
              />
              <Input
                label="Raça"
                value={petForm.breed}
                onChangeText={(value) => setPetForm((prev) => ({ ...prev, breed: value }))}
              />
              <Input
                label="Sexo"
                value={petForm.sex}
                onChangeText={(value) => setPetForm((prev) => ({ ...prev, sex: value }))}
              />
              <Input
                label="Nascimento (YYYY-MM-DD)"
                value={petForm.birthDate}
                onChangeText={(value) =>
                  setPetForm((prev) => ({ ...prev, birthDate: maskDate(value) }))
                }
              />
              <Input
                label="Peso (kg)"
                value={petForm.weightKg}
                onChangeText={(value) =>
                  setPetForm((prev) => ({ ...prev, weightKg: maskNumber(value) }))
                }
                keyboardType="numeric"
              />

              <View style={styles.optionGroup}>
                <AppText variant="caption" color={colors.textSecondary}>
                  Castrado
                </AppText>
                <View style={styles.optionRow}>
                  {['Sim', 'Não'].map((label) => {
                    const value = label === 'Sim';
                    const selected = petForm.neutered === value;
                    return (
                      <Pressable
                        key={label}
                        onPress={() => setPetForm((prev) => ({ ...prev, neutered: value }))}
                        style={[
                          styles.optionChip,
                          selected && {
                            backgroundColor: themeColors.primary,
                            borderColor: themeColors.primary,
                          },
                        ]}
                      >
                        <AppText variant="caption" color={selected ? '#fff' : colors.textSecondary}>
                          {label}
                        </AppText>
                      </Pressable>
                    );
                  })}
                </View>
              </View>

              <Button
                label={editingPet ? 'Salvar alterações' : 'Salvar pet'}
                onPress={savePetForm}
              />
            </ScrollView>
          </KeyboardAvoider>
        </View>
      </Modal>

      <Modal visible={backupModalVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <Pressable style={StyleSheet.absoluteFill} onPress={() => setBackupModalVisible(false)} />
          <KeyboardAvoider style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <AppText variant="subtitle">Backup de dados</AppText>
              <Pressable onPress={() => setBackupModalVisible(false)}>
                <X size={18} color={colors.textSecondary} />
              </Pressable>
            </View>
            {backupLoading ? (
              <ActivityIndicator />
            ) : (
              <>
                <Input
                  label="Conteúdo (JSON)"
                  value={backupPayload}
                  onChangeText={setBackupPayload}
                  multiline
                  style={styles.backupInput}
                />
                <Button label="Compartilhar" onPress={shareBackup} />
              </>
            )}
          </KeyboardAvoider>
        </View>
      </Modal>

      <Modal visible={importModalVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <Pressable style={StyleSheet.absoluteFill} onPress={() => setImportModalVisible(false)} />
          <KeyboardAvoider style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <AppText variant="subtitle">Importar backup</AppText>
              <Pressable onPress={() => setImportModalVisible(false)}>
                <X size={18} color={colors.textSecondary} />
              </Pressable>
            </View>
            <Input
              label="Cole o JSON"
              value={importPayload}
              onChangeText={setImportPayload}
              multiline
              style={styles.backupInput}
            />
            <Button
              label={importLoading ? 'Importando...' : 'Importar'}
              onPress={handleImportBackup}
              disabled={importLoading}
            />
          </KeyboardAvoider>
        </View>
      </Modal>

      <Modal visible={tutorProfileVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <Pressable
            style={StyleSheet.absoluteFill}
            onPress={() => setTutorProfileVisible(false)}
          />
          <KeyboardAvoider style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <AppText variant="subtitle">Perfil do tutor</AppText>
              <Pressable onPress={() => setTutorProfileVisible(false)}>
                <X size={18} color={colors.textSecondary} />
              </Pressable>
            </View>
            <Input
              label="Nome"
              value={tutorProfile.name}
              onChangeText={(value) => setTutorProfile((prev) => ({ ...prev, name: value }))}
            />
            <Input
              label="Relação"
              value={tutorProfile.role}
              onChangeText={(value) => setTutorProfile((prev) => ({ ...prev, role: value }))}
            />
            <Button label="Salvar" onPress={saveTutorProfile} />
          </KeyboardAvoider>
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
    width: 36,
    height: 36,
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconActionDanger: {
    width: 36,
    height: 36,
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
    maxHeight: '85%',
  },
  modalContentInner: {
    gap: spacing.md,
    paddingBottom: spacing.sm,
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
  modalRowInfo: {
    flex: 1,
    gap: spacing.xs,
  },
  settingsList: {
    gap: spacing.lg,
    paddingBottom: spacing.xl,
  },
  settingsSection: {
    gap: spacing.sm,
  },
  settingsRow: {
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  settingsRowInline: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  settingsInlineInput: {
    flex: 1,
  },
  settingsRowDisabled: {
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    opacity: 0.5,
  },
  photoButton: {
    alignSelf: 'center',
  },
  photoPreview: {
    width: 120,
    height: 120,
    borderRadius: radii.pill,
  },
  photoPlaceholder: {
    width: 120,
    height: 120,
    borderRadius: radii.pill,
    backgroundColor: colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  optionGroup: {
    gap: spacing.sm,
  },
  optionRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  optionChip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  accentRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  accentChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: radii.lg,
    borderWidth: 1,
  },
  accentChipSelected: {
    borderWidth: 2,
  },
  modeRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    flexWrap: 'wrap',
  },
  modeChip: {
    borderWidth: 1,
    borderRadius: radii.lg,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
  },
  modeChipSelected: {
    borderWidth: 2,
  },
  accentDot: {
    width: 14,
    height: 14,
    borderRadius: radii.pill,
  },
  backupInput: {
    height: 180,
    textAlignVertical: 'top',
  },
  resetCard: {
    gap: spacing.sm,
  },
  resetTitle: {
    fontWeight: '600',
  },
});
