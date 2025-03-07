import { useSignIn } from '@clerk/clerk-expo'
import { Link, useRouter } from 'expo-router'
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Button, KeyboardAvoidingView, Platform } from "react-native";
import React from 'react'

export default function Page() {
  const { signIn, setActive, isLoaded } = useSignIn()
  const router = useRouter()

  const [emailAddress, setEmailAddress] = React.useState<string>('')
  const [password, setPassword] = React.useState<string>('')
  const [loading, setLoading] = React.useState<boolean>(false) // Add loading state
  const [error, setError] = React.useState<string>('') // Add error state for user feedback

  const onSignInPress = React.useCallback(async () => {
    if (!isLoaded) return

    // Basic validation
    if (!emailAddress || !password) {
      setError('Please fill in all fields')
      return
    }

    setLoading(true) // Set loading to true
    setError('') // Clear previous errors

    try {
      const signInAttempt = await signIn.create({
        identifier: emailAddress,
        password,
      })

      if (signInAttempt.status === 'complete') {
        await setActive({ session: signInAttempt.createdSessionId })
        router.replace('/')
      } else {
        console.error(JSON.stringify(signInAttempt, null, 2))
        setError('Sign-in failed. Please check your credentials.')
      }
    } catch (err) {
      console.error(JSON.stringify(err, null, 2))
      setError('An error occurred during sign-in. Please try again.')
    } finally {
      setLoading(false) // Reset loading state
    }
  }, [isLoaded, emailAddress, password])

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <Text style={styles.title}>Sign In</Text>
      {error ? <Text style={styles.errorText}>{error}</Text> : null}
      <TextInput
        style={styles.input}
        autoCapitalize="none"
        value={emailAddress}
        placeholder="Enter email"
        placeholderTextColor="#aaa"
        onChangeText={setEmailAddress}
        editable={!loading} // Disable input while loading
      />
      <TextInput
        style={styles.input}
        value={password}
        placeholder="Enter password"
        placeholderTextColor="#aaa"
        secureTextEntry
        onChangeText={setPassword}
        editable={!loading} // Disable input while loading
      />
      <Button 
        title={loading ? "Signing In..." : "Sign In"} 
        onPress={onSignInPress} 
        disabled={loading} // Disable button while loading
      />
      <View style={styles.signUpContainer}>
        <Text style={styles.text}>Don't have an account?</Text>
        <Link href="/sign-up" asChild>
          <TouchableOpacity>
            <Text style={styles.signUpText}> Sign up</Text>
          </TouchableOpacity>
        </Link>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
    backgroundColor: "#f8f9fa",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
    color: "black",
  },
  input: {
    width: "100%",
    height: 50,
    borderWidth: 1,
    borderColor: "lightgrey",
    borderRadius: 10,
    paddingHorizontal: 10,
    marginBottom: 15,
    backgroundColor: "white",
  },
  signUpContainer: {
    flexDirection: "row",
    marginTop: 15,
  },
  text: {
    fontSize: 16,
    color: "grey",
  },
  signUpText: {
    fontSize: 16,
    color: "#007bff",
    fontWeight: "bold",
  },
  errorText: { // Add style for error messages
    color: "red",
    marginBottom: 15,
    fontSize: 16,
  },
});