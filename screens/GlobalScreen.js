import React, { useEffect, useState } from "react";
import styled from "styled-components/native";
import { Alert, Button, FlatList, StyleSheet, Text, View } from "react-native";
import * as Location from "expo-location";
import * as Permissions from "expo-permissions";
import { TouchableOpacity } from "react-native-gesture-handler";
import { countryCodeEmoji } from "country-code-emoji";
import Colors from "../constants/Colors";
import { AntDesign } from "@expo/vector-icons";
const Container = styled.View`
  flex: 1;
  justify-content: center;
  align-items: center;
`;

const SimpleText = styled.Text``;

const GlobalScreen = (props) => {
  const [countriesData, setCountresData] = useState();
  const [currentCountry, setCurrentCountry] = useState();
  const [location, setLocation] = useState();

  const fetchData = async () => {
    const response = await fetch(
      "http://api.coronatracker.com/v3/stats/worldometer/country"
    );

    if (!response.ok) {
      const message = `An error has occured: ${response.status}`;
      if (response.status !== "429") {
        throw new Error(message);
      }
    }

    const resData = await response.json();
    const filteredResData = await resData.filter((c) => !!c.countryCode);
    setCountresData(filteredResData);
  };

  useEffect(() => {
    fetchData().catch((err) => console.log(err));
  }, [fetchData]);

  const getLocation = async () => {
    let { status } = await Location.requestPermissionsAsync(
      Permissions.LOCATION
    );
    if (status !== "granted") {
      Alert.alert("Location permissions required");
      return;
    }

    let location = await Location.getCurrentPositionAsync({});

    const latAndLong = {
      latitude: Number(location.coords.latitude),
      longitude: Number(location.coords.longitude),
    };
    let currCountry = await Location.reverseGeocodeAsync(latAndLong).then(
      (res) => {
        console.log(res[0].isoCountryCode);
        setCurrentCountry(res[0].country);
      }
    );

    setLocation(JSON.stringify(location, null, 2));
  };

  useEffect(() => {
    getLocation();
  }, []);

  return (
    <Container>
      <FlatList
        style={{ width: "100%" }}
        data={countriesData}
        keyExtractor={(itemData) => itemData.country}
        renderItem={(itemData) => {
          const flagImg = countryCodeEmoji(itemData.item.countryCode);
          const numberWithCommas = (num) =>
            num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
          return (
            <View
              style={{
                paddingVertical: 9,
                paddingHorizontal: 10,
                marginHorizontal: 5,
                marginVertical: 3.5,
                flexDirection: "row",
                justifyContent: "space-between",
                backgroundColor: "#fff",
                borderRadius: 9,
              }}
            >
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <Text style={{ fontSize: 10, marginRight: 4 }}>
                  {itemData.index + 1}
                </Text>
                <Text style={{ fontSize: 16, marginRight: 8 }}>{flagImg}</Text>
                <Text style={{ fontSize: 16, fontFamily: "open-sans" }}>
                  {itemData.item.country}
                </Text>
              </View>
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                {itemData.item.dailyDeaths !== 0 && (
                  <View
                    style={{
                      backgroundColor: Colors.red,
                      padding: 3,
                      marginRight: 7,
                      borderRadius: 5,
                      flexDirection: "row",
                      alignItems: "center",
                      paddingRight: 6,
                    }}
                  >
                    <AntDesign name="arrowup" size={12} color="#fff" />
                    <Text
                      style={{
                        fontSize: 12,
                        fontFamily: "open-sans-bold",
                        color: "#fff",
                      }}
                    >
                      {numberWithCommas(itemData.item.dailyDeaths)}
                    </Text>
                  </View>
                )}

                <Text
                  style={{
                    fontSize: 14,
                    fontFamily: "open-sans-bold",
                    color: Colors.red,
                  }}
                >
                  {numberWithCommas(itemData.item.totalConfirmed)}
                </Text>
              </View>
            </View>
          );
        }}
      />
      <TouchableOpacity
        style={{
          backgroundColor: "lightblue",
          paddingHorizontal: 10,
          paddingVertical: 5,
        }}
        onPress={() =>
          props.navigation.push("MyCountry", { myCountry: currentCountry })
        }
      >
        <Text>My Country</Text>
      </TouchableOpacity>
    </Container>
  );
};

export default GlobalScreen;