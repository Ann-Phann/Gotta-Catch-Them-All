/*eslint-disable*/

const ProfileView = {
  template: `
    <div class="profile">
      <div class="profile-header">
        <div class="left-info">
          <img :src="user?.avatar" class="avatar-img" alt="Avatar" />
          <h3>{{ user?.user_name }}</h3>
          <p v-if="user?.role !== 'admin'"><strong>Points:</strong> {{ user?.current_points }}</p>
        </div>
        <div class="right-actions">
          <button @click="showProfile()">Change Profile</button>
          <button @click="showChangePassword()">Change Password</button>
        </div>
      </div>

      <div class="logout-section">
        <button @click="logout">Log Out</button>
      </div>

      <div v-if="showProfileModal" id="profile-edit-modal">
        <div class="modal-content">
          <span class="close-button" @click="showProfileModal = false">&times;</span>

          <h3>Change Profile</h3>

          <img
            v-if="avatarPreviewUrl"
            :src="avatarPreviewUrl"
            class="avatar-preview"
            alt="New Avatar Preview"
          />
          <img v-if="user?.avatar" :src="user.avatar" class="avatar-preview" />
          <input v-model="form.user_name" type="text" placeholder="New Username" />
          <input type="file" ref="fileInput" @change="onFileChange" accept="image/*" />

          <div v-if="message" :class="['message', messageType]">{{ message }}</div>
          <button @click="uploadImage" :disabled="!profilePic">Upload New Avatar</button>
          <button @click="submitProfileUpdate">Save New Username</button>
        </div>
      </div>

      <div v-if="showPasswordModal" id="password-change-modal">
        <div class="modal-content">
            <span class="close-button" @click="showPasswordModal = false">&times;</span>

            <h3>Change Password</h3>
            <label>Old Password</label>
            <input v-model="form.old_password" type="password"/>

            <label>New Password</label>
            <div class="password-wrapper">
            <input :type="showNewPassword ? 'text' : 'password'" v-model="form.password" />
            <i
                :class="showNewPassword ? 'fas fa-eye-slash' : 'fas fa-eye'"
                class="toggle-password"
                @click="showNewPassword = !showNewPassword"
                title="Toggle Password Visibility"
            ></i>
            </div>

            <label>Confirm Password</label>
            <div class="password-wrapper">
            <input :type="showConfirmPassword ? 'text' : 'password'" v-model="form.confirm_password" />
            <i
                :class="showConfirmPassword ? 'fas fa-eye-slash' : 'fas fa-eye'"
                class="toggle-password"
                @click="showConfirmPassword = !showConfirmPassword"
                title="Toggle Password Visibility"
            ></i>
            </div>

            <div v-if="message" :class="['message', messageType]">{{ message }}</div>

            <button @click="submitPasswordChange">Update Password</button>
        </div>
      </div>
    </div>
  `,

  data() {
    return {
        user: null,
        form: {
            user_name: '',
            old_password: '',
            password: '',
            confirm_password: ''
        },
        profilePic: null,
        showProfileModal: false,
        showPasswordModal: false,
        showNewPassword: false,
        showConfirmPassword: false,
        message: '',
        messageType: '',
        avatarPreviewUrl: null,
    };
  },

  mounted() {
    axios.get('http://localhost:8080/user/account', { withCredentials: true })
      .then((res) => {
        this.user = res.data.user;
        store.user = res.data.user;
      })
      .catch(() => this.user = null);
  },

  methods: {
    showChangePassword() {
      this.showPasswordModal = true;
      this.showProfileModal = false;
      this.message = ''; // Clear message when opening
      this.messageType = ''; // Clear message type
      this.form.old_password = '';
      this.form.password = '';
      this.form.confirm_password = '';
    },

    showProfile() {
      this.showProfileModal = true;
      this.showPasswordModal = false;
      this.message = ''; // Clear message when opening
      this.messageType = ''; // Clear message type

      if (this.user && this.user.user_name) {
          this.form.user_name = this.user.user_name;
      } else {
          this.form.user_name = '';
      }
    },
    onFileChange(event) {
      this.profilePic = event.target.files[0];

      if (this.profilePic) {
        const reader = new FileReader();

        reader.onload = (e) => {
          this.avatarPreviewUrl = e.target.result;
        };

        reader.readAsDataURL(this.profilePic);
      } else {
        this.avatarPreviewUrl = null;
      }


    },

    async uploadImage() {
      this.message = '';
      this.messageType = ''; // Clear message type

      if (!this.profilePic) {
        this.message = 'No image uploaded.';
        this.messageType = 'error';
        return;
      }

      const formData = new FormData();
      formData.append('profilePic', this.profilePic);

      try {
        const response = await fetch('http://localhost:8080/user/upload-profile-picture', {
          method: 'POST',
          body: formData,
          credentials: 'include'
        });

        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`HTTP ${response.status} (${errorText})`);
        }

        const data = await response.json();
        this.message = 'Upload successful.';
        this.messageType = 'success'; // Set to success
        console.log('Saved filename:', data.filename);

        const profileRes = await axios.get('http://localhost:8080/user/account', { withCredentials: true });
        const updatedUser = profileRes.data.user;

        updatedUser.avatar += '?t=' + new Date().getTime();

        this.user = updatedUser;
        store.user = updatedUser;

        this.avatarPreviewUrl = null;
        this.profilePic = null;
      } catch (error) {
        console.error('Upload failed', error);
        this.message = 'Upload failed: ' + error.message;
        this.messageType = 'error';
      }
    },

    async submitProfileUpdate() {
      this.message = '';
      this.messageType = ''; // Clear message type

      if ((this.form.user_name.length > 0) && (this.form.user_name.length < 5)) {
        this.message = 'Your username must be at least 5 characters long.';
        this.messageType = 'error';
        return;
      }

      if (/\s/.test(this.form.user_name)) {
        this.message = 'Your username must not contain whitespace.';
        this.messageType = 'error';
        return;
      }

      try {
        const response = await fetch('http://localhost:8080/user/account', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ user_name: this.form.user_name })
        });

        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`HTTP ${response.status} (${errorText})`);
        }

        const result = await response.json();
        this.message = result.message || 'Profile updated successfully.';
        this.messageType = 'success'; // Set to success
        if (result.user) {
            this.user = result.user;
            store.user = result.user;
        }
        // Consider adding a setTimeout to close the modal after a few seconds
        // setTimeout(() => { this.showProfileModal = false; }, 2000);
        // location.reload(); // You might still want this for full UI refresh, depending on your app's needs
      } catch (e) {
        this.message = 'Profile update failed: ' + e.message;
        this.messageType = 'error'; // Set to error
      }
    },

    async submitPasswordChange() {
      console.log('submitPasswordChange: Method entered');
      this.message = '';
      this.messageType = ''; // Clear message type
      const newPassword = this.form.password;

      console.log('submitPasswordChange: Form values - old_password:', this.form.old_password ? '[SET]' : '[EMPTY]', ', newPassword:', newPassword ? '[SET]' : '[EMPTY]', ', confirm_password:', this.form.confirm_password ? '[SET]' : '[EMPTY]');

      if (!this.form.old_password) {
        this.message = 'You must enter your old password.';
        this.messageType = 'error';
        console.log('submitPasswordChange: Validation failed - Old password missing.');
        return;
      }

      if (!newPassword || newPassword !== this.form.confirm_password) {
        this.message = 'New password and confirm password do not match.';
        this.messageType = 'error';
        console.log('submitPasswordChange: Validation failed - New password mismatch or empty.');
        return;
      }

      // Password complexity checks
      if (newPassword.length < 8) {
        this.message = 'New password must be at least 8 characters long.';
        this.messageType = 'error';
        console.log('submitPasswordChange: Validation failed - Password too short.');
        return;
      }
      if (!/[a-z]/.test(newPassword)) {
        this.message = 'New password must contain at least one lowercase letter.';
        this.messageType = 'error';
        console.log('submitPasswordChange: Validation failed - Missing lowercase.');
        return;
      }
      if (!/[A-Z]/.test(newPassword)) {
        this.message = 'New password must contain at least one uppercase letter.';
        this.messageType = 'error';
        console.log('submitPasswordChange: Validation failed - Missing uppercase.');
        return;
      }
      if (!/[0-9]/.test(newPassword)) {
        this.message = 'New password must contain at least one number.';
        this.messageType = 'error';
        console.log('submitPasswordChange: Validation failed - Missing number.');
        return;
      }
      if (!/[^A-Za-z0-9]/.test(newPassword)) {
        this.message = 'New password must contain at least one special character.';
        this.messageType = 'error';
        console.log('submitPasswordChange: Validation failed - Missing special character.');
        return;
      }
      if (/\s/.test(newPassword)) {
        this.message = 'New password must not contain whitespace.';
        this.messageType = 'error';
        return;
      }

      console.log('submitPasswordChange: All client-side validations passed.');

      try {
        console.log('submitPasswordChange: Attempting to send PUT request to API.');
        const response = await fetch('http://localhost:8080/user/account', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify(this.form)
        });
        console.log('submitPasswordChange: API response received. Status:', response.status);


        if (!response.ok) {
          const errorText = await response.text();
          console.error('submitPasswordChange: API error response:', errorText);
          throw new Error(`HTTP ${response.status} (${errorText})`);
        }

        console.log('submitPasswordChange: Password change successful.');
        this.message = 'Password successfully updated.';
        this.messageType = 'success'; // Set to success
        // Clear password fields after successful update
        this.form.old_password = '';
        this.form.password = '';
        this.form.confirm_password = '';
        // Consider adding a setTimeout to close the modal after a few seconds
        // setTimeout(() => { this.showPasswordModal = false; }, 2000);
      } catch (e) {
        console.error('submitPasswordChange: Catch block - Error during password change:', e);
        this.message = 'Password change failed: ' + e.message;
        this.messageType = 'error'; // Set to error
      }
      console.log('submitPasswordChange: Method exited.');
    },

    async logout() {
      try {
        await axios.post('http://localhost:8080/logout', {}, { withCredentials: true });
        store.isAuthenticated = false;
        this.$root.currentView = 'HomeView';
      } catch (err) {
        alert('Logout failed');
      }
    }
  }
};