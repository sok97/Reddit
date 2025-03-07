import { Tabs } from "expo-router";
import {AntDesign,Feather,Ionicons} from "@expo/vector-icons";
import { useAuth } from "@clerk/clerk-expo";

export default function TabLayout() {
  const {signOut} = useAuth()
  return (
  
    <Tabs screenOptions={{tabBarActiveTintColor:'orange',tabBarInactiveTintColor:'gray',
      headerRight:()=> <Feather name="log-out"size={20}color="black" style={{paddingRight:10}}
      onPress={()=>signOut()}
     
      />,

    }} >
       <Tabs.Screen name="index" options={{title:"Home",headerTitle:"Reddit",headerTintColor:"#FF5700",
        tabBarIcon:({color,size})=> <AntDesign name="home" size={20} color={'color'} />
       }} />
        <Tabs.Screen name="communities" options={{title:"Communities",
        tabBarIcon:({color,size})=> <AntDesign name="team" size={20} color={'color'} />
       }} />
        
         <Tabs.Screen name="create" options={{title:"Create",
        tabBarIcon:({color,size})=> <AntDesign name="plus" size={20} color={'color'} />
       }} />
        <Tabs.Screen name="chat" options={{title:"Chat",
        tabBarIcon:({color,size})=> <Ionicons name="chatbubble-ellipses-outline" size={20} color={'color'} />
       }} />
        
         <Tabs.Screen name="inbox" options={{title:"Inbox",
        tabBarIcon:({color,size})=> <Feather name="bell" size={20} color={'color'} />
       }} />
    </Tabs>

  );
}