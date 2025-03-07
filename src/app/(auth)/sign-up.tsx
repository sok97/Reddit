import * as React from 'react';
import { Text, TextInput, Button, View, KeyboardAvoidingView, Platform, StyleSheet, TouchableOpacity } from 'react-native';
import { useSignUp, useAuth } from '@clerk/clerk-expo';
import { useRouter, Link } from 'expo-router';

export default function SignUpScreen() {
  const { isLoaded, signUp, setActive } = useSignUp();
  const { getToken, signOut, isSignedIn } = useAuth();
  const router = useRouter();

  const [emailAddress, setEmailAddress] = React.useState<string>('');
  const [username, setUsername] = React.useState<string>('');
  const [password, setPassword] = React.useState<string>('');
  const [pendingVerification, setPendingVerification] = React.useState<boolean>(false);
  const [code, setCode] = React.useState<string>('');
  const [loading, setLoading] = React.useState<boolean>(false);
  const [error, setError] = React.useState<string>('');

  // Debug username state updates
  React.useEffect(() => {
    console.log('Username state:', username);
  }, [username]);

  const onSignUpPress = async () => {
    if (!isLoaded) return;

    // Basic validation
    if (!emailAddress || !password || !username) {
      setError('Please fill in all fields');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const payload = {
        emailAddress,
        username, // Removed `u/` prefix to avoid potential validation issues
        password,
      };
      console.log('SignUp payload:', payload);
      await signUp.create(payload);

      await signUp.prepareEmailAddressVerification({ strategy: 'email_code' });
      setPendingVerification(true);
    } catch (err: any) {
      console.error('SignUp error:', err);
      if (err.errors) {
        err.errors.forEach((error: any) => {
          console.error('Error code:', error.code, 'Message:', error.message);
        });
      }
      setError('Failed to sign up. Please check your details.');
    } finally {
      setLoading(false);
    }
  };

  const onVerifyPress = async () => {
    if (!isLoaded) return;

    setLoading(true);
    setError('');

    try {
      const signUpAttempt = await signUp.attemptEmailAddressVerification({ code });
      if (signUpAttempt.status === 'complete') {
        await setActive({ session: signUpAttempt.createdSessionId });
        router.replace('/');
      } else {
        console.error(JSON.stringify(signUpAttempt, null, 2));
        setError('Verification failed. Please try again.');
      }
    } catch (err: any) {
      console.error('Verification error:', err);
      setError('An error occurred during verification.');
    } finally {
      setLoading(false);
    }
  };

  const onDeleteAccountPress = async () => {
    if (!isSignedIn) {
      setError('You must be signed in to delete your account');
      return;
    }

    const confirmed = confirm('Are you sure you want to delete your account? This action cannot be undone.');
    if (!confirmed) return;

    setLoading(true);
    setError('');

    try {
      const token = await getToken();
      const response = await fetch('http://localhost:3000/delete-account', {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      const result = await response.json();
      if (response.ok) {
        await signOut();
        setError('');
        alert('Account deleted successfully');
        router.replace('/signIn');
      } else {
        setError(result.error || 'Failed to delete account');
      }
    } catch (err) {
      console.error(err);
      setError('An error occurred while deleting your account');
    } finally {
      setLoading(false);
    }
  };

  if (pendingVerification) {
    return (
      <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <Text style={styles.title}>Verify Your Email</Text>
        {error ? <Text style={styles.errorText}>{error}</Text> : null}
        <TextInput
          style={styles.input}
          value={code}
          placeholder="Enter your verification code"
          placeholderTextColor="#aaa"
          onChangeText={setCode}
          editable={!loading}
        />
        <Button title="Verify" onPress={onVerifyPress} disabled={loading} />
      </KeyboardAvoidingView>
    );
  }

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <Text style={styles.title}>Sign Up</Text>
      {error ? <Text style={styles.errorText}>{error}</Text> : null}
      <TextInput
        style={styles.input}
        autoCapitalize="none"
        value={emailAddress}
        placeholder="Enter email"
        placeholderTextColor="#aaa"
        onChangeText={setEmailAddress}
        editable={!loading}
      />
      <TextInput
        style={styles.input}
        autoCapitalize="none"
        value={username}
        placeholder="Username"
        placeholderTextColor="#aaa"
        onChangeText={setUsername}
        editable={!loading}
      />
      <TextInput
        style={styles.input}
        value={password}
        placeholder="Enter password"
        placeholderTextColor="#aaa"
        secureTextEntry
        onChangeText={setPassword}
        editable={!loading}
      />
      <Button title="Continue" onPress={onSignUpPress} disabled={loading} />
      {isSignedIn && (
        <Button
          title={loading ? "Deleting..." : "Delete Account"}
          onPress={onDeleteAccountPress}
          disabled={loading}
          color="red"
        />
      )}
      <View style={styles.signInContainer}>
        <Text style={styles.text}>Already have an account?</Text>
        <Link href="/sign-in" asChild>
          <TouchableOpacity>
            <Text style={styles.signInText}> Sign in</Text>
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
  signInContainer: {
    flexDirection: "row",
    marginTop: 15,
  },
  text: {
    fontSize: 16,
    color: "grey",
  },
  signInText: {
    fontSize: 16,
    color: "#007bff",
    fontWeight: "bold",
  },
  errorText: {
    color: "red",
    marginBottom: 15,
    fontSize: 16,
  },
});