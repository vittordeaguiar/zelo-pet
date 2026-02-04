import React, { useEffect, useMemo, useState } from 'react';
import {
  FlatList,
  Image,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import {
  Camera,
  ChevronDown,
  Heart,
  Image as ImageIcon,
  MapPin,
  Plus,
  X,
} from 'lucide-react-native';

import { memoriesRepo, petsRepo } from '@/data/repositories';
import { useActivePetStore } from '@/state/activePetStore';
import { colors, radii, spacing, typography } from '@/theme';
import { AppText, Button, IconButton, Input } from '@/ui';

const formatDate = (date?: string | null) => {
  if (!date) return '-';
  const [year, month, day] = date.split('-');
  if (!year || !month || !day) return date;
  return `${day}/${month}/${year}`;
};

const todayKey = () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = `${now.getMonth() + 1}`.padStart(2, '0');
  const day = `${now.getDate()}`.padStart(2, '0');
  return `${year}-${month}-${day}`;
};

type MemoryForm = {
  title: string;
  text: string;
  memoryDate: string;
  photoUri?: string | null;
};

export default function MemoriesScreen() {
  const activePetId = useActivePetStore((state) => state.activePetId);
  const setActivePetId = useActivePetStore((state) => state.setActivePetId);
  const [pets, setPets] = useState<petsRepo.Pet[]>([]);
  const [memories, setMemories] = useState<memoriesRepo.Memory[]>([]);
  const [selectedMemory, setSelectedMemory] = useState<memoriesRepo.Memory | null>(null);
  const [petModalVisible, setPetModalVisible] = useState(false);
  const [createModalVisible, setCreateModalVisible] = useState(false);
  const [form, setForm] = useState<MemoryForm>({
    title: '',
    text: '',
    memoryDate: todayKey(),
    photoUri: null,
  });

  const activePet = useMemo(
    () => pets.find((pet) => pet.id === activePetId) ?? pets[0],
    [pets, activePetId],
  );

  const loadPets = async () => {
    const data = await petsRepo.getPets();
    setPets(data);
    if (!activePetId && data[0]) {
      setActivePetId(data[0].id);
    }
  };

  const loadMemories = async () => {
    if (!activePetId) {
      setMemories([]);
      return;
    }
    const data = await memoriesRepo.getMemoriesByPet(activePetId);
    setMemories(data);
  };

  useEffect(() => {
    loadPets().catch((error) => console.error('loadPets', error));
  }, []);

  useEffect(() => {
    loadMemories().catch((error) => console.error('loadMemories', error));
  }, [activePetId]);

  const openCreateModal = () => {
    setForm({
      title: '',
      text: '',
      memoryDate: todayKey(),
      photoUri: null,
    });
    setCreateModalVisible(true);
  };

  const pickImage = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) return;

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.8,
      allowsEditing: true,
      aspect: [4, 3],
    });

    if (!result.canceled) {
      setForm((prev) => ({ ...prev, photoUri: result.assets[0]?.uri ?? null }));
    }
  };

  const saveMemory = async () => {
    if (!activePetId || !form.text.trim()) return;

    await memoriesRepo.createMemory({
      petId: activePetId,
      title: form.title.trim() || undefined,
      text: form.text.trim(),
      memoryDate: form.memoryDate.trim(),
      photoUri: form.photoUri ?? undefined,
    });

    setCreateModalVisible(false);
    await loadMemories();
  };

  const renderEmpty = () => (
    <View style={styles.emptyState}>
      <View style={styles.emptyIcon}>
        <Camera size={44} color={colors.primary} />
      </View>
      <AppText variant="subtitle">Crie memórias</AppText>
      <AppText variant="caption" color={colors.textSecondary} style={styles.emptyText}>
        Registre os melhores momentos com o {activePet?.name ?? 'seu pet'}.
      </AppText>
      <Button label="Adicionar memória" onPress={openCreateModal} />
    </View>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={memories}
        keyExtractor={(item) => item.id}
        numColumns={2}
        contentContainerStyle={styles.listContent}
        columnWrapperStyle={memories.length > 0 ? styles.columnWrap : undefined}
        ListHeaderComponent={
          <View style={styles.header}>
            <View>
              <AppText variant="caption" color={colors.textSecondary}>
                Álbum de
              </AppText>
              <Pressable style={styles.petSelector} onPress={() => setPetModalVisible(true)}>
                <AppText variant="title">{activePet?.name ?? 'Seu pet'}</AppText>
                <ChevronDown size={18} color={colors.textSecondary} />
              </Pressable>
            </View>
            <IconButton icon={<Plus size={18} color="white" />} onPress={openCreateModal} variant="primary" />
          </View>
        }
        ListEmptyComponent={renderEmpty}
        renderItem={({ item }) => (
          <Pressable style={styles.memoryCard} onPress={() => setSelectedMemory(item)}>
            {item.photoUri ? (
              <Image source={{ uri: item.photoUri }} style={styles.memoryImage} />
            ) : (
              <View style={styles.memoryPlaceholder}>
                <ImageIcon size={24} color={colors.textSecondary} />
              </View>
            )}
            <View style={styles.memoryInfo}>
              <AppText variant="body" style={styles.memoryTitle}>
                {item.title ?? 'Momento especial'}
              </AppText>
              <AppText variant="caption" color={colors.textSecondary}>
                {formatDate(item.memoryDate)}
              </AppText>
            </View>
          </Pressable>
        )}
      />

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
                {pet.id === activePetId ? <Heart size={16} color={colors.primary} /> : null}
              </Pressable>
            ))}
          </View>
        </View>
      </Modal>

      <Modal visible={createModalVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <Pressable style={StyleSheet.absoluteFill} onPress={() => setCreateModalVisible(false)} />
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <AppText variant="subtitle">Nova memória</AppText>
              <Pressable onPress={() => setCreateModalVisible(false)}>
                <X size={18} color={colors.textSecondary} />
              </Pressable>
            </View>

            <Input
              label="Título (opcional)"
              value={form.title}
              onChangeText={(value) => setForm((prev) => ({ ...prev, title: value }))}
              placeholder="Ex.: Dia no parque"
            />
            <Input
              label="Data (YYYY-MM-DD)"
              value={form.memoryDate}
              onChangeText={(value) => setForm((prev) => ({ ...prev, memoryDate: value }))}
              placeholder="2026-02-04"
            />
            <Input
              label="Texto"
              value={form.text}
              onChangeText={(value) => setForm((prev) => ({ ...prev, text: value }))}
              placeholder="Conte como foi"
              multiline
            />

            <Pressable style={styles.photoPicker} onPress={pickImage}>
              <Camera size={18} color={colors.primary} />
              <AppText variant="caption" color={colors.primary}>
                {form.photoUri ? 'Trocar foto' : 'Adicionar foto'}
              </AppText>
            </Pressable>
            {form.photoUri ? (
              <Image source={{ uri: form.photoUri }} style={styles.photoPreview} />
            ) : null}

            <Button label="Salvar memória" onPress={saveMemory} />
          </View>
        </View>
      </Modal>

      <Modal visible={!!selectedMemory} transparent animationType="fade">
        <View style={styles.detailOverlay}>
          <View style={styles.detailContainer}>
            <View style={styles.detailHeader}>
              <Pressable onPress={() => setSelectedMemory(null)}>
                <X size={18} color={colors.textSecondary} />
              </Pressable>
            </View>
            <ScrollView contentContainerStyle={styles.detailContent}>
              {selectedMemory?.photoUri ? (
                <Image source={{ uri: selectedMemory.photoUri }} style={styles.detailImage} />
              ) : (
                <View style={styles.detailImagePlaceholder}>
                  <ImageIcon size={28} color={colors.textSecondary} />
                </View>
              )}
              <AppText variant="subtitle" style={styles.detailTitle}>
                {selectedMemory?.title ?? 'Momento especial'}
              </AppText>
              <View style={styles.detailMeta}>
                <MapPin size={14} color={colors.textSecondary} />
                <AppText variant="caption" color={colors.textSecondary}>
                  {formatDate(selectedMemory?.memoryDate)}
                </AppText>
              </View>
              <AppText variant="body" style={styles.detailText}>
                {selectedMemory?.text}
              </AppText>
            </ScrollView>
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
  listContent: {
    padding: spacing.xl,
    paddingBottom: spacing['2xl'],
    gap: spacing.lg,
  },
  columnWrap: {
    justifyContent: 'space-between',
    gap: spacing.md,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  petSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  emptyState: {
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.xl,
  },
  emptyIcon: {
    width: 88,
    height: 88,
    borderRadius: radii.pill,
    backgroundColor: colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    textAlign: 'center',
    maxWidth: 220,
  },
  memoryCard: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: radii.lg,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.md,
  },
  memoryImage: {
    width: '100%',
    height: 140,
  },
  memoryPlaceholder: {
    width: '100%',
    height: 140,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surfaceMuted,
  },
  memoryInfo: {
    padding: spacing.sm,
    gap: spacing.xs,
  },
  memoryTitle: {
    fontWeight: '600',
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
  modalItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.sm,
  },
  photoPicker: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.sm,
  },
  photoPreview: {
    width: '100%',
    height: 180,
    borderRadius: radii.lg,
  },
  detailOverlay: {
    flex: 1,
    backgroundColor: colors.background,
  },
  detailContainer: {
    flex: 1,
  },
  detailHeader: {
    padding: spacing.xl,
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  detailContent: {
    padding: spacing.xl,
    gap: spacing.md,
  },
  detailImage: {
    width: '100%',
    height: 240,
    borderRadius: radii.xl,
  },
  detailImagePlaceholder: {
    width: '100%',
    height: 240,
    borderRadius: radii.xl,
    backgroundColor: colors.surfaceMuted,
    alignItems: 'center',
    justifyContent: 'center',
  },
  detailTitle: {
    fontWeight: '700',
  },
  detailMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  detailText: {
    fontSize: typography.size.md,
    lineHeight: typography.lineHeight.md,
  },
});
