import React, { useState } from 'react';
import {
  Alert,
  ActionSheetIOS,
  Image,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import { Camera } from 'lucide-react-native';

import { petsRepo } from '@/data/repositories';
import { useActivePetStore } from '@/state/activePetStore';
import { colors, radii, spacing, typography } from '@/theme';
import { AppText, Button, Input, isValidDateString, launchCamera, launchImageLibrary, maskDate, maskNumber, parseLocalizedNumber } from '@/ui';
import { useThemeColors } from '@/theme';

type Props = {
  onComplete: () => void;
};

const speciesOptions = ['Cão', 'Gato', 'Outro'];
const sexOptions = ['Macho', 'Fêmea'];

export default function OnboardingPetScreen({ onComplete }: Props) {
  const setActivePetId = useActivePetStore((state) => state.setActivePetId);
  const themeColors = useThemeColors();
  const [name, setName] = useState('');
  const [species, setSpecies] = useState(speciesOptions[0]);
  const [breed, setBreed] = useState('');
  const [sex, setSex] = useState(sexOptions[0]);
  const [birthDate, setBirthDate] = useState('');
  const [weightKg, setWeightKg] = useState('');
  const [neutered, setNeutered] = useState<boolean | null>(null);
  const [photoUri, setPhotoUri] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const pickImage = async () => {
    const uri = await launchImageLibrary({ aspect: [1, 1], allowsEditing: true, quality: 0.8 });
    if (uri) {
      setPhotoUri(uri);
    }
  };

  const takePhoto = async () => {
    const uri = await launchCamera({ aspect: [1, 1], allowsEditing: true, quality: 0.8 });
    if (uri) {
      setPhotoUri(uri);
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

  const handleSave = async () => {
    if (!name.trim()) return;
    if (saving) return;
    if (birthDate && !isValidDateString(birthDate)) {
      Alert.alert('Data inválida', 'Informe uma data válida no formato YYYY-MM-DD.');
      return;
    }

    setSaving(true);
    try {
      const weight = weightKg.trim() ? parseLocalizedNumber(weightKg) : undefined;
      const pet = await petsRepo.createPet({
        name: name.trim(),
        species,
        breed: breed.trim() || undefined,
        sex,
        birthDate: birthDate.trim() || undefined,
        weightKg: Number.isNaN(weight) ? undefined : weight,
        neutered: neutered ?? undefined,
        photoUri: photoUri ?? undefined,
      });
      setActivePetId(pet.id);
      onComplete();
    } finally {
      setSaving(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <AppText variant="title">Bem-vindo</AppText>
        <AppText variant="body" color={colors.textSecondary}>
          Vamos cadastrar seu primeiro pet.
        </AppText>
      </View>

      <Pressable style={styles.photoCard} onPress={openPhotoOptions}>
        {photoUri ? (
          <Image source={{ uri: photoUri }} style={styles.photo} />
        ) : (
          <View style={[styles.photoPlaceholder, { backgroundColor: themeColors.primarySoft }]}>
            <Camera size={32} color={themeColors.primary} />
            <AppText variant="caption" color={themeColors.primary}>
              Adicionar foto
            </AppText>
          </View>
        )}
      </Pressable>

      <View style={styles.section}>
        <Input label="Nome" value={name} onChangeText={setName} placeholder="Ex.: Paçoca" />

        <View style={styles.optionGroup}>
          <AppText variant="caption" color={colors.textSecondary}>
            Espécie
          </AppText>
          <View style={styles.optionRow}>
            {speciesOptions.map((option) => (
              <Pressable
                key={option}
                onPress={() => setSpecies(option)}
                style={[
                  styles.optionChip,
                  species === option && { backgroundColor: themeColors.primary, borderColor: themeColors.primary },
                ]}
              >
                <AppText
                  variant="caption"
                  color={species === option ? '#fff' : colors.textSecondary}
                >
                  {option}
                </AppText>
              </Pressable>
            ))}
          </View>
        </View>

        <Input label="Raça" value={breed} onChangeText={setBreed} placeholder="Ex.: Golden" />

        <View style={styles.optionGroup}>
          <AppText variant="caption" color={colors.textSecondary}>
            Sexo
          </AppText>
          <View style={styles.optionRow}>
            {sexOptions.map((option) => (
              <Pressable
                key={option}
                onPress={() => setSex(option)}
                style={[
                  styles.optionChip,
                  sex === option && { backgroundColor: themeColors.primary, borderColor: themeColors.primary },
                ]}
              >
                <AppText variant="caption" color={sex === option ? '#fff' : colors.textSecondary}>
                  {option}
                </AppText>
              </Pressable>
            ))}
          </View>
        </View>

        <Input
          label="Data de nascimento (YYYY-MM-DD)"
          value={birthDate}
          onChangeText={(value) => setBirthDate(maskDate(value))}
          placeholder="2023-01-01"
        />
        <Input
          label="Peso (kg)"
          value={weightKg}
          onChangeText={(value) => setWeightKg(maskNumber(value))}
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
              const selected = neutered === value;
              return (
                <Pressable
                  key={label}
                  onPress={() => setNeutered(value)}
                  style={[
                    styles.optionChip,
                    selected && { backgroundColor: themeColors.primary, borderColor: themeColors.primary },
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

      <Button label={saving ? 'Salvando...' : 'Salvar pet'} onPress={handleSave} />
      <AppText variant="caption" color={colors.textSecondary} style={styles.helperText}>
        Você poderá editar essas informações depois.
      </AppText>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: spacing.xl,
    paddingBottom: spacing['2xl'],
    backgroundColor: colors.background,
    gap: spacing.lg,
  },
  header: {
    gap: spacing.xs,
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
  section: {
    gap: spacing.md,
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
  helperText: {
    textAlign: 'center',
  },
});
