const AdminView = {
  template: `
    <div class="userbase-container">
      <div class="sidebar">
        <div
          class="menu"
          :class="{ active: currentMenu === 'my account' }"
          @click="currentMenu = 'my account'"
        >
          <h2>MY ACCOUNT</h2>
        </div>

        <div
          class="menu"
          :class="{ active: currentMenu === 'userbase' }"
          @click="currentMenu = 'userbase'"
        >
          <h2>USERBASE</h2>
        </div>

        <div
          class="menu"
          :class="{ active: currentMenu === 'games' }"
          @click="currentMenu = 'games'"
        >
          <h2>GAMES</h2>
        </div>
      </div>

      <div class="content">
        <div v-if="currentMenu === 'userbase'">
          <div class="search-filter">
            <input v-model="search" class="search-input" placeholder="Search users" />

            <div class="actions-inline">
              <div class="addUsers">
                <button v-if="!showAddFields" @click="showAddFields = true" class="addUser-btn">Add User</button>

                <div v-if="showAddFields" class="add-user-form">
                  <input v-model="newUsername" placeholder="New username" />
                  <input v-model="newPassword" placeholder="New password" />
                  <input v-model="newAvatar" placeholder="New avatar" />
                  <button
                    class="save-btn"
                    @click="confirmAddUser"
                    :disabled="!newUsername.trim() || !newPassword.trim() || !newAvatar.trim()"
                  >
                    Save
                  </button>
                  <button class="cancel-btn" @click="cancelAddUser">Cancel</button>
                </div>
              </div>

              <button class="edit-btn" @click="editUsers">Edit Users</button>
              <button class="delete-btn" @click="deleteSelectedUsers">Delete</button>
            </div>
          </div>

          <table class="user-table">
            <thead>
              <tr>
                <th></th>
                <th>ID</th>
                <th>USERNAME</th>
                <th>CURRENT POINTS</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="user in filteredUsers" :key="user.id">
                <td><input type="checkbox" v-model="user.selected" /></td>
                <td>{{ user.id }}</td>
                <td>
                  <template v-if="user.selected && isEditing">
                    <input v-model="user.updatedUsername" placeholder="Edit username" />
                  </template>
                  <template v-else>
                    {{ user.username }}
                  </template>
                </td>
                <td>
                  <template v-if="user.selected && isEditing">
                    <input v-model="user.updatedCurrentPoints" type="number" placeholder="Edit current points" />
                  </template>
                  <template v-else>
                    {{ user.current_points }}
                  </template>
                </td>
              </tr>
            </tbody>
          </table>

          <div class="actions">
            <div class="bottom-actions">
              <button @click="goBack">GO BACK</button>
              <button @click="saveChanges">SAVE CHANGES</button>
            </div>
          </div>

        </div>

        <div v-else-if="currentMenu === 'games'">
          <h3>GAMES</h3>
          <p>You can add game-related functionality here.</p>
        </div>

        <div v-else-if="currentMenu === 'my account'">
          <section class="account-section">
            <h2>Account Details</h2>

            <div class="account-info">
              <img src="https://www.example.com/imageofmyself.png" alt="Profile Picture" class="profile-img" />

              <div class="user-fields">
                <div class="form-group">
                  <label>Username</label>
                  <input type="text" value="ilovepikachu #0000" readonly />
                </div>
                <div class="form-group">
                  <label>Email</label>
                  <input type="email" value="########@gmail.com" readonly />
                </div>
                <div class="form-group">
                  <label>Profile Picture URL</label>
                  <input type="url" value="https://www.example.com/imageofmyself.png" readonly />
                </div>
              </div>
            </div>

            <h2>Change Password</h2>
            <form class="password-form">
              <div class="form-group">
                <label>Current Password</label>
                <input type="password" placeholder="********" />
              </div>
              <div class="form-group">
                <label>New Password</label>
                <input type="password" placeholder="********" />
              </div>
              <div class="form-group">
                <label>Confirm Password</label>
                <input type="password" placeholder="********" />
              </div>
              <button type="submit" class="update-btn">Update Password</button>
            </form>
          </section>
        </div>

      </div>
    </div>
  `,
  data() {
    return {
      currentMenu: 'userbase',
      search: '',
      users: [],
      newUsername: '',
      newPassword: '',
      newAvatar: '',
      updatedUsername: '', 
      updatedCurrentPoints: '',
      isEditing: false,
      showAddFields: false
    };
  },

  mounted() {
    this.fetchUsers();
  },

  computed: {
    filteredUsers() {
      const search = this.search.toLowerCase();
      return this.users.filter((user) => user.username.toLowerCase().includes(search));
    }
  },
  methods: {
    async fetchUsers() {
      console.log("AdminView: Fetching users...");
      try {
        const response = await axios.get('http://localhost:8080/admin/list-users');
        this.users = response.data.map((user) => ({
          id: user.user_id,
          username: user.user_name,
          password: user.hash_password,
          avatar: user.avatar,
          current_points: user.current_points,
          selected: false,
          updatedUsername: user.user_name,
          updatedCurrentPoints: user.current_points
        }));
        console.log("AdminView: Users fetched and mapped:", this.users);
      } catch (error) {
        console.error('AdminView: Failed to fetch users:', error);
        alert('Error fetching users from the server.');
      }
    },
    async addUser() {
      if (!this.newUsername.trim()) {
        alert("Please enter a username.");
        return;
      }

      const newUser = {
        user_name: this.newUsername.trim(),
        password: this.newPassword.trim(),
        avatar: this.newAvatar.trim(),
        selected: false
      };

      try {
        await axios.post('http://localhost:8080/admin/add-user', newUser);
        await this.fetchUsers();

        this.newUsername = '';
        this.newPassword = '';
        this.newAvatar = '';
      } catch (error) {
        console.error("AdminView: Failed to add user", error);
        alert("Error adding user to the database.");
      }
    },

    async deleteSelectedUsers() {
      const selectedUsers = this.users.filter((user) => user.selected);

      if (selectedUsers.length === 0) {
        alert("No users selected to delete.");
        return;
      }

      if (!confirm(`Are you sure you want to delete ${selectedUsers.length} user(s)?`)) {
        return;
      }

      for (const user of selectedUsers) {
        try {
          await axios.delete(`http://localhost:8080/admin/delete-user/${user.id}`);
        } catch (error) {
          console.error(`AdminView: Failed to delete user ${user.username}`, error);
        }
      }

      this.users = this.users.filter((user) => !user.selected);
    },
    editUsers() {
      const selectedUsers = this.users.filter((user) => user.selected);

      if (selectedUsers.length === 0) {
        alert("No users selected to edit.");
        return;
      }
      this.isEditing = true;
    },

    async confirmAddUser() {
      if (!this.newUsername.trim() || !this.newPassword.trim() || !this.newAvatar.trim()) {
        alert("Please fill in all fields.");
        return;
      }

      const newUser = {
        user_name: this.newUsername.trim(),
        password: this.newPassword.trim(),
        avatar: this.newAvatar.trim(),
      };

      try {
        await axios.post('http://localhost:8080/admin/add-user', newUser);

        await this.fetchUsers();

        this.newUsername = '';
        this.newPassword = '';
        this.newAvatar = '';
        this.showAddFields = false;

        alert("User successfully added!");

      } catch (error) {
        console.error("AdminView: Failed to add user:", error);
        alert("Error adding user to the database.");
      }
    },

    cancelAddUser() {
      this.newUsername = '';
      this.newPassword = '';
      this.newAvatar = '';
      this.showAddFields = false;
    },

    async saveChanges() {
      const selectedUsers = this.users.filter((user) => user.selected);
      console.log("AdminView: Saving changes for users:", selectedUsers.map(u => u.id));

      try {
        await Promise.all(selectedUsers.map(async (user) => {
          const payload = {
            user_name: user.updatedUsername,
            current_points: user.updatedCurrentPoints
          };
          console.log("AdminView: Sending payload for user", user.id, payload);

          const response = await axios.put(`http://localhost:8080/admin/edit-user/${user.id}`, payload);
          console.log("AdminView: Response from backend for user", user.id, response.data);
        }));

        this.isEditing = false;
        alert(`Successfully updated ${selectedUsers.length} user(s).`);
        await this.fetchUsers();
        console.log("AdminView: Users array after re-fetch:", this.users);

      } catch (error) {
        console.error('AdminView: Failed to update users:', error.response ? error.response.data : error.message);
        alert('An error occurred while updating users.');
      }
    },
    goBack() {
      this.currentMenu = 'my account';
    },

    // filter() {
    //   // Optional filter logic
    // },
  }
};

app.component('AdminView', AdminView);