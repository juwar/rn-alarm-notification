import React, {useState, useEffect} from 'react';
import {
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  useColorScheme,
  View,
  Button,
  FlatList,
} from 'react-native';
import ReactNativeAN from 'react-native-alarm-notification';
import {log} from './log';

// const fireDate = ReactNativeAN.parseDate(new Date(Date.now() + 60000)); // set the fire date for 1 second from now
const alarmNotifData = {
  title: 'Alarm',
  message: 'Stand up',
  vibrate: true,
  play_sound: true,
  // schedule_type: 'once',
  schedule_type: 'repeat',
  repeat_interval: 'daily',
  channel: 'wakeup',
  data: {content: 'my notification id is 22'},
  loop_sound: true,
  has_button: true,
};
const dateNow = new Date();

const listTimeAlarm = [
  {
    date: dateNow.setHours(9, 0, 0, 0),
  },
  {
    date: dateNow.setHours(10, 0, 0, 0),
  },
  {
    date: dateNow.setHours(11, 0, 0, 0),
  },
  {
    date: dateNow.setHours(12, 0, 0, 0),
  },
  {
    date: dateNow.setHours(13, 0, 0, 0),
  },
  {
    date: dateNow.setHours(14, 0, 0, 0),
  },
  {
    date: dateNow.setHours(15, 0, 0, 0),
  },
  {
    date: dateNow.setHours(16, 0, 0, 0),
  },
  {
    date: dateNow.setHours(17, 0, 0, 0),
  },
  {
    date: dateNow.setHours(18, 0, 0, 0),
  },
  {
    date: dateNow.setHours(19, 0, 0, 0),
  },
  {
    date: dateNow.setHours(20, 0, 0, 0),
  },
  {
    date: dateNow.setHours(21, 0, 0, 0),
  },
  {
    date: dateNow.setHours(22, 0, 0, 0),
  },
];

const checkPermission = async () => {
  let permissions;
  try {
    permissions = await ReactNativeAN.checkPermissions(res => {
      log('Permission', res);
      permissions = Object.values(res).includes(false) ? false : true;
    });

    if (await !permissions) {
      permissions = await ReactNativeAN.requestPermissions({
        alert: true,
        badge: true,
        sound: true,
      }).then(
        res => {
          log('Permission Success', res);
          return res.alert && res.badge && res.sound;
        },
        res => {
          log('Permission Failed', res);
        },
      );
    }
  } catch {}
  return permissions;
};

const onCreateAlarm = async () => {
  // const fireDate = ReactNativeAN.parseDate(new Date(Date.now() + 60000));
  const now = new Date();
  const create = async date => {
    await ReactNativeAN.scheduleAlarm({
      ...alarmNotifData,
      fire_date: date,
    }).then(res => {
      log('Alarm Created with ID', res); // { id: 1 }
      log('Alarm Created in Date', date); // { id: 1 }
    });
  };
  if (await checkPermission()) {
    let i = 0;
    const day = 86400000;
    while (i < listTimeAlarm.length) {
      (i => {
        let date = ReactNativeAN.parseDate(new Date(listTimeAlarm[i].date));
        let date2 = ReactNativeAN.parseDate(
          new Date(listTimeAlarm[i].date + day),
        );
        setTimeout(() => {
          if (now < new Date(listTimeAlarm[i].date)) {
            create(date);
          } else {
            create(date2);
          }
        }, 1000 * i);
      })(i++);
    }
  }
};

const onListAlarm = async () => {
  const list = await ReactNativeAN.getScheduledAlarms();
  const update = list
    .filter(x => x.day == new Date().getDate())
    .map(l => ({
      date: `Alarm: ${l.day}-${l.month}-${l.year} ${l.hour}:${l.minute}:${l.second}`,
      id: l.id,
    }));

  log('Total', update.length);
  log('List Alarm', update);
  return update;
};

const onListAllAlarm = async () => {
  const list = await ReactNativeAN.getScheduledAlarms();
  const update = list.map(l => ({
    date: `Alarm: ${l.day}-${l.month}-${l.year} ${l.hour}:${l.minute}:${l.second}`,
    id: l.id,
  }));

  log('Total', update.length);
  log('List All Alarm', update);
  return update;
};

const onDeleteAlarm = async () => {
  const listAlarm = await onListAllAlarm();
  listAlarm.map(x => {
    ReactNativeAN.deleteAlarm(parseInt(x.id, 10));
    log('Deleted Alarm with ID', x.id);
  });
  await onListAllAlarm();
};

const Calendar = () => {
  const [listAlarm, setListAlarm] = useState([]);
  const [onUpdate, setOnUpdate] = useState(false);

  useEffect(async () => {
    setListAlarm(await onListAlarm());
  }, []);

  useEffect(async () => {
    setOnUpdate[!onUpdate];
  }, [onUpdate]);

  return (
    <>
      <View style={styles.button}>
        <Button
          color="#ffffff"
          title="Create Alarm"
          onPress={async () => {
            await onCreateAlarm(),
              await setListAlarm(await onListAlarm()),
              setOnUpdate(!onUpdate);
          }}
        />
      </View>
      <View style={styles.button}>
        <Button
          color="#ffffff"
          title="List Alarm Today"
          onPress={async () => {
            setListAlarm(await onListAlarm()), setOnUpdate(!onUpdate);
          }}
        />
      </View>
      <View style={styles.button}>
        <Button
          color="#ffffff"
          title="Lists All Alarm"
          onPress={async () => {
            setListAlarm(await onListAllAlarm()), setOnUpdate(!onUpdate);
          }}
        />
      </View>
      <View style={styles.button}>
        <Button
          color="#ffffff"
          title="Delete All Alarm"
          onPress={async () => {
            await onDeleteAlarm(),
              setListAlarm(await onListAlarm()),
              setOnUpdate(!onUpdate);
          }}
        />
      </View>
      {listAlarm.length > 1 ? (
        <View>
          <SafeAreaView style={styles.container}>
            {listAlarm.length > 1
              ? listAlarm.map(data => (
                  <View style={styles.item} key={data.id}>
                    <Text style={styles.title} key={data.id}>
                      {data.date}
                    </Text>
                  </View>
                ))
              : null}
          </SafeAreaView>
        </View>
      ) : (
        null
      )}
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingVertical: 8,
    backgroundColor: '#5345FE',
    marginTop: 20,
    marginHorizontal: 5,
    borderRadius: 10,
  },
  item: {
    backgroundColor: '#ffffff',
    padding: 5,
    marginVertical: 8,
    marginHorizontal: 16,
    borderRadius: 5,
  },
  title: {
    fontSize: 20,
    color: '#766AFF',
  },
  button: {
    color: '#ffffff',
    backgroundColor: '#00C2B6',
    marginVertical: 5,
    marginHorizontal: 5,
    borderRadius: 10,
  },
});

export default Calendar;
