import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  ActionSheetIOS,
  Alert,
  Animated,
  Image,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import { ArrowLeft, ArrowRight, Camera, Check } from 'lucide-react-native';

import { petsRepo, tutorsRepo } from '@/data/repositories';
import { useActivePetStore } from '@/state/activePetStore';
import { colors, radii, spacing } from '@/theme';
import { useThemeColors } from '@/theme';
import {
  AppText,
  Button,
  Input,
  isValidDateString,
  KeyboardAvoider,
  launchCamera,
  launchImageLibrary,
  maskDate,
  maskNumber,
  parseLocalizedNumber,
  PressableScale,
  useScreenPadding,
} from '@/ui';

type Step = 'welcome' | 'tutor' | 'pet' | 'summary';

type TutorProfile = {
  name: string;
  role: string;
};

type PetForm = {
  name: string;
  species: string;
  breed: string;
  sex: string;
  birthDate: string;
  weightKg: string;
  neutered: boolean | null;
  photoUri: string | null;
};

type Props = {
  onComplete: () => void;
};

type StepAction = {
  label: string;
  onPress: () => void;
  disabled?: boolean;
};

const speciesOptions = ['Cão', 'Gato', 'Outro'];
const sexOptions = ['Macho', 'Fêmea'];
const onboardingSteps: Step[] = ['welcome', 'tutor', 'pet', 'summary'];
const stepLabels: Record<Step, string> = {
  welcome: 'Boas-vindas',
  tutor: 'Tutor',
  pet: 'Pet',
  summary: 'Conclusão',
};

const createPetForm = (): PetForm => ({
  name: '',
  species: speciesOptions[0],
  breed: '',
  sex: sexOptions[0],
  birthDate: '',
  weightKg: '',
  neutered: null,
  photoUri: null,
});

export default function OnboardingFlow({ onComplete }: Props) {
  const setActivePetId = useActivePetStore((state) => state.setActivePetId);
  const screenPadding = useScreenPadding({ withTabs: false });
  const themeColors = useThemeColors();

  const [step, setStep] = useState<Step>('welcome');
  const [stepDirection, setStepDirection] = useState<1 | -1>(1);
  const [tutorProfile, setTutorProfile] = useState<TutorProfile>({
    name: '',
    role: 'Dono',
  });
  const [petForm, setPetForm] = useState<PetForm>(createPetForm());
  const [createdPets, setCreatedPets] = useState<petsRepo.Pet[]>([]);
  const [saving, setSaving] = useState(false);

  const stepOpacity = useRef(new Animated.Value(0)).current;
  const stepTranslateX = useRef(new Animated.Value(18)).current;

  const canContinueTutor = useMemo(() => tutorProfile.name.trim().length > 0, [tutorProfile]);
  const canSavePet = useMemo(() => petForm.name.trim().length > 0, [petForm]);

  const currentStepIndex = onboardingSteps.indexOf(step);
  const isFirstStep = currentStepIndex === 0;

  const layoutPadding = useMemo(
    () => ({
      paddingTop: Math.max(spacing.lg, screenPadding.paddingTop - spacing.sm),
      paddingBottom: Math.max(spacing.md, screenPadding.paddingBottom - spacing.xl),
    }),
    [screenPadding.paddingBottom, screenPadding.paddingTop],
  );

  useEffect(() => {
    stepOpacity.setValue(0);
    stepTranslateX.setValue(stepDirection * 18);

    Animated.parallel([
      Animated.timing(stepOpacity, {
        toValue: 1,
        duration: 260,
        useNativeDriver: true,
      }),
      Animated.spring(stepTranslateX, {
        toValue: 0,
        useNativeDriver: true,
        speed: 16,
        bounciness: 6,
      }),
    ]).start();
  }, [step, stepDirection, stepOpacity, stepTranslateX]);

  const goToStep = (nextStep: Step) => {
    if (nextStep === step) return;

    const nextStepIndex = onboardingSteps.indexOf(nextStep);
    if (nextStepIndex < 0) return;

    setStepDirection(nextStepIndex > currentStepIndex ? 1 : -1);
    setStep(nextStep);
  };

  const goBack = () => {
    if (isFirstStep) return;
    goToStep(onboardingSteps[currentStepIndex - 1]);
  };

  const pickImage = async () => {
    const uri = await launchImageLibrary({ aspect: [1, 1], allowsEditing: true, quality: 0.8 });
    if (uri) {
      setPetForm((prev) => ({ ...prev, photoUri: uri }));
    }
  };

  const takePhoto = async () => {
    const uri = await launchCamera({ aspect: [1, 1], allowsEditing: true, quality: 0.8 });
    if (uri) {
      setPetForm((prev) => ({ ...prev, photoUri: uri }));
    }
  };

  const openPhotoOptions = () => {
    if (Platform.OS === 'ios') {
      ActionSheetIOS.showActionSheetWithOptions(
        {
          options: ['Cancelar', 'Tirar foto', 'Escolher da galeria'],
          cancelButtonIndex: 0,
        },
        (buttonIndex) => {
          if (buttonIndex === 1) takePhoto();
          if (buttonIndex === 2) pickImage();
        },
      );
      return;
    }
    Alert.alert('Adicionar foto', 'Escolha uma opção', [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Tirar foto', onPress: takePhoto },
      { text: 'Escolher da galeria', onPress: pickImage },
    ]);
  };

  const savePet = async () => {
    if (!canSavePet || saving) return;
    if (petForm.birthDate && !isValidDateString(petForm.birthDate)) {
      Alert.alert('Data inválida', 'Informe uma data válida no formato YYYY-MM-DD.');
      return;
    }
    setSaving(true);

    try {
      const weight = petForm.weightKg.trim() ? parseLocalizedNumber(petForm.weightKg) : undefined;
      const pet = await petsRepo.createPet({
        name: petForm.name.trim(),
        species: petForm.species,
        breed: petForm.breed.trim() || undefined,
        sex: petForm.sex,
        birthDate: petForm.birthDate.trim() || undefined,
        weightKg: Number.isNaN(weight) ? undefined : weight,
        neutered: petForm.neutered ?? undefined,
        photoUri: petForm.photoUri ?? undefined,
      });

      if (tutorProfile.name.trim()) {
        await tutorsRepo.createTutor({
          petId: pet.id,
          name: tutorProfile.name.trim(),
          role: tutorProfile.role.trim() || 'Dono',
        });
      }

      if (createdPets.length === 0) {
        setActivePetId(pet.id);
      }

      setCreatedPets((prev) => [...prev, pet]);
      setPetForm(createPetForm());
      goToStep('summary');
    } finally {
      setSaving(false);
    }
  };

  const primaryAction = useMemo<StepAction>(() => {
    if (step === 'welcome') {
      return {
        label: 'Começar',
        onPress: () => goToStep('tutor'),
      };
    }

    if (step === 'tutor') {
      return {
        label: 'Continuar',
        onPress: () => goToStep('pet'),
        disabled: !canContinueTutor,
      };
    }

    if (step === 'pet') {
      return {
        label: saving ? 'Salvando...' : 'Salvar pet',
        onPress: savePet,
        disabled: !canSavePet || saving,
      };
    }

    return {
      label: 'Entrar no app',
      onPress: onComplete,
    };
  }, [canContinueTutor, canSavePet, onComplete, savePet, saving, step]);

  const renderWelcome = () => (
    <View style={styles.centerBlock}>
      <View style={[styles.heroIcon, { backgroundColor: themeColors.primarySoft }]}>
        <Camera size={40} color={themeColors.primary} />
      </View>
      <AppText variant="title" style={styles.centerText}>
        Boas-vindas!
      </AppText>
      <AppText variant="body" color={colors.textSecondary} style={styles.centerText}>
        Vamos configurar seu perfil de tutor e cadastrar seu primeiro pet.
      </AppText>
      <View style={[styles.tipCard, { borderColor: themeColors.primarySoft }]}>
        <AppText variant="caption" color={colors.textSecondary} style={styles.centerText}>
          Use as setas abaixo para avançar e voltar entre as etapas.
        </AppText>
      </View>
    </View>
  );

  const renderTutor = () => (
    <View style={styles.section}>
      <AppText variant="title">Seus dados</AppText>
      <AppText variant="body" color={colors.textSecondary}>
        Informe como deseja aparecer para seus pets.
      </AppText>

      <Input
        label="Nome"
        value={tutorProfile.name}
        onChangeText={(value) => setTutorProfile((prev) => ({ ...prev, name: value }))}
        placeholder="Ex.: Ana Silva"
      />
      <Input
        label="Relação"
        value={tutorProfile.role}
        onChangeText={(value) => setTutorProfile((prev) => ({ ...prev, role: value }))}
        placeholder="Ex.: Dona"
      />
    </View>
  );

  const renderPet = () => (
    <View style={styles.section}>
      <AppText variant="title">Seu pet</AppText>
      <AppText variant="body" color={colors.textSecondary}>
        Cadastre as informações principais do seu pet.
      </AppText>

      <Pressable
        style={styles.photoCard}
        onPress={openPhotoOptions}
        accessibilityRole="button"
        accessibilityLabel="Adicionar foto do pet"
      >
        {petForm.photoUri ? (
          <Image source={{ uri: petForm.photoUri }} style={styles.photo} />
        ) : (
          <View style={[styles.photoPlaceholder, { backgroundColor: themeColors.primarySoft }]}>
            <Camera size={32} color={themeColors.primary} />
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

      <View style={styles.optionGroup}>
        <AppText variant="caption" color={colors.textSecondary}>
          Espécie
        </AppText>
        <View style={styles.optionRow}>
          {speciesOptions.map((option) => (
            <Pressable
              key={option}
              onPress={() => setPetForm((prev) => ({ ...prev, species: option }))}
              style={[
                styles.optionChip,
                petForm.species === option && {
                  backgroundColor: themeColors.primary,
                  borderColor: themeColors.primary,
                },
              ]}
            >
              <AppText
                variant="caption"
                color={petForm.species === option ? '#fff' : colors.textSecondary}
              >
                {option}
              </AppText>
            </Pressable>
          ))}
        </View>
      </View>

      <Input
        label="Raça"
        value={petForm.breed}
        onChangeText={(value) => setPetForm((prev) => ({ ...prev, breed: value }))}
        placeholder="Ex.: Golden"
      />

      <View style={styles.optionGroup}>
        <AppText variant="caption" color={colors.textSecondary}>
          Sexo
        </AppText>
        <View style={styles.optionRow}>
          {sexOptions.map((option) => (
            <Pressable
              key={option}
              onPress={() => setPetForm((prev) => ({ ...prev, sex: option }))}
              style={[
                styles.optionChip,
                petForm.sex === option && {
                  backgroundColor: themeColors.primary,
                  borderColor: themeColors.primary,
                },
              ]}
            >
              <AppText
                variant="caption"
                color={petForm.sex === option ? '#fff' : colors.textSecondary}
              >
                {option}
              </AppText>
            </Pressable>
          ))}
        </View>
      </View>

      <Input
        label="Nascimento (YYYY-MM-DD)"
        value={petForm.birthDate}
        onChangeText={(value) => setPetForm((prev) => ({ ...prev, birthDate: maskDate(value) }))}
        placeholder="2023-01-01"
      />
      <Input
        label="Peso (kg)"
        value={petForm.weightKg}
        onChangeText={(value) => setPetForm((prev) => ({ ...prev, weightKg: maskNumber(value) }))}
        placeholder="Ex.: 12.5"
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
    </View>
  );

  const renderSummary = () => (
    <View style={styles.section}>
      <AppText variant="title">Tudo pronto</AppText>
      <AppText variant="body" color={colors.textSecondary}>
        Você já pode usar o app. Deseja adicionar outro pet?
      </AppText>

      <View style={styles.petList}>
        {createdPets.map((pet) => (
          <View key={pet.id} style={styles.petItem}>
            <View style={styles.petAvatar}>
              <Check size={16} color={themeColors.primary} />
            </View>
            <View>
              <AppText variant="body" style={styles.petItemName}>
                {pet.name}
              </AppText>
              <AppText variant="caption" color={colors.textSecondary}>
                {pet.species}
              </AppText>
            </View>
          </View>
        ))}
      </View>

      <Button label="Adicionar outro pet" variant="secondary" onPress={() => goToStep('pet')} />
      <AppText variant="caption" color={colors.textSecondary} style={styles.summaryHint}>
        Toque na seta à direita para concluir e entrar no app.
      </AppText>
    </View>
  );

  return (
    <KeyboardAvoider style={[styles.root, { backgroundColor: themeColors.background }]}>
      <View style={[styles.layout, layoutPadding, { backgroundColor: themeColors.background }]}>
        <View style={styles.progressBlock}>
          <View style={styles.progressHeader}>
            <AppText variant="caption" color={colors.textSecondary}>
              Etapa {currentStepIndex + 1} de {onboardingSteps.length}
            </AppText>
            <AppText variant="caption" color={themeColors.primary}>
              {stepLabels[step]}
            </AppText>
          </View>
          <View style={styles.progressRow}>
            {onboardingSteps.map((stepKey, index) => {
              const active = index === currentStepIndex;
              const completed = index < currentStepIndex;
              return (
                <View
                  key={stepKey}
                  style={[
                    styles.progressDot,
                    active && {
                      flex: 1.7,
                      backgroundColor: themeColors.primary,
                      borderColor: themeColors.primary,
                    },
                    completed && {
                      backgroundColor: themeColors.primarySoft,
                      borderColor: themeColors.primarySoft,
                    },
                  ]}
                />
              );
            })}
          </View>
        </View>

        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.container}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <Animated.View
            style={{
              opacity: stepOpacity,
              transform: [{ translateX: stepTranslateX }],
            }}
          >
            {step === 'welcome' && renderWelcome()}
            {step === 'tutor' && renderTutor()}
            {step === 'pet' && renderPet()}
            {step === 'summary' && renderSummary()}
          </Animated.View>
        </ScrollView>

        <View style={styles.navigationRow}>
          <PressableScale
            accessibilityRole="button"
            accessibilityLabel="Voltar etapa"
            onPress={goBack}
            disabled={isFirstStep}
            style={[
              styles.navButton,
              styles.navButtonGhost,
              isFirstStep && styles.navButtonDisabled,
            ]}
          >
            <ArrowLeft size={16} color={isFirstStep ? colors.textSecondary : colors.textPrimary} />
            <AppText
              variant="caption"
              color={isFirstStep ? colors.textSecondary : colors.textPrimary}
            >
              Voltar
            </AppText>
          </PressableScale>

          <PressableScale
            accessibilityRole="button"
            accessibilityLabel={primaryAction.label}
            onPress={primaryAction.onPress}
            disabled={primaryAction.disabled}
            style={[
              styles.navButton,
              styles.navButtonPrimary,
              { backgroundColor: themeColors.primary },
              primaryAction.disabled && styles.navButtonDisabled,
            ]}
          >
            <AppText variant="body" color="#FFFFFF" style={styles.navPrimaryLabel}>
              {primaryAction.label}
            </AppText>
            <ArrowRight size={16} color="#FFFFFF" />
          </PressableScale>
        </View>
      </View>
    </KeyboardAvoider>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.background,
  },
  layout: {
    flex: 1,
    paddingHorizontal: spacing.xl,
    backgroundColor: colors.background,
    gap: spacing.md,
  },
  progressBlock: {
    gap: spacing.sm,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  progressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  progressDot: {
    flex: 1,
    height: 10,
    borderRadius: radii.pill,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  scroll: {
    flex: 1,
  },
  container: {
    flexGrow: 1,
    paddingTop: spacing.sm,
    paddingBottom: spacing.lg,
  },
  centerBlock: {
    alignItems: 'center',
    gap: spacing.md,
    paddingTop: spacing.xl,
  },
  heroIcon: {
    width: 96,
    height: 96,
    borderRadius: radii.pill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  centerText: {
    textAlign: 'center',
    maxWidth: 280,
  },
  tipCard: {
    borderWidth: 1,
    borderRadius: radii.lg,
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  section: {
    gap: spacing.md,
  },
  photoCard: {
    alignSelf: 'center',
  },
  photo: {
    width: 140,
    height: 140,
    borderRadius: radii.pill,
  },
  photoPlaceholder: {
    width: 140,
    height: 140,
    borderRadius: radii.pill,
    backgroundColor: colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
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
  petList: {
    gap: spacing.sm,
  },
  petItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  petAvatar: {
    width: 36,
    height: 36,
    borderRadius: radii.lg,
    backgroundColor: colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  petItemName: {
    fontWeight: '600',
  },
  summaryHint: {
    textAlign: 'center',
    marginTop: spacing.xs,
  },
  navigationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginTop: spacing.xs,
  },
  navButton: {
    borderRadius: radii.lg,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    borderWidth: 1,
    flex: 1,
  },
  navButtonGhost: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    maxWidth: 120,
  },
  navButtonPrimary: {
    borderColor: colors.primary,
    flex: 2,
  },
  navPrimaryLabel: {
    fontWeight: '700',
  },
  navButtonDisabled: {
    opacity: 0.55,
  },
});
