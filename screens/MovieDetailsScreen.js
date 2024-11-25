import React, { useEffect, useState } from 'react';
import { 
  View, 
  Text, 
  Image, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  ActivityIndicator,
  Dimensions,
  Linking,
} from 'react-native';
import axios from 'axios';

const TMDB_API_KEY = "c59086531f209ac2717b0e50f8c6ef59";

const { width } = Dimensions.get("window");

const MovieDetailsScreen = ({ route }) => {
  const { movieId } = route.params;
  const [movie, setMovie] = useState(null);
  const [cast, setCast] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchMovieDetails = async () => {
      try {
        const response = await axios.get(
          `https://api.themoviedb.org/3/movie/${movieId}`,
          {
            params: {
              api_key: TMDB_API_KEY,
              language: 'pt-BR',
              append_to_response: 'credits,videos',
            },
          }
        );

        setMovie(response.data);
        setCast(response.data.credits.cast);
      } catch (err) {
        console.error('Erro ao buscar detalhes do filme:', err);
        setError('Falha ao carregar detalhes do filme.');
      } finally {
        setLoading(false);
      }
    };

    fetchMovieDetails();
  }, [movieId]);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4F46E5" />
        <Text style={styles.loadingText}>Carregando...</Text>
      </View>
    );
  }

  if (error || !movie) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>{error || 'Filme não encontrado.'}</Text>
      </View>
    );
  }

  const formattedDate = new Date(movie.release_date).toLocaleDateString('pt-BR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  return (
    <ScrollView contentContainerStyle={styles.detailsContainer}>
      <Image
        source={{ uri: movie.poster_path ? `https://image.tmdb.org/t/p/w500${movie.poster_path}` : 'https://via.placeholder.com/500x750?text=Sem+Imagem' }}
        style={styles.detailsImage}
      />
      <Text style={styles.detailsTitle}>{movie.title}</Text>
      <Text style={styles.overview}>{movie.overview}</Text>
      <View style={styles.infoContainer}>
        <Text style={styles.infoLabel}>Lançamento:</Text>
        <Text style={styles.infoText}>{formattedDate}</Text>
      </View>
      <View style={styles.infoContainer}>
        <Text style={styles.infoLabel}>Duração:</Text>
        <Text style={styles.infoText}>{movie.runtime} minutos</Text>
      </View>
      <View style={styles.infoContainer}>
        <Text style={styles.infoLabel}>Gêneros:</Text>
        {movie.genres.map((genre) => (
          <Text key={genre.id} style={styles.genreText}>
            {genre.name}
          </Text>
        ))}
      </View>
      <View style={styles.infoContainer}>
        <Text style={styles.infoLabel}>Avaliação TMDB:</Text>
        <Text style={styles.infoText}>{movie.vote_average} / 10</Text>
      </View>

      {movie.videos && movie.videos.results.length > 0 && (
        <TouchableOpacity 
          style={styles.trailerButton}
          onPress={() => {
            // Abrir o trailer no YouTube
            const trailerUrl = `https://www.youtube.com/watch?v=${movie.videos.results[0].key}`;
            Linking.openURL(trailerUrl);
          }}
        >
          <Text style={styles.trailerButtonText}>Assistir Trailer</Text>
        </TouchableOpacity>
      )}

      {cast.length > 0 && (
        <View style={styles.castContainer}>
          <Text style={styles.castTitle}>Elenco</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {cast.slice(0, 12).map((actor) => (
              <View key={actor.cast_id} style={styles.actorContainer}>
                <Image
                  source={{ uri: actor.profile_path ? `https://image.tmdb.org/t/p/w185${actor.profile_path}` : 'https://via.placeholder.com/185x278?text=Sem+Imagem' }}
                  style={styles.actorImage}
                />
                <Text style={styles.actorName} numberOfLines={1}>{actor.name}</Text>
                <Text style={styles.actorCharacter} numberOfLines={1}>como {actor.character}</Text>
              </View>
            ))}
          </ScrollView>
        </View>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  detailsContainer: {
    padding: 16,
    backgroundColor: "#fff",
    alignItems: "center",
  },
  detailsImage: {
    width: 300,
    height: 450,
    borderRadius: 12,
    marginBottom: 24,
    backgroundColor: "#ccc",
  },
  detailsTitle: {
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 16,
    color: "#333",
    textAlign: "center",
  },
  overview: {
    fontSize: 16,
    color: "#555",
    textAlign: "justify",
    marginBottom: 16,
  },
  infoContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginBottom: 8,
    justifyContent: "center",
  },
  infoLabel: {
    fontWeight: "bold",
    color: "#333",
    marginRight: 4,
  },
  infoText: {
    color: "#555",
  },
  genreText: {
    color: "#555",
    marginRight: 4,
  },
  trailerButton: {
    backgroundColor: "#4F46E5",
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    marginTop: 16,
  },
  trailerButtonText: {
    color: "#fff",
    fontSize: 16,
  },
  castContainer: {
    marginTop: 24,
    width: '100%',
  },
  castTitle: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 12,
    color: "#333",
  },
  actorContainer: {
    marginRight: 16,
    alignItems: "center",
    width: 100,
  },
  actorImage: {
    width: 100,
    height: 150,
    borderRadius: 8,
    backgroundColor: "#ccc",
    marginBottom: 8,
  },
  actorName: {
    fontSize: 14,
    fontWeight: "bold",
    textAlign: "center",
    color: "#333",
  },
  actorCharacter: {
    fontSize: 12,
    textAlign: "center",
    color: "#555",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 16,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: "#666",
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 16,
  },
  errorText: {
    fontSize: 18,
    color: "red",
    textAlign: "center",
  },
});

export default MovieDetailsScreen;
