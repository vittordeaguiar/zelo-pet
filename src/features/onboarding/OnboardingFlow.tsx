import React, { useMemo, useState } from 'react';
import {
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Camera, Check, Plus } from 'lucide-react-native';

import { petsRepo, tutorsRepo } from '@/data/repositories';
import { useActivePetStore } from '@/state/activePetStore';
import { colors, radii, spacing } from '@/theme';
import { AppText, Button, Input, useScreenPadding } from '@/ui';

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

const speciesOptions = ['Cão', 'Gato', 'Outro'];
const sexOptions = ['Macho', 'Fêmea'];

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

  const [step, setStep] = useState<Step>('welcome');
  const [tutorProfile, setTutorProfile] = useState<TutorProfile>({
    name: '',
    role: 'Dono',
  });
  const [petForm, setPetForm] = useState<PetForm>(createPetForm());
  const [createdPets, setCreatedPets] = useState<petsRepo.Pet[]>([]);
  const [saving, setSaving] = useState(false);

  const canContinueTutor = useMemo(() => tutorProfile.name.trim().length > 0, [tutorProfile]);
  const canSavePet = useMemo(() => petForm.name.trim().length > 0, [petForm]);

  const pickImage = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) return;

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.8,
      allowsEditing: true,
      aspect: [1, 1],
    });

    if (!result.canceled) {
      setPetForm((prev) => ({ ...prev, photoUri: result.assets[0]?.uri ?? null }));
    }
  };

  const savePet = async () => {
    if (!canSavePet || saving) return;
    setSaving(true);

    try {
      const weight = petForm.weightKg.trim() ? Number.parseFloat(petForm.weightKg) : undefined;
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
      setStep('summary');
    } finally {
      setSaving(false);
    }
  };

  const renderWelcome = () => (
    <View style={styles.centerBlock}>
      <View style={styles.heroIcon}>
        <Camera size={40} color={colors.primary} />
      </View>
      <AppText variant="title">Boas-vindas!</AppText>
      <AppText variant="body" color={colors.textSecondary} style={styles.centerText}>
        Vamos configurar seu perfil de tutor e cadastrar seu primeiro pet.
      </AppText>
      <Button label="Começar" onPress={() => setStep('tutor')} />
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

      <Button label="Continuar" onPress={() => setStep('pet')} disabled={!canContinueTutor} />
    </View>
  );

  const renderPet = () => (
    <View style={styles.section}>
      <AppText variant="title">Seu pet</AppText>
      <AppText variant="body" color={colors.textSecondary}>
        Cadastre as informações principais do seu pet.
      </AppText>

      <Pressable style={styles.photoCard} onPress={pickImage}>
        {petForm.photoUri ? (
          <Image source={{ uri: petForm.photoUri }} style={styles.photo} />
        ) : (
          <View style={styles.photoPlaceholder}>
            <Camera size={32} color={colors.primary} />
            <AppText variant="caption" color={colors.primary}>
              Adicionar foto
            </AppText>
          </View>
        )}
      </Pressable>

      <Input label="Nome" value={petForm.name} onChangeText={(value) => setPetForm((prev) => ({ ...prev, name: value }))} />

      <View style={styles.optionGroup}>
        <AppText variant="caption" color={colors.textSecondary}>
          Espécie
        </AppText>
        <View style={styles.optionRow}>
          {speciesOptions.map((option) => (
            <Pressable
              key={option}
              onPress={() => setPetForm((prev) => ({ ...prev, species: option }))}
              style={[styles.optionChip, petForm.species === option && styles.optionChipSelected]}
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
              style={[styles.optionChip, petForm.sex === option && styles.optionChipSelected]}
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
        onChangeText={(value) => setPetForm((prev) => ({ ...prev, birthDate: value }))}
        placeholder="2023-01-01"
      />
      <Input
        label="Peso (kg)"
        value={petForm.weightKg}
        onChangeText={(value) => setPetForm((prev) => ({ ...prev, weightKg: value }))}
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
                style={[styles.optionChip, selected && styles.optionChipSelected]}
              >
                <AppText variant="caption" color={selected ? '#fff' : colors.textSecondary}>
                  {label}
                </AppText>
              </Pressable>
            );
          })}
        </View>
      </View>

      <Button label={saving ? 'Salvando...' : 'Salvar pet'} onPress={savePet} disabled={!canSavePet} />
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
              <Check size={16} color={colors.primary} />
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

      <Button label="Adicionar outro pet" onPress={() => setStep('pet')} />
      <Pressable style={styles.secondaryCta} onPress={onComplete}>
        <Plus size={14} color={colors.textSecondary} />
        <AppText variant="caption" color={colors.textSecondary}>
          Finalizar
        </AppText>
      </Pressable>
    </View>
  );

  return (
    <ScrollView contentContainerStyle={[styles.container, screenPadding]}>
      {step === 'welcome' && renderWelcome()}
      {step === 'tutor' && renderTutor()}
      {step === 'pet' && renderPet()}
      {step === 'summary' && renderSummary()}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: spacing.xl,
    gap: spacing.lg,
    backgroundColor: colors.background,
  },
  centerBlock: {
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: spacing['2xl'],
  },
  heroIcon: {
    width: 96,
    height: 96,
    borderRadius: radii.pill,
    backgroundColor: colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  centerText: {
    textAlign: 'center',
    maxWidth: 260,
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
  optionChipSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
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
  secondaryCta: {
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginTop: spacing.sm,
  },
});
