import React, { useEffect, useState } from "react";
import { View, Text, Image } from "react-native";
import { getNotifications } from "../../services/notificationService.jsx";

const Notification = ({ user_id }) => {

  const [count, setCount] = useState(0);

  useEffect(() => {
    getNotifications().then(n =>
      setCount(n.filter(x => !x.is_read).length)
    );
  }, []);

  return (
    <View style={{ flexDirection: "row", alignItems: "center" }}>

      <Image
        source={require("../../images/notifications.png")}
        style={{ width: 24, height: 24 }}
      />

      {count > 0 && (
        <View style={{
          backgroundColor: "red",
          borderRadius: 10,
          paddingHorizontal: 5,
          marginLeft: 5
        }}>
          <Text style={{ color: "#fff" }}>{count}</Text>
        </View>
      )}

    </View>
  );
};

export default Notification;