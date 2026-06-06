import { useEffect, useState } from 'react';
import { View, StyleSheet, Text, ActivityIndicator, FlatList, TouchableOpacity, Modal, TextInput, Button as RNButton } from 'react-native';
import { useRouter } from 'expo-router';
import { useAppStore } from '../store/useAppStore';
import { useTranslation } from '../hooks/useTranslation';

export default function HomeScreen() {
  const router = useRouter();
  const { trips, isLoading, error, loadTrips, createTrip } = useAppStore();
  const { t } = useTranslation();
  
  const [modalVisible, setModalVisible] = useState(false);
  const [newTripName, setNewTripName] = useState('');

  useEffect(() => {
    loadTrips();
  }, [loadTrips]);

  const handleCreateTrip = async () => {
    if (newTripName.trim() === '') return;
    const trip = await createTrip(newTripName.trim());
    setNewTripName('');
    setModalVisible(false);
    if (trip) {
      router.push(`/trip/${trip.id}`);
    }
  };

  if (isLoading && trips.length === 0) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#6C63FF" />
        <Text style={styles.loadingText}>{t('home.loading')}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {error && (
        <Text style={styles.errorText}>{t('home.error', { message: error })}</Text>
      )}

      {trips.length === 0 && !isLoading && !error ? (
        <View style={styles.center}>
          <Text style={styles.emptyText}>{t('home.empty')}</Text>
        </View>
      ) : (
        <FlatList
          data={trips}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          renderItem={({ item }) => (
            <TouchableOpacity 
              style={styles.tripCard}
              onPress={() => router.push(`/trip/${item.id}`)}
            >
              <Text style={styles.tripName}>{item.name}</Text>
              <Text style={styles.tripDate}>
                {new Date(item.createdAt).toLocaleDateString()}
              </Text>
            </TouchableOpacity>
          )}
        />
      )}

      {/* FAB */}
      <TouchableOpacity 
        style={styles.fab}
        onPress={() => setModalVisible(true)}
      >
        <Text style={styles.fabIcon}>+</Text>
      </TouchableOpacity>

      {/* Create Trip Modal */}
      <Modal
        visible={modalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>{t('home.newTrip')}</Text>
            <TextInput
              style={styles.input}
              placeholder={t('home.tripNamePlaceholder')}
              value={newTripName}
              onChangeText={setNewTripName}
              autoFocus
            />
            <View style={styles.modalActions}>
              <RNButton title={t('home.cancel')} color="#999" onPress={() => setModalVisible(false)} />
              <RNButton title={t('home.create')} color="#6C63FF" onPress={handleCreateTrip} />
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F7',
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  listContent: {
    padding: 16,
  },
  tripCard: {
    backgroundColor: '#FFF',
    padding: 20,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  tripName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  tripDate: {
    fontSize: 14,
    color: '#888',
  },
  loadingText: {
    marginTop: 16,
    color: '#6C63FF',
  },
  errorText: {
    color: '#E02424',
    padding: 16,
    textAlign: 'center',
  },
  emptyText: {
    color: '#888',
    fontSize: 16,
    textAlign: 'center',
  },
  fab: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#6C63FF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#6C63FF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  fabIcon: {
    fontSize: 32,
    color: '#FFF',
    lineHeight: 36,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 24,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  input: {
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginBottom: 20,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
  }
});
