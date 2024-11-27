// screens/HomeScreen.js

import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  Image,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Dimensions,
  TextInput,
  FlatList,
  Pressable,
  Keyboard,
} from "react-native";
import { useNavigation } from '@react-navigation/native';

const TMDB_API_KEY = "b7971bb1312f288fe017f07f7b667df3";

const { width } = Dimensions.get("window");

const HomeScreen = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchError, setSearchError] = useState(null);

  const navigation = useNavigation();

  const fetchCategories = async () => {
    try {
      const genresResponse = await fetch(
        `https://api.themoviedb.org/3/genre/movie/list?api_key=${TMDB_API_KEY}&language=pt-BR`
      );
      const genresData = await genresResponse.json();
      const genres = genresData.genres;

      const categoriesData = await Promise.all(
        genres.map(async (genre) => {
          const moviesResponse = await fetch(
            `https://api.themoviedb.org/3/discover/movie?api_key=${TMDB_API_KEY}&language=pt-BR&with_genres=${genre.id}`
          );
          const moviesData = await moviesResponse.json();
          const movies = moviesData.results.map((movie) => ({
            id: movie.id,
            title: movie.title,
            image: movie.poster_path
              ? `https://image.tmdb.org/t/p/w200${movie.poster_path}`
              : "https://via.placeholder.com/200x300?text=Sem+Imagem",
          }));
          return {
            name: genre.name,
            movies,
          };
        })
      );

      setCategories(categoriesData);
    } catch (err) {
      console.error("Erro ao buscar dados da API:", err);
      setError("Falha ao carregar dados. Tente novamente mais tarde.");
    } finally {
      setLoading(false);
    }
  };

  const searchMovies = async (query) => {
    if (query.trim() === "") {
      setSearchResults([]);
      setSearchError(null);
      return;
    }

    setSearchLoading(true);
    setSearchError(null);

    try {
      const searchResponse = await fetch(
        `https://api.themoviedb.org/3/search/movie?api_key=${TMDB_API_KEY}&language=pt-BR&query=${encodeURIComponent(query)}&page=1&include_adult=false`
      );
      const searchData = await searchResponse.json();
      setSearchResults(searchData.results.map((movie) => ({
        id: movie.id,
        title: movie.title,
        image: movie.poster_path
          ? `https://image.tmdb.org/t/p/w200${movie.poster_path}`
          : "https://via.placeholder.com/200x300?text=Sem+Imagem",
      })));
    } catch (err) {
      console.error("Erro ao buscar dados da API de pesquisa:", err);
      setSearchError("Falha ao realizar a pesquisa. Tente novamente mais tarde.");
    } finally {
      setSearchLoading(false);
    }
  };

  const debounce = (func, delay) => {
    let timeoutId;
    return (...args) => {
      if (timeoutId) clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        func(...args);
      }, delay);
    };
  };

  const debouncedSearch = useCallback(debounce(searchMovies, 500), []);

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    debouncedSearch(searchQuery);
  }, [searchQuery]);

  const navigateToDetails = (movie) => {
    navigation.navigate("MovieDetails", { movieId: movie.id });
  };

  const renderSearchItem = ({ item }) => (
    <Pressable
      key={item.id}
      style={({ pressed }) => [
        styles.searchItem,
        pressed && styles.pressedItem
      ]}
      onPress={() => navigateToDetails(item)}
      android_ripple={{ color: '#ccc' }}
      hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
      accessible={true}
      accessibilityLabel={`Filme ${item.title}`}
    >
      <Image
        source={{ uri: item.image }}
        style={styles.searchImage}
      />
      <Text style={styles.searchTitle} numberOfLines={2}>
        {item.title}
      </Text>
    </Pressable>
  );

  return (
    <Pressable style={{ flex: 1 }} onPress={Keyboard.dismiss}>
      <View style={styles.container}>
        {/* Barra de Pesquisa */}
        <View style={styles.searchContainer}>
          <TextInput
            style={styles.searchInput}
            placeholder="Pesquisar filmes..."
            value={searchQuery}
            onChangeText={(text) => setSearchQuery(text)}
            returnKeyType="search"
          />
        </View>

        {/* Mostrar resultados da pesquisa se houver consulta */}
        {searchQuery.trim() !== "" ? (
          <View style={styles.searchResultsContainer}>
            {searchLoading ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#4F46E5" />
                <Text style={styles.loadingText}>Buscando...</Text>
              </View>
            ) : searchError ? (
              <View style={styles.errorContainer}>
                <Text style={styles.errorText}>{searchError}</Text>
              </View>
            ) : searchResults.length > 0 ? (
              <FlatList
                data={searchResults}
                renderItem={renderSearchItem}
                keyExtractor={(item) => item.id.toString()}
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.searchList}
              />
            ) : (
              <View style={styles.noResultsContainer}>
                <Text style={styles.noResultsText}>Nenhum resultado encontrado.</Text>
              </View>
            )}
          </View>
        ) : (
          loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#4F46E5" />
              <Text style={styles.loadingText}>Carregando...</Text>
            </View>
          ) : error ? (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>{error}</Text>
            </View>
          ) : (
            <FlatList
              data={categories}
              keyExtractor={(item) => item.name}
              renderItem={({ item }) => (
                <View style={styles.categoryContainer}>
                  <Text style={styles.categoryTitle}>{item.name}</Text>
                  <FlatList
                    data={item.movies}
                    keyExtractor={(movie) => movie.id.toString()}
                    renderItem={renderSearchItem}
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.searchList}
                  />
                </View>
              )}
            />
          )
        )}
      </View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  searchContainer: {
    padding: 16,
    backgroundColor: "#fff",
  },
  searchInput: {
    height: 40,
    borderColor: "#4F46E5",
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 10,
  },
  searchResultsContainer: {
    flex: 1,
    paddingVertical: 16,
  },
  searchList: {
    paddingLeft: 16,
  },
  searchItem: {
    marginRight: 16,
    width: 160,
    alignItems: "center",
    paddingVertical: 10,
  },
  pressedItem: {
    opacity: 0.7,
  },
  searchImage: {
    width: 160,
    height: 240,
    borderRadius: 8,
    marginBottom: 8,
    backgroundColor: "#ccc",
  },
  searchTitle: {
    fontSize: 16,
    textAlign: "center",
    color: "#555",
  },
  categoryContainer: {
    marginBottom: 24,
  },
  categoryTitle: {
    fontSize: 24,
    fontWeight: "bold",
    paddingHorizontal: 16,
    marginBottom: 8,
    color: "#333",
  },
  movieItem: {
    marginLeft: 16,
    width: 160,
    alignItems: "center",
    paddingVertical: 10,
  },
  movieImage: {
    width: 160,
    height: 240,
    borderRadius: 8,
    marginBottom: 8,
    backgroundColor: "#ccc",
  },
  movieTitle: {
    fontSize: 16,
    textAlign: "center",
    color: "#555",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
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
  noResultsContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  noResultsText: {
    fontSize: 16,
    color: "#666",
  },
});

export default HomeScreen;
