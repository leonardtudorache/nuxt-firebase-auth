<template>
  <div>
    <h2>Login</h2>
    <div v-if="currentUser">
      <p>Welcome {{ currentUser.phoneNumber }}</p>
      <button @click="handleLogout">Logout</button>
    </div>
    <div v-else>
      <div v-if="!verificationSent">
        <input v-model="phoneNumber" placeholder="Enter phone number" />
        <button @click="sendVerificationCode">Send Verification Code</button>
        <div id="recaptcha-container"></div>
        <!-- Placeholder for reCAPTCHA -->
      </div>
      <div v-else>
        <input
          v-model="verificationCode"
          placeholder="Enter verification code"
        />
        <button @click="verifyCode">Verify Code</button>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, onMounted } from "vue";
import {
  signInWithPhoneNumber,
  RecaptchaVerifier,
  getAuth,
  signOut,
  onAuthStateChanged,
  User,
} from "firebase/auth";
import { useRouter } from "vue-router";

const phoneNumber = ref("");
const verificationCode = ref("");
const verificationSent = ref(false);
const currentUser = ref<User | null>(null);

let auth;
let recaptchaVerifier;

onMounted(() => {
  auth = useFirebaseAuth();
  recaptchaVerifier = new RecaptchaVerifier(auth, "recaptcha-container", {
    size: "invisible",
    callback: (response: any) => {
      sendVerificationCode();
    },
  });

  onAuthStateChanged(auth, (user) => {
    currentUser.value = user;
  });
});

const handleLogout = async () => {
  const auth = getAuth();
  await signOut(auth);
};

const sendVerificationCode = async () => {
  try {
    if (recaptchaVerifier) {
      const confirmationResult = await signInWithPhoneNumber(
        auth,
        phoneNumber.value,
        recaptchaVerifier
      );
      window.confirmationResult = confirmationResult;
      verificationSent.value = true;
    }
  } catch (error) {
    console.error("Error during signInWithPhoneNumber", error);
    window.recaptchaVerifier.render().then(function (widgetId) {
      grecaptcha.reset(widgetId);
    });
  }
};

const verifyCode = async () => {
  try {
    const confirmationResult = window.confirmationResult;
    await confirmationResult.confirm(verificationCode.value);
  } catch (error) {
    console.error("Error during code verification", error);
  }
};
</script>
