import React, { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput,
  View,
} from 'react-native';
import * as Location from 'expo-location';
import {
  AlertCircle,
  ChevronDown,
  Filter,
  MapPin,
  Navigation,
  Search,
  Store,
  Stethoscope,
  GraduationCap,
  X,
} from 'lucide-react-native';

import { colors, radii, spacing, typography } from '@/theme';
import { useThemeColors } from '@/theme';
import { AppText, Button, Card, IconButton, Input, KeyboardAvoider, ScreenFade, useScreenPadding } from '@/ui';
import { LatLng, PlacesResult, searchPlaces } from '@/features/explore/placesProvider';
import { isNetworkError } from '@/data/network';

const CATEGORIES = [
  { id: 'all', label: 'Todos', icon: null, query: 'serviços para pets' },
  { id: 'vet', label: 'Saúde', icon: Stethoscope, query: 'veterinário' },
  { id: 'shop', label: 'Petshop', icon: Store, query: 'pet shop' },
  { id: 'train', label: 'Adestrar', icon: GraduationCap, query: 'adestramento de cães' },
];

const MOCK_PLACES = [
  {
    id: '1',
    name: 'PetShop Amigo Fiel',
    category: 'shop',
    distanceKm: 0.8,
    rating: 4.8,
    reviews: 124,
    isOpen: true,
  },
  {
    id: '2',
    name: 'Clínica Vet Care 24h',
    category: 'vet',
    distanceKm: 1.2,
    rating: 4.9,
    reviews: 850,
    isOpen: true,
  },
  {
    id: '3',
    name: 'Escola Cão Educado',
    category: 'train',
    distanceKm: 3.5,
    rating: 4.5,
    reviews: 42,
    isOpen: false,
  },
  {
    id: '4',
    name: 'Spa dos Bichos',
    category: 'shop',
    distanceKm: 4.0,
    rating: 4.7,
    reviews: 210,
    isOpen: true,
  },
];

const radiusOptions = [1, 3, 5, 10];
const GOOGLE_PLACES_API_KEY = process.env.EXPO_PUBLIC_GOOGLE_PLACES_API_KEY ?? '';

type MockPlace = (typeof MOCK_PLACES)[number];

type ExplorePlace = {
  id: string;
  name: string;
  rating?: number;
  reviews?: number;
  distanceKm?: number;
  address?: string;
  categoryLabel?: string;
};

const haversineKm = (a: LatLng, b: LatLng) => {
  const toRad = (value: number) => (value * Math.PI) / 180;
  const earthRadius = 6371;
  const dLat = toRad(b.latitude - a.latitude);
  const dLng = toRad(b.longitude - a.longitude);
  const lat1 = toRad(a.latitude);
  const lat2 = toRad(b.latitude);

  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;
  return 2 * earthRadius * Math.asin(Math.sqrt(h));
};

const mapMockToResult = (place: MockPlace, categoryLabel?: string): ExplorePlace => ({
  id: place.id,
  name: place.name,
  rating: place.rating,
  reviews: place.reviews,
  distanceKm: place.distanceKm,
  categoryLabel,
});

const mapPlacesToResult = (
  place: PlacesResult,
  userLocation?: LatLng,
  categoryLabel?: string,
): ExplorePlace => {
  const distanceKm =
    userLocation && place.location ? haversineKm(userLocation, place.location) : undefined;

  return {
    id: place.id,
    name: place.name,
    rating: place.rating,
    reviews: place.userRatingCount,
    distanceKm,
    address: place.address,
    categoryLabel,
  };
};

export default function ExploreScreen() {
  const screenPadding = useScreenPadding();
  const themeColors = useThemeColors();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [radius, setRadius] = useState(5);
  const [sortBy, setSortBy] = useState<'dist' | 'name'>('dist');
  const [filtersVisible, setFiltersVisible] = useState(false);
  const [locationState, setLocationState] = useState<'unknown' | 'granted' | 'denied'>('unknown');
  const [manualLocation, setManualLocation] = useState('');
  const [currentLocationLabel, setCurrentLocationLabel] = useState('');
  const [coords, setCoords] = useState<LatLng | null>(null);
  const [loading, setLoading] = useState(false);
  const [places, setPlaces] = useState<ExplorePlace[]>([]);
  const [error, setError] = useState<string | null>(null);

  const categoryLabel =
    CATEGORIES.find((category) => category.id === selectedCategory)?.label ?? 'Todos';

  const fallbackResults = useMemo(() => {
    let list = [...MOCK_PLACES];

    if (selectedCategory !== 'all') {
      list = list.filter((place) => place.category === selectedCategory);
    }

    if (searchQuery.trim()) {
      const query = searchQuery.trim().toLowerCase();
      list = list.filter((place) => place.name.toLowerCase().includes(query));
    }

    list = list.filter((place) => place.distanceKm <= radius);

    if (sortBy === 'name') {
      list.sort((a, b) => a.name.localeCompare(b.name));
    } else {
      list.sort((a, b) => a.distanceKm - b.distanceKm);
    }

    return list.map((place) => mapMockToResult(place, categoryLabel));
  }, [searchQuery, selectedCategory, radius, sortBy, categoryLabel]);

  const fetchPlaces = async () => {
    if (!GOOGLE_PLACES_API_KEY) {
      setPlaces(fallbackResults);
      setError('Configure a chave do Google Places para resultados reais.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const categoryQuery =
        CATEGORIES.find((category) => category.id === selectedCategory)?.query ?? 'serviços para pets';
      const textQuery = searchQuery.trim() ? `${searchQuery.trim()} ${categoryQuery}` : categoryQuery;
      const locationBias = coords
        ? {
            center: coords,
            radiusMeters: radius * 1000,
          }
        : undefined;
      const query = coords
        ? textQuery
        : currentLocationLabel
          ? `${textQuery} em ${currentLocationLabel}`
          : textQuery;

      const results = await searchPlaces({
        query,
        locationBias,
        apiKey: GOOGLE_PLACES_API_KEY,
        maxResults: 20,
      });

      let mapped = results.map((place) => mapPlacesToResult(place, coords ?? undefined, categoryLabel));

      if (sortBy === 'name') {
        mapped.sort((a, b) => a.name.localeCompare(b.name));
      } else if (coords) {
        mapped = mapped.filter((place) => (place.distanceKm ?? 0) <= radius);
        mapped.sort((a, b) => (a.distanceKm ?? 0) - (b.distanceKm ?? 0));
      }

      setPlaces(mapped);
    } catch (err) {
      setError(isNetworkError(err) ? 'Sem conexão no momento.' : 'Não consegui carregar resultados reais.');
      setPlaces(fallbackResults);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timeout = setTimeout(() => {
      fetchPlaces().catch(() => undefined);
    }, 300);
    return () => clearTimeout(timeout);
  }, [searchQuery, selectedCategory, radius, sortBy, coords, currentLocationLabel]);

  const requestLocation = async () => {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      setLocationState('denied');
      return;
    }

    const position = await Location.getCurrentPositionAsync({});
    const reverse = await Location.reverseGeocodeAsync({
      latitude: position.coords.latitude,
      longitude: position.coords.longitude,
    });

    const city = reverse[0]?.city ?? reverse[0]?.subregion ?? 'Sua localização';
    setCoords({ latitude: position.coords.latitude, longitude: position.coords.longitude });
    setCurrentLocationLabel(city);
    setLocationState('granted');
  };

  const applyManualLocation = () => {
    if (!manualLocation.trim()) return;
    setCoords(null);
    setCurrentLocationLabel(manualLocation.trim());
    setLocationState('granted');
    setFiltersVisible(false);
  };

  const results = GOOGLE_PLACES_API_KEY ? places : fallbackResults;

  return (
    <ScreenFade style={styles.container}>
      <ScrollView contentContainerStyle={[styles.content, screenPadding]}>
        <View style={styles.header}>
          <View>
            <AppText variant="title">Explorar</AppText>
            <View style={styles.locationRow}>
              <MapPin size={12} color={themeColors.primary} />
              <AppText variant="caption" color={colors.textSecondary}>
                {locationState === 'granted' ? currentLocationLabel : 'Localização não definida'}
              </AppText>
            </View>
          </View>
          <IconButton
            icon={<Filter size={18} color={colors.textPrimary} />}
            onPress={() => setFiltersVisible(true)}
            accessibilityLabel="Abrir filtros"
          />
        </View>

        <View style={styles.searchWrapper}>
          <Search size={18} color={colors.textSecondary} />
          <TextInput
            style={styles.searchInput}
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder="Buscar clínicas, parques..."
            placeholderTextColor={colors.textSecondary}
          />
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.categoriesRow}>
          {CATEGORIES.map((category) => {
            const selected = selectedCategory === category.id;
            const Icon = category.icon;
            return (
              <Pressable
                key={category.id}
                onPress={() => setSelectedCategory(category.id)}
                style={[
                  styles.categoryChip,
                  selected && { backgroundColor: themeColors.primary, borderColor: themeColors.primary },
                ]}
              >
                {Icon ? (
                  <Icon size={16} color={selected ? '#fff' : colors.textSecondary} />
                ) : null}
                <AppText variant="caption" color={selected ? '#fff' : colors.textSecondary}>
                  {category.label}
                </AppText>
              </Pressable>
            );
          })}
        </ScrollView>

        {locationState === 'denied' ? (
          <Card style={styles.noLocationCard}>
            <View style={styles.noLocationRow}>
              <AlertCircle size={20} color={colors.danger} />
              <View style={styles.noLocationText}>
                <AppText variant="body">Localização desativada</AppText>
                <AppText variant="caption" color={colors.textSecondary}>
                  Ative o acesso ou defina manualmente para ver resultados próximos.
                </AppText>
              </View>
            </View>
            <Button label="Definir localização" onPress={() => setFiltersVisible(true)} />
          </Card>
        ) : null}

        {error ? (
          <Card style={styles.errorCard}>
            <AppText variant="caption" color={colors.textSecondary}>
              {error}
            </AppText>
          </Card>
        ) : null}

        <View style={styles.sectionHeader}>
          <AppText variant="subtitle">Resultados</AppText>
          <AppText variant="caption" color={colors.textSecondary}>
            {results.length} locais encontrados
          </AppText>
        </View>

        {loading ? (
          <View style={styles.loadingRow}>
            <ActivityIndicator color={colors.primary} />
            <AppText variant="caption" color={colors.textSecondary}>
              Buscando lugares...
            </AppText>
          </View>
        ) : null}

        {!loading && results.length === 0 ? (
          <Card style={styles.emptyResultsCard}>
            <AppText variant="body">Nada por aqui</AppText>
            <AppText variant="caption" color={colors.textSecondary}>
              Ajuste filtros ou tente outra busca.
            </AppText>
          </Card>
        ) : (
          results.map((place) => (
            <Card key={place.id} style={styles.placeCard}>
              <View style={styles.placeHeader}>
                <View style={styles.placeInfo}>
                  <AppText variant="body" style={styles.placeTitle}>
                    {place.name}
                  </AppText>
                  <AppText variant="caption" color={colors.textSecondary}>
                    {place.distanceKm !== undefined
                      ? `${place.distanceKm.toFixed(1)} km • `
                      : ''}
                    {place.rating ? `${place.rating} ★` : 'Sem avaliação'}
                    {place.reviews ? ` (${place.reviews})` : ''}
                  </AppText>
                  {place.address ? (
                    <AppText variant="caption" color={colors.textSecondary}>
                      {place.address}
                    </AppText>
                  ) : null}
                </View>
                <View style={[styles.placeBadge, { backgroundColor: themeColors.primarySoft }]}>
                  <AppText variant="caption" color={themeColors.primary}>
                    {place.categoryLabel ?? 'Serviço'}
                  </AppText>
                </View>
              </View>
              <View style={styles.placeFooter}>
                <AppText variant="caption" color={colors.textSecondary}>
                  {place.categoryLabel ?? 'Serviço'}
                </AppText>
                <Pressable style={styles.directionsButton}>
                  <Navigation size={14} color={themeColors.primary} />
                  <AppText variant="caption" color={themeColors.primary}>
                    Rotas
                  </AppText>
                </Pressable>
              </View>
            </Card>
          ))
        )}
      </ScrollView>

      <Modal visible={filtersVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <Pressable style={StyleSheet.absoluteFill} onPress={() => setFiltersVisible(false)} />
          <KeyboardAvoider style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <AppText variant="subtitle">Filtros</AppText>
              <Pressable onPress={() => setFiltersVisible(false)}>
                <X size={18} color={colors.textSecondary} />
              </Pressable>
            </View>

            <AppText variant="caption" color={colors.textSecondary}>
              Raio de busca
            </AppText>
            <View style={styles.optionRow}>
              {radiusOptions.map((option) => {
                const selected = radius === option;
                return (
                  <Pressable
                    key={`${option}-km`}
                    onPress={() => setRadius(option)}
                    style={[
                      styles.optionChip,
                      selected && { backgroundColor: themeColors.primary, borderColor: themeColors.primary },
                    ]}
                  >
                    <AppText variant="caption" color={selected ? '#fff' : colors.textSecondary}>
                      {option} km
                    </AppText>
                  </Pressable>
                );
              })}
            </View>

            <AppText variant="caption" color={colors.textSecondary}>
              Ordenar por
            </AppText>
            <View style={styles.optionRow}>
              {[
                { id: 'dist', label: 'Distância' },
                { id: 'name', label: 'Nome' },
              ].map((option) => {
                const selected = sortBy === option.id;
                return (
                  <Pressable
                    key={option.id}
                    onPress={() => setSortBy(option.id as 'dist' | 'name')}
                    style={[
                      styles.optionChip,
                      selected && { backgroundColor: themeColors.primary, borderColor: themeColors.primary },
                    ]}
                  >
                    <AppText variant="caption" color={selected ? '#fff' : colors.textSecondary}>
                      {option.label}
                    </AppText>
                  </Pressable>
                );
              })}
            </View>

            <AppText variant="caption" color={colors.textSecondary}>
              Localização
            </AppText>
            <View style={styles.locationActions}>
              <Button label="Usar localização atual" onPress={requestLocation} />
              <View style={styles.manualLocationRow}>
                <Input
                  value={manualLocation}
                  onChangeText={setManualLocation}
                  placeholder="Cidade ou bairro"
                />
                <Pressable style={styles.applyButton} onPress={applyManualLocation}>
                  <ChevronDown size={16} color={themeColors.primary} />
                </Pressable>
              </View>
            </View>
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
  searchWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radii.lg,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  searchInput: {
    flex: 1,
    fontSize: typography.size.md,
    color: colors.textPrimary,
  },
  categoriesRow: {
    gap: spacing.sm,
  },
  categoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  categoryChipSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  noLocationCard: {
    gap: spacing.md,
  },
  noLocationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  noLocationText: {
    flex: 1,
    gap: spacing.xs,
  },
  errorCard: {
    gap: spacing.sm,
  },
  emptyResultsCard: {
    gap: spacing.xs,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  loadingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  placeCard: {
    gap: spacing.md,
  },
  placeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: spacing.md,
  },
  placeInfo: {
    flex: 1,
  },
  placeTitle: {
    fontWeight: '600',
  },
  placeBadge: {
    backgroundColor: colors.primarySoft,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: radii.pill,
  },
  placeFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  directionsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
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
  locationActions: {
    gap: spacing.sm,
  },
  manualLocationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  applyButton: {
    width: 44,
    height: 44,
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surface,
  },
});
