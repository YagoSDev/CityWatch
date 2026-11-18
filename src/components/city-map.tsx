import { forwardRef } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { SymbolView } from 'expo-symbols';
import type { DiscoveryItem } from '../features/discovery-model';
import { contentTypes, groupMapItems } from '../features/discovery-model';
import MapView, { Marker, type LatLng } from 'react-native-maps';
import type { OcorrenciaAcademica } from '../features/academic-api';
import { approximateCoordinate, demonstrationCoordinate, occurrenceAppearance } from '../features/nearby-occurrences';
import { useColors } from '../features/theme';
import { useForegroundLocation } from '../features/foreground-location';

export function cameraRegion(coordinate: LatLng, delta = 0.035) {
  return { ...coordinate, latitudeDelta: delta, longitudeDelta: delta };
}

type CityMapProps = {
  center: LatLng;
  occurrences?: OcorrenciaAcademica[];
  approximateUser?: boolean;
  onOccurrencePress?: (id: string) => void;
  destination?: { name: string; coordinate: LatLng };
  items?: DiscoveryItem[];
  onItemPress?: (item: DiscoveryItem) => void;
  initialRegion?: import('react-native-maps').Region;
  region?: import('react-native-maps').Region;
  interactive?: boolean;
  onPress?: () => void;
  onManualInteraction?: () => void;
  onGroupPress?: (items: DiscoveryItem[]) => void;
  onRegionChangeComplete?: MapView['props']['onRegionChangeComplete'];
};

export const CityMap = forwardRef<MapView, CityMapProps>(function CityMap({ center, destination, occurrences = [], approximateUser = false, onOccurrencePress, items = [], onItemPress, onRegionChangeComplete, initialRegion, region, interactive = true, onPress, onManualInteraction, onGroupPress }, ref) {
  const colors = useColors();
  const { coordinate } = useForegroundLocation();

  const userCoordinate = coordinate && (approximateUser ? approximateCoordinate(coordinate) : coordinate);

  return (
    <MapView
      ref={ref}
      style={StyleSheet.absoluteFill}
      initialRegion={initialRegion ?? cameraRegion(userCoordinate ?? center, 0.07)}
      onPress={onPress}
      scrollEnabled={interactive} zoomEnabled={interactive} rotateEnabled={interactive} pitchEnabled={interactive}
      onPanDrag={onManualInteraction}
      onTouchStart={interactive ? onManualInteraction : undefined}
      userInterfaceStyle={colors.dark ? 'dark' : 'light'}
      toolbarEnabled={false}
      showsPointsOfInterests={false}
      onRegionChangeComplete={onRegionChangeComplete}
    >
      {userCoordinate && <Marker coordinate={userCoordinate} pinColor={colors.brand}
        title={approximateUser ? 'Sua localização aproximada' : 'Minha localização'} />}
      {occurrences.filter(item => item.origem !== 'cidadao').map((item) => <Marker key={item.id} coordinate={demonstrationCoordinate(item.id, center)}
        pinColor={occurrenceAppearance(item.categoria, colors).tint} title={`${item.id} · ${item.categoria} · Simulada`}
        description={item.descricao} onCalloutPress={() => onOccurrencePress?.(item.id)} />)}
      {destination && <Marker coordinate={destination.coordinate} title={destination.name} />}
      {groupMapItems(items, region ?? initialRegion ?? cameraRegion(center, 0.07)).map(group => {
        if (group.items.length > 1) return <Marker key={group.id} coordinate={group.coordinate} title={`${group.items.length} itens agrupados${group.items[0].advertising ? ' · Publicidade' : ''}`} onPress={() => onGroupPress?.(group.items)}>
          <View style={{ backgroundColor: group.items[0].advertising ? '#A32876' : '#354A65', borderRadius: group.items[0].advertising ? 8 : 24, borderWidth: 2, borderColor: '#FFFFFF', padding: 10 }}><Text style={{ color: '#FFFFFF', fontWeight: '900' }}>{group.items.length}</Text></View>
        </Marker>;
        const item = group.items[0];
        const appearance = contentTypes.find(type => type.id === item.type)!;
        return <Marker key={item.id} coordinate={item.coordinate!} accessibilityLabel={`${appearance.label}: ${item.title}${item.simulated ? ', simulado' : ''}`}
          title={`${appearance.label}: ${item.title}${item.simulated ? ' · Simulado' : ''}`} onPress={() => onItemPress?.(item)} tracksViewChanges={false}>
          <View style={{ padding: 8, backgroundColor: appearance.color, borderRadius: item.advertising ? 7 : 22, borderWidth: 2, borderColor: '#FFFFFF' }}>
            <SymbolView name={appearance.icon} size={18} tintColor="#FFFFFF" />
          </View>
        </Marker>;
      })}
    </MapView>
  );
});
