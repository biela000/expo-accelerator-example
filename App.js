import React, { useState, useEffect, useRef } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Accelerometer } from 'expo-sensors';

export default function App() {
  const [{ x, y, z }, setData] = useState({
    x: 0,
    y: 0,
    z: 0,
  });
  const [subscription, setSubscription] = useState(null);
  const ws = useRef(new WebSocket('ws://192.168.1.170:4444')).current;

  const _slow = () => Accelerometer.setUpdateInterval(1000);
  const _fast = () => Accelerometer.setUpdateInterval(500);

  const _subscribe = () => {
    setSubscription(
        Accelerometer.addListener(setData)
    );
  };

  const _unsubscribe = () => {
    subscription && subscription.remove();
    setSubscription(null);
  };

  useEffect(() => {
    _subscribe();
    return () => _unsubscribe();
  }, []);

  useEffect(() => {
      // Send a message through the socket
      if (ws.readyState === ws.OPEN) {
          ws.send(JSON.stringify({
              type: 'PLAYER_MOVE',
              payload: {
                  lobbyId: 'test',
                  x,
                  y,
                  z,
              }
          }));
      }
  }, [x, y, z]);

    useEffect(() => {
        ws.onopen = () => {
            ws.send(JSON.stringify({
                type: 'JOIN_LOBBY',
                payload: {
                    lobbyId: 'test',
                    playerName: 'piotrek',
                }
            }));
        }
        ws.onmessage = (message) => {
            const parsedMessage = JSON.parse(message.data);

            switch (parsedMessage.type) {
                case 'ID_ASSIGNED':
                    console.log(parsedMessage.payload.playerId);
                    break;
                default:
                    break;
            }
        }
    }, []);

  return (
      <View style={styles.container}>
        <Text style={styles.text}>Accelerometer: (in gs where 1g = 9.81 m/s^2)</Text>
        <Text style={styles.text}>x: {x}</Text>
        <Text style={styles.text}>y: {y}</Text>
        <Text style={styles.text}>z: {z}</Text>
        <View style={styles.buttonContainer}>
          <TouchableOpacity onPress={subscription ? _unsubscribe : _subscribe} style={styles.button}>
            <Text>{subscription ? 'On' : 'Off'}</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={_slow} style={[styles.button, styles.middleButton]}>
            <Text>Slow</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={_fast} style={styles.button}>
            <Text>Fast</Text>
          </TouchableOpacity>
        </View>
      </View>
  );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
        padding: 15,
    },
    text: {
        textAlign: 'center',
    },
    buttonContainer: {
        flexDirection: 'row',
        alignItems: 'stretch',
        marginTop: 15,
    },
    button: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    middleButton: {
        borderLeftWidth: 1,
        borderRightWidth: 1,
        borderColor: '#ccc',
    }
});