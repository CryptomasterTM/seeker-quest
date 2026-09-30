import { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Animated,
  Easing,
  Linking,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Link } from 'expo-router';
import { supabase } from '../lib/supabase';

type EcosystemApp = {
  id: string;
  name: string;
  description: string;
  category: string;
  official_url: string;
  is_featured: boolean;
};

type EventItem = {
  id: string;
  title: string;
  description: string;
  event_type: string;
  official_url: string | null;
  starts_at: string | null;
  ends_at: string | null;
};

const learningCards = [
  {
    title: 'Seeker',
    label: 'MOBILE',
    description:
      'Learn about Seeker and explore the mobile ecosystem built around it.',
  },
  {
    title: 'Solana',
    label: 'BLOCKCHAIN',
    description:
      'Understand the blockchain that powers the Solana Mobile ecosystem.',
  },
  {
    title: 'SKR',
    label: 'ECOSYSTEM',
    description:
      'Learn about SKR and its role in the Seeker ecosystem.',
  },
  {
    title: 'dApp Store',
    label: 'DISCOVER',
    description:
      'Explore decentralized applications available through Solana Mobile.',
  },
];

const officialResources = [
  {
    title: 'Solana Mobile',
    description: 'Official Solana Mobile website.',
    url: 'https://solanamobile.com',
  },
  {
    title: 'Developer Docs',
    description: 'Official Solana Mobile developer documentation.',
    url: 'https://docs.solanamobile.com/get-started/overview',
  },
  {
    title: 'Solana dApp Store',
    description: 'Discover applications in the Solana Mobile ecosystem.',
    url: 'https://dappstore.solanamobile.com',
  },
  {
    title: 'CLOCK IN',
    description: 'Official Solana Mobile hackathon information.',
    url: 'https://solanamobile.com/hackathon',
  },
];

export default function DiscoverScreen() {
  const fade = useRef(new Animated.Value(0)).current;
  const slide = useRef(new Animated.Value(24)).current;
  const glow = useRef(new Animated.Value(0.25)).current;

  const [apps, setApps] = useState<EcosystemApp[]>([]);
  const [events, setEvents] = useState<EventItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fade, {
        toValue: 1,
        duration: 650,
        useNativeDriver: true,
      }),
      Animated.timing(slide, {
        toValue: 0,
        duration: 650,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
    ]).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(glow, {
          toValue: 0.5,
          duration: 1800,
          useNativeDriver: true,
        }),
        Animated.timing(glow, {
          toValue: 0.2,
          duration: 1800,
          useNativeDriver: true,
        }),
      ]),
    ).start();

    loadDiscoverData();
  }, []);

  async function loadDiscoverData() {
    setLoading(true);

    const [appsResult, eventsResult] = await Promise.all([
      supabase
        .from('ecosystem_apps')
        .select(
          'id,name,description,category,official_url,is_featured',
        )
        .order('is_featured', { ascending: false })
        .order('created_at', { ascending: false }),

      supabase
        .from('events')
        .select(
          'id,title,description,event_type,official_url,starts_at,ends_at',
        )
        .eq('is_active', true)
        .order('ends_at', { ascending: true }),
    ]);

    if (!appsResult.error && appsResult.data) {
      setApps(appsResult.data);
    }

    if (!eventsResult.error && eventsResult.data) {
      setEvents(eventsResult.data);
    }

    setLoading(false);
  }

  async function openUrl(url: string) {
    try {
      await Linking.openURL(url);
    } catch {
      // Ignore invalid external links.
    }
  }

  return (
    <View style={styles.screen}>
      <Animated.View
        style={[
          styles.ambientOne,
          {
            opacity: glow,
          },
        ]}
      />

      <Animated.View
        style={[
          styles.ambientTwo,
          {
            opacity: glow,
          },
        ]}
      />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View
          style={{
            opacity: fade,
            transform: [{ translateY: slide }],
          }}
        >
          <View style={styles.header}>
            <Link href="/home" asChild>
              <Pressable
                style={({ pressed }) => [
                  styles.backButton,
                  pressed && styles.pressed,
                ]}
              >
                <Text style={styles.backText}>BACK</Text>
              </Pressable>
            </Link>

            <Text style={styles.headerTitle}>DISCOVER</Text>

            <View style={styles.headerSpacer} />
          </View>

          <View style={styles.hero}>
            <View style={styles.heroLine} />

            <Text style={styles.heroLabel}>SEEKER ECOSYSTEM</Text>

            <Text style={styles.heroTitle}>
              Discover what is being built.
            </Text>

            <Text style={styles.heroDescription}>
              Learn about Seeker, explore the ecosystem, find official
              resources and discover events worth checking out.
            </Text>
          </View>

          <Text style={styles.sectionTitle}>LEARN</Text>

          <View style={styles.learningGrid}>
            {learningCards.map((card, index) => (
              <Pressable
                key={card.title}
                style={({ pressed }) => [
                  styles.learningCard,
                  pressed && styles.cardPressed,
                ]}
              >
                <View style={styles.numberCircle}>
                  <Text style={styles.numberText}>
                    0{index + 1}
                  </Text>
                </View>

                <Text style={styles.cardLabel}>{card.label}</Text>

                <Text style={styles.cardTitle}>{card.title}</Text>

                <Text style={styles.cardDescription}>
                  {card.description}
                </Text>
              </Pressable>
            ))}
          </View>

          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>ECOSYSTEM</Text>
            <Text style={styles.sectionCount}>
              {apps.length} FOUND
            </Text>
          </View>

          {loading ? (
            <View style={styles.loadingBox}>
              <ActivityIndicator size="small" color="#A855F7" />
              <Text style={styles.loadingText}>
                Loading ecosystem...
              </Text>
            </View>
          ) : apps.length > 0 ? (
            apps.map((app) => (
              <Pressable
                key={app.id}
                onPress={() => openUrl(app.official_url)}
                style={({ pressed }) => [
                  styles.appCard,
                  pressed && styles.cardPressed,
                ]}
              >
                <View style={styles.appIcon}>
                  <Text style={styles.appIconText}>
                    {app.name.charAt(0).toUpperCase()}
                  </Text>
                </View>

                <View style={styles.appContent}>
                  <Text style={styles.appCategory}>
                    {app.category}
                  </Text>

                  <Text style={styles.appName}>{app.name}</Text>

                  <Text style={styles.appDescription}>
                    {app.description}
                  </Text>

                  <Text style={styles.openText}>
                    OPEN OFFICIAL SITE
                  </Text>
                </View>

                <Text style={styles.arrow}>›</Text>
              </Pressable>
            ))
          ) : (
            <View style={styles.emptyBox}>
              <Text style={styles.emptyTitle}>
                No ecosystem projects yet
              </Text>

              <Text style={styles.emptyText}>
                More official ecosystem entries will appear here.
              </Text>
            </View>
          )}

          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>EVENTS</Text>
            <Text style={styles.sectionCount}>
              {events.length} LIVE
            </Text>
          </View>

          {events.length > 0 ? (
            events.map((event) => (
              <Pressable
                key={event.id}
                onPress={() =>
                  event.official_url
                    ? openUrl(event.official_url)
                    : undefined
                }
                style={({ pressed }) => [
                  styles.eventCard,
                  pressed && styles.cardPressed,
                ]}
              >
                <View style={styles.eventTop}>
                  <View style={styles.liveDot} />
                  <Text style={styles.eventType}>
                    {event.event_type}
                  </Text>
                </View>

                <Text style={styles.eventTitle}>
                  {event.title}
                </Text>

                <Text style={styles.eventDescription}>
                  {event.description}
                </Text>

                {event.ends_at && (
                  <Text style={styles.eventDate}>
                    ENDS{' '}
                    {new Date(event.ends_at).toLocaleDateString()}
                  </Text>
                )}

                {event.official_url && (
                  <Text style={styles.openText}>
                    VIEW OFFICIAL EVENT
                  </Text>
                )}
              </Pressable>
            ))
          ) : (
            <View style={styles.emptyBox}>
              <Text style={styles.emptyTitle}>
                No active events
              </Text>

              <Text style={styles.emptyText}>
                Check back when new Seeker ecosystem events are added.
              </Text>
            </View>
          )}

          <Text style={styles.sectionTitle}>OFFICIAL RESOURCES</Text>

          {officialResources.map((resource) => (
            <Pressable
              key={resource.title}
              onPress={() => openUrl(resource.url)}
              style={({ pressed }) => [
                styles.resourceCard,
                pressed && styles.cardPressed,
              ]}
            >
              <View style={styles.resourceIcon}>
                <Text style={styles.resourceIconText}>↗</Text>
              </View>

              <View style={styles.resourceContent}>
                <Text style={styles.resourceTitle}>
                  {resource.title}
                </Text>

                <Text style={styles.resourceDescription}>
                  {resource.description}
                </Text>
              </View>

              <Text style={styles.arrow}>›</Text>
            </Pressable>
          ))}

          <Link href="/home" asChild>
            <Pressable
              style={({ pressed }) => [
                styles.homeButton,
                pressed && styles.buttonPressed,
              ]}
            >
              <Text style={styles.homeButtonText}>
                BACK TO HOME
              </Text>
            </Pressable>
          </Link>

          <View style={styles.footer}>
            <Text style={styles.footerText}>
              DISCOVER · LEARN · EXPLORE · PROGRESS
            </Text>
          </View>
        </Animated.View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#03040A',
  },

  scroll: {
    flex: 1,
  },

  container: {
    paddingHorizontal: 20,
    paddingTop: 58,
    paddingBottom: 50,
  },

  ambientOne: {
    position: 'absolute',
    width: 220,
    height: 220,
    borderRadius: 110,
    backgroundColor: '#7C3AED',
    opacity: 0.2,
    top: 20,
    right: -80,
  },

  ambientTwo: {
    position: 'absolute',
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: '#06B6D4',
    opacity: 0.15,
    top: 420,
    left: -90,
  },

  header: {
    height: 46,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 24,
  },

  backButton: {
    paddingVertical: 10,
    paddingRight: 18,
  },

  backText: {
    color: '#A855F7',
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 1.2,
  },

  headerTitle: {
    color: '#F8FAFC',
    fontSize: 13,
    fontWeight: '800',
    letterSpacing: 2,
  },

  headerSpacer: {
    width: 48,
  },

  pressed: {
    opacity: 0.65,
  },

  hero: {
    backgroundColor: '#0A0C15',
    borderWidth: 1,
    borderColor: '#1E2233',
    borderRadius: 24,
    padding: 24,
    marginBottom: 30,
    overflow: 'hidden',
  },

  heroLine: {
    width: 55,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#A855F7',
    marginBottom: 22,
  },

  heroLabel: {
    color: '#A855F7',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1.5,
    marginBottom: 10,
  },

  heroTitle: {
    color: '#FFFFFF',
    fontSize: 30,
    lineHeight: 36,
    fontWeight: '800',
    marginBottom: 12,
  },

  heroDescription: {
    color: '#94A3B8',
    fontSize: 14,
    lineHeight: 22,
  },

  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
    marginTop: 6,
  },

  sectionTitle: {
    color: '#F8FAFC',
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 1.7,
    marginBottom: 14,
    marginTop: 6,
  },

  sectionCount: {
    color: '#64748B',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1,
  },

  learningGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 30,
  },

  learningCard: {
    width: '48%',
    backgroundColor: '#090B12',
    borderWidth: 1,
    borderColor: '#1B1F2C',
    borderRadius: 18,
    padding: 16,
    marginBottom: 12,
    minHeight: 190,
  },

  cardPressed: {
    opacity: 0.7,
    transform: [{ scale: 0.985 }],
  },

  numberCircle: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#151022',
    borderWidth: 1,
    borderColor: '#6D28D9',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },

  numberText: {
    color: '#C084FC',
    fontSize: 10,
    fontWeight: '800',
  },

  cardLabel: {
    color: '#64748B',
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 1.2,
    marginBottom: 5,
  },

  cardTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '800',
    marginBottom: 8,
  },

  cardDescription: {
    color: '#7F8EA3',
    fontSize: 12,
    lineHeight: 18,
  },

  loadingBox: {
    minHeight: 110,
    borderRadius: 18,
    backgroundColor: '#090B12',
    borderWidth: 1,
    borderColor: '#1B1F2C',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 30,
  },

  loadingText: {
    color: '#64748B',
    fontSize: 12,
    marginTop: 10,
  },

  appCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#090B12',
    borderWidth: 1,
    borderColor: '#1B1F2C',
    borderRadius: 18,
    padding: 16,
    marginBottom: 12,
  },

  appIcon: {
    width: 48,
    height: 48,
    borderRadius: 15,
    backgroundColor: '#151022',
    borderWidth: 1,
    borderColor: '#6D28D9',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },

  appIconText: {
    color: '#C084FC',
    fontSize: 18,
    fontWeight: '800',
  },

  appContent: {
    flex: 1,
  },

  appCategory: {
    color: '#64748B',
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 1,
    marginBottom: 4,
  },

  appName: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '800',
    marginBottom: 5,
  },

  appDescription: {
    color: '#7F8EA3',
    fontSize: 12,
    lineHeight: 18,
  },

  openText: {
    color: '#A855F7',
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 1,
    marginTop: 10,
  },

  arrow: {
    color: '#64748B',
    fontSize: 27,
    marginLeft: 10,
  },

  emptyBox: {
    backgroundColor: '#090B12',
    borderWidth: 1,
    borderColor: '#1B1F2C',
    borderRadius: 18,
    padding: 22,
    marginBottom: 30,
  },

  emptyTitle: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '800',
    marginBottom: 6,
  },

  emptyText: {
    color: '#64748B',
    fontSize: 12,
    lineHeight: 18,
  },

  eventCard: {
    backgroundColor: '#090B12',
    borderWidth: 1,
    borderColor: '#1B1F2C',
    borderRadius: 18,
    padding: 18,
    marginBottom: 12,
  },

  eventTop: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },

  liveDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: '#22C55E',
    marginRight: 8,
  },

  eventType: {
    color: '#22C55E',
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 1.1,
  },

  eventTitle: {
    color: '#FFFFFF',
    fontSize: 19,
    fontWeight: '800',
    marginBottom: 8,
  },

  eventDescription: {
    color: '#7F8EA3',
    fontSize: 13,
    lineHeight: 20,
  },

  eventDate: {
    color: '#94A3B8',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1,
    marginTop: 14,
  },

  resourceCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#090B12',
    borderWidth: 1,
    borderColor: '#1B1F2C',
    borderRadius: 16,
    padding: 15,
    marginBottom: 10,
  },

  resourceIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#111827',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 13,
  },

  resourceIconText: {
    color: '#A855F7',
    fontSize: 18,
    fontWeight: '700',
  },

  resourceContent: {
    flex: 1,
  },

  resourceTitle: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
    marginBottom: 4,
  },

  resourceDescription: {
    color: '#64748B',
    fontSize: 11,
    lineHeight: 16,
  },

  homeButton: {
    height: 54,
    borderRadius: 16,
    backgroundColor: '#A855F7',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 22,
  },

  buttonPressed: {
    opacity: 0.75,
  },

  homeButtonText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: 1.3,
  },

  footer: {
    alignItems: 'center',
    paddingTop: 28,
  },

  footerText: {
    color: '#334155',
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 1.3,
  },
});