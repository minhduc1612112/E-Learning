import * as React from 'react';
import 'react-native-gesture-handler';
import { AsyncStorage, StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createCollapsibleStack } from 'react-navigation-collapsible';
import { Ionicons } from '@expo/vector-icons';

import Introduction from './src/components/Introduction/Introduction';
import Login from './src/components/Authentication/Login/Login';
import Register from './src/components/Authentication/Register/Register';
import ForgetPassword from './src/components/Authentication/ForgetPassword/ForgetPassword';
import VerifyPassword from './src/components/Authentication/ForgetPassword/VerifyPassword';
import Home from './src/components/Main/Home/Home';
import Search from './src/components/Main/Search/Search';
import MyCourses from './src/components/Main/MyCourses/MyCourses';
import Wishlist from './src/components/Main/Wishlist/Wishlist';
import Account from './src/components/Main/Account/Account'
import ListCourses from './src/components/Courses/ListCourses/ListCourses';

const AuthContext = React.createContext();
const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

const stackOptions = {
  headerStyle: {
    backgroundColor: '#f4511e',
  },
  headerTintColor: 'white',
  headerTitleStyle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
}

const HomeStack = (props) => {
  let title = '';
  if (props.route.state) {
    if (props.route.state.routes.length > 1) {
      title = props.route.state.routes[1].params.title
    }
  }
  return <Stack.Navigator>
    <Stack.Screen name='Home' component={Home} options={{headerShown: false}}></Stack.Screen>
    <Stack.Screen name="ListCourses" component={ListCourses} options={{title: title, ...stackOptions}}></Stack.Screen>
  </Stack.Navigator>
}

const SearchStack = () => {
  return <Stack.Navigator>
    <Stack.Screen name='Search' component={Search} options={stackOptions}></Stack.Screen>
  </Stack.Navigator>
}

const MyCoursesStack = () => {
  return <Stack.Navigator>
    <Stack.Screen name='MyCourses' component={MyCourses} options={{title: 'All courses', ...stackOptions}}></Stack.Screen>
  </Stack.Navigator>
}

const WishlistStack = () => {
  return <Stack.Navigator>
    <Stack.Screen name='Wishlist' component={Wishlist} options={stackOptions}></Stack.Screen>
  </Stack.Navigator>
}

const AccountStack = () => {
  return <Stack.Navigator>
    <Stack.Screen name='Account' component={Account} options={stackOptions}></Stack.Screen>
  </Stack.Navigator>
}

const MainTab = (props) => {
  return <Tab.Navigator
    screenOptions={({ route }) => ({
      tabBarIcon: ({ focused, color, size }) => {
        let iconName;

        if (route.name === 'HomeStack') {
          iconName = focused ? 'md-home' : 'ios-home';
        } else if (route.name === 'SearchStack') {
          iconName = focused ? 'md-search' : 'ios-search';
        } else if (route.name === 'MyCoursesStack') {
          iconName = focused ? 'md-list' : 'ios-list';
        } else if (route.name === 'WishlistStack') {
          iconName = focused ? 'md-heart' : 'ios-heart';
        } else if (route.name === 'AccountStack') {
          iconName = focused ? 'md-person' : 'ios-person';
        }

        // You can return any component that you like here!
        return <Ionicons name={iconName} size={size} color={color} />;
      },
    })}
    tabBarOptions={{
      activeTintColor: 'tomato',
      inactiveTintColor: 'white',
      labelStyle: {
        fontSize: 12,
        fontWeight: 'bold'
      },
      style: {
        backgroundColor: 'darkslategrey'
      }
    }}>
    <Tab.Screen name="HomeStack" component={HomeStack} options={{title: 'Home'}}></Tab.Screen>
    <Tab.Screen name="SearchStack" component={SearchStack} options={{title: 'Search'}}></Tab.Screen>
    <Tab.Screen name="MyCoursesStack" component={MyCoursesStack} options={{title: 'My courses'}}></Tab.Screen>
    <Tab.Screen name="WishlistStack" component={WishlistStack} options={{title: 'Wishlist'}}></Tab.Screen>
    <Tab.Screen name="AccountStack" component={AccountStack} options={{title: 'Account'}}></Tab.Screen>
  </Tab.Navigator>
}

const AnonymousStack = (props) => {
  const HandleLoginButton = () => {
    props.navigation.navigate('Login');
  }
  return <Stack.Navigator initialRouteName='Introduction'>
    <Stack.Screen name='Introduction' component={Introduction} initialParams={{authContext: AuthContext}} options={{title: 'Introduction', headerShown: false}}></Stack.Screen>
    <Stack.Screen name='Login' component={Login} initialParams={{authContext: AuthContext}} options={{title: 'Login', headerShown: false}}></Stack.Screen>
    <Stack.Screen name='Register' component={Register} options={{title: 'Register', headerShown: false}}></Stack.Screen>
    <Stack.Screen name='ForgetPassword' component={ForgetPassword} options={{title: 'Forget password', headerShown: false}}></Stack.Screen>
    <Stack.Screen name='VerifyPassword' component={VerifyPassword} options={{title: 'Verify password', headerShown: false}}></Stack.Screen>
    {createCollapsibleStack(
      <Stack.Screen name='Home' component={Home}
        options={{headerTitle:'',
                  headerLeft: ()=>(<Text></Text>),
                  headerRight: ()=>(
                    <TouchableOpacity onPress={HandleLoginButton}>
                      <Text style={{fontSize: 20, fontWeight: 'bold', color: 'white', paddingRight: 20}}>SIGN IN</Text>
                    </TouchableOpacity>
                  )
                }}
      ></Stack.Screen>
    )}
  </Stack.Navigator>
}

export default function App() {
  const [state, dispatch] = React.useReducer(
    (prevState, action) => {
      switch (action.type) {
        case 'RESTORE_TOKEN':
          return {
            ...prevState,
            userToken: action.token,
              isLoading: false,
          };
        case 'SIGN_IN':
          return {
            ...prevState,
            isSignout: false,
              userToken: action.token,
          };
        case 'SIGN_OUT':
          return {
            ...prevState,
            isSignout: true,
              userToken: null,
          };
      }
    }, {
      isLoading: true,
      isSignout: false,
      userToken: null,
    }
  );

  React.useEffect(() => {
    // Fetch the token from storage then navigate to our appropriate place
    const bootstrapAsync = async () => {
      let userToken;

      try {
        userToken = await AsyncStorage.getItem('userToken');
      } catch (e) {
        // Restoring token failed
      }

      // After restoring token, we may need to validate it in production apps

      // This will switch to the App screen or Auth screen and this loading
      // screen will be unmounted and thrown away.
      dispatch({
        type: 'RESTORE_TOKEN',
        token: userToken
      });
    };

    bootstrapAsync();
  }, []);

  const authContext = React.useMemo(
    () => ({
      signIn: async data => {
        // In a production app, we need to send some data (usually username, password) to server and get a token
        // We will also need to handle errors if sign in failed
        // After getting token, we need to persist the token using `AsyncStorage`
        // In the example, we'll use a dummy token

        dispatch({
          type: 'SIGN_IN',
          token: 'dummy-auth-token'
        });
      },
      signOut: () => dispatch({
        type: 'SIGN_OUT'
      }),
      signUp: async data => {
        // In a production app, we need to send user data to server and get a token
        // We will also need to handle errors if sign up failed
        // After getting token, we need to persist the token using `AsyncStorage`
        // In the example, we'll use a dummy token

        dispatch({
          type: 'SIGN_IN',
          token: 'dummy-auth-token'
        });
      },
    }),
    []
  );

  return (
    <AuthContext.Provider value={authContext}>
      <NavigationContainer>
        <Stack.Navigator>
          {/* {state.userToken == null ? (
            <Stack.Screen name='Anonymous stack' component={AnonymousStack} options={{headerShown: false}}></Stack.Screen>
          ) : (
            <Stack.Screen name='Identified stack' component={MainTab} options={{headerShown: false}}></Stack.Screen>
          )} */}
          <Stack.Screen name='MainTab' component={MainTab} options={{headerShown: false}}></Stack.Screen>
        </Stack.Navigator>
      </NavigationContainer>
    </AuthContext.Provider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
});