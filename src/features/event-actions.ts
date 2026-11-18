import AsyncStorage from '@react-native-async-storage/async-storage';
import { calendarExportKey, exportCalendarOnce } from './calendar-export';
import { isRunningInExpoGo, requireOptionalNativeModule } from 'expo';
import { Linking, Platform, Share } from 'react-native';
import { calendarPayload, eventMapUrl, safeEventUrl, shareEventText, type CommunityEvent } from './events-model';
export async function openEventLink(url: string) {
  const safe = safeEventUrl(url);
  if (!safe) throw new Error('Este link não é um endereço HTTPS seguro.');
  await Linking.openURL(safe);
}
export async function openEventMap(event: CommunityEvent) {
  const url = eventMapUrl(event);
  if (!url) throw new Error('O endereço ou as coordenadas deste evento ainda não foram confirmados.');
  await Linking.openURL(url);
}
export async function shareEvent(event: CommunityEvent) {
  return Share.share({ message: shareEventText(event), title: event.titulo });
}
export async function addEventToCalendar(event: CommunityEvent) {
  const payload = calendarPayload(event);
  if (isRunningInExpoGo() || !requireOptionalNativeModule('CalendarNext')) {
    throw new Error('A agenda do dispositivo está disponível na versão nativa do CityWatch. No Expo Go, você pode favoritar o evento ou compartilhar seus dados.');
  }
  return exportCalendarOnce(calendarExportKey(event.id, event.dataInicio!, event.dataFim!), {
    read: key => AsyncStorage.getItem(key), write: (key, value) => AsyncStorage.setItem(key, value),
    open: async () => {
  const calendar = await import('expo-calendar');
  const permission = await calendar.requestCalendarPermissions(Platform.OS === 'ios');
  if (!permission.granted) throw new Error('Acesso à agenda não autorizado. O evento não foi adicionado.');
  const target = Platform.OS === 'ios' ? calendar.getDefaultCalendarSync() :
    (await calendar.getCalendars(calendar.EntityTypes.EVENT)).find(item => item.allowsModifications);
  if (!target) throw new Error('Nenhuma agenda disponível para adicionar este evento.');
  const result = await target.addEventWithForm(payload);
  return result.action === 'deleted' ? 'done' : result.action;
    },
  });
}
