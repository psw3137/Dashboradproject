import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  TouchableOpacity,
  TextInput,
  RefreshControl
} from 'react-native';
import { getCustomers, searchCustomers } from '../services/customerService';

const CustomersScreen = ({ navigation }) => {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [customers, setCustomers] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [pagination, setPagination] = useState({});

  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = async (page = 1) => {
    try {
      setLoading(true);
      const response = await getCustomers(page, 50);
      setCustomers(response.data);
      setPagination(response.pagination);
    } catch (error) {
      console.error('고객 데이터 로딩 실패:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      fetchCustomers();
      return;
    }

    try {
      setLoading(true);
      const response = await searchCustomers(searchQuery);
      setCustomers(response.data);
    } catch (error) {
      console.error('검색 실패:', error);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    setSearchQuery('');
    fetchCustomers();
  };

  const renderCustomerItem = ({ item }) => (
    <TouchableOpacity
      style={styles.customerCard}
      onPress={() => navigation.navigate('CustomerDetail', { customer: item })}
    >
      <View style={styles.customerHeader}>
        <Text style={styles.customerId}>{item.customerId}</Text>
        <View style={[styles.tierBadge, { backgroundColor: getTierColor(item.customerTier) }]}>
          <Text style={styles.tierText}>{item.customerTier}</Text>
        </View>
      </View>

      <Text style={styles.customerName}>{item.name}</Text>
      <Text style={styles.customerEmail}>{item.email}</Text>
      <Text style={styles.customerPhone}>{item.phone}</Text>

      <View style={styles.statsRow}>
        <View style={styles.statItem}>
          <Text style={styles.statLabel}>구매 횟수</Text>
          <Text style={styles.statValue}>{item.totalPurchases}회</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statLabel}>총 구매액</Text>
          <Text style={styles.statValue}>₩{item.totalSpent.toLocaleString()}</Text>
        </View>
      </View>

      <View style={styles.statusRow}>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) }]}>
          <Text style={styles.statusText}>{item.status}</Text>
        </View>
        <Text style={styles.registrationDate}>
          가입일: {new Date(item.registrationDate).toLocaleDateString('ko-KR')}
        </Text>
      </View>
    </TouchableOpacity>
  );

  const getTierColor = (tier) => {
    const colors = {
      'Diamond': '#B9F2FF',
      'Platinum': '#E5E5E5',
      'Gold': '#FFD700',
      'Silver': '#C0C0C0',
      'Bronze': '#CD7F32'
    };
    return colors[tier] || '#E0E0E0';
  };

  const getStatusColor = (status) => {
    const colors = {
      'Active': '#34C759',
      'Inactive': '#FF9500',
      'Suspended': '#FF3B30'
    };
    return colors[status] || '#666';
  };

  if (loading && customers.length === 0) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>고객 데이터를 불러오는 중...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* 검색 바 */}
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="이름, 이메일, 고객 ID로 검색..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          onSubmitEditing={handleSearch}
        />
        <TouchableOpacity style={styles.searchButton} onPress={handleSearch}>
          <Text style={styles.searchButtonText}>검색</Text>
        </TouchableOpacity>
      </View>

      {/* 고객 목록 */}
      <FlatList
        data={customers}
        renderItem={renderCustomerItem}
        keyExtractor={(item) => item.customerId}
        contentContainerStyle={styles.listContainer}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>고객 데이터가 없습니다</Text>
          </View>
        }
        ListFooterComponent={
          pagination.totalPages > 1 && (
            <View style={styles.paginationContainer}>
              <Text style={styles.paginationText}>
                {pagination.currentPage} / {pagination.totalPages} 페이지
              </Text>
              <Text style={styles.paginationText}>
                총 {pagination.totalCustomers.toLocaleString()}명
              </Text>
            </View>
          )
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
  searchContainer: {
    flexDirection: 'row',
    padding: 16,
    backgroundColor: '#FFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  searchInput: {
    flex: 1,
    height: 40,
    borderWidth: 1,
    borderColor: '#CCC',
    borderRadius: 8,
    paddingHorizontal: 12,
    marginRight: 8,
    fontSize: 14,
  },
  searchButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 20,
    borderRadius: 8,
    justifyContent: 'center',
  },
  searchButtonText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '600',
  },
  listContainer: {
    padding: 16,
  },
  customerCard: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  customerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  customerId: {
    fontSize: 12,
    color: '#666',
    fontWeight: '500',
  },
  tierBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  tierText: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#333',
  },
  customerName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  customerEmail: {
    fontSize: 14,
    color: '#666',
    marginBottom: 2,
  },
  customerPhone: {
    fontSize: 14,
    color: '#666',
    marginBottom: 12,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 12,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#E0E0E0',
    marginBottom: 12,
  },
  statItem: {
    alignItems: 'center',
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  statValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#007AFF',
  },
  statusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FFF',
  },
  registrationDate: {
    fontSize: 12,
    color: '#666',
  },
  emptyContainer: {
    padding: 40,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#999',
  },
  paginationContainer: {
    padding: 16,
    alignItems: 'center',
  },
  paginationText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
});

export default CustomersScreen;
