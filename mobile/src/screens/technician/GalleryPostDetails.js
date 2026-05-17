import React, { useRef, useState } from "react";
import {
  View,
  Text,
  Image,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
} from "react-native";
import Header from "../../components/Common/Header";

const screenWidth = Dimensions.get("window").width;

function GalleryPostDetails({ route, navigation }) {
  const { post } = route.params || {};
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const scrollRef = useRef(null);

  if (!post) {
    return (
      <>
        <Header />
        <View style={styles.container}>
          <Text>Post not found.</Text>
        </View>
      </>
    );
  }

  const images = post.images || [];
  const activeImage = images[selectedImageIndex] || images[0];

  const goToImage = (index) => {
    if (!images.length) return;

    let nextIndex = index;

    if (nextIndex < 0) nextIndex = images.length - 1;
    if (nextIndex >= images.length) nextIndex = 0;

    setSelectedImageIndex(nextIndex);

    scrollRef.current?.scrollTo({
      x: nextIndex * (screenWidth - 30),
      animated: true,
    });
  };

  const onScrollEnd = (event) => {
    const x = event.nativeEvent.contentOffset.x;
    const index = Math.round(x / (screenWidth - 30));

    if (index >= 0 && index < images.length) {
      setSelectedImageIndex(index);
    }
  };

  return (
    <>
      <Header />

      <ScrollView contentContainerStyle={styles.container}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>

        <View style={styles.card}>
          <View style={styles.sliderBox}>
            <ScrollView
              ref={scrollRef}
              horizontal
              pagingEnabled
              showsHorizontalScrollIndicator={false}
              onMomentumScrollEnd={onScrollEnd}
            >
              {images.map((img, index) => (
                <Image
                  key={index}
                  source={{ uri: img }}
                  style={styles.mainImage}
                />
              ))}
            </ScrollView>

            {images.length > 1 ? (
              <>
                <TouchableOpacity
                  style={[styles.arrow, styles.leftArrow]}
                  onPress={() => goToImage(selectedImageIndex - 1)}
                >
                  <Text style={styles.arrowText}>‹</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.arrow, styles.rightArrow]}
                  onPress={() => goToImage(selectedImageIndex + 1)}
                >
                  <Text style={styles.arrowText}>›</Text>
                </TouchableOpacity>

                <View style={styles.counter}>
                  <Text style={styles.counterText}>
                    {selectedImageIndex + 1} / {images.length}
                  </Text>
                </View>
              </>
            ) : null}
          </View>

          {images.length > 1 ? (
            <ScrollView horizontal style={styles.thumbs}>
              {images.map((img, index) => (
                <TouchableOpacity
                  key={index}
                  style={[
                    styles.thumbButton,
                    selectedImageIndex === index && styles.activeThumb,
                  ]}
                  onPress={() => goToImage(index)}
                >
                  <Image source={{ uri: img }} style={styles.thumbImage} />
                </TouchableOpacity>
              ))}
            </ScrollView>
          ) : null}

          <View style={styles.textBox}>
            <Text style={styles.title}>Work Details</Text>
            <Text style={styles.description}>{post.description}</Text>
          </View>
        </View>
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 15,
    backgroundColor: "#E8DCCF",
    flexGrow: 1,
  },
  backButton: {
    backgroundColor: "#111",
    borderRadius: 999,
    paddingVertical: 10,
    paddingHorizontal: 18,
    alignSelf: "flex-start",
    marginBottom: 14,
  },
  backText: {
    color: "#FFF",
    fontWeight: "700",
  },
  card: {
    backgroundColor: "#FFF9F3",
    borderRadius: 20,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#D8C8B8",
  },
  sliderBox: {
    position: "relative",
    backgroundColor: "#111",
  },
  mainImage: {
    width: screenWidth - 30,
    height: 360,
    backgroundColor: "#111",
    resizeMode: "contain",
  },
  arrow: {
    position: "absolute",
    top: "43%",
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: "rgba(0,0,0,0.65)",
    alignItems: "center",
    justifyContent: "center",
  },
  leftArrow: {
    left: 12,
  },
  rightArrow: {
    right: 12,
  },
  arrowText: {
    color: "#FFF",
    fontSize: 34,
    lineHeight: 36,
  },
  counter: {
    position: "absolute",
    top: 12,
    right: 12,
    backgroundColor: "rgba(0,0,0,0.65)",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 999,
  },
  counterText: {
    color: "#FFF",
    fontWeight: "700",
    fontSize: 12,
  },
  thumbs: {
    backgroundColor: "#111",
    padding: 10,
  },
  thumbButton: {
    width: 64,
    height: 64,
    borderRadius: 10,
    overflow: "hidden",
    marginRight: 8,
    borderWidth: 2,
    borderColor: "transparent",
  },
  activeThumb: {
    borderColor: "#D6B08C",
  },
  thumbImage: {
    width: "100%",
    height: "100%",
  },
  textBox: {
    padding: 18,
  },
  title: {
    fontSize: 22,
    fontWeight: "800",
    marginBottom: 10,
    color: "#111",
  },
  description: {
    color: "#3A3028",
    lineHeight: 22,
  },
});

export default GalleryPostDetails;