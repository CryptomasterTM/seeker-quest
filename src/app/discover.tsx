import { StyleSheet, Text, View, Pressable, ScrollView } from 'react-native';
import { router } from 'expo-router';

const categories = [
  {
    title: 'Mobile',
    description: 'Discover apps built for the Seeker mobile experience.',
  },
  {
    title: 'Games',
    description: 'Explore games and interactive experiences.',
  },
  {
    title: 'DeFi',
    description: 'Discover financial apps across the Solana ecosystem.',
  },
  {
    title: 'Community',
    description: 'Find communities and experiences worth exploring.',
  },
];

const featuredApps = [
  {
    name: 'Seeker Apps',
    category: 'Mobile',
    description: 'Explore apps and experiences made for the Seeker ecosystem.',
  },
  {
    name: 'Solana Ecosystem',
    category: 'Ecosystem',
    description: 'Discover projects, tools and experiences built on Solana.',
  },
  {
    name: 'Quest Experiences',
    category: 'Community',
    description: 'Find activities that can help you learn and earn XP.',
  },
];

export default function DiscoverScreen() {
  return (
    <ScrollView
      style={styles.scrollView}
      contentContainerStyle={styles.container}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.header}>
        <Pressable onPress={() => router.back()}>
          <Text style={styles.backButton}>BACK</Text>
        </Pressable>

        <Text style={styles.headerTitle}>Discover</Text>

        <View style={styles.headerSpace} />
      </View>

      <View style={styles.heroCard}>
        <Text style={styles.heroLabel}>EXPLORE THE ECOSYSTEM</Text>

        <Text style={styles.heroTitle}>
          Discover something new.
        </Text>

        <Text style={styles.heroDescription}>
          Explore apps, games, communities and experiences across the
          Seeker and Solana ecosystem.
        </Text>
      </View>

      <Text style={styles.sectionTitle}>Categories</Text>

      <View style={styles.categoryGrid}>
        {categories.map((category) => (
          <Pressable
            key={category.title}
            style={styles.categoryCard}
          >
            <View style={styles.categoryIcon}>
              <Text style={styles.categoryIconText}>
                {category.title.charAt(0)}
              </Text>
            </View>

            <Text style={styles.categoryTitle}>
              {category.title}
            </Text>

            <Text style={styles.categoryDescription}>
              {category.description}
            </Text>
          </Pressable>
        ))}
      </View>

      <Text style={styles.sectionTitle}>Featured</Text>

      {featuredApps.map((app) => (
        <Pressable key={app.name} style={styles.appCard}>
          <View style={styles.appIcon}>
            <Text style={styles.appIconText}>
              {app.name.charAt(0)}
            </Text>
          </View>

          <View style={styles.appContent}>
            <Text style={styles.appCategory}>
              {app.category}
            </Text>

            <Text style={styles.appName}>
              {app.name}
            </Text>

            <Text style={styles.appDescription}>
              {app.description}
            </Text>
          </View>

          <Text style={styles.arrow}>›</Text>
        </Pressable>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
    backgroundColor: '#07111F',
  },

  container: {
    padding: 24,
    paddingTop: 55,
    paddingBottom: 40,
  },

  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },

  backButton: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1,
  },

  headerTitle: {
    color: '#FFFFFF',
    fontSize: 22,
    fontWeight: '800',
  },

  headerSpace: {
    width: 40,
  },

  heroCard: {
    backgroundColor: '#101D2E',
    borderRadius: 22,
    padding: 22,
    marginBottom: 30,
  },

  heroLabel: {
    color: '#8B9AAF',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1.2,
    marginBottom: 10,
  },

  heroTitle: {
    color: '#FFFFFF',
    fontSize: 28,
    fontWeight: '800',
    marginBottom: 10,
  },

  heroDescription: {
    color: '#AAB7C8',
    fontSize: 14,
    lineHeight: 21,
  },

  sectionTitle: {
    color: '#FFFFFF',
    fontSize: 21,
    fontWeight: '800',
    marginBottom: 14,
  },

  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 30,
  },

  categoryCard: {
    width: '48%',
    backgroundColor: '#101D2E',
    borderRadius: 18,
    padding: 18,
    marginBottom: 14,
  },

  categoryIcon: {
    width: 42,
    height: 42,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 14,
  },

  categoryIconText: {
    color: '#07111F',
    fontSize: 17,
    fontWeight: '900',
  },

  categoryTitle: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '800',
    marginBottom: 6,
  },

  categoryDescription: {
    color: '#8B9AAF',
    fontSize: 12,
    lineHeight: 18,
  },

  appCard: {
    backgroundColor: '#101D2E',
    borderRadius: 18,
    padding: 18,
    marginBottom: 14,
    flexDirection: 'row',
    alignItems: 'center',
  },

  appIcon: {
    width: 52,
    height: 52,
    borderRadius: 15,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },

  appIconText: {
    color: '#07111F',
    fontSize: 20,
    fontWeight: '900',
  },

  appContent: {
    flex: 1,
  },

  appCategory: {
    color: '#8B9AAF',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1,
    marginBottom: 4,
  },

  appName: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '800',
    marginBottom: 5,
  },

  appDescription: {
    color: '#8B9AAF',
    fontSize: 12,
    lineHeight: 18,
  },

  arrow: {
    color: '#FFFFFF',
    fontSize: 28,
    marginLeft: 8,
  },
});