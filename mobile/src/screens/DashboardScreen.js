import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  RefreshControl,
  Dimensions
} from 'react-native';
import { LineChart, PieChart } from 'react-native-chart-kit';
import { getDashboardStats } from '../services/customerService';

const DashboardScreen = () => {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [dashboardData, setDashboardData] = useState(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const response = await getDashboardStats();
      setDashboardData(response.data);
    } catch (error) {
      console.error('대시보드 데이터 로딩 실패:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchDashboardData();
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>데이터를 불러오는 중...</Text>
      </View>
    );
  }

  if (!dashboardData) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorText}>데이터를 불러올 수 없습니다</Text>
      </View>
    );
  }

  const { overview, customersByTier, topCustomers } = dashboardData;

  // 고객 등급 차트 데이터
  const tierColors = ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF'];
  const tierChartData = customersByTier.map((item, index) => ({
    name: item._id,
    population: item.count,
    color: tierColors[index % tierColors.length],
    legendFontColor: '#333',
    legendFontSize: 12
  }));

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      {/* 개요 카드 */}
      <View style={styles.overviewContainer}>
        <Text style={styles.sectionTitle}>📊 주요 지표</Text>

        <View style={styles.statsGrid}>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>
              {overview.totalCustomers.toLocaleString()}
            </Text>
            <Text style={styles.statLabel}>총 고객 수</Text>
          </View>

          <View style={styles.statCard}>
            <Text style={styles.statValue}>
              {overview.activeCustomers.toLocaleString()}
            </Text>
            <Text style={styles.statLabel}>활성 고객</Text>
          </View>

          <View style={[styles.statCard, styles.fullWidth]}>
            <Text style={styles.statValue}>
              ₩{Math.round(overview.totalRevenue).toLocaleString()}
            </Text>
            <Text style={styles.statLabel}>총 매출</Text>
          </View>

          <View style={[styles.statCard, styles.fullWidth]}>
            <Text style={styles.statValue}>
              ₩{Math.round(overview.averagePurchase).toLocaleString()}
            </Text>
            <Text style={styles.statLabel}>평균 구매액</Text>
          </View>
        </View>
      </View>

      {/* 고객 등급 분포 */}
      {tierChartData.length > 0 && (
        <View style={styles.chartContainer}>
          <Text style={styles.sectionTitle}>🏆 고객 등급 분포</Text>
          <PieChart
            data={tierChartData}
            width={Dimensions.get('window').width - 32}
            height={220}
            chartConfig={{
              color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
            }}
            accessor="population"
            backgroundColor="transparent"
            paddingLeft="15"
            absolute
          />
        </View>
      )}

      {/* 상위 고객 */}
      {topCustomers && topCustomers.length > 0 && (
        <View style={styles.topCustomersContainer}>
          <Text style={styles.sectionTitle}>👑 상위 고객 (구매액 기준)</Text>
          {topCustomers.slice(0, 5).map((customer, index) => (
            <View key={customer.customerId} style={styles.customerCard}>
              <View style={styles.customerRank}>
                <Text style={styles.rankNumber}>{index + 1}</Text>
              </View>
              <View style={styles.customerInfo}>
                <Text style={styles.customerName}>{customer.name}</Text>
                <Text style={styles.customerEmail}>{customer.email}</Text>
                <View style={styles.customerStats}>
                  <Text style={styles.customerTier}>
                    {customer.customerTier}
                  </Text>
                  <Text style={styles.customerSpent}>
                    ₩{customer.totalSpent.toLocaleString()}
                  </Text>
                </View>
              </View>
            </View>
          ))}
        </View>
      )}
    </ScrollView>
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
  errorText: {
    fontSize: 16,
    color: '#FF3B30',
  },
  overviewContainer: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#333',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  statCard: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 20,
    width: '48%',
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  fullWidth: {
    width: '100%',
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#007AFF',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 14,
    color: '#666',
  },
  chartContainer: {
    backgroundColor: '#FFF',
    padding: 16,
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  topCustomersContainer: {
    padding: 16,
  },
  customerCard: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  customerRank: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  rankNumber: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  customerInfo: {
    flex: 1,
  },
  customerName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  customerEmail: {
    fontSize: 12,
    color: '#666',
    marginBottom: 8,
  },
  customerStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  customerTier: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FF9500',
    backgroundColor: '#FFF3E0',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  customerSpent: {
    fontSize: 14,
    fontWeight: '600',
    color: '#34C759',
  },
});

export default DashboardScreen;
