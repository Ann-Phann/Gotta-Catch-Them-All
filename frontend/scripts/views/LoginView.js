/* ######## CONTENT ########
    UI:
        SIGN IN/ REGISTER FORM
    LOGIC:
        PASSWORD VALIDATION,
        handleSubmit
*/

const LoginView = {
    template: `
        <!-- ===== SIGN IN/ REGISTER FORM ===== -->
        <div class="sign-in">
            <div class="auth-container">

                <h2>{{ isLogin ? 'SIGN IN' : 'REGISTER' }}</h2>

                <button @click="$root.goBack()" class="back-button">← Back</button>

                <div v-if="!registered" class="form-group">
                    <input v-model="form.user_name" type="text" placeholder="Username" />
                </div>

                <div v-if="!registered" class="form-group password-input-group">
                    <input
                        v-model="form.password"
                        :type="showPassword ? 'text' : 'password'"
                        placeholder="Password"
                    />
                    <i
                        :class="showPassword ? 'fas fa-eye-slash' : 'fas fa-eye'"
                        class="toggle-password"
                        @click="showPassword = !showPassword"
                        title="Toggle Password Visibility"
                    ></i>
                </div>

                <div v-if="!isLogin && !registered" class="password-rules">
                    <ul>
                        <li :class="ruleClass(passwordLengthValid)">
                        <i :class="iconClass(passwordLengthValid)"></i>
                        At least 8 characters
                        </li>
                        <li :class="ruleClass(lowercaseValid)">
                        <i :class="iconClass(lowercaseValid)"></i>
                        One lowercase letter
                        </li>
                        <li :class="ruleClass(uppercaseValid)">
                        <i :class="iconClass(uppercaseValid)"></i>
                        One uppercase letter
                        </li>
                        <li :class="ruleClass(numberValid)">
                        <i :class="iconClass(numberValid)"></i>
                        One number
                        </li>
                        <li :class="ruleClass(specialCharValid)">
                        <i :class="iconClass(specialCharValid)"></i>
                        One special character
                        </li>
                    </ul>
                </div>

                <div v-if="!isLogin" class="passwordStrength">
                    <div
                        class="strengthBar"
                        :style="{
                        width: passwordStrengthWidth,
                        backgroundColor: passwordStrengthColor
                        }"
                    ></div>
                    <p>{{ passwordStrengthText }}</p>
                </div>

                <div v-if="!registered">
                    <button
                        class="button"
                        @click="handleSubmit"
                        title="Password must meet all rules"
                    >
                        {{ isLogin ? 'Sign in' : 'Register' }}
                    </button>

                    <div class="toggle" @click="toggleMode">
                        {{ isLogin ? 'Need an account? Register' : 'Have an account? Sign in' }}
                    </div>
                </div>

                <div class="message" v-if="message">
                    <p v-if="!isLogin && registered">
                        Hi {{ form.user_name }}, your account has been created successfully!
                    </p>
                    <p v-else>{{ message }}</p>

                    <p v-if="countdown !== null">Redirecting to Sign-In in {{ countdown }} seconds...</p>

                    <p v-if="!isLogin && registered">
                        <a href="#" @click.prevent="goToLogin">Click here to go to Login now</a>
                    </p>
                </div>
            </div>
        </div>
    `,
    computed: {
        isLogin() {
            return store.isLoginMode;
        },
        passwordLengthValid() {
            return this.form.password.length >= 8;
        },
        lowercaseValid() {
            return /[a-z]/.test(this.form.password);
        },
        uppercaseValid() {
            return /[A-Z]/.test(this.form.password);
        },
        numberValid() {
            return /[0-9]/.test(this.form.password);
        },
        specialCharValid() {
            return /[^A-Za-z0-9]/.test(this.form.password);
        },
        allValid() {
            return (
                this.passwordLengthValid &&
                this.lowercaseValid &&
                this.uppercaseValid &&
                this.numberValid &&
                this.specialCharValid &&
                this.form.user_name.trim() !== ""
            );
        },
        passwordStrengthLevel() {
            let score = 0;
            if (this.passwordLengthValid) score++;
            if (this.uppercaseValid) score++;
            if (this.lowercaseValid) score++;
            if (this.numberValid) score++;
            if (this.specialCharValid) score++;
            return score;
        },
        passwordStrengthText() {
            switch (this.passwordStrengthLevel) {
                case 1:
                    return "Very Weak";
                case 2:
                    return "Weak";
                case 3:
                    return "Moderate";
                case 4:
                    return "Strong";
                case 5:
                    return "Very Strong";
                default:
                    return "Too Short";
            }
        },
        passwordStrengthColor() {
            return [
                "gray",
                "red",
                "orangered",
                "orange",
                "yellowgreen",
                "green",
            ][this.passwordStrengthLevel];
        },
        passwordStrengthWidth() {
            return `${this.passwordStrengthLevel * 20}%`;
        },
    },
    data() {
        return {
            form: {
                user_name: "",
                password: "",
                avatar: ""
            },
            registered: false,
            message: "",
            countdown: null,
            showPassword: false,
            user: null,
            // List of default avatar
            avatars: [
                "http://localhost:8080/images/avatars/eevee.png",
                "http://localhost:8080/images/avatars/jigglypuff.png",
                "http://localhost:8080/images/avatars/meowth.png",
                "http://localhost:8080/images/avatars/pikachu.png",
                "http://localhost:8080/images/avatars/psyduck.png",
            ],
        };
    },
    methods: {
        async handleSubmit() {
            if (!this.allValid && !this.isLogin) {
                this.message = "Please follow all password rules to register.";
                return;
            }

            if (!this.isLogin) {
                const randomIndex = Math.floor(Math.random() * this.avatars.length);
                // Normalize the avatar path to be relative from public folder
                this.form.avatar = this.avatars[randomIndex].replace(/^(\.\.\/)+/, '/');
            }

            const endpoint = this.isLogin
                ? "http://localhost:8080/login"
                : "http://localhost:8080/register";

            try {
                const response = await axios.post(endpoint, this.form, {
                    withCredentials: true,
                });
                this.message = response.data.message || "Success";

                if (this.isLogin) {
                    store.isAuthenticated = true;
                    store.user = response.data.user;
                    this.$root.currentView = "HomeView";
                    console.log('Logged in user avatar:', store.user.avatar);
                    return;
                }




                this.registered = true;
                this.countdown = 5;

                const interval = setInterval(() => {
                    this.countdown--;
                    if (this.countdown === 0) {
                        clearInterval(interval);
                        this.goToLogin();
                    }
                }, 1000);
            } catch (error) {
                console.error("Error:", error);
                this.message =
                    error.response?.data?.error || "Something went wrong";
            }
        },
        toggleMode() {
            store.isLoginMode = !store.isLoginMode;
            this.resetForm();
        },
        goToLogin() {
            store.isLoginMode = true;
            this.resetForm();
        },
        resetForm() {
            this.form.user_name = "";
            this.form.password = "";
            this.message = "";
            this.countdown = null;
            this.registered = false;
            this.showPassword = false;
        },
        ruleClass(valid) {
            return {
                "rule-valid": valid,
                "rule-invalid": !valid,
                "rule-text-valid": valid,
                "rule-text-invalid": !valid,
            };
        },
        iconClass(valid) {
            return valid ? "far fa-check-square" : "far fa-circle-xmark";
        },
    },
};
