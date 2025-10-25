const store = Vue.reactive({
    isLoginMode: true,
    isAuthenticated: false,
    user: null,
});

// function refreshUserProfile() {
//     axios.get('http://localhost:8080/profile', { withCredentials: true })
//         .then((response) => {
//             const user = response.data.user;
//             store.user = user;
//             store.isAuthenticated = true;
//         })
//         .catch((error) => {
//             console.error('Failed to refresh profile:', error);
//             store.user = null;
//             store.isAuthenticated = false;
//         });
// }